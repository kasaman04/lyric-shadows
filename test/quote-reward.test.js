const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('a completed drama playlist awards a random quote on its fifth round', () => {
  const storage = new Map([['lastDramaQuoteCardV1', 'saitama']]);
  const app = { className: '', innerHTML: '' };
  const progress = { textContent: '' };
  const status = { textContent: '' };
  const lastClip = {
    paused: false,
    pause() { this.paused = true; },
    closest() { return { classList: { remove() {} } }; },
  };
  const audioElements = [lastClip];
  const quoteAudioInstances = [];
  class QuoteAudio {
    constructor(src) { this.src = src; quoteAudioInstances.push(this); }
    play() { this.onplaying?.(); return Promise.resolve(); }
    pause() { this.paused = true; }
  }
  const context = vm.createContext({
    console,
    Audio: QuoteAudio,
    document: {
      addEventListener() {},
      getElementById(id) { return { app, dramaRoundProgress: progress, quoteAudioStatus: status }[id] || null; },
      querySelectorAll(selector) { return selector === '.drama-audio' ? audioElements : []; },
      querySelector() { return { scrollIntoView() {} }; },
    },
    localStorage: {
      getItem(key) { return storage.get(key) || null; },
      setItem(key, value) { storage.set(key, value); },
    },
    navigator: {},
    window: { scrollTo() {} },
  });
  const source = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8').replace(/\binit\(\);\s*$/, '');
  vm.runInContext(source, context);
  vm.runInContext("renderHome = () => { window.returnedToDrama = true; }", context);
  const cards = require('../public/manga-quote-cards.json');
  context.cards = cards.slice(0, 2);
  vm.runInContext("state.quoteCards = cards; state.currentDramaId = 'first-love'; state.currentEpisodeId = 'episode-1';", context);

  for (let round = 1; round <= 4; round += 1) {
    vm.runInContext('state.dramaPlaylistActive = true; state.dramaPlaylistIndex = 0; onDramaAudioEnded(document.querySelectorAll(\'.drama-audio\')[0]);', context);
    assert.equal(vm.runInContext("dramaRoundCount('first-love', 'episode-1')", context), round);
    assert.equal(vm.runInContext('state.view', context), 'home');
    assert.equal(progress.textContent, `次のカードまで ${round}/5周`);
  }

  vm.runInContext('state.dramaPlaylistActive = true; state.dramaPlaylistIndex = 0; onDramaAudioEnded(document.querySelectorAll(\'.drama-audio\')[0]);', context);
  assert.equal(vm.runInContext('state.view', context), 'dramaReward');
  assert.equal(vm.runInContext('state.dramaReward.id', context), 'thors');
  assert.match(app.innerHTML, /もう一度再生/);
  assert.match(app.innerHTML, /セリフに戻る/);
  assert.match(app.innerHTML, /YOU HAVE NO ENEMIES/);
  assert.equal(quoteAudioInstances[0].src, '/manga-quote-card-audio/02-thors.mp3');
  assert.equal(status.textContent, '音声を再生中');
  assert.equal(JSON.parse(storage.get('dramaEpisodeRoundsV1'))['first-love:episode-1'], 5);

  vm.runInContext('playQuoteCardAudio()', context);
  assert.equal(quoteAudioInstances.length, 2);
  assert.equal(quoteAudioInstances[0].paused, true);
  vm.runInContext('returnToDramaPhrases()', context);
  assert.equal(vm.runInContext('state.view', context), 'home');
  assert.equal(quoteAudioInstances[1].paused, true);
  assert.equal(context.window.returnedToDrama, true);
});
