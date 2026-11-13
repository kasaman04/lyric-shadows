'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Run the real server route handlers without opening sockets, starting a
// worker, loading dotenv, or reaching a database. All keys below are fake.
function fixture(env) {
  const routes = new Map(), requests = [];
  const app = { use() {}, set() {}, listen() {} };
  for (const method of ['get', 'put', 'post', 'patch', 'delete']) {
    app[method] = (url, handler) => routes.set(method + ' ' + url, handler);
  }
  const express = () => app;
  express.json = express.static = () => () => {};
  const axios = {
    async get(url, options) {
      requests.push({ method: 'GET', url, ...options });
      return { data: [{ saved_phrase_ids: ['phrase-1'], hidden_phrase_ids: ['phrase-2'] }] };
    },
    async post(url, body, options) {
      requests.push({ method: 'POST', url, body, ...options });
      return { data: null };
    }
  };
  const modules = {
    express, path, axios,
    'fs-extra': { async ensureDir() {} },
    dotenv: { config() {} },
    './lib/generate': {},
    './lib/voice-catalog': { VOICE_PROFILES: [], VOICE_BY_ID: new Map() },
    './lib/pet-cloud': require('../lib/pet-cloud'),
    './lib/pet-api': { mountPetApi: () => ({ store: {} }) },
    './lib/sentence-game': { mountSentenceGame() {} },
    './lib/pet-worker-launcher': { startLocalWorker() {} }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8'), {
    require(name) { assert.ok(Object.hasOwn(modules, name), 'Unexpected dependency: ' + name); return modules[name]; },
    process: { env: { ...env } }, __dirname: path.join(__dirname, '..'), console
  }, { filename: 'server.js' });
  return {
    requests,
    async call(method, deviceId = 'test-device-0001', body = {}) {
      const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
      await routes.get(method + ' /api/phrase-preferences/:deviceId')({ params: { deviceId }, body }, res);
      return res;
    }
  };
}

test('anonymous-only or partial configuration refuses reads and writes without DB requests', async () => {
  for (const env of [
    { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_ANON_KEY: 'anon-test-only' },
    { SUPABASE_URL: 'https://test.supabase.co' },
    { SUPABASE_SECRET_KEY: 'sb_secret_test-only' },
    { SUPABASE_ANON_KEY: 'anon-test-only' }
  ]) {
    const f = fixture(env);
    for (const method of ['get', 'put']) {
      const response = await f.call(method);
      assert.equal(response.statusCode, 503);
      assert.equal(response.body.saved, undefined);
      assert.equal(response.body.savedPhraseIds, undefined);
    }
    assert.equal(f.requests.length, 0);
  }
});

test('no cloud configuration preserves explicitly disabled local mode', async () => {
  const f = fixture({});
  assert.equal((await f.call('get')).body.enabled, false);
  assert.equal((await f.call('put')).body.enabled, false);
  assert.equal(f.requests.length, 0);
});

test('secret and legacy service keys preserve preference reads and upserts', async () => {
  for (const env of [
    { SUPABASE_SECRET_KEY: 'sb_secret_test-only' },
    { SUPABASE_SERVICE_ROLE_KEY: 'eyJservice-test-only', SUPABASE_SECRET_KEY: 'sb_secret_unused' }
  ]) {
    const f = fixture({ SUPABASE_URL: 'https://test.supabase.co/rest/v1/', SUPABASE_ANON_KEY: 'anon-unused', ...env });
    const read = await f.call('get');
    assert.equal(read.statusCode, 200);
    assert.equal(read.body.savedPhraseIds[0], 'phrase-1');
    assert.equal(read.body.hiddenPhraseIds[0], 'phrase-2');
    const saved = await f.call('put', 'test-device-0001', { savedPhraseIds: ['phrase-1', 'phrase-1', 'invalid!'], hiddenPhraseIds: ['phrase-2'] });
    assert.equal(saved.body.saved, true);
    assert.equal(f.requests[1].params.on_conflict, 'device_id');
    assert.equal(f.requests[1].body.device_id, 'test-device-0001');
    assert.equal(f.requests[1].body.saved_phrase_ids.join(','), 'phrase-1');
    assert.equal(f.requests[1].body.hidden_phrase_ids.join(','), 'phrase-2');
    for (const request of f.requests) {
      const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
      assert.equal(request.url, 'https://test.supabase.co/rest/v1/user_phrase_preferences');
      assert.equal(request.headers.apikey, key);
      assert.equal(request.headers.Authorization, key.startsWith('eyJ') ? 'Bearer ' + key : undefined);
    }
    const before = f.requests.length;
    assert.equal((await f.call('get', 'invalid!')).statusCode, 400);
    assert.equal((await f.call('put', 'invalid!')).statusCode, 400);
    assert.equal(f.requests.length, before);
  }
});
