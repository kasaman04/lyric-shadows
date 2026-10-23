'use strict';
const fs = require('node:fs/promises');
const { Store } = require('./voice-practice');
const { headersFor, supabaseBase } = require('./pet-cloud');
const unavailable = () => Object.assign(new Error('会話の保存先に接続できません。もう一度お試しください。'), { status: 503 });
class SupabaseVoiceStore extends Store {
  constructor(dir, env, fetcher = fetch) {
    super(dir); this.base = supabaseBase(env.SUPABASE_URL) + '/storage/v1';
    const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
    this.configured = Boolean(env.SUPABASE_URL && key); this.headers = headersFor(key || '');
    this.fetcher = fetcher; this.bucket = 'voice-practice'; this.initializing = null;
  }
  async request(endpoint, init = {}) {
    if (!this.configured) throw unavailable();
    try { return await this.fetcher(this.base + endpoint, { ...init, headers: { ...this.headers, ...init.headers }, signal: AbortSignal.timeout(60000) }); }
    catch { throw unavailable(); }
  }
  async ensure() {
    if (!this.initializing) this.initializing = (async () => {
      let response = await this.request('/bucket/' + this.bucket);
      if (response.status === 404 || response.status === 400) {
        await this.request('/bucket', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: this.bucket, name: this.bucket, public: false, file_size_limit: 52428800, allowed_mime_types: ['application/json', 'audio/wav'] }) });
        response = await this.request('/bucket/' + this.bucket);
      }
      if (!response.ok || (await response.json()).public !== false) throw unavailable();
    })().catch(error => { this.initializing = null; throw error; });
    return this.initializing;
  }
  async put(name, bytes, type) {
    await this.ensure(); const response = await this.request('/object/' + this.bucket + '/' + name, { method: 'POST', headers: { 'Content-Type': type, 'x-upsert': 'true' }, body: bytes });
    if (!response.ok) throw unavailable();
  }
  async get(name, limit) {
    await this.ensure(); const response = await this.request('/object/authenticated/' + this.bucket + '/' + name);
    if (response.status === 400 || response.status === 404) throw Object.assign(new Error('会話が見つかりません。'), { status: 404 });
    if (!response.ok || Number(response.headers.get('content-length')) > limit) throw unavailable();
    const bytes = Buffer.from(await response.arrayBuffer()); if (bytes.length > limit) throw unavailable(); return bytes;
  }
  async read(id) { this.file(id); return JSON.parse((await this.get(id + '.json', 4 * 1024 * 1024)).toString('utf8')); }
  async write(record) { this.file(record.id); await this.put(record.id + '.json', JSON.stringify(record), 'application/json'); return record; }
  async all() {
    await this.ensure(); const records = [];
    for (let offset = 0; ; offset += 100) {
      const response = await this.request('/object/list/' + this.bucket, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefix: '', limit: 100, offset, sortBy: { column: 'name', order: 'asc' } }) });
      if (!response.ok) throw unavailable(); const entries = await response.json();
      if (!Array.isArray(entries)) throw unavailable();
      for (const entry of entries) if (/^[a-f0-9-]{36}\.json$/.test(entry.name)) records.push(await this.read(entry.name.slice(0, -5)));
      if (entries.length < 100) return records;
    }
  }
  async saveAudio(id, bytes) { this.file(id); await this.put(id + '.wav', bytes, 'audio/wav'); await super.saveAudio(id, bytes); }
  async audioFile(id) {
    const file = await super.audioFile(id);
    try { await fs.access(file); } catch { await super.saveAudio(id, await this.get(id + '.wav', 104857600)); }
    return file;
  }
}
module.exports = { SupabaseVoiceStore };
