'use strict';
// Use the supported app-server JSON-RPC protocol. Never read/export login tokens.
const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { PetImages, evolutionPrompt, motionPrompt } = require('./pet-image');
async function executable() {
  if (process.env.CODEX_APP_SERVER_BIN) return process.env.CODEX_APP_SERVER_BIN;
  if (process.platform !== 'win32') return null;
  const dir = path.join(os.homedir(), 'AppData', 'Local', 'OpenAI', 'Codex', 'bin');
  try {
    for (const folder of (await fs.readdir(dir)).reverse()) {
      const file = path.join(dir, folder, 'codex.exe');
      try { await fs.access(file); return file; } catch {}
    }
  } catch {}
  return null;
}
class PetDesigner {
  constructor({ images = new PetImages() } = {}) { this.images = images; this.pending = new Map(); this.nextId = 1; this.turns = new Map(); this.status = 'unconnected'; this.serial = Promise.resolve(); }
  async connect() {
    if (this.connecting) return this.connecting;
    this.connecting = this.start().catch(e => { this.status = 'unavailable'; this.connecting = null; this.close(); throw e; });
    return this.connecting;
  }
  async start() {
    if (process.env.PET_AI_ENABLED === 'false' || (process.env.NODE_ENV === 'production' && process.env.PET_AI_ENABLED !== 'true')) throw new Error('AI designer is not enabled');
    const bin = await executable();
    if (!bin) throw new Error('Codex app-server executable is not configured');
    this.workdir = path.join(process.env.PET_DATA_DIR || path.join(__dirname, '..', 'data', 'pets'), 'designer');
    await fs.mkdir(this.workdir, { recursive: true });
    this.child = spawn(bin, ['app-server', '--enable', 'image_generation', '--listen', 'stdio://'], { cwd: this.workdir, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    this.child.stderr.resume();
    const lines = readline.createInterface({ input: this.child.stdout });
    lines.on('line', line => { try { this.receive(JSON.parse(line)); } catch {} });
    this.child.on('error', () => this.failAll(new Error('app-server could not start')));
    this.child.on('exit', () => { this.connecting = null; this.status = 'unavailable'; this.failAll(new Error('app-server stopped')); });
    await this.call('initialize', { clientInfo: { name: 'lyric_shadows_pet', title: 'Lyric Shadows Pet Designer', version: '1.0.0' }, capabilities: { experimentalApi: true } });
    this.send({ method: 'initialized' });
    const account = await this.call('account/read', { refreshToken: false });
    if (!account.account) throw new Error('Codex login is required');
    this.status = 'connected';
    return this.status;
  }
  send(value) { this.child.stdin.write(JSON.stringify(value) + '\n'); }
  call(method, params) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('app-server request timed out')); }, 20000);
      this.pending.set(id, { resolve, reject, timer }); this.send({ id, method, params });
    });
  }
  receive(message) {
    if (message.id != null && this.pending.has(message.id)) {
      const task = this.pending.get(message.id); this.pending.delete(message.id); clearTimeout(task.timer);
      if (message.error) task.reject(new Error(message.error.message)); else task.resolve(message.result);
    } else if (message.id != null && message.method) {
      // This designer must never approve execution, file access or external actions.
      this.send({ id: message.id, error: { code: -32601, message: 'Tools are not available to the pet designer' } });
    } else if (message.method) {
      const p = message.params || {}, task = this.turns.get(p.threadId);
      if (!task) return;
      if (message.method === 'item/completed' && p.item?.type === 'agentMessage') task.text = p.item.text;
      if (message.method === 'item/completed' && p.item?.type === 'imageGeneration') task.image = p.item;
      if (message.method === 'turn/completed') {
        if (p.turn?.status === 'completed') task.resolve(task.image || p.turn.items?.find(item => item.type === 'imageGeneration'));
        else task.reject(new Error('Creature design did not complete'));
      }
    }
  }
  failAll(error) {
    for (const task of this.pending.values()) { clearTimeout(task.timer); task.reject(error); }
    this.pending.clear(); for (const task of this.turns.values()) task.reject(error); this.turns.clear();
  }
  close() { this.child?.kill(); }
  design(species, form, previousImageUrl) {
    return this.render(evolutionPrompt(species,form),previousImageUrl,false);
  }
  motion(form, portraitUrl, petId) { return this.render(motionPrompt(form),portraitUrl,true,petId); }
  render(prompt, referenceUrl, motion, petId) {
    const job = this.serial.catch(() => {}).then(async () => {
      await this.connect();
      const thread = await this.call('thread/start', {
        cwd: this.workdir, ephemeral: true, approvalPolicy: 'never', sandbox: 'read-only',
        config: { 'features.image_generation': true },
        developerInstructions: 'You generate real raster character artwork. You MUST use the built-in image generation tool exactly once with a transparent background. Follow the prompt layout exactly, including sprite-sheet frame counts when requested. Preserve the attached character identity, elemental palette, simple black outline and tiny face. Never substitute code, SVG or a description. Never call shell, filesystem, web, Python, MCP or other tools, or read files other than the provided image. Hands are empty, no bowls or props. Finish the turn after the image.'
      });
      const threadId = thread.thread.id;
      try {
        const result = new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            this.call('turn/interrupt', { threadId, turnId: this.turns.get(threadId)?.turnId }).catch(() => {});
            reject(new Error('Creature design timed out'));
          }, 300000);
          this.turns.set(threadId, { text: '', image: null, resolve: image => { clearTimeout(timer); resolve(image); }, reject: e => { clearTimeout(timer); reject(e); } });
        });
        // Attach rejection immediately, even if turn/start itself fails.
        result.catch(() => {});
        const referencePath = await this.images.referenceReady(referenceUrl);
        const turn = await this.call('turn/start', { threadId, input: [{ type: 'text', text: prompt }, { type: 'localImage', path: referencePath }] });
        this.turns.get(threadId).turnId = turn.turn.id;
        const bytes = await this.images.readGenerated(await result, this.workdir);
        return motion ? this.images.saveMotion(bytes,petId) : this.images.save(bytes);
      } finally {
        const task = this.turns.get(threadId); if (task) task.reject(new Error('Design request finished'));
        this.turns.delete(threadId);
      }
    });
    this.serial = job; return job;
  }
}
module.exports = { PetDesigner, executable };
