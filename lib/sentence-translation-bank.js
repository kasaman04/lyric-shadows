'use strict';
const crypto = require('node:crypto');
const phrases = require('../data/relative-conversation-phrases.json');
const guides = require('../public/phrase-expression-guides');
const keys = ['who','whose','which','that','what','when','where','why','how','whoever','whatever','whichever','whenever','wherever','however','by the time','whether','now that','once','so that','in case','as soon as','even though','unless','while','as'];
const TYPES = keys.map(key => ({key, count: phrases.filter(p => p.relativeType === key).length}));
const QUESTIONS = phrases.filter(p => keys.includes(p.relativeType)).map(p => {
  const line = p.lines[p.targetLineIndex];
  const cue = p.audioCues?.find(c => c.index === p.targetLineIndex);
  return {id: 'translation-' + p.id, mode: 'translation', type: p.relativeType,
    japanese: line[2], answer: p.phrase, explanation: guides[p.relativeType]?.note || p.usageNote,
    sentences: [], sentenceJapanese: [],
    solutionAudio: cue ? {url: p.audio, start: cue.start, end: cue.end, duration: cue.end - cue.start, cues: []} : null};
});
const byId = new Map(QUESTIONS.map(q => [q.id, q]));
function eligible(filter = 'all') {
  if (filter !== 'all' && !keys.includes(filter)) throw Object.assign(new Error('出題する表現を選び直してください。'), {status:400});
  return QUESTIONS.filter(q => filter === 'all' || q.type === filter);
}
function selectQuestion(filter = 'all', excluded = [], random = crypto.randomInt) {
  const pool = eligible(filter), fresh = pool.filter(q => !excluded.includes(q.id));
  return (fresh.length ? fresh : pool)[random(fresh.length || pool.length)];
}
function advanceHistory(history, question, filter, repeat = false) {
  let next = [...new Set(history)].filter(id => byId.has(id));
  if (!repeat && next.includes(question.id)) {
    const reset = new Set(eligible(filter).map(q => q.id));
    next = next.filter(id => !reset.has(id));
  }
  if (!next.includes(question.id)) next.push(question.id);
  return next;
}
module.exports = {TYPES, QUESTIONS, byId, selectQuestion, advanceHistory};
