(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;else root.MovieStudyProgress=api;
})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const limit=100,key='movie-study-completions-v1';
  function createStore(storage){
    let counts={};
    function refresh(){
      try{
        const value=JSON.parse(storage.getItem(key)||'{}');
        if(value&&typeof value==='object'&&!Array.isArray(value))counts=Object.fromEntries(Object.entries(value).filter(([id,n])=>/^[a-z0-9-]+$/.test(id)&&Number.isInteger(n)&&n>=0).map(([id,n])=>[id,Math.min(limit,n)]));
      }catch{}
    }
    refresh();
    return {count:id=>counts[id]||0,hidden:id=>(counts[id]||0)>=limit,refresh,complete(id){
      refresh();counts[id]=Math.min(limit,(counts[id]||0)+1);
      let persisted=true;try{storage.setItem(key,JSON.stringify(counts));}catch{persisted=false;}
      return {count:counts[id],hidden:counts[id]>=limit,persisted};
    }};
  }
  // Each pass counts only playback actually traversed, not time skipped by seeking.
  function createPass(){
    let previous=null,ranges=[],finished=false;
    function sample(value){
      const p=previous;previous={...value};
      if(finished||!p||!p.playing||!p.active||!value.active||!p.audible||!value.audible||value.seeking||p.seeking)return;
      const delta=value.time-p.time,wall=(value.wall-p.wall)/1000;
      if(delta<=0||wall<0||delta>wall*Math.max(p.rate||1,value.rate||1)+0.5)return;
      const start=p.time,end=value.time;
      ranges.push([start,end]);ranges.sort((a,b)=>a[0]-b[0]);
      const merged=[];for(const [a,b]of ranges){if(merged.length&&a<=merged.at(-1)[1]+0.05)merged.at(-1)[1]=Math.max(b,merged.at(-1)[1]);else merged.push([a,b]);}ranges=merged;
    }
    return {sample,reset(){previous=null;ranges=[];finished=false;},finish(duration){
      if(finished)return false;finished=true;
      return Number.isFinite(duration)&&duration>0&&previous?.audible&&previous?.time>=duration-0.5&&ranges.reduce((n,[a,b])=>n+b-a,0)>=duration*0.95;
    }};
  }
  return {limit,key,createStore,createPass};
});
