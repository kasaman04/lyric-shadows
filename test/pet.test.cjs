const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const rules = require('../public/pet-rules');
const art = require('../public/pet-art');
const { credit } = require('../public/pet-playback');
const { createState: emptyState, newPet, migrateGrowth, listen, action, age, evolve, PetStore, supabaseStorage } = require('../lib/pet-store');
const { validateImage, STARTER_PATH, STARTER_URL, migrateImages, evolutionPrompt, PetImages } = require('../lib/pet-image');
const DAY = 86400000;
const start = Date.parse('2026-10-09T14:59:50Z');
function event(s, duration = 10, petId) { return { start: s, end: s + duration * 1000, petId }; }
function createState(now) {const s=emptyState(now);s.pets.push(newPet(now,'fire'));return s;}
test('10 stages cost exactly 73h30m and every threshold advances one level',()=>{
  assert.deepEqual(rules.bands,[30,60,120,180,300,480,720,1080,1440]);
  let sum=0;for(let level=1;level<10;level++){sum+=rules.required(level);assert.equal(rules.progress(sum-1).level,level);assert.equal(rules.progress(sum).level,level+1);}
  assert.equal(sum,4410*60);assert.equal(rules.progress(sum+3600).level,10);
  assert.equal(rules.catalog.length,100);assert.equal(new Set(rules.catalog.map(c=>c.name)).size,100);
  for(const element of rules.elements)for(let level=1;level<=10;level++){const c=rules.species(element.id,level);assert.equal(c.element,element.id);assert.equal(c.stage,level);if(level>1)assert.equal(rules.catalog[c.parents[0]-1].stage,level-1);}
  assert.match(art.room(1),/stage-1/);assert.match(art.room(10),/stage-5/);
});
test('initial choice is explicit, rejects invalid element and prevents replacement of active pet',()=>{
  const s=emptyState(start);assert.equal(s.pets.length,0);
  assert.throws(()=>action(s,{type:'select',element:'invalid',requestId:'initial-choice-001'},start));
  action(s,{type:'select',element:'water',requestId:'initial-choice-001'},start);assert.equal(s.pets[0].element,'water');
  action(s,{type:'select',element:'water',requestId:'initial-choice-001'},start);assert.equal(s.pets.length,1);
  assert.throws(()=>action(s,{type:'select',element:'fire',requestId:'another-choice-001'},start),/育成中/);
});
test('listening alone saves balance, daily totals and pet history without leveling',()=>{
  const s=createState(start),pet=s.pets[0];const events=Array.from({length:60},(_,i)=>event(start+i*30000,30,pet.id));
  listen(s,events,start+1800000);listen(s,events,start+1800000);
  assert.equal(s.totalSeconds,1800);assert.equal(pet.seconds,1800);assert.equal(pet.growthSeconds,0);assert.equal(s.bankSeconds,1800);
  assert.equal(s.daily['2026-10-09'],10);assert.equal(s.daily['2026-10-10'],1790);
  for(let i=0;i<5;i++)action(s,{type:'power',petId:pet.id,requestId:'care-listen-action-'+i},start);
  assert.equal(rules.progress(pet.growthSeconds).level,1);
  action(s,{type:'food',petId:pet.id,requestId:'care-listen-food-001'},start+DAY);
  assert.equal(rules.progress(pet.growthSeconds).level,2);assert.equal(pet.stats.power,5);assert.equal(pet.stats.body,1);assert.equal(s.bankSeconds,0);assert.equal(pet.lastFedAt,start+DAY);assert.equal(s.totalSeconds,1800);
});
test('overlapping players do not double credit and Japan midnight splits actual time',()=>{
  const s=createState(start),id=s.pets[0].id,a=event(start,20,id),b=event(start+10000,20,id);
  listen(s,[a,b,a],start+30000);assert.equal(s.totalSeconds,30);assert.equal(s.pets[0].seconds,30);assert.equal(s.daily['2026-10-09'],10);assert.equal(s.daily['2026-10-10'],20);
});
test('care uses only approved amounts; duplicates and rejected amounts never overdraw',()=>{
  const s=createState(start),pet=s.pets[0];s.bankSeconds=5400;
  const a={type:'brain',seconds:1800,petId:pet.id,requestId:'bulk-brain-action-001'};action(s,a,start);action(s,a,start);
  assert.equal(pet.stats.brain,6);assert.equal(pet.growthSeconds,1800);assert.equal(s.bankSeconds,3600);
  action(s,{type:'food',seconds:3600,petId:pet.id,requestId:'bulk-food-action-001'},start+DAY);
  assert.equal(pet.stats.body,12);assert.equal(pet.forms.at(-1).level,3);assert.deepEqual(pet.forms.at(-1).stats,{body:12,power:0,brain:6});
  for(const seconds of [0,-300,600,1801,7200,'300',null]){const before=JSON.stringify(s);assert.throws(()=>action(s,{type:'power',seconds,petId:pet.id,requestId:'invalid-care-001'},start+DAY));assert.equal(JSON.stringify(s),before);}
  assert.throws(()=>action(s,{type:'brain',petId:pet.id,requestId:'insufficient-care-001'},start+DAY),/足りません/);
});
test('bulk care snapshots capture the stats at each crossed boundary; past motion is retired',()=>{
  const s=createState(start),pet=s.pets[0];s.bankSeconds=3600;
  pet.forms[0].motion={url:'/api/pet-motion/'+pet.id+'/'+'a'.repeat(64)+'.png'};
  action(s,{type:'power',seconds:3600,petId:pet.id,requestId:'multi-level-care-001'},start);
  assert.deepEqual(pet.forms.map(f=>f.level),[1,2]);assert.equal(pet.forms[1].stats.power,6);assert.equal(pet.stats.power,12);assert.equal(pet.forms[1].direction,'power');assert.equal(pet.forms[0].motion,undefined);assert.equal(pet.retiredMotions.length,1);
  const old=JSON.stringify(pet.forms);pet.stats.body=90;assert.equal(JSON.stringify(pet.forms),old);
});
test('72-hour deadline is permanent; history accepts pre-death listening; next pet keeps bank',()=>{
  const s=createState(start),pet=s.pets[0];s.bankSeconds=600;age(s,start+3*DAY-1);assert.equal(pet.diedAt,null);age(s,start+3*DAY);assert.equal(pet.diedAt,start+3*DAY);
  assert.throws(()=>action(s,{type:'food',petId:pet.id,requestId:'after-death-care-001'},start+3*DAY),/終わりました/);
  listen(s,[event(start+3*DAY-10000,20,pet.id)],start+3*DAY+10000);assert.equal(pet.seconds,10);assert.equal(s.bankSeconds,620);
  action(s,{type:'select',element:'dark',requestId:'next-pet-choice-001'},start+3*DAY+10000);assert.equal(s.pets.length,2);assert.equal(s.pets[1].element,'dark');assert.equal(s.pets[1].growthSeconds,0);assert.equal(s.bankSeconds,620);
});
test('Lv10 departure archives every stage, resets next pet stats and retains all learning',()=>{
  const s=createState(start),pet=s.pets[0];s.bankSeconds=780;s.totalSeconds=900;s.daily={day:900};
  assert.throws(()=>action(s,{type:'depart',petId:pet.id,requestId:'early-departure-001'},start),/Lv.10/);
  pet.growthSeconds=4410*60;pet.stats.power=882;evolve(pet,start);
  assert.deepEqual(pet.forms.map(f=>f.level),[1,2,3,4,5,6,7,8,9,10]);
  action(s,{type:'depart',petId:pet.id,requestId:'departure-action-001'},start+DAY);age(s,start+10*DAY);assert.equal(pet.diedAt,null);assert.equal(pet.departedAt,start+DAY);
  action(s,{type:'select',element:'ice',requestId:'new-after-depart-001'},start+10*DAY);
  assert.equal(s.pets.length,2);assert.equal(s.pets[1].element,'ice');assert.deepEqual(s.pets[1].stats,{body:0,power:0,brain:0});assert.equal(s.bankSeconds,780);assert.equal(s.totalSeconds,900);assert.deepEqual(s.daily,{day:900});
});
test('playback measures actual wall time, playback speed, buffering and seeking',()=>{
  const previous={time:1000,position:10,rate:1,source:'song.mp3',active:true};
  const next={time:2000,position:11,source:'song.mp3',seeking:false,muted:false};
  assert.equal(credit(previous,next),1);
  assert.equal(credit({...previous,rate:2},{...next,position:12}),1);
  assert.equal(credit(previous,{...next,position:10}),0);
  assert.equal(credit({...previous,active:false},next),0);
  assert.equal(credit(previous,{...next,seeking:true,position:80}),0);
  assert.equal(credit(previous,{...next,position:80}),0);
  assert.equal(credit(previous,{...next,source:'next.mp3'}),0);
  assert.equal(credit(previous,{...next,muted:true}),0);
  assert.equal(credit(previous,{...next,time:601000,position:610}),600);
});
test('invalid playback batches cannot partially mutate state',()=>{
  const s=createState(start),before=JSON.stringify(s);
  assert.throws(()=>listen(s,[event(start,10),event(start,60)],start+60000));assert.equal(JSON.stringify(s),before);
  assert.throws(()=>listen(s,[event(start+DAY,10)],start));
});
test('atomic disk saves survive reopening; concurrent spending cannot overdraw',async()=>{
  await fs.mkdir(path.join(__dirname,'../tmp'),{recursive:true});
  const dir=await fs.mkdtemp(path.join(__dirname,'../tmp/lyric-pet-test-'));
  try{
    const store=new PetStore({dir,clock:()=>start}),id='test-device-000001';
    const initial=await store.transact(id,s=>{s.pets.push(newPet(start));s.bankSeconds=300});
    const results=await Promise.allSettled([1,2].map(n=>store.transact(id,(s,now)=>action(s,{type:'power',petId:initial.pets[0].id,requestId:'concurrent-request-000'+n},now))));
    assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
    const restored=await new PetStore({dir,clock:()=>start+DAY}).transact(id);assert.equal(restored.bankSeconds,0);assert.equal(restored.pets[0].stats.power,1);assert.equal(restored.pets[0].growthSeconds,300);
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('legacy migration preserves bank, actual listening and every old portrait; starter can be reselected',()=>{
  const s=createState(start),pet=s.pets[0];s.version=2;pet.growthSeconds=300;pet.seconds=1234;s.bankSeconds=789;s.totalSeconds=1234;s.daily={day:1234};
  const portrait='/api/pet-art/'+'b'.repeat(64)+'.png';pet.forms[0].imageUrl=portrait;
  migrateGrowth(s);assert.equal(s.version,3);assert.equal(pet.needsStarter,true);assert.equal(pet.legacyForms[0].imageUrl,portrait);assert.equal(pet.growthSeconds,300);
  action(s,{type:'select',element:'poison',requestId:'migrate-choice-001'},start+DAY);assert.equal(s.pets.length,1);assert.equal(pet.element,'poison');assert.equal(pet.growthSeconds,300);assert.equal(pet.seconds,1234);assert.equal(s.bankSeconds,789);assert.equal(pet.legacyForms[0].imageUrl,portrait);
  migrateGrowth(s);assert.equal(pet.legacyForms.length,1);assert.deepEqual(s.daily,{day:1234});
});
test('character is a real transparent PNG, not code or an opaque checkerboard',async()=>{
  const png=await fs.readFile(STARTER_PATH), metadata=validateImage(png);
  assert.ok(metadata.width>1000);assert.equal(metadata.transparent,true);
  assert.throws(()=>validateImage(Buffer.from('<svg><script/></svg>')),/PNG/);
  assert.throws(()=>validateImage(png.subarray(0,100)));
  const zlib=require('zlib');
  // Synthetic pixel fixture for alpha validation; not a game asset.
  function fixture(alpha) {
    const signature=Buffer.from([137,80,78,71,13,10,26,10]);
    const header=Buffer.alloc(13);header.writeUInt32BE(2,0);header.writeUInt32BE(2,4);header[8]=8;header[9]=6;
    const pixels=Buffer.from([0,100,200,100,alpha,100,200,100,alpha,0,100,200,100,alpha,100,200,100,alpha]);
    const chunk=(type,data)=>{const length=Buffer.alloc(4);length.writeUInt32BE(data.length);return Buffer.concat([length,Buffer.from(type),data,Buffer.alloc(4)]);};
    return Buffer.concat([signature,chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
  }
  assert.throws(()=>validateImage(fixture(255)),/transparent/);
  assert.throws(()=>validateImage(fixture(0)),/visible/);
});
test('starter migration preserves listening and history; image prompt uses care stats and empty hands',()=>{
  const state=createState(start),pet=state.pets[0];pet.seconds=123;delete pet.forms[0].imageUrl;
  pet.forms[0].design={bodyWidth:1};const id=pet.id;
  migrateImages(state);assert.equal(pet.forms[0].imageUrl,STARTER_URL);assert.equal(pet.id,id);assert.equal(pet.seconds,123);
  const prompt=evolutionPrompt(rules.catalog[1],{level:10,stats:{body:1,power:7,brain:2}});
  assert.match(prompt,/"power":7/);assert.match(prompt,/Hands are EMPTY/);assert.match(prompt,/transparent_background=true/);
});
test('image output cannot read arbitrary files or supply failed/opaque results',async()=>{
  const images=new PetImages();
  assert.equal(images.reference('/api/pet-art/../../../.env'),STARTER_PATH);
  await assert.rejects(images.readGenerated({status:'completed',savedPath:path.join(__dirname,'../server.js')},path.join(__dirname,'../data/pets/designer')),/outside/);
  await assert.rejects(images.readGenerated({status:'completed',result:'bad',transparentBackground:false},__dirname));
  await assert.rejects(images.readGenerated({status:'failed',result:'bad'},__dirname));
});
test('Supabase minimal insert responses have no JSON body',async()=>{
  const original=global.fetch;
  global.fetch=async(url,options)=>options.method==='POST'?new Response(null,{status:201}):new Response('[{"state":{"version":1}}]',{status:200});
  try{
    const storage=supabaseStorage('https://example.test','test-only-key');
    assert.deepEqual(await storage.load('test-device-001'),{version:1});
    await storage.save('test-device-001',{version:1});
  }finally{global.fetch=original;}
});
