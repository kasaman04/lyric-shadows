/**
 * preview-regen.js - Generate & save conversation preview to tmp file (no audio)
 * Usage: node preview-regen.js "Love Yourself Justin Bieber"
 */
const path = require('path');
const fs = require('fs-extra');
const { generateConversation, VOICE_MAP } = require('./lib/generate');

require('dotenv').config();

const SONGS_DIR = path.join(__dirname, 'songs');
const PREVIEW_PATH = path.join(__dirname, 'tmp-preview.json');

async function main() {
  const folderName = process.argv[2];
  if (!folderName) { console.error('Usage: node preview-regen.js "<folder name>"'); process.exit(1); }

  const song = await fs.readJson(path.join(SONGS_DIR, folderName, 'song.json'));
  console.log(`\n🎵 Generating preview for: ${song.songName} - ${song.artist}\n`);

  const convData = await generateConversation(song.songName, song.artist, song.lyrics, {
    onStatus: (msg) => console.log(msg)
  });

  const getVoice = (type) => VOICE_MAP[type] || VOICE_MAP['男性'];
  const preview = {
    folderName,
    relationship: convData.relationship,
    setting: convData.setting,
    speakerA: { name: convData.speakerA.name, type: convData.speakerA.type, voice: getVoice(convData.speakerA.type) },
    speakerB: { name: convData.speakerB.name, type: convData.speakerB.type, voice: getVoice(convData.speakerB.type) },
    conversation: convData.conversation,
  };

  await fs.writeJson(PREVIEW_PATH, preview, { spaces: 2 });
  console.log(`\n✅ Preview saved to tmp-preview.json`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
