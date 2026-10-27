(() => {
  'use strict';
  const $ = id => document.getElementById(id), player = $('game-audio');
  let config, epoch=0, aborter, phase='setup', attempt, purpose='', stream, context, analyser, source, recorder, releaseAudio, gate, frame, deadline, chunks=[], pending, seen=[], correct=0, total=0;
  try{seen=window.SentenceGameCore.readHistory(window.localStorage);}catch{}
  const showError = error => { $('error').textContent=error?.message||String(error); $('error').hidden=false; };
  const clearError = () => { $('error').hidden=true; };
  window.addEventListener('sentence-review-open',()=>{clearError();setup();$('setup').hidden=true;active('review');});
  window.addEventListener('sentence-review-close',()=>{clearError();setup();});
  $('saved-review').onclick=()=>window.SentenceReview?.open(attempt.question.id);
  function displayPractice(value){
    if(!value)return;
    const count=Math.max(0,Number(value.count)||0);$('practice-count').textContent=count+' / 10回';$('practice-progress').value=Math.min(10,count);
    $('practice-label').textContent=value.met?'今日の10回、達成！':'今日、あと'+Math.max(0,10-count)+'回';
    $('practice-note').textContent=!value.petId?'音声回答の採点、または復習で答えを確認すると1回。復習だけでも10回で達成できます。':!value.alive?'この相棒の育成は終了しました。育成画面から次の相棒を選べます。':value.optional?'今日は準備日です。明日から日本時間の1日で10回。復習も1回に数えます。':value.met?'今日の生存条件を達成しました。明日はまた10回。正解・不正解は問いません。':'日本時間24時の締切までに10回。未達だとモンスターが死亡します。無回答は数えません。';
    $('practice-time').hidden=value.policy!=='both'||!value.petId;
    if(value.policy==='both'&&value.petId){const mins=Math.max(0,Math.ceil((value.timeRemainingMs||0)/60000));$('practice-time').textContent='生存時間：残り '+(mins>=60?Math.floor(mins/60)+'時間':'')+(mins%60||mins<60?mins%60+'分':'')+'（聴くと回復）';if(value.alive)$('practice-note').textContent=value.optional?'今日は10回の準備日です。時間の生存条件は今日も有効です。':value.met?'10回の条件は達成しました。生存時間も0にならないよう、英語を聴いて保とう。':'日本時間24時までに10回。残り時間と10回の両方を満たす必要があります。';}
    $('practice-goal').dataset.met=String(value.met);
  }
  window.addEventListener('sentence-practice-change',event=>displayPractice(event.detail));
  $('goal-pet').onclick=()=>window.PetGame?.open();
  window.addEventListener('pet-state-change',event=>{const pet=event.detail?.pets?.at(-1);if(pet?.practice)displayPractice(window.PetRules.practiceStatus(pet,event.detail.serverNow||Date.now()));});
  async function refreshPractice(){try{const response=await fetch('/api/sentence-game/practice',{cache:'no-store'});if(response.ok){const value=await response.json();displayPractice(value.dailyPractice);window.SentenceReview?.setCount(value.reviewCount);}}catch{}}
  setInterval(()=>{if(phase==='setup'||phase==='result'||phase==='review')refreshPractice();},60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshPractice();});
  const active = value => { phase=value; for(const key of ['listen','speak','grade'])$('step-'+key).removeAttribute('aria-current'); const key={preparing:'listen',listening:'listen',recording:'speak',grading:'grade',result:'grade'}[value];if(key)$('step-'+key).setAttribute('aria-current','step');$('voice-state').dataset.phase=value; };
  function stopTimers(){cancelAnimationFrame(frame);clearTimeout(deadline);gate?.cancel();}
  function muteMic(){stream?.getAudioTracks().forEach(t=>{t.enabled=false;});}
  function closeMic(){stream?.getTracks().forEach(t=>t.stop());stream=null;source?.disconnect();source=null;analyser=null;const old=context;context=null;old?.close().catch(()=>{});releaseAudio?.();releaseAudio=null;}
  function cancel(keepMic=false){epoch++;aborter?.abort();stopTimers();purpose='';player.pause();player.removeAttribute('src');player.load();if(recorder?.state==='recording'){recorder.onstop=null;recorder.stop();}recorder=null;if(keepMic===true)muteMic();else closeMic();}
  async function api(path,body,raw=false){const response=await fetch('/api/sentence-game/'+path,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':raw?(body.type||'audio/webm'):'application/json'},body:body===undefined?undefined:raw?body:JSON.stringify(body),signal:aborter?.signal});const data=await response.json();if(!response.ok)throw new Error(data.error||'接続できませんでした。再試行してください。');return data;}
  function controls(disabled){for(const id of ['repeat','next','solution-audio'])$(id).disabled=disabled;}
  function setup(){cancel();active('setup');$('setup').hidden=false;$('round').hidden=true;$('begin').disabled=!config?.openai||!config?.elevenlabs;}
  function unlock(){// Keep one audio element for iOS user-gesture playback and all question/answer audio.
    player.src='data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAAZGF0YQIAAAAAAA==';
    player.play().catch(()=>{});
  }
  async function prepareMic(token){
    if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error('このブラウザでは録音できません。SafariまたはChromeの最新版で開いてください。');
    // Retain the original permission/stream across questions. Muting a live
    // track pauses input without requesting microphone access again.
    if(stream?.getAudioTracks().some(t=>t.readyState==='live')&&context?.state!=='closed'&&analyser){muteMic();unlock();await context.resume();return;}
    closeMic();
    releaseAudio=window.VoicePracticeAudio.acquire();
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    context=new AudioContextClass();unlock();await context.resume();
    const acquired=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
    if(token!==epoch){acquired.getTracks().forEach(t=>t.stop());return;}
    stream=acquired;stream.getAudioTracks().forEach(t=>{t.enabled=false;});
    analyser=context.createAnalyser();analyser.fftSize=2048;source=context.createMediaStreamSource(stream);source.connect(analyser);
  }
  async function start(repeat){
    cancel(true);const token=epoch;aborter=new AbortController();clearError();pending=null;attempt=null;
    $('setup').hidden=true;$('round').hidden=false;$('result').hidden=true;$('question-screen').hidden=false;$('resume-audio').hidden=true;$('retry-grade').hidden=true;$('countdown').hidden=true;controls(true);
    for(const i of [0,1]){$('text-'+i).textContent='…';$('sentence-'+i).removeAttribute('aria-current');}
    active('preparing');$('round-title').textContent='2文を準備しています。';$('status').textContent='マイクと問題音声を準備しています…';$('record-guide').textContent='音声が終わると、自動で録音が始まります。';$('mic-symbol').textContent='♪';
    try{
      await prepareMic(token);if(token!==epoch)return;
      const result=await api('attempts',{filter:$('filter').value,exclude:seen,repeat:repeat||undefined});if(token!==epoch)return;
      attempt=result;
      if(Array.isArray(result.history))seen=result.history;else if(!seen.includes(result.question.id))seen.push(result.question.id);
      try{window.SentenceGameCore.writeHistory(window.localStorage,seen);}catch{}
      result.question.sentences.forEach((text,i)=>{$('text-'+i).textContent=text;});
      $('round-title').textContent='2文を聞こう。';active('listening');$('status').textContent='2つの英文を再生しています…';
      purpose='question';player.src=result.audio.url;player.load();await playQuestion(token);
    }catch(error){if(token!==epoch)return;closeMic();purpose='';player.pause();showError(error.name==='NotAllowedError'?new Error('マイクの使用を許可して、もう一度はじめてください。'):error);setup();}
  }
  async function playQuestion(token){
    try{await context?.resume();await player.play();if(token!==epoch)player.pause();}
    catch(error){if(token!==epoch)return;$('status').textContent='タップして2文を再生してください。';$('resume-audio').hidden=false;}
  }
  $('resume-audio').onclick=()=>{$('resume-audio').hidden=true;clearError();playQuestion(epoch);};
  player.addEventListener('timeupdate',()=>{if(purpose!=='question'||!attempt)return;for(const i of [0,1]){const cue=attempt.audio.cues.find(c=>c.index===i),current=cue&&player.currentTime>=cue.start&&player.currentTime<cue.end;$('sentence-'+i).setAttribute('aria-current',String(Boolean(current)));}});
  player.addEventListener('ended',()=>{if(purpose==='question'&&phase==='listening'){purpose='';beginRecording();}else if(purpose==='solution'){purpose='';$('solution-status').textContent='';$('solution-audio').disabled=false;}});
  player.addEventListener('error',()=>{if(!purpose||phase==='setup')return;if(purpose==='question'){$('status').textContent='音声を再生できませんでした。';$('resume-audio').hidden=false;}else{$('solution-status').textContent='もう一度タップして再生してください。';$('solution-audio').disabled=false;}});
  function beginRecording(){
    const token=epoch;try{
      if(!stream||!analyser)throw new Error('マイクの接続が切れました。「練習を終える」から再開してください。');
      for(const i of [0,1])$('sentence-'+i).removeAttribute('aria-current');
      const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
      recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);chunks=[];
      recorder.ondataavailable=event=>{if(token===epoch&&event.data.size)chunks.push(event.data);};
      recorder.onerror=()=>{if(token!==epoch)return;stopTimers();closeMic();showError(new Error('録音できませんでした。練習を終えて、もう一度お試しください。'));};
      stream.getAudioTracks().forEach(t=>{t.enabled=true;});recorder.start(200);
      gate=new window.SentenceGameCore.TurnGate(performance.now(),{onset:config.onsetTimeoutMs,silence:config.silenceMs,max:config.maxRecordingMs});
      active('recording');$('round-title').textContent='1つの英文にして、話そう。';$('status').textContent='録音中 · 5秒以内に話し始めよう';$('record-guide').textContent='2文の意味をつなげて、声で答えてください。';$('mic-symbol').textContent='●';$('countdown').textContent='5';$('countdown').hidden=false;
      const samples=new Float32Array(analyser.fftSize);let loudFrames=0;
      function sample(){if(token!==epoch||phase!=='recording')return;analyser.getFloatTimeDomainData(samples);let energy=0;for(const v of samples)energy+=v*v;const loud=Math.sqrt(energy/samples.length)>=.015;loudFrames=loud?loudFrames+1:0;const outcome=gate.sample(performance.now(),loudFrames>=3);
        if(gate.spoken){clearTimeout(deadline);$('countdown').hidden=true;$('status').textContent='録音中 · 話し終わると自動で採点します';$('record-guide').textContent='焦らず、最後まで話してください。';}else{const value=String(gate.remaining(performance.now()));if($('countdown').textContent!==value)$('countdown').textContent=value;}
        if(outcome)finishRecording(outcome,token);else frame=requestAnimationFrame(sample);
      }
      deadline=setTimeout(()=>{if(token===epoch&&phase==='recording'&&!gate.spoken){const outcome=gate.sample(performance.now(),false);if(outcome)finishRecording(outcome,token);}},config.onsetTimeoutMs+10);
      frame=requestAnimationFrame(sample);
    }catch(error){stopTimers();closeMic();showError(new Error(window.VoicePracticeAudio.message(error)));}
  }
  function finishRecording(outcome,token){
    if(token!==epoch||phase!=='recording')return;active('grading');stopTimers();$('countdown').hidden=true;$('status').textContent=outcome==='no_answer'?'回答なしとして判定しています…':'英文を聞き取って、採点しています…';$('record-guide').textContent='少しお待ちください。';$('mic-symbol').textContent='…';
    const current=recorder;
    current.onstop=()=>{if(token!==epoch)return;const blob=new Blob(chunks,{type:current.mimeType||chunks[0]?.type||'audio/webm'});recorder=null;pending={outcome,blob};submit(token);};
    current.stop();muteMic();
  }
  async function submit(token){
    $('retry-grade').hidden=true;clearError();
    try{if(pending.outcome!=='no_answer'&&pending.blob.size>8*1024*1024)throw new Error('録音が長すぎました。練習を終えて、短い1文でもう一度お試しください。');const result=pending.outcome==='no_answer'?await api('attempts/'+attempt.id+'/no-answer',{}):await api('attempts/'+attempt.id+'/answer',pending.blob,true);if(token!==epoch)return;renderResult(result);}
    catch(error){if(token!==epoch)return;showError(error);$('status').textContent='採点を完了できませんでした。';$('record-guide').textContent='録音は保持しています。下のボタンから再試行できます。';$('retry-grade').hidden=false;}
  }
  function renderResult(result){
    displayPractice(result.dailyPractice);window.PetGame?.refresh();
    window.SentenceReview?.setCount(result.reviewCount);$('saved-review').hidden=!result.reviewSaved||result.verdict==='correct';
    active('result');total++;if(result.verdict==='correct')correct++;$('scoreboard').textContent=`正解 ${correct} / ${total}問`;$('question-screen').hidden=true;$('result').hidden=false;controls(false);pending=null;
    const labels={correct:['✓','正解！'],almost:['△','あと少し！'],incorrect:['↻','お手本で確認しよう'],no_answer:['…','回答なし']};const [icon,title]=labels[result.verdict]||labels.incorrect;
    $('result-icon').textContent=icon;$('result').dataset.verdict=result.verdict;$('result-title').textContent=title;$('result-feedback').textContent=result.feedback;$('transcript').textContent=result.transcript||'発話なし';$('reference').textContent=result.reference;$('result-type').textContent=result.type;$('explanation').textContent=result.explanation;$('solution-status').textContent='';
  }
  $('solution-audio').onclick=async()=>{const token=epoch;clearError();$('solution-audio').disabled=true;$('solution-status').textContent='お手本音声を準備しています…';try{const sound=await api('attempts/'+attempt.id+'/solution-audio',{});if(token!==epoch)return;purpose='solution';player.src=sound.url;await player.play();$('solution-status').textContent='お手本を再生しています…';}catch(error){if(token!==epoch)return;purpose='';$('solution-audio').disabled=false;$('solution-status').textContent='';showError(error);}};
  $('begin').onclick=()=>start();$('repeat').onclick=()=>start(attempt.question.id);$('next').onclick=()=>start();$('exit').onclick=()=>{clearError();setup();};$('retry-grade').onclick=()=>submit(epoch);
  window.addEventListener('pagehide',cancel);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden||phase==='review')return;if(phase==='result'){closeMic();}else if(phase!=='setup'){setup();showError(new Error('画面を離れたため、録音を停止しました。もう一度はじめてください。'));}});
  api('config').then(value=>{
    config=value;
    $('question-count').textContent=`全${value.questions}問・17種類。ひと通り出るまで同じ問題は出ません。`;
    displayPractice(value.dailyPractice);
    window.SentenceReview?.setCount(value.reviewCount);
    for(const level of ['basic','advanced']){
      const group=document.createElement('optgroup');group.label=level==='basic'?'基本10種類':'応用7種類';
      for(const type of value.types.filter(t=>t.level===level)){
        const option=document.createElement('option');option.value=type.key;option.textContent=type.key+' · '+type.label;group.append(option);
        const row=document.createElement('span'),word=document.createElement('strong');word.textContent=type.key;row.append(word,document.createTextNode(type.label));$('type-list').append(row);
      }
      $('filter').append(group);
    }
    $('begin').disabled=!value.openai||!value.elevenlabs;$('configuration').textContent=value.openai&&value.elevenlabs?'準備できました。マイクを許可してはじめましょう。':'サーバーにOpenAIとElevenLabsのAPIキーを設定してください。';
  }).catch(error=>{$('configuration').textContent='接続設定を確認できませんでした。ページを再読み込みしてください。';showError(error);});
})();
