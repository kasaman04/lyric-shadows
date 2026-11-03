(() => {
  'use strict';
  const model = window.IllustratedFlashcards;
  const root = document.getElementById('flashcardApp');
  if (!root || !model) return;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let storage;
  try { storage = window.localStorage; } catch { storage = null; }
  let progress = model.read(storage), revealed = false, speaking = false;
  let utterance = null;
  let noticeTimer;
  const total = model.deck.cards.length;
  const speakerIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m11 5-6 4H2v6h3l6 4V5Zm5 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const tapIcon = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M20 25V12a3 3 0 0 1 6 0v12l3-2 4 2 4 1 2 5-2 11H23l-9-12a3 3 0 0 1 4-4l5 5M23 2v3M9 8l3 3M36 8l-3 3M5 19h4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function notify(text) {
    clearTimeout(noticeTimer);
    document.getElementById('flashcardStatus').textContent = text;
    noticeTimer = setTimeout(() => { document.getElementById('flashcardStatus').textContent = ''; }, 5000);
  }
  function persist() {
    const saved = model.save(storage, progress);
    if (!saved) notify('進捗を保存できません。この画面を開いている間は練習できます。');
    return saved;
  }
  function stopSpeech() {
    if (utterance && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    utterance = null; speaking = false;
  }
  function header() {
    return `<header class="flashcard-header"><a href="/" class="flashcard-back" aria-label="TOPへ戻る">←</a><div><h1>イラスト暗記カード</h1><p>${model.deck.title}</p></div><span class="flashcard-deck-size">${total}枚</span></header>
      <div class="flashcard-progress-label"><span>覚えた <strong>${progress.learned.length}</strong> / ${total}枚</span><span>あと${progress.queue.length}枚</span></div>
      <div class="flashcard-progress" role="progressbar" aria-label="覚えたカード" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${progress.learned.length}"><span style="width:${progress.learned.length / total * 100}%"></span></div>`;
  }
  function render(focus) {
    const card = model.current(progress);
    if (!card) {
      root.innerHTML = `${header()}<section class="flashcard-complete"><span class="flashcard-complete-mark" aria-hidden="true">✓</span><p class="flashcard-eyebrow">WELL DONE</p><h2 tabindex="-1">${total}枚、覚えた！</h2><p>おつかれさま。もう一周して、<br>思い出せるか確かめてみよう。</p><button class="flashcard-primary" id="restartCards">もう一周する</button><a href="/">TOPへ戻る</a></section><p class="flashcard-save-note">進捗はこの端末に保存されます。</p>`;
      document.getElementById('restartCards').addEventListener('click', () => { progress = model.fresh(); progress.started = true; revealed = false; persist(); render(true); });
      if (focus) root.querySelector('h2').focus();
      return;
    }
    const hasSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    const image = `<img class="flashcard-illustration" src="${esc(card.image)}" alt="${esc(card.alt)}" width="1024" height="768" fetchpriority="high">`;
    root.innerHTML = `${header()}<section class="flashcard-study" aria-label="暗記カード">
      <div class="flashcard-card ${revealed ? 'is-revealed' : ''}">
        ${revealed ? image : `<button class="flashcard-reveal" id="revealCard" aria-label="タップして答えを見る">${image}<span class="flashcard-front-prompt">${tapIcon}<strong>タップして答えを見る</strong><small>まずは、声に出してみよう。</small></span></button>`}
        ${revealed ? `<div class="flashcard-answer"><div class="flashcard-english-row"><h2 id="cardAnswer" lang="en" tabindex="-1">${esc(card.english)}</h2><button id="speakCard" class="flashcard-speaker" aria-label="英文を聞く（端末の英語音声）" ${hasSpeech ? '' : 'disabled'}>${speakerIcon}</button></div><p class="flashcard-japanese" lang="ja">${esc(card.japanese)}</p><span class="flashcard-pattern">${esc(card.pattern)}</span><div class="flashcard-review-actions"><button id="againCard" class="flashcard-secondary">もう一度</button><button id="rememberCard" class="flashcard-primary">覚えた</button></div>${hasSpeech ? '' : '<p class="flashcard-audio-note">このブラウザでは音声読み上げを利用できません。</p>'}</div>` : ''}
      </div>
      <details class="flashcard-hint"><summary>場面ヒント</summary><p>${esc(card.hint)}</p></details>
      <nav class="flashcard-navigation" aria-label="カードの移動"><button id="previousCard" aria-label="前のカード" ${progress.cursor === 0 ? 'disabled' : ''}>←</button><span>未習得カード ${progress.cursor + 1} / ${progress.queue.length}</span><button id="nextCard" aria-label="次のカード" ${progress.cursor === progress.queue.length - 1 ? 'disabled' : ''}>→</button></nav>
      <p class="flashcard-save-note">「もう一度」は、この一周のあとに再出題。<br>進捗はこの端末に保存されます。</p>
    </section>`;
    if (!revealed) document.getElementById('revealCard').addEventListener('click', reveal);
    else {
      document.getElementById('againCard').addEventListener('click', () => rate(false));
      document.getElementById('rememberCard').addEventListener('click', () => rate(true));
      document.getElementById('speakCard').addEventListener('click', speak);
    }
    document.getElementById('previousCard').addEventListener('click', () => move(-1));
    document.getElementById('nextCard').addEventListener('click', () => move(1));
    const next = model.deck.cards.find(item => item.id === progress.queue[progress.cursor + 1]);
    if (next) { const preload = new Image(); preload.src = next.image; }
    if (focus) (document.getElementById(revealed ? 'cardAnswer' : 'revealCard')).focus({ preventScroll: true });
  }
  function reveal() { revealed = true; progress.started = true; persist(); render(true); }
  function rate(remembered) {
    if (!revealed) return;
    stopSpeech();
    progress = model.rate(progress, remembered); revealed = false;
    const saved = persist(); render(true);
    if (saved) notify(remembered ? '覚えたカードに追加しました。' : 'この一周のあとに、もう一度出題します。');
  }
  function move(delta) { stopSpeech(); progress = model.move(progress, delta); revealed = false; persist(); render(true); }
  function updateSpeaker() {
    const button = document.getElementById('speakCard');
    if (button) { button.classList.toggle('is-speaking', speaking); button.setAttribute('aria-label', speaking ? '音声を止める' : '英文を聞く（端末の英語音声）'); }
  }
  function speak() {
    if (speaking) { stopSpeech(); updateSpeaker(); return; }
    const card = model.current(progress);
    if (!card || !revealed || !('speechSynthesis' in window)) return;
    stopSpeech();
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(voice => /^en[-_]/i.test(voice.lang));
    if (voices.length && !englishVoices.length) { notify('端末に英語の音声が見つかりません。英語の読み上げ音声を追加してください。'); return; }
    const speech = new SpeechSynthesisUtterance(card.english.replace(/’/g, "'"));
    const voice = englishVoices.find(v => /^en[-_]US$/i.test(v.lang)) || englishVoices[0];
    if (voice) speech.voice = voice;
    speech.lang = 'en-US'; speech.rate = 0.9;
    utterance = speech; speaking = true; updateSpeaker();
    speech.onend = () => { if (utterance !== speech) return; utterance = null; speaking = false; updateSpeaker(); };
    speech.onerror = event => { if (utterance !== speech) return; utterance = null; speaking = false; updateSpeaker(); if (!['canceled', 'interrupted'].includes(event.error)) notify('音声を再生できませんでした。もう一度お試しください。'); };
    window.speechSynthesis.speak(speech);
  }
  window.addEventListener('pagehide', stopSpeech);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopSpeech(); updateSpeaker(); } });
  window.addEventListener('storage', event => {
    if (event.key === 'phraseDeviceId' || event.key === model.key(storage) || event.key === null) {
      stopSpeech(); progress = model.read(storage); revealed = false; render(false);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); if (model.current(progress)) move(event.key === 'ArrowRight' ? 1 : -1); }
  });
  render(false);
})();
