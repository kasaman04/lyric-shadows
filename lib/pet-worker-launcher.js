'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
function startLocalWorker() {
  const root=path.resolve(__dirname,'..');
  if(process.env.NODE_ENV==='production'||process.env.PET_WORKER_AUTO==='false'||!fs.existsSync(path.join(root,'.env.pet-worker')))return;
  fs.mkdirSync(path.join(root,'tmp'),{recursive:true});
  const log=fs.openSync(path.join(root,'tmp','pet-cloud-worker.log'),'a');
  const child=spawn(process.execPath,[path.join(__dirname,'pet-worker.js')],{cwd:root,env:{...process.env,PET_AI_ENABLED:'true'},stdio:['ignore',log,log],windowsHide:true});
  child.on('error',()=>console.error('画像生成ワーカーを起動できませんでした。'));
  child.unref();fs.closeSync(log);
}
module.exports={startLocalWorker};
