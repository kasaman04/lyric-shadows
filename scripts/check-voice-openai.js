'use strict';
// Minimal live checks. Never print API keys, ephemeral secrets or raw provider errors.
const path = require('node:path');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const express = require('express');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const C = require('../public/voice-practice-core');
const { mountVoicePractice, Store, sessionConfig } = require('../lib/voice-practice');
const dir = path.join(__dirname, '../tmp/voice-practice-smoke/openai-check');
const report = { checkedAt: new Date().toISOString() };
const safe = value => typeof value === 'string' && /^[a-zA-Z0-9_.-]{1,100}$/.test(value) ? value : undefined;
async function diagnostic(response) {
  let value; try { value = await response.clone().json(); } catch {}
  return { status: response.status, code: safe(value?.error?.code), type: safe(value?.error?.type), parameter: safe(value?.error?.param) };
}
(async () => {
  if (!process.env.OPENAI_API_KEY?.trim()) throw new Error('key_missing');
  const env = { ...process.env, ELEVENLABS_API_KEY: '', VOICE_PRACTICE_DATA_DIR: dir };
  const auth = { Authorization: 'Bearer ' + env.OPENAI_API_KEY, 'Content-Type': 'application/json' };
  const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST', headers: auth, signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ expires_after: { anchor: 'created_at', seconds: 60 }, session: sessionConfig(C.settings({ grammar: 'when' }), env) })
  });
  report.realtime = { ok: response.ok, ...(await diagnostic(response)) };
  console.log(JSON.stringify({ stage: 'realtime', ...report.realtime }));
  if (!response.ok) { process.exitCode = 2; return; }
  const upstream = [];
  const fetcher = async (url, init) => { const r = await fetch(url, init); if (!r.ok) upstream.push(await diagnostic(r)); return r; };
  const app = express(); app.use(express.json({ limit: '256kb' }));
  const store = new Store(dir); mountVoicePractice(app, { env, fetcher, store });
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  try {
    const base = 'http://127.0.0.1:' + server.address().port + '/api/voice-practice';
    const res = await fetch(base + '/scenarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ request: 'カフェで友達と週末の予定を話す' }) });
    const result = await res.json();
    report.scenario = { ok: res.ok && Boolean(result.scenario?.partnerName), status: res.status, ...(upstream.at(-1) ? { provider: upstream.at(-1) } : {}) };
    console.log(JSON.stringify({ stage: 'scenario', ...report.scenario }));
    if (!report.scenario.ok) { process.exitCode = 2; return; }
    const token = /vp_owner=([a-f0-9]{64})/.exec(res.headers.get('set-cookie') || '')?.[1];
    const id = crypto.randomUUID();
    await store.write({ id, owner: crypto.createHash('sha256').update(token).digest('hex'), ...C.settings({ scenario: result.scenario, grammar: 'when' }), status: 'active', createdAt: new Date().toISOString(), turns: [], review: { status: 'not_requested' } });
    const hints = await fetch(base + '/sessions/' + id + '/hints', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: 'vp_owner=' + token }, body: JSON.stringify({ turns: [{ id: 'a', role: 'assistant', text: 'How do you and your friend know each other?' }], partial: '' }) });
    const data = await hints.json();
    report.hints = { ok: hints.ok && data.candidates?.length === 3, status: hints.status, variedOpenings: data.candidates?.filter(c => !/^\s*(?:i|you)\b/i.test(c.english)).length, ...(upstream.at(-1) ? { provider: upstream.at(-1) } : {}) };
    console.log(JSON.stringify({ stage: 'hints', ...report.hints }));
    if (!report.hints.ok) process.exitCode = 2;
    const savedSample = path.join(__dirname, '../tmp/voice-practice-smoke/latest-check.json');
    try {
      const sample = JSON.parse(await fs.readFile(savedSample, 'utf8'));
      // Only the already-generated synthetic smoke sample; no song or user recording.
      const allowed = path.resolve(__dirname, '../tmp/voice-practice-smoke');
      if (path.dirname(path.resolve(sample.file)) !== allowed) throw new Error('unexpected_sample');
      const audio = await fs.readFile(sample.file);
      const transcribed = await fetch(base + '/scene-transcription', { method: 'POST', headers: { 'Content-Type': 'audio/wav', Cookie: 'vp_owner=' + token }, body: audio });
      const text = await transcribed.json(); report.transcription = { ok: transcribed.ok && Boolean(text.text), status: transcribed.status, ...(upstream.at(-1) ? { provider: upstream.at(-1) } : {}) };
      console.log(JSON.stringify({ stage: 'transcription', ...report.transcription }));
      if (!report.transcription.ok) process.exitCode = 2;
    } catch { report.transcription ||= { skipped: true, reason: 'synthetic_sample_unavailable' }; }
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
})().catch(() => { report.error = 'Connection check did not complete; no credentials or provider response were printed.'; console.error(report.error); process.exitCode = 1; })
  .finally(async () => { await fs.mkdir(dir, { recursive: true }); await fs.writeFile(path.join(dir, 'latest-check.json'), JSON.stringify(report, null, 2)); });
