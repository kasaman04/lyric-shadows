(() => {
  'use strict';
  const $=id=>document.getElementById(id),player=$('review-audio');
  const sounds=new Map();
  let items=[],selected=null,session=0,card=0,controller,audioController,audioEpoch=0,part='',revealed=false;
  let knownCount=0;
  const setCount=value=>{if(!Number.isFinite(value))return;knownCount=Math.max(knownCount,value);$('review-count').textContent='('+knownCount+')';$('review-count').hidden=knownCount===0;};
  function error(value){$('review-error').textContent=value?.message||String(value);$('review-error').hidden=false;}
  function clearError(){$('review-error').hidden=true;}
  async function api(path,body,signal=controller?.signal){const response=await fetch('/api/sentence-game/review'+path,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal,cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error||'復習ノートを読み込めませんでした。');return data;}
  function audioLabels(){$('review-question-audio').textContent='▷ 2文を聞く';$('review-answer-audio').textContent='▷ 答えの音声を聞く';$('review-question-audio').disabled=false;$('review-answer-audio').disabled=false;$('review-audio-status').textContent='';}
  function stopAudio(){audioEpoch++;audioController?.abort();part='';player.pause();player.removeAttribute('src');player.load();audioLabels();}
  function position(){const i=items.findIndex(x=>x.id===selected);$('review-position').textContent='問題 '+(i+1)+' / '+items.length;$('review-prev').disabled=i<=0;$('review-next').disabled=i<0||i>=items.length-1;}
  function select(id){const item=items.find(x=>x.id===id);if(!item)return;card++;stopAudio();clearError();selected=id;revealed=false;$('review-list-view').hidden=true;$('review-reader').hidden=false;$('review-answer').hidden=true;$('review-reference').replaceChildren();$('review-japanese').textContent='';$('review-explanation').textContent='';$('review-hint').hidden=false;$('review-reveal').disabled=false;$('review-reveal').textContent='答えを見る';$('review-reveal').setAttribute('aria-expanded','false');for(const i of [0,1]){$('review-text-'+i).textContent=item.sentences[i];const translation=$('review-translation-'+i);translation.textContent=item.sentenceJapanese?.[i]||'';translation.hidden=!translation.textContent;}position();$('review-panel').scrollIntoView({block:'start'});}
  function list(){card++;stopAudio();clearError();selected=null;$('review-reader').hidden=true;$('review-list-view').hidden=false;}
  function renderList(){
    $('review-list').replaceChildren();$('review-first').hidden=items.length===0;
    items.forEach((item,i)=>{const button=document.createElement('button');button.type='button';button.className='review-list-card';const small=document.createElement('small');small.textContent='問題 '+(i+1);button.append(small);for(const text of item.sentences){const line=document.createElement('p');line.textContent=text;button.append(line);}const caption=document.createElement('span');caption.textContent='この問題を復習する ›';button.append(caption);button.onclick=()=>select(item.id);$('review-list').append(button);});
    if(selected)position();
  }
  async function load(token,target){
    $('review-retry').hidden=true;$('review-loading').textContent='復習ノートを読み込んでいます…';
    try{let more=true;while(more&&token===session){const value=await api('');if(token!==session)return;items=value.items;setCount(value.count);renderList();if(target&&items.some(x=>x.id===target)){select(target);target=null;}more=value.importPending;$('review-loading').textContent=more?'保存済みの回答も取り込んでいます…':items.length?items.length+'件の問題を保存しています。正解し直しても残ります。':'まだ保存された問題はありません。間違い・あと少し・無回答の問題がここにたまります。';}}
    catch(e){if(token!==session)return;$('review-loading').textContent=e.message||'復習ノートを読み込めませんでした。';$('review-retry').hidden=false;}
  }
  function open(target){session++;controller?.abort();controller=new AbortController();stopAudio();items=[];list();$('review-panel').hidden=false;$('practice-goal').hidden=true;$('practice-tab').setAttribute('aria-pressed','false');$('review-tab').setAttribute('aria-pressed','true');window.dispatchEvent(new Event('sentence-review-open'));load(session,target);}
  function close(){session++;card++;controller?.abort();stopAudio();$('review-panel').hidden=true;$('practice-goal').hidden=false;$('practice-tab').setAttribute('aria-pressed','true');$('review-tab').setAttribute('aria-pressed','false');window.dispatchEvent(new Event('sentence-review-close'));}
  function answerText(text,type){const node=$('review-reference');node.replaceChildren();const match=/^[a-z]+$/.test(type)?new RegExp('\\b'+type+'\\b','i').exec(text):null;if(!match){node.textContent=text;return;}node.append(document.createTextNode(text.slice(0,match.index)));const mark=document.createElement('strong');mark.textContent=match[0];node.append(mark,document.createTextNode(text.slice(match.index+match[0].length)));}
  async function reveal(){
    if(revealed){card++;stopAudio();revealed=false;$('review-answer').hidden=true;$('review-hint').hidden=false;$('review-reveal').textContent='答えを見る';$('review-reveal').setAttribute('aria-expanded','false');return;}
    const token=session,version=card,id=selected;clearError();$('review-reveal').disabled=true;$('review-reveal').textContent='答えを読み込んでいます…';
    try{const value=await api('/'+encodeURIComponent(id)+'/reveal',{});if(token!==session||version!==card)return;answerText(value.reference,value.type);$('review-japanese').textContent=value.japanese||'';$('review-explanation').textContent=value.explanation;revealed=true;$('review-answer').hidden=false;$('review-hint').hidden=true;$('review-reveal').textContent='答えを隠す';$('review-reveal').setAttribute('aria-expanded','true');}
    catch(e){if(token!==session||version!==card)return;error(e);$('review-reveal').textContent='答えを見る';}
    finally{if(token===session&&version===card)$('review-reveal').disabled=false;}
  }
  async function play(which){
    if(which==='answer'&&!revealed)return;
    if(part===which&&!player.paused){stopAudio();return;}
    stopAudio();clearError();const token=session,version=card,audioToken=audioEpoch,id=selected;audioController=new AbortController();
    const button=$(which==='question'?'review-question-audio':'review-answer-audio');button.disabled=true;$('review-audio-status').textContent='音声を準備しています…';
    // Unlock this audio element in the tap gesture, before awaiting generation.
    player.src='data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAAZGF0YQIAAAAAAA==';player.play().catch(()=>{});
    try{const key=id+':'+which,sound=sounds.get(key)||await api('/'+encodeURIComponent(id)+'/audio',{part:which},audioController.signal);if(token!==session||version!==card||audioToken!==audioEpoch)return;sounds.set(key,sound);part=which;player.src=sound.url;await player.play();if(token!==session||version!==card||audioToken!==audioEpoch)return;button.textContent=which==='question'?'Ⅱ 2文の再生を止める':'Ⅱ 答えの再生を止める';$('review-audio-status').textContent=which==='question'?'問題の2文を再生しています。':'答えの音声を再生しています。';}
    catch(e){if(token!==session||version!==card||audioToken!==audioEpoch)return;part='';audioLabels();error(e.name==='NotAllowedError'?new Error('もう一度、音声ボタンをタップしてください。'):e);}
    finally{if(token===session&&version===card&&audioToken===audioEpoch)button.disabled=false;}
  }
  player.addEventListener('ended',()=>{if(part){part='';audioLabels();}});
  player.addEventListener('error',()=>{if(part){part='';audioLabels();error(new Error('音声を再生できませんでした。もう一度お試しください。'));}});
  $('review-tab').onclick=()=>open();$('practice-tab').onclick=()=>{if(!$('review-panel').hidden)close();};$('review-retry').onclick=()=>load(session);$('review-first').onclick=()=>select(items[0]?.id);$('review-back').onclick=list;$('review-reveal').onclick=reveal;
  $('review-prev').onclick=()=>{const i=items.findIndex(x=>x.id===selected);if(i>0)select(items[i-1].id);};$('review-next').onclick=()=>{const i=items.findIndex(x=>x.id===selected);if(i<items.length-1)select(items[i+1].id);};
  $('review-question-audio').onclick=()=>play('question');$('review-answer-audio').onclick=()=>play('answer');
  window.addEventListener('pagehide',()=>{session++;controller?.abort();stopAudio();});
  window.SentenceReview={open,close,setCount};
})();
