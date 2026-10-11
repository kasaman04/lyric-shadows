(() => {
  'use strict';
  const rules = window.PetRules, art = window.PetArt;
  let device = '', save = null, overlay = null, mode = 'room', selected = null, sheet = '', busy = false;
  let flushTask = null, loadTask = null, queued = 0, networkError = '', designStatus = '', designKey = '', previousFocus;
  let designTimer = null;
  let careReaction = null;
  let careSeconds = 300, chosenElement = 'fire', framePlayer = null, farewellTimer = null;
  let store, cacheKey, offset = 0, collector = null, writing = Promise.resolve();
  const uid = () => crypto.randomUUID();
  const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const now = () => Date.now() + offset;
  function minutes(seconds) { return seconds < 60 ? `${Math.max(0, Math.ceil(seconds))}秒` : seconds < 3600 ? `${Math.floor(seconds / 60)}分` : `${Math.floor(seconds / 3600)}時間${Math.floor(seconds % 3600 / 60) ? Math.floor(seconds % 3600 / 60) + '分' : ''}`; }
  function remaining(seconds) { return seconds < 60 ? `${Math.ceil(seconds)}秒` : minutes(Math.ceil(seconds / 60) * 60); }
  function current() {
    const pet = save?.pets.at(-1);
    return pet && !rules.ended(pet) && now() >= pet.lastFedAt + 72 * 3600000 ? { ...pet, diedAt: pet.lastFedAt + 72 * 3600000 } : pet;
  }
  function portrait(pet, form, { still = false, dead = false } = {}) {
    const safe=url=>url==='/pet-images/baby-v2.png'||/^\/pet-images\/starter-(fire|water|grass|thunder|ice|wind|earth|poison|light|dark)-v1\.png$/.test(url||'')||/^\/api\/pet-art\/[a-f0-9]{64}\.png$/.test(url||'');
    if(still && form.level>=2 && !safe(form.imageUrl))return '<div class="pet-portrait pet-image-placeholder"><span>画像を準備中</span></div>';
    const source=safe(form.imageUrl)?form:[...pet.forms].reverse().find(f=>f.level<=form.level&&safe(f.imageUrl));
    const url=source?.imageUrl||rules.element(pet.element)?.imageUrl||'/pet-images/baby-v2.png';
    return '<div class="pet-portrait '+(still?'pet-still':'')+' '+(dead?'pet-dead':'')+' '+(form.level===1?'pet-baby':'')+'"><div class="pet-character-visual"><img class="pet-image-motion" src="'+esc(url)+'" alt="'+esc(source?.name||pet.name)+'" loading="'+(still?'lazy':'eager')+'" draggable="false"></div></div>';
  }
  function needsDesign(pet) {
    return pet && !pet.needsStarter && (pet.forms.some(f=>f.level>=2&&!f.imageUrl)||(!rules.ended(pet)&&pet.id===current()?.id&&!pet.forms.at(-1).motion));
  }
  function designNote(pet) {
    if(!needsDesign(pet))return '';
    const failed=pet.forms.some(f=>f.imageErrorAt)||pet.forms.at(-1).motionErrorAt||designStatus==='unavailable';
    return '<p class="pet-design-note" role="status">'+(failed?'姿・動きの準備を再開できます。 <button data-action="design-retry">もう一度試す</button>':'新しい姿・動きを準備中…')+'</p>';
  }
  function local(key, value) { try { if (value === undefined) return JSON.parse(localStorage.getItem(key) || 'null'); localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function openQueue() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('lyricShadowsPet', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('events', { keyPath: 'id' });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        function operation(method, value) {
          return new Promise((yes, no) => {
            const tx = db.transaction('events', method === 'getAll' ? 'readonly' : 'readwrite');
            const object = tx.objectStore('events'); let request;
            if (method === 'remove') for (const id of value) object.delete(id);
            else if (method === 'ack') for (const event of value) {
              const item = object.get(event.id);
              item.onsuccess = () => {
                const stored = item.result;
                if (!stored) return;
                if (stored.end <= event.end) object.delete(event.id);
                else object.put({ ...stored, start: Math.max(stored.start, event.end) });
              };
            } else request = object[method](value);
            tx.oncomplete = () => yes(request?.result); tx.onerror = () => no(tx.error); tx.onabort = () => no(tx.error);
          });
        }
        resolve({ put: event => operation('put', event), all: async () => (await operation('getAll')).filter(e => e.device === device), remove: ids => operation('remove', ids), ack: events => operation('ack', events) });
      };
    });
  }
  async function fallbackQueue() {
    const prefix = 'petQueue:' + device + ':';
    // One key per immutable event, so tabs never overwrite one another's pending time.
    return { put: async event => localStorage.setItem(prefix + event.id, JSON.stringify(event)),
      all: async () => Object.keys(localStorage).filter(k => k.startsWith(prefix)).map(k => JSON.parse(localStorage.getItem(k))),
      remove: async ids => ids.forEach(id => localStorage.removeItem(prefix + id)),
      ack: async events => events.forEach(event => {
        const key = prefix + event.id, stored = JSON.parse(localStorage.getItem(key) || 'null');
        if (!stored) return;
        if (stored.end <= event.end) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify({ ...stored, start: Math.max(stored.start, event.end) }));
      }) };
  }
  function record(event) {
    if (!store) return;
    if (collector && event.petId === collector.petId && event.start <= collector.end + 20 && event.end - collector.start <= 30000) collector.end = Math.max(collector.end, event.end);
    else collector = { ...event, device, id: uid() };
    const copy = { ...collector };
    writing = writing.catch(() => {}).then(() => store.put(copy)).catch(() => { networkError = 'この端末に再生時間を保存できません。空き容量を確認してください。'; });
    queued += (event.end - event.start) / 1000;
    updateBadge();
  }
  async function request(suffix = '', body) {
    const response = await fetch('/api/pet/' + encodeURIComponent(device) + suffix, {
      method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(12000), cache: 'no-store'
    });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.error || '保存できませんでした。'), { status: response.status });
    return result;
  }
  function accept(value) {
    if (save && value.revision < save.revision) return;
    save = value; offset = value.serverNow - Date.now(); local(cacheKey, save);
    updateBadge(); if (overlay) render();
  }
  async function load() {
    if (loadTask) return loadTask;
    loadTask = (async () => {
      try { accept(await request()); networkError = ''; }
      catch (e) { networkError = e.status ? e.message : '接続待ちです。再生時間は端末に保存して、接続後に送ります。'; if (overlay) render(); }
      finally { loadTask = null; }
    })();
    return loadTask;
  }
  async function flush() {
    if (flushTask || !store) return flushTask;
    flushTask = (async () => {
      window.PetPlayback.flush(); collector = null; await writing;
      try {
        let events = await store.all();
        queued = events.reduce((sum, e) => sum + (e.end - e.start) / 1000, 0);
        const expired = events.filter(e => e.start < Date.now() - 7 * 86400000);
        if (expired.length) { await store.remove(expired.map(e => e.id)); networkError = '7日以上前の未同期記録は送信できませんでした。'; }
        events = events.filter(e => !expired.includes(e)).sort((a, b) => a.start - b.start);
        while (events.length) {
          const batch = events.slice(0, 200);
          const value = await request('/listen', { events: batch.map(({ start, end, petId }) => ({ start, end, petId })) });
          // Playback may extend a record while its earlier portion is in flight.
          // Acknowledge only the portion sent, preserving new seconds in every tab.
          for (const event of batch) if (collector?.id === event.id) collector.start = Math.max(collector.start, event.end);
          await store.ack(batch); accept(value); events = events.slice(200);
        }
        queued = (await store.all()).reduce((sum, e) => sum + (e.end - e.start) / 1000, 0);
        networkError = ''; updateBadge(); if (overlay) render();
      } catch (e) { networkError = e.status ? e.message : '接続待ちです。聴いた時間はこの端末に残っています。'; if (overlay) render(); }
      finally { flushTask = null; }
    })();
    return flushTask;
  }
  function updateBadge() {
    const pet = current();
    document.querySelectorAll('.pet-home-entry span').forEach(el => { el.textContent = pet?.diedAt ? '図鑑に残りました' : pet && rules.hunger(pet, now()) < 34 ? 'お腹が空いてます' : '育成'; });
    const badge = document.getElementById('petListeningBadge');
    if (badge) badge.innerHTML = `<span aria-hidden="true">🌱</span> ${save ? `きょう ${minutes(save.daily[rules.dayKey(now())] || 0)}` : '育成'}${queued >= 60 ? ' · 未同期' : ''}`;
  }
  function close() {
    careReaction?.stop(); careReaction = null; framePlayer?.stop(); framePlayer = null; clearTimeout(farewellTimer);
    overlay?.remove(); overlay = null; document.body.classList.remove('pet-open');
    document.getElementById('app').inert = false; previousFocus?.focus();
  }
  function open() {
    if (!overlay) {
      previousFocus = document.activeElement;
      overlay = document.createElement('section'); overlay.id = 'petOverlay'; overlay.className = 'pet-overlay';
      overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', '相棒の育成');
      overlay.addEventListener('click', handle); overlay.addEventListener('keydown', keys);
      document.body.appendChild(overlay); document.body.classList.add('pet-open'); document.getElementById('app').inert = true;
    }
    mode = 'room'; sheet = ''; render(); overlay.querySelector('button')?.focus(); flush().then(load);
  }
  function keys(event) {
    if (event.key === 'Escape') { if (sheet) { sheet = ''; render(); } else if (mode !== 'room') { mode = 'room'; render(); } else close(); }
    if (event.key === 'Tab') {
      const scope = sheet ? overlay.querySelector('.pet-sheet') : overlay;
      const buttons = [...scope.querySelectorAll('button:not(:disabled),a[href]')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && (document.activeElement === first || !scope.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !scope.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    }
  }
  function header() {
    const bookIcon = '<svg viewBox="0 0 32 38" aria-hidden="true"><path d="M7 3h19v28H7q-4 0-4-4V7q0-4 4-4Z" fill="#87a47c" stroke="#3d6048" stroke-width="1.6" stroke-linejoin="round"/><path d="M7 3v24" fill="none" stroke="#3d6048" stroke-width="1.6"/><path d="M7 27h19v6H7q-4 0-4-3t4-3Z" fill="#faf1d8" stroke="#3d6048" stroke-width="1.6"/><path d="M8 30h16" stroke="#bcbea3"/><path d="M17 20v-6" stroke="#eef2cf" stroke-width="1.8" stroke-linecap="round"/><path d="M17 15q-7 0-6-5 7 0 6 5Zm0 0q0-7 6-6 0 6-6 6Z" fill="#eef2cf"/><path d="M21 27v9l-2-2-2 2v-9" fill="#d8b277" stroke="#9d865d" stroke-width=".8"/></svg>';
    return `<header class="pet-header"><button data-action="${mode === 'room' ? 'close' : 'back'}" class="pet-icon-button" aria-label="${mode === 'room' ? '学習に戻る' : '育成に戻る'}">←</button><div><span class="pet-eyebrow">LISTEN & GROW</span><strong>${mode === 'book' ? '歴代の図鑑' : mode === 'detail' ? 'この子の記録' : mode === 'choose' || !current() || current()?.needsStarter ? '相棒を選ぶ' : '相棒のお部屋'}</strong></div><button data-action="book" class="pet-icon-button pet-book-button" aria-label="歴代の図鑑 ${save?.pets.length || 0}匹">${bookIcon}<span>図鑑</span><small>${save?.pets.length || 0}</small></button></header>`;
  }
  function render() {
    if (!overlay) return;
    if (careReaction && mode === 'room' && !sheet && careReaction.petId === current()?.id) return;
    careReaction?.stop(); careReaction = null;
    framePlayer?.stop(); framePlayer = null;
    const active = document.activeElement?.dataset.action;
    let content = '';
    if (!save) content = `<div class="pet-empty"><p>${esc(networkError || 'この子のお部屋を準備しています…')}</p><button data-action="retry" class="pet-primary">再読み込み</button></div>`;
    else if (mode === 'book') content = book();
    else if (mode === 'detail') content = detail();
    else if (mode === 'choose' || !current() || current().needsStarter) content = selection();
    else content = room();
    overlay.innerHTML = `<div class="pet-shell">${header()}${content}${networkError && save ? `<p class="pet-sync" role="status">${esc(networkError)} <button data-action="retry">再接続</button></p>` : ''}${sheet ? sheetContent() : ''}<div id="petToast" class="pet-toast" role="status"></div></div>`;
    if (active) overlay.querySelector(`[data-action="${active}"]`)?.focus({ preventScroll: true });
    const pet = current();
    if (mode === 'room' && pet && !pet.needsStarter && !rules.ended(pet)) framePlayer = window.PetFrames?.create(overlay.querySelector('.pet-character-visual'), pet.forms.at(-1).motion, rules.hunger(pet,now()) < 34 ? 'weak' : rules.hunger(pet,now()) < 67 ? 'hungry' : 'idle');
    if (save) maybeDesign();
  }
  function selection() {
    const chosen=rules.element(chosenElement)||rules.elements[0];
    return '<main class="pet-selection"><h1>最初の相棒を選ぼう</h1><p>10の属性。どの子と、英語を聴こう？</p><div class="pet-starter-grid">'+rules.elements.map(e=>'<button class="pet-starter-card" data-action="choose-element" data-element="'+e.id+'" aria-pressed="'+(e.id===chosen.id)+'" style="--element-color:'+e.color+'"><span class="pet-element-tag">'+e.label+'</span><img src="'+e.imageUrl+'" alt="'+e.name+'" loading="lazy"><strong>'+e.name+'</strong></button>').join('')+'</div><div class="pet-selection-footer"><p><b>'+chosen.name+'</b><span>'+chosen.description+'</span></p><button class="pet-primary" data-action="select" '+(busy?'disabled':'')+'>この子と始める</button></div></main>';
  }
  function room() {
    const pet=current(),p=rules.progress(rules.growth(pet)),form=pet.forms.at(-1);
    const hungry=rules.hunger(pet,now()),dead=!!pet.diedAt,departed=!!pet.departedAt,ended=dead||departed,left=Math.max(0,pet.lastFedAt+72*3600000-now());
    const danger=hungry<34,days=Math.floor(((pet.diedAt||pet.departedAt||now())-pet.bornAt)/86400000)+1;
    const message=departed?'またね。いっしょに聴いてくれて、ありがとう。':dead?'この子は、図鑑でずっと一緒。':p.level===10?'大きくなったよ。旅に出る準備ができた！':hungry<34?'力が出ないよ。ごはんがほしい…':hungry<67?'お腹が空いてます。':'きょうも、いっしょに聴こう。';
    return '<main class="pet-room-page"><div class="pet-name-row"><h1>'+esc(form.name||pet.name)+'</h1><span>'+rules.element(pet.element).label+' · '+days+'日目</span></div><div class="pet-level-row"><b>Lv.'+p.level+' <small>/ 10</small></b><span>'+(p.level===10?(departed?'旅立った相棒':dead?'成長の記録':'最終進化 · 旅立ちの準備ができました'):'次の進化まで お世話 '+remaining(p.required-p.earned))+'</span><button data-action="rules" class="pet-info-button" aria-label="育成のルール">?</button></div><div class="pet-progress" role="progressbar" aria-label="次の進化まで" aria-valuenow="'+Math.round(p.level===10?100:p.earned/p.required*100)+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+(p.level===10?100:p.earned/p.required*100)+'%"></i></div><div class="pet-stats"><span>体格 <b>'+pet.stats.body+'</b></span><span>パワー <b>'+pet.stats.power+'</b></span><span>かしこさ <b>'+pet.stats.brain+'</b></span></div><div class="pet-habitat '+(danger&&!ended?'pet-danger':'')+' '+(ended?'pet-ended':'')+'">'+art.room(p.level)+'<p class="pet-speech">'+message+'</p><button data-action="'+(ended?'detail-current':'care')+'" class="pet-character-button" aria-label="'+(ended?'成長の記録を見る':'キャラをタップしてお世話')+'">'+portrait(pet,form,{dead})+'</button>'+(!ended?'<span class="pet-tap-hint">タップでお世話</span><div class="pet-hunger"><span>おなか</span><div class="pet-meter"><i style="width:'+hungry+'%;background:'+(danger?'#ba7764':'#7eaf90')+'"></i></div><b>'+Math.round(hungry)+'%</b></div>':'<div class="pet-hunger pet-ended-caption">'+(departed?'旅立った相棒':'大切な思い出')+'</div>')+'</div>'+designNote(pet)+'<p class="pet-deadline '+(danger&&!ended?'is-danger':'')+'">'+(ended?'聴いた時間も、この子の成長も残っています。':'ごはんの期限まで '+remaining(left/1000))+'</p><button data-action="'+(ended?'restart':p.level===10?'departure':'listen')+'" class="pet-primary" '+(busy?'disabled':'')+'>'+(ended?'次の相棒を選ぶ':p.level===10?'旅立ちを見送る':'♫ 英語を聴く')+'</button><div class="pet-bank-row"><span>使える時間 <b>'+minutes(save.bankSeconds)+'</b>'+(queued>1?' <small>＋'+minutes(queued)+' 同期待ち</small>':'')+'</span><button data-action="records">きょう '+minutes(save.daily[rules.dayKey(now())]||0)+' ↗</button></div></main>';
  }
  function book() {
    return '<main class="pet-book"><p class="pet-book-intro">一緒に聴いた時間は、ここに残る。<span>'+save.pets.length+'匹の記録 · '+minutes(save.totalSeconds)+'</span></p><div class="pet-history-grid">'+[...save.pets].reverse().map(pet=>{const form=pet.forms.at(-1);return '<button class="pet-history-card" data-action="individual" data-id="'+pet.id+'">'+portrait(pet,form,{dead:!!pet.diedAt,still:true})+'<strong>'+esc(form.name||pet.name)+'</strong><span>Lv.'+rules.progress(rules.growth(pet)).level+' · '+(pet.departedAt?'旅立ち':pet.diedAt?'思い出':'育成中')+'</span><small>'+new Date(pet.bornAt).toLocaleDateString('ja-JP',{timeZone:'Asia/Tokyo'})+' 〜</small></button>';}).join('')+'</div>'+(!save.pets.length?'<p>最初の相棒との記録が、ここに増えていきます。</p>':'')+'<button data-action="species" class="pet-text-button">属性と進化の図鑑 · '+new Set(save.pets.flatMap(p=>p.forms.map(f=>f.species))).size+' / 100</button></main>';
  }
  function detail() {
    const pet=save.pets.find(p=>p.id===selected)||current();if(!pet)return book();const last=pet.forms.at(-1);
    const timeline=forms=>'<div class="pet-timeline">'+forms.map(form=>'<div><div class="pet-form-image">'+portrait(pet,form,{still:true})+'</div><b>Lv.'+form.level+'</b><span>'+esc(form.name||pet.name)+'</span><small>体格 '+form.stats.body+' / 力 '+form.stats.power+' / 知 '+form.stats.brain+'</small></div>').join('')+'</div>';
    return '<main class="pet-detail"><div class="pet-detail-portrait">'+portrait(pet,last,{dead:!!pet.diedAt,still:true})+'</div>'+designNote(pet)+'<h1>'+esc(last.name||pet.name)+'</h1><p>Lv.'+rules.progress(rules.growth(pet)).level+' · 一緒に '+minutes(pet.seconds)+'<br>'+Math.floor(((pet.diedAt||pet.departedAt||now())-pet.bornAt)/86400000+1)+'日間 · '+(pet.departedAt?'旅立った日 '+new Date(pet.departedAt).toLocaleDateString('ja-JP'):pet.diedAt?'図鑑に残った日 '+new Date(pet.diedAt).toLocaleDateString('ja-JP'):'育成中')+'</p><h2>成長のあしあと</h2>'+timeline(pet.forms)+(pet.legacyForms?.length?'<h2>以前の成長記録</h2>'+timeline(pet.legacyForms):'')+'</main>';
  }
  function sheetContent() {
    const pet = current(); let content = '';
    if (sheet === 'care') {
      const gain = careSeconds / 300, before = rules.progress(rules.growth(pet)), after = rules.progress(rules.growth(pet) + careSeconds);
      const preview = save.bankSeconds < careSeconds ? `あと ${remaining(careSeconds - save.bankSeconds)}聴くと、お世話できます` : before.level === 10 ? '最終レベル · お世話で数値を育てよう' : `成長 +${minutes(careSeconds)}${after.level > before.level ? ` · Lv.${before.level} → ${after.level}` : ` · 次のレベルまで ${remaining(after.required - after.earned)}`}`;
      content = `<p class="pet-eyebrow">TIME TO CARE</p><h2 id="petSheetTitle">何をしてあげる？</h2><p class="pet-sheet-sub">使える時間 <b>${minutes(save.bankSeconds)}</b></p><div class="pet-care-amounts" role="group" aria-label="お世話に使う時間">${rules.careAmounts.map(seconds => `<button data-action="care-amount" data-seconds="${seconds}" aria-pressed="${seconds === careSeconds}" ${busy || save.bankSeconds < seconds ? 'disabled' : ''}>${minutes(seconds)}</button>`).join('')}</div><p class="pet-care-preview">${preview}</p><div class="pet-care-list">${[['food','◒','ごはん',`おなか全回復・体格 +${gain}`],['power','✦','パワー',`大きな手や腕に育つ · +${gain}`],['brain','✿','かしこさ',`芽や不思議な形に育つ · +${gain}`]].map(([type,icon,title,desc]) => `<button class="pet-care-row" data-action="spend" data-type="${type}" ${busy || rules.ended(pet) || save.bankSeconds < careSeconds ? 'disabled' : ''}><span class="pet-care-icon ${type}">${icon}</span><span><b>${title}</b><small>${desc}</small></span><strong>${busy ? '…' : minutes(careSeconds) + '使う'}</strong></button>`).join('')}</div><p class="pet-sheet-note">お世話に使った時間でレベルが上がる。<br>残った時間は、明日にも持ち越せる。</p>`;
    }
    if (sheet === 'rules') content = `<h2 id="petSheetTitle">この子との暮らし</h2><p>英語を聴くと、使える時間が貯まります。その時間をお世話に使うと成長します。5分・30分・1時間から選べて、5分ごとに選んだ数値が1増えます。例えば30分を貯めて5分のお世話を6回すると、Lv.1からLv.2になります。ごはんをあげるとおなかが100%になり、期限が72時間に戻ります。24時間でお腹が空き、48時間で弱り、72時間ごはんがないと育成が終わります。アプリを閉じている間も時間は進みます。</p><p>レベルが上がるほどお部屋は荒廃します。体格・パワー・かしこさの育て方で進化が分岐。1レベルごとに姿が進化し、10段階すべてを図鑑に残します。Lv.10で旅立ちを見送ったら、次の相棒を10属性から選べます。使える時間と学習記録は引き継ぎます。</p><table class="pet-rules-table"><caption>次の1レベルに必要なお世話の時間</caption>${rules.bands.map((min, i) => `<tr><th>Lv.${i + 1} → ${i + 2}</th><td>${minutes(min * 60)}</td></tr>`).join('')}</table><p class="pet-sheet-note">端末ごとに保存。ブラウザのデータを消すと、この端末の図鑑に戻れなくなります。外部YouTubeの埋め込み再生は集計に含みません。</p>`;
    if (sheet === 'records') {
      const days = Array.from({ length: 7 }, (_, i) => rules.dayKey(now() - (6 - i) * 86400000));
      const max = Math.max(600, ...days.map(day => save.daily[day] || 0));
      content = `<h2 id="petSheetTitle">聴いた時間</h2><p class="pet-sheet-sub">これまで ${minutes(save.totalSeconds)} · 日本時間の日付で集計</p><div class="pet-day-chart">${days.map(day => `<div><span>${minutes(save.daily[day] || 0)}</span><div><i style="height:${Math.max(2, (save.daily[day] || 0) / max * 100)}%"></i></div><small>${day.slice(5).replace('-', '/')}</small></div>`).join('')}</div><p class="pet-sheet-note">過去の記録は毎日残ります。使える時間は日付が変わっても減りません。</p>`;
    }
    if (sheet === 'species') {
      const unlocked = new Set(save.pets.flatMap(p => p.forms.map(f => f.species)));
      const found = new Map();
      for (const p of save.pets) for (const f of p.forms) if (!found.has(f.species) || f.imageUrl) found.set(f.species, { pet: p, form: f });
      content = `<h2 id="petSheetTitle">10属性 × 10段階の図鑑</h2><p class="pet-sheet-sub">属性ごとに育てる。お世話の数値で、その子だけの姿に育つ。</p><div class="pet-species-grid">${rules.catalog.map(c => { const saved = found.get(c.id); return `<div><div>${saved ? portrait(saved.pet, saved.form, { still: true }) : '<span>?</span>'}</div><b>No.${String(c.id).padStart(3, '0')}</b><small>${unlocked.has(c.id) ? esc(c.name) : '未発見'}</small></div>`; }).join('')}</div>`;
    }
    if(sheet === 'departure') content='<h2 id="petSheetTitle">そろそろ、旅に出よう。</h2><div class="pet-departure-portrait">'+portrait(pet,pet.forms.at(-1),{still:true})+'</div><p class="pet-sheet-sub">Lv.10まで育ててくれて、ありがとう。<br>この子と過ごした時間と、進化した姿は図鑑に残ります。</p><button data-action="depart" class="pet-primary" '+(busy?'disabled':'')+'>いってらっしゃい</button><p class="pet-sheet-note">使える時間 '+minutes(save.bankSeconds)+' は次の相棒へ。</p>';
    return `<div class="pet-sheet-backdrop" data-action="dismiss"><section class="pet-sheet" role="dialog" aria-modal="true" aria-labelledby="petSheetTitle"><div class="pet-sheet-handle"></div><button class="pet-sheet-close" data-action="dismiss" aria-label="閉じる">×</button>${content}</section></div>`;
  }
  function showSheet(type) { if (type === 'care') careSeconds = 300; sheet = type; render(); overlay.querySelector('.pet-sheet button:not(:disabled)')?.focus(); }
  function toast(text) { const el = document.getElementById('petToast'); if (!el) return; el.textContent = text; el.classList.add('visible'); setTimeout(() => el.classList.remove('visible'), 3000); }
  async function care(type) {
    if (busy) return;
    busy = true; render();
    const petId = current().id;
    const key = 'petAction:' + device + ':' + petId + ':' + type;
    const pending = local(key), requestId = (typeof pending === 'string' ? pending : pending?.requestId) || uid();
    const seconds = typeof pending === 'string' ? 300 : pending?.seconds || careSeconds;
    local(key, { requestId, seconds });
    const beforeHunger = rules.hunger(current(), now());
    const beforeLevel = rules.progress(rules.growth(current())).level;
    let notice = '', reward = '', succeeded = false;
    try {
      await flush();
      const value = await request('/care', { type, petId, requestId, seconds });
      local(key, null); accept(value); sheet = ''; render();
      succeeded = true;
      reward = `${{ food: 'おなか 100% · 体格', power: 'パワー', brain: 'かしこさ' }[type]} +${seconds / 300}`;
      const afterLevel = rules.progress(rules.growth(current())).level;
      if (type !== 'restart' && afterLevel > beforeLevel) reward += ` · Lv.${afterLevel}！`;
      notice = type === 'restart' ? '新しい子を迎えました。' : reward;
    } catch (e) { if (e.status && e.status < 500) local(key, null); notice = e.status ? e.message : '操作を確認できませんでした。もう一度押すと同じ操作を確認します。'; }
    finally {
      busy = false; render();
      if (succeeded && type !== 'restart' && overlay && mode === 'room' && !sheet && current()?.id === petId) {
        const reaction = window.PetReactions?.play({ type, framePlayer, habitat: overlay.querySelector('.pet-habitat'), beforeHunger, reward,
          onEnd: () => { careReaction = null; render(); } });
        if (reaction) careReaction = { ...reaction, petId };
        else toast(notice);
      } else toast(notice);
    }
  }
  async function lifecycle(type) {
    if(busy)return;busy=true;render();
    const petId=current()?.id,key='petLifecycle:'+device+':'+type+':'+(petId||'first')+':'+(type==='select'?chosenElement:'');
    const requestId=local(key)||uid();local(key,requestId);
    try {
      await flush();const value=await request('/care',{type,petId,element:chosenElement,requestId});local(key,null);sheet='';mode='room';designKey='';accept(value);if(overlay)overlay.scrollTop=0;
      if(type==='depart'&&overlay){overlay.querySelector('.pet-habitat')?.classList.add('pet-farewell');farewellTimer=setTimeout(()=>{if(overlay)render();},2600);toast('いってらっしゃい。図鑑でいつでも会えるよ。');}
      else toast('新しい相棒を迎えました。');
    }catch(e){if(e.status&&e.status<500)local(key,null);toast(e.status?e.message:'操作を確認できませんでした。もう一度押すと同じ操作を確認します。');}
    finally{busy=false;if(type!=='depart')render();}
  }
  async function maybeDesign(retry = false) {
    const pet = mode === 'detail' ? save.pets.find(p => p.id === selected) || current() : current();
    if(!pet || pet.needsStarter || mode === 'choose') return;
    const key = pet.id + ':' + pet.forms.at(-1).level;
    if (!needsDesign(pet) || (!retry && designKey === key)) return;
    designKey = key; designStatus = 'generating'; clearTimeout(designTimer);
    let attempts = 0;
    async function check(first) {
      if (designKey !== key) return;
      if (!overlay || ++attempts > 720) { designKey = ''; return; }
      try {
        const result = await request('/design', { petId: pet.id, retry: first && retry });
        if (designKey !== key) return;
        designStatus = result.status;
        await load(); if (overlay) render();
        if (result.status === 'generating') designTimer = setTimeout(() => check(false), 5000);
      } catch { designStatus = 'unavailable'; if (overlay) render(); }
    }
    await check(true);
  }
  function handle(event) {
    const button = event.target.closest('[data-action]'); if (!button || !overlay.contains(button)) return;
    if (button.classList.contains('pet-sheet-backdrop') && event.target !== button) return;
    const action = button.dataset.action;
    if (action === 'close' || action === 'listen') close();
    else if (action === 'back') { mode = 'room'; render(); }
    else if (action === 'book') { mode = 'book'; sheet = ''; render(); }
    else if (['care','rules','records','species'].includes(action)) showSheet(action);
    else if (action === 'dismiss') { sheet = ''; render(); overlay.querySelector('.pet-character-button')?.focus(); }
    else if (action === 'spend') care(button.dataset.type);
    else if (action === 'care-amount' && !busy) { careSeconds = Number(button.dataset.seconds); render(); overlay.querySelector(`[data-action="care-amount"][data-seconds="${careSeconds}"]`)?.focus({ preventScroll: true }); }
    else if (action === 'restart') { mode='choose';sheet='';render(); }
    else if (action === 'choose-element' && !busy) { chosenElement=button.dataset.element;render(); }
    else if (action === 'select') lifecycle('select');
    else if (action === 'departure') showSheet('departure');
    else if (action === 'depart') lifecycle('depart');
    else if (action === 'retry') flush().then(load);
    else if (action === 'design-retry') maybeDesign(true);
    else if (action === 'individual' || action === 'detail-current') { selected = button.dataset.id || current().id; mode = 'detail'; render(); }
    if(['back','book','restart','individual','detail-current'].includes(action))overlay.scrollTop=0;
  }
  function positionListeningBadge(badge) {
    const app = document.getElementById('app');
    const players = new Set();
    let frame = 0;
    function update() {
      frame = 0;
      const currentPlayers = new Set(app.querySelectorAll('.play-controls, .song-audio-player'));
      for (const player of players) if (!currentPlayers.has(player)) { sizes.unobserve(player); players.delete(player); }
      let clearance = 0;
      for (const player of currentPlayers) {
        if (!players.has(player)) { players.add(player); sizes.observe(player); }
        const rect = player.getBoundingClientRect();
        if (rect.width && rect.height && getComputedStyle(player).position === 'fixed') {
          clearance = Math.max(clearance, window.innerHeight - rect.top + 12);
        }
      }
      badge.style.setProperty('--pet-player-clearance', clearance + 'px');
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    const sizes = new ResizeObserver(schedule);
    new MutationObserver(schedule).observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    update();
  }
  async function initialize(id) {
    device = id; cacheKey = 'petState:' + id; save = local(cacheKey);
    try { store = await openQueue(); } catch { store = await fallbackQueue(); }
    await load();
    window.PetPlayback.configure({ deviceId: device, petId: () => current()?.id, onCredit: record });
    const badge = document.createElement('button'); badge.id = 'petListeningBadge'; badge.className = 'pet-listening-badge'; badge.setAttribute('aria-label', '聴いた時間と育成を見る'); badge.addEventListener('click', open); document.body.appendChild(badge); updateBadge();
    positionListeningBadge(badge);
    await flush();
    setInterval(flush, 15000);
    setInterval(() => { if (overlay) load(); }, 60000);
    window.addEventListener('online', () => flush().then(load));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') flush().then(load); else { window.PetPlayback.flush(); collector = null; } });
    if (location.hash === '#pet') open();
  }
  window.PetGame = { initialize, open, close };
})();
