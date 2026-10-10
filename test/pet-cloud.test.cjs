'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),express=require('express');
const fs=require('node:fs/promises'),path=require('node:path');
const {PetStore,action,evolve,pendingDesign}=require('../lib/pet-store');
const {PetImages}=require('../lib/pet-image');
const {QueuedDesigner,headersFor,supabaseBase}=require('../lib/pet-cloud');
const {mountPetApi}=require('../lib/pet-api');
const {PetWorker}=require('../lib/pet-worker');
function memoryStorage() {
  const states=new Map();let collisions=0;
  return {
    get collisions(){return collisions;},
    async load(id){await new Promise(resolve=>setImmediate(resolve));return structuredClone(states.get(id));},
    async save(id,state,expected){
      await new Promise(resolve=>setImmediate(resolve));
      if((states.get(id)?.revision)!==expected){collisions++;throw Object.assign(new Error('conflict'),{code:'PET_CONFLICT'});}
      states.set(id,structuredClone(state));
    },
    async pending(){return [...states].filter(([,s])=>s.designPending).map(([id])=>id);}
  };
}
test('independent cloud and worker processes preserve care, listening and generated artwork during competing saves',async()=>{
  const remote=memoryStorage(),now=Date.now(),id='concurrent-cloud-device-001';
  const stores=[0,1,2].map(()=>new PetStore({remote,clock:()=>now}));
  await stores[0].transact(id,s=>{action(s,{type:'select',element:'fire',requestId:'concurrent-select-001'},now);s.bankSeconds=2400;s.pets[0].growthSeconds=1800;evolve(s.pets[0],now);});
  const petId=(await stores[0].transact(id)).pets[0].id;
  await Promise.all([
    stores[0].transact(id,s=>action(s,{type:'food',seconds:300,petId,requestId:'concurrent-food-001'},now)),
    stores[1].transact(id,s=>action(s,{type:'power',seconds:300,petId,requestId:'concurrent-power-001'},now)),
    stores[2].transact(id,s=>{s.pets[0].forms.at(-1).imageUrl='/api/pet-art/'+'a'.repeat(64)+'.png';})
  ]);
  const state=await stores[0].transact(id);assert.equal(state.bankSeconds,1800);assert.equal(state.pets[0].stats.body,1);assert.equal(state.pets[0].stats.power,1);assert.match(state.pets[0].forms.at(-1).imageUrl,/aaaa/);assert.ok(remote.collisions>0);
});
test('cloud queues work while the PC is off; a worker completes it without blocking care and remote images survive cache loss',async()=>{
  const dir=await fs.mkdtemp(path.join(__dirname,'../tmp/pet-cloud-test-')),remote=memoryStorage(),now=Date.now(),id='queued-cloud-device-001';
  const store=new PetStore({remote,clock:()=>now}),objects=new Map();
  const imageStorage={async put(name,bytes){objects.set(name,Buffer.from(bytes));},async get(name){if(!objects.has(name))throw Object.assign(new Error('not found'),{code:'ENOENT'});return objects.get(name);},async remove(name){objects.delete(name);}};
  const images=new PetImages({dir:path.join(dir,'images'),remote:imageStorage});
  const app=express();app.use(express.json());mountPetApi(app,{store,images,designer:new QueuedDesigner()});
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  const base='http://127.0.0.1:'+server.address().port+'/api/pet/'+id;
  async function post(suffix,body){const response=await fetch(base+suffix,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(3000)});assert.ok([200,202].includes(response.status));return response.json();}
  let release,start;const gate=new Promise(resolve=>release=resolve),started=new Promise(resolve=>start=resolve);
  const png=await fs.readFile(path.join(__dirname,'../public/pet-images/starter-fire-v1.png')),atlas=await fs.readFile(path.join(__dirname,'../public/pet-images/frames-fire-v1.png'));
  const designer={async design(){start();await gate;return images.save(png);},async motion(form,url,petId){return images.saveMotion(atlas,petId);}};
  const worker=new PetWorker({store:new PetStore({remote,clock:()=>now}),images,designer,owner:'test-pc',clock:()=>now});
  let work;
  try {
    const first=await post('/care',{type:'select',element:'fire',requestId:'cloud-choice-001'}),petId=first.pets[0].id;
    await store.transact(id,s=>{s.bankSeconds=2400;});
    await post('/care',{type:'power',seconds:1800,petId,requestId:'cloud-evolution-001'});
    assert.deepEqual(await remote.pending(),[id]);assert.equal((await post('/design',{})).status,'generating');
    work=worker.tick();await started;
    await post('/care',{type:'food',seconds:300,petId,requestId:'cloud-food-001'});
    assert.equal((await (await fetch(base)).json()).bankSeconds,300);
    release();await work;
    const saved=await new PetStore({remote,clock:()=>now}).transact(id),form=saved.pets[0].forms.at(-1);
    assert.equal(saved.designPending,false);assert.equal(saved.pets[0].stats.body,1);assert.equal((await post('/design',{})).status,'ready');assert.equal(saved.designLease,undefined);
    const fresh=new PetImages({dir:path.join(dir,'fresh-cache'),remote:imageStorage});
    const portraitHash=/([a-f0-9]{64})\.png$/.exec(form.imageUrl)[1],motionHash=/([a-f0-9]{64})\.png$/.exec(form.motion.url)[1];
    assert.deepEqual(await fresh.read(portraitHash),png);assert.deepEqual(await fresh.read(motionHash,petId),atlas);
    assert.equal(await fresh.referenceReady(form.imageUrl),path.join(fresh.dir,portraitHash+'.png'));
    await store.transact(id,s=>{s.bankSeconds=3600;});await post('/care',{type:'brain',seconds:3600,petId,requestId:'cloud-next-evolution-001'});
    assert.equal(objects.has('motion/'+petId+'/'+motionHash+'.png'),false);assert.equal(objects.has('portraits/'+portraitHash+'.png'),true);
    await store.transact(id,s=>{s.pets[0].forms.at(-1).imageErrorAt=now;});
    assert.deepEqual(await remote.pending(),[]);assert.equal((await post('/design',{})).status,'unavailable');
    await post('/design',{retry:true});assert.deepEqual(await remote.pending(),[id]);
    await store.transact(id,s=>{s.designLease={owner:'other-pc',until:now+10000};});
    await worker.tick();assert.equal((await store.transact(id)).designLease.owner,'other-pc');
  } finally {release();if(work)await work;await new Promise(resolve=>server.close(resolve));await fs.rm(dir,{recursive:true,force:true,maxRetries:3,retryDelay:50});}
});
test('a failed oldest portrait waits for explicit retry even when later portraits are missing',()=>{
  const state={pets:[{forms:[{level:2,imageErrorAt:1},{level:3}]}]};assert.equal(pendingDesign(state.pets[0],state),false);
});
test('existing REST URLs normalize correctly and secret keys never masquerade as JWT bearer tokens',()=>{
  assert.equal(supabaseBase('https://project.supabase.co/rest/v1/'),'https://project.supabase.co');
  assert.deepEqual(headersFor('sb_secret_test-only'),{apikey:'sb_secret_test-only'});
  assert.deepEqual(headersFor('eyJtest-only'),{apikey:'eyJtest-only',Authorization:'Bearer eyJtest-only'});
});
