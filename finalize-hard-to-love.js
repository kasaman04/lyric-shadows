const { finalizeSong } = require('./lib/generate');
const fs = require('fs-extra');
const path = require('path');

async function main() {
  const prepared = await fs.readJson('hard-to-love-preview.json');
  console.log('Generating audio for:', prepared.folderName);

  const SONGS_DIR = path.join(__dirname, 'songs');

  const song = await finalizeSong(prepared, SONGS_DIR, {
    onStatus: msg => console.log(msg)
  });

  console.log(`\n✅ Done!`);
  console.log(`   Folder: songs/${song.folderName}/`);
}

main().catch(console.error);
