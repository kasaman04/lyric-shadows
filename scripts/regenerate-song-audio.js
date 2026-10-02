/**
 * Regenerate conversation speech for the 30 English-song entries only.
 * Never overwrites old MP3s. Run after the desired conversation text is final.
 * Preview:  node scripts/regenerate-song-audio.js
 * Generate: node scripts/regenerate-song-audio.js --generate
 * Publish:  node scripts/regenerate-song-audio.js --apply
 * One song: add --song "Song Name" to any of the commands above.
 */
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const { castConversation, VOICE_PROFILES } = require('../lib/voice-catalog');
const { TTS_MODEL_ID } = require('../lib/elevenlabs-model');
require('dotenv').config({ quiet: true });

const ROOT = path.join(__dirname, '..');
const SONGS_DIR = path.join(ROOT, 'songs');
const VOICE_OVERRIDES = require('../data/song-voice-overrides.json');
const VOICE_BY_KEY = new Map(VOICE_PROFILES.map(voice => [voice.key, voice]));
const args = process.argv.slice(2);
const generate = args.includes('--generate');
const apply = args.includes('--apply');
if (generate && apply) throw new Error('Use --generate and --apply separately.');

function option(name) {
  const index = args.indexOf(name);
  return index < 0 ? null : args[index + 1];
}

function sourceFor(song) {
  const override = VOICE_OVERRIDES[song.songName];
  const withProfile = (speaker, key) => {
    const profile = VOICE_BY_KEY.get(key);
    if (!profile) throw new Error(`Unknown voice profile ${key} for ${song.songName}`);
    return { ...speaker, voice: profile.id, voiceProfile: profile.key, gender: profile.gender, age: profile.age, accent: profile.accent, tone: profile.tone,
      type: { male: '男性', female: '女性', neutral: '中性' }[profile.gender] };
  };
  const castInput = override
    ? { ...song, speakerA: withProfile(song.speakerA, override[0]), speakerB: withProfile(song.speakerB, override[1]) }
    : song;
  const cast = castConversation(castInput, `${song.songName}:${song.artist}`);
  const turns = song.conversation.map(turn => ({
    speaker: turn.speaker,
    sentences: turn.sentences.map(sentence => sentence.text)
  }));
  const hash = crypto.createHash('sha256').update(JSON.stringify({ model: TTS_MODEL_ID, turns, A: cast.speakerA.voice, B: cast.speakerB.voice })).digest('hex').slice(0, 16);
  return { cast, turns, hash };
}

function audioPath(folder, hash, turnIndex, sentenceIndex) {
  return path.join(SONGS_DIR, folder, 'conversation-audio', hash, `${turnIndex}-${sentenceIndex}.mp3`);
}

function audioUrl(folder, hash, turnIndex, sentenceIndex) {
  return `/songs/${encodeURIComponent(folder)}/conversation-audio/${hash}/${turnIndex}-${sentenceIndex}.mp3`;
}

async function readSongs() {
  const folders = await fs.readdir(SONGS_DIR, { withFileTypes: true });
  const songs = [];
  for (const folder of folders) {
    if (!folder.isDirectory()) continue;
    const file = path.join(SONGS_DIR, folder.name, 'song.json');
    if (!await fs.pathExists(file)) continue;
    const song = await fs.readJson(file);
    if (song.songName.startsWith('【')) continue;
    songs.push({ song, file });
  }
  return songs.sort((a, b) => a.song.songName.localeCompare(b.song.songName));
}

async function synthesize(text, voiceId) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        { text, model_id: TTS_MODEL_ID, voice_settings: { stability: 0.5, similarity_boost: 0.75 } },
        { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, responseType: 'arraybuffer', timeout: 90000 }
      );
      const data = Buffer.from(response.data);
      if (data.length < 1000 || !(data.toString('ascii', 0, 3) === 'ID3' || data[0] === 0xff)) throw new Error('ElevenLabs did not return a valid MP3.');
      return data;
    } catch (error) {
      const retryable = ['ECONNRESET', 'ETIMEDOUT'].includes(error.code) || [429, 502, 503, 504].includes(error.response?.status);
      if (!retryable || attempt === 3) throw error;
      console.warn(`Temporary ElevenLabs error; retrying (${attempt}/3)`);
      await new Promise(resolve => setTimeout(resolve, attempt * 3000));
    }
  }
}

async function main() {
  const songName = option('--song');
  if (args.includes('--song') && !songName) throw new Error('--song requires a song name.');
  const allSongs = await readSongs();
  const songs = songName ? allSongs.filter(({ song }) => song.songName === songName) : allSongs;
  if (songName && songs.length !== 1) throw new Error(`Expected one song named ${songName}; found ${songs.length}.`);
  const limit = option('--limit') ? Number(option('--limit')) : Infinity;
  if ((!Number.isInteger(limit) && limit !== Infinity) || limit < 1) throw new Error('--limit must be a positive integer.');
  const wanted = songs.slice(0, limit);
  const totalSentences = wanted.reduce((sum, { song }) => sum + song.conversation.reduce((n, turn) => n + turn.sentences.length, 0), 0);
  const characters = wanted.reduce((sum, { song }) => sum + song.conversation.reduce((n, turn) => n + turn.sentences.reduce((m, sentence) => m + sentence.text.length, 0), 0), 0);
  console.log(`songs=${wanted.length}, sentences=${totalSentences}, English characters=${characters}, mode=${apply ? 'publish' : generate ? 'generate' : 'preview'}`);

  if (apply) {
    if (limit !== Infinity) throw new Error('--apply does not accept --limit. Use --song to publish one song.');
    const ready = [];
    for (const { song, file } of songs) {
      const { cast, turns, hash } = sourceFor(song);
      for (let i = 0; i < turns.length; i++) {
        for (let j = 0; j < turns[i].sentences.length; j++) {
          const filePath = audioPath(song.folderName, hash, i, j);
          if (!await fs.pathExists(filePath)) throw new Error(`Missing audio: ${song.songName} ${i}-${j}`);
          const stats = await fs.stat(filePath);
          const header = (await fs.readFile(filePath)).subarray(0, 3);
          if (stats.size < 1000 || !(header.toString('ascii') === 'ID3' || header[0] === 0xff)) throw new Error(`Invalid MP3: ${song.songName} ${i}-${j}`);
        }
      }
      const updated = {
        ...song,
        speakerA: cast.speakerA,
        speakerB: cast.speakerB,
        conversationAudioStatus: 'ready',
        conversationAudioModel: TTS_MODEL_ID,
        conversation: song.conversation.map((turn, i) => ({
          ...turn,
          speakerName: turn.speaker === 'A' ? cast.speakerA.name : cast.speakerB.name,
          speakerType: turn.speaker === 'A' ? cast.speakerA.type : cast.speakerB.type,
          sentences: turn.sentences.map((sentence, j) => ({ ...sentence, audio: audioUrl(song.folderName, hash, i, j) }))
        }))
      };
      ready.push({ song, file, updated });
    }
    for (const { song, file, updated } of ready) {
      const backup = path.join(path.dirname(file), 'song.before-audio-rewrite.json');
      if (!await fs.pathExists(backup)) await fs.copy(file, backup, { overwrite: false });
      const temporary = `${file}.audio-tmp`;
      await fs.writeJson(temporary, updated, { spaces: 2 });
      await fs.move(temporary, file, { overwrite: true });
      console.log(`Published: ${song.songName}`);
    }
    return;
  }

  if (!generate) return;
  if (!process.env.ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY is missing.');
  for (const { song } of wanted) {
    const { cast, turns, hash } = sourceFor(song);
    console.log(`Generating: ${song.songName} (${hash})`);
    for (let i = 0; i < turns.length; i++) {
      const voiceId = turns[i].speaker === 'A' ? cast.speakerA.voice : cast.speakerB.voice;
      for (let j = 0; j < turns[i].sentences.length; j++) {
        const file = audioPath(song.folderName, hash, i, j);
        if (await fs.pathExists(file)) continue;
        const text = turns[i].sentences[j];
        const data = await synthesize(text, voiceId);
        await fs.ensureDir(path.dirname(file));
        const temporary = `${file}.tmp`;
        await fs.writeFile(temporary, data);
        await fs.move(temporary, file, { overwrite: true });
        console.log(`  ${i}-${j} ${data.length} bytes`);
      }
    }
  }
}

main().catch(error => {
  const detail = error.response?.data ? Buffer.from(error.response.data).toString('utf8').slice(0, 500) : error.message;
  console.error(detail);
  process.exitCode = 1;
});
