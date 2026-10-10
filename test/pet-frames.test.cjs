const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),rules=require('../public/pet-rules');
function setup(reduced=false,state='idle'){
  let now=0,tick,image;const tile={dataset:{},style:{},setAttribute(){},remove(){this.removed=true;}},fallback={style:{}},classes=new Set();
  const visual={querySelector:()=>fallback,appendChild(){},classList:{add:v=>classes.add(v),remove:v=>classes.delete(v)}};
  const context={window:{PetRules:rules},document:{createElement:()=>tile},Image:class{constructor(){image=this;this.naturalWidth=1024;this.naturalHeight=1792;}},matchMedia:()=>({matches:reduced}),performance:{now:()=>now},setTimeout:fn=>{tick=fn;return 1;},clearTimeout:()=>{tick=null;}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public/pet-frames.js'),'utf8'),context);
  const motion={url:'/pet-images/frames-fire-v1.png',columns:4,rows:7,frameCount:28};
  const player=context.window.PetFrames.create(visual,motion,state);image.onload();
  return {player,tile,image,fallback,advance(ms){now=ms;const callback=tick;tick=null;callback?.();},get hasTimer(){return !!tick;},create:context.window.PetFrames.create,visual};
}
test('idle shows every intended frame, care changes actual frames and returns to idle',()=>{
  const s=setup();const seen=new Set([s.tile.dataset.frame]);for(let at=360;at<1400;at+=360){s.advance(at);seen.add(s.tile.dataset.frame);}assert.deepEqual([...seen],['0','1','2','3']);
  s.player.play('food',3600);assert.equal(s.tile.dataset.frame,'4');s.advance(1500);assert.equal(s.tile.dataset.frame,'5');s.advance(2200);assert.ok(['6','7'].includes(s.tile.dataset.frame));s.advance(4500);assert.equal(s.tile.dataset.frame,'9');s.advance(4900);assert.ok(Number(s.tile.dataset.frame)<4);
});
test('hungry and weak use their own frames, and reduced motion stays neutral',()=>{
  const hungry=setup(false,'hungry');assert.equal(hungry.tile.dataset.frame,'22');hungry.advance(800);assert.equal(hungry.tile.dataset.frame,'23');
  const weak=setup(false,'weak');assert.equal(weak.tile.dataset.frame,'26');weak.advance(2300);assert.equal(weak.tile.dataset.frame,'27');
  const reduced=setup(true);reduced.advance(1000);assert.equal(reduced.tile.dataset.frame,'0');reduced.player.play('power',1800);assert.equal(reduced.tile.dataset.frame,'15');
});
test('leaving the room frees the sheet, background, callbacks and timer; untrusted URLs never load',()=>{
  const s=setup();assert.equal(s.player.ready,true);assert.equal(s.fallback.style.visibility,'hidden');s.player.stop();assert.equal(s.hasTimer,false);assert.equal(s.image.src,'');assert.equal(s.image.onload,null);assert.equal(s.tile.style.backgroundImage,'none');assert.equal(s.tile.removed,true);assert.equal(s.fallback.style.visibility,'');
  assert.equal(s.create(s.visual,{url:'https://unrelated.example/image.png',columns:4,rows:7,frameCount:28}),null);
});
