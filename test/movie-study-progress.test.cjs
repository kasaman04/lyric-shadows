'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createStore,createPass,key}=require('../public/movie-study-progress');
const {createCloudStore,mergeLedger,ledgerCounts}=require('../public/movie-study-progress');
function storage(){const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};}
function sample(pass,time,options={}){pass.sample({time,wall:time*1000,playing:true,audible:true,active:true,seeking:false,rate:1,...options});}

test('49 completed plays remain visible; the 50th is hidden and persists across reloads',()=>{
  const data=storage(),first=createStore(data);
  for(let n=0;n<49;n++)first.complete('eternal-train');
  assert.equal(first.count('eternal-train'),49);assert.equal(first.hidden('eternal-train'),false);
  const reload=createStore(data);assert.equal(reload.count('eternal-train'),49);
  const last=reload.complete('eternal-train');assert.equal(last.count,50);assert.equal(last.hidden,true);
  assert.equal(createStore(data).hidden('eternal-train'),true);assert.equal(reload.complete('eternal-train').count,50);
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

test('a corrupted primary ledger restores the same plays from the backup without adding them twice',async()=>{
  const data=storage(),server=cloud(),first=client(data,server);
  first.complete('eternal-train');await first.sync();
  data.setItem(`${key}:cloud:movie-test-device-001`,'broken');
  const recovered=client(data,server,'movie-test-writer-0002');
  assert.equal(recovered.count('eternal-train'),1);await recovered.sync();
  assert.equal(server.counts()['eternal-train'],1);
});

test('an owned surviving mirror stays visible offline and is reconciled as a floor on recovery',async()=>{
  const data=storage(),server=cloud();data.setItem(key,'{"eternal-train":7}');data.setItem(key+':owner','movie-test-device-001');
  server.online=false;
  const first=client(data,server);assert.equal(first.count('eternal-train'),7);
  first.complete('eternal-train');assert.equal(first.count('eternal-train'),8);assert.equal(await first.sync(),false);
  const recovered=client(data,server,'movie-test-writer-0002');assert.equal(recovered.count('eternal-train'),8);
  server.online=true;await recovered.sync();await recovered.sync();assert.equal(server.counts()['eternal-train'],8);
});

test('the mirror of a confirmed cloud total is not imported as a second baseline',async()=>{
  const data=storage(),server=cloud();
  await server.request({replicas:{'old-movie-writer-0001':{'eternal-train':7}}});
  data.setItem(key,'{"eternal-train":7}');data.setItem(key+':owner','movie-test-device-001');
  const recovered=client(data,server);await recovered.sync();
  assert.equal(recovered.count('eternal-train'),7);assert.equal(server.counts()['eternal-train'],7);
});

test('unconfirmed empty history has loading/error states and retries restore the confirmed count',async()=>{
  const data=storage(),server=cloud();await server.request({baseline:{'eternal-train':7}});server.online=false;
  const recovered=client(data,server);assert.deepEqual(recovered.status(),{phase:'pending',confirmed:false});
  assert.equal(await recovered.sync(),false);assert.deepEqual(recovered.status(),{phase:'error',confirmed:false});
  server.online=true;await recovered.sync();assert.deepEqual(recovered.status(),{phase:'ready',confirmed:true});
  assert.equal(recovered.count('eternal-train'),7);
});

test('the lower Real target preserves saved totals and leaves the movie target at 50',async()=>{
  const data=storage();data.setItem(key,JSON.stringify({'eternal-train':75,'eternal-bike':20,'real-random-11':100,'real-random-12':24,'real-street-01':19}));
  const local=createStore(data);
  assert.equal(local.count('eternal-train'),75);assert.equal(local.hidden('eternal-train'),true);
  assert.equal(local.complete('eternal-train').count,75);
  assert.equal(local.hidden('eternal-bike'),false);
  assert.equal(local.hidden('real-random-12'),true);
  assert.equal(local.complete('real-random-11').count,100);
  assert.equal(local.hidden('real-street-01'),false);
  assert.equal(local.complete('real-street-01').count,20);
  assert.equal(local.hidden('real-street-01'),true);
  const server=cloud();const first=client(data,server);await first.sync();
  assert.equal(first.count('eternal-train'),75);assert.equal(first.count('real-random-11'),100);
  const restored=client(storage(),server,'movie-test-writer-0020');await restored.sync();
  assert.equal(restored.count('eternal-train'),75);assert.equal(restored.hidden('eternal-bike'),false);
  assert.equal(restored.hidden('real-random-11'),true);assert.equal(restored.count('real-random-12'),24);
  assert.equal(restored.count('real-street-01'),20);assert.equal(restored.hidden('real-street-01'),true);
});

test('the 20th real conversation play persists after offline recovery without duplicate credit',async()=>{
  const data=storage(),server=cloud();data.setItem(key,JSON.stringify({'real-daily-01':19}));
  server.online=false;const first=client(data,server);
  assert.equal(first.hidden('real-daily-01'),false);
  assert.equal(first.complete('real-daily-01').count,20);assert.equal(first.hidden('real-daily-01'),true);
  const recovered=client(data,server,'movie-test-writer-0021');server.online=true;
  await recovered.sync();await first.sync();
  assert.equal(recovered.count('real-daily-01'),20);assert.equal(server.counts()['real-daily-01'],20);
});

test('a Real date is hidden at 20 completed plays in local and synced progress',async()=>{
  const id='real-date-01',data=storage(),server=cloud();
  data.setItem(key,JSON.stringify({[id]:19}));
  const local=createStore(data);
  assert.equal(local.hidden(id),false);
  assert.deepEqual(local.complete(id),{count:20,hidden:true,persisted:true});
  const first=client(data,server);await first.sync();
  assert.equal(first.hidden(id),true);
  const restored=client(storage(),server,'movie-test-writer-0022');await restored.sync();
  assert.equal(restored.count(id),20);assert.equal(restored.hidden(id),true);
});
