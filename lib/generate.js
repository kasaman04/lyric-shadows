/**
 * lib/generate.js
 * Shared generation logic: lyrics, conversation (with naturalness check), audio
 */

const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const { LEGACY_VOICE_MAP, castConversation } = require('./voice-catalog');

require('dotenv').config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const VOICE_MAP = LEGACY_VOICE_MAP;

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

function codexEditRequired() {
  throw new Error('会話と歌詞の翻訳は Codex で編集してください。自動生成 API は利用できません。');
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

async function translateLyrics(lyrics) {
  if (!lyrics) return null;
  codexEditRequired();
}

// ---- Conversation generation ----

function buildConversationPrompt(songName, artist, lyrics, feedback = null, contextHint = null) {
  const lyricsSection = lyrics
    ? `These are the actual lyrics, with repeated lines removed. Use them as the source of truth:\n"""\n${Array.from(new Set(lyrics.split('\n').map(line => line.trim()).filter(Boolean))).join('\n')}\n"""`
    : `(Actual lyrics were not supplied.)`;

  const feedbackSection = feedback
    ? `\nPrevious attempt did not meet the quality rules. Specific issues to fix:\n${feedback}\nRewrite the conversation and its lyric connections.`
    : '';

  const contextSection = contextHint
    ? `\nCRITICAL CONTEXT REQUIREMENT:\n${contextHint}\n`
    : '';

  return `You are creating English conversation content for a Japanese learner's shadowing app.
${contextSection}

Song: "${songName}" by "${artist}"
${lyricsSection}
${feedbackSection}
Create a short, natural three-exchange conversation (six alternating turns) between two people that helps a learner understand the song when they hear it again.

Rules:
- Exactly six turns alternating A and B (three exchanges)
- Each turn: 1-2 natural English sentences
- First identify 2-3 useful everyday expressions in the lyrics. Prefer a phrase or grammar pattern over an isolated word.
- Build one plausible scene that preserves the song's central feeling or conflict. Let the conversation unfold naturally; do not make characters discuss the song.
- Reuse each chosen expression with its meaning and grammatical structure intact, but change the subject, object, or situation when that makes its everyday use clearer.
- Do not stack quotations or repeat a lyric line merely to maximize overlap. Do not force an expression into an unnatural sentence.
- Mark the adapted expression in the conversation with {{double curly braces}}. Use [[double square brackets]] only for a meaningful single word.
- Include a lyricConnections entry for each of the 2-3 expressions. lyricExpression must be a short exact excerpt of the supplied lyrics; conversationExpression must be an exact excerpt of the conversation after removing markers. explanationJa should briefly explain the shared meaning or grammar in Japanese.
- Choose the most fitting relationship
- Give each speaker a plausible adult age, gender, accent, and speaking tone that fit the relationship and scene. Vary these across different stories; do not default every pair to two young adults.
- Supported ages: young, middle_aged, senior. Supported genders: male, female, neutral. Supported accents: american, british, australian. Supported tones: casual, warm, calm, energetic, professional.
- Match the spoken roles to the situation: colleagues may sound professional, friends conversational, difficult moments calm. Do not infer age from the song artist.
- Japanese translations should be natural (not word-for-word)

Return ONLY valid JSON (no markdown, no code block):
{
  "relationship": "友達 OR 恋人 OR 職場の同僚 OR 上司と部下",
  "setting": "brief scene in English",
  "speakerA": { "name": "English name", "gender": "female", "age": "middle_aged", "accent": "american", "tone": "warm" },
  "speakerB": { "name": "English name", "gender": "male", "age": "young", "accent": "american", "tone": "casual" },
  "conversation": [
    { "speaker": "A", "english": "...", "japanese": "..." }
  ],
  "lyricConnections": [
    { "lyricExpression": "short exact lyric excerpt", "conversationExpression": "exact conversation excerpt", "explanationJa": "意味や文法のつながりを簡潔に説明" }
  ]
}`;
}

// ---- Naturalness check ----

function plainConversationText(conv) {
  return conv.conversation.map(turn => String(turn.english || '').replace(/\{\{([^}]+)\}\}/g, '$1').replace(/\[\[([^\]]+)\]\]/g, '$1')).join(' ');
}

function normalizedText(text) {
  return String(text || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim();
}

function validateLyricConnections(conv, lyrics) {
  const issues = [];
  if (!Array.isArray(conv.conversation) || conv.conversation.length !== 6) issues.push('Use six alternating turns (three exchanges).');
  if (Array.isArray(conv.conversation) && conv.conversation.some((turn, index) => turn.speaker !== (index % 2 ? 'B' : 'A') || !turn.english || !turn.japanese)) issues.push('Alternate A and B and include English and Japanese in every turn.');
  if (!Array.isArray(conv.lyricConnections) || conv.lyricConnections.length < 2 || conv.lyricConnections.length > 3) issues.push('Provide 2-3 lyricConnections.');
  const lyricText = normalizedText(lyrics);
  const dialogueText = normalizedText(Array.isArray(conv.conversation) ? plainConversationText(conv) : '');
  const seenSources = new Set();
  for (const item of Array.isArray(conv.lyricConnections) ? conv.lyricConnections : []) {
    const link = item || {};
    const source = normalizedText(link.lyricExpression);
    const usage = normalizedText(link.conversationExpression);
    if (!source || !lyricText.includes(source)) issues.push(`The lyric excerpt is not in the supplied lyrics: ${link.lyricExpression}`);
    if (!usage || !dialogueText.includes(usage)) issues.push(`The conversation excerpt is not in the dialogue: ${link.conversationExpression}`);
    if (seenSources.has(source)) issues.push(`Use distinct lyric expressions: ${link.lyricExpression}`);
    seenSources.add(source);
    if (!link.explanationJa) issues.push('Explain each lyric-to-conversation connection in Japanese.');
  }
  return issues;
}

async function generateConversation(songName, artist, lyrics) {
  if (!lyrics?.trim()) throw new Error('歌詞が見つかりません。歌詞を用意してから会話を作成してください。');
  codexEditRequired();
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
async function prepareConversation(songName, artist, songsDir, { onStatus, overrideYtData, contextHint } = {}) {
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

  const convData = await generateConversation(songName, artist, lyrics, { onStatus, contextHint });

  const baseName = `${songName} ${artist}`.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').trim().slice(0, 200);
  let folderName = baseName;
  let n = 2;
  while (await fs.pathExists(path.join(songsDir, folderName))) {
    folderName = `${baseName}_${n++}`;
  }

  const cast = castConversation(convData, `${songName}:${artist}`);
  return {
    songName, artist, folderName, lyrics, lyricsJa, ytData, convData,
    speakerA: cast.speakerA,
    speakerB: cast.speakerB,
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
    lyricConnections: convData.lyricConnections || [],
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
  prepareConversation,
  finalizeSong,
  generateSong,
  splitIntoSentences,
  parseLyricMarkers,
  buildConversationPrompt,
  validateLyricConnections,
  VOICE_MAP,
  castConversation,
};
