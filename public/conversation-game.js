(() => {
  'use strict';
  let root, device, home, makeAudio, data, question, questionIndex = 0, result = null;
  let active = false, busy = false, heard = false, hint = false, error = '', playing = false, epoch = 0;
  let audio = null, playId = 0, cancelAudioWait = null;
  const requests = new Set();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function local(key, value) { try { if (value === undefined) return localStorage.getItem(key); if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch {} }
  function stopAudio() { playId++; audio?.pause(); if (audio) { audio.onended = null; audio.onerror = null; } cancelAudioWait?.(false); cancelAudioWait = null; playing = false; }
  async function request(suffix, body) {
    const controller = new AbortController(); requests.add(controller);
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/pet/' + encodeURIComponent(device) + '/challenge' + suffix, { method: body ? 'POST' : 'GET', cache: 'no-store', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal: controller.signal });
      const value = await response.json();
      if (!response.ok) throw new Error(value.error || 'チャレンジを保存できませんでした。');
      return value;
    } finally { clearTimeout(timer); requests.delete(controller); }
  }
  function accept(value) { data = value.challenge; window.PetGame?.acceptState(value.state); }
  function coins() { return window.PetGame?.getState()?.conversationGame?.coins ?? data?.coins ?? 0; }
  function petPanel() {
    const pet = window.PetGame?.getState()?.pets.at(-1), form = pet?.forms.at(-1);
    const ended = pet && window.PetRules.ended(pet);
    const remaining = Math.max(0, 100 - coins());
    return `<section class="cg-pet" aria-label="ペットのお世話"><div class="cg-pet-row">${pet ? `<img src="${esc(form?.imageUrl || window.PetRules.element(pet.element)?.imageUrl)}" alt="${esc(form?.name || pet.name)}" width="72" height="72"><div><strong>${esc(form?.name || pet.name)}</strong><small>${ended ? '図鑑に残った相棒' : `体格 ${pet.stats.body} · パワー ${pet.stats.power} · かしこさ ${pet.stats.brain}`}</small></div>` : '<div><strong>会話のコインで、相棒を育てよう</strong><small>最初の相棒は10属性から選べます</small></div>'}</div><div class="cg-goal-row"><span>初回正解10問で、お世話1回</span><span>${remaining ? `あと${remaining}コイン（初回正解${Math.ceil(remaining / 10)}問ぶん）` : `お世話 ${Math.floor(coins() / 100)} 回ぶん`}</span></div><div class="cg-goal-track" role="progressbar" aria-label="お世話1回分のコイン" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, coins())}"><span style="width:${Math.min(100, coins())}%"></span></div><button class="cg-pet-button" data-cg="pet">${!pet || ended || pet.needsStarter ? '相棒を選ぶ' : 'ごはん・パワー・かしこさのお世話'} →</button><p>1回100コイン。残高と育成は次のチャレンジにも引き継げます。</p></section>`;
  }
  function render() {
    if (!active || !root) return;
    const round = data?.round;
    const finished = round?.finished && !result;
    let content = '';
    if (!data) content = `<div class="cg-loading" role="status">${error ? '接続を確認して、もう一度試してください。' : 'チャレンジを準備しています…'}</div>${error ? '<button class="cg-primary" data-cg="retry">もう一度読み込む</button>' : ''}`;
    else if (finished) content = `<section class="cg-finish"><h1>10問クリア！</h1><p>今回の獲得 ${round.earned} − 減額 ${round.lost} = <strong>${round.earned - round.lost} コイン</strong></p><details><summary>使った10個の返答を見る</summary>${round.replies.map(r => `<p>${esc(r.en)}<small>${esc(r.ja)}</small></p>`).join('')}</details><button class="cg-primary" data-cg="new" ${busy ? 'disabled' : ''}>次の10問を遊ぶ →</button></section>`;
    else if (question) {
      const solved = !!result?.correct;
      const lastWrong = question.attempts.at(-1);
      const reward = result?.delta > 0 ? `＋${result.delta}コイン。` : 'この問題は一度間違えたので、コイン加算なし。';
      const feedback = solved ? `✓ 正解！ ${reward} ${result.feedback}` : lastWrong ? `−${Math.abs(lastWrong.delta)}コイン。 ${lastWrong.feedback} もう一度選んでみよう。この問題は正解してもコイン加算なし。${lastWrong.delta === 0 ? '（残高は0未満になりません）' : ''}` : '';
      content = `<img class="cg-scene" src="${esc(question.image)}" alt="${esc(question.imageAlt)}" width="1672" height="940"><main class="cg-main"><div class="cg-scene-label">SCENE ${String(questionIndex + 1).padStart(2, '0')} · ${esc(question.place)}</div><h1>${esc(question.title)}</h1><div class="cg-listen"><button class="cg-play" data-cg="play" aria-label="${playing ? '音声を止める' : '相手の音声を聞く'}">${playing ? 'Ⅱ' : '▶'}</button><div><strong>${playing ? solved ? 'あなたの返答 → 相手の反応' : '相手が話しています…' : heard ? 'もう一度聞く' : '相手の声を聞く'}</strong><span class="cg-wave" aria-hidden="true">▂ ▄ ▆ ▃ ▅ ▂ ▇ ▄ ▃ ▆ ▂ ▄</span></div><button class="cg-hint" data-cg="hint" aria-expanded="${hint}">${hint ? '英文・訳を隠す' : '英文・訳を見る'}</button></div>${hint ? `<div class="cg-transcript">${esc(question.question)}<small>${esc(question.questionJa)}</small></div>` : ''}<div class="cg-choice-title"><strong>返答を選ぶ</strong><span>${solved ? 'この返し、使ってみよう' : heard ? '自然な返答をクリック' : '音声を聞くと選べます'}</span></div><div class="cg-choices">${question.options.map((o, i) => `<button class="cg-option ${solved && result.choice === i ? 'is-correct' : question.attempts.some(a => a.choice === i) ? 'is-wrong' : ''}" data-cg="answer" data-choice="${i}" ${busy || !heard || solved || question.attempts.some(a => a.choice === i) ? 'disabled' : ''}><span class="cg-letter">${solved && result.choice === i ? '✓' : ['A', 'B', 'C'][i]}</span><span>${esc(o.en)}${hint || solved ? `<small>${esc(o.ja)}</small>` : ''}</span></button>`).join('')}</div>${feedback ? `<p class="cg-feedback ${solved ? '' : 'is-wrong'}" role="status">${esc(feedback)}</p>` : ''}${solved ? `<div class="cg-conversation"><p><span>あなた</span>${esc(result.conversation.reply)}<small>${esc(result.conversation.replyJa)}</small></p><p><span>相手</span>${esc(result.conversation.response)}<small>${esc(result.conversation.responseJa)}</small></p></div><div class="cg-actions"><button class="cg-hint" data-cg="replay">会話をもう一度聞く</button><button class="cg-primary" data-cg="next">${round.finished ? '結果を見る →' : '次のシーンへ →'}</button></div>` : ''}</main>`;
    }
    const cleared = round?.index || 0;
    root.className = 'page-conversation-game';
    root.innerHTML = `<div class="cg-shell"><header class="cg-header"><button class="cg-back" data-cg="home" aria-label="会話フレーズに戻る">←</button><div><strong>会話チャレンジ</strong><small>聞いて、選んで、相棒を育てる</small></div><div class="cg-wallet" aria-label="所持コイン">🪙 <b>${coins()}</b><span>コイン</span></div></header><div class="cg-rule-row"><span>初回正解＋10 / 不正解−3コイン</span><span>${round ? `${finished ? 10 : questionIndex + 1} / ${round.count}` : '10問'}</span></div><div class="cg-round-track" role="progressbar" aria-label="クリアした問題" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${cleared}"><span style="width:${cleared * 10}%"></span></div>${content}${error ? `<p class="cg-error" role="alert">${esc(error)}</p>` : ''}${data ? petPanel() : ''}</div>`;
  }
  async function play(clips, prompt = false) {
    stopAudio(); const id = playId; const currentQuestion = question?.id;
    audio ||= makeAudio(); playing = true; error = ''; render();
    for (const clip of clips) {
      const ok = await new Promise(resolve => { cancelAudioWait = resolve; audio.src = clip; audio.onended = () => resolve(true); audio.onerror = () => resolve(false); audio.play().catch(() => resolve(false)); });
      if (!active || id !== playId || currentQuestion !== question?.id) return;
      cancelAudioWait = null;
      if (!ok) { playing = false; error = '音声を再生できませんでした。再生ボタンでもう一度試してください。'; render(); return; }
    }
    playing = false; if (prompt) heard = true; render();
  }
  async function load() {
    const generation = epoch; busy = true; error = ''; render();
    try {
      let value = await request('');
      if (!active || generation !== epoch) return;
      if (!value.challenge.round) value = await startRequest();
      if (!active || generation !== epoch) return;
      accept(value); question = data.round.question; questionIndex = data.round.index; result = null; heard = false;
    } catch (e) { if (active && generation === epoch) error = e.message || '接続できませんでした。もう一度試してください。'; }
    finally { if (active && generation === epoch) { busy = false; render(); } }
  }
  async function startRequest() {
    const key = 'conversationStart:' + device, requestId = local(key) || crypto.randomUUID(); local(key, requestId);
    const value = await request('/start', { requestId }); local(key, null); return value;
  }
  async function nextRound() {
    if (busy) return; stopAudio(); busy = true; error = ''; render(); const generation = epoch;
    try { const value = await startRequest(); if (!active || generation !== epoch) return; accept(value); question = data.round.question; questionIndex = data.round.index; result = null; heard = false; }
    catch (e) { if (active && generation === epoch) error = e.message; }
    finally { if (active && generation === epoch) { busy = false; render(); } }
  }
  async function choose(choice) {
    if (busy || !heard || result?.correct || question.attempts.some(a => a.choice === choice)) return;
    const generation = epoch, oldQuestion = question, oldIndex = questionIndex;
    const key = `conversationAnswer:${device}:${data.round.id}:${question.id}:${choice}`;
    const requestId = local(key) || crypto.randomUUID(); local(key, requestId); busy = true; error = ''; render();
    try {
      const value = await request('/answer', { requestId, roundId: data.round.id, questionId: question.id, choice });
      local(key, null); if (!active || generation !== epoch) return;
      accept(value); result = value.result; questionIndex = oldIndex;
      question = result.correct ? oldQuestion : data.round.question; busy = false; render();
      if (result.correct) await play(result.conversation.audio);
    } catch (e) { if (active && generation === epoch) { error = (e.message || '返答を保存できませんでした。') + ' 同じ返答をもう一度押すと確認できます。'; } }
    finally { if (active && generation === epoch) { busy = false; render(); } }
  }
  function handle(event) {
    const button = event.target.closest('[data-cg]'); if (!button || !root.contains(button) || button.disabled) return;
    switch (button.dataset.cg) {
      case 'home': close(); home(); break;
      case 'retry': load(); break;
      case 'new': nextRound(); break;
      case 'hint': hint = !hint; render(); break;
      case 'play': if (playing) { stopAudio(); render(); } else play([question.audio], true); break;
      case 'answer': choose(Number(button.dataset.choice)); break;
      case 'replay': play([question.audio, ...result.conversation.audio]); break;
      case 'next': stopAudio(); question = data.round.question; questionIndex = data.round.index; result = null; heard = false; error = ''; render(); window.scrollTo({ top: 0, behavior: 'instant' }); if (question) play([question.audio], true); break;
      case 'pet': stopAudio(); render(); window.PetGame.openCare(); break;
    }
  }
  function petChanged() { if (active && data) render(); }
  function hidden() { if (document.hidden) { stopAudio(); render(); } }
  function close() { active = false; epoch++; stopAudio(); for (const controller of requests) controller.abort(); requests.clear(); root?.removeEventListener('click', handle); window.removeEventListener('pet-state-change', petChanged); document.removeEventListener('visibilitychange', hidden); }
  async function open(options) {
    close(); root = document.getElementById('app'); device = options.deviceId; home = options.home; makeAudio = options.audio;
    active = true; busy = false; data = null; question = null; result = null; hint = false; heard = false; error = '';
    root.addEventListener('click', handle); window.addEventListener('pet-state-change', petChanged); document.addEventListener('visibilitychange', hidden); render(); await load();
  }
  window.ConversationGame = { open, close };
})();
