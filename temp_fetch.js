const { fetchLyrics, translateLyrics } = require('./lib/generate');
const fs = require('fs');
require('dotenv').config();

async function main() {
  const artist = "ONE OK ROCK";
  const song = "Hard To Love";
  console.log("Fetching...");
  let lyrics = await fetchLyrics(artist, song);
  if (!lyrics) {
      console.log("Not found via API.");
      process.exit(1);
  }
  console.log("Found lyrics. Translating...");
  let translated = await translateLyrics(lyrics, song, artist);
  fs.writeFileSync('hard_to_love_output.json', JSON.stringify(translated, null, 2), 'utf8');
  console.log("Done");
}
main().catch(console.error);
