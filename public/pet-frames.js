(() => {
  'use strict';
  const states=window.PetRules.frameStates;
  const safe=url=>/^\/pet-images\/frames-(fire|water|grass|thunder|ice|wind|earth|poison|light|dark)-v1\.png$/.test(url||'')||/^\/api\/pet-motion\/[a-f0-9-]{36}\/[a-f0-9]{64}\.png$/.test(url||'');
  // Generated sheets can drift away from a perfectly even grid. Split at the
  // transparent gaps so a neighbouring pose's feet never enter the next frame.
  function cuts(counts,parts) {
    const size=counts.length/parts,result=[0];
    for(let i=1;i<parts;i++) {
      const expected=i*size;
      let best=Math.round(expected),score=Infinity;
      for(let at=Math.max(1,Math.floor(expected-size*.22));at<=Math.min(counts.length-1,Math.ceil(expected+size*.22));at++) {
        const next=counts[at-1]+counts[at];
        if(next<score||next===score&&Math.abs(at-expected)<Math.abs(best-expected)){best=at;score=next;}
      }
      // A sheet without a safe gap cannot be cropped without cutting a limb.
      if(score!==0)throw new Error('Animation frames overlap');
      result.push(best);
    }
    result.push(counts.length);return result;
  }
  function frameBounds(pixels,width,height) {
    const rowCounts=new Uint32Array(height);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(pixels[(y*width+x)*4+3]>32)rowCounts[y]++;
    const ys=cuts(rowCounts,7),frames=[];
    for(let row=0;row<7;row++) {
      const columnCounts=new Uint32Array(width);
      for(let y=ys[row];y<ys[row+1];y++)for(let x=0;x<width;x++)if(pixels[(y*width+x)*4+3]>32)columnCounts[x]++;
      const xs=cuts(columnCounts,4);
      for(let column=0;column<4;column++)frames.push({x:xs[column],y:ys[row],width:xs[column+1]-xs[column],height:ys[row+1]-ys[row]});
    }
    return frames;
  }
  function create(visual,motion,state='idle') {
    if(!visual||!safe(motion?.url)||motion.columns!==4||motion.rows!==7||motion.frameCount!==28)return null;
    const tile=document.createElement('canvas'),context=tile.getContext('2d',{willReadFrequently:true});
    if(!context)return null;
    tile.className='pet-frame-player';tile.setAttribute('aria-hidden','true');
    const fallback=visual.querySelector('img');visual.appendChild(tile);
    const image=new Image(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer,active=true,ready=false,action=null,actionUntil=0,frames;
    const setFrame=index=>{
      const frame=frames[index],scale=Math.min(tile.width/frame.width,tile.height/frame.height),width=frame.width*scale,height=frame.height*scale;
      context.clearRect(0,0,tile.width,tile.height);
      context.drawImage(image,frame.x,frame.y,frame.width,frame.height,(tile.width-width)/2,tile.height-height,width,height);
      tile.dataset.frame=String(index);
    };
    function loop() {
      if(!active||!ready)return;
      const at=performance.now();
      if(action&&at>=actionUntil)action=null;
      const key=action?.type||state, frames=states[key]||states.idle;
      let index=0,wait=700;
      if(action){const progress=Math.min(1,(at-action.start)/(actionUntil-action.start));index=reduced?frames.length-1:action.type==='food'?(progress<.22?Math.floor(progress/.11):progress<.72?2+Math.floor((progress-.22)/.07)%2:progress<.87?4:5):Math.min(frames.length-1,Math.floor(progress*frames.length));wait=70;}
      else if(!reduced){const cycle=key==='idle'?5200:key==='weak'?4000:2800;const phase=at%cycle;index=key==='idle'?(phase>1400?0:Math.min(3,Math.floor(phase/350))):Math.floor(phase/(cycle/frames.length))%frames.length;wait=180;}
      setFrame(frames[index]);timer=setTimeout(loop,wait);
    }
    image.onload=()=>{
      if(!active)return;
      try {
        tile.width=image.naturalWidth;tile.height=image.naturalHeight;
        context.drawImage(image,0,0);
        frames=motion.url.startsWith('/api/')
          ?frameBounds(context.getImageData(0,0,tile.width,tile.height).data,tile.width,tile.height)
          :Array.from({length:28},(_,index)=>({x:index%4*tile.width/4,y:Math.floor(index/4)*tile.height/7,width:tile.width/4,height:tile.height/7}));
        tile.width=Math.ceil(image.naturalWidth/4);tile.height=Math.ceil(image.naturalHeight/7);
        ready=true;loop();visual.classList.add('pet-has-frames');if(fallback)fallback.style.visibility='hidden';
      }catch{stop();}
    };
    image.onerror=()=>{if(active)stop();};image.src=motion.url;
    function stop(){active=false;ready=false;clearTimeout(timer);image.onload=image.onerror=null;image.src='';frames=null;tile.width=tile.height=0;tile.remove();visual.classList.remove('pet-has-frames');if(fallback)fallback.style.visibility='';}
    return {stop,play(type,duration){if(!states[type])return;action={type,start:performance.now()};actionUntil=action.start+duration;clearTimeout(timer);loop();},get ready(){return ready;}};
  }
  window.PetFrames={create};
})();
