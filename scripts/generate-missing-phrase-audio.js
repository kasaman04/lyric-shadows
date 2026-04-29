const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

global.window = {};
require('../public/phrases.js');
require('../public/real-phrases.js');
require('../public/extra-phrases.js');
require('../public/more-phrases.js');
require('../public/first-meeting-phrases.js');
require('../public/get-to-know-phrases.js');

const VOICE_ID = 'CfDbY7v8tDkTvB9rNcUw';
const ROOT = path.join(__dirname, '..');
const OUT_ROOT = path.join(ROOT, 'public', 'phrase-audio');
const MANIFEST_PATH = path.join(ROOT, 'public', 'generated-phrase-audio.js');

function audioPathFor(id) {
  return `/phrase-audio/${id}/conversation.mp3`;
}

function audioFileFor(id) {
  return path.join(OUT_ROOT, id, 'conversation.mp3');
}

async function writeManifest(phrases) {
  const entries = {};
  for (const phrase of phrases) {
    if (await fs.pathExists(audioFileFor(phrase.id))) {
      entries[phrase.id] = audioPathFor(phrase.id);
    }
  }
  const body = `window.GENERATED_PHRASE_AUDIO = ${JSON.stringify(entries, null, 2)};\n`;
  await fs.writeFile(MANIFEST_PATH, body);
  return Object.keys(entries).length;
}

async function generatePhrase(phrase) {
  const text = phrase.lines.map(line => line[1]).join('\n\n');
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      text,
      model_id: 'eleven_v3',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    },
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg'
      },
      responseType: 'arraybuffer',
      timeout: 30000
    }
  );

  const file = audioFileFor(phrase.id);
  await fs.ensureDir(path.dirname(file));
  await fs.writeFile(file, response.data);
  return response.data.byteLength;
}

async function main() {
  const phrases = window.CONVERSATION_PHRASES;
  const missing = [];
  for (const phrase of phrases) {
    if (!await fs.pathExists(audioFileFor(phrase.id))) missing.push(phrase);
  }

  console.log(`missing=${missing.length}`);
  let made = 0;
  let skipped = phrases.length - missing.length;

  for (const phrase of missing) {
    try {
      const bytes = await generatePhrase(phrase);
      made++;
      const totalManifest = await writeManifest(phrases);
      console.log(`made ${phrase.id} ${bytes} manifest=${totalManifest}`);
    } catch (error) {
      const responseData = error.response?.data
        ? Buffer.from(error.response.data).toString('utf8')
        : error.message;
      console.error(`stopped at ${phrase.id}: ${responseData}`);
      break;
    }
  }

  const totalManifest = await writeManifest(phrases);
  console.log(`done made=${made} skipped=${skipped} manifest=${totalManifest}`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
