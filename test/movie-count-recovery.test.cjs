'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const api=require('../public/movie-study-progress');
const source=fs.readFileSync(require.resolve('../public/movie-count-recovery.js'),'utf8');
const device='12345678-1234-4234-8234-123456789abc',scene='train-invitation';
function server(){const records=new Map();return {records,loseReply:false,async fetch(url,options){
  const id=url.split('/')[3],merged=api.mergeLedger(records.get(id),JSON.parse(options.body));records.set(id,merged);
  if(this.loseReply){this.loseReply=false;throw Error('lost response');}
  return {ok:true,json:async()=>structuredClone(merged)};
}};}
function page(remote,{values=new Map(),cookie='',blocked=false}={}){
  const elements=Object.fromEntries(['restore','status','count','movie','saved','keep'].map(id=>[id,{hidden:['count','movie','keep'].includes(id),disabled:false,textContent:'',addEventListener(type,handler){this.click=handler;}}]));
  const storage={getItem:key=>values.get(key)||null,setItem(key,value){if(blocked)throw Error('storage blocked');values.set(key,value);}};
  const document={getElementById:id=>elements[id],get cookie(){return cookie;},set cookie(value){cookie=value.split(';')[0];}};
  vm.runInNewContext(source,{window:{MovieStudyProgress:api,crypto:{randomUUID:()=>device}},document,localStorage:storage,location:{protocol:'https:'},fetch:remote.fetch.bind(remote),AbortSignal,Date,Math,Error});
  return {elements,values,click:()=>elements.restore.click()};
}
test('reported five plays add to today once and keep the current learner identity',async()=>{
  const remote=server(),values=new Map([['phraseDeviceId',device],[api.key,JSON.stringify({[scene]:2})]]),first=page(remote,{values});
  await first.click();assert.equal(api.ledgerCounts(remote.records.get(device))[scene],7);
  assert.equal(first.elements.count.textContent,'聞いた回数 7 / 50回');assert.equal(values.get('phraseDeviceId'),device);
  assert.equal(first.elements.saved.href,'/#saved-device='+device);assert.equal(first.elements.movie.hidden,false);
  const reload=page(remote,{values});await reload.click();assert.equal(api.ledgerCounts(remote.records.get(device))[scene],7);
});
test('a lost acknowledgment can be retried without adding the missing plays twice',async()=>{
  const remote=server();remote.loseReply=true;const current=page(remote);
  await current.click();assert.equal(current.elements.restore.disabled,false);assert.match(current.elements.status.textContent,/もう一度/);
  await current.click();assert.equal(api.ledgerCounts(remote.records.get(device))[scene],5);assert.equal(current.elements.restore.hidden,true);
});
test('cookie identity restores the server record when local identity storage is empty',async()=>{
  const remote=server();remote.records.set(device,{baseline:{[scene]:3},replicas:{}});
  const current=page(remote,{cookie:'other=value; phraseDeviceId='+device});await current.click();
  assert.equal(current.values.get('phraseDeviceId'),device);assert.equal(api.ledgerCounts(remote.records.get(device))[scene],8);
});
test('blocked local storage cannot create an unreachable server record',async()=>{
  const remote=server(),current=page(remote,{blocked:true});await current.click();
  assert.equal(remote.records.size,0);assert.equal(current.elements.restore.disabled,false);
});
