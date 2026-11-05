'use strict';
// Isolate the displayed sentence using the source dialogue's recorded turn boundaries.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const phrases = require('../data/relative-conversation-phrases.json');
let seconds = 0;
for (const phrase of phrases) {
  const index = phrase.targetLineIndex;
  const cue = phrase.audioCues.find(item => item.index === index);
  assert.equal(phrase.lines[index][1], phrase.phrase, phrase.id);
  assert(cue && cue.start >= 0 && cue.end > cue.start && cue.end <= phrase.audioDuration + .01, phrase.id);
  const source = path.join(root, 'public', phrase.audio);
  const output = source.replace(/\.mp3$/, `-line-${index + 1}.mp3`);
  assert.notEqual(source, output);
  const result = spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-i', source,
    '-af', `atrim=start=${cue.start}:end=${cue.end},asetpts=PTS-STARTPTS`,
    '-map_metadata', '-1', '-codec:a', 'libmp3lame', '-b:a', '96k', output], { windowsHide: true });
  assert.equal(result.status, 0, `${phrase.id}: ${result.stderr}`);
  assert(fs.statSync(output).size > 1000, phrase.id);
  seconds += cue.end - cue.start;
}
console.log(JSON.stringify({ sentences: phrases.length, seconds: Math.round(seconds), source: 'Existing dialogue audio; target sentence only' }));
