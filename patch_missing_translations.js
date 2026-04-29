const fs = require('fs-extra');
const path = require('path');
const { translateLyrics } = require('./lib/generate');

const SONGS_DIR = path.join(__dirname, 'songs');

async function main() {
  const entries = await fs.readdir(SONGS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const jsonPath = path.join(SONGS_DIR, entry.name, 'song.json');
    if (!(await fs.pathExists(jsonPath))) continue;

    try {
      const song = await fs.readJson(jsonPath);
      
      if (!song.lyrics) continue;
      
      const enLinesCount = song.lyrics.split('\n').length;
      const jaLinesCount = Array.isArray(song.lyricsJa) ? song.lyricsJa.length : 0;
      
      // If Japanese translation is significantly shorter than the English text
      if (enLinesCount - jaLinesCount > 5 || (song.lyrics.length > 1800 && jaLinesCount < enLinesCount * 0.8)) {
        console.log(`\n⏳ Updating: ${song.songName} (enLines: ${enLinesCount}, jaLines: ${jaLinesCount})`);
        
        const newLyricsJa = await translateLyrics(song.lyrics, song.songName, song.artist);
        
        if (newLyricsJa && newLyricsJa.length > 0) {
          song.lyricsJa = newLyricsJa;
          await fs.writeJson(jsonPath, song, { spaces: 2 });
          console.log(`✅ Success: ${song.songName}`);
        } else {
          console.log(`❌ Failed to translate: ${song.songName}`);
        }
      } else {
        console.log(`⏭ Skipped (looks complete): ${song.songName}`);
      }
    } catch (e) {
      console.error(`Error processing ${entry.name}:`, e.message);
    }
  }
}

main().catch(console.error);
