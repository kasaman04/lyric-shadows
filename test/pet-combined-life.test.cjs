'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const vm=require('node:vm'),syncFs=require('node:fs');
const rules=require('../public/pet-rules');
const {newPet,createState,age,listen,action,PetStore}=require('../lib/pet-store');
const {enablePractice,recordPractice}=require('../lib/pet-practice');
const DAY=86400000,t=Date.parse('2026-10-24T12:00:00+09:00'),now=t+DAY,midnight=Date.parse('2026-10-26T00:00:00+09:00');
function fixture(){const s=createState(t),p=newPet(t);s.pets.push(p);enablePractice(s,t,'both');p.lifeBaseAt=now-3600000;p.lifeBaseExpiresAt=midnight+3600000;p.lifeExpiresAt=p.lifeBaseExpiresAt;return s;}
function answers(s,n=10,at=now){for(let i=0;i<n;i++)recordPractice(s,{id:crypto.randomUUID(),at},at);}
function playback(s,start,end){const events=[];for(let at=start;at<end;at+=30000)events.push({petId:s.pets.at(-1).id,start:at,end:Math.min(end,at+30000)});listen(s,events,end);}
test('both requirements are independent: ten answers cannot prevent time death; spare time cannot prevent a daily miss',()=>{
 let s=fixture(),p=s.pets[0];answers(s);p.lifeExpiresAt=now+1000;age(s,now+1000);assert.equal(p.diedAt,now+1000);assert.equal(p.deathReason,'inactivity');
 s=fixture();p=s.pets[0];answers(s,9);age(s,midnight);assert.equal(p.diedAt,midnight);assert.equal(p.deathReason,'daily_practice');assert(rules.listeningDeadline(p)>midnight);
 s=fixture();p=s.pets[0];answers(s);age(s,midnight);assert.equal(p.diedAt,null);assert.equal(p.practice.policy,'both');
});
test('earliest failed condition determines death, regardless of checking order or days spent closed',()=>{
 let s=fixture(),p=s.pets[0];p.lifeExpiresAt=midnight-1000;age(s,midnight+3*DAY);assert.equal(p.diedAt,midnight-1000);assert.equal(p.deathReason,'inactivity');
 s=fixture();p=s.pets[0];age(s,midnight+3*DAY);assert.equal(p.diedAt,midnight);assert.equal(p.deathReason,'daily_practice');
});
test('listening keeps its exact 24x refill and cap without adding practice or altering growth',()=>{
 const s=fixture(),p=s.pets[0],expires=p.lifeExpiresAt;playback(s,now,now+30000);assert.equal(p.lifeExpiresAt,expires+720000);assert.equal(s.sentencePractice.daily[rules.dayKey(now)],undefined);assert.equal(p.seconds,30);assert.equal(p.growthSeconds,0);
 const full=fixture(),q=full.pets[0];q.lifeBaseAt=now;q.lifeBaseExpiresAt=now+DAY;q.lifeExpiresAt=now+DAY;playback(full,now,now+30000);assert.equal(q.lifeExpiresAt,now+30000+DAY);
});
test('late listening and late grading only revive when the other requirement is also satisfied',()=>{
 const s=fixture(),p=s.pets[0],expires=midnight-1000;p.lifeBaseExpiresAt=expires;p.lifeExpiresAt=expires;answers(s,9);age(s,midnight+5000);assert.equal(p.deathReason,'inactivity');
 playback(s,midnight-10000,midnight+5000);age(s,midnight+5000);assert.equal(p.diedAt,midnight);assert.equal(p.deathReason,'daily_practice');assert(p.lifeExpiresAt>midnight+5000);
 recordPractice(s,{id:crypto.randomUUID(),at:midnight-1},midnight+5000);age(s,midnight+5000);assert.equal(p.diedAt,null);
 const noTime=fixture(),q=noTime.pets[0];q.lifeExpiresAt=midnight-1000;answers(noTime,9);age(noTime,midnight+5000);recordPractice(noTime,{id:crypto.randomUUID(),at:midnight-1},midnight+5000);age(noTime,midnight+5000);assert.equal(q.diedAt,midnight-1000);assert.equal(q.deathReason,'inactivity');
});
test('migration from daily-only keeps the remaining deadline, counts, notebook, balance and growth; repeated reads never refill',()=>{
 const s=createState(t),p=newPet(t);s.pets.push(p);enablePractice(s,t,'daily');answers(s);s.bankSeconds=123;s.totalSeconds=456;p.seconds=77;p.growthSeconds=1800;p.stats.body=6;s.sentenceReview={items:{sample:{answer:'keep me'}}};
 const from=p.practice.from,deadline=now+6*3600000;p.lifeExpiresAt=deadline;const before=structuredClone(s);enablePractice(s,now,'both');
 assert.equal(s.sentencePractice.policy,'both');assert.equal(p.practice.policy,'both');assert.equal(p.lifeExpiresAt,deadline);assert.equal(p.lifeBaseAt,now);assert.equal(p.practice.from,from);assert.equal(s.sentencePractice.daily[rules.dayKey(now)],10);
 for(const key of ['bankSeconds','totalSeconds','daily','sentenceReview'])assert.deepEqual(s[key],before[key]);for(const key of ['seconds','growthSeconds','stats','forms'])assert.deepEqual(p[key],before.pets[0][key]);
 enablePractice(s,now+3600000,'both');assert.equal(p.lifeExpiresAt,deadline);assert.equal(p.lifeBaseAt,now);assert.equal(p.practice.timeRuleRestoredAt,now);
 const oldEvent={petId:p.id,start:now-1000,end:now};listen(s,[oldEvent],now+3600000);assert.equal(p.lifeExpiresAt,deadline,'past audio does not buy life again');
});
test('time-only pets keep the existing timer; new pets get a grace day only for practice, not for time',()=>{
 const s=createState(t),p=newPet(t);s.pets.push(p);p.lifeExpiresAt=t+3*3600000;p.lifeBaseExpiresAt=p.lifeExpiresAt;enablePractice(s,t,'both');assert.equal(p.lifeExpiresAt,t+3*3600000);assert.equal(p.practice.from,'2026-10-25');age(s,t+3*3600000);assert.equal(p.deathReason,'inactivity');
 action(s,{type:'select',element:'fire',requestId:'combined-next-pet-001'},now);enablePractice(s,now,'both');const next=s.pets.at(-1);assert.equal(next.practice.from,'2026-10-26');assert.equal(next.lifeExpiresAt,now+DAY);
});
test('a fresh worker respects the persisted combined policy and does not reset time or overwrite review data',async tc=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'pet-combined-'));tc.after(async()=>{assert.equal(path.dirname(dir),os.tmpdir());assert(path.basename(dir).startsWith('pet-combined-'));await fs.rm(dir,{recursive:true,force:true});});
 let clock=t;const id='combined-worker-device',web=new PetStore({dir,clock:()=>clock,practicePolicy:'both'});
 await web.transact(id,(s,at)=>action(s,{type:'select',element:'grass',requestId:'combined-initial-001'},at));
 let a=await web.transact(id);const deadline=a.pets[0].lifeExpiresAt;
 clock=t+3600000;const worker=new PetStore({dir,clock:()=>clock});a=await worker.transact(id);assert.equal(a.sentencePractice.policy,'both');assert.equal(a.pets[0].lifeExpiresAt,deadline);
 clock=deadline;await web.transact(id,(s,at)=>answers(s,10,at));a=await worker.transact(id);assert.equal(a.pets[0].diedAt,deadline);assert.equal(a.pets[0].deathReason,'inactivity');
});
test('client and server agree on both failures and pending playback never masks a missing daily requirement',()=>{
 let clock=midnight+5000;
 const source=syncFs.readFileSync(require.resolve('../public/pet.js'),'utf8').replace('  window.PetGame = { initialize,','  window.PetTest={setState(s){save=s;},pendingPlayback,current};\n  window.PetGame = { initialize,');
 const scope={window:{PetRules:rules},Date:{now:()=>clock}};vm.runInNewContext(source,scope);const api=scope.window.PetTest;
 const s=fixture(),p=s.pets[0];answers(s,9);p.lifeBaseExpiresAt=midnight-1000;p.lifeExpiresAt=midnight-1000;age(s,clock);api.setState(s);
 api.pendingPlayback.set('pending',{petId:p.id,start:midnight-10000,end:midnight+5000});
 let live=api.current();assert.equal(live.deathReason,'daily_practice');assert.equal(live.diedAt,midnight);assert(live.lifeExpiresAt>clock);assert.equal(p.deathReason,'inactivity','preview must not mutate saved server state');
 recordPractice(s,{id:crypto.randomUUID(),at:midnight-1},clock);live=api.current();assert.equal(live.diedAt,null);assert.equal(rules.practiceStatus(live,clock).alive,true);
 api.pendingPlayback.clear();live=api.current();assert.equal(live.deathReason,'inactivity');assert.equal(rules.practiceStatus(live,clock).alive,false);
});
