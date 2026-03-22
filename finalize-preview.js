/**
 * finalize-preview.js - Generate audio from saved tmp-preview.json
 * Works for both new songs (isNew: true) and existing song re-generation.
 * Usage: node finalize-preview.js
 */
const path = require('path');
const fs = require('fs-extra');
const { finalizeSong } = require('./lib/generate');
require('dotenv').config();

const SONGS_DIR = path.join(__dirname, 'songs');
const PREVIEW_PATH = path.join(__dirname, 'tmp-preview.json');

async function main() {
  if (!await fs.pathExists(PREVIEW_PATH)) {
    console.error('tmp-preview.json not found. Run preview-new.js or preview-regen.js first.');
    process.exit(1);
  }

  const preview = await fs.readJson(PREVIEW_PATH);
  const { folderName, isNew } = preview;
  const jsonPath = path.join(SONGS_DIR, folderName, 'song.json');

  let originalCreatedAt = null;
  let lyrics, lyricsJa, ytData;

  if (isNew) {
    // New song: use all data from preview
    lyrics = preview.lyrics;
    lyricsJa = preview.lyricsJa;
    ytData = preview.ytData;
  } else {
    // Existing song: preserve original metadata
    const original = await fs.readJson(jsonPath);
    originalCreatedAt = original.createdAt;
    lyrics = original.lyrics;
    lyricsJa = original.lyricsJa;
    ytData = { videoId: original.videoId, thumbnailUrl: original.thumbnailUrl };

    // Delete old mp3 files
    const files = await fs.readdir(path.join(SONGS_DIR, folderName));
    for (const f of files) {
      if (f.endsWith('.mp3')) await fs.remove(path.join(SONGS_DIR, folderName, f));
    }
    console.log('🗑 Old audio removed');
  }

  const prepared = {
    songName: preview.songName,
    artist: preview.artist,
    folderName,
    lyrics,
    lyricsJa,
    ytData,
    convData: {
      relationship: preview.relationship,
      setting: preview.setting,
      speakerA: { name: preview.speakerA.name, type: preview.speakerA.type },
      speakerB: { name: preview.speakerB.name, type: preview.speakerB.type },
      conversation: preview.conversation,
    },
    speakerA: preview.speakerA,
    speakerB: preview.speakerB,
  };

  console.log('\n🔊 Generating audio...\n');
  const result = await finalizeSong(prepared, SONGS_DIR, {
    onStatus: (msg) => console.log(msg)
  });

  // Preserve createdAt for existing songs
  if (originalCreatedAt) {
    const saved = await fs.readJson(jsonPath);
    saved.createdAt = originalCreatedAt;
    await fs.writeJson(jsonPath, saved, { spaces: 2 });
  }

  await fs.remove(PREVIEW_PATH);
  console.log(`\n✅ Done! ${result.conversation.length} turns, audio generated.`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
