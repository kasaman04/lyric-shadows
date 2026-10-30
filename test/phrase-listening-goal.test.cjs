'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs/promises'),syncFs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const {createState,newPet,listen,age,PetStore}=require('../lib/pet-store');
const {enablePractice,recordPractice,viewPractice}=require('../lib/pet-practice');
const rules=require('../public/pet-rules'),time=require('../public/listening-time'),phrases=require('../data/relative-conversation-phrases.json');
const DAY=86400000,now=Date.parse('2026-10-30T12:00:00+09:00'),midnight=rules.dayEnd(rules.dayKey(now)),source=phrases[0].audio;
function fixture(){const s=createState(now-DAY),p=newPet(now-DAY);s.pets.push(p);p.lifeBaseAt=now-3600000;p.lifeBaseExpiresAt=now+DAY;p.lifeExpiresAt=now+DAY;enablePractice(s,now-DAY,'both');return s}
function events(s,start,seconds,src=source){return Array.from({length:Math.ceil(seconds/30)},(_,i)=>({petId:s.pets.at(-1)?.id,start:start+i*30000,end:Math.min(start+seconds*1000,start+(i+1)*30000),source:src}))}
test('29m59s is incomplete; 30m of phrases fulfills the same daily goal without fabricating answers',()=>{
 const s=fixture();listen(s,events(s,now,1799),now+1799000);assert.equal(viewPractice(s,now+1799000).met,false);
 listen(s,[{petId:s.pets[0].id,source,start:now+1799000,end:now+1800000}],now+1800000);
 const goal=viewPractice(s,now+1800000);assert.equal(goal.met,true);assert.equal(goal.metBy,'phrase');assert.equal(goal.count,0);assert.equal(goal.phraseSeconds,1800);assert.equal(s.sentencePractice.daily['2026-10-30'],undefined);
 age(s,midnight);assert.equal(s.pets[0].diedAt,null);assert.equal(viewPractice(s,midnight).met,false);assert.equal(viewPractice(s,midnight).phraseSeconds,0);
});
test('songs, dramas, game audio, unknown files and older unclassified events do not satisfy the phrase goal',()=>{
 for(const src of [undefined,'/songs/sample/original.mp3','/drama-audio/example.mp3','/conversation-game-audio/ask-001/prompt.mp3','/sentence-game-audio/example.mp3',source.replace(/[a-f0-9]{12}\.mp3$/,'000000000000.mp3')]){
  const s=fixture();listen(s,events(s,now,1800).map(e=>({...e,source:src})),now+1800000);assert.equal(s.totalSeconds,1800);assert.equal(viewPractice(s,now+1800000).met,false,String(src));assert.equal(s.phraseListening.totalSeconds,0);
 }
});
test('ten answers still work; five answers plus fifteen minutes do not combine into a goal',()=>{
 const s=fixture();listen(s,events(s,now,900),now+900000);for(let i=0;i<5;i++)recordPractice(s,{id:crypto.randomUUID(),at:now},now+900000);assert.equal(viewPractice(s,now+900000).met,false);
 for(let i=0;i<5;i++)recordPractice(s,{id:crypto.randomUUID(),at:now},now+900000);const goal=viewPractice(s,now+900000);assert.equal(goal.met,true);assert.equal(goal.metBy,'practice');assert.equal(goal.phraseSeconds,900);
});
test('retries, overlapping media and source enrichment never pay listening or quota twice',()=>{
 const s=fixture(),batch=events(s,now,1800);listen(s,batch.map(e=>({...e,source:undefined})),now+1800000);const expires=s.pets[0].lifeExpiresAt;
 listen(s,batch,now+1800000);listen(s,batch,now+1800000);assert.equal(s.phraseListening.totalSeconds,1800);assert.equal(s.totalSeconds,1800);assert.equal(s.pets[0].lifeExpiresAt,expires);
 listen(s,[{source:phrases[1].audio,petId:s.pets[0].id,start:now+1790000,end:now+1810000}],now+1810000);assert.equal(s.phraseListening.totalSeconds,1810);assert.equal(s.totalSeconds,1810);
});
test('Japan midnight splits real listened seconds exactly and unused minutes do not carry over',()=>{
 const s=fixture();listen(s,events(s,midnight-900000,1800),midnight+900000);assert.equal(s.phraseListening.daily['2026-10-30'],900);assert.equal(s.phraseListening.daily['2026-10-31'],900);assert.equal(viewPractice(s,midnight-1).met,false);assert.equal(viewPractice(s,midnight+900000).met,false);
 const full=fixture();listen(full,events(full,midnight-1800000,1800),midnight);assert.equal(full.phraseListening.daily['2026-10-30'],1800);age(full,midnight);assert.equal(full.pets[0].diedAt,null);assert.equal(viewPractice(full,midnight).phraseSeconds,0);
});
test('late pre-midnight evidence can correct a daily miss, but phrase completion does not remove the life timer',()=>{
 const s=fixture();age(s,midnight+1000);assert.equal(s.pets[0].deathReason,'daily_practice');listen(s,events(s,midnight-1800000,1800),midnight+1000);age(s,midnight+1000);assert.equal(s.pets[0].diedAt,null);
 const dead=fixture();dead.pets[0].lifeBaseExpiresAt=now-1000;dead.pets[0].lifeExpiresAt=now-1000;listen(dead,events(dead,now,1800),now+1800000);age(dead,now+1800000);assert.equal(viewPractice(dead,now+1800000).met,true);assert.equal(dead.pets[0].deathReason,'inactivity');
});
test('new ledger preserves previous counts and history without converting all listening into phrases',()=>{
 const s=fixture();delete s.phraseListening;delete s.pets[0].practice.phraseSeconds;s.daily['2026-10-30']=3600;s.totalSeconds=3600;s.sentenceReview={items:{keep:{answer:'keep'}}};recordPractice(s,{id:crypto.randomUUID(),at:now},now);
 enablePractice(s,now,'both');const goal=viewPractice(s,now);assert.equal(goal.count,1);assert.equal(goal.phraseSeconds,0);assert.equal(s.totalSeconds,3600);assert.equal(s.sentenceReview.items.keep.answer,'keep');
});
test('pending client meter splits days, excludes synced overlaps and previews daily survival without changing saved data',()=>{
 const s=fixture(),all=events(s,midnight-1800000,1800);listen(s,all.slice(0,59),midnight);age(s,midnight+1000);assert.equal(s.pets[0].deathReason,'daily_practice');
 const preview=time.phraseTotals(s,[...all,all.at(-1),{source:'/songs/x/original.mp3',start:midnight,end:midnight+1000}],midnight+1000);assert.equal(preview.daily['2026-10-30'],1800);assert.equal(preview.today,0);assert.equal(preview.pending,30);
 const code=syncFs.readFileSync(path.join(__dirname,'../public/pet.js'),'utf8').replace('  window.PetGame = { initialize,','  window.PetTest={setState(s){save=s},pendingPlayback,current};\n  window.PetGame = { initialize,');
 const scope={window:{PetRules:rules,ListeningTime:time},Date:{now:()=>midnight+1000}};vm.runInNewContext(code,scope);const api=scope.window.PetTest,before=JSON.stringify(s);api.setState(s);api.pendingPlayback.set('last',all.at(-1));assert.equal(api.current().diedAt,null);assert.equal(JSON.stringify(s),before);
});
test('daily progress also works before selecting a pet, and invalid batches cannot partially update it',()=>{
 const s=createState(now);enablePractice(s,now,'both');listen(s,events(s,now,1800),now+1800000);assert.equal(viewPractice(s,now+1800000).met,true);assert.equal(viewPractice(s,now+1800000).petId,null);
 const before=JSON.stringify(s);assert.throws(()=>listen(s,[...events(s,now,30),{source,start:now,end:now+40000}],now+40000));assert.equal(JSON.stringify(s),before);
});
test('persisted source-specific credit stays unique through concurrent retries and a fresh worker',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'phrase-quota-')),id='phrase-quota-test-device',store=new PetStore({dir,clock:()=>now+1800000,practicePolicy:'both'});
 await store.transact(id,s=>Object.assign(s,fixture()));const state=await store.transact(id),batch=events(state,now,1800);
 await Promise.all([store.transact(id,(s,t)=>listen(s,batch,t)),store.transact(id,(s,t)=>listen(s,batch,t))]);
 const fresh=new PetStore({dir,clock:()=>midnight});const saved=await fresh.transact(id);assert.equal(saved.phraseListening.daily['2026-10-30'],1800);assert.equal(saved.totalSeconds,1800);assert.equal(saved.pets[0].diedAt,null);assert.equal(saved.pets[0].practice.phraseSeconds['2026-10-30'],1800);
});
