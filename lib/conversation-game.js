'use strict';
const crypto = require('node:crypto');
const catalog = require('../data/conversation-game-questions.json');
const byId = new Map(catalog.map(question => [question.id, question]));
const RULES = Object.freeze({ correct: 10, wrong: 3, careCost: 100, roundSize: 10 });
const fail = (message, status = 400) => Object.assign(new Error(message), { status });
function wallet(state) {
  return state.conversationGame ||= { coins: 0, earned: 0, lost: 0, spent: 0, round: null };
}
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
function validateRequest(body) {
  if (!/^[a-zA-Z0-9-]{12,80}$/.test(body?.requestId || '')) throw fail('操作IDが必要です。');
}
function start(state, body, now) {
  validateRequest(body);
  const game = wallet(state);
  if (game.round && (game.round.index < game.round.questions.length || game.round.requestId === body.requestId)) return;
  game.round = {
    id: crypto.randomUUID(), requestId: body.requestId, startedAt: now, index: 0, earned: 0, lost: 0,
    questions: shuffle(catalog).slice(0, RULES.roundSize).map(q => ({ id: q.id, order: shuffle(q.options.map((_, i) => i)), attempts: [] }))
  };
}
function questionView(item) {
  const q = byId.get(item.id);
  return { id: q.id, category: q.category, place: q.place, title: q.title, image: q.image, imageAlt: q.alt,
    question: q.question, questionJa: q.questionJa, audio: q.clips[0],
    options: item.order.map(i => ({ en: q.options[i].en, ja: q.options[i].ja })),
    attempts: item.attempts.map(a => ({ choice: a.choice, delta: a.delta, feedback: a.feedback })) };
}
function view(state) {
  const game = wallet(state), round = game.round;
  return { coins: game.coins, rules: RULES, round: round ? { id: round.id, index: round.index, count: round.questions.length,
    finished: round.index >= round.questions.length, earned: round.earned, lost: round.lost,
    question: round.index < round.questions.length ? questionView(round.questions[round.index]) : null,
    replies: round.index >= round.questions.length ? round.questions.map(item => { const q = byId.get(item.id); return { en: q.options[q.correct].en, ja: q.options[q.correct].ja }; }) : [] } : null };
}
function answer(state, body) {
  validateRequest(body);
  const game = wallet(state), round = game.round;
  if (!round || body.roundId !== round.id) throw fail('チャレンジが変わりました。もう一度開いてください。', 409);
  const item = round.questions.find(q => q.id === body.questionId);
  if (!item || !Number.isInteger(body.choice) || body.choice < 0 || body.choice >= item.order.length) throw fail('返答を選んでください。');
  const previous = item.attempts.find(a => a.requestId === body.requestId || a.choice === body.choice);
  if (previous) {
    if (previous.requestId === body.requestId && previous.choice !== body.choice) throw fail('操作IDが重複しています。もう一度選んでください。');
    return { ...previous, questionId: item.id };
  }
  if (round.questions[round.index] !== item || item.attempts.some(a => a.correct)) throw fail('この問題は解答済みです。次のシーンへ進んでください。', 409);
  const q = byId.get(item.id), option = q.options[item.order[body.choice]], correct = item.order[body.choice] === q.correct;
  const delta = correct ? RULES.correct : game.coins > 0 ? -Math.min(RULES.wrong, game.coins) : 0;
  const result = { requestId: body.requestId, choice: body.choice, correct, delta, feedback: correct ? q.note : option.feedback };
  if (correct) { game.earned += delta; round.earned += delta; round.index++; result.conversation = { reply: option.en, replyJa: option.ja, response: q.continuation, responseJa: q.continuationJa, audio: q.clips.slice(1) }; }
  else { game.lost -= delta; round.lost -= delta; }
  game.coins += delta;
  item.attempts.push(result);
  return { ...result, questionId: q.id };
}
module.exports = { RULES, wallet, start, view, answer };
