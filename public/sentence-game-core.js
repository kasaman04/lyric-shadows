(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SentenceGameCore=api;})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  class TurnGate {
    constructor(start,{onset=5000,silence=1600,max=45000}={}){this.start=start;this.onset=onset;this.silence=silence;this.max=max;this.spoken=false;this.lastVoice=null;this.finished=false;}
    sample(now,voice){
      if(this.finished)return null;
      if(!this.spoken&&now-this.start>=this.onset){this.finished=true;return 'no_answer';}
      if(voice){this.spoken=true;this.lastVoice=now;}
      if((this.spoken&&now-this.lastVoice>=this.silence)||now-this.start>=this.max){this.finished=true;return 'answer';}
      return null;
    }
    remaining(now){return this.spoken?null:Math.max(0,Math.ceil((this.onset-(now-this.start))/1000));}
    cancel(){this.finished=true;}
  }
  const historyKey='lyric-shadows-sentence-history-v1';
  function readHistory(storage){try{const list=JSON.parse(storage.getItem(historyKey));return Array.isArray(list)?[...new Set(list.filter(x=>typeof x==='string'&&x.length<80))].slice(-2000):[];}catch{return [];}}
  function writeHistory(storage,list){try{storage.setItem(historyKey,JSON.stringify(list));}catch{}}
  return {TurnGate,readHistory,writeHistory};
});
