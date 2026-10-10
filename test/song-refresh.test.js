const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness(fetch) {
  const events = {};
  const context = vm.createContext({
    fetch,
    document: { hidden: false, addEventListener(name, handler) { events[name] = handler; } },
    window: { addEventListener(name, handler) { events[name] = handler; } },
    navigator: {},
    setTimeout, clearTimeout,
    calls: { render: 0, audio: 0, home: 0 },
  });
  const source = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8').replace(/\binit\(\);\s*$/, '');
  vm.runInContext(source, context);
  vm.runInContext(`
    stopAudio = () => { state.isPlaying = false; };
    stopSongAudio = () => {};
    stopPhrasePracticeAudio = () => {};
    initAudio = song => { calls.audio++; calls.song = song; state.isPlaying = false; };
    renderShadowing = () => { calls.render++; };
    renderHome = () => { calls.home++; };
  `, context);
  return {context, events, run(code) { return vm.runInContext(code, context); }};
}
const oldSong = {id: 'Whatever Oasis', conversation: [{speaker: 'A', sentences: [{text: 'Old text', audio: '/old.mp3'}]}]};
const freshSong = {id: oldSong.id, conversation: [{speaker: 'A', sentences: [{text: 'New text', audio: '/new.mp3'}]}]};
function seed(h, song = oldSong) {
  h.context.song = song;
  h.run('state.songs = [song]; state.currentSong = song; state.view = "shadowing";');
}

test('opening a previously loaded song uses fresh text and audio without HTTP cache', async () => {
  let options;
  const h = harness(async (url, opts) => { options = opts; return {ok: true, json: async () => [freshSong]}; });
  seed(h);
  await h.run('showShadowing(song)');
  assert.equal(options.cache, 'no-store');
  assert.equal(h.context.calls.song.conversation[0].sentences[0].audio, '/new.mp3');
  assert.equal(h.context.calls.render, 1);
});

test('foreground refresh replaces an obsolete open conversation', async () => {
  const h = harness(async () => ({ok: true, json: async () => [freshSong]}));
  seed(h);
  await h.run('refreshVisibleSongs()');
  assert.equal(h.context.calls.song.conversation[0].sentences[0].text, 'New text');
  assert.equal(h.context.calls.render, 1);
});

test('unchanged data leaves current audio playback running', async () => {
  const h = harness(async () => ({ok: true, json: async () => [structuredClone(oldSong)]}));
  seed(h);
  h.run('state.isPlaying = true');
  await h.run('refreshVisibleSongs()');
  assert.equal(h.run('state.isPlaying'), true);
  assert.equal(h.context.calls.audio, 0);
  assert.equal(h.context.calls.render, 0);
});

test('network failure preserves previously available songs', async () => {
  const h = harness(async () => {throw new Error('offline');});
  seed(h);
  assert.equal(await h.run('loadSongs()'), false);
  assert.equal(h.run('state.songs[0].id'), oldSong.id);
});

test('a late response does not reopen a conversation after navigation away', async () => {
  let finish;
  const h = harness(() => new Promise(resolve => { finish = resolve; }));
  seed(h);
  const opening = h.run('showShadowing(song)');
  h.run('state.view = "home"; state.currentSong = null;');
  finish({ok: true, json: async () => [freshSong]});
  await opening;
  assert.equal(h.context.calls.render, 0);
  assert.equal(h.context.calls.audio, 0);
});

test('simultaneous refreshes share one request', async () => {
  let requests = 0, finish;
  const h = harness(() => { requests++; return new Promise(resolve => {finish = resolve;}); });
  const first = h.run('loadSongs()'), second = h.run('loadSongs()');
  finish({ok: true, json: async () => [freshSong]});
  await Promise.all([first, second]);
  assert.equal(requests, 1);
});
