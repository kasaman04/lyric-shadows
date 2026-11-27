const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('public/app.js', 'utf8').replace(/^init\(\)\.catch\([\s\S]*$/m, '');
const saved = new Map();
let songPlayCalls = 0;
const songAudio = {
  paused: true, ended: false, currentTime: 0,
  play() {
    songPlayCalls++;
    this.paused = false;
    run('onSongAudioPlay()');
    return Promise.resolve();
  },
  pause() { this.paused = true; },
};

class FakeAudio {
  currentTime = 0;
  ended = false;
  paused = true;
  set src(value) { this.source = value; this.currentTime = 0; this.ended = false; }
  getAttribute(name) { return name === 'src' ? this.source : null; }
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
  load() {}
  removeAttribute(name) { if (name === 'src') this.src = null; }
}

const context = vm.createContext({
  Audio: FakeAudio,
  navigator: {},
  window: { addEventListener() {} },
  document: {
    hidden: true,
    getElementById(id) { return id === 'songAudioPlayer' ? songAudio : null; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    addEventListener() {},
    createElement() { return { className: '', textContent: '', remove() {} }; },
    body: { appendChild() {} },
  },
  localStorage: {
    getItem(key) { return saved.get(key) ?? null; },
    setItem(key, value) { saved.set(key, value); },
  },
  setTimeout() { return 1; },
  clearTimeout() {},
  console,
});
vm.runInContext(source, context);
const run = code => vm.runInContext(code, context);
run(`
  state.currentSong = { id: 'ticket-test', hasLocalAudio: true, conversation: [
    { speaker: 'A', sentences: [{ audio: '/first.mp3' }, { audio: '/second.mp3' }, { audio: '/third.mp3' }] },
  ] };
  initAudio(state.currentSong);
`);

async function main() {
  await run('startSongPlayback()');
  assert.equal(songPlayCalls, 0, 'Song must be locked before five listens');

  run('clickSentence(state.audioSources.length - 1); state.conversationAudio.onended()');
  assert.equal(run('getSongTickets().listens'), 0, 'jumping to the end is not a full listen');

  for (let i = 0; i < 10; i++) {
    run('restartAll(); togglePlay(); for (let sentence = 0; sentence < state.audioSources.length; sentence++) state.conversationAudio.onended();');
    if (i === 3) {
      assert.equal(run('availableSongTickets()'), 0, 'four full listens must not unlock Song');
      await run('startSongPlayback()');
      assert.equal(songPlayCalls, 0, 'Song must stay locked after four listens');
    }
    if (i === 4) assert.equal(run('availableSongTickets()'), 1, 'the fifth full listen unlocks one Song play');
  }
  assert.equal(run('getSongTickets().listens'), 10);
  assert.equal(run('availableSongTickets()'), 2);

  run('switchTab("song")');
  await run('startSongPlayback()');
  assert.equal(songPlayCalls, 1);
  assert.equal(run('availableSongTickets()'), 1);
  songAudio.pause();
  await run('startSongPlayback()');
  assert.equal(run('availableSongTickets()'), 1, 'resuming should not spend another ticket');
  run('onSongAudioEnded()');
  await run('startSongPlayback()');
  assert.equal(run('availableSongTickets()'), 0);
  run('onSongAudioEnded()');
  await run('startSongPlayback()');
  assert.equal(songPlayCalls, 3, 'Song must lock after both tickets are used');

  run('switchTab("conv"); restartAll(); togglePlay(); state.conversationAudio.onended(); state.conversationAudio.currentTime = 0.75;');
  assert.equal(run('state.currentIndex'), 1);
  assert.equal(run('state.conversationCycleNext'), 1);
  run('saveSongTickets({ listens: 10, used: 1 }); switchTab("song")');
  await run('startSongPlayback()');
  songAudio.pause();
  run('onSongAudioEnded(); switchTab("conv"); togglePlay()');
  assert.equal(run('state.currentIndex'), 1, 'resume the same conversation line');
  assert.equal(run('state.conversationAudio.currentTime'), 0.75, 'resume at the position within that line');
  run('for (let i = 1; i < state.audioSources.length; i++) state.conversationAudio.onended();');
  assert.equal(run('getSongTickets().listens'), 11, 'finishing after Song adds exactly one conversation');
  run('state.conversationAudio.onended()');
  assert.equal(run('getSongTickets().listens'), 11, 'a second end notification does not add a conversation');

  run(`
    state.currentSong = { id: 'speaker-pause', conversation: [
      { speaker: 'A', sentences: [{ audio: '/first.mp3' }] },
      { speaker: 'B', sentences: [{ audio: '/second.mp3' }] },
    ] };
    initAudio(state.currentSong);
    document.hidden = false;
    togglePlay();
    state.conversationAudio.ended = true;
    state.conversationAudio.onended();
    switchTab('song');
    switchTab('conv');
    togglePlay();
  `);
  assert.equal(run('state.currentIndex'), 1, 'advance to the next line after an interrupted speaker pause');
  run('state.conversationAudio.onended()');
  assert.equal(run('getSongTickets().listens'), 1);
  run('switchTab("song"); switchTab("conv"); togglePlay()');
  assert.equal(run('state.currentIndex'), 0, 'play from the first line after a finished conversation');
  assert.equal(run('getSongTickets().listens'), 1);
  console.log('song tickets and interrupted conversation playback passed');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
