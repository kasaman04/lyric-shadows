'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync(require.resolve('../public/pet-playback'),'utf8');
function client(storage=new Map(),id='tab-a'){
  let time=0;const events=[],timers=[];
  class Media extends EventTarget {
    constructor(){super();Object.assign(this,{currentTime:0,playbackRate:1,currentSrc:'http://localhost/movie-study/media/test.mp4',paused:true,ended:false,readyState:4,seeking:false,muted:false,volume:1,isConnected:true});}
    emit(type){this.dispatchEvent(new Event(type));}
    play(){this.paused=false;this.emit('play');this.emit('playing');}
    pause(){this.paused=true;this.emit('pause');}
  }
  const window=new EventTarget(),document=new EventTarget();
  const context={window,document,HTMLMediaElement:Media,crypto:{randomUUID:()=>id},performance:{now:()=>time},Date:{now:()=>1795226400000+time},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setInterval:fn=>timers.push(fn)};
  vm.runInNewContext(code,context);
  const api=window.PetPlayback;api.configure({deviceId:'movie-device-test',petId:()=>null,onCredit:e=>events.push(e)});
  const media=new Media();api.watch(media);
  return {api,media,events,advance(seconds){time+=seconds*1000;media.currentTime+=seconds*media.playbackRate;media.emit('timeupdate');timers.forEach(fn=>fn());},seconds:()=>events.reduce((sum,e)=>sum+(e.end-e.start)/1000,0)};
}
test('explicit movie registration counts audible playback once, including the tail before repeat',()=>{
  const c=client();c.api.watch(c.media);c.media.play();c.advance(2);
  c.media.addEventListener('ended',()=>{c.media.currentTime=0;});
  c.media.ended=true;c.media.emit('ended');assert.equal(c.seconds(),2);
  c.media.ended=false;c.media.play();c.advance(1);assert.equal(c.seconds(),3);
  c.media.pause();c.advance(5);assert.equal(c.seconds(),3);
});
test('paused, muted and buffering movie tabs yield ownership immediately',()=>{
  for(const type of ['pause','volumechange','waiting']){
    const shared=new Map(),a=client(shared,'tab-a'),b=client(shared,'tab-b');
    a.media.play();a.advance(1);assert.equal(a.seconds(),1);
    if(type==='pause')a.media.paused=true;
    if(type==='volumechange')a.media.muted=true;
    a.media.emit(type);b.media.play();b.advance(1);
    assert.equal(b.seconds(),1,`${type} must not block the next tab for 15 seconds`);
  }
});
test('simultaneous movie tabs share one lease; seeking and muted playback earn no time',()=>{
  const shared=new Map(),a=client(shared,'tab-a'),b=client(shared,'tab-b');
  a.media.play();b.media.play();a.advance(1);b.advance(1);assert.equal(a.seconds()+b.seconds(),1);
  a.media.seeking=true;a.media.emit('seeking');a.advance(20);assert.equal(a.seconds(),1);
  a.media.seeking=false;a.media.emit('seeked');a.media.muted=true;a.media.emit('volumechange');a.advance(2);assert.equal(a.seconds(),1);
});
