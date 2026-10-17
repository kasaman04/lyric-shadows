const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),rules=require('../public/pet-rules');
function sheet(drift=false){
  const width=80,height=140,data=new Uint8ClampedArray(width*height*4),bounds=[];
  for(let row=0;row<7;row++)for(let column=0;column<4;column++){
    const x=column*20+3,y=row*20+3+(drift&&row>0?4:0),bottom=y+15;
    bounds.push({x,y,right:x+14,bottom});
    for(let py=y;py<Math.min(bottom,height);py++)for(let px=x;px<x+14;px++)data[(py*width+px)*4+3]=255;
  }
  return {width,height,data,bounds};
}
function setup(reduced=false,state='idle',fixture=sheet()){
  const draws=[],paint={drawImage(...args){draws.push(args);},clearRect(){},getImageData(){return {data:fixture.data};}};
  let now=0,tick,image;const tile={dataset:{},style:{},getContext:()=>paint,setAttribute(){},remove(){this.removed=true;}},fallback={style:{}},classes=new Set();
  const visual={querySelector:()=>fallback,appendChild(){},classList:{add:v=>classes.add(v),remove:v=>classes.delete(v)}};
  const context={window:{PetRules:rules},document:{createElement:()=>tile},Image:class{constructor(){image=this;this.naturalWidth=fixture.width;this.naturalHeight=fixture.height;}},matchMedia:()=>({matches:reduced}),performance:{now:()=>now},setTimeout:fn=>{tick=fn;return 1;},clearTimeout:()=>{tick=null;}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public/pet-frames.js'),'utf8'),context);
  const motion={url:'/api/pet-motion/23c87179-c3cf-4f8d-baa9-1cc54e618861/507452dcd0c831f5ff6097f9e6a90608ec51de0f286fe1808ebcb81651c362a8.png',columns:4,rows:7,frameCount:28};
  const player=context.window.PetFrames.create(visual,motion,state);image.onload();
  return {player,tile,image,fallback,draws,classes,advance(ms){now=ms;const callback=tick;tick=null;callback?.();},get hasTimer(){return !!tick;},create:context.window.PetFrames.create,visual};
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
  const s=setup();assert.equal(s.player.ready,true);assert.equal(s.fallback.style.visibility,'hidden');s.player.stop();assert.equal(s.player.ready,false);assert.equal(s.hasTimer,false);assert.equal(s.image.src,'');assert.equal(s.image.onload,null);assert.equal(s.tile.width,0);assert.equal(s.tile.height,0);assert.equal(s.tile.removed,true);assert.equal(s.fallback.style.visibility,'');
  assert.equal(s.create(s.visual,{url:'https://unrelated.example/image.png',columns:4,rows:7,frameCount:28}),null);
});
test('drifting sheet rows exclude the previous pose and preserve the whole current pose without stretching',()=>{
  const fixture=sheet(true),s=setup(false,'weak',fixture);
  assert.equal(s.player.ready,true);
  for(const at of [0,2300]){
    s.advance(at);
    const index=Number(s.tile.dataset.frame),[image,x,y,width,height,dx,dy,dw,dh]=s.draws.at(-1),bounds=fixture.bounds[index];
    assert.equal(image,s.image);assert.ok(x<=bounds.x&&x+width>=bounds.right);
    assert.ok(y<=bounds.y&&y+height>=Math.min(bounds.bottom,fixture.height));
    assert.ok(y>=fixture.bounds[index-4].bottom,'previous row feet must be outside crop');
    assert.ok(Math.abs(dw/dh-width/height)<1e-10,'preserve source proportions');
    assert.ok(dx>=0&&dy>=0&&dx+dw<=s.tile.width&&dy+dh<=s.tile.height);
  }
});
test('unseparable or unreadable sheets keep the intact portrait visible and release the animation',()=>{
  const fixture=sheet();for(let i=3;i<fixture.data.length;i+=4)fixture.data[i]=255;
  const s=setup(false,'idle',fixture);
  assert.equal(s.player.ready,false);assert.equal(s.tile.removed,true);assert.equal(s.hasTimer,false);assert.equal(s.fallback.style.visibility,'');assert.equal(s.classes.has('pet-has-frames'),false);
  const failed=sheet();Object.defineProperty(failed,'data',{get(){throw Error('Canvas read failed');}});
  assert.equal(setup(false,'idle',failed).player.ready,false);
});
