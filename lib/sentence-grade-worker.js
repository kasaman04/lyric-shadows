'use strict';
const path=require('node:path');
const {CodexGrader}=require('./codex-grader');
const {SentenceGradeQueue}=require('./sentence-grade-queue');
const {acquireProcessLock}=require('./pet-process-lock');
async function start(){
  require('dotenv').config({path:path.join(__dirname,'../.env.pet-worker'),quiet:true});
  const root=path.resolve(__dirname,'..');
  const release=acquireProcessLock(path.join(root,'data/sentence-grader/worker.lock'),'sentence-grade-worker.js');
  if(!release)return;
  const grader=new CodexGrader(),queue=new SentenceGradeQueue();
  let stopped=false,timer,heartbeat,parentWatch,writingHealth=false;
  const log=message=>console.log(new Date().toISOString()+' '+message);
  function stop(){stopped=true;clearTimeout(timer);clearInterval(heartbeat);clearInterval(parentWatch);grader.close();release();}
  process.once('exit',release);
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{stop();process.exit(0);});
  try{
    if(!queue.store.configured)throw Error('採点用のSupabase接続を .env.pet-worker に設定してください。');
    await grader.connect();await queue.heartbeat();
    heartbeat=setInterval(async()=>{if(writingHealth)return;writingHealth=true;try{await queue.heartbeat();}catch{log('採点ワーカーの接続状態を再送します。');}finally{writingHealth=false;}},10000);
    const parent=Number(process.env.SENTENCE_GRADER_SUPERVISOR_PID);
    if(Number.isInteger(parent)&&parent>0)parentWatch=setInterval(()=>{try{process.kill(parent,0);}catch(error){if(error.code==='ESRCH'){stop();process.exit(0);}}},10000);
    log('Codex app-server の採点ワーカーに接続しました。');
    async function run(){
      try{await queue.tick(grader);}catch{log('採点の受け渡しを再試行します。');}
      if(!stopped)timer=setTimeout(run,1500);
    }
    await run();
  }catch(error){stop();throw error;}
}
if(require.main===module)start().catch(error=>{console.error(new Date().toISOString()+' '+error.message);process.exitCode=1;});
module.exports={start};
