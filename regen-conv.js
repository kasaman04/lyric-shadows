/**
 * regen-conv.js - Regenerate conversation + audio for a specific song
 * Usage: node regen-conv.js "Love Yourself Justin Bieber"
 *
 * Flow:
 *  1. Generate new conversation
 *  2. Show preview
 *  3. Wait for user: Enter = OK, n = cancel
 *  4. Delete old audio + generate new audio + save
 */
const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const { generateConversation, finalizeSong, VOICE_MAP } = require('./lib/generate');

require('dotenv').config();

const SONGS_DIR = path.join(__dirname, 'songs');

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

function printConversation(convData, speakerA, speakerB) {
  console.log('\n' + '─'.repeat(60));
  console.log(`📋 CONVERSATION PREVIEW`);
  console.log('─'.repeat(60));
  console.log(`  Relationship : ${convData.relationship}`);
  console.log(`  Setting      : ${convData.setting}`);
  console.log(`  Speaker A    : ${speakerA.name} (${speakerA.type})`);
  console.log(`  Speaker B    : ${speakerB.name} (${speakerB.type})`);
  console.log('─'.repeat(60));
  for (const turn of convData.conversation) {
    const name = turn.speaker === 'A' ? speakerA.name : speakerB.name;
    const english = turn.english.replace(/\{\{([^}]+)\}\}/g, '[$1]').replace(/\[\[([^\]]+)\]\]/g, '[$1]');
    console.log(`\n  ${turn.speaker} (${name}): ${english}`);
    console.log(`    → ${turn.japanese}`);
  }
  console.log('\n' + '─'.repeat(60));
}

async function main() {
  const folderName = process.argv[2];
  if (!folderName) {
    console.error('Usage: node regen-conv.js "<folder name>"');
    process.exit(1);
  }

  const jsonPath = path.join(SONGS_DIR, folderName, 'song.json');
  if (!await fs.pathExists(jsonPath)) {
    console.error(`Not found: ${jsonPath}`);
    process.exit(1);
  }

  const song = await fs.readJson(jsonPath);
  console.log(`\n🎵 Regenerating conversation for: ${song.songName} - ${song.artist}\n`);

  // Phase 1: Generate new conversation
  const convData = await generateConversation(song.songName, song.artist, song.lyrics, {
    onStatus: (msg) => console.log(msg)
  });

  const getVoice = (type) => VOICE_MAP[type] || VOICE_MAP['男性'];
  const speakerA = { name: convData.speakerA.name, type: convData.speakerA.type, voice: getVoice(convData.speakerA.type) };
  const speakerB = { name: convData.speakerB.name, type: convData.speakerB.type, voice: getVoice(convData.speakerB.type) };

  // Phase 2: Show preview
  printConversation(convData, speakerA, speakerB);

  // Phase 3: Confirm
  const answer = await ask('\n▶ この会話でOKですか？ [Enter = OK / n = キャンセル]: ');
  if (answer.toLowerCase() === 'n') {
    console.log('\n❌ キャンセルしました。\n');
    process.exit(0);
  }

  // Phase 4: Delete old mp3 + generate new audio + save
  console.log('\n🔊 音声を生成します...\n');
  const prepared = {
    songName: song.songName,
    artist: song.artist,
    folderName: song.folderName,
    lyrics: song.lyrics,
    lyricsJa: song.lyricsJa,
    ytData: { videoId: song.videoId, thumbnailUrl: song.thumbnailUrl },
    convData,
    speakerA,
    speakerB,
  };

  const songDir = path.join(SONGS_DIR, folderName);
  const files = await fs.readdir(songDir);
  for (const f of files) {
    if (f.endsWith('.mp3')) await fs.remove(path.join(songDir, f));
  }
  console.log('🗑 Old audio files removed');

  const result = await finalizeSong(prepared, SONGS_DIR, {
    onStatus: (msg) => console.log(msg)
  });

  const saved = await fs.readJson(path.join(SONGS_DIR, folderName, 'song.json'));
  saved.createdAt = song.createdAt;
  await fs.writeJson(path.join(SONGS_DIR, folderName, 'song.json'), saved, { spaces: 2 });

  console.log(`\n✅ Done! ${result.conversation.length} turns generated.`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
