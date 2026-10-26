'use strict';
const crypto = require('node:crypto');
const TYPES = [
  ['who','人を説明する','basic'], ['whom','動作の相手になる人','basic'], ['whose','誰の・何のものか','basic'], ['which','物・動物を説明する','basic'], ['that','人・物を特定する','basic'], ['what','〜するもの・こと','basic'],
  ['when','時間・日を説明する','basic'], ['where','場所を説明する','basic'], ['why','理由を説明する','basic'], ['how','方法を説明する','basic'],
  ['whoever','〜する人は誰でも','advanced'], ['whomever','〜する相手は誰でも','advanced'], ['whatever','〜するものは何でも','advanced'], ['whichever','候補のどれでも','advanced'], ['whenever','〜するときはいつでも','advanced'], ['wherever','〜する場所ならどこでも','advanced'], ['however','どんな方法でも・どんなに〜でも','advanced']
].map(([key,label,level]) => ({key,label,level}));
const QUESTIONS = require("../data/sentence-game-questions.json");
function eligibleQuestions(filter = 'all') {
  if (!['all','basic','advanced',...TYPES.map(t=>t.key)].includes(filter)) throw Object.assign(new Error('出題する表現を選び直してください。'),{status:400});
  return QUESTIONS.filter(q => filter==='all'||q.type===filter||TYPES.find(t=>t.key===q.type).level===filter);
}
function selectQuestion(filter = 'all', excluded = [], random = crypto.randomInt) {
  const eligible = eligibleQuestions(filter);
  const fresh = eligible.filter(q=>!excluded.includes(q.id)); const pool = fresh.length ? fresh : eligible;
  return pool[random(pool.length)];
}
function advanceHistory(history,question,filter,repeat=false){
  const known=new Set(QUESTIONS.map(q=>q.id));
  let next=[...new Set(history)].filter(id=>known.has(id));
  if(!repeat&&next.includes(question.id)){
    const reset=new Set(eligibleQuestions(filter).map(q=>q.id));
    next=next.filter(id=>!reset.has(id));
  }
  if(!next.includes(question.id))next.push(question.id);
  return next;
}
module.exports = { TYPES, QUESTIONS, selectQuestion, eligibleQuestions, advanceHistory };
