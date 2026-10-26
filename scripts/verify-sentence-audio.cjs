'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),questions=require('../data/sentence-game-questions.json');
const manifest=require('../data/sentence-game-audio.json');
async function decode(list){return new Promise((resolve,reject)=>{const p=spawn('ffmpeg',['-hide_banner','-loglevel','error','-xerror','-f','concat','-safe','0','-i',list,'-f','null','-'],{windowsHide:true,stdio:['ignore','ignore','pipe']});let err='';p.stderr.on('data',b=>err+=b);p.on('error',reject);p.on('exit',n=>n===0?resolve():reject(new Error(err.slice(-1000))));});}
async function volume(file){return new Promise((resolve,reject)=>{const p=spawn('ffmpeg',['-hide_banner','-i',file,'-af','volumedetect','-f','null','-'],{windowsHide:true,stdio:['ignore','ignore','pipe']});let output='';p.stderr.on('data',b=>output+=b);p.on('error',reject);p.on('exit',n=>{const mean=/mean_volume: (-?[\d.]+) dB/.exec(output),peak=/max_volume: (-?[\d.]+) dB/.exec(output);if(n||!mean||!peak)return reject(Error('Cannot measure '+file));resolve({mean:Number(mean[1]),peak:Number(peak[1])});});});}
(async()=>{
 let bytes=0,seconds=0;const files=[];const reports=[];
 for(const q of questions){
  const a=manifest.questions[q.id];assert(a,`Missing ${q.id}`);assert.deepEqual(a.sentences,q.sentences);assert.equal(a.reference,q.answer);
  for(const [part,count]of [['question',2],['answer',1]]){
   const sound=a[part];assert.equal(sound.cues.length,count);assert(sound.duration>.15&&sound.duration<40,`${q.id}/${part}: duration`);
   for(const [i,c]of sound.cues.entries()){assert.equal(c.index,i);assert(c.start>=0&&c.end>c.start&&c.end<=sound.duration+.1);}
   const file=path.join(root,'public',sound.url),stat=await fs.stat(file);assert(stat.size>500);bytes+=stat.size;seconds+=sound.duration;files.push(file);
  }
 }
 const dir=path.join(root,'tmp/sentence-expansion');await fs.mkdir(dir,{recursive:true});const list=path.join(dir,'all-audio.ffconcat');
 await fs.writeFile(list,'ffconcat version 1.0\n'+files.map(f=>"file '"+f.replace(/\\/g,'/').replace(/'/g,"'\\''")+"'").join('\n')+'\n');
 await decode(list);
 let measured=0,measureCursor=0;const levels=[];
 async function measureWorker(){while(measureCursor<files.length){const file=files[measureCursor++],v=await volume(file);assert(v.mean>-45&&v.peak>-25,`Silent or too quiet: ${path.basename(file)}`);levels.push({...v,file:path.basename(file)});measured++;if(measured%250===0)console.log(JSON.stringify({event:'volume-checked',files:measured,total:files.length}));}}
 await Promise.all([measureWorker(),measureWorker(),measureWorker(),measureWorker()]);
 await fs.writeFile(path.join(dir,'audio-levels.json'),JSON.stringify(levels,null,2)+'\n');
 if(process.argv.includes('--asr')){
  require('dotenv').config({path:path.join(root,'.env'),quiet:true});const {transcribe,normalize}=require('../lib/sentence-game');
  // One new question and one new model answer per category; shortest/longest clips are also sampled.
  const samples=questions.filter(q=>q.id.endsWith('-extra-001'));
  for(const part of ['question','answer']){const ranked=[...questions].sort((a,b)=>manifest.questions[a.id][part].duration-manifest.questions[b.id][part].duration);for(const q of [ranked[0],ranked.at(-1)])if(!samples.includes(q))samples.push(q);}
  let cursor=0;
  async function worker(){while(cursor<samples.length){const q=samples[cursor++];for(const part of ['question','answer']){
   const sound=manifest.questions[q.id][part],expected=part==='question'?q.sentences.join(' '):q.answer;
   const transcript=await transcribe(await fs.readFile(path.join(root,'public',sound.url)),'audio/mpeg',{env:process.env,fetcher:fetch});
   const canonical=s=>normalize(s).replace(/\beighty\b/g,'80');
   const same=canonical(expected)===canonical(transcript);reports.push({id:q.id,part,expected,transcript,exactNormalizedMatch:same});
   console.log(JSON.stringify({event:'transcribed',id:q.id,part,exactNormalizedMatch:same}));
  }}}
  await Promise.all([worker(),worker()]);
  await fs.writeFile(path.join(dir,'speech-check.json'),JSON.stringify(reports,null,2)+'\n');
 }
 const summary={questions:questions.length,files:files.length,bytes,megabytes:Math.round(bytes/1e6*100)/100,minutes:Math.round(seconds/60*100)/100,allDecode:true,allAudible:measured===files.length,speechSamples:reports.length,exactSpeechMatches:reports.filter(r=>r.exactNormalizedMatch).length};
 await fs.writeFile(path.join(dir,'verification.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
})().catch(e=>{console.error(e.status?e.message:String(e.message).replace(/sk_[A-Za-z0-9]+/g,'[redacted]'));process.exitCode=1;});
