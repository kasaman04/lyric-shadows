'use strict';
const crypto = require('node:crypto');
const phrases = require('../data/relative-conversation-phrases.json');
const lessons = require('../data/sentence-translation-lessons.json').lessons;
const keys = ['who','whose','which','that','what','when','where','why','how','whoever','whatever','whichever','whenever','wherever','however','by the time','whether','now that','once','so that','in case','as soon as','even though','unless','while','as'];
const TYPES = keys.map(key => ({key, count: phrases.filter(p => p.relativeType === key).length}));
const QUESTIONS = phrases.filter(p => keys.includes(p.relativeType)).map(p => {
  const line = p.lines[p.targetLineIndex];
  const cue = p.audioCues?.find(c => c.index === p.targetLineIndex);
  const lesson = lessons['translation-' + p.id];
  if (!lesson) throw new Error('Missing prepared translation lesson: ' + p.id);
  return {id: 'translation-' + p.id, mode: 'translation', type: p.relativeType,
    japanese: line[2], answer: lesson.answer, acceptedAnswers: lesson.acceptedAnswers, explanation: lesson.explanation, examples: lesson.examples,
    sentences: [], sentenceJapanese: [],
    solutionAudio: cue && lesson.answer === p.phrase ? {url: p.audio, start: cue.start, end: cue.end, duration: cue.end - cue.start, cues: []} : null};
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
