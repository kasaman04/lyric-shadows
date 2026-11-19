"""Import the curated movie library into Lyric Shadows; runtime is self-contained."""
import argparse
import json
import shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--source',type=Path,default=ROOT.parent/'output/before-sunrise-demo')
parser.add_argument('--include-player',action='store_true',help='Port the standalone player into the native application component')
args=parser.parse_args();source=args.source.resolve()
scenes=json.loads((source/'feed-data.json').read_text(encoding='utf-8'))
published=[]
for scene in scenes:
    sid=scene['id'];assert sid and all(c.isalnum() or c=='-' for c in sid)
    item={k:scene[k] for k in ['id','work','title','description','duration','source','sourceStart','sourceEnd'] if k in scene}
    if scene.get('displayWork'):item['displayWork']=scene['displayWork']
    for key,folder,extension in [('video','media','.mp4'),('poster','posters',Path(scene['poster']).suffix)]:
        original=source/scene[key];target=ROOT/'public/movie-study'/folder/(sid+extension)
        target.parent.mkdir(parents=True,exist_ok=True)
        if not target.exists() or target.stat().st_size!=original.stat().st_size or target.stat().st_mtime_ns!=original.stat().st_mtime_ns:shutil.copy2(original,target)
        item[key]='/movie-study/'+folder+'/'+target.name
    item['captions']=[{k:c[k] for k in ['id','start','end','speechText','language','en','ja']} for c in scene['captions']]
    item['subtitleVerification']='automated; not human listening'
    published.append(item)
(ROOT/'data/movie-scenes.json').write_text(json.dumps(published,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'public/movie-study-data.js').write_text('window.MOVIE_SCENES = '+json.dumps(published,ensure_ascii=False)+';\n',encoding='utf-8')

if args.include_player:
    raw=(source/'feed.js').read_text(encoding='utf-8').strip()
    assert raw.startswith('(() => {') and raw.endswith('})();')
    body=raw[len('(() => {'):-len('})();')]
    replacements={
      'const scenes=window.conversationFeed||[];':'const scenes=window.MOVIE_SCENES||[];',
      "document.getElementById('feed')":"root.querySelector('.feed')",
      "document.getElementById('notice')":"root.querySelector('.notice')",
      "document.getElementById('work-select')":"root.querySelector('[data-movie-work]')",
      "let selectedWork=validWork(params.get('work'))?params.get('work'):":"let selectedWork=validWork(options.work)?options.work:validWork(params.get('work'))?params.get('work'):",
      "if(active!==p.index||document.hidden)return;":"if(destroyed||active!==p.index||document.hidden)return;",
      'if(active!==p.index)p.video.pause();':'if(destroyed||active!==p.index)p.video.pause();',
      'window.addEventListener(':'listen(window,',
      'document.addEventListener(':'listen(document,',
      'feed.addEventListener(':'listen(feed,',
      'video.addEventListener(':'listen(video,',
      "q('.seek').addEventListener(":"listen(q('.seek'),",
      'new ResizeObserver(':'const resizeObserver=new ResizeObserver(',
      '}).observe(feed);':'});resizeObserver.observe(feed);',
      'history.replaceState(null,\'\',url);':"url.searchParams.delete('song');const entering=location.hash!=='#movie-player';url.hash='movie-player';history[entering?'pushState':'replaceState'](null,'',url);",
      '${scene.title}"':'${escapeHtml(scene.title)}"'
    }
    for before,after in replacements.items():
        assert before in body,('player_port_anchor_missing',before)
        body=body.replace(before,after)
    progress_replacements={
      'playsinline preload="none" loop poster=':'playsinline preload="none" poster=',
      'const player={scene,index,section,q,video,lastCue:-2,userPaused:false};':'const player={scene,index,section,q,video,lastCue:-2,userPaused:false,pass:progressApi.createPass()};',
      "p.video.loop=repeat;":"p.video.loop=false;",
      "listen(video,'timeupdate',()=>renderTime(player));":"listen(video,'timeupdate',()=>{samplePass(player);renderTime(player);});listen(video,'ended',()=>finishPass(player));",
      "listen(video,'seeking',()=>renderTime(player));":"listen(video,'seeking',()=>{samplePass(player);renderTime(player);});listen(video,'seeked',()=>samplePass(player));",
      "listen(video,'play',()=>renderControls(player));":"listen(video,'play',()=>{samplePass(player);renderControls(player);});",
      "listen(video,'pause',()=>renderControls(player));":"listen(video,'pause',()=>{samplePass(player);renderControls(player);});",
      "listen(video,'loadedmetadata',()=>renderTime(player));":"listen(video,'volumechange',()=>samplePass(player));listen(video,'loadedmetadata',()=>renderTime(player));",
      "p.section.hidden=!filter.matches(p.scene);":"p.section.hidden=!filter.matches(p.scene)||progress.hidden(p.scene.id);",
      "p.userPaused=false;p.video.currentTime=0;":"p.userPaused=false;p.pass.reset();p.video.currentTime=0;",
      "active=-1;feed.scrollTo({top:visiblePlayers.indexOf(target)*feed.clientHeight,behavior:'instant'});activate(target.index);":"active=-1;root.querySelector('.movie-empty')?.remove();if(target){feed.scrollTo({top:visiblePlayers.indexOf(target)*feed.clientHeight,behavior:'instant'});activate(target.index);}else{showCompleted();updateLocation();}",
      "if(players[active])url.searchParams.set('scene',players[active].scene.id);":"if(players[active])url.searchParams.set('scene',players[active].scene.id);else url.searchParams.delete('scene');",
      "p.video.muted=muted;p.video.loop=false;p.video.playbackRate=rate;":"if(p.video.ended){p.pass.reset();p.video.currentTime=0;}p.video.muted=muted;p.video.loop=false;p.video.playbackRate=rate;",
      "  function renderControls(p){":"  function renderControls(p){\n    p.q('.watch-count').textContent=`聞いた回数 ${progress.count(p.scene.id)} / ${progressApi.limit}回`;",
      '<div class="scene-meta"><p class="work-title">':'<div class="scene-meta"><p class="watch-count" aria-live="polite"></p><p class="work-title">',
      "  workSelect.addEventListener('change',":"  function refreshProgress(){\r\n    progress.refresh();\r\n    if(visiblePlayers.some(p=>progress.hidden(p.scene.id)))applyFilter(selectedWork,players[active]?.scene.id);\r\n    players.forEach(renderControls);\r\n  }\r\n  listen(window,'storage',event=>{if(event.key===progressApi.key||event.key===`${progressApi.key}:cloud:${deviceId}`)refreshProgress();});\r\n  listen(window,'movie-progress-change',refreshProgress);\r\n  workSelect.addEventListener('change',"
    }
    for before,after in progress_replacements.items():
        assert before in body,('progress_port_anchor_missing',before)
        body=body.replace(before,after)
    anchor="q('.work-title').textContent=scene.displayWork||scene.work;"
    assert anchor in body
    body=body.replace(anchor,"q('.topbar').insertAdjacentHTML('afterbegin','<button class=\"movie-back\" type=\"button\" aria-label=\"映画一覧に戻る\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m14 5-7 7 7 7\"/></svg></button>');q('.movie-back').onclick=()=>options.home();\n    "+anchor)
    prefix='''// Native Lyric Shadows movie view. Media and captions are served by this app.
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
'''
    suffix=r'''
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
'''
    (ROOT/'public/movie-study.js').write_text(prefix+body+suffix,encoding='utf-8')

    def scope_css(css):
        out=[];cursor=0
        while cursor<len(css):
            left=css.find('{',cursor)
            if left<0:break
            prelude=css[cursor:left].strip();depth=1;right=left+1
            while depth:
                if css[right]=='{':depth+=1
                elif css[right]=='}':depth-=1
                right+=1
            content=css[left+1:right-1]
            if prelude.startswith('@'):out.append(prelude+'{'+scope_css(content)+'}')
            else:
                selectors=[('.movie-study' if s.strip() in [':root','html','body'] else '.movie-study '+s.strip()) for s in prelude.split(',')]
                out.append(','.join(selectors)+'{'+content+'}')
            cursor=right
        return '\n'.join(out)
    css=scope_css((source/'feed.css').read_text(encoding='utf-8'))
    css+='''
body.movie-study-open{overflow:hidden;background:#100f11}
body.movie-study-open::before{display:none}
.movie-study .watch-count{font-size:11px;color:#d1d0d3;margin:0 0 5px}
.movie-study .movie-empty{min-height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:90px 22px;color:white;font-size:14px}
.movie-study .movie-empty button{border:1px solid #777;border-radius:24px;padding:12px 24px;margin-top:20px;color:white;background:#333}
body.movie-study-open .pet-listening-badge{display:none!important}
.page-movies{min-height:100dvh;padding:0}
.movie-study{position:fixed;inset:0;z-index:10;width:100%;height:100dvh}
.movie-study .work-switcher{left:calc(50% + 10px);width:calc(min(480px,56.25dvh,100vw) - 168px)}
.movie-study .work-switcher select{font-size:12px}
.movie-study .scene-index{left:31px}
.movie-study .movie-back{position:absolute;left:-5px;top:0;display:grid;place-items:center;min-width:32px;min-height:38px;padding:0;background:none;border:0;color:inherit}
.movie-study .movie-back svg{width:22px;height:22px}
.movie-library{padding-bottom:60px;scroll-margin-top:20px}
.movie-library-intro{color:var(--ink-soft);font-size:13px;line-height:1.8;margin:-4px 0 22px}
.movie-collection-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
.movie-collection{overflow:hidden;border:1px solid var(--line);background:var(--paper-white);border-radius:18px}
.movie-collection-open{display:block;text-align:left;padding:0;width:100%;border:0;background:none;color:var(--ink);cursor:pointer}
.movie-collection-art{position:relative;display:flex;width:100%;aspect-ratio:16/9;background:#28232a;overflow:hidden}
.movie-collection-art img{width:100%;height:100%;object-fit:cover;display:block;min-width:0}
.movie-filmstrip img{width:33.333%}
.movie-card-play{position:absolute;right:16px;bottom:14px;display:grid;place-items:center;width:37px;height:37px;background:#161219ad;color:#fff;border:1px solid #ffffff75;border-radius:50%;font-size:13px}
.movie-collection-copy{display:flex;flex-direction:column;align-items:flex-start;padding:20px 22px 18px;gap:9px}
.movie-collection-meta{font-size:10px;letter-spacing:.04em;color:var(--sage)}
.movie-collection-copy strong{font:700 21px/1.5 var(--serif)}
.movie-collection-description{font-size:12px;line-height:1.8;color:var(--ink-soft)}
.movie-collection-start{margin-top:4px;display:flex;gap:16px;align-items:center;color:var(--coral-dark);font-size:12px;font-weight:600}
.movie-work-shortcuts{display:flex;flex-wrap:wrap;gap:7px;padding:0 22px 20px}
.movie-work-shortcuts button{border:1px solid var(--line);border-radius:20px;padding:6px 10px;background:#f7f4ee;color:var(--ink-soft);font-size:11px;cursor:pointer}
@media(max-width:650px){.movie-collection-grid{grid-template-columns:1fr;gap:20px}.movie-collection-copy strong{font-size:20px}}
@media(max-width:420px){.page-home .home-tabs{gap:3px}.page-home .home-tab{font-size:10px;padding-inline:3px;gap:3px}}
'''
    (ROOT/'public/movie-study.css').write_text(css,encoding='utf-8')
print(json.dumps(dict(scenes=len(published),minutes=round(sum(s['duration'] for s in published)/60,1),media='public/movie-study',player=args.include_player),ensure_ascii=False))
