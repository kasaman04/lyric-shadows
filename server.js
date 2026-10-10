const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const { prepareConversation, generateConversation, finalizeSong, castConversation } = require('./lib/generate');
const { VOICE_PROFILES, VOICE_BY_ID } = require('./lib/voice-catalog');
require('dotenv').config();

const app = express();
// Render terminates HTTPS at its reverse proxy.
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
const PORT = process.env.PORT || 9999;
const SONGS_DIR = path.join(__dirname, 'songs');
const PHRASE_IMAGES_DIR = path.join(__dirname, 'public', 'phrase-images', 'phrases');
const {supabaseBase,headersFor}=require('./lib/pet-cloud');
const SUPABASE_URL = supabaseBase(process.env.SUPABASE_URL);
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_PREFS_TABLE = 'user_phrase_preferences';

(async () => { await fs.ensureDir(SONGS_DIR); })();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders(res, file) {
    if (file.endsWith('.html') || path.basename(file) === 'app.js') res.set('Cache-Control', 'no-store');
  }
}));
app.use('/songs', express.static(SONGS_DIR));
require('./lib/pet-api').mountPetApi(app);
require('./lib/pet-worker-launcher').startLocalWorker();

app.get('/api/voices', (req, res) => {
  res.json(VOICE_PROFILES.map(({ key, name, id, gender, age, accent, tone }) => ({ key, name, id, gender, age, accent, tone })));
});

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function supabaseHeaders(extra = {}) {
  return {
    ...headersFor(SUPABASE_KEY),
    'Content-Type': 'application/json',
    ...extra
  };
}

function cleanIdList(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(
    value
      .filter(id => typeof id === 'string')
      .map(id => id.trim())
      .filter(id => /^[a-z0-9-]+$/i.test(id))
  )).slice(0, 2000);
}

function cleanDeviceId(value) {
  if (typeof value !== 'string') return '';
  const id = value.trim();
  return /^[a-z0-9-]{12,80}$/i.test(id) ? id : '';
}

// GET all songs: scan songs/ directory
app.get('/api/songs', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const entries = await fs.readdir(SONGS_DIR, { withFileTypes: true });
    const songs = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const jsonPath = path.join(SONGS_DIR, entry.name, 'song.json');
      if (await fs.pathExists(jsonPath)) {
        try {
          const songObj = await fs.readJson(jsonPath);
          songObj.hasLocalAudio = await fs.pathExists(path.join(SONGS_DIR, entry.name, 'original.mp3'));
          const timingPath = path.join(SONGS_DIR, entry.name, 'lyric-timings.json');
          if (songObj.hasLocalAudio && await fs.pathExists(timingPath)) {
            const timingData = await fs.readJson(timingPath);
            songObj.lyricTimings = Array.isArray(timingData) ? timingData : timingData.rows;
            songObj.lyricTimingStatus = timingData.status || 'timed';
            if (timingData.display) songObj.lyricDisplay = timingData.display;
          }
          songs.push(songObj);
        } catch {}
      }
    }
    songs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(songs);
  } catch { res.json([]); }
});

app.get('/api/phrase-images', async (req, res) => {
  try {
    const files = await fs.pathExists(PHRASE_IMAGES_DIR)
      ? await fs.readdir(PHRASE_IMAGES_DIR)
      : [];
    const images = {};
    const allowed = new Set(['.webp', '.png', '.jpg', '.jpeg']);

    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (!allowed.has(ext)) return;
      const id = path.basename(file, ext);
      if (!/^[a-z0-9-]+$/i.test(id)) return;
      if (!images[id] || ext === '.webp') {
        images[id] = `/phrase-images/phrases/${file}`;
      }
    });

    res.json(images);
  } catch {
    res.json({});
  }
});

app.get('/api/phrase-preferences/:deviceId', async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.json({ enabled: false, found: false, savedPhraseIds: [], hiddenPhraseIds: [] });
  }

  const deviceId = cleanDeviceId(req.params.deviceId);
  if (!deviceId) return res.status(400).json({ error: 'Invalid device id' });

  try {
    const url = `${SUPABASE_URL}/rest/v1/${SUPABASE_PREFS_TABLE}`;
    const response = await axios.get(url, {
      headers: supabaseHeaders(),
      params: {
        device_id: `eq.${deviceId}`,
        select: 'saved_phrase_ids,hidden_phrase_ids'
      },
      timeout: 10000
    });
    const row = Array.isArray(response.data) ? response.data[0] : null;
    res.json({
      enabled: true,
      found: Boolean(row),
      savedPhraseIds: cleanIdList(row?.saved_phrase_ids),
      hiddenPhraseIds: cleanIdList(row?.hidden_phrase_ids)
    });
  } catch (error) {
    res.status(500).json({ error: error.response?.data?.message || error.message });
  }
});

app.put('/api/phrase-preferences/:deviceId', async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.json({ enabled: false, saved: false });
  }

  const deviceId = cleanDeviceId(req.params.deviceId);
  if (!deviceId) return res.status(400).json({ error: 'Invalid device id' });

  try {
    const url = `${SUPABASE_URL}/rest/v1/${SUPABASE_PREFS_TABLE}`;
    await axios.post(
      url,
      {
        device_id: deviceId,
        saved_phrase_ids: cleanIdList(req.body.savedPhraseIds),
        hidden_phrase_ids: cleanIdList(req.body.hiddenPhraseIds),
        updated_at: new Date().toISOString()
      },
      {
        headers: supabaseHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
        params: { on_conflict: 'device_id' },
        timeout: 10000
      }
    );
    res.json({ enabled: true, saved: true });
  } catch (error) {
    res.status(500).json({ error: error.response?.data?.message || error.message });
  }
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

app.patch('/api/preview/voices', async (req, res) => {
  try {
    const { speaker, voiceId } = req.body || {};
    if (!['A', 'B'].includes(speaker) || !VOICE_BY_ID.has(voiceId)) {
      return res.status(400).json({ error: 'Invalid speaker or voice' });
    }
    if (!await fs.pathExists(PREVIEW_PATH)) return res.status(404).json({ error: 'No preview found' });
    const preview = await fs.readJson(PREVIEW_PATH);
    const target = speaker === 'A' ? preview.speakerA : preview.speakerB;
    const other = speaker === 'A' ? preview.speakerB : preview.speakerA;
    if (other.voice === voiceId) return res.status(400).json({ error: 'AとBには別の声を選んでください' });
    const profile = VOICE_BY_ID.get(voiceId);
    Object.assign(target, { voice: profile.id, voiceProfile: profile.key, voiceName: profile.name, gender: profile.gender, age: profile.age, accent: profile.accent, tone: profile.tone,
      type: { male: '男性', female: '女性', neutral: '中性' }[profile.gender] });
    await fs.writeJson(PREVIEW_PATH, preview, { spaces: 2 });
    res.json(preview);
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
      lyricConnections: prepared.convData.lyricConnections || [],
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

    const cast = castConversation(convData, `${preview.songName}:${preview.artist}`);
    preview.relationship = convData.relationship;
    preview.setting = convData.setting;
    preview.lyricConnections = convData.lyricConnections || [];
    preview.speakerA = cast.speakerA;
    preview.speakerB = cast.speakerB;
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
      convData: { relationship: preview.relationship, setting: preview.setting, speakerA: preview.speakerA, speakerB: preview.speakerB, conversation: preview.conversation, lyricConnections: preview.lyricConnections || [] },
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
