'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createStore,createPass,key}=require('../public/movie-study-progress');
const {createCloudStore,mergeLedger,ledgerCounts}=require('../public/movie-study-progress');
function storage(){const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};}
function sample(pass,time,options={}){pass.sample({time,wall:time*1000,playing:true,audible:true,active:true,seeking:false,rate:1,...options});}

test('99 completed plays remain visible; the 100th is hidden and persists across reloads',()=>{
  const data=storage(),first=createStore(data);
  for(let n=0;n<99;n++)first.complete('eternal-train');
  assert.equal(first.count('eternal-train'),99);assert.equal(first.hidden('eternal-train'),false);
  const reload=createStore(data);assert.equal(reload.count('eternal-train'),99);
  const last=reload.complete('eternal-train');assert.equal(last.count,100);assert.equal(last.hidden,true);
  assert.equal(createStore(data).hidden('eternal-train'),true);assert.equal(reload.complete('eternal-train').count,100);
  assert.equal(reload.count('eternal-wait'),0);
});
test('a complete pass counts once and repeat starts a new independent pass',()=>{
  const pass=createPass();for(let t=0;t<=100;t++)sample(pass,t);
  assert.equal(pass.finish(100),true);assert.equal(pass.finish(100),false);
  pass.reset();for(let t=0;t<=100;t++)sample(pass,t);assert.equal(pass.finish(100),true);
});
test('skipping to the ending, pausing or watching only a fragment cannot count a full play',()=>{
  const seek=createPass();sample(seek,0);sample(seek,99,{wall:1000,seeking:true});sample(seek,100,{wall:2000});assert.equal(seek.finish(100),false);
  const pause=createPass();sample(pause,0,{playing:false});sample(pause,100,{playing:false});assert.equal(pause.finish(100),false);
  const hidden=createPass();for(let t=0;t<=100;t++)sample(hidden,t,{active:false});assert.equal(hidden.finish(100),false);
  const muted=createPass();for(let t=0;t<=100;t++)sample(muted,t,{audible:false});assert.equal(muted.finish(100),false);
  const partial=createPass();for(let t=50;t<=100;t++)sample(partial,t);assert.equal(partial.finish(100),false);
});
test('slow playback and normal pauses count coverage without rewarding repeated fragments',()=>{
  const pass=createPass();for(let t=0;t<=40;t++)sample(pass,t,{wall:t*2000,rate:0.5});
  sample(pass,40,{wall:80000,playing:false,rate:0.5});sample(pass,40,{wall:100000,rate:0.5});
  for(let t=41;t<=100;t++)sample(pass,t,{wall:100000+(t-40)*2000,rate:0.5});assert.equal(pass.finish(100),true);
  const fragment=createPass();for(let i=0;i<10;i++)for(let t=0;t<=10;t++)sample(fragment,t,{wall:(i*11+t)*1000});assert.equal(fragment.finish(100),false);
});
test('malformed saved values and unavailable storage do not break movie playback',()=>{
  const data=storage();data.setItem(key,'{"a":-1,"b":null,"c":10000,"d":"100"}');const saved=createStore(data);
  assert.equal(saved.count('a'),0);assert.equal(saved.count('d'),0);assert.equal(saved.count('c'),100);
  const blocked=createStore({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}});
  assert.equal(blocked.complete('eternal-wait').persisted,false);assert.equal(blocked.count('eternal-wait'),1);
});

test('missing, stale and damaged storage cannot lower an already loaded count',()=>{
  const data=storage();data.setItem(key,'{"eternal-train":12}');const saved=createStore(data);
  for(const value of ['{}','{"eternal-train":2}','broken']){data.setItem(key,value);saved.refresh();assert.equal(saved.count('eternal-train'),12);}
  assert.equal(saved.complete('eternal-train').count,13);
});

function cloud(){let remote={baseline:{},replicas:{}},online=true;return {
  async request(value){if(!online)throw Error('offline');remote=mergeLedger(remote,value);return structuredClone(remote);},
  set online(value){online=value;},counts:()=>ledgerCounts(remote)
};}
function client(data,server,writerId='movie-test-writer-0001',deviceId='movie-test-device-001'){
  return createCloudStore(data,deviceId,{writerId,request:server.request});
}
test('legacy counts migrate once, survive a new day and restore in a fresh browser',async()=>{
  const data=storage(),server=cloud();data.setItem(key,'{"eternal-train":12}');
  const first=client(data,server);await first.sync();first.complete('eternal-train');await first.sync();
  const nextDay=client(data,server,'movie-test-writer-0002');await nextDay.sync();assert.equal(nextDay.count('eternal-train'),13);
  const fresh=client(storage(),server,'movie-test-writer-0003');await fresh.sync();assert.equal(fresh.count('eternal-train'),13);
  await nextDay.sync();await fresh.sync();assert.equal(server.counts()['eternal-train'],13);
});
test('offline completions survive closing the page and replay without duplicate credit',async()=>{
  const data=storage(),server=cloud();server.online=false;
  const first=client(data,server);first.complete('eternal-train');first.complete('eternal-train');assert.equal(await first.sync(),false);
  const reload=client(data,server,'movie-test-writer-0002');assert.equal(reload.count('eternal-train'),2);
  server.online=true;await reload.sync();await reload.sync();await first.sync();assert.equal(server.counts()['eternal-train'],2);
});
test('concurrent browsers add independent plays and late responses never roll progress back',async()=>{
  const server=cloud(),a=client(storage(),server,'movie-test-writer-0001'),b=client(storage(),server,'movie-test-writer-0002');
  a.complete('eternal-train');b.complete('eternal-train');b.complete('eternal-train');await Promise.all([a.sync(),b.sync()]);
  await a.sync();await b.sync();assert.equal(a.count('eternal-train'),3);assert.equal(b.count('eternal-train'),3);
  assert.equal(ledgerCounts(mergeLedger({baseline:{'eternal-train':8}},{baseline:{'eternal-train':2}}))['eternal-train'],8);
});
test('each recovered identity keeps its own movie history and 100 plays remain hidden',async()=>{
  const data=storage(),server=cloud();data.setItem(key,'{"eternal-train":99}');const first=client(data,server);
  first.complete('eternal-train');await first.sync();assert.equal(first.hidden('eternal-train'),true);
  const other=client(data,cloud(),'movie-test-writer-0002','other-movie-device-001');assert.equal(other.count('eternal-train'),0);
  const restored=client(data,server,'movie-test-writer-0003');await restored.sync();assert.equal(restored.hidden('eternal-train'),true);
});
