// Native Lyric Shadows movie view. Media and captions are served by this app.
(() => {
  'use strict';
  let mounted=null;
  const progressApi=window.MovieStudyProgress;
  const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
  let progress=progressApi.createStore(storage),deviceId='';
  function initialize(id){
    if(id===deviceId)return;
    deviceId=id;
    progress=progressApi.createCloudStore(storage,id,{
      writerId:window.crypto?.randomUUID?.()||`movie-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      async request(ledger){
        const response=await fetch(`/api/pet/${encodeURIComponent(id)}/movies`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ledger),cache:'no-store',signal:AbortSignal.timeout(15000)});
        if(!response.ok)throw Error('Movie progress sync failed');
        return response.json();
      },
      onChange:()=>window.dispatchEvent(new Event('movie-progress-change'))
    });
    void progress.sync();
  }
  window.addEventListener('online',()=>void progress.sync?.());
  window.addEventListener('focus',()=>void progress.sync?.());
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void progress.sync?.();});
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount(root,options){
    let destroyed=false;
    const lifetime=new AbortController();
    const listen=(target,type,handler,settings={})=>target.addEventListener(type,handler,{...settings,signal:lifetime.signal});
    progress.refresh();
    function samplePass(p){p.pass.sample({time:p.video.currentTime,wall:performance.now(),rate:p.video.playbackRate,playing:!p.video.paused,audible:!p.video.muted&&p.video.volume>0,active:active===p.index&&!document.hidden,seeking:p.video.seeking});}
    function showCompleted(){
      feed.insertAdjacentHTML('beforeend','<section class="movie-empty"><p>この作品の会話はすべて100回聞き終わりました。</p><p>上のメニューから、別の作品を選べます。</p><button type="button" class="movie-empty-back">映画一覧に戻る</button></section>');
      root.querySelector('.movie-empty-back').onclick=()=>options.home();
    }
    function finishPass(p){
      if(destroyed||active!==p.index)return;
      samplePass(p);
      if(p.pass.finish(p.video.duration||p.scene.duration)){
        const result=progress.complete(p.scene.id);renderControls(p);
        if(!result.persisted)announce('視聴回数を保存できません。このブラウザの保存設定を確認してください。');
        if(result.hidden){const position=visiblePlayers.indexOf(p),next=visiblePlayers[position+1]||visiblePlayers[position-1];applyFilter(selectedWork,next?.scene.id);announce('100回聞いた会話を一覧から削除しました');return;}
      }
      p.pass.reset();
      if(repeat){p.video.currentTime=0;start(p);}
    }

  'use strict';
  const scenes=window.MOVIE_SCENES||[];
  const feed=root.querySelector('.feed');
  const notice=root.querySelector('.notice');
  const workSelect=root.querySelector('[data-movie-work]');
  const filters=[
    {key:'before',label:'ビフォア（三部作）',matches:s=>s.work.startsWith('Before ')},
    {key:'sunrise',label:'ビフォア・サンライズ',matches:s=>s.work==='Before Sunrise'},
    {key:'sunset',label:'ビフォア・サンセット',matches:s=>s.work==='Before Sunset'},
    {key:'midnight',label:'ビフォア・ミッドナイト',matches:s=>s.work==='Before Midnight'},
    {key:'eternal',label:'エターナル・サンシャイン',matches:s=>s.work==='Eternal Sunshine of the Spotless Mind'},
    {key:'will',label:'グッド・ウィル・ハンティング',matches:s=>s.work==='Good Will Hunting'},
    {key:'truman',label:'トゥルーマン・ショー',matches:s=>s.work==='The Truman Show'},
    {key:'all',label:'すべての作品',matches:()=>true}
  ].filter(filter=>scenes.some(filter.matches));
  const params=new URLSearchParams(location.search);
  const requestedScene=scenes.find(scene=>scene.id===params.get('scene'));
  let storedWork='';try{storedWork=localStorage.getItem('movie-study-work')||'';}catch{}
  const validWork=key=>filters.some(filter=>filter.key===key);
  let selectedWork=validWork(options.work)?options.work:validWork(params.get('work'))?params.get('work'):
    requestedScene?filters.find(filter=>!['before','all'].includes(filter.key)&&filter.matches(requestedScene)).key:
    validWork(storedWork)?storedWork:'before';
  let visiblePlayers=[];
  const lastSceneByWork=new Map();
  for(const filter of filters){const option=document.createElement('option');option.value=filter.key;option.textContent=filter.label;workSelect.append(option);}
  const icon=paths=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
  const icons={
    sound:icon('<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>'),
    muted:icon('<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/>'),
    repeat:icon('<path d="m17 2 4 4-4 4M21 6H8a5 5 0 0 0-5 5m4 11-4-4 4-4M3 18h13a5 5 0 0 0 5-5"/>'),
    save:icon('<path d="M5 3h14v18l-7-5-7 5V3Z"/>'),
    saved:icon('<path d="M5 3h14v18l-7-5-7 5V3Z" fill="currentColor"/>'),
    play:icon('<path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none"/>'),
    rewind:icon('<path d="M4 9a8 8 0 1 1 0 6M4 4v5h5M14 8h-4v4h3a2 2 0 1 1-3 2"/>'),
    pause:icon('<path d="M8 5v14M16 5v14" stroke-width="3"/>'),
    up:icon('<path d="m5 15 7-6 7 6"/>'),
    down:icon('<path d="m5 9 7 6 7-6"/>')
  };
  let active=-1,muted=false,repeat=true,rate=1,captionMode='both',noticeTimer,scrollFrame,snapTimer,pointerStart,suppressClickUntil=0;
  const saved=(()=>{try{return new Set(JSON.parse(localStorage.getItem('movie-study-saved')||'[]'));}catch{return new Set();}})();
  const format=t=>`${Math.floor((Number(t)||0)/60)}:${String(Math.floor((Number(t)||0)%60)).padStart(2,'0')}`;
  function announce(text){notice.textContent=text;notice.classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.classList.remove('visible'),1800);}
  const players=scenes.map((scene,index)=>{
    const section=document.createElement('section');section.className='scene';section.dataset.scene=scene.id;section.setAttribute('aria-label',`会話${index+1} ${scene.title}`);section.style.setProperty('--poster',`url("${scene.poster}")`);
    section.innerHTML=`
      <header class="topbar"><span class="scene-index">${index+1} / ${scenes.length}</span><span class="app-title">映画で英会話</span><button class="sound" type="button" aria-label="音声をオフ"><span class="sound-icon">${icons.sound}</span><span class="sound-label">音声</span></button></header>
      <div class="video-window" role="button" tabindex="0" aria-label="動画を一時停止"><video playsinline preload="none" poster="${scene.poster}" aria-label="${escapeHtml(scene.title)}" draggable="false"><source src="${scene.video}" type="video/mp4"></video></div>
      <div class="captions" aria-hidden="true"><div class="caption-en" lang="en"></div><div class="caption-ja"></div></div>
      <nav class="actions" aria-label="会話の学習操作"><button type="button" class="action repeat on" aria-label="この会話をリピート" aria-pressed="true">${icons.repeat}<span class="action-label">リピート</span></button><button type="button" class="action translation" aria-label="字幕表示を切り替える"><span class="translation-symbol" aria-hidden="true">文A</span><span class="action-label mode-label">英日</span></button><button type="button" class="action save" aria-label="この会話を保存" aria-pressed="false"><span class="save-icon">${icons.save}</span><span class="action-label">保存</span></button></nav>
      <div class="scene-meta"><p class="watch-count" aria-live="polite"></p><p class="work-title"></p><h1 class="scene-title"></h1><p class="scene-description"></p></div>
      <div class="transport"><span class="time elapsed">0:00</span><input class="seek" type="range" min="0" max="${scene.duration}" step="0.05" value="0" aria-label="会話の再生位置"><span class="time duration">${format(Math.ceil(scene.duration))}</span><button type="button" class="rewind" aria-label="5秒戻る" title="5秒戻る">${icons.rewind}<span>5秒戻る</span></button><button type="button" class="speed" aria-label="再生速度を変更">1×</button><button type="button" class="play" aria-label="一時停止">${icons.pause}</button></div>
      <button type="button" class="swipe">${index<scenes.length-1?icons.up:icons.down}<span class="swipe-text">${index<scenes.length-1?'上にスワイプして次の会話へ':'下にスワイプして前の会話へ'}</span></button>`;
    const q=selector=>section.querySelector(selector),video=q('video');
    q('.topbar').insertAdjacentHTML('afterbegin','<button class="movie-back" type="button" aria-label="映画一覧に戻る"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7"/></svg></button>');q('.movie-back').onclick=()=>options.home();
    q('.work-title').textContent=scene.displayWork||scene.work;q('.scene-title').textContent=scene.title;q('.scene-description').textContent=`${scene.description} · ${format(Math.ceil(scene.duration))}`;
    const player={scene,index,section,q,video,lastCue:-2,userPaused:false,pass:progressApi.createPass()};
    q('.sound').onclick=()=>{muted=!muted;players.forEach(p=>{p.video.muted=muted;renderControls(p);});if(!muted&&video.paused){player.userPaused=false;start(player);}announce(muted?'音声をオフにしました':'音声をオンにしました');};
    q('.repeat').onclick=()=>{repeat=!repeat;players.forEach(p=>{p.video.loop=false;renderControls(p);});announce(repeat?'この会話全体をリピート':'リピートをオフにしました');};
    q('.translation').onclick=()=>{const modes=['both','en','ja','off'];captionMode=modes[(modes.indexOf(captionMode)+1)%modes.length];players.forEach(p=>{p.lastCue=-2;renderTime(p);renderControls(p);});announce({both:'英語と日本語を表示',en:'英語だけを表示',ja:'日本語だけを表示',off:'字幕を非表示'}[captionMode]);};
    q('.save').onclick=()=>{if(saved.has(scene.id))saved.delete(scene.id);else saved.add(scene.id);try{localStorage.setItem('movie-study-saved',JSON.stringify([...saved]));}catch{}renderControls(player);announce(saved.has(scene.id)?'この会話を保存しました':'保存を解除しました');};
    q('.speed').onclick=()=>{const rates=[1,.75,.9];rate=rates[(rates.indexOf(rate)+1)%rates.length];players.forEach(p=>{p.video.playbackRate=rate;renderControls(p);});announce(`再生速度 ${rate}倍`);};
    q('.rewind').onclick=()=>{samplePass(player);video.currentTime=Math.max(0,video.currentTime-5);renderTime(player);};
    const toggle=()=>{if(Date.now()<suppressClickUntil)return;if(video.paused){player.userPaused=false;start(player);}else{player.userPaused=true;video.pause();}};
    q('.play').onclick=toggle;q('.video-window').onclick=toggle;q('.video-window').onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle();}};
    listen(q('.seek'),'input',e=>{video.currentTime=Number(e.target.value);renderTime(player);});
    q('.swipe').onclick=()=>{const position=visiblePlayers.indexOf(player);go(position<visiblePlayers.length-1?position+1:position-1);};
    listen(video,'timeupdate',()=>{samplePass(player);renderTime(player);});listen(video,'ended',()=>finishPass(player));listen(video,'seeking',()=>{samplePass(player);renderTime(player);});listen(video,'seeked',()=>samplePass(player));listen(video,'play',()=>{samplePass(player);renderControls(player);});listen(video,'pause',()=>{samplePass(player);renderControls(player);});listen(video,'volumechange',()=>samplePass(player));listen(video,'loadedmetadata',()=>renderTime(player));
    listen(video,'error',()=>{if(index===active)announce('動画を読み込めません。ページを再読み込みしてください。');});
    feed.append(section);return player;
  });
  function renderControls(p){
    p.q('.watch-count').textContent=`聞いた回数 ${progress.count(p.scene.id)} / ${progressApi.limit}回`;
    p.q('.sound-icon').innerHTML=muted?icons.muted:icons.sound;p.q('.sound').setAttribute('aria-label',muted?'音声をオン':'音声をオフ');p.q('.sound-label').textContent=muted?'音声オン':'音声';
    p.q('.repeat').classList.toggle('on',repeat);p.q('.repeat').setAttribute('aria-pressed',String(repeat));
    const isSaved=saved.has(p.scene.id);p.q('.save').classList.toggle('on',isSaved);p.q('.save').setAttribute('aria-pressed',String(isSaved));p.q('.save-icon').innerHTML=isSaved?icons.saved:icons.save;
    p.q('.mode-label').textContent={both:'英日',en:'英語',ja:'日本語',off:'字幕オフ'}[captionMode];
    p.q('.speed').textContent=`${rate}×`;p.q('.speed').setAttribute('aria-label',`再生速度 ${rate}倍、押して変更`);
    p.q('.play').innerHTML=p.video.paused?icons.play:icons.pause;p.q('.play').setAttribute('aria-label',p.video.paused?'再生':'一時停止');p.q('.video-window').setAttribute('aria-label',p.video.paused?'動画を再生':'動画を一時停止');
  }
  function renderTime(p){
    const time=p.video.currentTime;p.q('.elapsed').textContent=format(time);p.q('.seek').value=time;p.q('.seek').setAttribute('aria-valuetext',`${format(time)} / ${format(Math.ceil(p.scene.duration))}`);
    const index=p.scene.captions.findIndex(c=>time>=c.start&&time<c.end);
    if(index===p.lastCue)return;p.lastCue=index;
    const cue=p.scene.captions[index];p.q('.caption-en').textContent=cue?.en||'';p.q('.caption-ja').textContent=cue?.ja||'';
    const foreign=Boolean(cue?.language&&cue.language!=='en');
    p.q('.caption-en').hidden=!cue||foreign||!cue.en||!['both','en'].includes(captionMode);
    p.q('.caption-ja').hidden=!cue||captionMode==='off'||(!foreign&&!['both','ja'].includes(captionMode));
    fitCaptions(p);
  }
  function fitCaptions(p){
    const en=p.q('.caption-en'),ja=p.q('.caption-ja'),box=p.q('.captions');en.style.removeProperty('font-size');ja.style.removeProperty('font-size');
    let enSize=parseFloat(getComputedStyle(en).fontSize),jaSize=parseFloat(getComputedStyle(ja).fontSize);
    const budget=feed.clientHeight*(feed.clientHeight<=730?.175:.145);
    for(let i=0;i<12&&box.getBoundingClientRect().height>budget;i++){enSize=Math.max(14,enSize-1);jaSize=Math.max(12,jaSize-1);en.style.fontSize=`${enSize}px`;ja.style.fontSize=`${jaSize}px`;}
  }
  async function start(p){
    if(destroyed||active!==p.index||document.hidden)return;
    if(p.video.ended){p.pass.reset();p.video.currentTime=0;}p.video.muted=muted;p.video.loop=false;p.video.playbackRate=rate;
    try{await p.video.play();}catch(error){if(error.name==='NotAllowedError'&&!muted&&active===p.index){muted=true;p.video.muted=true;try{await p.video.play();}catch{}}}
    if(destroyed||active!==p.index)p.video.pause();
    players.forEach(renderControls);
  }
  function activate(index){
    if(index===active||!players[index]||players[index].section.hidden)return;
    players.forEach((p,i)=>{if(i!==index)p.video.pause();p.section.classList.toggle('is-active',i===index);});
    active=index;const p=players[index];p.userPaused=false;p.pass.reset();p.video.currentTime=0;p.lastCue=-2;renderTime(p);start(p);
    lastSceneByWork.set(selectedWork,p.scene.id);updateLocation();
  }
  function updateLocation(){const url=new URL(location.href);url.searchParams.set('work',selectedWork);if(players[active])url.searchParams.set('scene',players[active].scene.id);else url.searchParams.delete('scene');url.searchParams.delete('song');const entering=location.hash!=='#movie-player';url.hash='movie-player';history[entering?'pushState':'replaceState'](null,'',url);}
  function applyFilter(key,sceneId){
    if(!validWork(key))return;
    clearTimeout(snapTimer);if(scrollFrame)cancelAnimationFrame(scrollFrame);scrollFrame=null;pointerStart=null;
    selectedWork=key;workSelect.value=key;
    const filter=filters.find(filter=>filter.key===key);
    players.forEach(p=>{p.video.pause();p.section.classList.remove('is-active');p.section.hidden=!filter.matches(p.scene)||progress.hidden(p.scene.id);});
    visiblePlayers=players.filter(p=>!p.section.hidden);
    visiblePlayers.forEach((p,i)=>{
      p.q('.scene-index').textContent=`${i+1} / ${visiblePlayers.length}`;
      p.section.setAttribute('aria-label',`会話${i+1} ${p.scene.title}`);
      p.q('.swipe').innerHTML=`${i<visiblePlayers.length-1?icons.up:icons.down}<span class="swipe-text">${i<visiblePlayers.length-1?'上にスワイプして次の会話へ':'下にスワイプして前の会話へ'}</span>`;
    });
    const target=visiblePlayers.find(p=>p.scene.id===(sceneId||lastSceneByWork.get(key)))||visiblePlayers[0];
    active=-1;root.querySelector('.movie-empty')?.remove();if(target){feed.scrollTo({top:visiblePlayers.indexOf(target)*feed.clientHeight,behavior:'instant'});activate(target.index);}else{showCompleted();updateLocation();}
    try{localStorage.setItem('movie-study-work',key);}catch{}
  }
  function refreshProgress(){
    progress.refresh();
    if(visiblePlayers.some(p=>progress.hidden(p.scene.id)))applyFilter(selectedWork,players[active]?.scene.id);
    players.forEach(renderControls);
  }
  listen(window,'storage',event=>{if(event.key===progressApi.key||event.key===`${progressApi.key}:cloud:${deviceId}`)refreshProgress();});
  listen(window,'movie-progress-change',refreshProgress);
  workSelect.addEventListener('change',()=>{applyFilter(workSelect.value);announce(`${filters.find(f=>f.key===selectedWork).label} · ${visiblePlayers.length}本`);});
  function go(index){index=Math.max(0,Math.min(visiblePlayers.length-1,index));feed.scrollTo({top:index*feed.clientHeight,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  listen(feed,'scroll',()=>{clearTimeout(snapTimer);snapTimer=setTimeout(()=>{const top=Math.round(feed.scrollTop/feed.clientHeight)*feed.clientHeight;if(Math.abs(feed.scrollTop-top)>1)feed.scrollTo({top,behavior:'smooth'});},160);if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=null;const p=visiblePlayers[Math.round(feed.scrollTop/feed.clientHeight)];if(p)activate(p.index);});},{passive:true});
  listen(feed,'pointerdown',e=>{if(e.pointerType!=='mouse'||e.target.closest('button,input,a,select'))return;pointerStart={x:e.clientX,y:e.clientY};});
  listen(window,'pointerup',e=>{if(!pointerStart)return;const dx=e.clientX-pointerStart.x,dy=e.clientY-pointerStart.y;pointerStart=null;if(Math.abs(dy)>=60&&Math.abs(dy)>Math.abs(dx)*1.1){suppressClickUntil=Date.now()+400;go(visiblePlayers.indexOf(players[active])+(dy<0?1:-1));}});
  listen(window,'keydown',e=>{if(e.target.matches('input,select,textarea'))return;if(['ArrowDown','PageDown','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();go(visiblePlayers.indexOf(players[active])+(['ArrowDown','PageDown'].includes(e.key)?1:-1));}else if(e.key==='Home'||e.key==='End'){e.preventDefault();go(e.key==='Home'?0:visiblePlayers.length-1);}});
  listen(document,'visibilitychange',()=>{if(active<0)return;const p=players[active];if(document.hidden)p.video.pause();else if(!p.userPaused)start(p);});
  const resizeObserver=new ResizeObserver(()=>{if(active>=0){feed.scrollTo({top:visiblePlayers.indexOf(players[active])*feed.clientHeight,behavior:'instant'});fitCaptions(players[active]);}});resizeObserver.observe(feed);
  players.forEach(renderControls);applyFilter(selectedWork,requestedScene?.id);

    return {destroy(){
      destroyed=true;active=-1;lifetime.abort();resizeObserver.disconnect();
      clearTimeout(noticeTimer);clearTimeout(snapTimer);if(scrollFrame)cancelAnimationFrame(scrollFrame);
      window.PetPlayback?.flush();
      players.forEach(p=>{p.video.pause();p.video.querySelectorAll('source').forEach(s=>s.removeAttribute('src'));p.video.removeAttribute('src');p.video.load();});
      root.remove();
    }};
  }
  function close({keepLocation=false}={}){
    if(!mounted)return;
    mounted.destroy();mounted=null;document.body.classList.remove('movie-study-open');
    if(!keepLocation&&location.hash==='#movie-player'){
      const url=new URL(location.href);url.searchParams.delete('work');url.searchParams.delete('scene');url.hash='movies';history.replaceState(null,'',url);
    }
  }
  function open(options){
    close({keepLocation:true});
    const container=options.container;
    container.className='page-movies';
    container.innerHTML='<div class="movie-study"><div class="work-switcher"><label for="movie-work-select">作品を選ぶ</label><select id="movie-work-select" data-movie-work aria-label="作品を選ぶ"></select></div><main class="feed" aria-label="映画の会話フィード"></main><div class="notice" role="status" aria-live="polite"></div></div>';
    document.body.classList.add('movie-study-open');
    mounted=mount(container.querySelector('.movie-study'),options);
  }
  function library(){
    progress.refresh();
    const scenes=window.MOVIE_SCENES||[];
    const collections=[
      {key:'before',title:'ビフォア三部作',sub:'BEFORE TRILOGY',matches:s=>s.work.startsWith('Before '),description:'出会いから再会、その先へ。二人の自然な会話をじっくりと。'},
      {key:'eternal',title:'エターナル・サンシャイン',sub:'ETERNAL SUNSHINE',matches:s=>s.work==='Eternal Sunshine of the Spotless Mind',description:'出会い、すれ違い、もう一度。記憶をめぐる会話をたどる。'},
      {key:'will',title:'グッド・ウィル・ハンティング',sub:'GOOD WILL HUNTING',matches:s=>s.work==='Good Will Hunting',description:'友情、恋愛、自分の未来。心を開いていく会話から学ぶ。'},
      {key:'truman',title:'トゥルーマン・ショー',sub:'THE TRUMAN SHOW',matches:s=>s.work==='The Truman Show',description:'いつもの日常から、本当の世界へ。疑問と決断を言葉にする。'}
    ];
    const card=(key,title,sub,all,description)=>{
      if(!all.length)return '';
      const list=all.filter(s=>!progress.hidden(s.id));
      const minutes=Math.round(list.reduce((n,s)=>n+s.duration,0)/60);
      const images=key==='before'?['train-invitation','sunset-vienna','midnight-train'].map(id=>all.find(s=>s.id===id)).filter(Boolean):[all[0]];
      return `<article class="movie-collection"><button type="button" class="movie-collection-open" onclick="showMovieStudy('${key}')" aria-label="${escapeHtml(title)}を学ぶ"><span class="movie-collection-art ${key==='before'?'movie-filmstrip':''}">${images.map(s=>`<img src="${escapeHtml(s.poster)}" alt="" loading="lazy">`).join('')}<span class="movie-card-play" aria-hidden="true">▶</span></span><span class="movie-collection-copy"><span class="movie-collection-meta">${escapeHtml(sub)} · ${list.length}会話 · 約${minutes}分</span><strong>${escapeHtml(title)}</strong><span class="movie-collection-description">${escapeHtml(description)}</span><span class="movie-collection-start">会話を見る <span aria-hidden="true">→</span></span></span></button>${key==='before'?'<div class="movie-work-shortcuts" aria-label="ビフォアの作品を選ぶ"><button type="button" onclick="showMovieStudy(\'sunrise\')">サンライズ</button><button type="button" onclick="showMovieStudy(\'sunset\')">サンセット</button><button type="button" onclick="showMovieStudy(\'midnight\')">ミッドナイト</button></div>':''}</article>`;
    };
    return `<section class="home-library movie-library" aria-labelledby="movie-library-title"><div class="section-heading"><div><p class="section-eyebrow">LEARN WITH MOVIES</p><h2 id="movie-library-title">映画の会話で学ぶ</h2></div><span>${scenes.filter(s=>!progress.hidden(s.id)).length}会話</span></div><p class="movie-library-intro">作品を選んで、動画と英日字幕で。最後まで聞くと1回。100回聞いた会話は一覧から自動で削除されます。</p><div class="movie-collection-grid">${collections.map(c=>card(c.key,c.title,c.sub,scenes.filter(c.matches),c.description)).join('')}</div></section>`;
  }
  window.MovieStudy={open,close,library,initialize};
})();
