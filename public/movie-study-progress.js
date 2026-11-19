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
        if(value&&typeof value==='object'&&!Array.isArray(value))for(const [id,n]of Object.entries(value))if(/^[a-z0-9-]+$/.test(id)&&Number.isInteger(n)&&n>=0)counts[id]=Math.max(counts[id]||0,Math.min(limit,n));
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
  // Grow-only components make retries and simultaneous tabs safe. Legacy plays
  // form a shared floor; each page contributes only its own new completions.
  function cleanCounts(value){
    const out={};
    if(value&&typeof value==='object'&&!Array.isArray(value))for(const [id,n]of Object.entries(value))if(/^[a-z0-9-]{1,80}$/.test(id)&&Number.isInteger(n)&&n>0)out[id]=Math.min(limit,n);
    return out;
  }
  function mergeLedger(a={},b={}){
    const baseline=cleanCounts(a.baseline),replicas={};
    for(const [id,n]of Object.entries(cleanCounts(b.baseline)))baseline[id]=Math.max(baseline[id]||0,n);
    for(const source of [a.replicas,b.replicas])if(source&&typeof source==='object'&&!Array.isArray(source))for(const [writer,values]of Object.entries(source)){
      if(!/^[a-z0-9-]{12,80}$/i.test(writer))continue;
      const counts=replicas[writer]||={};
      for(const [id,n]of Object.entries(cleanCounts(values)))counts[id]=Math.max(counts[id]||0,n);
    }
    return {baseline,replicas};
  }
  function ledgerCounts(ledger){
    const counts=cleanCounts(ledger.baseline);
    for(const values of Object.values(ledger.replicas||{}))for(const [id,n]of Object.entries(cleanCounts(values)))counts[id]=Math.min(limit,(counts[id]||0)+n);
    return counts;
  }
  function createCloudStore(storage,deviceId,{writerId,request,onChange=()=>{}}){
    const ledgerKey=key+':cloud:'+deviceId,ownerKey=key+':owner';
    let ledger={baseline:{},replicas:{}},running=null,dirty=false;
    function read(k){try{return JSON.parse(storage.getItem(k)||'null');}catch{return null;}}
    function refresh(){ledger=mergeLedger(ledger,read(ledgerKey)||{});}
    refresh();
    if(!storageOwner()&&!read(ledgerKey))ledger.baseline=cleanCounts(read(key));
    function storageOwner(){try{return storage.getItem(ownerKey);}catch{return null;}}
    function persist(){
      try{storage.setItem(ledgerKey,JSON.stringify(ledger));storage.setItem(ownerKey,deviceId);storage.setItem(key,JSON.stringify(ledgerCounts(ledger)));return true;}catch{return false;}
    }
    persist();
    async function sync(){
      dirty=true;
      if(running)return running;
      running=(async()=>{
        try{
          while(dirty){
            dirty=false;refresh();
            const remote=await request(JSON.parse(JSON.stringify(ledger)));
            if(!remote||!remote.baseline||!remote.replicas)throw Error('Invalid movie progress');
            refresh();ledger=mergeLedger(ledger,remote);persist();onChange();
          }
          return true;
        }catch{return false;}finally{running=null;}
      })();
      return running;
    }
    return {refresh,sync,count:id=>ledgerCounts(ledger)[id]||0,hidden:id=>(ledgerCounts(ledger)[id]||0)>=limit,complete(id){
      if(!/^[a-z0-9-]{1,80}$/.test(id))throw Error('Invalid scene');
      refresh();
      if((ledgerCounts(ledger)[id]||0)<limit){const own=ledger.replicas[writerId]||={};own[id]=(own[id]||0)+1;}
      const persisted=persist(),count=ledgerCounts(ledger)[id]||0;
      void sync();
      return {count,hidden:count>=limit,persisted};
    }};
  }
  return {limit,key,createStore,createPass,cleanCounts,mergeLedger,ledgerCounts,createCloudStore};
});
