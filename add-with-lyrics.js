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
  songName: 'One Last Time',
  artist: '赤西仁',
  videoId: 'J5BmHcpRPRI',
  lyrics: `I'm packing my bags 'cuz the journey is over
And we were never good enough for each other
You put me through hell every time that I tried
Tonight I'm gonna make you pay one last time

You ain't gotta be shy I want the neighbors to hear it
The way we used to do it in the beginning
So take your time
I'm waiting at the door
And imma do it do it do it do it do it 'til you want more

(Temperature's gettin' hot don't fight it)
I don't give a damn what you say you gotta do baby
(Kiss ya lips so soft then bite it)

When I'm through you gon' wish
that you never would have gave me up

I'm packing my bags 'cuz the journey is over
And we were never good enough for each other
You put me through hell every time that I tried
Tonight I'm gonna make you pay one last time

Remember back in the day I said nobody was better
And I was gonna change your life forever
You took me for granted
Thought it was a game
You 'bout to get it so good
that your next man will know my name

(Let your hair down baby turn the lights off)
Grab a life vest we're sailing into ecstacy

(Don't hold back baby just shout out)
It's the last time you gonna have a man
give it to you like me

I'm packing my bags 'cuz the journey is over
And we were never good enough for each other
You put me through hell every time that I tried
Tonight I'm gonna make you pay one last time

I'm packing my bags 'cuz the journey is over
And we were never good enough for each other
You put me through hell every time that I tried
Tonight I'm gonna make you pay one last time`,
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
