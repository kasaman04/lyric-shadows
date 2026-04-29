const fs = require('fs');
const path = require('path');
const { fetchYouTubeData } = require('./lib/generate');

const dirsToFix = [
  'Im Yours Jason Mraz',
  'Dont Look Back in Anger Oasis',
  'Euphoria keshi',
  'Mad at Disney salem ilese',
  'These Tears Andy Grammer',
  'Settle For Less Before You Exit'
];

async function main() {
  for (const dir of dirsToFix) {
    const jsonPath = path.join(__dirname, 'songs', dir, 'song.json');
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      if (!data.videoId || !data.thumbnailUrl) {
        console.log(`Searching YouTube for ${data.songName} - ${data.artist}...`);
        const ytData = await fetchYouTubeData(data.songName, data.artist);
        if (ytData && ytData.videoId) {
          data.videoId = ytData.videoId;
          data.thumbnailUrl = ytData.thumbnailUrl;
          fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
          console.log(`✅ Updated ${dir} -> Video ID: ${ytData.videoId}`);
        } else {
          console.log(`❌ No data found for ${dir}`);
        }
      } else {
        console.log(`ℹ️ ${dir} already has YouTube data.`);
      }
    }
  }
}

main().catch(console.error);
