const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const game = require('../lib/conversation-game');
const catalog = require('../data/conversation-game-questions.json');
const { createState, newPet, action, PetStore } = require('../lib/pet-store');
const { mountPetApi } = require('../lib/pet-api');
const { PetImages } = require('../lib/pet-image');
const now = Date.parse('2026-10-11T00:00:00Z');
const id = () => crypto.randomUUID();
function setup() { const s = createState(now); s.pets.push(newPet(now, 'fire')); game.start(s, { requestId: id() }, now); return s; }
function body(s, correct = true) {
  const round = s.conversationGame.round, item = round.questions[round.index];
  const q = catalog.find(q => q.id === item.id);
  const choice = item.order.findIndex(i => correct ? i === q.correct : i !== q.correct);
  return { roundId: round.id, questionId: q.id, choice, requestId: id() };
}
async function temporary(run) {
  const parent = path.resolve(__dirname, '../tmp'); await fs.mkdir(parent, { recursive: true });
  const dir = await fs.mkdtemp(path.join(parent, 'conversation-game-test-'));
  try { await run(dir); } finally {
    assert.ok(path.resolve(dir).startsWith(parent + path.sep));
    await fs.rm(dir, { recursive: true, force: true, maxRetries: 3 });
  }
}
test('ten correct replies buy exactly one real pet care, without consuming saved listening', () => {
  const s = setup(), pet = s.pets[0]; s.bankSeconds = 789;
  for (let n = 0; n < 9; n++) assert.equal(game.answer(s, body(s)).delta, 10);
  const care = { type: 'food', payment: 'coins', seconds: 300, petId: pet.id, requestId: id() };
  assert.equal(s.conversationGame.coins, 90);
  assert.throws(() => action(s, care, now + 3600000), /100コイン/);
  assert.equal(pet.stats.body, 0);
  game.answer(s, body(s)); assert.equal(s.conversationGame.coins, 100);
  assert.equal(game.view(s).round.finished, true); assert.equal(game.view(s).round.replies.length, 10);
  action(s, care, now + 3600000); action(s, care, now + 3600000);
  assert.equal(s.conversationGame.coins, 0); assert.equal(s.conversationGame.spent, 100);
  assert.equal(pet.stats.body, 1); assert.equal(pet.growthSeconds, 300);
  assert.equal(pet.lastFedAt, now + 3600000); assert.equal(s.bankSeconds, 789);
  const oldRound = s.conversationGame.round.id;
  game.start(s, { requestId: id() }, now); assert.notEqual(s.conversationGame.round.id, oldRound);
  assert.equal(s.conversationGame.coins, 0); assert.equal(s.conversationGame.earned, 100);
});
test('wrong replies debit three, never below zero; repeated choices and responses are idempotent', () => {
  const s = setup();
  const correct = body(s); game.answer(s, correct); game.answer(s, correct);
  assert.equal(s.conversationGame.coins, 10); assert.equal(s.conversationGame.round.index, 1);
  const wrong = body(s, false); assert.equal(game.answer(s, wrong).delta, -3);
  game.answer(s, wrong); game.answer(s, { ...wrong, requestId: id() });
  assert.equal(s.conversationGame.coins, 7); assert.equal(s.conversationGame.lost, 3);
  assert.throws(() => game.answer(s, { ...wrong, choice: body(s).choice }), /操作ID/);
  const untried = [0, 1, 2].find(i => i !== correct.choice);
  assert.throws(() => game.answer(s, { ...correct, choice: untried, requestId: id() }), /解答済み/);
  const changed = { ...body(s), roundId: id() }; assert.throws(() => game.answer(s, changed), /変わりました/);
  assert.throws(() => game.answer(s, { ...body(s), choice: '0' }), /選んで/);
  s.conversationGame.coins = 1;
  const item = s.conversationGame.round.questions[1];
  const remainingWrong = [0, 1, 2].find(i => i !== wrong.choice && i !== body(s).choice);
  assert.equal(game.answer(s, { ...wrong, requestId: id(), choice: remainingWrong }).delta, -1);
  assert.equal(s.conversationGame.coins, 0); assert.equal(item.attempts.length, 2);
});
test('a wrong answer forfeits this question reward, including zero balance, reloads and resubmissions', async () => temporary(async dir => {
  const device = 'first-try-reward-device';
  let store = new PetStore({ dir, clock: () => now });
  let s = await store.transact(device, (s, time) => game.start(s, { requestId: id() }, time));
  const wrong = body(s, false);
  s = await store.transact(device, s => game.answer(s, wrong));
  assert.equal(s.conversationGame.coins, 0);
  store = new PetStore({ dir, clock: () => now });
  s = await store.transact(device); const correct = body(s); let result;
  s = await store.transact(device, s => { result = game.answer(s, correct); });
  assert.equal(result.correct, true); assert.equal(result.delta, 0);
  assert.equal(s.conversationGame.round.index, 1); assert.equal(s.conversationGame.earned, 0);
  assert.ok(result.conversation.audio.length === 2);
  for (const requestId of [correct.requestId, id()]) {
    s = await store.transact(device, s => { result = game.answer(s, { ...correct, requestId }); });
    assert.equal(result.delta, 0); assert.equal(s.conversationGame.coins, 0);
  }
  s = await store.transact(device, s => game.answer(s, body(s)));
  assert.equal(s.conversationGame.coins, 10); assert.equal(s.conversationGame.round.earned, 10);
}));
test('one missed question in a ten-question round earns ninety minus the three-coin penalty', () => {
  const s = setup(); game.answer(s, body(s)); game.answer(s, body(s, false));
  const retry = game.answer(s, body(s)); assert.equal(retry.delta, 0);
  for (let n = 2; n < 10; n++) game.answer(s, body(s));
  const round = game.view(s).round;
  assert.equal(round.finished, true); assert.equal(round.earned, 90); assert.equal(round.lost, 3);
  assert.equal(s.conversationGame.coins, 87);
});
test('unfinished rounds resume, shuffled choices remain valid, and the server decides rewards', () => {
  const s = setup(), round = s.conversationGame.round.id;
  game.start(s, { requestId: id() }, now); assert.equal(s.conversationGame.round.id, round);
  assert.equal(new Set(s.conversationGame.round.questions.map(q => q.id)).size, 10);
  for (const q of s.conversationGame.round.questions) assert.deepEqual([...q.order].sort(), [0, 1, 2]);
  const wrong = { ...body(s, false), correct: true, delta: 1000 };
  assert.equal(game.answer(s, wrong).correct, false); assert.equal(s.conversationGame.coins, 0);
  const v = game.view(s); assert.equal(v.round.question.correct, undefined);
  assert.equal(v.round.question.attempts.length, 1);
  const retry = JSON.parse(JSON.stringify(s)); game.start(retry, { requestId: id() }, now);
  assert.equal(retry.conversationGame.round.id, round); assert.deepEqual(game.view(retry), v);
});
test('invalid coin care never spends currency; legacy time care still works', () => {
  const s = setup(), pet = s.pets[0]; s.conversationGame.coins = 100; s.bankSeconds = 300;
  for (const extra of [{ seconds: 1800 }, { type: 'unknown' }, { payment: 'invalid' }, { petId: id() }]) {
    const before = JSON.stringify(s);
    assert.throws(() => action(s, { type: 'power', seconds: 300, payment: 'coins', petId: pet.id, requestId: id(), ...extra }, now));
    assert.equal(JSON.stringify(s), before);
  }
  action(s, { type: 'brain', petId: pet.id, requestId: id() }, now);
  assert.equal(pet.stats.brain, 1); assert.equal(s.bankSeconds, 0); assert.equal(s.conversationGame.coins, 100);
});
test('disk transactions serialize repeated answers and competing purchases and survive reopening', async () => temporary(async dir => {
  const store = new PetStore({ dir, clock: () => now }), device = 'conversation-test-device';
  let s = await store.transact(device, (s, time) => { s.pets.push(newPet(time, 'fire')); game.start(s, { requestId: id() }, time); });
  const reply = body(s);
  await Promise.all([1, 2, 3].map(() => store.transact(device, s => game.answer(s, reply))));
  s = await store.transact(device); assert.equal(s.conversationGame.coins, 10); assert.equal(s.conversationGame.round.index, 1);
  for (let n = 1; n < 10; n++) { const b = body(s); s = await store.transact(device, s => game.answer(s, b)); }
  const results = await Promise.allSettled([1, 2].map(() => store.transact(device, s => action(s, { type: 'power', payment: 'coins', petId: s.pets[0].id, requestId: id() }, now))));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  s = await new PetStore({ dir, clock: () => now }).transact(device);
  assert.equal(s.conversationGame.coins, 0); assert.equal(s.pets[0].stats.power, 1);
}));
test('challenge HTTP API persists rounds, rejects foreign origins and accepts real coin care', async () => temporary(async dir => {
  const store = new PetStore({ dir, clock: () => now }), device = 'challenge-http-device';
  const app = express(); app.use(express.json());
  const api = mountPetApi(app, { store, images: new PetImages({ dir: path.join(dir, 'images') }), designer: { status: 'unavailable', connect: async () => {} } });
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const base = 'http://127.0.0.1:' + server.address().port + '/api/pet/' + device;
  const post = (suffix, body, origin) => fetch(base + suffix, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) }, body: JSON.stringify(body) });
  try {
    assert.equal((await post('/challenge/start', { requestId: id() }, 'https://unrelated.test')).status, 403);
    assert.equal((await post('/challenge/start', { requestId: 'bad' })).status, 400);
    let packet = await (await post('/challenge/start', { requestId: id() })).json();
    assert.equal(packet.challenge.round.count, 10);
    for (let n = 0; n < 10; n++) {
      const b = body(packet.state); const response = await post('/challenge/answer', b); assert.equal(response.status, 200);
      packet = await response.json(); assert.equal(packet.result.delta, 10);
    }
    const saved = await (await fetch(base + '/challenge')).json(); assert.equal(saved.challenge.coins, 100); assert.equal(saved.challenge.round.finished, true);
    let petState = await (await post('/care', { type: 'select', element: 'fire', requestId: id() })).json();
    petState = await (await post('/care', { type: 'brain', payment: 'coins', petId: petState.pets[0].id, requestId: id() })).json();
    assert.equal(petState.conversationGame.coins, 0); assert.equal(petState.pets[0].stats.brain, 1);
    packet = await (await post('/challenge/start', { requestId: id() })).json();
    packet = await (await post('/challenge/answer', body(packet.state))).json();
    packet = await (await post('/challenge/answer', body(packet.state, false))).json();
    assert.equal(packet.challenge.coins, 7);
    packet = await (await fetch(base + '/challenge')).json();
    packet = await (await post('/challenge/answer', body(packet.state))).json();
    assert.equal(packet.result.correct, true); assert.equal(packet.result.delta, 0);
    assert.equal(packet.challenge.coins, 7); assert.equal(packet.challenge.round.index, 2);
  } finally { await api.idle(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}));
test('all ten scenes use existing images and all thirty speech clips are present', async () => {
  assert.equal(catalog.length, 10);
  for (const q of catalog) {
    assert.equal(q.clips.length, 3); assert.ok(q.options[q.correct].en);
    for (const asset of [q.image, ...q.clips]) assert.ok((await fs.stat(path.join(__dirname, '../public', asset))).size > 1000, asset);
  }
});
