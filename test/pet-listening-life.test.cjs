'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const rules=require('../public/pet-rules');
const {createState,newPet,age,listen,action,migrateListeningLife,PetStore}=require('../lib/pet-store');
const DAY=86400000,t=Date.parse('2026-10-15T07:47:09+09:00');
function fixture(){const s=createState(t);s.pets.push(newPet(t,'grass'));return s;}
const event=(pet,start,end)=>({petId:pet.id,start,end});

test('a short real listen resets the 24-hour clock without spending bank or changing growth',()=>{
 const s=fixture(),p=s.pets[0],end=t+12*3600000;
 listen(s,[event(p,end-1000,end)],end);
 assert.equal(p.lastListenedAt,end);assert.equal(s.bankSeconds,1);assert.equal(p.growthSeconds,0);assert.equal(p.lastFedAt,t);
 age(s,end+DAY-1);assert.equal(p.diedAt,null);
 age(s,end+DAY);assert.equal(p.diedAt,end+DAY);assert.equal(p.deathReason,'inactivity');
});

test('late offline listening corrects an earlier death check; replay and older intervals never move time backwards',async()=>{
 let clock=t,state=fixture();
 const remote={load:async()=>structuredClone(state),save:async(id,s)=>{state=structuredClone(s);}};
 const store=new PetStore({remote,clock:()=>clock}),id='offline-listening-device',p=state.pets[0];
 clock=t+DAY+5000;
 assert.equal((await store.transact(id)).pets[0].diedAt,t+DAY);
 const events=[event(p,t+DAY-10000,t+DAY+5000)];
 let result=await store.transact(id,(s,now)=>listen(s,events,now));
 assert.equal(result.pets[0].diedAt,null);assert.equal(result.pets[0].lastListenedAt,clock);assert.equal(result.bankSeconds,15);
 result=await store.transact(id,(s,now)=>listen(s,events,now));assert.equal(result.bankSeconds,15);
 result=await store.transact(id,(s,now)=>listen(s,[event(p,t+1000,t+2000)],now));
 assert.equal(result.pets[0].lastListenedAt,clock);
});

test('out-of-order offline events form a chronological chain and a 24-hour gap breaks it',()=>{
 const s=fixture(),p=s.pets[0];
 const events=[event(p,t+40*3600000,t+40*3600000+1000),event(p,t+20*3600000,t+20*3600000+1000)];
 age(s,t+41*3600000);listen(s,events,t+41*3600000);age(s,t+41*3600000);
 assert.equal(p.diedAt,null);assert.equal(p.lastListenedAt,events[0].end);
 const before=p.lastListenedAt,next=before+DAY;
 age(s,next+1000);listen(s,[event(p,next,next+1000)],next+1000);age(s,next+1000);
 assert.equal(p.lastListenedAt,before);assert.equal(p.diedAt,next);
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

test('migration restores the current food-dead pet from real history once, preserving all growth and archived history',()=>{
 const s=fixture(),p=s.pets[0];delete s.lifeRuleVersion;delete p.lastListenedAt;
 const archived={...newPet(t-DAY,'fire'),diedAt:t-1000};s.pets.unshift(archived);
 p.diedAt=t+DAY;p.growthSeconds=12600;p.stats.body=35;s.bankSeconds=123;s.totalSeconds=456;
 const recent=t+9*3600000;s.intervals=[[recent-1000,recent]];
 migrateListeningLife(s,t+DAY+3600000);age(s,t+DAY+3600000);
 assert.equal(p.diedAt,null);assert.equal(p.lastListenedAt,recent);assert.equal(p.growthSeconds,12600);assert.equal(p.stats.body,35);
 assert.equal(archived.diedAt,t-1000);assert.equal(s.bankSeconds,123);assert.equal(s.totalSeconds,456);
 age(s,recent+DAY);migrateListeningLife(s,recent+DAY+1000);assert.equal(p.diedAt,recent+DAY);
});

test('future playback cannot buy future life and invalid batches change nothing',()=>{
 const s=fixture(),p=s.pets[0],before=JSON.stringify(s);
 assert.throws(()=>listen(s,[event(p,t+1000,t+2000)],t));assert.equal(JSON.stringify(s),before);
 listen(s,[event(p,t,t+5000)],t+1000);assert.equal(p.lastListenedAt,t+1000);assert.equal(s.bankSeconds,1);
});

test('mobile room includes locally queued playback when server still shows an earlier timeout',()=>{
 let source=fs.readFileSync(require.resolve('../public/pet.js'),'utf8');
 source=source.replace('  window.PetGame = { initialize,', '  window.PetTest = {setState(s){save=s;}, pendingPlayback, current};\n  window.PetGame = { initialize,');
 const context={window:{PetRules:rules},Date:{now:()=>t+DAY+5000},crypto:{randomUUID:()=> 'test-id'}};
 vm.createContext(context);vm.runInContext(source,context);
 const s=fixture(),p=s.pets[0];age(s,t+DAY+5000);
 const api=context.window.PetTest;api.setState(s);api.pendingPlayback.set('offline',event(p,t+DAY-5000,t+DAY+5000));
 assert.equal(api.current().diedAt,null);assert.equal(api.current().lastListenedAt,t+DAY+5000);
 assert.equal(s.pets[0].diedAt,t+DAY);
 api.pendingPlayback.clear();api.pendingPlayback.set('late',event(p,t+DAY,t+DAY+5000));assert.equal(api.current().diedAt,t+DAY);
});
