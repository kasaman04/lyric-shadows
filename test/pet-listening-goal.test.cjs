'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
const rules = require('../public/pet-rules'), listening = require('../public/listening-time');
const { createState, newPet, listen } = require('../lib/pet-store');
const t = Date.parse('2026-10-23T00:00:00+09:00'), at = t + 12 * 3600000;
function fixture() {
  const state = createState(t); state.pets.push(newPet(t, 'grass'));
  const source = fs.readFileSync(require.resolve('../public/pet.js'), 'utf8').replace('  window.PetGame = { initialize,', '  window.PetTest = { setState(s){save=s;}, pendingPlayback, current, listeningGoal, room };\n  window.PetGame = { initialize,');
  const context = { window: { PetRules: rules, ListeningTime: listening, PetArt: { room: () => '', memorial: () => '' } }, Date: { now: () => at } };
  vm.runInNewContext(source, context);
  const api = context.window.PetTest; api.setState(state);
  return { state, pet: state.pets[0], api };
}
test('30 minute milestones show seconds, completion, and the next cycle', () => {
  const { pet, api } = fixture();
  for (const [seconds, earned, label] of [[0,0,'30分達成まで あと30分00秒'],[1080,1080,'30分達成まで あと12分00秒'],[1799,1799,'30分達成まで あと0分01秒'],[1800,1800,'30分達成！'],[1801,1,'30分達成まで あと29分59秒'],[3600,1800,'30分達成！']]) {
    pet.seconds = seconds;
    const goal = api.listeningGoal(api.current());
    assert.equal(goal.earned, earned); assert.equal(goal.label, label);
  }
});
test('overlapping offline playback and server acknowledgement preserve the exact progress', () => {
  const { state, pet, api } = fixture();
  const events = Array.from({length:36}, (_,i) => ({petId:pet.id,start:at-1080000+i*30000,end:at-1080000+(i+1)*30000}));
  listen(state, events, at);
  const pending = {petId:pet.id,start:at-30000,end:at+10000};
  api.pendingPlayback.set('a', pending); api.pendingPlayback.set('b', {...pending});
  assert.equal(api.listeningGoal(api.current()).earned,1090);
  assert.equal(pet.seconds,1080);
  listen(state,[{...pending,start:at-10000}],at+10000);
  api.pendingPlayback.clear(); api.setState(state);
  assert.equal(api.listeningGoal(api.current()).earned,1090);
});
test('care spending and day changes do not reset progress; a new companion starts at zero', () => {
  const { state, pet, api } = fixture(); pet.seconds=1080;
  state.bankSeconds=0; state.daily={}; pet.growthSeconds=3600;
  assert.equal(api.listeningGoal(api.current()).earned,1080);
  assert.match(api.room(), /30分達成まで あと12分00秒/);
  state.pets.push(newPet(at,'fire'));
  api.pendingPlayback.set('old',{petId:pet.id,start:at-1000,end:at});
  assert.equal(api.listeningGoal(api.current()).earned,0);
});
test('archived companions do not display a listening target', () => {
  const { pet, api } = fixture(); pet.diedAt=at-1000;
  assert.doesNotMatch(api.room(), /class="pet-listening-goal"/);
});
