'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {EventEmitter}=require('node:events'),{PassThrough}=require('node:stream');
const {CodexGrader}=require('../lib/codex-grader');
const {SentenceGradeQueue,createSentenceGrader,idFor}=require('../lib/sentence-grade-queue');
const {gradingTask}=require('../lib/sentence-grading-task');
const q=require('../lib/sentence-translation-bank').byId.get('translation-why-dialogue-04');
const task=gradingTask(q,"I explain why I'm late."),grade={verdict:'almost',feedback:'過去の話なので explained と was にします。',corrected:'I explained why I was late.'};

function rpc({account={type:'chatgpt'},status='completed',text=JSON.stringify(grade)}={}){
  const sent=[];let options,argv,child;
  const spawnProcess=(bin,args,opts)=>{
    options=opts;argv=args;child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();child.kill=()=>{child.killed=true;child.emit('exit',0);};
    const reply=value=>child.stdout.write(JSON.stringify(value)+'\n');
    child.stdin={writable:true,write(line){const m=JSON.parse(line);sent.push(m);if(!m.method)return;
      setImmediate(()=>{
        if(m.method==='initialize')reply({id:m.id,result:{}});
        if(m.method==='account/read')reply({id:m.id,result:{account}});
        if(m.method==='thread/start')reply({id:m.id,result:{thread:{id:'thread-test'}}});
        if(m.method==='thread/unsubscribe')reply({id:m.id,result:{}});
        if(m.method==='turn/start'){
          reply({id:m.id,result:{turn:{id:'turn-test'}}});
          reply({id:'tool-request',method:'item/commandExecution/requestApproval',params:{threadId:'thread-test'}});
          reply({method:'item/completed',params:{threadId:'thread-test',item:{type:'agentMessage',text}}});
          reply({method:'turn/completed',params:{threadId:'thread-test',turn:{id:'turn-test',status}}});
        }
      });
    }};return child;
  };
  const grader=new CodexGrader({spawnProcess,findExecutable:async()=> 'codex.exe',env:{OPENAI_API_KEY:'do-not-forward',CODEX_API_KEY:'do-not-forward',SUPABASE_SERVICE_ROLE_KEY:'do-not-forward',ELEVENLABS_API_KEY:'do-not-forward',SENTENCE_CODEX_WORKDIR:require('node:path').join(__dirname,'../tmp/test-grader-sandbox')},timeoutMs:1000});
  return {grader,sent,get options(){return options;},get argv(){return argv;},get child(){return child;}};
}
test('grades through app-server RPC using ChatGPT login, structured output and no tool approvals or API key',async()=>{
  const f=rpc();try{
    assert.deepEqual(await f.grader.grade(task),grade);
    assert(f.argv.includes('app-server'));assert(f.argv.includes('stdio://'));
    assert.equal(f.options.env.OPENAI_API_KEY,undefined);assert.equal(f.options.env.CODEX_API_KEY,undefined);
    assert.equal(f.options.env.SUPABASE_SERVICE_ROLE_KEY,undefined);assert.equal(f.options.env.ELEVENLABS_API_KEY,undefined);
    const start=f.sent.find(m=>m.method==='thread/start');assert.equal(start.params.ephemeral,true);assert.equal(start.params.approvalPolicy,'never');assert.equal(start.params.sandbox,'read-only');
    const turn=f.sent.find(m=>m.method==='turn/start');assert.deepEqual(turn.params.outputSchema,task.outputSchema);assert.equal(turn.params.input[0].text,JSON.stringify(task.input));
    assert(f.sent.find(m=>m.id==='tool-request').error);
    assert(!f.sent.some(m=>/exec|shell|image|audio/.test(m.method||'')));
  }finally{f.grader.close();}
  assert(f.child.killed);
});
test('API-key login, malformed JSON and interrupted grades fail visibly without a fallback',async()=>{
  for(const spec of [{account:{type:'apiKey'}},{text:'not a grade'},{status:'interrupted'}]){
    const f=rpc(spec);try{await assert.rejects(f.grader.grade(task));}finally{f.grader.close();}
  }
  assert.throws(()=>createSentenceGrader({SENTENCE_GAME_GRADER:'api'}),/codex/);
});

class MemoryStore{
  constructor(){this.values=new Map();this.configured=true;this.failUpload=false;}
  async get(name){return structuredClone(this.values.get(name)||null);}
  async put(name,value){if(this.failUpload&&name.startsWith('results/')){this.failUpload=false;throw Error('upload failed');}this.values.set(name,structuredClone(value));}
  async create(name,value){if(this.values.has(name))return false;await this.put(name,value);return true;}
  async pending(){return [...this.values.keys()].filter(k=>k.startsWith('pending/')).map(k=>k.slice(8,-5));}
  async remove(id){this.values.delete('pending/'+id+'.json');}
}
test('public grading queue passes a job to the PC app-server and persists reusable results without regrading',async()=>{
  const store=new MemoryStore();let now=100000,calls=0;
  const worker=new SentenceGradeQueue({store,clock:()=>now});
  const grader={async grade(received){calls++;assert.deepEqual(received,task);return grade;}};
  const client=new SentenceGradeQueue({store,clock:()=>now,wait:async ms=>{now+=ms;await worker.tick(grader);}});
  assert.equal(await client.available(),false);await worker.heartbeat();assert.equal(await client.available(),true);
  assert.deepEqual(await client.grade(task),grade);assert.equal(calls,1);assert.deepEqual(await client.grade(task),grade);assert.equal(calls,1);assert.equal((await store.pending()).length,0);
  now+=45001;assert.equal(await client.available(),false);
});
test('result upload retries reuse the completed grade; failure and manual retry cannot return a stale error',async()=>{
  const store=new MemoryStore();let now=1000,calls=0;
  const worker=new SentenceGradeQueue({store,clock:()=>now}),grader={async grade(){calls++;return grade;}};
  const id=idFor(task);await store.create('pending/'+id+'.json',{id,runId:'first',task,createdAt:now});store.failUpload=true;
  await assert.rejects(worker.tick(grader),/upload failed/);await worker.tick(grader);assert.equal(calls,1);
  store.values.delete('results/'+id+'.json');
  const client=new SentenceGradeQueue({store,clock:()=>now,wait:async ms=>{now+=ms;await worker.tick({async grade(){throw Error('Codex offline');}});}});
  await assert.rejects(client.grade(task),error=>error.status===503);
  client.wait=async ms=>{now+=ms;await worker.tick(grader);};assert.deepEqual(await client.grade(task),grade);
});
test('offline PC times out without creating a grade or treating the answer as wrong',async()=>{
  const store=new MemoryStore();let now=0;
  const client=new SentenceGradeQueue({store,clock:()=>now,timeoutMs:100,pollMs:20,wait:async ms=>{now+=ms;}});
  await assert.rejects(client.grade(task),error=>error.status===503&&/採点待ち/.test(error.message));
  assert.equal([...store.values.keys()].filter(k=>k.startsWith('results/')).length,0);
});
