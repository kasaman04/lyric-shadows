'use strict';
// Resumable, bounded-concurrency generation. Original full WAVs remain in ignored tmp/.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
require('dotenv').config({path:path.join(root,'.env'),quiet:true});
const {Store}=require('../lib/voice-practice');
const {synthesize}=require('../lib/sentence-game');
const {VOICE_PROFILES}=require('../lib/voice-catalog');
const {TTS_MODEL_ID}=require('../lib/elevenlabs-model');
const audioDir=path.join(root,'public/sentence-game-audio'),manifestFile=path.join(root,'data/sentence-game-audio.json');
const voice=process.env.SENTENCE_GAME_VOICE||VOICE_PROFILES.find(v=>v.key==='belle').id;
const model=process.env.SENTENCE_GAME_TTS_MODEL||TTS_MODEL_ID;
const cacheOnly=process.argv.includes('--cache-only');
const digest=q=>crypto.createHash('sha256').update(JSON.stringify([q.sentences,q.answer,voice,model,'split-mp3-v3-aligned'])).digest('hex');
const run=(command,args)=>new Promise((resolve,reject)=>{const p=spawn(command,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});let err='';p.stderr.on('data',b=>{err+=b;});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(new Error('Audio conversion failed: '+err.slice(-200))));});
async function exists(file){try{return(await fs.stat(file)).size>300;}catch{return false;}}
async function exportMp3(source,file,start,end){
 const temp=file+'.tmp.mp3';
 // Reset timestamps AFTER trimming: output -ss can otherwise leave the fade
 // positioned before a later clip, muting the entire model answer.
 const filter=`atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS,loudnorm=I=-18:TP=-1.5:LRA=9,afade=t=in:st=0:d=0.004,afade=t=out:st=${Math.max(0,end-start-.006)}:d=0.006`;
 await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',source,'-af',filter,'-codec:a','libmp3lame','-b:a','64k','-ar','24000','-ac','1',temp]);
 await fs.rename(temp,file);
}
(async()=>{
 const questions=JSON.parse(await fs.readFile(path.join(root,'data/sentence-game-questions.json'),'utf8'));
 let manifest={version:1,voice,voiceName:'Belle',model,format:'mp3_24000_64',questions:{}};
 try{const old=JSON.parse(await fs.readFile(manifestFile,'utf8'));if(old.voice===voice&&old.model===model)manifest=old;}catch{}
 const store=new Store(path.join(root,'tmp/sentence-expansion/audio-cache'));
 await fs.mkdir(audioDir,{recursive:true});
 let writes=Promise.resolve();
 const save=()=>{writes=writes.then(async()=>{const temp=manifestFile+'.tmp';await fs.writeFile(temp,JSON.stringify(manifest,null,2)+'\n');await fs.rename(temp,manifestFile);});return writes;};
 let done=0,created=0,halt=false,cursor=0;
 const todo=[];
 for(const q of questions){const entry=manifest.questions[q.id];const ready=entry?.sourceHash===digest(q)&&(cacheOnly?await exists(path.join(root,'tmp/sentence-expansion/audio-cache',entry.fullAudioId+'.wav')):entry.question&&entry.answer&&await exists(path.join(root,'public',entry.question.url))&&await exists(path.join(root,'public',entry.answer.url)));if(ready){done++;}else todo.push(q);}
 console.log(JSON.stringify({event:'start',questions:questions.length,cached:done,pending:todo.length,characters:todo.reduce((n,q)=>n+q.sentences.join('').length+q.answer.length,0),model,voiceName:'Belle'}));
 async function worker(){while(!halt&&cursor<todo.length){const q=todo[cursor++];try{
   const hash=digest(q),prefix=`${q.id}-${hash.slice(0,12)}`;
   const sound=await synthesize([...q.sentences,q.answer],{env:process.env,fetcher:fetch,store});
   if(cacheOnly){manifest.questions[q.id]={sourceHash:hash,sentences:q.sentences,reference:q.answer,fullAudioId:sound.id};done++;created++;await save();console.log(JSON.stringify({event:'source-cached',id:q.id,done,total:questions.length}));continue;}
   const precise=JSON.parse(await fs.readFile(path.join(root,'tmp/sentence-expansion/audio-cache',sound.id+'.precise-cues.json'),'utf8'));
   const cues=precise.cues;const split=(cues[1].end+cues[2].start)/2;
   if(cues.length!==3||!(split>cues[1].start&&split<sound.duration)||cues[0].end>cues[1].start+.08||cues[1].end>split+.08)throw new Error('Invalid sentence boundaries: '+q.id);
   const source=await store.audioFile(sound.id),questionFile=prefix+'-question.mp3',answerFile=prefix+'-answer.mp3';
   await exportMp3(source,path.join(audioDir,questionFile),0,split);
   await exportMp3(source,path.join(audioDir,answerFile),split,sound.duration);
   manifest.questions[q.id]={sourceHash:hash,sentences:q.sentences,reference:q.answer,fullAudioId:sound.id,alignmentMethod:precise.method,question:{url:'sentence-game-audio/'+questionFile,duration:split,cues:cues.slice(0,2).map(c=>({...c,end:Math.min(c.end,split)}))},answer:{url:'sentence-game-audio/'+answerFile,duration:sound.duration-split,cues:[{index:0,start:Math.max(0,cues[2].start-split),end:Math.min(sound.duration,cues[2].end)-split}]}};
   done++;created++;await save();
   console.log(JSON.stringify({event:'generated',id:q.id,done,total:questions.length,seconds:Math.round(sound.duration*100)/100}));
 }catch(e){halt=true;console.error(JSON.stringify({event:'stopped',id:q.id,done,total:questions.length,error:e.status?e.message:String(e.message).replace(/sk_[A-Za-z0-9]+/g,'[redacted]')}));process.exitCode=1;}}}
 // Two concurrent requests work with the existing account without raising its plan.
 await Promise.all([worker(),worker()]);await writes;
 console.log(JSON.stringify({event:'finished',questions:questions.length,done,created,complete:done===questions.length}));
})().catch(()=>{console.error('Generation setup failed; credentials and provider response suppressed.');process.exitCode=1;});
