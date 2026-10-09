const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

function fixture(starts = [0, 3, 6]) {
  const timers = new Map(); let timerId = 0;
  const status = { textContent: '' }, current = { textContent: '' };
  const cards = starts.map(() => ({ classList: { toggle() {}, remove() {} }, querySelector() { return { scrollIntoView() {} }; } }));
  const clips = cards.map(card => ({ paused: true, loop: false, currentTime: 0, pause() { this.paused = true; }, play() { this.paused = false; return Promise.resolve(); }, closest() { return card; } }));
  const audio = {
    paused: true, ended: false, error: null, currentTime: 0, readyState: 4,
    src: '/episode.mp3', playCalls: 0, loadCalls: 0,
    pause() { this.paused = true; },
    load() { this.loadCalls++; this.error = null; this.readyState = 0; this.currentTime = 0; this.ended = false; },
    play() {
      this.playCalls++; this.paused = false; this.ended = false;
      run('onDramaPlaylistPlay(audio)');
      return this.playImpl ? this.playImpl() : Promise.resolve();
    },
  };
  const context = vm.createContext({
    console, navigator: {}, audio, clips,
    window: { DRAMA_PLAYBACK: { 'first-love:episode-1': { audio: '/episode.mp3', starts, duration: starts.at(-1) + 3 } } },
    setTimeout(fn) { timers.set(++timerId, fn); return timerId; }, clearTimeout(id) { timers.delete(id); },
    document: {
      addEventListener() {},
      getElementById(id) { return { dramaEpisodeAudio: audio, dramaPlaybackStatus: status, dramaCurrentClip: current }[id] || null; },
      querySelectorAll(selector) { return { '.drama-audio': clips, '.drama-clip': cards }[selector] || []; },
    },
  });
  for (const file of ['public/drama-player.js', 'public/app.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8').replace(/\binit\(\);\s*$/, ''), context);
  function run(code) { return vm.runInContext(code, context); }
  run("state.currentDramaId='first-love';state.currentEpisodeId='episode-1';completeDramaRound=()=>{window.rounds=(window.rounds||0)+1;return false;};");
  return {
    audio, clips, timers, status, current, run,
    tick() { const [id, fn] = timers.entries().next().value; timers.delete(id); fn(); },
    async settle() { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); },
    metadata() { audio.readyState = 4; run('onDramaPlaylistLoaded(audio)'); },
  };
}

test('all 74 card boundaries including 07 to 08 to 09 never restart or reload audio', () => {
  const f = fixture(Array.from({ length: 74 }, (_, i) => i * 3));
  f.run('toggleDramaPlayAll()');
  for (let i = 0; i < 74; i++) {
    f.audio.currentTime = i * 3 + 0.25; f.run('onDramaPlaylistTime(audio)');
    assert.equal(f.run('state.dramaPlaylistIndex'), i);
  }
  assert.equal(f.audio.playCalls, 1); assert.equal(f.audio.loadCalls, 0);
  assert.equal(f.audio.src, '/episode.mp3'); assert.equal(f.current.textContent, '音声 74 / 74');
});

test('pause and resume keep the exact position within a clip', () => {
  const f = fixture(); f.run('toggleDramaPlayAll()'); f.audio.currentTime = 4.5;
  f.run('onDramaPlaylistTime(audio);toggleDramaPlayAll();onDramaPlaylistPause(audio);toggleDramaPlayAll()');
  assert.equal(f.audio.currentTime, 4.5); assert.equal(f.run('state.dramaPlaylistIndex'), 1);
  assert.equal(f.audio.loadCalls, 0);
});

test('a stalled pending play reloads and resumes the saved position after metadata', async () => {
  const f = fixture(); f.audio.playImpl = () => new Promise(() => {});
  f.run('playDramaAudioAt(1,true)'); f.tick(); assert.match(f.status.textContent, /再読み込み/);
  f.run('onDramaPlaylistPause(audio)'); assert.equal(f.run('state.dramaPlaylistActive'), true);
  delete f.audio.playImpl; f.tick(); assert.equal(f.audio.loadCalls, 1);
  assert.equal(f.run('state.dramaResumeTime'), 3); f.metadata(); await f.settle();
  assert.equal(f.audio.currentTime, 3); assert.equal(f.run('state.dramaPlaylistActive'), true);
});

test('recovery is bounded and a later user resume keeps the same position', async () => {
  const f = fixture(); f.run('playDramaAudioAt(2,true)');
  for (let attempt = 0; attempt < 2; attempt++) { f.tick(); f.tick(); f.metadata(); await f.settle(); }
  f.tick(); assert.equal(f.timers.size, 0); assert.equal(f.run('state.dramaPlaylistActive'), false);
  assert.equal(f.audio.paused, true); assert.match(f.status.textContent, /続きから/);
  f.run('toggleDramaPlayAll()'); assert.equal(f.audio.currentTime, 6);
});

test('an old rejected play and queued pause cannot stop a newer resume', async () => {
  const f = fixture(); let rejectOld;
  f.audio.playImpl = () => new Promise((resolve, reject) => { rejectOld = reject; });
  f.run('toggleDramaPlayAll();toggleDramaPlayAll()'); delete f.audio.playImpl;
  f.run('toggleDramaPlayAll();onDramaPlaylistPause(audio)');
  rejectOld(Object.assign(new Error('Interrupted'), { name: 'AbortError' })); await f.settle();
  assert.equal(f.run('state.dramaPlaylistActive'), true); assert.equal(f.timers.size, 1);
});

test('autoplay restrictions wait for a user gesture without automatic retry loops', async () => {
  const f = fixture(); f.audio.playImpl = () => Promise.reject(Object.assign(new Error('Gesture required'), { name: 'NotAllowedError' }));
  f.run('toggleDramaPlayAll()'); await f.settle();
  assert.equal(f.run('state.dramaPlaylistActive'), false); assert.equal(f.timers.size, 0); assert.equal(f.audio.paused, true);
});

test('real progress rearms the watchdog and stopping cancels pending recovery', () => {
  const f = fixture(); f.run('toggleDramaPlayAll()'); f.audio.currentTime = 1; f.tick();
  assert.equal(f.audio.loadCalls, 0); f.tick(); f.run('stopDramaAudio()');
  assert.equal(f.timers.size, 0); assert.equal(f.audio.paused, true);
});

test('native controls can pause and resume the continuous track', () => {
  const f = fixture(); f.audio.play(); assert.equal(f.run('state.dramaPlaylistActive'), true);
  f.audio.currentTime = 4; f.audio.pause(); f.run('onDramaPlaylistPause(audio)'); assert.equal(f.timers.size, 0);
  f.audio.play(); assert.equal(f.run('state.dramaPlaylistIndex'), 1); assert.equal(f.timers.size, 1);
});

test('individual playback and single repeat stop the continuous track', () => {
  const f = fixture(); f.run('toggleDramaPlayAll();toggleDramaSingleRepeat(1)');
  assert.equal(f.audio.paused, true); assert.equal(f.clips[1].loop, true); assert.equal(f.run('state.dramaPlaylistActive'), false);
  f.run('toggleDramaPlayAll()'); assert.equal(f.clips[1].paused, true); assert.equal(f.clips[1].loop, false);
});

test('episode repeat uses the same source and awards exactly one round per end', () => {
  const f = fixture(); f.run('state.dramaRepeat=true;toggleDramaPlayAll()');
  for (let i = 0; i < 3; i++) {
    f.audio.currentTime = 9; f.audio.ended = true; f.run('onDramaPlaylistPause(audio);onDramaPlaylistEnded(audio)');
    assert.equal(f.run('window.rounds'), i + 1); assert.equal(f.audio.currentTime, 0);
  }
  assert.equal(f.audio.loadCalls, 0); assert.equal(f.audio.src, '/episode.mp3');
});

test('a queued end from before a resume cannot end the new playback or award a round', () => {
  const f = fixture(); f.run('toggleDramaPlayAll();onDramaPlaylistEnded(audio)');
  assert.equal(f.run('window.rounds || 0'), 0);
  assert.equal(f.run('state.dramaPlaylistActive'), true);
});

test('all published episodes have continuous audio and ordered boundaries for every clip', () => {
  const context = { window: {} };
  for (const file of ['public/dramas.js', 'public/drama-playback.js']) vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
  let total = 0;
  for (const drama of context.window.DRAMAS) for (const episode of drama.episodes) {
    const track = context.window.DRAMA_PLAYBACK[`${drama.id}:${episode.id}`];
    assert.equal(track.starts.length, episode.clips.length); assert.equal(track.starts[0], 0);
    assert.ok(track.starts.every((start, i) => i === 0 || start > track.starts[i - 1]));
    assert.ok(track.duration > track.starts.at(-1)); assert.ok(fs.statSync(path.join(root, 'public', track.audio)).size > 0);
    total += track.starts.length;
  }
  assert.equal(total, 413);
});
