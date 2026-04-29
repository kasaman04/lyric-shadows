const fs = require('fs');
const path = require('path');

const songsDir = 'c:/Users/kazuk/Desktop/英語字幕/songs';
const dirs = fs.readdirSync(songsDir).filter(f => fs.statSync(path.join(songsDir, f)).isDirectory());

console.log("Checking all songs...");
dirs.forEach(dir => {
  const jsonPath = path.join(songsDir, dir, 'song.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const lyrics = data.lyrics || "";
    // extract all english text from lyricsJa
    let lyricsJaText = "";
    if (data.lyricsJa && Array.isArray(data.lyricsJa)) {
        lyricsJaText = data.lyricsJa.map(i => i.en).join('\n').trim();
    }
    
    // Normalize spaces/newlines for a rough comparison
    const normLyrics = lyrics.replace(/\\s+/g, ' ').trim();
    const normJa = lyricsJaText.replace(/\\s+/g, ' ').trim();
    
    const isExactMatch = (normLyrics === normJa);
    const isVeryCloseEnd = lyrics.endsWith(lyricsJaText.substring(lyricsJaText.length - 20));
    const lengthDiff = normLyrics.length - normJa.length;

    let status = "✅ OK (Full)";
    if (lyrics.trim() === "") {
       status = "❌ EMPTY";
    } else if (normLyrics.length < 50) {
       status = "⚠️ VERY SHORT";
    } else if (isExactMatch || Math.abs(lengthDiff) < 10) {
       status = "❌ SUSPICIOUS (Match with lyricsJa)";
    } else if (lengthDiff < 50) {
       status = "⚠️ SUSPICIOUS (Very close to lyricsJa)";
    }

    console.log(`- ${dir}: ${status} | Length: ${normLyrics.length} (ja: ${normJa.length})`);
  }
});
