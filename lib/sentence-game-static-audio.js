'use strict';
const fs=require('node:fs'),path=require('node:path');
const {QUESTIONS}=require('./sentence-game-bank');
const manifestPath=path.join(__dirname,'../data/sentence-game-audio.json');
function loadStaticAudio(){
 let manifest;try{manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));}catch(e){if(e.code==='ENOENT')return {find:()=>null,complete:false,count:0};throw e;}
 const index=new Map();let count=0;
 for(const q of QUESTIONS){
  const saved=manifest.questions?.[q.id];
  if(!saved||JSON.stringify(saved.sentences)!==JSON.stringify(q.sentences)||saved.reference!==q.answer)continue;
  const parts=[[q.sentences,saved.question],[[q.answer],saved.answer]];
  if(!parts.every(([texts,a])=>a&&/^sentence-game-audio\/[a-z0-9-]+\.mp3$/.test(a.url)&&Number.isFinite(a.duration)&&a.duration>0&&a.cues?.length===texts.length&&a.cues.every((c,i)=>c.index===i&&Number.isFinite(c.start)&&c.start>=0&&c.end>c.start&&c.end<=a.duration+.1)&&fs.existsSync(path.join(__dirname,'../public',a.url))))continue;
  for(const [texts,a]of parts)index.set(JSON.stringify(texts),{...a,publicUrl:'/'+a.url});
  count++;
 }
 return {find:texts=>index.get(JSON.stringify(texts))||null,complete:count===QUESTIONS.length,count};
}
module.exports={loadStaticAudio};
