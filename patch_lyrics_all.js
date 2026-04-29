const fs = require('fs');
const path = require('path');

const songsDir = 'c:/Users/kazuk/Desktop/英語字幕/songs';
const dirsToFix = [
  'Im Yours Jason Mraz',
  'Dont Look Back in Anger Oasis',
  'Euphoria keshi',
  'Mad at Disney salem ilese',
  'These Tears Andy Grammer',
  'Settle For Less Before You Exit'
];

let fixedCount = 0;
dirsToFix.forEach(dir => {
  const jsonPath = path.join(songsDir, dir, 'song.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (data.lyrics === null || data.lyrics === "") {
      // lyricsJaのenプロパティ（英語テキスト）をすべて抽出し、改行で結合してフル歌詞にする
      const fullLyrics = data.lyricsJa.map(item => item.en).join('\n');
      data.lyrics = fullLyrics;
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ Fixed lyrics for: ${dir}`);
      fixedCount++;
    } else {
      console.log(`ℹ️ Lyrics already exist for: ${dir}`);
    }
  } else {
    console.error(`❌ File not found: ${jsonPath}`);
  }
});

console.log(`\n🎉 Total fixed: ${fixedCount}`);
