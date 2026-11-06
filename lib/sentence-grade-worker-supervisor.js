'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {acquireProcessLock}=require('./pet-process-lock');
function supervise({root=path.resolve(__dirname,'..'),spawnWorker=spawn,retryMs=15000}={}){
  const release=acquireProcessLock(path.join(root,'data/sentence-grader/supervisor.lock'),'sentence-grade-worker-supervisor.js');
  if(!release)return null;
  let child,timer,stopped=false;
  function launch(){
    if(stopped)return;
    child=spawnWorker(process.execPath,[path.join(root,'lib/sentence-grade-worker.js')],{cwd:root,env:{...process.env,SENTENCE_GRADER_SUPERVISOR_PID:String(process.pid)},stdio:['ignore','inherit','inherit'],windowsHide:true});
    let done=false;
    function restart(){if(done||stopped)return;done=true;console.log(new Date().toISOString()+' 採点ワーカーを'+retryMs/1000+'秒後に再接続します。');timer=setTimeout(launch,retryMs);}
    child.once('exit',restart);child.once('error',restart);
  }
  function stop(){stopped=true;clearTimeout(timer);child?.kill();release();process.removeListener('exit',release);for(const signal of ['SIGINT','SIGTERM'])process.removeListener(signal,onSignal);}
  function onSignal(){stop();process.exit(0);}
  process.once('exit',release);for(const signal of ['SIGINT','SIGTERM'])process.once(signal,onSignal);
  launch();return {stop};
}
if(require.main===module){
  fs.mkdirSync(path.join(__dirname,'../tmp'),{recursive:true});
  const log=fs.openSync(path.join(__dirname,'../tmp/sentence-grade-worker.log'),'a');
  console.log=(...values)=>fs.writeSync(log,values.join(' ')+'\n');console.error=console.log;
  supervise({spawnWorker:(bin,args,options)=>spawn(bin,args,{...options,stdio:['ignore',log,log]})});
}
module.exports={supervise};
