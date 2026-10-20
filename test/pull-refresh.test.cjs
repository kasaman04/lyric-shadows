const test = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs');
function setup({ fail = false, modal = false } = {}) {
  const listeners = {}, calls = [], label = {textContent:''}, icon = {style:{}}, strip = {dataset:{},style:{},classList:{add(){},remove(){}},querySelector:s=>s==='span'?label:icon};
  const app = {before(){}}, memory = new Map();
  const context = {document:{getElementById:()=>app,createElement:()=>strip,body:{classList:{contains:()=>modal}},querySelector:()=>null,addEventListener:(name,fn)=>listeners[name]=fn},
    window:{scrollY:0,PetGame:{prepareRefresh:async()=>calls.push('persist')}},location:{href:'https://example.test/?song=one',replace:url=>calls.push(url)},
    fetch:async()=>{calls.push('fetch');if(fail)throw Error('offline');return {ok:true,text:async()=>'<div id="app"></div>'};},
    URL,Date,AbortSignal,sessionStorage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},setTimeout:()=>1,clearTimeout(){}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../public/pull-refresh.js'),'utf8'),context);
  const target = {closest:()=>null};
  function touch(name,x,y) { listeners[name]({target,touches:name==='touchend'?[]:[{clientX:x,clientY:y}],cancelable:true,preventDefault(){calls.push('prevent');}}); }
  return {context,calls,strip,touch};
}
test('short pull, horizontal swipe, and modal gestures do not refresh', () => {
  for (const [dx,dy,modal] of [[0,50,false],[160,30,false],[0,200,true]]) {
    const s=setup({modal});s.touch('touchstart',10,10);s.touch('touchmove',10+dx,10+dy);s.touch('touchend');assert.equal(s.calls.includes('fetch'),false);assert.equal(s.strip.style.height,'0px');
  }
});
test('release past threshold persists playback before fetching and navigation', async () => {
  const s=setup();s.touch('touchstart',10,10);s.touch('touchmove',10,210);s.touch('touchend');
  await new Promise(setImmediate);
  assert.deepEqual(s.calls.slice(-3).map(v=>v.startsWith('https:')?'navigate':v), ['persist','fetch','navigate']);
  assert.match(s.calls.at(-1),/song=one&_refresh=/);
});
test('offline refresh keeps the page and shows an error', async () => {
  const s=setup({fail:true});await s.context.window.PullRefresh.refresh();
  assert.equal(s.strip.dataset.state,'error');assert.equal(s.calls.some(v=>v.startsWith('https:')),false);
});
