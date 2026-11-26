'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const createAudioSession = require('../public/voice-practice-audio');

test('overlapping microphone requests keep capture enabled until the final owner releases it', () => {
  const nav = { audioSession: { type: 'playback' } }, audio = createAudioSession(nav);
  const canceledScene = audio.acquire(), liveCall = audio.acquire();
  canceledScene(); canceledScene(); assert.equal(nav.audioSession.type, 'play-and-record');
  liveCall(); assert.equal(nav.audioSession.type, 'playback');
  const unsupported = createAudioSession({}); assert.doesNotThrow(() => unsupported.acquire()());
  const changing = audio.acquire(); nav.audioSession.type = 'auto'; changing(); assert.equal(nav.audioSession.type, 'auto', 'respect a later owner changing the mode');
});
