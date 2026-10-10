'use strict';
const { PetStore, listen, action, supabaseStorage } = require('./pet-store');
const { PetDesigner } = require('./pet-designer');
const { PetImages } = require('./pet-image');
const path = require('path');
const rules = require('../public/pet-rules');
const {supabaseImages,QueuedDesigner}=require('./pet-cloud');
function mountPetApi(app, { store, images, designer } = {}) {
  let remote = null;
  if (process.env.PET_STORAGE === 'supabase') {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
    if (process.env.SUPABASE_URL && key) remote = supabaseStorage(process.env.SUPABASE_URL, key);
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  images ||= new PetImages({remote:remote ? supabaseImages(process.env.SUPABASE_URL,key) : null});
  designer ||= process.env.PET_DESIGNER === 'worker' ? new QueuedDesigner() : new PetDesigner({images});
  const misconfigured = !store && ((process.env.PET_STORAGE === 'supabase' && !remote) || (process.env.NODE_ENV === 'production' && !process.env.PET_DATA_DIR && !remote));
  store ||= new PetStore({ remote });
  const jobs = new Map();
  const pending = new Set();
  const route = fn => async (req, res) => {
    res.set('Cache-Control', 'no-store');
    try {
      if (req.method !== 'GET' && req.get('origin') && req.get('origin') !== req.protocol + '://' + req.get('host')) return res.status(403).json({ error: '別のサイトからの操作はできません。' });
      if (misconfigured) return res.status(503).json({ error: '育成データとキャラ画像の永続保存先を設定してください。' });
      await fn(req, res);
    } catch (e) { res.status(e.status || 500).json({ error: e.status ? e.message : '育成データを保存できませんでした。接続を確認してください。' }); }
  };
  app.get('/api/pet-art/:file', async (req, res) => {
    if (!/^[a-f0-9]{64}\.png$/.test(req.params.file)) return res.sendStatus(404);
    try {const bytes=await images.read(req.params.file.slice(0,-4));res.set('Cache-Control','public, max-age=31536000, immutable').type('png').send(bytes);}
    catch(e){res.sendStatus(e.code==='ENOENT'?404:503);}
  });
  app.get('/api/pet-motion/:petId/:file', async (req,res) => {
    if (!/^[a-f0-9-]{36}$/.test(req.params.petId) || !/^[a-f0-9]{64}\.png$/.test(req.params.file)) return res.sendStatus(404);
    try {const bytes=await images.read(req.params.file.slice(0,-4),req.params.petId);res.set('Cache-Control','private, max-age=3600').type('png').send(bytes);}
    catch(e){res.sendStatus(e.code==='ENOENT'?404:503);}
  });
  async function cleanup(id,state) {
    const acknowledged=new Map();
    for(const pet of state.pets) for(const url of pet.retiredMotions||[]) {
      if(!pet.forms.some(f=>f.motion?.url === url)) await images.retireMotion(url,pet.id);
      acknowledged.set(pet.id,[...(acknowledged.get(pet.id)||[]),url]);
    }
    if(acknowledged.size) state=await store.transact(id,s=>{for(const p of s.pets){p.retiredMotions=(p.retiredMotions||[]).filter(url=>!acknowledged.get(p.id)?.includes(url));if(!p.retiredMotions.length)delete p.retiredMotions;}});
    return state;
  }
  app.get('/api/pet/designer-status', route(async (req, res) => {
    try { await designer.connect(); } catch {}
    res.json({ status: designer.status, mode: designer.external ? 'app-server-worker' : 'image-generation', storage: remote ? 'supabase' : 'disk' });
  }));
  app.get('/api/pet/:deviceId', route(async (req, res) => res.json(await cleanup(req.params.deviceId,await store.transact(req.params.deviceId)))));
  app.post('/api/pet/:deviceId/listen', route(async (req, res) => res.json(await cleanup(req.params.deviceId,await store.transact(req.params.deviceId, (s, now) => listen(s, req.body.events, now))))));
  app.post('/api/pet/:deviceId/care', route(async (req, res) => {
    const id=req.params.deviceId,state=await cleanup(id,await store.transact(id,(s,now)=>action(s,req.body,now)));
    const pet=state.pets.at(-1),task=pet&&taskFor(state,pet);
    // Start on the server even if the browser closes before the care response arrives.
    if(task&&!task.form[task.kind==='motion'?'motionErrorAt':'imageErrorAt']) schedule(id,pet.id);
    res.json(state);
  }));
  function taskFor(state,pet) {
    if(pet.needsStarter)return null;
    const portrait=pet.forms.find(f=>f.level>=2&&!f.imageUrl);
    if(portrait)return {form:portrait,kind:'image'};
    const form=pet.forms.at(-1);
    if(pet===state.pets.at(-1)&&!rules.ended(pet)&&form.imageUrl&&!form.motion)return {form,kind:'motion'};
    return null;
  }
  async function generate(id, petId) {
    let level,kind;
    try {
      // Fill old snapshots in order after offline jumps, using the previous PNG as reference.
      for (;;) {
        const state = await store.transact(id), pet = state.pets.find(p => p.id === petId);
        if(!pet)break;
        const task=taskFor(state,pet);
        if(!task)break;
        const {form}=task; kind=task.kind; level=form.level;
        const index=pet.forms.indexOf(form);
        const previous = [...pet.forms.slice(0, index)].reverse().find(f => f.imageUrl);
        const image = kind==='motion' ? await designer.motion(form,form.imageUrl,pet.id) : await designer.design(rules.catalog[form.species - 1], form, previous?.imageUrl);
        if (kind==='image'&&!/^\/api\/pet-art\/[a-f0-9]{64}\.png$/.test(image.imageUrl)) throw new Error('Invalid character image');
        if(kind==='motion'&&(!new RegExp('^/api/pet-motion/'+pet.id+'/[a-f0-9]{64}\\.png$').test(image.url)||image.columns!==4||image.rows!==7||image.frameCount!==28))throw new Error('Invalid motion sheet');
        let attached=false;
        await store.transact(id, s => {
          const owner=s.pets.find(p=>p.id===petId),target=owner?.forms.find(f=>f.level===level);
          if(kind==='image'&&target&&!target.imageUrl){Object.assign(target,image);delete target.imageErrorAt;}
          if(kind==='motion'&&owner===s.pets.at(-1)&&!rules.ended(owner)&&target===owner.forms.at(-1)&&!target.motion){target.motion=image;delete target.motionErrorAt;attached=true;}
        });
        if(kind==='motion'&&!attached)await images.retireMotion(image.url,petId);
      }
      jobs.set(petId, 'ready');
    } catch {
      await store.transact(id, (s, now) => {
        const target = s.pets.find(p => p.id === petId)?.forms.find(f => f.level === level);
        if (target) target[kind==='motion'?'motionErrorAt':'imageErrorAt']=now;
      }).catch(() => {});
      jobs.set(petId, 'unavailable');
    }
  }
  function schedule(id,petId) {
    if(designer.external)return;
    if(jobs.get(petId)==='generating')return;
    jobs.set(petId,'generating');
    const work=generate(id,petId);pending.add(work);
    void work.finally(()=>pending.delete(work));
    if(jobs.size>500)for(const [key,status]of jobs)if(key!==petId&&status!=='generating'){jobs.delete(key);if(jobs.size<=400)break;}
  }
  app.post('/api/pet/:deviceId/design', route(async (req, res) => {
    const id = req.params.deviceId, state = await store.transact(id);
    const pet = req.body.petId ? state.pets.find(p => p.id === req.body.petId) : state.pets.at(-1);
    if (!pet) return res.status(404).json({ error: 'この子の記録がありません。' });
    const task=taskFor(state,pet), form=task?.form;
    if (!task) return res.json({ status: 'ready' });
    if (form[task.kind==='motion'?'motionErrorAt':'imageErrorAt'] && !req.body.retry) return res.json({ status: 'unavailable' });
    if(designer.external){
      if(req.body.retry)await store.transact(id,s=>{const p=s.pets.find(p=>p.id===pet.id);for(const f of p.forms){delete f.imageErrorAt;delete f.motionErrorAt;}});
      return res.status(202).json({status:'generating',level:form.level});
    }
    if (jobs.get(pet.id) === 'generating') return res.json({ status: 'generating', level: form.level });
    if ([...jobs.values()].filter(s => s === 'generating').length >= 3) return res.status(429).json({ error: 'ほかの進化を準備しています。少し後でもう一度試してください。' });
    schedule(id,pet.id);
    res.status(202).json({ status: 'generating', level: form.level });
  }));
  return { store, designer, images, enqueue:schedule, idle: () => Promise.all([...pending]) };
}
module.exports = { mountPetApi };
