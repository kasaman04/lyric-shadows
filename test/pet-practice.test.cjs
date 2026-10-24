'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {createState,newPet,age,listen,PetStore,action}=require('../lib/pet-store');
const {enablePractice,recordPractice,viewPractice}=require('../lib/pet-practice');
const rules=require('../public/pet-rules');
const at=value=>Date.parse(value+'+09:00'),t=at('2026-10-24T12:00:00'),first=at('2026-10-25T12:00:00'),boundary=at('2026-10-26T00:00:00');
function state(){const s=createState(t);s.pets.push(newPet(t));enablePractice(s,t,'daily');return s;}
function answer(s,time=first,id=crypto.randomUUID()){recordPractice(s,{id,at:time},time);return id;}
test('migration protects the first partial day; nine answers die at Japan midnight, ten survive without listening',()=>{
  let s=state();assert.equal(s.pets[0].practice.from,'2026-10-25');age(s,at('2026-10-25T00:00:00'));assert.equal(s.pets[0].diedAt,null);
  for(let i=0;i<9;i++)answer(s);age(s,boundary-1);assert.equal(s.pets[0].diedAt,null);age(s,boundary);assert.equal(s.pets[0].diedAt,boundary);assert.equal(s.pets[0].deathReason,'daily_practice');
  s=state();for(let i=0;i<10;i++)answer(s);age(s,boundary);assert.equal(s.pets[0].diedAt,null);assert(viewPractice(s,first).met);assert.equal(s.pets[0].lastListenedAt,t);
  assert.equal(viewPractice(s,boundary).count,0);assert.equal(viewPractice(s,boundary).remaining,10);
});
test('missed days are checked while closed, excess attempts cannot be carried forward, and playback cannot replace practice',()=>{
  const s=state();for(let i=0;i<20;i++)answer(s);age(s,at('2026-10-29T10:00:00'));assert.equal(s.pets[0].diedAt,at('2026-10-27T00:00:00'));
  const p=state();listen(p,[{petId:p.pets[0].id,start:first-10000,end:first}],first);assert.equal(p.totalSeconds,10);assert.equal(viewPractice(p,first).count,0);age(p,boundary);assert.equal(p.pets[0].deathReason,'daily_practice');
});
test('each answer is counted once, Japan day splitting is exact, and a tenth pre-midnight submission may finish grading late',()=>{
  const s=state(),id=answer(s);answer(s,first,id);assert.equal(viewPractice(s,first).count,1);
  for(let i=0;i<8;i++)answer(s);age(s,boundary);assert(s.pets[0].diedAt);
  recordPractice(s,{id:crypto.randomUUID(),at:boundary-1},boundary+10000);age(s,boundary+10000);assert.equal(s.pets[0].diedAt,null);assert.equal(s.sentencePractice.daily['2026-10-25'],10);
  answer(s,boundary);assert.equal(s.sentencePractice.daily['2026-10-26'],1);
  recordPractice(s,{id:crypto.randomUUID(),at:boundary+100000},boundary);assert.equal(s.sentencePractice.daily['2026-10-26'],1);
});
test('daily rule keeps learning and growth, does not resurrect archived deaths, and a new pet gets a full first day',()=>{
  const s=state(),p=s.pets[0];p.growthSeconds=1800;p.stats.body=6;s.bankSeconds=500;
  for(let i=0;i<10;i++)answer(s);age(s,boundary);
  listen(s,[{petId:p.id,start:boundary+1000,end:boundary+11000}],boundary+11000);assert.equal(p.seconds,10);assert.equal(s.totalSeconds,10);assert.equal(s.bankSeconds,510);assert.equal(p.growthSeconds,1800);
  age(s,at('2026-10-27T00:00:00'));action(s,{type:'select',element:'fire',requestId:'practice-new-pet-001'},at('2026-10-27T12:00:00'));enablePractice(s,at('2026-10-27T12:00:00'));
  assert.equal(s.pets[1].practice.from,'2026-10-28');assert.equal(s.pets[0].diedAt,at('2026-10-27T00:00:00'));assert.equal(s.bankSeconds,510);
  const old=createState(t);old.pets.push(newPet(t));old.pets[0].diedAt=t+1;old.pets[0].deathReason='inactivity';enablePractice(old,first,'daily');assert.equal(old.pets[0].diedAt,t+1);assert(!old.pets[0].practice);
});
test('persistent transactional receipts survive parallel submissions and a worker without explicit activation respects the new life rule',async tcase=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'pet-practice-'));tcase.after(async()=>{assert.equal(path.dirname(dir),os.tmpdir());assert(path.basename(dir).startsWith('pet-practice-'));await fs.rm(dir,{recursive:true,force:true});});
  let clock=t;const store=new PetStore({dir,clock:()=>clock,practicePolicy:'daily'}),device='practice-receipt-device';
  await store.transact(device,(s,now)=>action(s,{type:'select',element:'grass',requestId:'practice-initial-001'},now));clock=first;
  const id=crypto.randomUUID();await Promise.all(Array.from({length:10},()=>store.transact(device,(s,now)=>recordPractice(s,{id,at:first},now))));
  let saved=await store.transact(device);assert.equal(saved.sentencePractice.daily['2026-10-25'],1);
  for(let i=0;i<9;i++)await store.transact(device,(s,now)=>recordPractice(s,{id:crypto.randomUUID(),at:first},now));
  clock=boundary;const worker=new PetStore({dir,clock:()=>clock});saved=await worker.transact(device);assert.equal(saved.pets[0].diedAt,null);assert.equal(saved.sentencePractice.daily['2026-10-25'],10);
  assert.equal(saved.pets[0].lifeExpiresAt,at('2026-10-27T00:00:00'),'a worker still running the previous rule sees the same safe deadline');
  clock=at('2026-10-27T00:00:00');await worker.transact(device,s=>{const p=s.pets[0];p.diedAt=p.lifeExpiresAt;p.deathReason='inactivity';});saved=await store.transact(device);assert.equal(saved.pets[0].deathReason,'daily_practice');
});
