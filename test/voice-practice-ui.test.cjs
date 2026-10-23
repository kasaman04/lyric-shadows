'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const C = require('../public/voice-practice-core');
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(setImmediate); };
function fixture() {
  class Element {
    constructor() { Object.assign(this, { children: [], dataset: {}, attrs: {}, _text: '', hidden: false, value: '', disabled: false, scrollTop: 0, scrollHeight: 600, clientHeight: 290, offsetTop: 0, offsetHeight: 90, currentTime: 0, duration: 10, paused: true }); }
    set textContent(v) { this._text = v; this.children = []; } get textContent() { return this._text + this.children.map(c => c.textContent).join(''); }
    append(...nodes) { this.children.push(...nodes); if (!this.value && nodes[0]?.value) this.value = nodes[0].value; }
    replaceChildren(...nodes) { this.children = nodes; nodes.forEach((node, i) => { node.offsetTop = i * 110; }); }
    setAttribute(k, v) { this.attrs[k] = v; } scrollTo({ top }) { this.scrollTop = top; }
    pause() { this.paused = true; this.onpause?.(); } play() { this.paused = false; return Promise.resolve(); } load() {}
  }
  const html = fs.readFileSync(path.join(__dirname, '../public/voice-practice.html'), 'utf8'), nodes = {};
  for (const match of html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)) { nodes[match[1]] = new Element(); nodes[match[1]].hidden = /\bhidden\b/.test(match[0]); }
  nodes.mode.value = 'grammar'; nodes.grammar.value = 'when';
  let chosen = C.settings({ scene: 'cafe', grammar: 'when' });
  const setup = { initialize() {}, stop() {}, step() {}, getSettings: () => chosen, restore: value => { chosen = C.settings(value); } };
  const requests = [], events = [], warnings = [], timers = new Map(), track = { enabled: true, stopped: false, stop() { this.stopped = true; } }; let now = 0, nextTimer = 0, frame, dc, saved = null;
  class Peer {
    constructor() { this.iceGatheringState = 'complete'; this.localDescription = { sdp: 'v=0\r\n' }; }
    addTrack() {} createDataChannel() { dc = { readyState: 'open', send: text => events.push(JSON.parse(text)), close() { this.readyState = 'closed'; this.onclose?.(); } }; return dc; }
    async createOffer() { return { type: 'offer', sdp: 'v=0\r\n' }; } async setLocalDescription() {}
    async setRemoteDescription() { dc.onopen(); dc.onmessage({ data: JSON.stringify({ type: 'session.created' }) }); }
    close() {} addEventListener() {} removeEventListener() {}
  }
  class Context {
    resume() { return Promise.resolve(); } close() { return Promise.resolve(); }
    createAnalyser() { return { fftSize: 16, getFloatTimeDomainData(a) { a.fill(0); }, connect() {} }; }
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
  }
  const fetcher = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : undefined; requests.push({ url, body }); let value;
    if (url.endsWith('/config')) value = { openai: true, elevenlabs: true, scenes: C.SCENES, grammar: C.GRAMMAR };
    else if (url.endsWith('/sessions') && body) value = { id: '11111111-1111-4111-8111-111111111111', sdp: 'v=0\r\n' };
    else if (url.endsWith('/hints')) value = { kind: body.partial ? 'continue' : 'reply', feedback: '', candidates: [{ english: 'soccer when I have time.', japanese: '時間があるときサッカーをする。', fullSentence: 'Actually I often play soccer when I have time.' }, { english: 'video games after work.', japanese: 'ゲームをする。', fullSentence: 'Actually I often play video games after work.' }, { english: 'the guitar.', japanese: 'ギターを弾く。', fullSentence: 'Actually I often play the guitar.' }] };
    else if (url.endsWith('/finish')) { saved = { id: '11111111-1111-4111-8111-111111111111', scene: 'cafe', mode: 'grammar', grammar: 'when', title: '週末の話', status: 'finished', turns: C.mergeTurns(body.turns), review: { status: 'queued' } }; value = saved; }
    else if (url.endsWith('/checkpoint')) value = { saved: true };
    else if (url.endsWith('/sessions')) value = saved ? [saved] : [];
    else value = saved;
    return { ok: true, json: async () => value };
  };
  const local = new Map();
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/voice-practice.js'), 'utf8'), {
    VoicePracticeCore: C, document: { getElementById: id => { assert(nodes[id], id); return nodes[id]; }, createElement: () => new Element() },
    window: { RTCPeerConnection: Peer, VoiceSceneSetup: setup, addEventListener() {} }, RTCPeerConnection: Peer, AudioContext: Context,
    navigator: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [track], getAudioTracks: () => [track] }) } },
    fetch: fetcher, AbortController, performance: { now: () => now }, console: { warn: (...args) => warnings.push(args) },
    localStorage: { setItem: (k, v) => local.set(k, v), getItem: k => local.get(k), removeItem: k => local.delete(k) },
    setTimeout: (fn, delay) => { timers.set(++nextTimer, { fn, at: now + delay }); return nextTimer; }, clearTimeout: id => timers.delete(id), requestAnimationFrame: fn => { frame = fn; return 1; }, cancelAnimationFrame: () => { frame = null; }, matchMedia: () => ({ matches: true }), Blob
  });
  async function advance(ms) { const end = now + ms; for (;;) { const entry = [...timers].sort((a, b) => a[1].at - b[1].at).find(([, v]) => v.at <= end); if (!entry) break; now = entry[1].at; timers.delete(entry[0]); entry[1].fn(); await settle(); } now = end; frame?.(); await settle(); }
  function emit(type, value = {}) { dc.onmessage({ data: JSON.stringify({ type, ...value }) }); }
  async function assistant(id, text, closing = false) {
    emit('response.created', { response: { id, metadata: closing ? { purpose: 'closing' } : {} } }); emit('output_audio_buffer.started');
    emit('response.output_audio_transcript.done', { item_id: id + '-item', transcript: text });
    emit('response.done', { response: { id, status: 'completed', output: [], metadata: closing ? { purpose: 'closing' } : {} } }); emit('output_audio_buffer.stopped'); await advance(300);
  }
  function user(id, text, previous) { emit('input_audio_buffer.speech_started'); emit('input_audio_buffer.committed', { item_id: id, previous_item_id: previous }); emit('input_audio_buffer.speech_stopped'); emit('conversation.item.input_audio_transcription.completed', { item_id: id, transcript: text }); }
  return { nodes, requests, events, warnings, track, advance, emit, assistant, user, saved: () => saved, setRecord: record => { saved = record; }, settings: () => chosen, setSettings: value => { chosen = value; } };
}
test('actual UI wiring waits through learner pauses, offers a completion, sends only actual speech, then naturally closes before saving', async () => {
  const f = fixture(); await settle(); assert.equal(f.nodes.start.disabled, false); await f.nodes.start.onclick(); await settle();
  const creates = () => f.events.filter(e => e.type === 'response.create'); assert.equal(creates().length, 1);
  await f.assistant('hello', 'What do you usually do on weekends?'); assert(f.track.enabled); await f.advance(4999); assert(f.nodes.hints.hidden); await f.advance(1); assert.equal(f.nodes.hints.hidden, false);
  f.user('user-1', 'Actually I often play', 'hello-item'); assert(f.nodes.hints.hidden); await f.advance(5000); assert.equal(f.nodes.hints.hidden, false); assert.equal(creates().length, 1, 'thinking pauses must not start an AI response');
  f.nodes.hints.children[0].onclick(); assert.match(f.nodes.target.textContent, /soccer when/); assert.equal(creates().length, 1);
  f.user('user-2', 'the guitar when I have time.', 'user-1'); f.nodes.send.onclick(); await f.advance(1000); assert.equal(creates().length, 2); assert.equal(f.track.enabled, false);
  await f.assistant('reply', 'That sounds fun. What do you enjoy about it?');
  f.nodes.end.onclick(); f.nodes.end.onclick(); await f.advance(1001); assert.equal(creates().length, 3, 'closing requested exactly once'); assert.equal(creates()[2].response.metadata.purpose, 'closing'); assert.match(creates()[2].response.instructions, /no.*questions/i);
  assert.equal(f.requests.filter(r => r.url.endsWith('/finish')).length, 0, 'must not save before goodbye is heard');
  f.emit('response.created', { response: { id: 'bye', metadata: { purpose: 'closing' } } }); f.emit('output_audio_buffer.started'); f.emit('response.output_audio_transcript.done', { item_id: 'bye-item', transcript: 'Enjoy playing the guitar. See you next time!' }); f.emit('response.done', { response: { id: 'bye', status: 'completed', output: [] } });
  await f.advance(1000); assert.equal(f.requests.filter(r => r.url.endsWith('/finish')).length, 0, 'generation done is not playback done');
  f.emit('output_audio_buffer.stopped'); await f.advance(300); await settle();
  const finishes = f.requests.filter(r => r.url.endsWith('/finish')); assert.equal(finishes.length, 1); assert.equal(finishes[0].body.interrupted, false); assert(f.track.stopped); assert.equal(f.nodes.review.hidden, false);
  assert(f.saved().turns.some(t => t.text === 'Actually I often play the guitar when I have time.')); assert(!f.saved().turns.some(t => t.text.includes('soccer')), 'unspoken candidate must not enter review'); assert.match(f.saved().turns.at(-1).text, /See you next time/); assert.deepEqual(f.warnings, []);
});
test('explicit spoken farewell queues a closing; pauses and an unfinished when clause never do', async () => {
  const f = fixture(); await settle(); await f.nodes.start.onclick(); await settle(); await f.assistant('hi', 'Tell me about your day.');
  f.user('u1', 'When I have time', 'hi-item'); await f.advance(6000); assert.equal(f.events.filter(e => e.type === 'response.create').length, 1);
  f.user('u2', "That's all for today.", 'u1'); await f.advance(1001); assert.equal(f.events.filter(e => e.type === 'response.create').length, 2); assert.equal(f.events.at(-1).response.metadata.purpose, 'closing'); assert.equal(f.track.enabled, false);
});
test('review media drives captions, seeks by utterance, resumes exactly, and loops without regenerating audio', async () => {
  const f = fixture(); await settle();
  f.setRecord({ id: 'ready', scene: 'cafe', mode: 'grammar', grammar: 'when', title: 'Saved chat', createdAt: new Date().toISOString(), status: 'finished', annotationStatus: 'ready', audioUrl: '/private/ready.wav', turns: Array.from({ length: 6 }, (_, i) => ({ id: 't' + i, role: i % 2 ? 'user' : 'assistant', text: 'Turn ' + i, ja: '日本語 ' + i })), review: { status: 'ready', duration: 12, cues: Array.from({ length: 6 }, (_, i) => ({ start: i * 2, end: i * 2 + 1.8 })) } });
  await f.nodes['tab-history'].onclick(); await f.nodes['history-list'].children[0].onclick(); const media = f.nodes['review-audio']; media.duration = 12;
  await f.nodes.play.onclick(); assert.equal(media.paused, false); media.currentTime = 6.1; media.ontimeupdate(); assert.equal(f.nodes.position.textContent, '発言 4 / 6'); assert(f.nodes.subtitles.scrollTop > 0);
  f.nodes.subtitles.children[1].onclick(); assert.equal(media.currentTime, 2); assert.equal(media.paused, false);
  await f.nodes.play.onclick(); const at = media.currentTime; await f.nodes.play.onclick(); assert.equal(media.currentTime, at);
  f.nodes.repeat.onclick(); assert.equal(media.loop, true); media.currentTime = 0; media.ontimeupdate(); assert.equal(f.nodes.position.textContent, '発言 1 / 6');
  f.nodes.translations.onclick(); assert(f.nodes.subtitles.children.every(n => n.children[2].hidden));
  assert.equal(f.requests.filter(r => r.url.endsWith('/review') && r.body).length, 0, 'repeated playback must use saved audio'); assert.deepEqual(f.warnings, []);
});

test('same-settings practice starts a fresh live session, retaining custom role and grammar but no old spoken turns', async () => {
  const f = fixture(); await settle();
  const scenario = { request: '友人の恋人と初対面', title: '初めての会話', relationship: '友人の恋人と初対面', place: '友人の家', time: '夕食前', partnerName: 'Alex', context: '共通の友人の紹介で会う。', assumed: [] };
  f.setRecord({ id: 'old-record', scene: 'custom', scenario, mode: 'grammar', grammar: 'even though', title: '以前の会話', createdAt: new Date().toISOString(), status: 'finished', annotationStatus: 'ready', audioUrl: '/old.wav', turns: [{ id: 'old-utterance', role: 'user', text: 'Previously spoken words.' }], review: { status: 'ready', duration: 1, cues: [{ start: 0, end: 1 }] } });
  await f.nodes['tab-history'].onclick(); await f.nodes['history-list'].children[0].onclick();
  await f.nodes['retry-practice'].onclick();
  const opening = f.requests.find(r => r.url.endsWith('/sessions') && r.body);
  assert.deepEqual(opening.body.scenario, scenario); assert.equal(opening.body.grammar, 'even though'); assert(!opening.body.id); assert(!opening.body.turns);
  assert.equal(f.nodes['live-partner'].textContent, 'Alex'); assert.equal(f.nodes.chat.children.length, 0);
  assert.match(f.events.find(e => e.type === 'response.create').response.instructions, /Alex/);
  assert(!f.events.some(e => JSON.stringify(e).includes('Previously spoken')));
  assert.equal(f.requests.filter(r => r.url.endsWith('/review') && r.body).length, 0);
  assert.equal(f.nodes.review.hidden, true); assert.equal(f.saved().id, 'old-record');
});

test('conversation cannot start without confirming scenario settings', async () => {
  const f = fixture(); await settle(); f.setSettings(null); await f.nodes.start.onclick();
  assert.match(f.nodes.error.textContent, /設定を確認/);
  assert.equal(f.requests.filter(r => r.url.endsWith('/sessions') && r.body).length, 0);
});
