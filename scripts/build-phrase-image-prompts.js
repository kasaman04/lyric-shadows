const fs = require('fs-extra');
const path = require('path');

global.window = {};

[
  '../public/phrases.js',
  '../public/real-phrases.js',
  '../public/first-meeting-phrases.js',
  '../public/get-to-know-phrases.js',
  '../public/more-phrases.js',
  '../public/extra-phrases.js'
].forEach(file => require(path.join(__dirname, file)));

const phrases = Array.isArray(window.CONVERSATION_PHRASES) ? window.CONVERSATION_PHRASES : [];

const rootDir = path.join(__dirname, '..');
const imageDir = path.join(rootDir, 'public', 'phrase-images');
const phraseImageDir = path.join(imageDir, 'phrases');
const dataDir = path.join(rootDir, 'data');

function lineText(lines) {
  return lines
    .map(([speaker, english]) => `${speaker}: ${english}`)
    .join('\n');
}

const fallbackSettings = [
  'a quiet workplace lounge with a laptop and notebooks',
  'a small city cafe by a window',
  'a bright office hallway near an elevator',
  'a cozy apartment living room',
  'a train station concourse with an abstract map board',
  'a kitchen table in soft evening light',
  'a park bench on a calm afternoon',
  'a classroom corner after class',
  'a shared workspace with plants and a tablet',
  'a front-door entryway with bags and shoes'
];

const fallbackCamera = [
  'over-the-shoulder view',
  'slight top-down table view',
  'medium side profile composition',
  'close conversational two-shot',
  'wide environmental two-shot',
  'diagonal composition with one person in the foreground',
  'overhead tabletop composition focused on hands and props',
  'one person partly outside the frame while the other reacts',
  'window or mirror reflection composition',
  'walking side view with the environment carrying the mood',
  'object-led memory cue composition with people secondary',
  'distant environmental shot with small figures and clear body language'
];

const compositionRules = [
  'Do not let the cards drift into the same two-people-talking composition.',
  'Two-panel layouts are allowed only when they clearly help the phrase; do not use them as the default.',
  'Across each 10-card batch, mix composition types: overhead/tabletop, hands-only, over-the-shoulder, one person in foreground, window/mirror/reflection view, walking scene, doorway/entryway, distant environmental shot, object-led memory cue, and close reaction shot.',
  'Avoid repeating seated face-to-face conversations, cafe-table scenes, or side-by-side listening shots.',
  'Vary subject placement, body distance, camera height, foreground objects, negative space, and whether one or two people are visible.'
].join(' ');

const characterVariations = [
  'two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt',
  'two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair',
  'two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair',
  'two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater',
  'two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes',
  'two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle',
  'two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket',
  'two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting'
];

const singleMomentCategories = new Set([
  '相槌',
  '驚き・反応',
  '軽い同意',
  'リアクション',
  '短い返し',
  '驚き',
  '困惑',
  '安心',
  '嬉しい',
  'ノリ',
  'ツッコミ'
]);

function buildMemoryHook(phrase, index) {
  const text = [
    phrase.phrase,
    phrase.usageNote,
    ...phrase.lines.flatMap(line => [line[1], line[2]])
  ].join(' ').toLowerCase();

  if (/text|message|dm|reply|phone|call|send/.test(text)) {
    return 'a smartphone on the table showing an unread-message feeling, but with no readable screen text';
  }
  if (/job|meeting|work|team|design|draft|project|office/.test(text)) {
    return 'a work setting with a laptop, notebook, or meeting-room detail that makes this feel like a specific workplace moment';
  }
  if (/space|slow|relationship|personal|move on|weird|trust|labels/.test(text)) {
    return 'two people with a little physical distance between them, using chairs, a sofa, or a quiet corner to show emotional delicacy';
  }
  if (/exit|turn left|directions|station|train|apartment|package|door/.test(text)) {
    return 'a location cue such as a station map, doorway, package, or hallway object that makes the situation instantly recognizable';
  }
  if (/tonight|exhausted|quiet night|dinner|stay in/.test(text)) {
    return 'an evening-at-home cue such as a sofa, warm lamp, shoes by the door, or untouched going-out bag';
  }
  if (/coffee|cafe/.test(text)) {
    return 'a distinctive coffee moment, such as a takeaway cup, cafe counter, or spilled sugar packet, not just two people at a generic table';
  }
  if (/trip|post|class|package|remember/.test(text)) {
    return 'one concrete prop from the conversation, such as a phone with photos, backpack, package, or reminder note, with no readable text';
  }

  return `a distinctive setting and prop combination: ${fallbackSettings[index % fallbackSettings.length]}, ${fallbackCamera[index % fallbackCamera.length]}`;
}

function shouldUseTwoPanels(phrase) {
  if (singleMomentCategories.has(phrase.category)) return false;
  const text = [
    phrase.category,
    phrase.phrase,
    phrase.usageNote
  ].join(' ');
  return !/(Exactly\.|Right\.|Totally\.|For sure\.|Seriously\?|No way\.)/.test(text);
}

function buildPanelDirection(phrase, index, memoryHook) {
  const characterVariation = characterVariations[index % characterVariations.length];
  if (!shouldUseTwoPanels(phrase)) {
    return `Panel/story structure: Use a single strong moment instead of a two-panel story. Capture the exact emotional reaction or conversational beat in one clear scene. Make it visually distinct with ${memoryHook}.
Character variation: Use ${characterVariation}. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.`;
  }

  return `Panel/story structure: Prefer a single varied cinematic scene unless a two-panel structure clearly makes the phrase easier to understand. If using two panels, make the left and right panels compositionally different rather than two similar conversational shots. Do not use speech bubbles or panel captions.
Character variation: Use ${characterVariation}. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.`;
}

function buildPrompt(phrase) {
  const index = phrases.indexOf(phrase);
  const memoryHook = buildMemoryHook(phrase, index);
  const panelDirection = buildPanelDirection(phrase, index, memoryHook);

  return `Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "${phrase.phrase}".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
${lineText(phrase.lines)}
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "${phrase.phrase}" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using ${memoryHook}.
${panelDirection}
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. ${compositionRules} Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Put the exact text "${phrase.phrase}" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "${phrase.phrase}"
Context for the image only, do not render this Japanese text: ${phrase.usageNote}
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no repeated face-to-face conversation composition, no same-looking characters across cards. The overlay text must be spelled exactly as "${phrase.phrase}".`;
}

const records = phrases.map(phrase => ({
  id: phrase.id,
  category: phrase.category,
  phrase: phrase.phrase,
  usageNote: phrase.usageNote,
  hasAudio: Boolean(phrase.audio),
  imagePath: `/phrase-images/phrases/${phrase.id}.webp`,
  targetFile: `public/phrase-images/phrases/${phrase.id}.webp`,
  promptMode: shouldUseTwoPanels(phrase) ? 'two-panel' : 'single-moment',
  conversation: phrase.lines.map(([speaker, english, japanese]) => ({ speaker, english, japanese })),
  prompt: buildPrompt(phrase)
}));

function markdownFor(records) {
  const header = `# Phrase Image Prompts

Manual image-generation prompt bank for the Conversation Phrases tab.

Recommended output:
- Save each image as WebP when possible.
- Put files in \`public/phrase-images/phrases/\`.
- File name must match the phrase id, for example \`ask-001.webp\`.
- Use a strict 16:9 wide landscape card image.
- Keep only the English phrase as small overlay text in the image.
- Do not put Japanese text, speech bubbles, logos, or watermarks in the image.
- Do not let the cards drift into the same two-people-talking composition.
- Two-panel layouts are allowed only when they clearly help the phrase; do not use them as the default.
- Across every 10-card batch, mix camera angles and scene types: overhead/tabletop, hands-only, over-the-shoulder, one person in foreground, window/mirror/reflection view, walking scene, doorway/entryway, distant environmental shot, object-led memory cue, and close reaction shot.
- Avoid repeating seated face-to-face conversations, cafe-table scenes, or side-by-side listening shots.
- Keep the art style consistent, but vary characters, age, hair, clothing, setting, props, body distance, camera angle, subject placement, and negative space.

Style direction:
- Clean modern educational illustration.
- Mature and app-friendly, not childish, not anime, not photorealistic.
- Semi-flat digital illustration with gentle depth.
- Simple background, clear facial expressions, natural colors.
- Same style across cards; different people and memorable situations across cards.

`;

  const body = records.map((record, index) => `## ${index + 1}. ${record.id} - ${record.phrase}

- Category: ${record.category}
- Usage note: ${record.usageNote}
- File name: \`${record.id}.webp\`
- Target file: \`${record.targetFile}\`
- Has audio: ${record.hasAudio ? 'yes' : 'no'}
- Prompt mode: ${record.promptMode}

\`\`\`text
${record.prompt}
\`\`\`
`).join('\n');

  return header + body;
}

async function main() {
  await fs.ensureDir(phraseImageDir);
  await fs.ensureDir(dataDir);

  await fs.writeFile(path.join(phraseImageDir, '.gitkeep'), '');
  await fs.writeJson(path.join(dataDir, 'phrase-image-prompts.json'), records, { spaces: 2 });
  await fs.writeFile(path.join(dataDir, 'phrase-image-prompts.md'), markdownFor(records), 'utf8');
  await fs.writeJson(path.join(dataDir, 'phrase-image-prompts-audio.json'), records.filter(record => record.hasAudio), { spaces: 2 });
  await fs.writeFile(path.join(dataDir, 'phrase-image-prompts-audio.md'), markdownFor(records.filter(record => record.hasAudio)), 'utf8');
  await fs.writeFile(path.join(imageDir, 'README.md'), `# Phrase Images

Save manually generated phrase images in:

\`\`\`text
public/phrase-images/phrases/
\`\`\`

Use the phrase id as the filename:

\`\`\`text
ask-001.webp
clarify-001.webp
\`\`\`

Prompt bank:

\`\`\`text
data/phrase-image-prompts.md
data/phrase-image-prompts.json
data/phrase-image-prompts-audio.md
data/phrase-image-prompts-audio.json
\`\`\`

Recommended image style:
- Strict 16:9 wide landscape card
- Clean modern educational illustration
- Small English phrase overlay in the upper-left
- No Japanese text, speech bubbles, logos, or watermarks
- Do not let the cards drift into the same two-people-talking composition
- Two-panel layouts are allowed only when they clearly help the phrase; do not use them as the default
- Across every 10-card batch, mix camera angles and scene types: overhead/tabletop, hands-only, over-the-shoulder, one person in foreground, window/mirror/reflection view, walking scene, doorway/entryway, distant environmental shot, object-led memory cue, and close reaction shot
- Avoid repeating seated face-to-face conversations, cafe-table scenes, or side-by-side listening shots
- Vary people, age, hair, clothing, setting, props, body distance, camera angle, subject placement, and negative space
`, 'utf8');

  console.log(`Generated ${records.length} phrase image prompts.`);
  console.log(`Image folder: ${path.relative(rootDir, phraseImageDir)}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
