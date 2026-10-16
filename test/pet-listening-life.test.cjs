'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const rules=require('../public/pet-rules');
const {createState,newPet,age,listen,action,migrateListeningLife,PetStore}=require('../lib/pet-store');
const DAY=86400000,t=Date.parse('2026-10-16T10:00:00+09:00');
function fixture(){const s=createState(t);s.pets.push(newPet(t,'grass'));return s;}
const event=(pet,start,end)=>({petId:pet.id,start,end});

test('one second heard buys exactly one second of life, with no bank spending or growth',()=>{
 const s=fixture(),p=s.pets[0],end=t+12*3600000;
 listen(s,[event(p,end-1000,end)],end);
 assert.equal(rules.listeningDeadline(p),t+DAY+1000);assert.equal(p.lastListenedAt,end);
 assert.equal(s.bankSeconds,1);assert.equal(p.growthSeconds,0);assert.equal(p.lastFedAt,t);
 age(s,t+DAY+999);assert.equal(p.diedAt,null);
 age(s,t+DAY+1000);assert.equal(p.diedAt,t+DAY+1000);
});

test('ten minutes heard buys ten minutes, not a full refill; wall time and listening balance at a 24-hour maximum',()=>{
 const s=fixture(),p=s.pets[0],begin=t+12*3600000;
 const events=Array.from({length:20},(_,i)=>event(p,begin+i*30000,begin+(i+1)*30000));
 listen(s,events,begin+600000);
 assert.equal(rules.listeningDeadline(p),t+DAY+600000);assert.equal(p.seconds,600);
 assert.equal(rules.listeningDeadline(p)-(begin+600000),12*3600000);
 const full=fixture(),baby=full.pets[0];listen(full,[event(baby,t,t+30000)],t+30000);
 assert.equal(rules.listeningDeadline(baby)-(t+30000),DAY);
});

test('late offline listening corrects an earlier death check; duplicates and overlapping records refill once',async()=>{
 let clock=t,state=fixture();
 const remote={load:async()=>structuredClone(state),save:async(id,s)=>{state=structuredClone(s);}};
 const store=new PetStore({remote,clock:()=>clock}),id='offline-listening-device',p=state.pets[0];
 clock=t+DAY+5000;assert.equal((await store.transact(id)).pets[0].diedAt,t+DAY);
 const events=[event(p,t+DAY-10000,t+DAY+5000)];
 let result=await store.transact(id,(s,now)=>listen(s,events,now));
 assert.equal(result.pets[0].diedAt,null);assert.equal(rules.listeningDeadline(result.pets[0]),t+DAY+15000);assert.equal(result.bankSeconds,15);
 result=await store.transact(id,(s,now)=>listen(s,events,now));assert.equal(result.bankSeconds,15);assert.equal(result.pets[0].seconds,15);
 result=await store.transact(id,(s,now)=>listen(s,[event(p,t+DAY-15000,t+DAY)],now));
 assert.equal(result.bankSeconds,20);assert.equal(result.pets[0].seconds,20);assert.equal(rules.listeningDeadline(result.pets[0]),t+DAY+20000);
});

test('a later offline batch can complete a missing earlier interval; a genuine zero-life gap cannot revive',()=>{
 const s=fixture(),p=s.pets[0];age(s,t+DAY+30000);
 listen(s,[event(p,t+DAY,t+DAY+30000)],t+DAY+30000);age(s,t+DAY+30000);
 assert.equal(p.diedAt,t+DAY);assert.equal(p.seconds,0);
 listen(s,[event(p,t+DAY-30000,t+DAY)],t+DAY+30000);age(s,t+DAY+30000);
 assert.equal(p.diedAt,null);assert.equal(p.seconds,60);assert.equal(rules.listeningDeadline(p),t+DAY+60000);
 const expires=rules.listeningDeadline(p);age(s,expires+1000);
 listen(s,[event(p,expires,expires+1000)],expires+1000);age(s,expires+1000);
 assert.equal(p.diedAt,expires);assert.equal(rules.listeningDeadline(p),expires);
});

test('archived and departed pets cannot be revived by delayed playback',()=>{
 const s=fixture(),p=s.pets[0];age(s,t+DAY);
 action(s,{type:'select',element:'fire',requestId:'next-listening-pet-001'},t+DAY+1000);
 listen(s,[event(p,t+DAY-5000,t+DAY+5000)],t+DAY+5000);
 assert.equal(p.diedAt,t+DAY);assert.equal(p.lastListenedAt,t);assert.equal(p.seconds,5);
 const next=s.pets[1];next.departedAt=t+DAY+2000;
 listen(s,[event(next,t+DAY+1500,t+DAY+3000)],t+DAY+5000);
 assert.equal(next.lastListenedAt,next.bornAt);assert.equal(next.departedAt,t+DAY+2000);
});

test('switching from last-listen reset preserves the existing deadline and growth without a free refill',()=>{
 const s=fixture(),p=s.pets[0];s.lifeRuleVersion=1;delete p.lifeExpiresAt;p.lastListenedAt=t+4*3600000;
 p.growthSeconds=12600;p.stats.body=35;s.bankSeconds=123;s.totalSeconds=456;
 migrateListeningLife(s,t+18*3600000);
 assert.equal(rules.listeningDeadline(p),t+28*3600000);assert.equal(p.lifeBaseAt,t+18*3600000);
 assert.equal(p.growthSeconds,12600);assert.equal(p.stats.body,35);assert.equal(s.bankSeconds,123);assert.equal(s.totalSeconds,456);
 migrateListeningLife(s,t+19*3600000);assert.equal(p.lifeBaseAt,t+18*3600000);
 const heard=t+20*3600000;listen(s,[event(p,heard,heard+30000)],heard+30000);
 assert.equal(rules.listeningDeadline(p),t+28*3600000+30000);
});

test('old food rule still migrates from real history; playback before the transition is never repaid',()=>{
 const s=fixture(),p=s.pets[0];delete s.lifeRuleVersion;delete p.lastListenedAt;p.diedAt=t+DAY;
 const archived={...newPet(t-DAY,'fire'),diedAt:t-1000};s.pets.unshift(archived);
 const recent=t+9*3600000;s.intervals=[[recent-1000,recent]];
 migrateListeningLife(s,t+DAY+3600000);age(s,t+DAY+3600000);
 assert.equal(p.diedAt,null);assert.equal(p.lastListenedAt,recent);assert.equal(archived.diedAt,t-1000);
 const expires=rules.listeningDeadline(p);listen(s,[event(p,recent-1000,recent)],t+DAY+3600000);
 assert.equal(rules.listeningDeadline(p),expires);assert.equal(p.lifeCreditedMs,0);
});

test('invalid future playback changes nothing; existing five-second phone clock tolerance is preserved',()=>{
 const s=fixture(),p=s.pets[0],before=JSON.stringify(s);
 assert.throws(()=>listen(s,[event(p,t+6000,t+7000)],t));assert.equal(JSON.stringify(s),before);
 listen(s,[event(p,t+1000,t+2000)],t);assert.equal(p.lastListenedAt,t+2000);assert.equal(s.bankSeconds,1);
});

test('mobile pending playback shows the exact unique refill without mutating or double-counting server state',()=>{
 let source=fs.readFileSync(require.resolve('../public/pet.js'),'utf8');
 source=source.replace('  window.PetGame = { initialize,', '  window.PetTest = {setState(s){save=s;}, pendingPlayback, current};\n  window.PetGame = { initialize,');
 const context={window:{PetRules:rules},Date:{now:()=>t+DAY+5000},crypto:{randomUUID:()=> 'test-id'}};
 vm.createContext(context);vm.runInContext(source,context);
 const s=fixture(),p=s.pets[0];listen(s,[event(p,t+DAY-10000,t+DAY)],t+DAY);age(s,t+DAY+15000);
 const api=context.window.PetTest;api.setState(s);api.pendingPlayback.set('offline',event(p,t+DAY-10000,t+DAY+5000));
 assert.equal(api.current().diedAt,null);assert.equal(rules.listeningDeadline(api.current()),t+DAY+15000);
 assert.equal(rules.listeningDeadline(s.pets[0]),t+DAY+10000);assert.equal(s.pets[0].diedAt,t+DAY+10000);
 api.pendingPlayback.clear();api.pendingPlayback.set('late',event(p,t+DAY+10000,t+DAY+15000));assert.equal(api.current().diedAt,t+DAY+10000);
});
