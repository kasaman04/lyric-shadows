(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./flashcards-data.js'));
  else root.IllustratedFlashcards = factory(root.ILLUSTRATED_FLASHCARD_DECK);
})(typeof window === 'object' ? window : globalThis, function (deck) {
  'use strict';
  const ids = deck.cards.map(card => card.id);
  const validIds = new Set(ids);
  const uniqueIds = values => Array.isArray(values) ? [...new Set(values.filter(id => validIds.has(id)))] : [];
  function fresh() { return { version: 1, queue: [...ids], cursor: 0, learned: [], started: false }; }
  function normalize(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.queue) || !Array.isArray(value.learned)) return fresh();
    const learned = uniqueIds(value.learned);
    const queue = uniqueIds(value.queue).filter(id => !learned.includes(id));
    // A partial/corrupt save must not silently discard cards from the deck.
    for (const id of ids) if (!learned.includes(id) && !queue.includes(id)) queue.push(id);
    const cursor = Number.isInteger(value.cursor) && value.cursor >= 0 && value.cursor < queue.length ? value.cursor : 0;
    return { version: 1, queue, cursor, learned, started: value.started === true };
  }
  function key(storage) {
    let device = '';
    try { device = storage.getItem('phraseDeviceId') || ''; } catch {}
    return 'illustratedFlashcardsV1:' + deck.id + ':' + (/^[a-z0-9-]{12,80}$/i.test(device) ? device : 'local');
  }
  function read(storage) {
    try { return normalize(JSON.parse(storage.getItem(key(storage)) || 'null')); } catch { return fresh(); }
  }
  function save(storage, progress) {
    try { storage.setItem(key(storage), JSON.stringify(normalize(progress))); return true; } catch { return false; }
  }
  function current(progress) { return deck.cards.find(card => card.id === progress.queue[progress.cursor]) || null; }
  function move(progress, delta) {
    if (!progress.queue.length) return progress;
    return { ...progress, cursor: Math.max(0, Math.min(progress.queue.length - 1, progress.cursor + delta)), started: true };
  }
  function rate(progress, remembered) {
    const p = normalize(progress);
    const id = p.queue.splice(p.cursor, 1)[0];
    if (!id) return p;
    if (remembered) p.learned.push(id);
    else p.queue.push(id);
    if (p.cursor >= p.queue.length) p.cursor = 0;
    p.started = true;
    return p;
  }
  function entry(storage) {
    if (!storage) { try { storage = globalThis.localStorage; } catch {} }
    const p = read(storage), done = p.learned.length === ids.length;
    const action = done ? 'もう一度復習' : p.started ? '続きから' : 'はじめる';
    return `<a class="home-flashcard-entry" href="/flashcards.html" aria-label="イラスト暗記カードを${action}">
      <img class="flashcard-entry-image" src="/flashcard-images/help-carry.webp" alt="二人で大きな箱を運ぶイラスト" width="160" height="120" loading="lazy">
      <span class="flashcard-entry-copy"><strong>イラスト暗記カード</strong><span>イラストを見て、英語を思い出そう</span><small>${deck.title} · 覚えた ${p.learned.length} / ${ids.length}枚</small><b>${action} <span aria-hidden="true">→</span></b></span>
    </a>`;
  }
  return Object.freeze({ deck, fresh, normalize, key, read, save, current, move, rate, entry });
});
