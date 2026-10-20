const test = require('node:test'), assert = require('node:assert/strict');
const { format, totals } = require('../public/listening-time');
test('listening display keeps seconds at minute boundaries without rounding up', () => {
  for (const [value, text] of [[0,'0分00秒'],[59.9,'0分59秒'],[60,'1分00秒'],[125.2,'2分05秒'],[3601,'60分01秒'],[-2,'0分00秒']]) assert.equal(format(value), text);
});
test('pending playback is visible immediately and overlapping intervals count once', () => {
  const at = Date.parse('2026-10-20T10:00:00+09:00');
  const state = { totalSeconds: 200, daily: { '2026-10-20': 60 } };
  assert.deepEqual(totals(state, [{start:at-10000,end:at},{start:at-7000,end:at-2000}], at), {today:70,total:210,pending:10});
  // The server acknowledges the first eight seconds while playback continues.
  assert.deepEqual(totals({totalSeconds:208,daily:{'2026-10-20':68}}, [{start:at-2000,end:at}], at), {today:70,total:210,pending:2});
});
test('only the part after midnight belongs to today in Japan', () => {
  const midnight = Date.parse('2026-10-20T00:00:00+09:00');
  assert.deepEqual(totals(null, [{start:midnight-3000,end:midnight+5000}], midnight+5000), {today:5,total:8,pending:8});
  assert.deepEqual(totals(null, [], midnight), {today:0,total:0,pending:0});
});
