/**
 * add-with-lyrics.js - Add a song with manually provided lyrics
 * Usage: node add-with-lyrics.js
 * Edit the CONFIG below before running.
 */
const path = require('path');
const fs = require('fs-extra');
const {
  translateLyrics,
  generateConversation,
  finalizeSong,
  VOICE_MAP,
} = require('./lib/generate');
require('dotenv').config();

const SONGS_DIR = path.join(__dirname, 'songs');

// ===== CONFIG =====
const CONFIG = {
  songName: 'When She Loved Me',
  artist: 'Sarah McLachlan',
  videoId: 'JjwCgwkTEpA',
  lyrics: `When somebody loved me
Everything was beautiful
Every hour we spent together
Lives within my heart

And when she was sad, I was there to dry her tears
And when she was happy, so was I
When she loved me

Through the summer and the fall
We had each other, that was all
Just she and I together
Like it was meant to be

And when she was lonely
I was there to comfort her
And I knew that she loved me

So the years went by, I stayed the same
But she began to drift away
I was left alone
Still, I waited for the day
When she'd say, "I will always love you"

Lonely and forgotten
Never thought she'd look my way
And she smiled at me and held me
Just like she used to do
Like she loved me
When she loved me

When somebody loved me
Everything was beautiful
Every hour we spent together
Lives within my heart

When she loved me`,
};

async function main() {
  const { songName, artist, videoId, lyrics } = CONFIG;
  const ytData = {
    videoId,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };

  console.log(`\n🎵 Adding: "${songName}" by "${artist}" (YouTube: ${videoId})\n`);

  // Translate lyrics
  console.log('📝 Translating lyrics...');
  const lyricsJa = await translateLyrics(lyrics, songName, artist);
  console.log(lyricsJa ? '  → Translation done' : '  → Translation failed');

  // Generate conversation
  const convData = await generateConversation(songName, artist, lyrics, {
    onStatus: (msg) => console.log(msg),
  });

  // Show preview
  console.log('\n' + '─'.repeat(60));
  console.log('📋 CONVERSATION PREVIEW');
  console.log('─'.repeat(60));
  console.log(`  Relationship : ${convData.relationship}`);
  console.log(`  Setting      : ${convData.setting}`);
  console.log(`  Speaker A    : ${convData.speakerA.name} (${convData.speakerA.type})`);
  console.log(`  Speaker B    : ${convData.speakerB.name} (${convData.speakerB.type})`);
  console.log('─'.repeat(60));

  for (const turn of convData.conversation) {
    const name = turn.speaker === 'A' ? convData.speakerA.name : convData.speakerB.name;
    const english = turn.english.replace(/\{\{([^}]+)\}\}/g, '[$1]').replace(/\[\[([^\]]+)\]\]/g, '[$1]');
    console.log(`\n  ${turn.speaker} (${name}): ${english}`);
    console.log(`    → ${turn.japanese}`);
  }
  console.log('\n' + '─'.repeat(60));

  // Build prepared data
  const getVoice = (type) => VOICE_MAP[type] || VOICE_MAP['男性'];
  const folderName = `${songName} ${artist}`.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').trim().slice(0, 200);

  const prepared = {
    songName, artist, folderName, lyrics, lyricsJa, ytData, convData,
    speakerA: { name: convData.speakerA.name, type: convData.speakerA.type, voice: getVoice(convData.speakerA.type) },
    speakerB: { name: convData.speakerB.name, type: convData.speakerB.type, voice: getVoice(convData.speakerB.type) },
  };

  // Generate audio
  console.log('\n🔊 Generating audio...\n');
  const song = await finalizeSong(prepared, SONGS_DIR, {
    onStatus: (msg) => console.log(msg),
  });

  console.log(`\n✅ Done!`);
  console.log(`   Folder: songs/${song.folderName}/`);
  console.log(`   Turns: ${song.conversation.length}\n`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
