'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');
const { mountPetApi } = require('../lib/pet-api');

test('production requires persistent storage and accepts same-site HTTPS behind the Render proxy', async () => {
  const keys = ['NODE_ENV', 'PET_DATA_DIR', 'PET_STORAGE'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const dir = await fs.mkdtemp(path.join(__dirname, '../tmp/pet-production-'));
  const servers = [];
  async function serve() {
    const app = express();
    app.set('trust proxy', 1);
    app.use(express.json());
    const api = mountPetApi(app);
    const server = await new Promise(resolve => {const server = app.listen(0, '127.0.0.1', () => resolve(server));});
    servers.push(server);
    return {api, base: 'http://127.0.0.1:' + server.address().port};
  }
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.PET_DATA_DIR;
    delete process.env.PET_STORAGE;
    const unconfigured = await serve();
    const blocked = await fetch(unconfigured.base + '/api/pet/production-device-001');
    assert.equal(blocked.status, 503);
    process.env.PET_DATA_DIR = dir;
    const ready = await serve();
    const headers = {'Content-Type': 'application/json', 'X-Forwarded-Proto':'https', Origin:ready.base.replace('http:', 'https:')};
    const body = JSON.stringify({type:'select',element:'water',requestId:'production-selection-001'});
    const selection = await fetch(ready.base + '/api/pet/production-device-001/care', {method:'POST',headers,body});
    assert.equal(selection.status, 200);
    assert.equal((await selection.json()).pets[0].element, 'water');
    const forbidden = await fetch(ready.base + '/api/pet/production-device-001/care', {method:'POST',headers:{...headers,Origin:'https://unrelated.test'},body});
    assert.equal(forbidden.status, 403);
    const restarted = await serve();
    const saved = await (await fetch(restarted.base + '/api/pet/production-device-001')).json();
    assert.equal(saved.pets[0].element, 'water');
    await ready.api.idle();
    ready.api.designer.close();
  } finally {
    await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
    for (const key of keys) {if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];}
    await fs.rm(dir, {recursive:true,force:true,maxRetries:3,retryDelay:50});
  }
});
