'use strict';
const path=require('node:path');
require('dotenv').config({path:path.join(__dirname,'../.env'),quiet:true});
const {Store}=require('../lib/voice-practice');
const {synthesize,transcribe,grade}=require('../lib/sentence-game');
const {QUESTIONS}=require('../lib/sentence-game-bank');
(async()=>{
  const store=new Store(path.join(__dirname,'../tmp/sentence-game-smoke')),options={env:process.env,fetcher:fetch,store};
  const question=QUESTIONS[0],sound=await synthesize(question.sentences,options);
  const answer=await synthesize(['I met a man that lives in Tokyo.'],options);
  const fs=require('node:fs/promises'),bytes=await fs.readFile(await store.audioFile(answer.id));
  const transcript=await transcribe(bytes,'audio/wav',options),result=await grade(question,transcript,options);
  if(result.verdict!=='correct')throw new Error('Synthetic correct answer did not pass.');
  console.log(JSON.stringify({questionDuration:sound.duration,cues:sound.cues,transcript,verdict:result.verdict,answerFile:await store.audioFile(answer.id)},null,2));
})().catch(error=>{console.error(error.status?error.message:'Live sentence-game check failed; no keys or provider responses were printed.');process.exitCode=1;});
