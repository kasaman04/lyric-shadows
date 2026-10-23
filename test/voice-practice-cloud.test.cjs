'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { SupabaseVoiceStore } = require('../lib/voice-practice-cloud');
test('private cloud metadata and audio survive a fresh server disk; storage failures stay visible', async t => {
  const dirs = await Promise.all([1, 2].map(() => fs.mkdtemp(path.join(os.tmpdir(), 'vp-cloud-'))));
  t.after(async () => { for (const dir of dirs) { assert.equal(path.dirname(dir), os.tmpdir()); assert(path.basename(dir).startsWith('vp-cloud-')); await fs.rm(dir, { recursive: true, force: true }); } });
  const objects = new Map(); let bucket, broken = false;
  const remote = async (url, init) => {
    assert.equal(init.headers.apikey, 'test-server-secret');
    if (broken) return new Response('', { status: 503 });
    const endpoint = url.split('/storage/v1')[1];
    if (endpoint === '/bucket') { bucket = JSON.parse(init.body); assert.equal(bucket.public, false); return Response.json(bucket); }
    if (endpoint === '/bucket/voice-practice') return bucket ? Response.json(bucket) : new Response('', { status: 404 });
    if (endpoint.startsWith('/object/list/')) return Response.json([...objects.keys()].sort().map(name => ({ name })));
    if (endpoint.startsWith('/object/authenticated/voice-practice/')) { const value = objects.get(endpoint.split('/').pop()); return value ? new Response(value) : new Response('', { status: 404 }); }
    assert(endpoint.startsWith('/object/voice-practice/')); assert.equal(init.headers['x-upsert'], 'true'); objects.set(endpoint.split('/').pop(), Buffer.from(init.body)); return Response.json({});
  };
  const env = { SUPABASE_URL: 'https://storage.example', SUPABASE_SECRET_KEY: 'test-server-secret' };
  const store = new SupabaseVoiceStore(dirs[0], env, remote), id = crypto.randomUUID();
  await store.write({ id, owner: 'owner-a', createdAt: '2026-10-24', turns: [{ text: 'Hello.' }] });
  await store.saveAudio(id, Buffer.from('RIFFmock-wav'));
  const restarted = new SupabaseVoiceStore(dirs[1], env, remote);
  assert.equal((await restarted.list('owner-a')).length, 1); assert.equal((await restarted.list('owner-b')).length, 0);
  assert.equal((await fs.readFile(await restarted.audioFile(id))).toString(), 'RIFFmock-wav');
  await restarted.update(id, record => { record.summary = 'saved after restart'; });
  assert.equal((await store.read(id)).summary, 'saved after restart');
  broken = true; await assert.rejects(restarted.write({ id }), { status: 503 });
  bucket.public = true; const unsafe = new SupabaseVoiceStore(dirs[1], env, remote); broken = false;
  await assert.rejects(unsafe.all(), { status: 503 });
});
