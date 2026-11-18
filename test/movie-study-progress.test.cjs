'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createStore,createPass,key}=require('../public/movie-study-progress');
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
