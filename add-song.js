/**
 * add-song.js - CLI to add a song (run from this chat)
 * Usage: node add-song.js "Song Name" "Artist Name" [YouTube URL]
 *
 * Flow:
 *  1. Fetch lyrics + YouTube + generate conversation
 *  2. Show conversation preview
 *  3. Wait for user: Enter = OK, n = skip/cancel
 *  4. Generate audio and save
 */

const path = require('path');
const readline = require('readline');
const { prepareConversation, finalizeSong } = require('./lib/generate');

const SONGS_DIR = path.join(__dirname, 'songs');

function extractVideoId(urlOrId) {
  if (!urlOrId) return null;
  // youtu.be/ID or youtube.com/watch?v=ID
  const m = urlOrId.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/);
  return m ? m[1] : (urlOrId.length === 11 ? urlOrId : null);
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

function printConversation(prepared) {
  const { convData, speakerA, speakerB } = prepared;

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
    // strip markers for display
    const english = turn.english.replace(/\{\{([^}]+)\}\}/g, '[$1]').replace(/\[\[([^\]]+)\]\]/g, '[$1]');
    console.log(`\n  ${turn.speaker} (${name}): ${english}`);
    console.log(`    → ${turn.japanese}`);
  }

  console.log('\n' + '─'.repeat(60));
}

async function main() {
  const songName = process.argv[2];
  const artist = process.argv[3];
  const youtubeArg = process.argv[4] || null;

  if (!songName || !artist) {
    console.error('Usage: node add-song.js "Song Name" "Artist Name" [YouTube URL]');
    process.exit(1);
  }

  // Build overrideYtData if URL provided
  let overrideYtData = null;
  if (youtubeArg) {
    const videoId = extractVideoId(youtubeArg);
    if (!videoId) {
      console.error('❌ Invalid YouTube URL:', youtubeArg);
      process.exit(1);
    }
    overrideYtData = {
      videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
    console.log(`\n🎵 Adding: "${songName}" by "${artist}" (YouTube: ${videoId})\n`);
  } else {
    console.log(`\n🎵 Adding: "${songName}" by "${artist}"\n`);
  }

  // Phase 1: generate conversation
  const prepared = await prepareConversation(songName, artist, SONGS_DIR, {
    onStatus: (msg) => console.log(' ', msg),
    overrideYtData,
  });

  // Show preview
  printConversation(prepared);

  // Ask for confirmation
  const answer = await ask('\n▶ この会話でOKですか？ [Enter = OK / n = キャンセル]: ');

  if (answer.toLowerCase() === 'n') {
    console.log('\n❌ キャンセルしました。\n');
    process.exit(0);
  }

  // Phase 2: generate audio
  console.log('\n🔊 音声を生成します...\n');
  const song = await finalizeSong(prepared, SONGS_DIR, {
    onStatus: (msg) => console.log(' ', msg)
  });

  console.log(`\n✅ Done!`);
  console.log(`   Folder: songs/${song.folderName}/`);
  console.log(`   Relationship: ${song.relationship}`);
  console.log(`   Speakers: ${song.speakerA.name} (${song.speakerA.type}) × ${song.speakerB.name} (${song.speakerB.type})`);
  console.log(`   Turns: ${song.conversation.length}\n`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
