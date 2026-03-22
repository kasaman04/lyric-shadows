/**
 * patch-songs.js - Add YouTube + lyricsJa to existing songs that don't have them
 * Usage: node patch-songs.js
 */
const path = require('path');
const fs = require('fs-extra');
const { fetchYouTubeData, translateLyrics } = require('./lib/generate');

// Export these from generate.js by adding them to module.exports
const SONGS_DIR = path.join(__dirname, 'songs');

async function main() {
  const entries = await fs.readdir(SONGS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const jsonPath = path.join(SONGS_DIR, entry.name, 'song.json');
    if (!await fs.pathExists(jsonPath)) continue;
    const song = await fs.readJson(jsonPath);

    let changed = false;

    if (!song.videoId) {
      console.log(`[${song.songName}] Fetching YouTube...`);
      const yt = await fetchYouTubeData(song.songName, song.artist);
      if (yt) {
        song.videoId = yt.videoId;
        song.thumbnailUrl = yt.thumbnailUrl;
        console.log(`  → videoId: ${yt.videoId}`);
        changed = true;
      }
    }

    if (song.lyrics && (!song.lyricsJa || !Array.isArray(song.lyricsJa))) {
      console.log(`[${song.songName}] Translating lyrics (phrase-unit)...`);
      const ja = await translateLyrics(song.lyrics, song.songName, song.artist);
      if (ja) {
        song.lyricsJa = ja;
        console.log(`  → Translation done (${ja.length} phrases)`);
        changed = true;
      }
    }

    if (!song.lyrics) {
      // Try fetching lyrics
      const axios = require('axios');
      try {
        const { data } = await axios.get(
          `https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.songName)}`,
          { timeout: 8000 }
        );
        if (data.lyrics) {
          song.lyrics = data.lyrics;
          changed = true;
          console.log(`[${song.songName}] Lyrics fetched`);
          // Also translate
          const ja = await translateLyrics(song.lyrics, song.songName, song.artist);
          if (ja) { song.lyricsJa = ja; console.log(`  → Translation done`); }
        }
      } catch {}
    }

    if (changed) {
      await fs.writeJson(jsonPath, song, { spaces: 2 });
      console.log(`  ✓ Saved\n`);
    } else {
      console.log(`[${song.songName}] Already up to date`);
    }
  }
  console.log('Done!');
}

main().catch(e => { console.error(e.message); process.exit(1); });
