(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;else root.MovieStudyProgress=api;
})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  // Preserve legacy totals up to 100; the completion target is now 50.
  const limit=50,maxCount=100,key='movie-study-completions-v1';
  function createStore(storage){
    let counts={};
    function refresh(){
      try{
        const value=JSON.parse(storage.getItem(key)||'{}');
        if(value&&typeof value==='object'&&!Array.isArray(value))for(const [id,n]of Object.entries(value))if(/^[a-z0-9-]+$/.test(id)&&Number.isInteger(n)&&n>=0)counts[id]=Math.max(counts[id]||0,Math.min(maxCount,n));
      }catch{}
    }
    refresh();
    return {count:id=>counts[id]||0,hidden:id=>(counts[id]||0)>=limit,refresh,complete(id){
      refresh();if((counts[id]||0)<limit)counts[id]=(counts[id]||0)+1;
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
    if(value&&typeof value==='object'&&!Array.isArray(value))for(const [id,n]of Object.entries(value))if(/^[a-z0-9-]{1,80}$/.test(id)&&Number.isInteger(n)&&n>0)out[id]=Math.min(maxCount,n);
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
    for(const values of Object.values(ledger.replicas||{}))for(const [id,n]of Object.entries(cleanCounts(values)))counts[id]=Math.min(maxCount,(counts[id]||0)+n);
    return counts;
  }
  function createCloudStore(storage,deviceId,{writerId,request,onChange=()=>{}}){
    const ledgerKey=key+':cloud:'+deviceId,backupKey=ledgerKey+':backup',ownerKey=key+':owner';
    let ledger={baseline:{},replicas:{}},running=null,dirty=false,phase='pending',confirmed=false;
    function read(k){try{return JSON.parse(storage.getItem(k)||'null');}catch{return null;}}
    function refresh(){ledger=mergeLedger(mergeLedger(ledger,read(ledgerKey)||{}),read(backupKey)||{});}
    refresh();
    const savedLedger=read(ledgerKey)||read(backupKey);
    let recoveryFloor=mergeLedger({baseline:read(ledgerKey)?.recoveryFloor},{baseline:read(backupKey)?.recoveryFloor}).baseline;
    if(storageOwner()===deviceId&&!savedLedger)recoveryFloor=cleanCounts(read(key));
    const floorWriterStart={...ledger.replicas[writerId]};
    if(!storageOwner()&&!savedLedger)ledger.baseline=cleanCounts(read(key));
    function storageOwner(){try{return storage.getItem(ownerKey);}catch{return null;}}
    function counts(){
      const value=ledgerCounts(ledger);
      for(const [id,n]of Object.entries(recoveryFloor))value[id]=Math.min(maxCount,Math.max(value[id]||0,n+Math.max(0,(ledger.replicas[writerId]?.[id]||0)-(floorWriterStart[id]||0))));
      return value;
    }
    function persist(){
      let saved=false;
      const snapshot=Object.keys(recoveryFloor).length?{...ledger,recoveryFloor:counts()}:ledger;
      for(const name of [ledgerKey,backupKey])try{storage.setItem(name,JSON.stringify(snapshot));saved=true;}catch{}
      try{storage.setItem(ownerKey,deviceId);storage.setItem(key,JSON.stringify(counts()));}catch{}
      return saved;
    }
    persist();
    async function sync(){
      dirty=true;
      if(running)return running;
      phase='syncing';onChange();
      running=(async()=>{
        try{
          while(dirty){
            dirty=false;refresh();
            const remote=await request(JSON.parse(JSON.stringify(ledger)));
            if(!remote||!remote.baseline||!remote.replicas)throw Error('Invalid movie progress');
            refresh();ledger=mergeLedger(ledger,remote);
            // A surviving count mirror is a floor, not an extra set of plays.
            const recovered=counts(),merged=ledgerCounts(ledger);
            for(const [id,n]of Object.entries(recovered))if(n>(merged[id]||0)){ledger.baseline[id]=(ledger.baseline[id]||0)+n-(merged[id]||0);dirty=true;}
            recoveryFloor={};confirmed=true;persist();onChange();
          }
          return true;
        }catch{phase='error';return false;}finally{if(phase!=='error')phase='ready';running=null;onChange();}
      })();
      return running;
    }
    return {refresh,sync,status:()=>({phase,confirmed}),count:id=>counts()[id]||0,hidden:id=>(counts()[id]||0)>=limit,complete(id){
      if(!/^[a-z0-9-]{1,80}$/.test(id))throw Error('Invalid scene');
      refresh();
      if((counts()[id]||0)<limit){const own=ledger.replicas[writerId]||={};own[id]=(own[id]||0)+1;}
      const persisted=persist(),count=counts()[id]||0;
      void sync();
      return {count,hidden:count>=limit,persisted};
    }};
  }
  return {limit,key,createStore,createPass,cleanCounts,mergeLedger,ledgerCounts,createCloudStore};
});
