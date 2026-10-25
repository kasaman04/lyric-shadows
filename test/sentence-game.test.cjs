'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),express=require('express');
const {TurnGate}=require('../public/sentence-game-core');
const {TYPES,QUESTIONS,selectQuestion}=require('../lib/sentence-game-bank');
const {mountSentenceGame,grade,storage}=require('../lib/sentence-game');

test('all 17 categories have two complete tasks, and random selection avoids repeats until exhausted',()=>{
  assert.equal(TYPES.length,17);assert.equal(TYPES.filter(t=>t.level==='basic').length,10);assert.equal(QUESTIONS.length,34);
  for(const type of TYPES){const qs=QUESTIONS.filter(q=>q.type===type.key);assert.equal(qs.length,2);assert(qs.every(q=>q.sentences.length===2&&q.sentenceJapanese.length===2&&q.sentenceJapanese.every(text=>/[ぁ-んァ-ン一-龯]/.test(text))&&q.answer&&q.explanation&&q.japanese));assert.equal(selectQuestion(type.key,[],()=>0).type,type.key);}
  const seen=[];for(let i=0;i<34;i++){const q=selectQuestion('all',seen,()=>0);assert(!seen.includes(q.id));seen.push(q.id);}assert(QUESTIONS.includes(selectQuestion('all',seen,()=>0)));assert.throws(()=>selectQuestion('invalid'));
  assert.equal(storage({SENTENCE_GAME_STORAGE:'supabase',SUPABASE_URL:'https://example.invalid'}).bucket,'sentence-game');
});
test('existing review notes gain translations without exposing answers or changing saved English',()=>{
  const {rememberMistake,reviewItems,questionForReview}=require('../lib/sentence-review');
  for(const question of QUESTIONS){
    const item={...question,sentences:[...question.sentences],lastWrongAt:1};delete item.sentenceJapanese;delete item.japanese;
    const state={sentenceReview:{items:{[question.id]:item}}},before=JSON.stringify(state);
    const [listed]=reviewItems(state);
    assert.deepEqual(listed.sentenceJapanese,question.sentenceJapanese);
    assert(!('answer' in listed));assert(!('japanese' in listed));assert(!('explanation' in listed));
    assert.equal(questionForReview(state,question.id).japanese,question.japanese);
    assert.equal(JSON.stringify(state),before,'backfill must not rewrite saved progress');
  }
  const q=QUESTIONS[2],state={};
  rememberMistake(state,{id:'translation-attempt',questionId:q.id,submittedAt:1,result:{verdict:'incorrect'}},q);
  assert.deepEqual(state.sentenceReview.items[q.id].sentenceJapanese,q.sentenceJapanese);
  const saved=state.sentenceReview.items[q.id];
  saved.sentenceJapanese=['保存済みの訳1','保存済みの訳2'];saved.japanese='保存済みの答えの訳';
  assert.deepEqual(reviewItems(state)[0].sentenceJapanese,saved.sentenceJapanese);
  assert.equal(questionForReview(state,q.id).japanese,saved.japanese);
  delete saved.sentenceJapanese;delete saved.japanese;saved.sentences[0]='This is different.';saved.answer='A different answer.';
  assert.deepEqual(reviewItems(state)[0].sentenceJapanese,['','']);
  assert.equal(questionForReview(state,q.id).japanese,'');
});

test('five seconds is an onset deadline; speaking in time removes it and silence finalizes only once',()=>{
  let g=new TurnGate(1000);assert.equal(g.sample(5999,false),null);assert.equal(g.sample(6000,true),'no_answer');assert.equal(g.sample(8000,true),null);
  g=new TurnGate(0);assert.equal(g.sample(4900,true),null);assert.equal(g.remaining(5000),null);assert.equal(g.sample(6000,true),null);assert.equal(g.sample(7599,false),null);assert.equal(g.sample(7600,false),'answer');assert.equal(g.sample(9000,false),null);
  g=new TurnGate(0);g.sample(1,true);assert.equal(g.sample(45000,true),'answer');g=new TurnGate(0);g.cancel();assert.equal(g.sample(5000,false),null);
});
async function fixture(t,{missing=false,petStore,clock,deviceId,gradeVerdict='correct',onTranscribe}={}){
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sg-test-'));
  t.after(async()=>{assert.equal(path.dirname(dir),os.tmpdir());assert(path.basename(dir).startsWith('sg-test-'));await fs.rm(dir,{recursive:true,force:true});});
  const calls=[];let transcript='I met a man that lives in Tokyo.',verdict=gradeVerdict;
  const fetcher=async(url,init)=>{calls.push(url);if(url.includes('text-to-dialogue')){const b=JSON.parse(init.body);return Response.json({audio_base64:Buffer.alloc(48000*b.inputs.length).toString('base64'),voice_segments:b.inputs.map((v,i)=>({voice_id:v.voice_id,dialogue_input_index:i,start_time_seconds:i,end_time_seconds:i+.9}))});}
    if(url.endsWith('/transcriptions')){assert.equal(init.body.get('prompt'),null);assert.equal(init.body.get('languages[]'),'en');onTranscribe?.();return Response.json({text:transcript});}
    const b=JSON.parse(init.body);assert.match(b.instructions,/never silently fix/i);assert.match(b.instructions,/not require an exact/i);await new Promise(r=>setTimeout(r,20));return Response.json({output_text:JSON.stringify({verdict,feedback:'採点結果です。',corrected:transcript})});};
  const env={SENTENCE_GAME_STORAGE:'local',SENTENCE_GAME_DATA_DIR:dir,...missing?{}:{OPENAI_API_KEY:'test-secret',ELEVENLABS_API_KEY:'test-secret'}};
  const app=express();app.use(express.json());const service=mountSentenceGame(app,{env,fetcher,petStore,clock});
  const http=app.listen(0,'127.0.0.1');await new Promise(r=>http.once('listening',r));t.after(()=>new Promise(r=>{http.closeAllConnections();http.close(r);}));
  const base='http://127.0.0.1:'+http.address().port;let cookie;
  async function call(endpoint,body,extra={}){const raw=Buffer.isBuffer(body),identity=[cookie,deviceId?'phraseDeviceId='+deviceId:''].filter(Boolean).join('; ');const res=await fetch(base+'/api/sentence-game'+endpoint,{method:body===undefined?'GET':'POST',headers:{...(identity?{Cookie:identity}:{}),...(body===undefined?{}:{'Content-Type':raw?'audio/webm;codecs=opus':'application/json',Origin:base}),...extra},body:body===undefined?undefined:raw?body:JSON.stringify(body)});cookie ||=res.headers.get('set-cookie')?.split(';')[0];return res;}
  return {call,base,calls,service,setTranscript:value=>{transcript=value;},setVerdict:value=>{verdict=value;},cookie:()=>cookie};
}
test('private attempts, no-answer without ASR, audio caching/ranges, model alternatives and idempotent grading',async t=>{
  const f=await fixture(t);const cfg=await(await f.call('/config')).json();assert(cfg.openai&&cfg.elevenlabs);assert.equal(cfg.onsetTimeoutMs,5000);assert(!JSON.stringify(cfg).includes('secret'));
  assert.equal((await f.call('/attempts',{filter:'who'},{Origin:'https://other.invalid'})).status,403);
  const first=await(await f.call('/attempts',{repeat:'who-1'})).json();assert(first.id);assert.deepEqual(first.question.sentences,QUESTIONS[0].sentences);assert(!JSON.stringify(first).includes('answer'));assert(!first.question.type);
  assert.equal((await f.call('/attempts/'+first.id+'/solution-audio',{})).status,409);
  const inaccessible=await fetch(f.base+'/api/sentence-game/attempts/'+first.id+'/no-answer',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(inaccessible.status,404);
  const bytes=Buffer.from(await(await fetch(f.base+first.audio.url)).arrayBuffer());assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.readUInt32LE(24),24000);
  assert.equal((await fetch(f.base+first.audio.url,{headers:{Range:'bytes=0-43'}})).status,206);
  const no=await(await f.call('/attempts/'+first.id+'/no-answer',{})).json();assert.equal(no.verdict,'no_answer');assert.equal(no.score,0);assert.equal(no.transcript,'');assert.equal(f.calls.filter(s=>s.includes('openai')).length,0);
  await f.call('/attempts/'+first.id+'/solution-audio',{});const count=f.calls.length;await f.call('/attempts/'+first.id+'/solution-audio',{});assert.equal(f.calls.length,count,'solution cache');
  const second=await(await f.call('/attempts',{repeat:first.question.id})).json();assert.equal(second.audio.url,first.audio.url);assert.notEqual(second.id,first.id);
  const responses=await Promise.all([f.call('/attempts/'+second.id+'/answer',Buffer.alloc(400)),f.call('/attempts/'+second.id+'/answer',Buffer.alloc(400))]);for(const response of responses){const result=await response.json();assert.equal(result.verdict,'correct');assert.equal(result.transcript,'I met a man that lives in Tokyo.');assert.equal(result.score,100);}
  assert.equal(f.calls.filter(s=>s.endsWith('/transcriptions')).length,1);assert.equal(f.calls.filter(s=>s.endsWith('/responses')).length,1);
  await f.call('/attempts/'+second.id+'/answer',Buffer.alloc(400));assert.equal(f.calls.filter(s=>s.endsWith('/transcriptions')).length,1);
  const next=await(await f.call('/attempts',{filter:'who',exclude:[first.question.id]})).json();assert.notEqual(next.question.id,first.question.id);
  f.setTranscript('');const empty=await(await f.call('/attempts/'+next.id+'/answer',Buffer.alloc(400))).json();assert.equal(empty.verdict,'no_answer');assert.equal(f.calls.filter(s=>s.endsWith('/responses')).length,1);
  assert.equal((await f.call('/attempts',{filter:'invalid'})).status,400);
});
test('review saves every non-correct verdict once per question, retains sources, reveals on demand, caches answer audio and survives a new server',async t=>{
  const {PetStore}=require('../lib/pet-store');
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sg-test-'));t.after(async()=>{assert.equal(path.dirname(dir),os.tmpdir());assert(path.basename(dir).startsWith('sg-test-'));await fs.rm(dir,{recursive:true,force:true});});
  const petStore=new PetStore({dir,practicePolicy:'daily'}),deviceId='review-notebook-device';
  const f=await fixture(t,{petStore,deviceId,gradeVerdict:'incorrect'});
  const start=async id=>await(await f.call('/attempts',{repeat:id})).json();
  const first=await start('who-1');let result=await(await f.call('/attempts/'+first.id+'/answer',Buffer.alloc(400))).json();assert.equal(result.reviewSaved,true);assert.equal(result.reviewCount,1);
  await f.call('/attempts/'+first.id+'/answer',Buffer.alloc(400));
  f.setVerdict('almost');const second=await start('who-2');await f.call('/attempts/'+second.id+'/answer',Buffer.alloc(400));
  const third=await start('which-7');result=await(await f.call('/attempts/'+third.id+'/no-answer',{})).json();assert.equal(result.reviewCount,3);assert.equal(result.dailyPractice.count,2);
  f.setVerdict('correct');const correct=await start('who-1');result=await(await f.call('/attempts/'+correct.id+'/answer',Buffer.alloc(400))).json();assert.equal(result.reviewCount,3,'correct retry must not remove the saved problem');
  let list=await(await f.call('/review')).json();assert.equal(list.count,3);assert.equal(list.importPending,false);
  const saved=list.items.find(x=>x.id==='who-1');assert.deepEqual(saved.sentences,QUESTIONS[0].sentences);assert(!('answer' in saved));assert(!('type' in saved));assert(!('reference' in saved));assert(!('japanese' in saved));
  const answer=await(await f.call('/review/who-1/reveal',{})).json();assert.equal(answer.reference,QUESTIONS[0].answer);assert(answer.japanese);assert(answer.explanation);
  const before=f.calls.filter(s=>s.includes('text-to-dialogue')).length;
  const sound=await(await f.call('/review/who-1/audio',{part:'answer'})).json();await f.call('/review/who-1/audio',{part:'answer'});assert.equal(f.calls.filter(s=>s.includes('text-to-dialogue')).length,before+1);
  assert.equal(Buffer.from(await(await fetch(f.base+sound.url)).arrayBuffer()).subarray(0,4).toString(),'RIFF');
  await f.call('/review/who-1/audio',{part:'question'});assert.equal(f.calls.filter(s=>s.includes('text-to-dialogue')).length,before+1,'original question audio is already cached');
  assert.equal((await f.call('/review/who-1/audio',{part:'arbitrary text'})).status,400);
  assert.equal((await f.call('/review/__proto__/reveal',{})).status,404);
  assert.equal((await f.call('/review/who-1/reveal',{}, {Origin:'https://other.invalid'})).status,403);
  const foreign={Cookie:f.cookie()+'; phraseDeviceId=other-review-device'};
  assert.equal((await(await f.call('/review',undefined,foreign)).json()).count,0);assert.equal((await f.call('/review/who-1/reveal',{},foreign)).status,404);assert.equal((await f.call('/review/who-1/audio',{part:'answer'},foreign)).status,404);
  const restarted=await fixture(t,{petStore:new PetStore({dir,practicePolicy:'daily'}),deviceId});list=await(await restarted.call('/review')).json();assert.equal(list.count,3);assert.equal((await(await restarted.call('/config')).json()).dailyPractice.count,3,'revealing and playing answers must not count as spoken practice');
});
test('review imports earlier receipt-indexed answers in bounded batches and ignores other devices',async t=>{
  const {PetStore}=require('../lib/pet-store'),{recordPractice}=require('../lib/pet-practice');
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sg-test-'));t.after(async()=>{assert.equal(path.dirname(dir),os.tmpdir());assert(path.basename(dir).startsWith('sg-test-'));await fs.rm(dir,{recursive:true,force:true});});
  const petStore=new PetStore({dir,practicePolicy:'daily'}),deviceId='legacy-review-device',f=await fixture(t,{petStore,deviceId});
  for(let i=0;i<50;i++){const id=crypto.randomUUID(),at=Date.now();await f.service.store.write({id,kind:'attempt',deviceId:i===49?'different-review-device':deviceId,questionId:QUESTIONS[i%QUESTIONS.length].id,submittedAt:at,result:{verdict:'incorrect'}});await petStore.transact(deviceId,(s,now)=>recordPractice(s,{id,at},now));}
  const first=await(await f.call('/review')).json();assert(first.importPending);assert.equal(first.count,24);
  const second=await(await f.call('/review')).json();assert(second.importPending);assert.equal(second.count,34);
  const third=await(await f.call('/review')).json();assert.equal(third.importPending,false);assert.equal(third.count,34);
  const again=await(await f.call('/review')).json();assert.equal(again.count,34);assert.equal(again.importPending,false);
});
test('missing provider keys fails visibly before any paid request; exact reference and silence need no grading model',async t=>{
  const f=await fixture(t,{missing:true});assert.equal((await f.call('/attempts',{})).status,503);assert.equal(f.calls.length,0);
  assert.equal((await grade(QUESTIONS[0],QUESTIONS[0].answer,{env:{}})).verdict,'correct');assert.equal((await grade(QUESTIONS[0],'',{env:{}})).verdict,'no_answer');
});
test('only real graded answers credit the bound pet identity, duplicates count once, failed synchronization retries without rebilling',async t=>{
  const {PetStore,action}=require('../lib/pet-store');
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sg-test-'));t.after(async()=>{assert.equal(path.dirname(dir),os.tmpdir());assert(path.basename(dir).startsWith('sg-test-'));await fs.rm(dir,{recursive:true,force:true});});
  let clock=Date.parse('2026-10-24T12:00:00+09:00');const deviceId='sentence-practice-device',actual=new PetStore({dir,clock:()=>clock,practicePolicy:'daily'});
  await actual.transact(deviceId,(s,now)=>action(s,{type:'select',element:'grass',requestId:'sentence-select-001'},now));clock+=86400000;
  let failCredit=false;const petStore={transact:(id,change)=>{if(failCredit){failCredit=false;throw Object.assign(new Error('temporary pet storage failure'),{status:503});}return actual.transact(id,change);}};
  let afterASR;const f=await fixture(t,{petStore,clock:()=>clock,deviceId,gradeVerdict:'incorrect',onTranscribe:()=>afterASR?.()});
  let config=await(await f.call('/config')).json();assert.equal(config.dailyPractice.count,0);assert.equal(config.dailyPractice.optional,false);
  const start=async()=>await(await f.call('/attempts',{repeat:'who-1'})).json();
  let attempt=await start();await f.call('/attempts/'+attempt.id+'/no-answer',{});assert.equal((await actual.transact(deviceId)).sentencePractice.daily['2026-10-25'],undefined);
  attempt=await start();failCredit=true;
  assert.equal((await f.call('/attempts/'+attempt.id+'/answer',Buffer.alloc(400))).status,503);
  let result=await(await f.call('/attempts/'+attempt.id+'/answer',Buffer.alloc(400))).json();assert.equal(result.dailyPractice.count,1);assert.equal(result.verdict,'incorrect');assert.equal(f.calls.filter(s=>s.endsWith('/transcriptions')).length,1);
  result=await(await f.call('/attempts/'+attempt.id+'/answer',Buffer.alloc(400))).json();assert.equal(result.dailyPractice.count,1);
  // An empty ASR transcript is not a completed practice, even after audio upload.
  f.setTranscript('');attempt=await start();result=await(await f.call('/attempts/'+attempt.id+'/answer',Buffer.alloc(400))).json();assert.equal(result.dailyPractice.count,1);
  f.setTranscript('My answer is not grammatical.');
  for(let i=0;i<9;i++){attempt=await start();result=await(await f.call('/attempts/'+attempt.id+'/answer',Buffer.alloc(400))).json();}
  assert.equal(result.dailyPractice.count,10);assert.equal(result.dailyPractice.met,true);
  // A caller cannot redirect a previously-created attempt's credit to a different device.
  attempt=await start();await f.call('/attempts/'+attempt.id+'/answer',Buffer.alloc(400),{Cookie:f.cookie()+'; phraseDeviceId=another-practice-device'});
  assert.equal((await actual.transact(deviceId)).sentencePractice.daily['2026-10-25'],11);
  assert.equal((await actual.transact('another-practice-device')).sentencePractice.daily['2026-10-25'],undefined);
  clock=Date.parse('2026-10-26T00:00:00+09:00');config=await(await f.call('/config')).json();assert(config.dailyPractice.alive);assert.equal(config.dailyPractice.count,0);
  const {recordPractice}=require('../lib/pet-practice');
  for(let i=0;i<9;i++)await actual.transact(deviceId,(s,now)=>recordPractice(s,{id:crypto.randomUUID(),at:now},now));
  clock=Date.parse('2026-10-26T23:59:59+09:00');attempt=await start();afterASR=()=>{clock=Date.parse('2026-10-27T00:00:10+09:00');};
  result=await(await f.call('/attempts/'+attempt.id+'/answer',Buffer.alloc(400))).json();
  assert.equal(result.dailyPractice.count,0);assert(result.dailyPractice.alive);assert.equal((await actual.transact(deviceId)).sentencePractice.daily['2026-10-26'],10);
});
