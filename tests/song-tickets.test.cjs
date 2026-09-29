const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('public/app.js', 'utf8').replace(/\binit\(\);\s*$/, '');
const saved = new Map();
let songPlayCalls = 0;
const songAudio = {
  paused: true, ended: false, currentTime: 0,
  play() { songPlayCalls++; this.paused = false; return Promise.resolve(); },
  pause() { this.paused = true; },
};

class FakeAudio {
  play() { return Promise.resolve(); }
  pause() {}
  load() {}
  removeAttribute() {}
}

const context = vm.createContext({
  Audio: FakeAudio,
  navigator: {},
  window: {},
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
run(`state.currentSong = {
  folderName: 'test-song', songName: 'Test Song', hasLocalAudio: true,
  conversation: [{speaker:'A',sentences:[{text:'One',audio:'one.mp3'},{text:'Two',audio:'two.mp3'}]}]
}; initAudio(state.currentSong);`);

async function main() {
  await run('startSongPlayback()');
  assert.equal(songPlayCalls, 0, 'Song must be locked before five listens');

  run('clickSentence(1); state.conversationAudio.onended()');
  assert.equal(run('getSongTickets().listens'), 0, 'jumping to the end is not a full listen');

  for (let i = 0; i < 10; i++) {
    run('restartAll(); togglePlay(); state.conversationAudio.onended(); state.conversationAudio.onended()');
  }
  assert.equal(run('getSongTickets().listens'), 10);
  assert.equal(run('availableSongTickets()'), 2);

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
  console.log('song ticket behavior passed');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
