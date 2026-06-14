const fs = require('fs-extra');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

const sourceFiles = [
  'public/phrases.js',
  'public/real-phrases.js',
  'public/extra-phrases.js',
  'public/more-phrases.js',
  'public/first-meeting-phrases.js',
  'public/get-to-know-phrases.js'
];

function normalizeEnglish(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadPhrases() {
  global.window = {};

  const sourceCounts = [];
  let previousCount = 0;

  for (const relativePath of sourceFiles) {
    require(path.join(rootDir, relativePath));
    const phrases = window.CONVERSATION_PHRASES || [];
    const added = phrases.slice(previousCount);
    for (const phrase of added) {
      phrase.__sourceFile = relativePath;
    }
    sourceCounts.push({ path: relativePath, count: phrases.length - previousCount });
    previousCount = phrases.length;
  }

  return {
    phrases: window.CONVERSATION_PHRASES || [],
    sourceCounts
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getPack(phrase) {
  return phrase.pack || '基本';
}

function getPackDisplayName(pack) {
  const displayNames = {
    '基本': '基本会話',
    '相手を知る質問': '相手を知る会話'
  };
  return displayNames[pack] || pack;
}

function buildTemplate(phrase, order) {
  const pack = getPack(phrase);
  const theme = `${getPackDisplayName(pack)} / ${phrase.category}`;
  const lines = phrase.lines.map(([speaker, english, japanese], index) => ({
    index,
    speaker,
    english,
    japanese,
    normalizedEnglish: normalizeEnglish(english)
  }));

  const normalizedPhrase = normalizeEnglish(phrase.phrase);
  const primaryLineIndexes = lines
    .filter(line => line.normalizedEnglish === normalizedPhrase)
    .map(line => line.index);
  const userStartLineIndexes = primaryLineIndexes.length > 0 ? primaryLineIndexes : [0];
  const acceptedStartPhrases = unique([
    phrase.phrase,
    ...userStartLineIndexes.map(index => lines[index]?.english)
  ]);

  return {
    id: phrase.id,
    order,
    sourceFile: phrase.__sourceFile || null,
    pack,
    theme,
    category: phrase.category,
    phrase: phrase.phrase,
    usageNote: phrase.usageNote,
    audioPath: phrase.audio || null,
    imagePath: `/phrase-images/phrases/${phrase.id}.webp`,
    conversationText: lines.map(line => `${line.speaker}: ${line.english}`).join('\n'),
    lines,
    practice: {
      modes: ['ai_start', 'user_start', 'shadowing', 'walk', 'drive'],
      primaryLineIndexes,
      userStartLineIndexes,
      acceptedStartPhrases,
      aiStart: {
        assistantStartsAtLineIndex: 0,
        expectedUserLineIndex: lines.length > 1 ? 1 : null
      },
      userStart: {
        matchAgainstLineIndexes: lines.map(line => line.index),
        preferredStartLineIndexes: userStartLineIndexes
      },
      shadowing: {
        lineIndexes: lines.map(line => line.index)
      }
    }
  };
}

function buildMarkdown(document) {
  const header = [
    '# Conversation Practice Templates',
    '',
    'This file is optimized as ChatGPT GPT Knowledge for mobile voice conversation practice.',
    '',
    `Generated at: ${document.generatedAt}`,
    `Total conversations: ${document.totalConversations}`,
    '',
    'Practice modes:',
    '- AI start: the assistant starts with line 1 and the learner replies with the next line.',
    '- User start: the learner says a phrase from one template and the assistant replies with the next matching line.',
    '- Shadowing: the assistant reads the full template for repeat-after-me practice.',
    '- Walk mode: hands-free speaking practice with short prompts and no screen dependency.',
    '- Drive mode: listening and shadowing focused, with minimal interaction.',
    '',
    'Use exact template lines by default. If the learner says a close paraphrase, accept it and continue.',
    'Themes are written as "Pack / Category", for example "基本会話 / 相槌".',
    ''
  ].join('\n');

  const body = document.conversationTemplates.map(template => {
    const lines = template.lines
      .map(line => `${line.speaker}: ${line.english}\n${line.speaker} JA: ${line.japanese}`)
      .join('\n');

    return [
      `## ${template.id} - ${template.phrase}`,
      '',
      `Pack: ${template.pack}`,
      `Theme: ${template.theme}`,
      `Category: ${template.category}`,
      `Usage: ${template.usageNote}`,
      `Source: ${template.sourceFile}`,
      `Primary phrase line indexes: ${template.practice.primaryLineIndexes.join(', ') || 'none'}`,
      `User-start triggers: ${template.practice.acceptedStartPhrases.join(' | ')}`,
      '',
      'Conversation:',
      lines,
      ''
    ].join('\n');
  }).join('\n');

  return `${header}\n${body}`;
}

function buildIndexMarkdown(document) {
  const byTheme = new Map();
  for (const template of document.conversationTemplates) {
    if (!byTheme.has(template.theme)) byTheme.set(template.theme, []);
    byTheme.get(template.theme).push(template);
  }

  const themeSummary = [...byTheme.entries()].map(([theme, templates]) =>
    `- ${theme}: ${templates.length} templates`
  ).join('\n');

  const sections = [...byTheme.entries()].map(([theme, templates]) => {
    const rows = templates.map(template =>
      `- ${template.id} | ${template.phrase} | Category: ${template.category} | Source: ${template.sourceFile}`
    ).join('\n');

    return [
      `## Theme: ${theme}`,
      '',
      rows,
      ''
    ].join('\n');
  }).join('\n');

  return [
    '# Conversation Practice Template Index',
    '',
    'Use this compact index to find matching template IDs by Theme, Pack, Category, phrase, or source file.',
    'After selecting an ID from this index, use conversation-practice-templates.md for the exact 3-line Conversation.',
    '',
    `Generated at: ${document.generatedAt}`,
    `Total conversations: ${document.totalConversations}`,
    `Total themes: ${byTheme.size}`,
    '',
    'Theme summary:',
    themeSummary,
    '',
    sections
  ].join('\n');
}

function buildInstructions() {
  return [
    '# My GPT Instructions: Strict Template-Locked English Conversation Practice',
    '',
    'You are a hands-free English conversation practice partner for a Japanese learner.',
    'Your job is to practice fixed English conversation templates by voice on a smartphone.',
    '',
    'ABSOLUTE PRIORITY:',
    '- This GPT is not a free conversation bot.',
    '- The only English roleplay lines you may speak are exact lines from a selected template.',
    '- Never invent a new English sentence, scenario, reply, example, or continuation during roleplay.',
    '- If you cannot find a matching template, stop and ask for a theme, template ID, phrase, or the pasted app copy text.',
    '',
    'Knowledge files:',
    '- conversation-practice-template-index.md: compact lookup by Theme, Pack, Category, phrase, and ID.',
    '- conversation-practice-templates.md: full source of truth with exact template lines.',
    '- Use the index to choose candidate IDs. Use the full template file to read exact Conversation lines.',
    '',
    'Retrieval rules:',
    '- Before starting any practice request, identify the active source.',
    '- If the learner pasted a "今日のランダム15個" list from the app, that pasted list becomes the active source. Use only those 15 templates until the learner changes the source.',
    '- If the learner says "今日の15個" but has not pasted the app copy text, say: "アプリの「15をコピー」を押して、その内容をここに貼ってください。"',
    '- If the learner specifies a theme such as "基本会話 / 相槌", search the uploaded index for that exact Theme first. Use only IDs under that Theme.',
    '- If the exact Theme is not found, search by Category, Pack, phrase, and ID.',
    '- After choosing a template ID from the index, retrieve the matching section in conversation-practice-templates.md and use its exact Conversation lines.',
    '- If no matching template can be found, say only: "そのテンプレが見つかりません。テーマ名、ID、フレーズ、またはアプリのコピー内容を貼ってください。"',
    '- Do not start practice until a template ID and its exact Conversation lines are available.',
    '',
    'Template lock:',
    '- Every active template has exactly three Conversation lines, usually A/B/A.',
    '- Store the selected template ID, Theme, phrase, and the 3 exact English Conversation lines as the current session state.',
    '- During roleplay, speak only the next exact English line from the current template.',
    '- Do not paraphrase template lines.',
    '- Do not translate template lines into different English.',
    '- Do not add extra English before or after a template line.',
    '- Japanese is allowed only for short operation messages, hints, or error messages.',
    '',
    'Core behavior:',
    '- Practice the same fixed template exchanges from the knowledge file.',
    '- Keep voice responses short. Do not explain unless the learner asks.',
    '- Track the current template and the current line index within the conversation.',
    '- Use English for the roleplay lines. Use Japanese only for brief hints, confirmations, or explanations.',
    '- If the learner says a line close enough to the expected template line, accept it and continue.',
    '- If the learner gets stuck, give one short hint in Japanese, then repeat the cue.',
    '',
    'Modes:',
    '1. AI start mode: choose a template from the active source, speak exact line 0, wait for the learner to say line 1, then speak exact line 2.',
    '2. User start mode: when the learner starts with an English line, match it to phrase, acceptedStartPhrases, or any exact Conversation line. Then speak only the next exact line in that template.',
    '3. Shadowing mode: read the full 3-line template one exact line at a time and ask the learner to repeat after each line.',
    '4. Walk mode: choose templates from the active source, keep prompts short, avoid asking the learner to look at the screen.',
    '5. Drive mode: prioritize listening and shadowing. Use only simple voice commands such as "next", "again", and "stop". Do not ask the learner to look at or operate the phone.',
    '',
    'Matching rules for user start mode:',
    '- First try to match the learner utterance against phrase, acceptedStartPhrases, and all template line English values.',
    '- Ignore case, punctuation, and small filler differences.',
    '- If multiple templates match, choose the one with the closest exact phrase match.',
    '- If no confident match exists, ask the learner to repeat once or say a nearby phrase.',
    '- Never answer the learner with a natural free-form reply. Answer only with the next exact template line.',
    '',
    'Feedback rules:',
    '- During roleplay, correct only enough to keep the exchange moving.',
    '- After a template finishes, optionally give one concise note: "Good", "Try this pronunciation", or "More natural: ...".',
    '- Do not turn every line into a grammar lesson.',
    '',
    'Reference test behavior:',
    '- If the learner says "参照テスト", do not roleplay.',
    '- For a reference test, return only: ID, Theme, Phrase, and the exact three Conversation lines from the uploaded knowledge.',
    '- If you cannot return those fields from the uploaded knowledge, report retrieval failure instead of guessing.',
    '',
    'Start prompt:',
    'If the learner has not specified a mode, ask briefly in Japanese: "モードは？AIスタート、自分スタート、シャドーイング、散歩、ドライブ。" If the learner answers in Japanese, map it to the closest mode.'
  ].join('\n');
}

async function main() {
  const { phrases, sourceCounts } = loadPhrases();
  const templates = phrases.map((phrase, index) => buildTemplate(phrase, index + 1));
  const ids = templates.map(template => template.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

  const document = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: {
      project: 'lyric-shadows',
      files: sourceCounts
    },
    totalConversations: templates.length,
    validation: {
      duplicateIds: unique(duplicateIds),
      nonThreeLineTemplateIds: templates
        .filter(template => template.lines.length !== 3)
        .map(template => template.id)
    },
    practiceDesign: {
      target: 'ChatGPT mobile voice first, future app compatible',
      modes: ['ai_start', 'user_start', 'shadowing', 'walk', 'drive'],
      notes: [
        'Google Drive is the storage location.',
        'Upload the Markdown file to My GPT Knowledge for the most retrieval-friendly prototype.',
        'Use the JSON file for future app implementation.'
      ]
    },
    conversationTemplates: templates
  };

  await fs.ensureDir(dataDir);
  await fs.writeJson(path.join(dataDir, 'conversation-practice-templates.json'), document, { spaces: 2 });
  await fs.writeFile(path.join(dataDir, 'conversation-practice-templates.md'), buildMarkdown(document), 'utf8');
  await fs.writeFile(path.join(dataDir, 'conversation-practice-template-index.md'), buildIndexMarkdown(document), 'utf8');
  await fs.writeFile(path.join(dataDir, 'my-gpt-conversation-practice-instructions.md'), buildInstructions(), 'utf8');

  console.log(JSON.stringify({
    totalConversations: document.totalConversations,
    sourceCounts,
    duplicateIds: document.validation.duplicateIds,
    nonThreeLineTemplateIds: document.validation.nonThreeLineTemplateIds,
    files: [
      'data/conversation-practice-templates.json',
      'data/conversation-practice-template-index.md',
      'data/conversation-practice-templates.md',
      'data/my-gpt-conversation-practice-instructions.md'
    ]
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
