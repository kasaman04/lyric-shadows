const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { generateSong } = require('./lib/generate');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9999;
const SONGS_DIR = path.join(__dirname, 'songs');

(async () => { await fs.ensureDir(SONGS_DIR); })();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/songs', express.static(SONGS_DIR));

// GET all songs: scan songs/ directory
app.get('/api/songs', async (req, res) => {
  try {
    const entries = await fs.readdir(SONGS_DIR, { withFileTypes: true });
    const songs = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const jsonPath = path.join(SONGS_DIR, entry.name, 'song.json');
      if (await fs.pathExists(jsonPath)) {
        try { songs.push(await fs.readJson(jsonPath)); } catch {}
      }
    }
    songs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(songs);
  } catch { res.json([]); }
});

// SSE: generate song with progress
app.get('/api/songs/stream', async (req, res) => {
  const { songName, artist } = req.query;
  if (!songName || !artist) return res.status(400).json({ error: 'songName and artist required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const song = await generateSong(songName, artist, SONGS_DIR, {
      onStatus: (message) => send({ type: 'progress', message })
    });
    send({ type: 'done', song });
  } catch (error) {
    console.error('Generation error:', error);
    send({ type: 'error', message: error.message });
  }

  res.end();
});

// DELETE song folder
app.delete('/api/songs/:id', async (req, res) => {
  try {
    const folderName = decodeURIComponent(req.params.id);
    await fs.remove(path.join(SONGS_DIR, folderName));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🎵 Lyric Shadows running at http://localhost:${PORT}`);
});
