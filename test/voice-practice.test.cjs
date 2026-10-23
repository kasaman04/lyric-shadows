'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const express = require('express');
const C = require('../public/voice-practice-core');
const { mountVoicePractice, Store, sessionConfig, instructions, generateReview } = require('../lib/voice-practice');
async function temporary(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'vp-test-'));
  t.after(async () => { assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir())); assert(path.basename(dir).startsWith('vp-test-')); await fs.rm(dir, { recursive: true, force: true }); });
  return dir;
}
function fakeApi() {
  const calls = [];
  const fetcher = async (url, request) => {
    calls.push({ url, request });
    if (url.endsWith('/realtime/calls')) return new Response('v=0\r\ns=mock-answer\r\n', { status: 201 });
    if (url.endsWith('/audio/transcriptions')) return Response.json({ text: '友人の恋人と初めて会って話す' });
    const body = JSON.parse(request.body);
    if (url.endsWith('/responses')) {
      const input = JSON.parse(body.input);
      const result = body.text.format.schema.properties.relationship ? { title: '友人の恋人と初めて会う', relationship: '友人の恋人と初対面', place: 'カフェ', time: '休日の午後', partnerName: 'Alex', context: '共通の友人を通じて紹介される。', assumed: ['place', 'time', 'partnerName'] } : body.text.format.schema.properties.candidates
        ? { kind: 'continue', feedback: '意味が伝わっています。', candidates: ['because it helps me relax.', 'when I have time.', 'even though I am busy.'].map(english => ({ english, japanese: '続きの候補', fullSentence: input.partial + ' ' + english })) }
        : { title: 'Miaと週末の話', summary: '週末の過ごし方を話しました。', translations: input.turns.map(turn => ({ id: turn.id, ja: '翻訳：' + turn.text })) };
      return Response.json({ output: [{ content: [{ type: 'output_text', text: JSON.stringify(result) }] }] });
    }
    assert(url.includes('/text-to-dialogue/with-timestamps?output_format=pcm_24000'));
    assert.equal(body.model_id, 'eleven_v4');
    return Response.json({ audio_base64: Buffer.alloc(48000 * body.inputs.length).toString('base64'), voice_segments: body.inputs.map((input, i) => ({ voice_id: input.voice_id, dialogue_input_index: i, start_time_seconds: i, end_time_seconds: i + .9 })) });
  };
  return { fetcher, calls };
}
async function server(t, options) {
  const app = express(); app.use(express.json({ limit: '256kb' })); const service = mountVoicePractice(app, options);
  const http = app.listen(0, '127.0.0.1'); await new Promise(resolve => http.once('listening', resolve));
  t.after(() => new Promise(resolve => { http.closeAllConnections(); http.close(resolve); }));
  const base = 'http://127.0.0.1:' + http.address().port; let cookie;
  async function call(url, body, extra = {}) {
    const response = await fetch(base + '/api/voice-practice' + url, { method: body === undefined ? 'GET' : 'POST', headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json', Origin: base }), ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });
    cookie ||= response.headers.get('set-cookie')?.split(';')[0];
    return response;
  }
  return { call, base, service, cookie: () => cookie };
}
test('grammar practice never auto-replies to a thinking pause; closing policy is explicit', () => {
  for (const grammar of C.GRAMMAR) { const cfg = sessionConfig(C.settings({ grammar }), {}); assert.equal(cfg.audio.input.turn_detection.create_response, false); assert.equal(cfg.audio.input.transcription.language, undefined, 'allow Japanese stop requests as well as English'); assert.match(cfg.instructions, new RegExp(grammar)); }
  assert.equal(sessionConfig(C.settings({ mode: 'free' }), {}).audio.input.turn_detection.eagerness, 'low');
  assert.match(instructions(C.settings()), /silence.*request to end/i);
  for (const text of ['今日はここまで', '今日はここまでにする', "That's all for today.", 'I need to go now.', 'Bye, Mia!']) assert(C.endIntent(text), text);
  assert(C.endIntent('Bye, Alex!', 'Alex')); assert(C.endIntent('Goodbye Sam.', 'Sam')); assert(C.endIntent('Bye, A.+!', 'A.+'));
  for (const text of ['I often play', 'I want to stop playing soccer.', "I don't want to end the conversation.", 'When I have time', 'I said goodbye to my friend.']) assert(!C.endIntent(text), text);
});
test('actual spoken segments merge; alternatives are not inserted; long dialogue is chunked with turn mapping', () => {
  const merged = C.mergeTurns([{ id: 'a', role: 'assistant', text: 'How do you relax?' }, { id: 'b', role: 'user', text: 'I play soccer' }, { id: 'c', role: 'user', text: 'because it helps me relax.' }]);
  assert.equal(merged.length, 2); assert.equal(merged[1].text, 'I play soccer because it helps me relax.');
  const chunks = C.dialogueChunks([{ role: 'user', text: 'word '.repeat(1300) }], { user: 'U' });
  assert(chunks.length > 2); assert(chunks.every(c => c.reduce((n, x) => n + x.text.length, 0) <= 1800)); assert(chunks.flat().every(x => x.turnIndex === 0));
  assert.throws(() => C.normalizeTurns([{ id: 'same', role: 'user', text: 'a' }, { id: 'same', role: 'user', text: 'b' }]), /重複/);
  assert.equal(C.cueAt([{ start: 0 }, { start: 3 }, { start: 9 }], 8), 1);
});
test('full API path: private session, hints, idempotent closing, separate voices, exact audio timing and persistent replay', async t => {
  const dir = await temporary(t), mock = fakeApi(), env = { OPENAI_API_KEY: 'mock-openai-secret', ELEVENLABS_API_KEY: 'mock-eleven-secret', VOICE_PRACTICE_DATA_DIR: dir };
  const s = await server(t, { env, fetcher: mock.fetcher });
  const configResponse = await s.call('/config'); const config = await configResponse.json(); assert(config.openai && config.elevenlabs); assert(!JSON.stringify(config).includes('secret'));
  assert.equal((await s.call('/sessions', { sdp: 'v=0\r\n', grammar: 'when' }, { Origin: 'https://other.invalid' })).status, 403);
  const opened = await s.call('/sessions', { sdp: 'v=0\r\ns=offer\r\n', grammar: 'when', mode: 'grammar' }); assert.equal(opened.status, 201); const session = await opened.json();
  const cfg = JSON.parse(mock.calls[0].request.body.get('session')); assert.equal(cfg.audio.input.turn_detection.create_response, false); assert.match(cfg.instructions, /using when/);
  assert.equal((await fetch(s.base + '/api/voice-practice/sessions/' + session.id)).status, 404);
  const raw = [{ id: 'a', role: 'assistant', text: 'What do you do on weekends?' }, { id: 'b', role: 'user', text: 'I play soccer' }, { id: 'c', role: 'user', text: 'when I have time.' }, { id: 'd', role: 'assistant', text: 'Enjoy your next game. See you next time!' }];
  assert.equal((await s.call('/sessions/' + session.id + '/checkpoint', { turns: raw.slice(0, 2) })).status, 200);
  const hints = await (await s.call('/sessions/' + session.id + '/hints', { turns: raw.slice(0, 2), partial: 'I play soccer' })).json(); assert.equal(hints.candidates.length, 3);
  const finishes = await Promise.all([s.call('/sessions/' + session.id + '/finish', { turns: raw }), s.call('/sessions/' + session.id + '/finish', { turns: raw })]); assert(finishes.every(r => r.status === 200));
  await Promise.all([...s.service.jobs.values()]);
  let record = await (await s.call('/sessions/' + session.id)).json(); assert.equal(record.status, 'finished'); assert.equal(record.review.status, 'ready'); assert.equal(record.annotationStatus, 'ready'); assert.equal(record.turns.length, 3); assert.equal(record.turns[1].text, 'I play soccer when I have time.'); assert(record.turns[1].ja); assert(!record.owner);
  const speechCalls = mock.calls.filter(c => c.url.includes('/text-to-dialogue/')); assert.equal(speechCalls.length, 1); const voices = JSON.parse(speechCalls[0].request.body).inputs.map(x => x.voice_id); assert.notEqual(voices[0], voices[1]); assert.equal(voices[0], voices[2]);
  assert.deepEqual(record.review.cues.map(c => c.start), [0, 1, 2]); assert.equal(record.review.duration, 3);
  const audio = await s.call('/sessions/' + session.id + '/audio'); const bytes = Buffer.from(await audio.arrayBuffer()); assert.equal(bytes.toString('ascii', 0, 4), 'RIFF'); assert.equal(bytes.readUInt32LE(24), 24000); assert.equal(bytes.length, 144044);
  const ranged = await s.call('/sessions/' + session.id + '/audio', undefined, { Range: 'bytes=0-43' }); assert.equal(ranged.status, 206);
  await s.call('/sessions/' + session.id + '/checkpoint', { turns: raw.slice(0, 1) }); record = await (await s.call('/sessions/' + session.id)).json(); assert.equal(record.turns.length, 3);
  await s.call('/sessions/' + session.id + '/review', {}); await s.call('/sessions/' + session.id + '/audio'); assert.equal(mock.calls.filter(c => c.url.includes('/text-to-dialogue/')).length, 1, 'replay and retry of ready audio must not bill again');
  const restarted = await server(t, { env, fetcher: mock.fetcher }); const recovered = await restarted.call('/sessions/' + session.id, undefined, { Cookie: s.cookie() }); assert.equal((await recovered.json()).review.status, 'ready');
});
test('missing OpenAI key fails visibly and makes no API calls; other browser cannot view history', async t => {
  const dir = await temporary(t), mock = fakeApi(), s = await server(t, { env: { VOICE_PRACTICE_DATA_DIR: dir }, fetcher: mock.fetcher });
  assert.equal((await (await s.call('/config')).json()).openai, false);
  const response = await s.call('/sessions', { sdp: 'v=0\r\n' }); assert.equal(response.status, 503); assert.equal(mock.calls.length, 0);
});
test('timing must come from provider; missing timing is rejected instead of estimated', async t => {
  const dir = await temporary(t), record = { id: crypto.randomUUID(), turns: [{ id: 'a', role: 'assistant', text: 'Hello' }] };
  const fetcher = async () => Response.json({ audio_base64: Buffer.alloc(48000).toString('base64'), voice_segments: [] });
  await assert.rejects(generateReview(record, { env: { ELEVENLABS_API_KEY: 'mock' }, fetcher, store: new Store(dir) }), /同期情報/);
});
test('small provider rounding overshoot is clamped to the actual decoded audio length', async t => {
  const dir = await temporary(t), record = { id: crypto.randomUUID(), turns: [{ id: 'a', role: 'assistant', text: 'Goodbye' }] };
  const fetcher = async (url, init) => { const input = JSON.parse(init.body).inputs[0]; return Response.json({ audio_base64: Buffer.alloc(48000).toString('base64'), voice_segments: [{ dialogue_input_index: 0, voice_id: input.voice_id, start_time_seconds: 0, end_time_seconds: 1.08 }] }); };
  const review = await generateReview(record, { env: { ELEVENLABS_API_KEY: 'mock' }, fetcher, store: new Store(dir) });
  assert.equal(review.duration, 1); assert.equal(review.cues[0].end, 1);
});
test('server restart resumes a saved generation job, then reuses the completed audio', async t => {
  const dir = await temporary(t), store = new Store(dir), mock = fakeApi();
  const record = { id: crypto.randomUUID(), owner: 'mock-owner', status: 'finished', createdAt: new Date().toISOString(), turns: [{ id: 'a', role: 'assistant', text: 'See you next time.' }, { id: 'b', role: 'user', text: 'Bye, Mia.' }], review: { status: 'generating' } };
  await store.write(record);
  const env = { ELEVENLABS_API_KEY: 'mock' }, service = mountVoicePractice(express(), { env, fetcher: mock.fetcher, store });
  await service.ready; await Promise.all([...service.jobs.values()]); assert.equal((await store.read(record.id)).review.status, 'ready');
  const restarted = mountVoicePractice(express(), { env, fetcher: mock.fetcher, store }); await restarted.ready; await Promise.all([...restarted.jobs.values()]);
  assert.equal(mock.calls.filter(c => c.url.includes('/text-to-dialogue/')).length, 1);
});

test('spoken scenario uses private Japanese transcription then editable settings before any live session is created', async t => {
  const dir = await temporary(t), mock = fakeApi(), s = await server(t, { env: { OPENAI_API_KEY: 'mock', VOICE_PRACTICE_DATA_DIR: dir }, fetcher: mock.fetcher });
  await s.call('/config');
  const transcribed = await fetch(s.base + '/api/voice-practice/scene-transcription', { method: 'POST', headers: { 'Content-Type': 'audio/webm;codecs=opus', Cookie: s.cookie(), Origin: s.base }, body: Buffer.alloc(4000) });
  assert.equal(transcribed.status, 200); const { text } = await transcribed.json(); assert.match(text, /友人の恋人/);
  const upstream = mock.calls[0]; assert.equal(upstream.request.body.get('languages[]'), 'ja'); assert.equal(upstream.request.body.get('model'), 'gpt-transcribe'); assert.equal(upstream.request.body.get('file').size, 4000);
  const result = await s.call('/scenarios', { request: text }); assert.equal(result.status, 200); const { scenario } = await result.json();
  assert.equal(scenario.request, text); assert.deepEqual(scenario.assumed, ['place', 'time', 'partnerName']);
  assert.equal((await (await s.call('/sessions')).json()).length, 0, 'preview must not open a call or save fake spoken turns');
  const confirmed = { ...scenario, place: '友人の家', time: '夕食前', partnerName: 'Sam', assumed: [] };
  const first = await (await s.call('/sessions', { scenario: confirmed, mode: 'grammar', grammar: 'when', sdp: 'v=0\r\n' })).json();
  const call = mock.calls.find(c => c.url.endsWith('/realtime/calls')); const session = JSON.parse(call.request.body.get('session'));
  assert.match(session.instructions, /友人の家/); assert.match(session.instructions, /Sam/); assert.match(session.instructions, /first time/);
  const record = await (await s.call('/sessions/' + first.id)).json(); assert.equal(record.scene, 'custom'); assert.deepEqual(record.scenario, confirmed); assert.deepEqual(record.turns, []);
  const second = await (await s.call('/sessions', { ...first.settings, sdp: 'v=0\r\n' })).json(); assert.notEqual(first.id, second.id); assert.deepEqual(second.settings, first.settings);
  assert.deepEqual((await (await s.call('/sessions/' + second.id)).json()).turns, []);
  await s.call('/sessions/' + first.id + '/hints', { turns: [{ id: 'a', role: 'assistant', text: 'How did you two meet?' }], partial: '' });
  const hint = mock.calls.filter(c => c.url.endsWith('/responses')).at(-1), prompt = JSON.parse(hint.request.body);
  assert.match(prompt.instructions, /do NOT begin with I or You/); assert.match(prompt.instructions, /never discard or rewrite their unfinished words/);
  assert.match(JSON.parse(prompt.input).scene, /友人の家/);
});

test('invalid scenarios, audio formats and missing scene credentials fail without inventing settings', async t => {
  const dir = await temporary(t), mock = fakeApi(), s = await server(t, { env: { OPENAI_API_KEY: 'mock', VOICE_PRACTICE_DATA_DIR: dir }, fetcher: mock.fetcher });
  assert.equal((await s.call('/scenarios', { request: '' })).status, 400);
  assert.equal((await s.call('/sessions', { scenario: { title: 'incomplete' }, sdp: 'v=0\r\n' })).status, 400);
  const badAudio = await fetch(s.base + '/api/voice-practice/scene-transcription', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'not recorded audio' }); assert.equal(badAudio.status, 400);
  assert.equal(mock.calls.length, 0);
  const unconfigured = await server(t, { env: { VOICE_PRACTICE_DATA_DIR: dir }, fetcher: mock.fetcher });
  assert.equal((await unconfigured.call('/scenarios', { request: '旅行中の会話' })).status, 503); assert.equal(mock.calls.length, 0);
  assert.equal(C.sceneName({ scene: 'cafe' }), 'カフェでMiaと'); assert.equal(C.partner({ scene: 'cafe' }), 'Mia');
});
