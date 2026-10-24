'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),express=require('express');
const {TurnGate}=require('../public/sentence-game-core');
const {TYPES,QUESTIONS,selectQuestion}=require('../lib/sentence-game-bank');
const {mountSentenceGame,grade,storage}=require('../lib/sentence-game');

test('all 17 categories have two complete tasks, and random selection avoids repeats until exhausted',()=>{
  assert.equal(TYPES.length,17);assert.equal(TYPES.filter(t=>t.level==='basic').length,10);assert.equal(QUESTIONS.length,34);
  for(const type of TYPES){const qs=QUESTIONS.filter(q=>q.type===type.key);assert.equal(qs.length,2);assert(qs.every(q=>q.sentences.length===2&&q.answer&&q.explanation));assert.equal(selectQuestion(type.key,[],()=>0).type,type.key);}
  const seen=[];for(let i=0;i<34;i++){const q=selectQuestion('all',seen,()=>0);assert(!seen.includes(q.id));seen.push(q.id);}assert(QUESTIONS.includes(selectQuestion('all',seen,()=>0)));assert.throws(()=>selectQuestion('invalid'));
  assert.equal(storage({SENTENCE_GAME_STORAGE:'supabase',SUPABASE_URL:'https://example.invalid'}).bucket,'sentence-game');
});
test('five seconds is an onset deadline; speaking in time removes it and silence finalizes only once',()=>{
  let g=new TurnGate(1000);assert.equal(g.sample(5999,false),null);assert.equal(g.sample(6000,true),'no_answer');assert.equal(g.sample(8000,true),null);
  g=new TurnGate(0);assert.equal(g.sample(4900,true),null);assert.equal(g.remaining(5000),null);assert.equal(g.sample(6000,true),null);assert.equal(g.sample(7599,false),null);assert.equal(g.sample(7600,false),'answer');assert.equal(g.sample(9000,false),null);
  g=new TurnGate(0);g.sample(1,true);assert.equal(g.sample(45000,true),'answer');g=new TurnGate(0);g.cancel();assert.equal(g.sample(5000,false),null);
});
async function fixture(t,{missing=false}={}){
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sg-test-'));
  t.after(async()=>{assert.equal(path.dirname(dir),os.tmpdir());assert(path.basename(dir).startsWith('sg-test-'));await fs.rm(dir,{recursive:true,force:true});});
  const calls=[];let transcript='I met a man that lives in Tokyo.';
  const fetcher=async(url,init)=>{calls.push(url);if(url.includes('text-to-dialogue')){const b=JSON.parse(init.body);return Response.json({audio_base64:Buffer.alloc(48000*b.inputs.length).toString('base64'),voice_segments:b.inputs.map((v,i)=>({voice_id:v.voice_id,dialogue_input_index:i,start_time_seconds:i,end_time_seconds:i+.9}))});}
    if(url.endsWith('/transcriptions')){assert.equal(init.body.get('prompt'),null);assert.equal(init.body.get('languages[]'),'en');return Response.json({text:transcript});}
    const b=JSON.parse(init.body);assert.match(b.instructions,/never silently fix/i);assert.match(b.instructions,/not require an exact/i);await new Promise(r=>setTimeout(r,20));return Response.json({output_text:JSON.stringify({verdict:'correct',feedback:'自然につなげられました。',corrected:transcript})});};
  const env={SENTENCE_GAME_STORAGE:'local',SENTENCE_GAME_DATA_DIR:dir,...missing?{}:{OPENAI_API_KEY:'test-secret',ELEVENLABS_API_KEY:'test-secret'}};
  const app=express();app.use(express.json());mountSentenceGame(app,{env,fetcher});
  const http=app.listen(0,'127.0.0.1');await new Promise(r=>http.once('listening',r));t.after(()=>new Promise(r=>{http.closeAllConnections();http.close(r);}));
  const base='http://127.0.0.1:'+http.address().port;let cookie;
  async function call(endpoint,body,extra={}){const raw=Buffer.isBuffer(body);const res=await fetch(base+'/api/sentence-game'+endpoint,{method:body===undefined?'GET':'POST',headers:{...(cookie?{Cookie:cookie}:{}),...(body===undefined?{}:{'Content-Type':raw?'audio/webm;codecs=opus':'application/json',Origin:base}),...extra},body:body===undefined?undefined:raw?body:JSON.stringify(body)});cookie ||=res.headers.get('set-cookie')?.split(';')[0];return res;}
  return {call,base,calls,setTranscript:value=>{transcript=value;},cookie:()=>cookie};
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
test('missing provider keys fails visibly before any paid request; exact reference and silence need no grading model',async t=>{
  const f=await fixture(t,{missing:true});assert.equal((await f.call('/attempts',{})).status,503);assert.equal(f.calls.length,0);
  assert.equal((await grade(QUESTIONS[0],QUESTIONS[0].answer,{env:{}})).verdict,'correct');assert.equal((await grade(QUESTIONS[0],'',{env:{}})).verdict,'no_answer');
});
