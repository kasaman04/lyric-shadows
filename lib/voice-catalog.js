// English voices currently available to this ElevenLabs account. Keep IDs on the server.
const VOICE_PROFILES = [
  { key: 'mark', name: 'Mark', id: 'UgBBYS2sOqTuMpoF3BR0', gender: 'male', age: 'young', accent: 'american', tone: 'casual' },
  { key: 'will', name: 'Will', id: 'bIHbv24MWmeRgasZH58o', gender: 'male', age: 'young', accent: 'american', tone: 'calm' },
  { key: 'liam', name: 'Liam', id: 'TX3LPaxmHKxFdv7VOQHJ', gender: 'male', age: 'young', accent: 'american', tone: 'energetic' },
  { key: 'charlie', name: 'Charlie', id: 'IKne3meq5aSn9XLyUdCD', gender: 'male', age: 'young', accent: 'australian', tone: 'energetic' },
  { key: 'chris', name: 'Chris', id: 'iP95p4xoKVk53GoZ742B', gender: 'male', age: 'middle_aged', accent: 'american', tone: 'casual' },
  { key: 'roger', name: 'Roger', id: 'CwhRBWXzGAHq8TQ4Fs17', gender: 'male', age: 'middle_aged', accent: 'american', tone: 'calm' },
  { key: 'eric', name: 'Eric', id: 'cjVigY5qzO86Huf0OWal', gender: 'male', age: 'middle_aged', accent: 'american', tone: 'professional' },
  { key: 'george', name: 'George', id: 'JBFqnCBsd6RMkjVDRZzb', gender: 'male', age: 'middle_aged', accent: 'british', tone: 'warm' },
  { key: 'bill', name: 'Bill', id: 'pqHfZKP75CvOlQylNhV4', gender: 'male', age: 'senior', accent: 'american', tone: 'warm' },
  { key: 'belle', name: 'Belle', id: 'cNYrMw9glwJZXR8RwbuR', gender: 'female', age: 'young', accent: 'american', tone: 'warm' },
  { key: 'jessica', name: 'Jessica', id: 'cgSgspJ2msm6clMCkdW9', gender: 'female', age: 'young', accent: 'american', tone: 'energetic' },
  { key: 'laura', name: 'Laura', id: 'FGY2WhTYpPnrIDTdsKH5', gender: 'female', age: 'young', accent: 'american', tone: 'casual' },
  { key: 'bella', name: 'Bella', id: 'hpp4J3VqNfWAUOO0d1Us', gender: 'female', age: 'middle_aged', accent: 'american', tone: 'professional' },
  { key: 'matilda', name: 'Matilda', id: 'XrExE9yKIg1WjnnlVkGX', gender: 'female', age: 'middle_aged', accent: 'american', tone: 'energetic' },
  { key: 'kimberly', name: 'Kimberly', id: 'w2CTE3MYza6FgBnETYNT', gender: 'female', age: 'middle_aged', accent: 'american', tone: 'calm' },
  { key: 'alice', name: 'Alice', id: 'Xb7hH8MSUJpSbSDYk0k2', gender: 'female', age: 'middle_aged', accent: 'british', tone: 'professional' },
  { key: 'river', name: 'River', id: 'SAz9YHcvj6GT2YYXdXww', gender: 'neutral', age: 'middle_aged', accent: 'american', tone: 'calm' },
];

const VOICE_BY_ID = new Map(VOICE_PROFILES.map(voice => [voice.id, voice]));
const VOICE_BY_KEY = new Map(VOICE_PROFILES.map(voice => [voice.key, voice]));

const LEGACY_VOICE_MAP = {
  '男性': 'CfDbY7v8tDkTvB9rNcUw',
  '女性': 'cNYrMw9glwJZXR8RwbuR',
  '男２': 'nzFihrBIvB34imQBuxub',
  '少年': '1IKfgBmzdwnmAUPnryb3',
  '少女': 'kIC4kfVqgGXGVwgAx81Z',
};

function hash(value) {
  let result = 2166136261;
  for (const character of String(value)) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function normalizeGender(speaker = {}) {
  const value = String(speaker.gender || speaker.type || '').toLowerCase();
  if (value.includes('female') || value.includes('女性') || value.includes('少女')) return 'female';
  if (value.includes('neutral') || value.includes('中性')) return 'neutral';
  if (value.includes('male') || value.includes('男性') || value.includes('男') || value.includes('少年')) return 'male';
  return 'neutral';
}

function normalizeAge(value) {
  const age = String(value || '').toLowerCase();
  if (/senior|older|elder|old|60|70|年配|高齢/.test(age)) return 'senior';
  if (/middle|mature|40|50|中年/.test(age)) return 'middle_aged';
  return 'young';
}

function contextTone(setting = '') {
  const text = String(setting).toLowerCase();
  if (/office|work|meeting|interview|business|上司|職場/.test(text)) return 'professional';
  if (/argument|breakup|apolog|hospital|grief|別れ|謝/.test(text)) return 'calm';
  if (/party|celebrat|concert|surpris|旅行|祝い/.test(text)) return 'energetic';
  if (/family|parent|friend|cafe|home|家族|友達|カフェ/.test(text)) return 'warm';
  return 'casual';
}

function chooseVoice(speaker, { setting = '', exclude = [], seed = '' } = {}) {
  const explicit = VOICE_BY_ID.get(speaker.voice) || VOICE_BY_KEY.get(speaker.voiceProfile);
  if (explicit && !exclude.includes(explicit.id)) return explicit;

  const gender = normalizeGender(speaker);
  const age = normalizeAge(speaker.age || speaker.type);
  const tone = speaker.tone || contextTone(setting);
  const accent = String(speaker.accent || '').toLowerCase();
  const ageOrder = { young: 0, middle_aged: 1, senior: 2 };
  const ranked = VOICE_PROFILES
    .filter(voice => !exclude.includes(voice.id))
    .map(voice => ({ voice, score:
      (voice.gender === gender ? 10 : voice.gender === 'neutral' ? 2 : -10) +
      (voice.age === age ? 8 : Math.abs(ageOrder[voice.age] - ageOrder[age]) === 1 ? 4 : 0) +
      (voice.tone === tone ? 3 : 0) +
      (accent && voice.accent === accent ? 2 : 0),
      tie: hash(`${seed}:${voice.key}`)
    }))
    .sort((a, b) => b.score - a.score || a.tie - b.tie);
  return ranked[0].voice;
}

function resolveSpeaker(speaker = {}, options = {}) {
  const voice = chooseVoice(speaker, options);
  const gender = normalizeGender(speaker);
  return {
    ...speaker,
    type: speaker.type || ({ male: '男性', female: '女性', neutral: '中性' }[gender]),
    gender,
    age: normalizeAge(speaker.age || speaker.type),
    tone: speaker.tone || contextTone(options.setting),
    accent: speaker.accent || voice.accent,
    voice: voice.id,
    voiceProfile: voice.key,
    voiceName: voice.name,
  };
}

function castConversation(conv, seed = '') {
  const setting = conv.setting || '';
  const speakerA = resolveSpeaker(conv.speakerA, { setting, seed: `${seed}:A` });
  const speakerB = resolveSpeaker(conv.speakerB, { setting, exclude: [speakerA.voice], seed: `${seed}:B` });
  return { speakerA, speakerB };
}

// These rotations cover a range of ages, genders, accents and delivery styles.
// A phrase may override the rotation with voiceA/voiceB profile keys.
const PHRASE_PAIRS = [
  ['mark', 'belle'], ['jessica', 'will'], ['chris', 'matilda'],
  ['alice', 'george'], ['river', 'laura'], ['bill', 'bella'],
  ['liam', 'kimberly'], ['roger', 'jessica'], ['belle', 'eric'],
  ['matilda', 'charlie'], ['will', 'alice'], ['george', 'river'],
];

function phraseVoicePair(phrase) {
  const [defaultA, defaultB] = PHRASE_PAIRS[hash(phrase.id) % PHRASE_PAIRS.length];
  const voiceA = VOICE_BY_KEY.get(phrase.voiceA) || VOICE_BY_KEY.get(defaultA);
  let voiceB = VOICE_BY_KEY.get(phrase.voiceB) || VOICE_BY_KEY.get(defaultB);
  if (voiceB.id === voiceA.id) voiceB = VOICE_BY_KEY.get(defaultB === voiceA.key ? 'river' : defaultB);
  return { A: voiceA, B: voiceB };
}

module.exports = { VOICE_PROFILES, VOICE_BY_ID, LEGACY_VOICE_MAP, chooseVoice, resolveSpeaker, castConversation, phraseVoicePair };
