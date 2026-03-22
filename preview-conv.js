const axios = require('axios');
require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

async function main() {
  let lyrics = null;
  try {
    const r = await axios.get('https://api.lyrics.ovh/v1/Bruno%20Mars/Talking%20to%20the%20Moon', { timeout: 8000 });
    lyrics = r.data.lyrics || null;
    console.log('✓ Lyrics found');
  } catch { console.log('⚠ Lyrics not found, using AI knowledge'); }

  const lyricsSection = lyrics
    ? `Here are the actual lyrics:\n"""\n${lyrics.slice(0, 1000)}\n"""`
    : `(Use your knowledge of this song's actual lyrical phrases as inspiration)`;

  const prompt = `Song: "Talking to the Moon" by "Bruno Mars"
${lyricsSection}

Create a natural 4-5 turn conversation.

Rules:
- Exactly 4-5 turns alternating A and B
- Each turn: 1-3 natural English sentences
- Naturally weave in actual phrases or lines from the lyrics (at least 2-3 times)
- The lyrics phrases must flow naturally
- Wrap every lyrics-derived phrase in double curly braces: {{like this}}
- Choose the most fitting relationship
- Voice types: 男性, 女性, 男２, 少年, 少女
- Japanese translations should be natural

Return ONLY valid JSON:
{"relationship":"","setting":"","speakerA":{"name":"","type":""},"speakerB":{"name":"","type":""},"conversation":[{"speaker":"A","english":"","japanese":""}]}`;

  console.log('Calling Gemini...');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const { data } = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }]
  }, { timeout: 120000 }).catch(err => {
    const errData = err.response?.data;
    console.error('Gemini error:', JSON.stringify(errData || err.message));
    throw err;
  });

  const text = data.candidates[0].content.parts[0].text;
  // Handle both plain JSON and ```json...``` wrapped responses
  const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!match) throw new Error('No JSON in response:\n' + text);
  const conv = JSON.parse(match[1] || match[0]);
  console.log('\n--- RESULT ---');
  console.log(JSON.stringify(conv, null, 2));

}
main().catch(e => { console.error('Error:', e.message); process.exit(1); });
