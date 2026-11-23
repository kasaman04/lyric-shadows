(() => {
  'use strict';
  const scene='train-invitation',recovery='recovery-20261119-train-invitation';
  const api=window.MovieStudyProgress,button=document.getElementById('restore'),status=document.getElementById('status');
  const valid=id=>/^[a-z0-9-]{12,80}$/i.test(id||'');
  function storedId(){
    try{const id=localStorage.getItem('phraseDeviceId');if(valid(id))return id;}catch{}
    try{const entry=document.cookie.split(';').map(value=>value.trim()).find(value=>value.startsWith('phraseDeviceId='));const id=decodeURIComponent(entry?.slice(15)||'');if(valid(id))return id;}catch{}
    return '';
  }
  button.addEventListener('click',async()=>{
    if(button.disabled)return;
    button.disabled=true;status.textContent='昨日の回数を保存しています…';
    // Keep an unacknowledged attempt on the same identity, including after a reload.
    let id=storedId()||window.crypto?.randomUUID?.()||`movie-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    try{
      try{
        localStorage.setItem('phraseDeviceId',id);
        document.cookie=`phraseDeviceId=${encodeURIComponent(id)}; max-age=31536000; path=/; samesite=lax${location.protocol==='https:'?'; secure':''}`;
        if(localStorage.getItem('phraseDeviceId')!==id)throw Error('storage blocked');
      }catch{throw Error('このブラウザに記録を保存できません。通常のSafariタブで開いてください。');}
      const progress=api.createCloudStore(localStorage,id,{
        writerId:window.crypto?.randomUUID?.()||`movie-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        async request(ledger){
          // One fixed component adds the reported five plays exactly once.
          const body=api.mergeLedger(ledger,{replicas:{[recovery]:{[scene]:5}}});
          const response=await fetch(`/api/pet/${encodeURIComponent(id)}/movies`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(15000)});
          if(!response.ok)throw Error('sync failed');
          return response.json();
        }
      });
      if(!await progress.sync())throw Error('通信を確認して、もう一度お試しください。同じ5回分が重複することはありません。');
      status.textContent='昨日の5回分を反映しました。';
      const count=document.getElementById('count');count.textContent=`聞いた回数 ${progress.count(scene)} / ${api.limit}回`;count.hidden=false;
      document.getElementById('movie').hidden=false;
      const saved=document.getElementById('saved');saved.href='/#saved-device='+encodeURIComponent(id);
      document.getElementById('keep').hidden=false;
      button.hidden=true;
    }catch(error){status.textContent=error.message;button.disabled=false;}
  });
})();
