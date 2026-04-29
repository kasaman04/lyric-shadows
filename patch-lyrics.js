const fs = require('fs');
const path = require('path');

const targetSongs = [
  "comethru Jeremy Zucker",
  "Everlong Foo Fighters",
  "Forever 赤西仁",
  "I Won't Tell a Soul Charlie Puth",
  "I'm Not The Only One Sam Smith",
  "imagine if gnash",
  "It Will Rain Bruno Mars",
  "less of you keshi",
  "Love Yourself Justin Bieber",
  "Off my face Justin Bieber",
  "One Last Time 赤西仁",
  "Sucker for You Matt Terry",
  "Too Good to Say Goodbye Bruno Mars"
];

let totalFixed = 0;

for (const dir of targetSongs) {
  const file = path.join(__dirname, 'songs', dir, 'song.json');
  if (fs.existsSync(file)) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (data.lyricsJa) {
        let newLyricsJa = [];
        let modified = false;

        for (const item of data.lyricsJa) {
          // If the element has multiple lines joined by newline
          if (item.en && item.en.includes('\n')) {
            modified = true;
            const enLines = item.en.replace(/\r/g, '').split('\n');
            const jaLines = item.ja ? item.ja.replace(/\r/g, '').split('\n') : [];
            
            const maxLen = Math.max(enLines.length, jaLines.length);
            for (let i = 0; i < maxLen; i++) {
              newLyricsJa.push({
                en: enLines[i] || "",
                ja: jaLines[i] || ""
              });
            }
          } else {
            newLyricsJa.push(item);
          }
        }

        if (modified) {
          data.lyricsJa = newLyricsJa;
          fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
          console.log(`✅ Fixed: ${dir}`);
          totalFixed++;
        }
      }
    } catch (e) {
      console.error(`❌ Error parsing ${file}:`, e.message);
    }
  } else {
    console.warn(`⚠️ Not found: ${file}`);
  }
}

console.log(`\n🎉 Processed all ${targetSongs.length} songs. Fixed ${totalFixed}.`);
