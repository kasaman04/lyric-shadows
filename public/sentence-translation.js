(() => {
  'use strict';
  const $ = id => document.getElementById(id), player = $('game-audio');
  const historyKey = 'sentence-translation-history-v1';
  let config, phase='setup', epoch=0, aborter, attempt, selected='all', seen=[], correct=0, total=0;
  let stream, recorder, chunks=[], recordingTimer, releaseAudio, pendingAudio, clipEnd=null;
  try { const saved=JSON.parse(localStorage.getItem(historyKey)); if(Array.isArray(saved))seen=saved.filter(x=>typeof x==='string'); } catch {}
  const showError = error => { $('error').textContent=error?.message||String(error); $('error').hidden=false; };
  const clearError = () => { $('error').hidden=true; };
  function displayPractice(value){
    if(!value)return;
    const count=Math.max(0,Number(value.count)||0);$('practice-count').textContent=count+' / 10回';$('practice-progress').value=Math.min(10,count);
    const phrase=Math.max(0,Number(value.phraseSeconds)||0);
    $('practice-phrase-count').textContent=window.ListeningTime.format(phrase)+' / 30分';$('practice-phrase-progress').value=Math.min(1800,phrase);
    $('practice-label').textContent=value.met?'今日のノルマ、達成！':'英文回答・復習';
    const achieved=value.metBy==='phrase'?'会話フレーズを30分聴いて達成しました。':'英文回答・復習10回で達成しました。';
    $('practice-note').textContent=!value.petId?'英文回答・復習10回、または会話フレーズを合計30分聴くと、その日のノルマ達成です。':!value.alive?'この相棒の育成は終了しました。育成画面から次の相棒を選べます。':value.optional?'今日は準備日です。明日から10回の練習か、会話フレーズ30分で達成できます。':value.met?achieved:'日本時間24時までに、英文回答・復習10回か、会話フレーズ30分のどちらかを達成しよう。';
    $('practice-time').hidden=value.policy!=='both'||!value.petId;
    if(value.policy==='both'&&value.petId){const mins=Math.max(0,Math.ceil((value.timeRemainingMs||0)/60000));$('practice-time').textContent='生存時間：残り '+(mins>=60?Math.floor(mins/60)+'時間':'')+(mins%60||mins<60?mins%60+'分':'')+'（聴くと回復）';if(value.alive)$('practice-note').textContent=value.optional?'今日はノルマの準備日です。時間の生存条件は今日も有効です。':value.met?achieved+'生存時間も保とう。':'生存時間を保ち、日本時間24時までに10回の練習、または会話フレーズ30分を達成しよう。';}
    $('practice-goal').dataset.met=String(value.met);
  }
  window.addEventListener('sentence-practice-change',event=>displayPractice(event.detail));
  $('goal-pet').onclick=()=>window.PetGame?.open();
  window.addEventListener('pet-state-change',event=>{const pet=event.detail?.pets?.at(-1);if(pet?.practice)displayPractice(window.PetRules.practiceStatus(pet,event.detail.serverNow||Date.now()));});
  async function refreshPractice(){try{const response=await fetch('/api/sentence-game/practice',{cache:'no-store'});if(response.ok){const value=await response.json();displayPractice(value.dailyPractice);window.SentenceReview?.setCount(value.reviewCount);}}catch{}}
  setInterval(()=>{if(phase==='setup'||phase==='result'||phase==='review')refreshPractice();},60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshPractice();});

  async function api(path,body,raw=false) {
    const response=await fetch('/api/sentence-game/'+path,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':raw?(body.type||'audio/webm'):'application/json'},body:body===undefined?undefined:raw?body:JSON.stringify(body),signal:aborter?.signal,cache:'no-store'});
    const value=await response.json();if(!response.ok)throw new Error(value.error||'接続できませんでした。もう一度お試しください。');return value;
  }
  function closeMic() { clearTimeout(recordingTimer);stream?.getTracks().forEach(t=>t.stop());stream=null;releaseAudio?.();releaseAudio=null; }
  function stopAudio() { clipEnd=null;player.pause();player.removeAttribute('src');player.load();$('solution-audio').disabled=false;$('solution-status').textContent=''; }
  function cancel() { epoch++;aborter?.abort();if(recorder){recorder.onstop=null;recorder.ondataavailable=null;if(recorder.state==='recording')recorder.stop();recorder=null;}closeMic();stopAudio();pendingAudio=null; }
  function active(value) {
    phase=value;const busy=['preparing','mic-permission','transcribing','grading'].includes(value);
    $('answer-input').disabled=busy||value==='recording';
    $('voice-input').disabled=busy||!config?.openai||!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder;
    $('voice-input').setAttribute('aria-pressed',String(value==='recording'));
    $('voice-label').textContent=value==='recording'?'■ 入力を終える':value==='mic-permission'?'マイクを準備中…':value==='transcribing'?'英文を読み取り中…':'音声で入力';
    $('judge').disabled=value!=='answering'||!$('answer-input').value.trim();
    for(const key of ['choose','answer','grade'])$('step-'+key).removeAttribute('aria-current');
    $('step-'+(['grading','result'].includes(value)?'grade':value==='setup'?'choose':'answer')).setAttribute('aria-current','step');
  }
  function setup() { cancel();active('setup');$('setup').hidden=false;$('round').hidden=true;$('begin').disabled=!config; }
  function choose(key) {
    selected=key;
    for(const button of $('pattern-choices').children)button.setAttribute('aria-pressed',String(button.dataset.pattern===key));
    const count=key==='all'?config.translationQuestions:config.translationTypes.find(t=>t.key===key)?.count||0;
    $('selected-pattern').textContent=(key==='all'?'すべてのパターン':key)+' · '+count+'問';
  }
  async function start(repeat) {
    cancel();const token=epoch;aborter=new AbortController();clearError();attempt=null;
    $('begin').disabled=true;$('setup').hidden=true;$('round').hidden=false;$('result').hidden=true;$('question-screen').hidden=false;
    $('answer-input').value='';$('japanese-prompt').textContent='問題を準備しています…';$('pattern-hint').textContent='';$('round-pattern').textContent=selected==='all'?'すべて':selected;$('round-position').textContent='';$('input-status').textContent='';$('retry-transcribe').hidden=true;active('preparing');
    try {
      const result=await api('attempts',{mode:'translation',filter:selected,exclude:seen,repeat:repeat||undefined});if(token!==epoch)return;attempt=result;
      seen=attempt.history;try{localStorage.setItem(historyKey,JSON.stringify(seen));}catch{}
      const q=attempt.question,pool=selected==='all'?config.translationQuestions:config.translationTypes.find(t=>t.key===selected).count;
      $('japanese-prompt').textContent=q.japanese;$('round-pattern').textContent=q.type;$('round-position').textContent=selected==='all'?`${seen.length} / ${pool}問`:`${seen.filter(id=>id.startsWith('translation-'+selected.replaceAll(' ','-')+'-dialogue-')).length} / ${pool}問`;
      $('pattern-hint').textContent=q.type+' を使って答えてください。';active('answering');$('round-title').focus();
      if(!config.openai)$('input-status').textContent='現在、音声入力と自由な英文の判定に接続できません。';
      else if($('voice-input').disabled)$('input-status').textContent='このブラウザでは手入力で答えてください。';
    } catch(error) { if(token!==epoch)return;setup();showError(error); }
  }
  async function beginRecording() {
    if(phase!=='answering')return;
    const token=epoch;clearError();active('mic-permission');stopAudio();
    try {
      const acquired=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
      if(token!==epoch){acquired.getTracks().forEach(t=>t.stop());return;}
      stream=acquired;releaseAudio=window.VoicePracticeAudio?.acquire();
      const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
      const current=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);recorder=current;chunks=[];pendingAudio=null;$('retry-transcribe').hidden=true;
      current.ondataavailable=event=>{if(token===epoch&&event.data.size)chunks.push(event.data);};
      current.onstop=()=>{if(token!==epoch)return;pendingAudio=new Blob(chunks,{type:current.mimeType||chunks[0]?.type||'audio/webm'});recorder=null;closeMic();readRecording(token);};
      current.onerror=()=>{if(token!==epoch)return;current.onstop=null;recorder=null;closeMic();active('answering');showError(new Error('録音できませんでした。もう一度試すか、手入力してください。'));};
      current.start(200);active('recording');$('input-status').textContent='録音中です。話し終わったら「入力を終える」を押してください（最長45秒）。';
      recordingTimer=setTimeout(finishRecording,45000);
    } catch(error) { if(token!==epoch)return;closeMic();active('answering');showError(new Error(error.name==='NotAllowedError'?'マイクの使用を許可すると音声入力できます。手入力でも答えられます。':'マイクを使えませんでした。手入力で答えるか、もう一度お試しください。')); }
  }
  function finishRecording() { if(phase!=='recording'||recorder?.state!=='recording')return;clearTimeout(recordingTimer);active('transcribing');$('input-status').textContent='音声から英文を読み取っています…';recorder.stop();stream?.getAudioTracks().forEach(t=>{t.enabled=false;}); }
  async function readRecording(token) {
    clearError();active('transcribing');$('retry-transcribe').hidden=true;$('input-status').textContent='音声から英文を読み取っています…';
    try {
      const result=await api('attempts/'+attempt.id+'/transcribe',pendingAudio,true);if(token!==epoch)return;
      if(result.transcript){$('answer-input').value=[$('answer-input').value.trim(),result.transcript].filter(Boolean).join(' ').slice(0,1500);$('input-status').textContent='英文を確認して「判定する」を押してください。';pendingAudio=null;}
      else {$('input-status').textContent='英文を聞き取れませんでした。もう一度話すか、手入力してください。';pendingAudio=null;}
    } catch(error) { if(token!==epoch)return;showError(error);$('input-status').textContent='もう一度読み取るか、手入力で答えられます。';$('retry-transcribe').hidden=false; }
    finally { if(token===epoch){active('answering');$('answer-input').focus();} }
  }
  async function judge() {
    if(phase!=='answering'||!$('answer-input').value.trim())return;
    const token=epoch;clearError();active('grading');$('input-status').textContent='英文の意味と文法を確認しています…';$('retry-transcribe').hidden=true;
    try { const result=await api('attempts/'+attempt.id+'/text-answer',{text:$('answer-input').value});if(token!==epoch)return;renderResult(result); }
    catch(error) { if(token!==epoch)return;active('answering');$('input-status').textContent='回答は残っています。もう一度「判定する」を押してください。';showError(error); }
  }
  function renderResult(result) {
    active('result');pendingAudio=null;displayPractice(result.dailyPractice);window.PetGame?.refresh()?.catch(()=>{});window.SentenceReview?.setCount(result.reviewCount);
    total++;if(result.verdict==='correct')correct++;$('scoreboard').textContent=`正解 ${correct} / ${total}問`;
    $('question-screen').hidden=true;$('result').hidden=false;$('saved-review').hidden=!result.reviewSaved||result.verdict==='correct';
    const labels={correct:['✓','正解！'],almost:['△','あと少し！'],incorrect:['↻','お手本で確認しよう'],no_answer:['…','回答なし']};
    const [icon,title]=labels[result.verdict]||labels.incorrect;$('result-icon').textContent=icon;$('result-title').textContent=title;$('result').dataset.verdict=result.verdict;
    $('result-feedback').textContent=result.feedback;$('transcript').textContent=result.transcript||'回答なし';$('reference').textContent=result.reference;
    $('corrected').textContent=result.corrected;$('corrected-card').hidden=result.verdict==='correct'||!result.corrected||result.corrected===result.reference;
    $('result-type').textContent=result.type+' のポイント';$('explanation').textContent=result.explanation;$('result-title').focus();
  }
  $('solution-audio').onclick=async()=>{
    const token=epoch;clearError();stopAudio();$('solution-audio').disabled=true;$('solution-status').textContent='お手本を準備しています…';
    player.src='data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAAZGF0YQIAAAAAAA==';player.play().catch(()=>{});
    try { const sound=await api('attempts/'+attempt.id+'/solution-audio',{});if(token!==epoch)return;clipEnd=sound.end??null;player.src=sound.url;player.currentTime=sound.start||0;await player.play();if(token!==epoch)return;$('solution-status').textContent='お手本を再生しています…'; }
    catch(error){if(token!==epoch)return;stopAudio();showError(error);}
  };
  player.addEventListener('timeupdate',()=>{if(clipEnd!==null&&player.currentTime>=clipEnd){player.pause();clipEnd=null;$('solution-audio').disabled=false;$('solution-status').textContent='';}});
  player.addEventListener('ended',()=>{clipEnd=null;$('solution-audio').disabled=false;$('solution-status').textContent='';});
  player.addEventListener('error',()=>{if(phase==='result'&&player.getAttribute('src')){stopAudio();showError(new Error('音声を再生できませんでした。もう一度お試しください。'));}});
  $('answer-input').addEventListener('input',()=>{if(phase==='answering')active('answering');});
  $('answer-input').addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();judge();}});
  $('begin').onclick=()=>start();$('judge').onclick=judge;$('voice-input').onclick=()=>phase==='recording'?finishRecording():beginRecording();
  $('retry-transcribe').onclick=()=>{if(pendingAudio&&phase==='answering')readRecording(epoch);};
  $('next').onclick=()=>start();$('repeat').onclick=()=>start(attempt.question.id);$('exit').onclick=()=>{clearError();setup();};
  $('saved-review').onclick=()=>window.SentenceReview?.open(attempt.question.id);
  window.addEventListener('sentence-review-open',()=>{clearError();setup();$('setup').hidden=true;active('review');});
  window.addEventListener('sentence-review-close',()=>{clearError();setup();});
  window.addEventListener('pagehide',cancel);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&['recording','mic-permission'].includes(phase)){cancel();aborter=new AbortController();active('answering');$('input-status').textContent='画面を離れたため録音を停止しました。入力済みの英文から続けられます。';}});
  api('config').then(value=>{
    config=value;displayPractice(value.dailyPractice);window.SentenceReview?.setCount(value.reviewCount);
    $('question-count').textContent=`${value.translationTypes.length}パターン · ${value.translationQuestions}問`;
    for(const type of [{key:'all'},...value.translationTypes]){const button=document.createElement('button');button.type='button';button.className='pattern-choice';button.dataset.pattern=type.key;button.textContent=type.key==='all'?'すべて':type.key;button.setAttribute('aria-pressed','false');button.onclick=()=>choose(type.key);$('pattern-choices').append(button);}
    choose(selected);$('begin').disabled=false;$('configuration').textContent=value.openai?'同じパターンの問題を、一巡するまで重複せずに練習できます。':'現在、音声入力と自由な英文の判定に接続できません。';
  }).catch(error=>{$('question-count').textContent='問題を読み込めませんでした。';$('configuration').textContent='ページを再読み込みしてください。';showError(error);});
})();
