/**
 * preview-new.js - Preview conversation for a NEW song (no audio)
 * Usage: node preview-new.js "Song Name" "Artist" [YouTube URL or ID]
 */
const path = require('path');
const fs = require('fs-extra');
const { prepareConversation } = require('./lib/generate');
require('dotenv').config();

const SONGS_DIR = path.join(__dirname, 'songs');
const PREVIEW_PATH = path.join(__dirname, 'tmp-preview.json');

function extractVideoId(urlOrId) {
  if (!urlOrId) return null;
  const m = urlOrId.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/);
  return m ? m[1] : (urlOrId.length === 11 ? urlOrId : null);
}

async function main() {
  const songName = process.argv[2];
  const artist = process.argv[3];
  const youtubeArg = process.argv[4] || null;

  if (!songName || !artist) {
    console.error('Usage: node preview-new.js "Song Name" "Artist" [YouTube URL]');
    process.exit(1);
  }

  let overrideYtData = null;
  if (youtubeArg) {
    const videoId = extractVideoId(youtubeArg);
    if (!videoId) { console.error('❌ Invalid YouTube URL:', youtubeArg); process.exit(1); }
    overrideYtData = {
      videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
    console.log(`\n🎵 Previewing: "${songName}" by "${artist}" (YouTube: ${videoId})\n`);
  } else {
    console.log(`\n🎵 Previewing: "${songName}" by "${artist}"\n`);
  }

  const prepared = await prepareConversation(songName, artist, SONGS_DIR, {
    onStatus: (msg) => console.log(msg),
    overrideYtData,
  });

  // Save full prepared data to tmp-preview.json
  await fs.writeJson(PREVIEW_PATH, {
    isNew: true,
    songName: prepared.songName,
    artist: prepared.artist,
    folderName: prepared.folderName,
    lyrics: prepared.lyrics,
    lyricsJa: prepared.lyricsJa,
    ytData: prepared.ytData,
    relationship: prepared.convData.relationship,
    setting: prepared.convData.setting,
    speakerA: prepared.speakerA,
    speakerB: prepared.speakerB,
    conversation: prepared.convData.conversation,
  }, { spaces: 2 });

  console.log(`\n✅ Preview saved to tmp-preview.json`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
