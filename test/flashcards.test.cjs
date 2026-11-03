'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cards = require('../public/flashcards-model.js');

function storage() {
  const values = new Map();
  return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)) };
}

test('all 20 cards have unique IDs, usable text and a WebP illustration', () => {
  assert.equal(new Set(cards.deck.cards.map(c => c.id)).size, 20);
  for (const card of cards.deck.cards) {
    assert.ok(card.english && card.japanese && card.alt && card.pattern && card.hint);
    const file = fs.readFileSync(path.join(__dirname, '../public', card.image));
    assert.equal(file.subarray(0, 4).toString(), 'RIFF', card.id);
    assert.equal(file.subarray(8, 12).toString(), 'WEBP', card.id);
  }
});

test('again requeues a card, remember removes it and progress survives reentry', () => {
  const store = storage();
  let progress = cards.read(store);
  const first = cards.current(progress).id;
  progress = cards.rate(progress, false);
  assert.equal(progress.queue.at(-1), first);
  assert.notEqual(cards.current(progress).id, first);
  assert.equal(progress.learned.length, 0);
  const second = cards.current(progress).id;
  progress = cards.rate(progress, true);
  assert.ok(cards.save(store, progress));
  progress = cards.read(store);
  assert.deepEqual(progress.learned, [second]);
  assert.ok(!progress.queue.includes(second));
  assert.equal(progress.queue.at(-1), first);
  assert.match(cards.entry(store), /覚えた 1 \/ 20枚/);
  while (progress.queue.length > 1) progress = cards.rate(progress, true);
  assert.equal(cards.current(progress).id, first);
  progress = cards.rate(progress, true);
  assert.equal(cards.current(progress), null);
  assert.equal(progress.learned.length, 20);
});

test('progress separates device identities and tolerates invalid saves', () => {
  const store = storage();
  store.setItem('phraseDeviceId', 'first-device-1234');
  cards.save(store, cards.rate(cards.fresh(), true));
  store.setItem('phraseDeviceId', 'other-device-4321');
  assert.equal(cards.read(store).learned.length, 0);
  store.setItem(cards.key(store), '{broken');
  assert.equal(cards.read(store).queue.length, 20);
  const recovered = cards.normalize({ version: 1, queue: ['go-see', 'go-see', 'bad'], cursor: 100, learned: ['go-get', 'go-get'] });
  assert.equal(recovered.cursor, 0);
  assert.equal(recovered.queue.length, 19);
  assert.equal(recovered.queue[0], 'go-see');
  assert.deepEqual(recovered.learned, ['go-get']);
  assert.equal(cards.save(null, recovered), false);
});
