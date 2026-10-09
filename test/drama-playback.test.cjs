const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture(count = 3) {
  const timers = new Map();
  let timerId = 0;
  const status = { textContent: '' };
  const context = vm.createContext({
    console, navigator: {}, window: {},
    setTimeout(fn) { timers.set(++timerId, fn); return timerId; },
    clearTimeout(id) { timers.delete(id); },
    document: {
      addEventListener() {},
      getElementById(id) { return id === 'dramaPlaybackStatus' ? status : null; },
      querySelectorAll(selector) { return selector === '.drama-audio' ? slots.map(slot => slot.audio).filter(Boolean) : []; },
    },
  });
  const audios = Array.from({ length: count }, () => ({
    paused: true, ended: false, error: null, currentTime: 0, playCalls: 0, loadCalls: 0,
    closest(selector) {
      if (selector === '.drama-audio-slot') return this.slot;
      return { classList: { toggle() {}, remove() {} }, querySelector() { return null; } };
    },
    setAttribute() {},
    pause() { this.paused = true; },
    load() { this.loadCalls++; this.error = null; this.ended = false; this.currentTime = 0; },
    play() {
      this.playCalls++;
      if (this.playImpl) return this.playImpl();
      if (this.error) return Promise.reject(Object.assign(new Error('Media source failed'), { name: 'NotSupportedError' }));
      this.paused = false;
      this.ended = false;
      context.audio = this;
      vm.runInContext('onDramaAudioPlay(audio)', context);
      return Promise.resolve();
    },
  }));
  const slots = audios.map((audio, index) => {
    const slot = {
      audio,
      dataset: { audioSrc: `/clip-${index}.mp3`, audioLabel: `Clip ${index}` },
      replaceChild(next, previous) {
        next.slot.audio = null;
        this.audio = next;
        next.slot = this;
        previous.slot = null;
      },
      appendChild(next) { this.audio = next; next.slot = this; },
    };
    audio.slot = slot;
    audio.src = slot.dataset.audioSrc;
    return slot;
  });
  Object.defineProperty(context, 'audios', { get() { return slots.map(slot => slot.audio); } });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8').replace(/\binit\(\);\s*$/, ''), context);
  return {
    get audios() { return slots.map(slot => slot.audio); }, status, timers,
    run(code) { return vm.runInContext(code, context); },
    retry() { const [id, fn] = timers.entries().next().value; timers.delete(id); fn(); },
    async settle() { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); },
  };
}

test('a failed clip is reloaded and the playlist continues with the next clip', async () => {
  const f = fixture();
  f.audios[0].playImpl = () => {
    f.audios[0].error = { code: 4 };
    return Promise.reject(new Error('Network failure'));
  };
  f.run('toggleDramaPlayAll()');
  await f.settle();
  assert.equal(f.timers.size, 1);
  delete f.audios[0].playImpl;
  f.retry();
  await f.settle();
  assert.equal(f.audios[0].loadCalls, 1);
  assert.equal(f.run('state.dramaPlaylistActive'), true);
  f.audios[0].ended = true;
  const shared = f.audios[0];
  f.run('onDramaAudioEnded(audios[0])');
  assert.equal(f.audios[1], shared);
  assert.equal(f.audios[1].playCalls, 3);
  assert.equal(f.audios[1].src, '/clip-1.mp3');
  assert.equal(f.run('state.dramaPlaylistIndex'), 1);
});

test('retries are bounded and a manual resume reloads the failed clip', async () => {
  const f = fixture();
  f.audios[0].playImpl = () => {
    f.audios[0].error = { code: 4 };
    return Promise.reject(new Error('Network failure'));
  };
  f.run('toggleDramaPlayAll()');
  await f.settle();
  f.retry();
  await f.settle();
  assert.equal(f.timers.size, 0);
  assert.equal(f.run('state.dramaPlaylistActive'), false);
  assert.match(f.status.textContent, /この音声から再開/);
  delete f.audios[0].playImpl;
  f.run('toggleDramaPlayAll()');
  await f.settle();
  assert.equal(f.audios[0].loadCalls, 2);
  assert.equal(f.run('state.dramaPlaylistActive'), true);
});

test('an old rejected play cannot cancel a newer pause/resume request', async () => {
  const f = fixture();
  let rejectOld;
  f.audios[0].playImpl = () => new Promise((resolve, reject) => { rejectOld = reject; });
  f.run('toggleDramaPlayAll(); toggleDramaPlayAll()');
  delete f.audios[0].playImpl;
  f.run('toggleDramaPlayAll()');
  rejectOld(Object.assign(new Error('Interrupted'), { name: 'AbortError' }));
  await f.settle();
  assert.equal(f.run('state.dramaPlaylistActive'), true);
  assert.equal(f.timers.size, 1); // Only the current playback watchdog remains.
});

test('a late media error schedules only one retry and stopping cancels it', () => {
  const f = fixture();
  f.run('toggleDramaPlayAll()');
  f.audios[0].error = { code: 2 };
  f.run('onDramaAudioError(audios[0]); onDramaAudioError(audios[0])');
  assert.equal(f.timers.size, 1);
  f.run('stopDramaAudio()');
  assert.equal(f.timers.size, 0);
  assert.equal(f.run('state.dramaPlaylistActive'), false);
});

test('an autoplay restriction stops without automatic retries', async () => {
  const f = fixture();
  f.audios[0].playImpl = () => Promise.reject(Object.assign(new Error('User gesture required'), { name: 'NotAllowedError' }));
  f.run('toggleDramaPlayAll()');
  await f.settle();
  assert.equal(f.timers.size, 0);
  assert.equal(f.run('state.dramaPlaylistActive'), false);
  assert.match(f.status.textContent, /まとめて再生/);
});

test('queued pause events from reloading do not stop the resumed playlist', () => {
  const f = fixture();
  f.run('toggleDramaPlayAll(); onDramaAudioPause(audios[0])');
  assert.equal(f.run('state.dramaPlaylistActive'), true);
  f.audios[0].paused = true;
  f.run('onDramaAudioPause(audios[0])');
  assert.equal(f.run('state.dramaPlaylistActive'), false);
});

test('clips 07, 08 and 09 reuse the user-started player and preserve each card source', () => {
  const f = fixture(9);
  f.run('playDramaAudioAt(6)');
  const shared = f.audios[6];
  for (const index of [7, 8]) {
    shared.ended = true;
    f.run(`onDramaAudioEnded(audios[${index - 1}])`);
    assert.equal(f.audios[index], shared);
    assert.equal(shared.src, `/clip-${index}.mp3`);
    assert.equal(f.audios[index - 1].src, `/clip-${index - 1}.mp3`);
  }
  assert.equal(f.run('state.dramaPlaylistActive'), true);
});

test('a play request stuck at zero without an error is reloaded', async () => {
  const f = fixture();
  f.audios[0].playImpl = () => new Promise(() => {});
  f.run('toggleDramaPlayAll()');
  f.retry(); // Twelve seconds with no progress, even though no error was emitted.
  assert.match(f.status.textContent, /再読み込み/);
  delete f.audios[0].playImpl;
  f.retry();
  await f.settle();
  assert.equal(f.audios[0].loadCalls, 1);
  assert.equal(f.run('state.dramaPlaylistActive'), true);
});

test('a player that resolves play but stops advancing also gets a bounded retry', async () => {
  const f = fixture();
  f.run('toggleDramaPlayAll()');
  await f.settle();
  f.retry();
  assert.match(f.status.textContent, /再読み込み/);
  f.retry();
  await f.settle();
  f.retry();
  assert.equal(f.run('state.dramaPlaylistActive'), false);
  assert.equal(f.timers.size, 0);
  assert.equal(f.audios[0].paused, true);
});

test('normal progress keeps the watchdog alive without reloading', () => {
  const f = fixture();
  f.run('toggleDramaPlayAll()');
  f.audios[0].currentTime = 1;
  f.retry();
  assert.equal(f.audios[0].loadCalls, 0);
  assert.equal(f.run('state.dramaPlaylistActive'), true);
  f.run('stopDramaAudio()');
  assert.equal(f.timers.size, 0);
});
