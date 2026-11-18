'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {createState,newPet,age,listen,PetStore,action}=require('../lib/pet-store');
const {enablePractice,recordPractice,viewPractice}=require('../lib/pet-practice');
const rules=require('../public/pet-rules');
const at=value=>Date.parse(value+'+09:00'),t=at('2026-10-24T12:00:00'),first=at('2026-10-25T12:00:00'),boundary=at('2026-10-26T00:00:00');
function state(){const s=createState(t);s.pets.push(newPet(t));enablePractice(s,t,'daily');return s;}
function answer(s,time=first,id=crypto.randomUUID()){recordPractice(s,{id,at:time},time);return id;}

test('zero, nine, and ten answers have no midnight survival requirement',()=>{
 for(const count of [0,9,10]){
  const s=state(),p=s.pets[0];p.lifeExpiresAt=boundary+3600000;
  for(let i=0;i<count;i++)answer(s);
  age(s,boundary);assert.equal(p.diedAt,null);assert.equal(rules.missedPracticeDay(p,boundary),null);
  assert.equal(viewPractice(s,boundary).enabled,false);assert.equal(viewPractice(s,boundary).policy,'time');
  age(s,p.lifeExpiresAt);assert.equal(p.deathReason,'inactivity');
 }
});

test('answer receipts still deduplicate, split Japan dates, and accept delayed grading',()=>{
 const s=state(),id=answer(s);answer(s,first,id);assert.equal(viewPractice(s,first).count,1);
 for(let i=0;i<8;i++)answer(s);
 recordPractice(s,{id:crypto.randomUUID(),at:boundary-1},boundary+10000);assert.equal(s.sentencePractice.daily['2026-10-25'],10);
 answer(s,boundary);assert.equal(s.sentencePractice.daily['2026-10-26'],1);
 recordPractice(s,{id:crypto.randomUUID(),at:boundary+100000},boundary);assert.equal(s.sentencePractice.daily['2026-10-26'],1);
});

test('an old quota death is cleared only for the current pet when listening time remains',()=>{
 const s=state(),p=s.pets[0];p.lifeExpiresAt=boundary+3600000;p.diedAt=boundary;p.deathReason='daily_practice';
 enablePractice(s,boundary+1000);age(s,boundary+1000);assert.equal(p.diedAt,null);assert.equal(p.deathReason,undefined);
 p.lifeExpiresAt=boundary-1000;age(s,boundary+1000);assert.equal(p.diedAt,boundary-1000);assert.equal(p.deathReason,'inactivity');
 const archived=newPet(t);archived.diedAt=t+1000;archived.deathReason='daily_practice';s.pets.unshift(archived);age(s,boundary+2000);assert.equal(archived.diedAt,t+1000);
});

test('retiring a daily ledger preserves remaining time, history, balances and growth without repeated refills',()=>{
 const s=state(),p=s.pets[0];s.sentencePractice.policy='daily';p.practice.policy='daily';p.lifeExpiresAt=first+3600000;
 s.bankSeconds=123;p.growthSeconds=1800;s.sentenceReview={items:{keep:{answer:'keep'}}};answer(s);
 enablePractice(s,first);const snapshot=structuredClone(s);enablePractice(s,first+1000);
 assert.deepEqual(s,snapshot);assert.equal(p.practice.policy,'time');assert.equal(p.lifeExpiresAt,first+3600000);
 assert.equal(p.growthSeconds,1800);assert.equal(s.bankSeconds,123);assert.equal(s.sentenceReview.items.keep.answer,'keep');assert.equal(s.sentencePractice.daily['2026-10-25'],1);
});

test('persistent receipts survive concurrent retries and workers never reactivate the quota',async tcase=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'pet-practice-'));tcase.after(async()=>{assert.equal(path.dirname(dir),os.tmpdir());assert(path.basename(dir).startsWith('pet-practice-'));await fs.rm(dir,{recursive:true,force:true});});
 let clock=t;const store=new PetStore({dir,clock:()=>clock,practicePolicy:'daily'}),device='practice-receipt-device';
 await store.transact(device,(s,now)=>{action(s,{type:'select',element:'grass',requestId:'practice-initial-001'},now);s.pets[0].lifeExpiresAt=boundary+3600000;});clock=first;
 const id=crypto.randomUUID();await Promise.all(Array.from({length:10},()=>store.transact(device,(s,now)=>recordPractice(s,{id,at:first},now))));
 clock=boundary;const worker=new PetStore({dir,clock:()=>clock});let saved=await worker.transact(device);
 assert.equal(saved.sentencePractice.daily['2026-10-25'],1);assert.equal(saved.pets[0].diedAt,null);assert.equal(saved.pets[0].practice.policy,'time');
 clock=boundary+3600000;saved=await worker.transact(device);assert.equal(saved.pets[0].deathReason,'inactivity');
});
