'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const express=require('express');
const {PetStore,supabaseStorage,pendingDesign}=require('./pet-store');
const {PetImages}=require('./pet-image');
const {PetDesigner}=require('./pet-designer');
const {supabaseImages}=require('./pet-cloud');
const {mountPetApi}=require('./pet-api');

class PetWorker {
  constructor({store,images,designer,owner=crypto.randomUUID(),clock=Date.now}) {
    this.store=store;this.owner=owner;this.clock=clock;
    this.api=mountPetApi(express(),{store,images,designer});
  }
  async tick() {
    for(const id of await this.store.remote.pending()) {
      let claimed=false;
      const state=await this.store.transact(id,s=>{
        claimed=false;
        const lease=s.designLease;
        if(lease&&lease.owner!==this.owner&&lease.until>this.clock())return;
        if(!s.pets.some(p=>pendingDesign(p,s)))return;
        s.designLease={owner:this.owner,until:this.clock()+3600000};claimed=true;
      });
      if(!claimed)continue;
      try {
        for(const pet of state.pets)if(pendingDesign(pet,state))this.api.enqueue(id,pet.id);
        await this.api.idle();
      } finally {
        await this.store.transact(id,s=>{if(s.designLease?.owner===this.owner)delete s.designLease;});
      }
    }
  }
}
async function start() {
  require('dotenv').config({path:path.join(__dirname,'..','.env.pet-worker'),quiet:true});
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;
  if(!url||!key)throw new Error('画像生成ワーカーのSupabase接続を設定してください。');
  const dir=path.join(__dirname,'..','data','pets','cloud-worker');await fs.mkdir(dir,{recursive:true});
  let owner;
  const ownerFile=path.join(dir,'worker-id');
  try{owner=(await fs.readFile(ownerFile,'utf8')).trim();}catch(e){if(e.code!=='ENOENT')throw e;owner=crypto.randomUUID();await fs.writeFile(ownerFile,owner,{flag:'wx'});}
  const lockFile=path.join(dir,'worker.lock');
  try {
    const previous=Number(await fs.readFile(lockFile,'utf8'));
    try {process.kill(previous,0);throw new Error('画像生成ワーカーは起動済みです。');}
    catch(e){if(e.code!=='ESRCH')throw e;await fs.unlink(lockFile);}
  }catch(e){if(e.code!=='ENOENT')throw e;}
  await fs.writeFile(lockFile,String(process.pid),{flag:'wx'});
  const cleanup=()=>{fs.unlink(lockFile).catch(()=>{});};
  const remote=supabaseStorage(url,key),images=new PetImages({dir:path.join(dir,'images'),remote:supabaseImages(url,key)});
  const designer=new PetDesigner({images}),store=new PetStore({dir,remote});
  const worker=new PetWorker({store,images,designer,owner});
  let stopping=false,timer;
  const stop=()=>{stopping=true;clearTimeout(timer);designer.close();cleanup();process.exit(0);};
  process.on('SIGINT',stop);process.on('SIGTERM',stop);
  try {await designer.connect();}
  catch(e){cleanup();throw e;}
  console.log('育成の画像生成ワーカーに接続しました。公開版の進化を待っています。');
  async function run() {
    try {await worker.tick();}catch{console.error('保存先への接続を再試行します。');}
    if(!stopping)timer=setTimeout(run,15000);
  }
  await run();
}
if(require.main===module)start().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={PetWorker};
