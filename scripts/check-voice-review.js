'use strict';
const path = require('node:path');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const { Store, generateReview } = require('../lib/voice-practice');
(async () => {
  if (!process.env.ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY is not configured.');
  const dir = path.join(__dirname, '../tmp/voice-practice-smoke'); await fs.mkdir(dir, { recursive: true });
  const record = { id: crypto.randomUUID(), turns: [{ id: 'mia', role: 'assistant', text: 'Thanks for chatting. Enjoy your next game!' }, { id: 'you', role: 'user', text: 'Thanks, Mia. See you next time!' }] };
  const review = await generateReview(record, { env: process.env, fetcher: fetch, store: new Store(dir) });
  const result = { file: path.join(dir, record.id + '.wav'), duration: review.duration, cues: review.cues, provider: review.provider };
  await fs.writeFile(path.join(dir, 'latest-check.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
})().catch(error => { console.error(error.status ? error.message : 'Live speech check failed; no credentials or provider response were printed.'); process.exitCode = 1; });
