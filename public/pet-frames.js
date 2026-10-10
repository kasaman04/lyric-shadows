(() => {
  'use strict';
  const states=window.PetRules.frameStates;
  const safe=url=>/^\/pet-images\/frames-(fire|water|grass|thunder|ice|wind|earth|poison|light|dark)-v1\.png$/.test(url||'')||/^\/api\/pet-motion\/[a-f0-9-]{36}\/[a-f0-9]{64}\.png$/.test(url||'');
  function create(visual,motion,state='idle') {
    if(!visual||!safe(motion?.url)||motion.columns!==4||motion.rows!==7||motion.frameCount!==28)return null;
    const tile=document.createElement('span');tile.className='pet-frame-player';tile.setAttribute('aria-hidden','true');
    const fallback=visual.querySelector('img');visual.appendChild(tile);
    const image=new Image(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer,active=true,ready=false,action=null,actionUntil=0;
    const setFrame=index=>{tile.dataset.frame=String(index);tile.style.backgroundPosition=`${index%4/3*100}% ${Math.floor(index/4)/6*100}%`;};
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
    image.onload=()=>{if(!active)return;ready=true;tile.style.backgroundImage=`url("${motion.url}")`;tile.style.aspectRatio=String((image.naturalWidth/4)/(image.naturalHeight/7));visual.classList.add('pet-has-frames');if(fallback)fallback.style.visibility='hidden';loop();};
    image.onerror=()=>{if(active)stop();};image.src=motion.url;
    function stop(){active=false;clearTimeout(timer);image.onload=image.onerror=null;image.src='';tile.style.backgroundImage='none';tile.remove();visual.classList.remove('pet-has-frames');if(fallback)fallback.style.visibility='';}
    return {stop,play(type,duration){if(!states[type])return;action={type,start:performance.now()};actionUntil=action.start+duration;clearTimeout(timer);loop();},get ready(){return ready;}};
  }
  window.PetFrames={create};
})();
