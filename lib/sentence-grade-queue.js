'use strict';
const crypto=require('node:crypto');
const path=require('node:path');
const {SupabaseVoiceStore}=require('./voice-practice-cloud');
const {validateGrade}=require('./sentence-grading-task');
const {unavailable}=require('./codex-grader');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const idFor=task=>{const hash=crypto.createHash('sha256').update(JSON.stringify(task)).digest('hex');return `${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20,32)}`;};

class GradeCloudStore {
  constructor(env,fetcher=fetch){this.remote=new SupabaseVoiceStore(path.join(__dirname,'../data/sentence-grader'),env,fetcher);this.remote.bucket='sentence-grades';this.configured=this.remote.configured;}
  async get(name){try{return JSON.parse((await this.remote.get(name,131072)).toString('utf8'));}catch(error){if(error.status===404)return null;throw error;}}
  async put(name,value){await this.remote.put(name,JSON.stringify(value),'application/json');}
  async create(name,value){
    await this.remote.ensure();const response=await this.remote.request('/object/sentence-grades/'+name,{method:'POST',headers:{'Content-Type':'application/json','x-upsert':'false'},body:JSON.stringify(value)});
    if(response.ok)return true;
    if(response.status===409)return false;
    if(response.status===400){const error=await response.json();if(/duplicate|already exists/i.test(JSON.stringify(error)))return false;}
    throw unavailable();
  }
  async pending(){
    await this.remote.ensure();const response=await this.remote.request('/object/list/sentence-grades',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefix:'pending/',limit:20,offset:0,sortBy:{column:'created_at',order:'asc'}})});
    if(!response.ok)throw unavailable();const rows=await response.json();if(!Array.isArray(rows))throw unavailable();
    return rows.map(row=>row.name).filter(name=>/^[a-f0-9-]{36}\.json$/.test(name)).map(name=>name.slice(0,-5));
  }
  async remove(id){const response=await this.remote.request('/object/sentence-grades',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:['pending/'+id+'.json']})});if(!response.ok)throw unavailable();}
}
class SentenceGradeQueue {
  constructor({store,env=process.env,fetcher=fetch,clock=Date.now,wait=sleep,timeoutMs=45000,pollMs=750}={}){
    this.store=store||new GradeCloudStore(env,fetcher);this.clock=clock;this.wait=wait;this.timeoutMs=timeoutMs;this.pollMs=pollMs;this.provider='codex-app-server';this.completed=new Map();
  }
  async available(){try{if(!this.store.configured)return false;const health=await this.store.get('worker.json');return health?.connected===true&&this.clock()-health.at<45000&&health.at<=this.clock()+5000;}catch{return false;}}
  heartbeat(){return this.store.put('worker.json',{at:this.clock(),connected:true,provider:this.provider});}
  async grade(task){
    if(!this.store.configured)throw unavailable();
    const id=idFor(task),name='results/'+id+'.json',cached=await this.store.get(name);
    if(cached?.result)return validateGrade(cached.result);
    let job=await this.store.get('pending/'+id+'.json');
    if(!job){const fresh={id,runId:crypto.randomUUID(),task,createdAt:this.clock()};if(await this.store.create('pending/'+id+'.json',fresh))job=fresh;else job=await this.store.get('pending/'+id+'.json');}
    if(!job)throw unavailable();
    const until=this.clock()+this.timeoutMs;
    while(this.clock()<until){
      const answer=await this.store.get(name);
      if(answer?.result)return validateGrade(answer.result);
      if(answer?.error&&answer.runId===job.runId)throw unavailable(answer.error);
      await this.wait(this.pollMs);
    }
    throw unavailable('Codexの採点待ちです。採点用PCが起動しているか確認し、もう一度「判定する」を押してください。');
  }
  async tick(grader){
    for(const id of await this.store.pending()){
      const job=await this.store.get('pending/'+id+'.json');if(!job)continue;
      if(!job.task||typeof job.task.instructions!=='string'||!job.task.input||job.id!==id||idFor(job.task)!==id||!job.runId||!Number.isFinite(job.createdAt)||this.clock()-job.createdAt>600000){await this.store.remove(id);continue;}
      const saved=await this.store.get('results/'+id+'.json');
      if(saved?.result){await this.store.remove(id);this.completed.delete(id);continue;}
      let answer=this.completed.get(id);
      if(!answer){
        try{answer={id,runId:job.runId,at:this.clock(),provider:this.provider,result:validateGrade(await grader.grade(job.task))};}
        catch{answer={id,runId:job.runId,at:this.clock(),provider:this.provider,error:'Codexで採点を完了できませんでした。もう一度「判定する」を押してください。'};}
        this.completed.set(id,answer);
      }
      await this.store.put('results/'+id+'.json',answer);await this.store.remove(id);this.completed.delete(id);
    }
  }
}
function createSentenceGrader(env=process.env){
  const provider=env.SENTENCE_GAME_GRADER||((env.PET_STORAGE==='supabase'||env.SENTENCE_GAME_STORAGE==='supabase'||env.NODE_ENV==='production')?'codex-worker':'codex');
  if(provider==='codex-worker')return new SentenceGradeQueue({env});
  if(provider==='codex')return new (require('./codex-grader').CodexGrader)({env});
  throw unavailable('採点先は codex または codex-worker を設定してください。');
}
module.exports={GradeCloudStore,SentenceGradeQueue,createSentenceGrader,idFor};
