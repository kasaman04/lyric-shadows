'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '..');
require('dotenv').config({path:path.join(root,'.env'),quiet:true});
const {VOICE_PROFILES} = require('../lib/voice-catalog');
const {TTS_MODEL_ID} = require('../lib/elevenlabs-model');
const {wav} = require('../lib/voice-practice');
function option(name,fallback){const index=process.argv.indexOf(name);if(index<0)return fallback;const value=process.argv[index+1];if(!value||value.startsWith('--'))throw Error('Missing value for '+name);return value;}
const inputFile = path.resolve(root,option('--input','data/sentence-game-conversations.json'));
const outputDir = path.resolve(root,option('--output','../output/relative-conversations-20261030'));
const audioDir = path.join(outputDir,'audio');
const cacheDir = path.join(root,'tmp/relative-conversation-audio-cache');
const manifestFile = path.join(audioDir,'manifest.json');
const limitIndex = process.argv.indexOf('--limit');
const limit = limitIndex < 0 ? Infinity : Number(process.argv[limitIndex+1]);
if (limit !== Infinity && (!Number.isInteger(limit) || limit < 1)) throw Error('Invalid limit');
const byKey = new Map(VOICE_PROFILES.map(v=>[v.key,v]));
const castFor = c => ['whom','whomever'].includes(c.type) ? {A:byKey.get('eric'),B:byKey.get('bella')} : {A:byKey.get('mark'),B:byKey.get('belle')};
const publicVoice = v => ({key:v.key,name:v.name});
const hashFor = (c,cast) => crypto.createHash('sha256').update(JSON.stringify({turns:c.turns.map(t=>t.en),cast:[cast.A.id,cast.B.id],model:TTS_MODEL_ID,format:'pcm24000-to-mp3-96k-v1'})).digest('hex');
const run = (command,args) => new Promise((resolve,reject)=>{const proc=spawn(command,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});let stderr='';proc.stderr.on('data',b=>stderr+=b);proc.on('error',()=>reject(Error('Audio converter could not start')));proc.on('exit',code=>code===0?resolve():reject(Error('Audio conversion failed: '+stderr.slice(-200))));});
async function exists(file){try{return(await fs.stat(file)).size>1000}catch{return false}}
async function synthesize(c,cast){
  for(let attempt=0;attempt<3;attempt++){
    const response=await fetch('https://api.elevenlabs.io/v1/text-to-dialogue/with-timestamps?output_format=pcm_24000',{
      method:'POST',headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({model_id:TTS_MODEL_ID,inputs:c.turns.map(t=>({text:t.en,voice_id:cast[t.speaker].id})),language_code:'en'}),signal:AbortSignal.timeout(150000)
    });
    if(response.ok)return response.json();
    const data=await response.json().catch(()=>({}));
    const code=String(data.detail?.status||data.detail?.code||'').replace(/[^a-z0-9_-]/gi,'').slice(0,80);
    if([429,502,503,504].includes(response.status)&&!['quota_exceeded','insufficient_credits','payment_required'].includes(code)&&attempt<2){await new Promise(r=>setTimeout(r,3000*(attempt+1)));continue}
    throw Error(`ElevenLabs HTTP ${response.status}${code?' ('+code+')':''}`);
  }
}
function parseSound(result,c,cast){
  const pcm=Buffer.from(result.audio_base64||'','base64');
  if(pcm.length<48000||pcm.length%2||pcm.length>20*1024*1024||pcm.subarray(0,4).toString()==='RIFF')throw Error('Invalid PCM audio');
  const duration=pcm.length/48000;
  const cues=c.turns.map((turn,index)=>{
    const parts=(result.voice_segments||[]).filter(s=>s.dialogue_input_index===index&&s.voice_id===cast[turn.speaker].id);
    if(!parts.length||parts.some(s=>!Number.isFinite(s.start_time_seconds)||!Number.isFinite(s.end_time_seconds)))throw Error('Missing turn timestamps');
    const start=Math.min(...parts.map(s=>s.start_time_seconds)),end=Math.min(duration,Math.max(...parts.map(s=>s.end_time_seconds)));
    if(start<0||end<=start||start>=duration)throw Error('Invalid turn timestamps');
    return {index,speaker:turn.speaker,start,end};
  });
  if(cues.some((cue,i)=>i>0&&cue.start<cues[i-1].start))throw Error('Turn timestamps out of order');
  return {pcm,duration,cues};
}
(async()=>{
  const pack=JSON.parse(await fs.readFile(inputFile,'utf8'));
  if(process.argv.includes('--dry-run')){console.log(JSON.stringify({conversations:pack.conversations.length,characters:pack.conversations.reduce((n,c)=>n+c.turns.reduce((s,t)=>s+t.en.length,0),0),model:TTS_MODEL_ID,apiKeyConfigured:Boolean(process.env.ELEVENLABS_API_KEY),inputFile,outputDir}));return;}
  if(!process.env.ELEVENLABS_API_KEY)throw Error('ELEVENLABS_API_KEY is missing');
  await fs.mkdir(audioDir,{recursive:true});await fs.mkdir(cacheDir,{recursive:true});
  let manifest={version:1,provider:'elevenlabs',model:TTS_MODEL_ID,conversations:{}};
  try{const old=JSON.parse(await fs.readFile(manifestFile,'utf8'));if(old.model===TTS_MODEL_ID)manifest=old}catch{}
  const pending=[];let done=0;
  for(const c of pack.conversations){const cast=castFor(c),hash=hashFor(c,cast),entry=manifest.conversations[c.id];if(entry?.sourceHash===hash&&await exists(path.join(outputDir,entry.src)))done++;else pending.push(c)}
  const todo=pending.slice(0,limit);
  console.log(JSON.stringify({event:'start',total:pack.conversations.length,cached:done,pending:todo.length,characters:todo.reduce((n,c)=>n+c.turns.reduce((s,t)=>s+t.en.length,0),0),model:TTS_MODEL_ID}));
  let cursor=0,halt=false,writes=Promise.resolve();
  const save=()=>{writes=writes.then(async()=>{const temp=manifestFile+'.tmp';await fs.writeFile(temp,JSON.stringify(manifest,null,2)+'\n');await fs.rename(temp,manifestFile)});return writes};
  async function worker(){while(!halt&&cursor<todo.length){const c=todo[cursor++];try{
    const cast=castFor(c),sourceHash=hashFor(c,cast),prefix=c.id+'-'+sourceHash.slice(0,12),sourceFile=path.join(cacheDir,prefix+'.wav'),timingFile=path.join(cacheDir,prefix+'.json');
    let info;
    if(await exists(sourceFile)){try{info=JSON.parse(await fs.readFile(timingFile,'utf8'))}catch{}}
    if(!info){const result=await synthesize(c,cast),sound=parseSound(result,c,cast);info={duration:sound.duration,cues:sound.cues};await fs.writeFile(sourceFile,wav(sound.pcm));await fs.writeFile(timingFile,JSON.stringify(info));}
    const filename=prefix+'.mp3',file=path.join(audioDir,filename),temp=file+'.tmp.mp3';
    await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',sourceFile,'-af','loudnorm=I=-18:TP=-1.5:LRA=9','-codec:a','libmp3lame','-b:a','96k','-ar','24000','-ac','1',temp]);
    await fs.rename(temp,file);
    manifest.conversations[c.id]={sourceHash,src:'audio/'+filename,duration:info.duration,cues:info.cues,voices:{A:publicVoice(cast.A),B:publicVoice(cast.B)},generatedAt:new Date().toISOString()};
    done++;await save();console.log(JSON.stringify({event:'generated',id:c.id,done,total:pack.conversations.length,seconds:Number(info.duration.toFixed(2))}));
  }catch(e){halt=true;process.exitCode=1;console.error(JSON.stringify({event:'stopped',id:c.id,done,error:String(e.message).replace(/sk_[a-z0-9_-]+/gi,'[redacted]')}))}}}
  await Promise.all([worker(),worker()]);await writes;
  console.log(JSON.stringify({event:'finished',done,total:pack.conversations.length,complete:done===pack.conversations.length}));
})().catch(e=>{console.error(String(e.message).replace(/sk_[a-z0-9_-]+/gi,'[redacted]'));process.exitCode=1});
