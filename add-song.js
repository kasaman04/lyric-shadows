/**
 * add-song.js - CLI to add a song (run from this chat)
 * Usage: node add-song.js "Song Name" "Artist Name"
 */

const path = require('path');
const { generateSong } = require('./lib/generate');

const SONGS_DIR = path.join(__dirname, 'songs');

async function main() {
  const songName = process.argv[2];
  const artist = process.argv[3];

  if (!songName || !artist) {
    console.error('Usage: node add-song.js "Song Name" "Artist Name"');
    process.exit(1);
  }

  console.log(`\n🎵 Adding: "${songName}" by "${artist}"\n`);

  const song = await generateSong(songName, artist, SONGS_DIR, {
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
