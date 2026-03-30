const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { prepareConversation, generateConversation, finalizeSong, VOICE_MAP } = require('./lib/generate');
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

const PREVIEW_PATH = path.join(__dirname, 'tmp-preview.json');

// --- PREVIEW API ---
app.get('/api/preview', async (req, res) => {
  try {
    if (await fs.pathExists(PREVIEW_PATH)) res.json(await fs.readJson(PREVIEW_PATH));
    else res.json(null);
  } catch { res.json(null); }
});

app.delete('/api/preview', async (req, res) => {
  try {
    await fs.remove(PREVIEW_PATH);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/preview/stream', async (req, res) => {
  const { songName, artist, videoId, contextHint, relationship, setting } = req.query;
  if (!songName || !artist) return res.status(400).json({ error: 'songName and artist required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    let hint = contextHint || '';
    if (relationship || setting) {
       hint = `Relationship MUST be ${relationship || 'any'}. The setting MUST be: ${setting || 'any'}. ` + hint;
    }
    const overrideYtData = videoId ? { videoId, thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` } : null;
    
    const prepared = await prepareConversation(songName, artist, SONGS_DIR, {
      onStatus: (message) => send({ type: 'progress', message }),
      overrideYtData,
      contextHint: hint || undefined
    });

    await fs.writeJson(PREVIEW_PATH, {
      isNew: true, songName: prepared.songName, artist: prepared.artist, folderName: prepared.folderName,
      lyrics: prepared.lyrics, lyricsJa: prepared.lyricsJa, ytData: prepared.ytData,
      relationship: prepared.convData.relationship, setting: prepared.convData.setting,
      speakerA: prepared.speakerA, speakerB: prepared.speakerB, conversation: prepared.convData.conversation,
    }, { spaces: 2 });

    send({ type: 'done', preview: await fs.readJson(PREVIEW_PATH) });
  } catch (error) { send({ type: 'error', message: error.message }); }
  res.end();
});

app.get('/api/preview/regen-stream', async (req, res) => {
  const { contextHint, relationship, setting } = req.query;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    if (!await fs.pathExists(PREVIEW_PATH)) throw new Error('No preview found to regenerate');
    const preview = await fs.readJson(PREVIEW_PATH);
    
    let hint = contextHint || '';
    if (relationship || setting) {
       hint = `Relationship MUST be ${relationship || 'any'}. The setting MUST be: ${setting || 'any'}. ` + hint;
    }

    const convData = await generateConversation(preview.songName, preview.artist, preview.lyrics, {
      onStatus: (message) => send({ type: 'progress', message }),
      contextHint: hint || undefined
    });

    const getVoice = (type) => VOICE_MAP[type] || VOICE_MAP['男性'];
    preview.relationship = convData.relationship;
    preview.setting = convData.setting;
    preview.speakerA = { name: convData.speakerA.name, type: convData.speakerA.type, voice: getVoice(convData.speakerA.type) };
    preview.speakerB = { name: convData.speakerB.name, type: convData.speakerB.type, voice: getVoice(convData.speakerB.type) };
    preview.conversation = convData.conversation;

    await fs.writeJson(PREVIEW_PATH, preview, { spaces: 2 });
    send({ type: 'done', preview });
  } catch (error) { send({ type: 'error', message: error.message }); }
  res.end();
});

app.get('/api/preview/finalize-stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    if (!await fs.pathExists(PREVIEW_PATH)) throw new Error('No preview found to finalize');
    const preview = await fs.readJson(PREVIEW_PATH);
    const { folderName, isNew } = preview;
    const jsonPath = path.join(SONGS_DIR, folderName, 'song.json');
    
    let originalCreatedAt = null;
    let lyrics = preview.lyrics, lyricsJa = preview.lyricsJa, ytData = preview.ytData;

    if (!isNew) {
      if (await fs.pathExists(jsonPath)) {
        const original = await fs.readJson(jsonPath);
        originalCreatedAt = original.createdAt;
        lyrics = original.lyrics; lyricsJa = original.lyricsJa;
        ytData = { videoId: original.videoId, thumbnailUrl: original.thumbnailUrl };
      }
      const songDir = path.join(SONGS_DIR, folderName);
      if (await fs.pathExists(songDir)) {
        const files = await fs.readdir(songDir);
        for (const f of files) if (f.endsWith('.mp3')) await fs.remove(path.join(songDir, f));
      }
    }

    const prepared = {
      songName: preview.songName, artist: preview.artist, folderName, lyrics, lyricsJa, ytData,
      convData: { relationship: preview.relationship, setting: preview.setting, speakerA: preview.speakerA, speakerB: preview.speakerB, conversation: preview.conversation },
      speakerA: preview.speakerA, speakerB: preview.speakerB,
    };

    const result = await finalizeSong(prepared, SONGS_DIR, {
      onStatus: (message) => send({ type: 'progress', message })
    });

    if (originalCreatedAt) {
      const saved = await fs.readJson(jsonPath);
      saved.createdAt = originalCreatedAt;
      await fs.writeJson(jsonPath, saved, { spaces: 2 });
    }

    await fs.remove(PREVIEW_PATH);
    send({ type: 'done', song: result });
  } catch (error) { send({ type: 'error', message: error.message }); }
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
