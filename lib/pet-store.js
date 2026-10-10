'use strict';
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const rules = require('../public/pet-rules');
const legacyRules = require('../public/pet-legacy-rules');
const { STARTER_URL, migrateImages } = require('./pet-image');
const DAY = 86400000;
const starterMotions = require('../public/pet-images/motion-manifest.json');
function retireMotion(pet) {
  const form=pet.forms.at(-1);
  if (form?.motion?.url?.startsWith('/api/pet-motion/')) (pet.retiredMotions ||= []).push(form.motion.url);
  if(form) delete form.motion;
}
function error(message, status = 400) { return Object.assign(new Error(message), { status }); }
function newPet(now, elementId = 'grass') {
  const id = crypto.randomUUID();
  const element = rules.element(elementId);
  if (!element) throw error('モンスターの属性を選んでください。');
  return { id, name: element.name, element: element.id, bornAt: now, lastFedAt: now, diedAt: null, departedAt: null, seconds: 0, growthSeconds: 0,
    stats: { body: 0, power: 0, brain: 0 }, seed: parseInt(id.slice(0, 7), 16),
    forms: [{ level: 1, species: rules.species(element.id,1).id, name: element.name, element: element.id, at: now, stats: { body: 0, power: 0, brain: 0 }, imageUrl: element.imageUrl, imageSource: 'imagegen', motion: {...starterMotions[element.id]} }] };
}
function createState(now) { return { version: 3, bankSeconds: 0, totalSeconds: 0, daily: {}, intervals: [], actions: [], pets: [] }; }
function pendingDesign(p,state) {
  if(p.needsStarter)return false;
  const portrait=p.forms.find(f=>f.level>=2&&!f.imageUrl);
  if(portrait)return !portrait.imageErrorAt;
  const form=p.forms.at(-1);
  return p===state.pets.at(-1)&&!rules.ended(p)&&!!form.imageUrl&&!form.motion&&!form.motionErrorAt;
}
function migrateGrowth(state) {
  if (state.version >= 3) return;
  for (const pet of state.pets) {
    pet.growthSeconds ??= pet.seconds || 0;
    pet.legacyLevel = legacyRules.progress(pet.growthSeconds).level;
    pet.legacyForms = pet.forms.map(form=>({...form,name:legacyRules.catalog[form.species-1]?.name || pet.name}));
    const last = pet.forms.at(-1), level = rules.progress(pet.growthSeconds).level;
    pet.element = 'grass'; pet.departedAt = null;
    pet.needsStarter = pet === state.pets.at(-1) && !pet.diedAt && pet.legacyLevel === 1;
    const species=rules.species(pet.element,level);
    pet.forms=[{...last,level,species:species.id,name:species.name,element:pet.element,stats:{...pet.stats}}];
    delete pet.forms[0].motion;
  }
  state.version = 3;
}
function age(state, now) {
  const pet = state.pets.at(-1);
  if (pet && !rules.ended(pet) && now >= pet.lastFedAt + 3 * DAY) { pet.diedAt = pet.lastFedAt + 3 * DAY; retireMotion(pet); }
}
function evolve(pet, now) {
  const level = rules.progress(rules.growth(pet)).level;
  for (let next = pet.forms.at(-1).level + 1; next <= level; next++) {
    const species = rules.species(pet.element,next);
    // Historical portraits remain; only the current form keeps motion metadata.
    retireMotion(pet);
    pet.forms.push({ level: next, species: species.id, name: species.name, element: pet.element, direction: rules.dominant(pet.stats), at: now, stats: { ...pet.stats } });
  }
}
function uncovered(intervals, start, end) {
  let pieces = [[start, end]];
  for (const [a, b] of intervals) {
    pieces = pieces.flatMap(([s, e]) => b <= s || a >= e ? [[s, e]] : [[s, Math.min(e, a)], [Math.max(s, b), e]].filter(([x, y]) => y > x));
  }
  return pieces;
}
function merge(intervals) {
  const out = [];
  intervals.sort((a, b) => a[0] - b[0]).forEach(([s, e]) => {
    if (out.length && s <= out.at(-1)[1] + 1) out.at(-1)[1] = Math.max(e, out.at(-1)[1]);
    else out.push([s, e]);
  });
  return out;
}
function listen(state, events, now) {
  if (!Array.isArray(events) || events.length > 250) throw error('再生記録の形式が正しくありません。');
  const valid = events.map(event => {
    const start = Number(event.start), end = Number(event.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || end - start > 30000 || end > now + 5000 || start < now - 7 * DAY) throw error('再生記録の時刻が正しくありません。');
    return { start, end, petId: event.petId };
  }).sort((a, b) => a.start - b.start);
  state.intervals = state.intervals.filter(([, end]) => end >= now - 7 * DAY);
  for (const { start, end, petId } of valid) {
    const pieces = uncovered(state.intervals, start, end);
    const pet = state.pets.find(p => p.id === petId);
    for (const [s, e] of pieces) {
      const seconds = (e - s) / 1000;
      state.bankSeconds += seconds; state.totalSeconds += seconds;
      let cursor = s;
      while (cursor < e) {
        const day = rules.dayKey(cursor), boundary = Date.parse(day + 'T15:00:00Z');
        const finish = Math.min(e, boundary);
        state.daily[day] = (state.daily[day] || 0) + (finish - cursor) / 1000;
        cursor = finish;
      }
      const death = pet && (pet.diedAt || pet.departedAt || pet.lastFedAt + 3 * DAY);
      if (pet && s >= pet.bornAt && s < death) {
        pet.seconds += (Math.min(e, death) - s) / 1000;
      }
    }
    state.intervals = merge([...state.intervals, [start, end]]);
  }
}
function action(state, body, now) {
  if (!/^[a-zA-Z0-9-]{12,80}$/.test(body.requestId || '')) throw error('操作IDが必要です。');
  if (state.actions.includes(body.requestId)) return;
  age(state, now);
  const pet = state.pets.at(-1);
  if (body.type === 'select' || body.type === 'restart') {
    if (!rules.element(body.element)) throw error('モンスターの属性を選んでください。');
    if (pet && !rules.ended(pet) && !pet.needsStarter) throw error('今の子を育成中です。',409);
    if (pet?.needsStarter && !rules.ended(pet)) {
      const chosen = newPet(now,body.element);
      Object.assign(pet,{element:chosen.element,name:chosen.name,needsStarter:false});
      const species=rules.species(pet.element,rules.progress(pet.growthSeconds).level);
      pet.forms=[{...chosen.forms[0],level:species.stage,species:species.id,name:species.name,stats:{...pet.stats}}];
    } else state.pets.push(newPet(now,body.element));
  } else {
    if (!pet) throw error('最初の相棒を選んでください。',409);
    if (body.petId !== pet.id) throw error('育成中の子が変わりました。もう一度開いてください。', 409);
    if (rules.ended(pet)) throw error('この子の育成は終わりました。', 409);
    if (pet.needsStarter) throw error('最初の相棒を選んでください。',409);
    if (body.type === 'depart') {
      if (rules.progress(pet.growthSeconds).level < rules.maxLevel) throw error('Lv.10まで育てたら、旅立ちを見送れます。',409);
      pet.departedAt = now; retireMotion(pet);
      state.actions.push(body.requestId); state.actions=state.actions.slice(-2000); return;
    }
    const stat = { food: 'body', power: 'power', brain: 'brain' }[body.type];
    if (!stat) throw error('お世話の種類が正しくありません。');
    const seconds = body.seconds === undefined ? 300 : body.seconds;
    if (!rules.careAmounts.includes(seconds)) throw error('使う時間は5分・30分・1時間から選んでください。');
    if (state.bankSeconds + 0.001 < seconds) throw error(`使える時間が足りません。${seconds / 60}分を貯めてからお世話してください。`, 409);
    state.bankSeconds = Math.max(0, state.bankSeconds - seconds);
    // Process each five-minute unit so a bulk action saves the stats at each evolution.
    for (let spent = 0; spent < seconds; spent += 300) {
      pet.stats[stat]++;
      pet.growthSeconds = rules.growth(pet) + 300;
      evolve(pet, now);
    }
    if (body.type === 'food') pet.lastFedAt = now;
  }
  state.actions.push(body.requestId); state.actions = state.actions.slice(-2000);
}
class PetStore {
  constructor({ dir = process.env.PET_DATA_DIR || path.join(__dirname, '..', 'data', 'pets'), clock = Date.now, remote = null } = {}) {
    this.dir = dir; this.clock = clock; this.remote = remote; this.locks = new Map();
  }
  async transact(id, change = () => {}) {
    if (!/^[a-zA-Z0-9-]{12,80}$/.test(id)) throw error('端末IDが正しくありません。');
    const before = this.locks.get(id) || Promise.resolve();
    const run = before.catch(() => {}).then(async () => {
      const file = path.join(this.dir, id + '.json');
      let state;
      for(let attempt=0; ; attempt++) {
      if (this.remote) state = await this.remote.load(id);
      else {
        try { state = JSON.parse(await fs.readFile(file, 'utf8')); }
        catch (e) { if (e.code !== 'ENOENT') throw e; }
      }
      const expectedRevision=state ? (state.revision || 0) : undefined;
      const now = this.clock(); state ||= createState(now);
      migrateGrowth(state);
      migrateImages(state);
      age(state, now); await change(state, now); age(state, now);
      state.revision = (state.revision || 0) + 1;
      if(this.remote)state.designPending=state.pets.some(p=>pendingDesign(p,state));
      if (this.remote) {
        try { await this.remote.save(id, state, expectedRevision); }
        catch(e) {if(e.code==='PET_CONFLICT'&&attempt<7)continue;throw e;}
      }
      else {
        await fs.mkdir(this.dir, { recursive: true });
        const temp = file + '.' + crypto.randomUUID() + '.tmp';
        await fs.writeFile(temp, JSON.stringify(state));
        for (let attempt = 0; ; attempt++) {
          try { await fs.rename(temp, file); break; }
          catch (e) {
            if (attempt >= 3 || !['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) throw e;
            await new Promise(resolve => setTimeout(resolve, 25 * (attempt + 1)));
          }
        }
      }
      return { ...state, intervals: undefined, actions: undefined, serverNow: now };
      }
    });
    this.locks.set(id, run);
    try { return await run; } finally { if (this.locks.get(id) === run) this.locks.delete(id); }
  }
}
function supabaseStorage(url, key) {
  const {headersFor,supabaseBase}=require('./pet-cloud');
  const headers = { ...headersFor(key), 'Content-Type': 'application/json' };
  async function request(suffix, options = {}) {
    const response = await fetch(supabaseBase(url) + '/rest/v1/user_pet_states' + suffix, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(10000) });
    if(response.status===409)throw Object.assign(error('保存が重なりました。もう一度試してください。',409),{code:'PET_CONFLICT'});
    if (!response.ok) throw error('育成の保存先に接続できません。サーバーの保存設定を確認してください。', 503);
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
  return {
    async load(id) { return (await request('?device_id=eq.' + encodeURIComponent(id) + '&select=state'))[0]?.state; },
    async save(id, state, expectedRevision) {
      const body=JSON.stringify({device_id:id,state,updated_at:new Date().toISOString()});
      if(expectedRevision===undefined){await request('',{method:'POST',headers:{Prefer:'return=minimal'},body});return;}
      const revision=expectedRevision===0?'&or=(state->>revision.is.null,state->>revision.eq.0)':'&state->>revision=eq.'+expectedRevision;
      const result=await request('?device_id=eq.'+encodeURIComponent(id)+revision+'&select=device_id',{method:'PATCH',headers:{Prefer:'return=representation'},body});
      if(!result?.length)throw Object.assign(error('保存が重なりました。もう一度試してください。',409),{code:'PET_CONFLICT'});
    },
    async pending(){return (await request('?state->>designPending=eq.true&select=device_id&order=updated_at.asc&limit=20')).map(row=>row.device_id);}
  };
}
module.exports = { PetStore, newPet, createState, migrateGrowth, age, listen, action, evolve, uncovered, supabaseStorage, pendingDesign };
