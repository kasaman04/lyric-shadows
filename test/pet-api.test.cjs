const test=require('node:test'),assert=require('node:assert/strict'),express=require('express'),fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {PetStore,evolve}=require('../lib/pet-store'),{mountPetApi}=require('../lib/pet-api'),{PetImages,STARTER_PATH}=require('../lib/pet-image'),rules=require('../public/pet-rules');
test('evolution starts generation without a browser design request and APIs remain available while it waits',async()=>{
  const dir=await fs.mkdtemp(path.join(__dirname,'../tmp/pet-background-test-')),id='background-device-0001',clock=Date.now();
  const store=new PetStore({dir,clock:()=>clock}),images=new PetImages({dir:path.join(dir,'images')});
  let release,started=false;const gate=new Promise(resolve=>{release=resolve;});
  const png=await fs.readFile(path.join(__dirname,'../public/pet-images/starter-fire-v1.png')),atlas=await fs.readFile(path.join(__dirname,'../public/pet-images/frames-fire-v1.png'));
  const designer={async design(){started=true;await gate;return images.save(png);},async motion(form,url,petId){return images.saveMotion(atlas,petId);}};
  const app=express();app.use(express.json());const api=mountPetApi(app,{store,images,designer});
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  const base='http://127.0.0.1:'+server.address().port+'/api/pet/'+id;
  async function post(suffix,body){const r=await fetch(base+suffix,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(3000)});assert.equal(r.status,200);return r.json();}
  try{
    const initial=await post('/care',{type:'select',element:'fire',requestId:'background-select-001'}),petId=initial.pets[0].id;
    await store.transact(id,s=>{s.bankSeconds=3600;});
    const evolved=await post('/care',{type:'power',seconds:1800,petId,requestId:'background-evolve-001'});assert.equal(evolved.pets[0].forms.at(-1).level,2);
    await store.transact(id);assert.equal(started,true);
    // These complete while the image generator is deliberately held indefinitely.
    const response=await fetch(base,{signal:AbortSignal.timeout(3000)});assert.equal(response.status,200);
    await post('/listen',{events:[{start:clock-1000,end:clock,petId}]});
    const care=await post('/care',{type:'food',petId,requestId:'background-food-001'});assert.equal(care.pets[0].stats.body,1);
    release();await api.idle();const saved=await (await fetch(base)).json();assert.ok(saved.pets[0].forms.at(-1).imageUrl);assert.ok(saved.pets[0].forms.at(-1).motion);
  }finally{release();await api.idle();await new Promise(resolve=>server.close(resolve));await fs.rm(dir,{recursive:true,force:true,maxRetries:3,retryDelay:50});}
});
test('HTTP lifecycle, generation order, retry, per-pet motion retirement and portrait retention',async()=>{
  const dir=await fs.mkdtemp(path.join(__dirname,'../tmp/pet-api-test-')),clock=Date.now(),id='api-test-device-00001';
  const store=new PetStore({dir,clock:()=>clock}),images=new PetImages({dir:path.join(dir,'images')});
  const png=await fs.readFile(STARTER_PATH),image=await images.save(png),atlas=await fs.readFile(path.join(__dirname,'../public/pet-images/frames-fire-v1.png'));
  const calls=[];let failImage=false,failMotion=false;
  const designer={status:'connected',async connect(){},async design(species,form,previous){calls.push({kind:'image',level:form.level,previous});if(failImage)throw Error('image failure');return image;},async motion(form,portrait,petId){calls.push({kind:'motion',level:form.level});if(failMotion)throw Error('motion failure');return images.saveMotion(atlas,petId);}};
  const app=express();app.use(express.json());const api=mountPetApi(app,{store,images,designer});
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  const origin='http://127.0.0.1:'+server.address().port,base=origin+'/api/pet/'+id;
  const post=(suffix,body,headers={})=>fetch(base+suffix,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
  async function generate(retry=false){const first=await post('/design',{retry});assert.ok([200,202].includes(first.status));await api.idle();return (await post('/design',{})).json();}
  async function state(){return (await fetch(base)).json();}
  try {
    assert.equal((await state()).pets.length,0);
    let s=await (await post('/care',{type:'select',element:'fire',requestId:'api-initial-choice-001'})).json(),pet=s.pets[0];
    assert.equal(pet.element,'fire');assert.match(pet.forms[0].motion.url,/frames-fire/);
    assert.equal((await post('/care',{type:'select',element:'water',requestId:'api-invalid-choice-001'})).status,409);
    const events=[{start:clock-10000,end:clock,petId:pet.id}];await post('/listen',{events});await post('/listen',{events});assert.equal((await state()).totalSeconds,10);
    assert.equal((await post('/care',{type:'power',petId:pet.id,requestId:'blocked-api-action-001'},{Origin:'https://unrelated.test'})).status,403);
    await store.transact(id,s=>{s.bankSeconds=1800;});
    const care={type:'power',seconds:1800,petId:pet.id,requestId:'first-evolution-001'};
    s=await (await post('/care',care)).json();await post('/care',care);assert.equal(s.pets[0].forms.at(-1).level,2);assert.equal((await state()).pets[0].stats.power,6);
    assert.equal((await generate()).status,'ready');
    assert.deepEqual(calls.map(c=>[c.kind,c.level]),[['image',2],['motion',2]]);assert.equal(calls[0].previous,pet.forms[0].imageUrl);
    s=await state();const motionUrl=s.pets[0].forms.at(-1).motion.url;
    assert.equal((await fetch(origin+motionUrl)).status,200);assert.equal((await fetch(origin+image.imageUrl)).headers.get('Content-Type'),'image/png');
    assert.equal((await fetch(origin+'/api/pet-art/invalid.png')).status,404);assert.equal((await fetch(origin+'/api/pet-motion/not-a-pet/invalid.png')).status,404);
    const otherId=crypto.randomUUID(),otherMotion=await images.saveMotion(atlas,otherId);
    failMotion=true;
    await store.transact(id,s=>{s.bankSeconds=3600;});await post('/care',{type:'brain',seconds:3600,petId:pet.id,requestId:'second-evolution-001'});
    assert.equal((await fetch(origin+motionUrl)).status,404);assert.equal((await fetch(origin+otherMotion.url)).status,200);assert.equal((await fetch(origin+image.imageUrl)).status,200);
    assert.equal((await generate()).status,'unavailable');s=await state();assert.equal(s.pets[0].forms.at(-1).imageUrl,image.imageUrl);assert.equal(s.pets[0].forms.at(-1).motionErrorAt,clock);
    const before=calls.length;await generate();assert.equal(calls.length,before);failMotion=false;assert.equal((await generate(true)).status,'ready');
    await store.transact(id,s=>{const pet=s.pets[0];pet.growthSeconds=rules.required(1)+rules.required(2)+rules.required(3);evolve(pet,clock);});
    failImage=true;assert.equal((await generate()).status,'unavailable');const failed=calls.length;await generate();assert.equal(calls.length,failed);failImage=false;assert.equal((await generate(true)).status,'ready');
    await store.transact(id,s=>{const pet=s.pets[0];pet.growthSeconds=4410*60;evolve(pet,clock);s.bankSeconds=930;});
    assert.equal((await generate()).status,'ready');s=await state();assert.equal(s.pets[0].forms.length,10);assert.ok(s.pets[0].forms.every(f=>f.imageUrl));assert.equal(s.pets[0].forms.filter(f=>f.motion).length,1);
    const finalMotion=s.pets[0].forms.at(-1).motion.url;
    await post('/care',{type:'depart',petId:pet.id,requestId:'api-departure-001'});assert.equal((await fetch(origin+finalMotion)).status,404);assert.equal((await generate()).status,'ready');
    const generationCount=calls.length;s=await (await post('/care',{type:'select',element:'dark',requestId:'api-new-monster-001'})).json();assert.equal(s.pets.length,2);assert.equal(s.pets[0].departedAt,clock);assert.equal(s.pets[1].element,'dark');assert.equal(s.bankSeconds,930);assert.equal(s.totalSeconds,10);
    await post('/design',{petId:pet.id});await api.idle();assert.equal(calls.length,generationCount);
    assert.equal((await fetch(base.replace(id,'invalid.id'))).status,400);
    await assert.rejects(images.saveMotion(png,pet.id),/four columns|animation cell/);
    await images.retireMotion(otherMotion.url,pet.id);assert.equal((await fetch(origin+otherMotion.url)).status,200);
  }finally{await api.idle();await new Promise(resolve=>server.close(resolve));await fs.rm(dir,{recursive:true,force:true,maxRetries:3,retryDelay:50});}
});
