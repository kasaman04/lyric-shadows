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
context.notesSong = JSON.parse(fs.readFileSync("songs/Notes'n'Words ONE OK ROCK/song.json", 'utf8'));
vm.runInContext(source, context);
const run = code => vm.runInContext(code, context);
run('state.currentSong = { ...notesSong, hasLocalAudio: true }; initAudio(state.currentSong);');

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
      assert.equal(songPlayCalls, 0, 'Notes\'n\'Words must stay locked after four listens');
    }
    if (i === 4) assert.equal(run('availableSongTickets()'), 1, 'the fifth full listen unlocks one Song play');
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
