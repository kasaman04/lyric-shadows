/**
 * lib/generate.js
 * Shared generation logic: lyrics, conversation (with naturalness check), audio
 */

const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');

require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_KEY_BACKUP = process.env.GEMINI_API_KEY_BACKUP || null;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

// Active key (switches to backup on quota exceeded)
let activeGeminiKey = GEMINI_API_KEY;

const VOICE_MAP = {
  '男性': 'CfDbY7v8tDkTvB9rNcUw',
  '女性': 'cNYrMw9glwJZXR8RwbuR',
  '男２': 'nzFihrBIvB34imQBuxub',
  '少年': '1IKfgBmzdwnmAUPnryb3',
  '少女': 'kIC4kfVqgGXGVwgAx81Z',
};

// ---- Helpers ----

function splitIntoSentences(text) {
  const sentences = [];
  const regex = /[^.!?]+[.!?]+/g;
  let match, lastEnd = 0;
  while ((match = regex.exec(text)) !== null) {
    const s = match[0].trim();
    if (s) sentences.push(s);
    lastEnd = match.index + match[0].length;
  }
  const remaining = text.slice(lastEnd).trim();
  if (remaining) sentences.push(remaining);
  return sentences;
}

// Parse {{phrase}} (red) and [[word]] (blue) markers
function parseLyricMarkers(rawText) {
  // Remove markers for plain text (audio)
  const plainText = rawText
    .replace(/\{\{([^}]+)\}\}/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1');
  // Build HTML with color spans
  const displayHtml = rawText
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\{\{([^}]+)\}\}/g, '<span class="lyric-phrase">$1</span>')
    .replace(/\[\[([^\]]+)\]\]/g, '<span class="lyric-word">$1</span>');
  return { plainText, displayHtml };
}

async function callGemini(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${activeGeminiKey}`;
    try {
      const { data } = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }]
      }, { timeout: 120000 });
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');
      return text;
    } catch (err) {
      const status = err.response?.status;
      const errMsg = err.response?.data?.error?.message || err.message;
      if (status === 429) {
        // Try switching to backup key first
        if (activeGeminiKey === GEMINI_API_KEY && GEMINI_API_KEY_BACKUP) {
          console.log('  🔄 Switching to backup Gemini API key...');
          activeGeminiKey = GEMINI_API_KEY_BACKUP;
          continue;
        }
        // Wait and retry
        if (attempt < retries) {
          const waitMatch = errMsg.match(/retry in ([\d.]+)s/i);
          const waitSec = waitMatch ? Math.ceil(parseFloat(waitMatch[1])) + 5 : 65;
          console.log(`  ⏳ Rate limit. Waiting ${waitSec}s (retry ${attempt}/${retries - 1})...`);
          await new Promise(r => setTimeout(r, waitSec * 1000));
          continue;
        }
      }
      throw new Error(errMsg);
    }
  }
}

// ---- Lyrics ----

async function fetchLyrics(artist, title) {
  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    const { data } = await axios.get(url, { timeout: 8000 });
    return data.lyrics || null;
  } catch { return null; }
}

// ---- YouTube ----

async function fetchYouTubeData(songName, artist) {
  try {
    const q = encodeURIComponent(`${songName} ${artist} official audio`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;
    const { data } = await axios.get(url, { timeout: 10000 });
    const item = data.items?.[0];
    if (!item) return null;
    const videoId = item.id.videoId;
    const thumbnailUrl = item.snippet.thumbnails?.high?.url
      || item.snippet.thumbnails?.medium?.url
      || item.snippet.thumbnails?.default?.url;
    return { videoId, thumbnailUrl };
  } catch { return null; }
}

// ---- Lyrics Japanese translation ----

async function translateLyrics(lyrics, songName, artist) {
  if (!lyrics) return null;
  const prompt = `You are translating song lyrics into Japanese for a language learning app.

Song: "${songName}" by "${artist}"

Group the lyrics below into natural meaning units (phrases/couplets), then translate each group into natural Japanese.

Rules:
- Group lines that form a single thought or flowing phrase together (typically 1-3 lines)
- Do NOT split mid-sentence or mid-phrase
- Keep empty lines as group separators (do not include them in groups)
- Translation should feel natural as a Japanese song — NOT word-for-word
- Preserve emotion, nuance, and poetic feel

Lyrics:
"""
${lyrics.slice(0, 2000)}
"""

Return ONLY a valid JSON array, no markdown, no explanation:
[
  { "en": "line1\\nline2", "ja": "日本語訳" },
  { "en": "next phrase", "ja": "日本語訳" }
]`;
  try {
    const text = await callGemini(prompt);
    const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\[[\s\S]*\])/);
    if (!match) return null;
    const parsed = JSON.parse(match[1] || match[0]);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch { return null; }
}

// ---- Conversation generation ----

function buildConversationPrompt(songName, artist, lyrics, feedback = null) {
  const lyricsSection = lyrics
    ? `Here are the actual lyrics — use phrases from them directly:\n"""\n${lyrics.slice(0, 1000)}\n"""`
    : `(Use your knowledge of this song's actual lyrical phrases as inspiration)`;

  const feedbackSection = feedback
    ? `\nPrevious attempt was rejected for being unnatural. Specific issues to fix:\n${feedback}\nPlease make the conversation feel more natural and realistic.`
    : '';

  return `You are creating English conversation content for a Japanese learner's shadowing app.

Song: "${songName}" by "${artist}"
${lyricsSection}
${feedbackSection}
Create a natural 7-8 turn conversation between two people.

Rules:
- Exactly 7-8 turns alternating A and B
- Each turn: 1-3 natural English sentences
- Use English from the lyrics as much as possible — but ONLY where it sounds completely natural
- You may freely adapt or paraphrase lyric phrases so they fit the conversation naturally
- If a full phrase doesn't fit, use just a key word from the lyrics
- NEVER force a lyric phrase if it sounds unnatural — natural conversation is the top priority
- Mark adapted/paraphrased lyric phrases with double curly braces: {{like this}}
- Mark single keywords borrowed from lyrics with double square brackets: [[like this]]
- Choose the most fitting relationship
- Voice types: 男性, 女性, 男２, 少年, 少女
- Japanese translations should be natural (not word-for-word)

Return ONLY valid JSON (no markdown, no code block):
{
  "relationship": "友達 OR 恋人 OR 職場の同僚 OR 上司と部下",
  "setting": "brief scene in English",
  "speakerA": { "name": "English name", "type": "voice type" },
  "speakerB": { "name": "English name", "type": "voice type" },
  "conversation": [
    { "speaker": "A", "english": "...", "japanese": "..." }
  ]
}`;
}

function parseConvJson(text) {
  const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!match) throw new Error('No JSON found in Gemini response');
  return JSON.parse(match[1] || match[0]);
}

// ---- Naturalness check ----

async function checkNaturalness(conv) {
  const lines = conv.conversation.map(t =>
    `${t.speaker} (${t.speaker === 'A' ? conv.speakerA?.name : conv.speakerB?.name}): ${t.english}`
  ).join('\n');

  const prompt = `You are reviewing an English conversation for a language learning app.
Review this conversation strictly for naturalness:

---
${lines}
---

Evaluate:
1. Does it sound like real people talking, not a textbook or song review?
2. Are lyric phrases/words (in {{double curly}} or [[double square]] brackets) woven in naturally without sounding forced?
3. Is the topic flow logical and coherent turn-by-turn?
4. Would a native English speaker find any lines awkward or unnatural?

Return ONLY valid JSON:
{
  "score": <1-10>,
  "natural": <true if score >= 7>,
  "issues": "<specific issues if any, empty string if none>"
}`;

  const text = await callGemini(prompt);
  const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!match) return { natural: true, score: 7, issues: '' }; // default pass if parse fails
  return JSON.parse(match[1] || match[0]);
}

// ---- Main generation with retry ----

async function generateConversation(songName, artist, lyrics, { onStatus } = {}) {
  const MAX_ATTEMPTS = 3;
  let feedback = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (onStatus) onStatus(`🤖 Generating conversation (attempt ${attempt}/${MAX_ATTEMPTS})...`);

    const prompt = buildConversationPrompt(songName, artist, lyrics, feedback);
    const text = await callGemini(prompt);
    const conv = parseConvJson(text);

    if (onStatus) onStatus('🔍 Checking naturalness...');
    const check = await checkNaturalness(conv);

    if (onStatus) onStatus(`  → Score: ${check.score}/10 — ${check.natural ? '✓ Natural' : '✗ Issues: ' + check.issues}`);

    if (check.natural) return conv;

    feedback = check.issues;
    if (attempt === MAX_ATTEMPTS) {
      // Accept even if not perfect after max retries
      if (onStatus) onStatus('⚠ Using best available conversation after max retries');
      return conv;
    }
  }
}

// ---- Audio generation ----

async function generateAudio(text, voiceId, outputPath) {
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    { text, model_id: 'eleven_v3', voice_settings: { stability: 0.5, similarity_boost: 0.75 } },
    {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      responseType: 'arraybuffer',
      timeout: 30000
    }
  );
  await fs.writeFile(outputPath, response.data);
}

// ---- Full song generation (conversation + audio) ----

// Phase 1: fetch lyrics, YouTube, generate conversation — no audio yet
async function prepareConversation(songName, artist, songsDir, { onStatus, overrideYtData } = {}) {
  if (onStatus) onStatus('🎵 Fetching lyrics...');
  const lyrics = await fetchLyrics(artist, songName);
  if (onStatus) onStatus(lyrics ? '  → Lyrics found' : '  → No lyrics found, using AI knowledge');

  let ytData;
  if (overrideYtData) {
    ytData = overrideYtData;
    if (onStatus) onStatus(`  → Video (manual): ${ytData.videoId}`);
  } else {
    if (onStatus) onStatus('🎬 Fetching YouTube data...');
    ytData = await fetchYouTubeData(songName, artist);
    if (onStatus) onStatus(ytData ? `  → Video: ${ytData.videoId}` : '  → No YouTube data found');
  }

  let lyricsJa = null;
  if (lyrics) {
    if (onStatus) onStatus('📝 Translating lyrics...');
    lyricsJa = await translateLyrics(lyrics, songName, artist);
  }

  const convData = await generateConversation(songName, artist, lyrics, { onStatus });

  const baseName = `${songName} ${artist}`.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').trim().slice(0, 200);
  let folderName = baseName;
  let n = 2;
  while (await fs.pathExists(path.join(songsDir, folderName))) {
    folderName = `${baseName}_${n++}`;
  }

  const getVoice = (type) => VOICE_MAP[type] || VOICE_MAP['男性'];
  return {
    songName, artist, folderName, lyrics, lyricsJa, ytData, convData,
    speakerA: { name: convData.speakerA.name, type: convData.speakerA.type, voice: getVoice(convData.speakerA.type) },
    speakerB: { name: convData.speakerB.name, type: convData.speakerB.type, voice: getVoice(convData.speakerB.type) },
  };
}

// Phase 2: generate audio and save song.json
async function finalizeSong(prepared, songsDir, { onStatus } = {}) {
  const { songName, artist, folderName, lyrics, lyricsJa, ytData, convData, speakerA, speakerB } = prepared;
  const songDir = path.join(songsDir, folderName);
  await fs.ensureDir(songDir);

  const song = {
    id: folderName,
    folderName,
    songName,
    artist,
    relationship: convData.relationship,
    setting: convData.setting || '',
    speakerA,
    speakerB,
    videoId: ytData?.videoId || null,
    thumbnailUrl: ytData?.thumbnailUrl || null,
    lyrics: lyrics || null,
    lyricsJa: lyricsJa || null,
    conversation: [],
    createdAt: new Date().toISOString()
  };

  const processedTurns = convData.conversation.map(turn => ({
    ...turn, sentences: splitIntoSentences(turn.english)
  }));
  const totalSentences = processedTurns.reduce((acc, t) => acc + t.sentences.length, 0);
  let count = 0;

  for (let i = 0; i < processedTurns.length; i++) {
    const turn = processedTurns[i];
    const speaker = turn.speaker === 'A' ? song.speakerA : song.speakerB;
    const sentencesWithAudio = [];

    for (let j = 0; j < turn.sentences.length; j++) {
      count++;
      const { plainText, displayHtml } = parseLyricMarkers(turn.sentences[j]);
      if (onStatus) onStatus(`🔊 Generating voice ${count}/${totalSentences}: "${plainText.slice(0, 50)}..."`);

      const audioFileName = `${i}_${j}.mp3`;
      await generateAudio(plainText, speaker.voice, path.join(songDir, audioFileName));

      sentencesWithAudio.push({
        text: plainText,
        displayHtml,
        audio: `/songs/${encodeURIComponent(folderName)}/${audioFileName}`
      });
    }

    song.conversation.push({
      speaker: turn.speaker,
      speakerName: speaker.name,
      speakerType: speaker.type,
      sentences: sentencesWithAudio,
      japanese: turn.japanese
        .replace(/\{\{([^}]+)\}\}/g, '$1')
        .replace(/\[\[([^\]]+)\]\]/g, '$1')
    });
  }

  await fs.writeJson(path.join(songDir, 'song.json'), song, { spaces: 2 });
  return song;
}

// Legacy: one-shot (used by server SSE stream)
async function generateSong(songName, artist, songsDir, { onStatus } = {}) {
  const prepared = await prepareConversation(songName, artist, songsDir, { onStatus });
  return finalizeSong(prepared, songsDir, { onStatus });
}

module.exports = {
  fetchLyrics,
  fetchYouTubeData,
  translateLyrics,
  generateConversation,
  checkNaturalness,
  prepareConversation,
  finalizeSong,
  generateSong,
  splitIntoSentences,
  parseLyricMarkers,
  VOICE_MAP,
};
