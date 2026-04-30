// ============================================================
// STATE
// ============================================================
const state = {
  view: 'home',
  songs: [],
  phrases: [],
  currentSong: null,
  currentPhrase: null,
  showJapanese: false,
  activeTab: 'conv',   // 'conv' | 'song'
  homeFilter: 'A',     // 'A' | 'B' | 'C'
  phrasePack: '基本',
  phraseCategory: 'すべて',
  hiddenPhraseIds: new Set(),
  savedPhraseIds: new Set(),
  practiceSet: [],
  practiceIndex: 0,
  practiceTitle: '',
  practiceCount: '10',
  phrasePracticeAudio: null,
  shouldAutoplayPractice: false,
  // Playback
  sentenceList: [],
  audioElements: [],
  currentIndex: -1,
  isPlaying: false,
  repeatMode: 'off',   // 'off' | 'one' | 'all'
  repeatTimer: null,
};

const CARD_GRADS = [
  'card-grad-0','card-grad-1','card-grad-2','card-grad-3',
  'card-grad-4','card-grad-5','card-grad-6','card-grad-7'
];

const SPEAKER_ICONS = {
  '男性': '👨', '女性': '👩', '男２': '👴', '少年': '👦', '少女': '👧'
};

const PHRASE_AUTO_ADVANCE_DELAY_MS = 1200;

// ============================================================
// INIT
// ============================================================
async function init() {
  await loadSongs();
  state.phrases = Array.isArray(window.CONVERSATION_PHRASES) ? window.CONVERSATION_PHRASES : [];
  applyGeneratedPhraseAudio();
  loadHiddenPhrases();
  loadSavedPhrases();
  renderHome();
}

async function loadSongs() {
  try {
    const res = await fetch('/api/songs');
    state.songs = await res.json();
  } catch {
    state.songs = [];
  }
}

function applyGeneratedPhraseAudio() {
  const generatedAudio = window.GENERATED_PHRASE_AUDIO || {};
  state.phrases.forEach(phrase => {
    if (generatedAudio[phrase.id]) phrase.audio = generatedAudio[phrase.id];
  });
}

// ============================================================
// ROUTING
// ============================================================
function showHome() {
  stopAudio();
  stopPhrasePracticeAudio();
  state.currentSong = null;
  state.currentPhrase = null;
  state.view = 'home';
  renderHome();
}

function showShadowing(song) {
  stopPhrasePracticeAudio();
  state.currentSong = song;
  state.view = 'shadowing';
  state.showJapanese = false;
  state.activeTab = 'conv';
  initAudio(song);
  renderShadowing();
}

function showPhrase(phrase) {
  stopAudio();
  stopPhrasePracticeAudio();
  state.currentPhrase = phrase;
  state.currentSong = null;
  state.view = 'phrase';
  renderPhraseDetail();
}

// ============================================================
// HOME VIEW
// ============================================================
function renderHome() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="home-header">
      <h1><img src="/rogo2.png" alt="Lyric Shadows" class="header-logo"> Lyric Shadows</h1>
    </div>
    <div class="home-tabs">
      <button class="home-tab ${state.homeFilter === 'A' ? 'active' : ''}" onclick="setHomeFilter('A')">洋楽で学ぶ</button>
      <button class="home-tab ${state.homeFilter === 'B' ? 'active' : ''}" onclick="setHomeFilter('B')">シチュエーション</button>
      <button class="home-tab ${state.homeFilter === 'C' ? 'active' : ''}" onclick="setHomeFilter('C')">会話フレーズ</button>
    </div>
    ${renderSongGrid()}
    <div id="modalContainer"></div>
    <div id="progressContainer"></div>
  `;
  if (state.homeFilter === 'C') {
    setTimeout(() => {
      scrollActivePhrasePack();
      scrollActivePhraseChip();
    }, 0);
  }
  checkExistingPreview();
}

function setHomeFilter(filter) {
  state.homeFilter = filter;
  renderHome();
}

async function checkExistingPreview() {
  try {
    const res = await fetch('/api/preview');
    const preview = await res.json();
    if (preview) showPreviewView(preview);
  } catch {}
}

function renderSongGrid() {
  if (state.homeFilter === 'C') return renderPhraseGrid();

  const filteredSongs = state.songs.filter(s => {
    const isPatternB = s.pattern === 'B' || (s.artist && s.artist.includes('パターンB'));
    const pattern = isPatternB ? 'B' : 'A';
    return pattern === state.homeFilter;
  });

  if (filteredSongs.length === 0) {
    return `
      <div class="empty-state">
        <span class="empty-icon">🎧</span>
        <p>該当する曲がありません。</p>
      </div>`;
  }
  const cards = filteredSongs.map((song) => {
    const originalIndex = state.songs.indexOf(song);
    const bgStyle = song.thumbnailUrl
      ? `style="background-image:url('${song.thumbnailUrl}')"` : '';
    const grad = CARD_GRADS[originalIndex % CARD_GRADS.length];
    return `
      <div class="song-card ${song.thumbnailUrl ? 'has-thumb' : grad}" ${bgStyle}
           onclick="showShadowing(state.songs[${originalIndex}])">
        <div class="song-card-overlay">
          <div class="song-card-name">${esc(song.songName)}</div>
          <div class="song-card-artist">${esc(song.artist)}</div>
        </div>
      </div>`;
  }).join('');
  return `<div class="song-grid">${cards}</div>`;
}

function renderPhraseGrid() {
  const packPhrases = getPhrasesForCurrentPack();
  const categories = ['すべて', ...Array.from(new Set(packPhrases.map(p => p.category)))];
  if (!categories.includes(state.phraseCategory)) state.phraseCategory = 'すべて';
  const categoryPhrases = state.phraseCategory === 'すべて'
    ? packPhrases
    : packPhrases.filter(p => p.category === state.phraseCategory);
  const filtered = categoryPhrases;
  const visiblePlayableCount = categoryPhrases.filter(p => p.audio && !isPhraseHidden(p.id)).length;

  const chips = categories.map(category => `
    <button class="phrase-filter-chip ${state.phraseCategory === category ? 'active' : ''}"
            onclick="setPhraseCategory('${esc(category)}')">${esc(category)}</button>
  `).join('');

  const packTabs = ['基本', 'リアル会話', '初対面', '相手を知る質問', '会話を止めない', '感情を出す', '人間関係', 'リアル口語', 'すべて', '保存'].map(pack => `
    <button class="phrase-pack-tab ${state.phrasePack === pack ? 'active' : ''}" onclick="setPhrasePack('${pack}')">${pack}</button>
  `).join('');

  const cards = filtered.map((phrase, index) => `
    <div class="phrase-card phrase-card-${index % 12} ${isPhraseHidden(phrase.id) ? 'is-hidden-phrase' : ''}" onclick="showPhrase(state.phrases.find(p => p.id === '${phrase.id}'))">
      <div class="phrase-card-category">${esc(phrase.category)}</div>
      <div class="phrase-card-title">${esc(phrase.phrase)}</div>
      <div class="phrase-card-note">${esc(phrase.usageNote)}</div>
      <div class="phrase-card-count">${isPhraseHidden(phrase.id) ? '非表示' : phrase.lines.length + 'ラリー'}</div>
    </div>
  `).join('');

  return `
    <div class="phrase-tools">
      <div class="phrase-pack-tabs" id="phrasePackTabs">${packTabs}</div>
      <div class="phrase-count">${filtered.length} / ${packPhrases.length} フレーズ・再生対象 ${visiblePlayableCount}</div>
      <div class="phrase-filter-wrap">
        <div class="phrase-filter-row" id="phraseFilterRow">${chips}</div>
      </div>
      <div class="phrase-random-panel">
        <span>ランダム練習</span>
        <button onclick="startPhrasePractice(10)">10</button>
        <button onclick="startPhrasePractice(30)">30</button>
        <button onclick="startPhrasePractice('all')">すべて</button>
      </div>
    </div>
    <div class="phrase-grid">${cards}</div>
  `;
}

function getPhrasePack(phrase) {
  return phrase.pack || '基本';
}

function getPhrasesForCurrentPack() {
  if (state.phrasePack === '保存') {
    return state.phrases.filter(p => state.savedPhraseIds.has(p.id));
  }
  if (state.phrasePack === 'すべて') return state.phrases;
  return state.phrases.filter(p => getPhrasePack(p) === state.phrasePack);
}

function setPhrasePack(pack) {
  state.phrasePack = pack;
  state.phraseCategory = 'すべて';
  stopPhrasePracticeAudio();
  renderHome();
}

function setPhraseCategory(category) {
  state.phraseCategory = category;
  stopPhrasePracticeAudio();
  renderHome();
}

function scrollActivePhraseChip() {
  const row = document.getElementById('phraseFilterRow');
  const active = row?.querySelector('.phrase-filter-chip.active');
  if (!row || !active) return;
  const rowRect = row.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  const offset = activeRect.left - rowRect.left - (rowRect.width / 2) + (activeRect.width / 2);
  row.scrollBy({ left: offset, behavior: 'smooth' });
}

function scrollActivePhrasePack() {
  const row = document.getElementById('phrasePackTabs');
  const active = row?.querySelector('.phrase-pack-tab.active');
  if (!row || !active) return;
  const rowRect = row.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  const offset = activeRect.left - rowRect.left - (rowRect.width / 2) + (activeRect.width / 2);
  row.scrollBy({ left: offset, behavior: 'smooth' });
}

function renderPhraseDetail() {
  const phrase = state.currentPhrase;
  if (!phrase) return showHome();
  const app = document.getElementById('app');

  const turnsHtml = phrase.lines.map(([speaker, english, japanese], index) => `
    <div class="phrase-line ${speaker === 'A' ? 'speaker-a' : 'speaker-b'}">
      <div class="phrase-line-meta">
        <span class="phrase-speaker">${esc(speaker)}</span>
        <span class="phrase-line-number">${index + 1}</span>
      </div>
      <div class="phrase-english">${esc(english)}</div>
      <div class="phrase-japanese">${esc(japanese)}</div>
    </div>
  `).join('');

  app.innerHTML = `
    <div class="shadowing-view phrase-detail-view">
      <div class="shadowing-header">
        <button class="back-btn" onclick="showHome()">←</button>
        <div class="title-jp-group">
          <div class="shadowing-song-info">
            <div class="shadowing-song-name">${esc(phrase.phrase)}</div>
            <div class="shadowing-song-artist">${esc(phrase.category)}</div>
          </div>
        </div>
      </div>

      <div class="phrase-hero phrase-card-${state.phrases.indexOf(phrase) % 12}">
        <div class="phrase-hero-label">${esc(phrase.category)}</div>
        <h2>${esc(phrase.phrase)}</h2>
        <p>${esc(phrase.usageNote)}</p>
      </div>

      <div class="phrase-conversation">
        ${phrase.audio ? `<button class="phrase-play-all-btn" onclick="playPhraseAudio('${esc(phrase.audio)}')">▶ まとめて再生</button>` : ''}
        <div class="phrase-action-row">
          <button class="phrase-hide-btn ${isPhraseHidden(phrase.id) ? 'is-restore' : ''}" onclick="togglePhraseHidden('${phrase.id}')">
            ${isPhraseHidden(phrase.id) ? '表示に戻す' : '非表示'}
          </button>
          <button class="phrase-save-btn ${isPhraseSaved(phrase.id) ? 'is-saved' : ''}" onclick="togglePhraseSaved('${phrase.id}')">
            ${isPhraseSaved(phrase.id) ? '保存済み' : '保存'}
          </button>
        </div>
        ${turnsHtml}
        <div class="phrase-usage-note">
          <span>使う場面</span>
          <p>${esc(phrase.usageNote)}</p>
        </div>
        <div class="phrase-audio-note">${phrase.audio ? '3ラリーを1本にまとめた試作音声です。' : '音声は次の工程で生成予定です。'}</div>
      </div>
    </div>
  `;
}

function playPhraseAudio(src) {
  stopAudio();
  stopPhrasePracticeAudio();
  const audio = new Audio(src);
  audio.play().catch(() => showToast('音声を再生できませんでした'));
}

function loadHiddenPhrases() {
  try {
    const ids = JSON.parse(localStorage.getItem('hiddenPhraseIds') || '[]');
    state.hiddenPhraseIds = new Set(Array.isArray(ids) ? ids : []);
  } catch {
    state.hiddenPhraseIds = new Set();
  }
}

function loadSavedPhrases() {
  try {
    const ids = JSON.parse(localStorage.getItem('savedPhraseIds') || '[]');
    state.savedPhraseIds = new Set(Array.isArray(ids) ? ids : []);
  } catch {
    state.savedPhraseIds = new Set();
  }
}

function saveHiddenPhrases() {
  localStorage.setItem('hiddenPhraseIds', JSON.stringify(Array.from(state.hiddenPhraseIds)));
}

function saveSavedPhrases() {
  localStorage.setItem('savedPhraseIds', JSON.stringify(Array.from(state.savedPhraseIds)));
}

function isPhraseHidden(id) {
  return state.hiddenPhraseIds.has(id);
}

function isPhraseSaved(id) {
  return state.savedPhraseIds.has(id);
}

function togglePhraseHidden(id) {
  if (state.hiddenPhraseIds.has(id)) {
    state.hiddenPhraseIds.delete(id);
    showToast('表示に戻しました');
  } else {
    state.hiddenPhraseIds.add(id);
    showToast('非表示にしました。ランダム再生には出ません');
  }
  saveHiddenPhrases();
  if (state.view === 'phrase') renderPhraseDetail();
  else renderHome();
}

function togglePhraseSaved(id) {
  if (state.savedPhraseIds.has(id)) {
    state.savedPhraseIds.delete(id);
    showToast('保存を解除しました');
  } else {
    state.savedPhraseIds.add(id);
    showToast('保存しました');
  }
  saveSavedPhrases();
  if (state.view === 'phrase') renderPhraseDetail();
  else if (state.view === 'phrasePractice') renderPhrasePractice();
  else renderHome();
}

function getPhrasePool() {
  const packPhrases = getPhrasesForCurrentPack();
  const byCategory = state.phraseCategory === 'すべて'
    ? packPhrases
    : packPhrases.filter(p => p.category === state.phraseCategory);
  return byCategory.filter(p => p.audio && !isPhraseHidden(p.id));
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startPhrasePractice(count) {
  stopAudio();
  stopPhrasePracticeAudio();

  const pool = getPhrasePool();
  if (pool.length === 0) {
    showToast('このカテゴリに再生できる音声がありません');
    return;
  }

  const limit = count === 'all' ? pool.length : Math.min(Number(count), pool.length);
  state.practiceSet = shuffleArray(pool).slice(0, limit);
  state.practiceIndex = 0;
  state.practiceCount = count === 'all' ? 'すべて' : String(limit);
  state.practiceTitle = state.phraseCategory;
  state.shouldAutoplayPractice = true;
  state.view = 'phrasePractice';
  renderPhrasePractice();
}

function renderPhrasePractice() {
  const app = document.getElementById('app');
  const total = state.practiceSet.length;
  const phrase = state.practiceSet[state.practiceIndex];

  if (!phrase) {
    app.innerHTML = `
      <div class="shadowing-view phrase-practice-view">
        <div class="shadowing-header">
          <button class="back-btn" onclick="showHome()">←</button>
          <div class="shadowing-song-info">
            <div class="shadowing-song-name">ランダム練習</div>
            <div class="shadowing-song-artist">完了</div>
          </div>
        </div>
        <div class="practice-complete">
          <h2>今回のセットは完了しました</h2>
          <p>非表示にしたフレーズは次回のランダム練習には出ません。</p>
          <button onclick="showHome()">会話フレーズに戻る</button>
        </div>
      </div>
    `;
    return;
  }

  const turnsHtml = phrase.lines.map(([speaker, english, japanese], index) => `
    <div class="phrase-line ${speaker === 'A' ? 'speaker-a' : 'speaker-b'}">
      <div class="phrase-line-meta">
        <span class="phrase-speaker">${esc(speaker)}</span>
        <span class="phrase-line-number">${index + 1}</span>
      </div>
      <div class="phrase-english">${esc(english)}</div>
      <div class="phrase-japanese">${esc(japanese)}</div>
    </div>
  `).join('');

  app.innerHTML = `
    <div class="shadowing-view phrase-practice-view">
      <div class="shadowing-header">
        <button class="back-btn" onclick="showHome()">←</button>
        <div class="title-jp-group">
          <div class="shadowing-song-info">
            <div class="shadowing-song-name">${esc(state.practiceTitle)} ランダム${esc(state.practiceCount)}</div>
            <div class="shadowing-song-artist">${state.practiceIndex + 1} / ${total}</div>
          </div>
        </div>
      </div>

      <div class="practice-progress">
        <div style="width:${((state.practiceIndex + 1) / total) * 100}%"></div>
      </div>

      <div class="phrase-hero phrase-card-${state.phrases.indexOf(phrase) % 12}">
        <div class="phrase-hero-label">${esc(phrase.category)} ・ ${state.practiceIndex + 1} / ${total}</div>
        <h2>${esc(phrase.phrase)}</h2>
        <p>${esc(phrase.usageNote)}</p>
      </div>

      <div class="phrase-conversation">
        ${phrase.audio ? `<button class="phrase-play-all-btn" onclick="playPhrasePracticeAudio('${esc(phrase.audio)}')">▶ まとめて再生</button>` : ''}
        <div class="phrase-action-row">
          <button class="phrase-hide-btn ${isPhraseHidden(phrase.id) ? 'is-restore' : ''}" onclick="hideCurrentPracticePhrase()">
            非表示にして次へ
          </button>
          <button class="phrase-save-btn ${isPhraseSaved(phrase.id) ? 'is-saved' : ''}" onclick="togglePhraseSaved('${phrase.id}')">
            ${isPhraseSaved(phrase.id) ? '保存済み' : '保存'}
          </button>
        </div>
        ${turnsHtml}
        <div class="phrase-usage-note">
          <span>使う場面</span>
          <p>${esc(phrase.usageNote)}</p>
        </div>
        <div class="practice-nav">
          <button onclick="movePractice(-1)" ${state.practiceIndex === 0 ? 'disabled' : ''}>前へ</button>
          <button onclick="movePractice(1)">${state.practiceIndex + 1 >= total ? '完了' : '次へ'}</button>
        </div>
      </div>
    </div>
  `;

  if (state.shouldAutoplayPractice && phrase.audio) {
    state.shouldAutoplayPractice = false;
    playPhrasePracticeAudio(phrase.audio);
  }
}

function movePractice(delta) {
  stopPhrasePracticeAudio();
  state.practiceIndex += delta;
  if (state.practiceIndex < 0) state.practiceIndex = 0;
  if (state.practiceIndex >= state.practiceSet.length) {
    state.practiceIndex = state.practiceSet.length;
  }
  state.shouldAutoplayPractice = delta > 0 && state.practiceIndex < state.practiceSet.length;
  renderPhrasePractice();
}

function hideCurrentPracticePhrase() {
  const phrase = state.practiceSet[state.practiceIndex];
  if (!phrase) return;
  state.hiddenPhraseIds.add(phrase.id);
  saveHiddenPhrases();
  state.practiceSet = state.practiceSet.filter(p => p.id !== phrase.id);
  if (state.practiceIndex >= state.practiceSet.length) state.practiceIndex = state.practiceSet.length;
  showToast('非表示にしました');
  stopPhrasePracticeAudio();
  state.shouldAutoplayPractice = state.practiceIndex < state.practiceSet.length;
  renderPhrasePractice();
}

function playPhrasePracticeAudio(src) {
  stopAudio();
  if (!state.phrasePracticeAudio) {
    state.phrasePracticeAudio = new Audio();
    state.phrasePracticeAudio.preload = 'auto';
  } else {
    state.phrasePracticeAudio.pause();
    try { state.phrasePracticeAudio.currentTime = 0; } catch {}
  }

  const absoluteSrc = new URL(src, window.location.href).href;
  if (state.phrasePracticeAudio.src !== absoluteSrc) {
    state.phrasePracticeAudio.src = src;
  }

  state.phrasePracticeAudio.onended = () => {
    if (state.view === 'phrasePractice') {
      setTimeout(() => {
        if (state.view === 'phrasePractice') movePractice(1);
      }, PHRASE_AUTO_ADVANCE_DELAY_MS);
    }
  };
  state.phrasePracticeAudio.play().catch(() => showToast('音声を再生できませんでした。再生ボタンを押してください'));
}

function stopPhrasePracticeAudio() {
  if (state.phrasePracticeAudio) {
    state.phrasePracticeAudio.pause();
    try { state.phrasePracticeAudio.currentTime = 0; } catch {}
  }
}

// ============================================================
// DELETE SONG
// ============================================================
async function deleteSong(id) {
  if (!confirm('この曲を削除しますか？')) return;
  await fetch(`/api/songs/${encodeURIComponent(id)}`, { method: 'DELETE' });
  state.songs = state.songs.filter(s => s.id !== id);
  renderHome();
}

// ============================================================
// SHADOWING VIEW
// ============================================================
function renderShadowing() {
  const song = state.currentSong;
  const app = document.getElementById('app');

  // ---- Conversation HTML ----
  const turnsHtml = song.conversation.map((turn, tIdx) => {
    const isA = turn.speaker === 'A';
    const cardClass = isA ? 'speaker-a' : 'speaker-b';
    const avatarClass = isA ? 'speaker-a-avatar' : 'speaker-b-avatar';
    const icon = SPEAKER_ICONS[isA ? song.speakerA.type : song.speakerB.type] || '🎤';
    const sentHtml = turn.sentences.map((s, sIdx) => {
      const flatIdx = getFlatIndex(tIdx, sIdx);
      const content = s.displayHtml || esc(s.text);
      return `<div class="sentence-item" id="sent-${flatIdx}" onclick="clickSentence(${flatIdx})">
        <div class="sentence-text">${content}</div></div>`;
    }).join('');
    const jpClass = state.showJapanese ? 'japanese-text visible' : 'japanese-text';
    return `<div class="turn-card ${cardClass}">
      <div class="turn-header">
        <div class="speaker-avatar ${avatarClass}">${icon}</div>
        <span class="speaker-name">${esc(turn.speakerName)}</span>
      </div>
      <div class="sentences-list">${sentHtml}</div>
      <div class="${jpClass}" id="jp-${tIdx}">${esc(turn.japanese)}</div>
    </div>`;
  }).join('');

  // ---- Song tab HTML: lyrics + video below ----
  const lyricsHtml = renderLyrics(song);
  let mediaHtml = '';
  if (song.hasLocalAudio) {
    mediaHtml = `
      <div class="song-audio-player">
        <audio id="songAudioPlayer" src="/songs/${encodeURIComponent(song.folderName)}/original.mp3" onplay="updateSongPlayBtn(true)" onpause="updateSongPlayBtn(false)" onended="updateSongPlayBtn(false)"></audio>
        <div class="song-controls">
          <button class="song-ctrl-btn" onclick="skipSongAudio(-5)" title="5秒戻る">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
            <span>5s</span>
          </button>
          <button class="song-ctrl-btn" onclick="skipSongAudio(-1)" title="1秒戻る">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            <span>1s</span>
          </button>
          <button class="song-ctrl-play" id="songPlayBtn" onclick="toggleSongPlay()">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="song-ctrl-btn" onclick="skipSongAudio(1)" title="1秒進む">
            <span>1s</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <button class="song-ctrl-btn" onclick="skipSongAudio(5)" title="5秒進む">
            <span>5s</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
          </button>
        </div>
      </div>
    `;
  } else if (song.videoId) {
    mediaHtml = `<div class="yt-embed-bottom"><iframe id="ytFrame" src="" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
  }
  const songTabHtml = `<div class="lyrics-display" ${song.hasLocalAudio ? 'style="padding-bottom: 90px;"' : ''}>${lyricsHtml}</div>${mediaHtml}`;

  app.innerHTML = `
    <div class="shadowing-view">
      <div class="shadowing-header">
        <button class="back-btn" onclick="showHome()">←</button>
        <div class="title-jp-group">
          <div class="shadowing-song-info">
            <div class="shadowing-song-name">${esc(song.songName)}</div>
            <div class="shadowing-song-artist">${esc(song.artist)}</div>
          </div>
          <button class="jp-toggle-btn${state.showJapanese ? ' active' : ''}" id="jpBtn"
                  style="${state.activeTab === 'song' ? 'display:none' : ''}"
                  onclick="toggleJapanese()">日本語</button>
        </div>
      </div>
      <div class="tab-bar">
        <button class="tab-btn${state.activeTab === 'conv' ? ' active' : ''}" id="tabConv" onclick="switchTab('conv')">会話</button>
        ${song.videoId || song.hasLocalAudio ? `<button class="tab-btn${state.activeTab === 'song' ? ' active' : ''}" id="tabSong" onclick="switchTab('song')">Song</button>` : ''}
      </div>
      <div class="setting-bar" id="settingBar">
        <span class="rel-badge rel-${song.relationship}">${esc(song.relationship)}</span>
        <span class="setting-text">${esc(song.setting)}</span>
      </div>
      <div class="conversation-area" id="convArea">${turnsHtml}</div>
      <div class="song-area hidden" id="songArea">${songTabHtml}</div>
      <div class="play-controls" id="playControls">
        <button class="restart-btn" onclick="restartAll()" title="最初から">↺</button>
        <button class="play-btn" id="playBtn" onclick="togglePlay()">▶</button>
        <button class="repeat-btn ${state.repeatMode !== 'off' ? 'active' : ''}" id="repeatBtn" onclick="cycleRepeat()" title="リピート">
          ${state.repeatMode === 'one' ? '🔂' : '🔁'}
          ${state.repeatMode !== 'off' ? '<span class="repeat-label">' + (state.repeatMode === 'one' ? '1' : 'All') + '</span>' : ''}
        </button>
      </div>
    </div>`;
}

function renderLyrics(song) {
  if (!song.lyrics) return '<p class="no-lyrics">歌詞なし</p>';

  const enLines = song.lyrics.split('\n');

  if (Array.isArray(song.lyricsJa)) {
    let availableJa = [...song.lyricsJa].filter(p => p.en && p.en.trim() && p.ja);
    const getWords = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    return enLines.map(line => {
      if (!line.trim()) return '<div class="lyric-spacer"></div>';
      
      const lineWords = getWords(line);
      if (lineWords.length === 0) return `<div class="lyric-pair"><div class="lyric-en">${esc(line)}</div></div>`;
      
      let bestMatchIdx = -1;
      let highestScore = 0;
      
      for (let i = 0; i < availableJa.length; i++) {
        const pairWords = getWords(availableJa[i].en);
        let overlap = 0;
        for (const lw of lineWords) {
          if (pairWords.includes(lw)) overlap++;
        }
        const score = overlap / Math.max(lineWords.length, 1);
        if (score > highestScore && score >= 0.5) {
          highestScore = score;
          bestMatchIdx = i;
        }
      }
      
      let jaHtml = '';
      if (bestMatchIdx !== -1) {
        jaHtml = `<div class="lyric-ja">${esc(availableJa[bestMatchIdx].ja)}</div>`;
        availableJa.splice(bestMatchIdx, 1);
      }
      
      return `<div class="lyric-pair"><div class="lyric-en">${esc(line)}</div>${jaHtml}</div>`;
    }).join('');
  }

  // Legacy fallback: lyricsJa is a plain string matched line-by-line
  const jaLines = song.lyricsJa ? song.lyricsJa.split('\n') : [];
  return enLines.map((line, i) => {
    if (!line.trim()) return '<div class="lyric-spacer"></div>';
    const ja = jaLines[i] && jaLines[i].trim() ? `<div class="lyric-ja">${esc(jaLines[i])}</div>` : '';
    return `<div class="lyric-pair"><div class="lyric-en">${esc(line)}</div>${ja}</div>`;
  }).join('');
}

function switchTab(tab) {
  state.activeTab = tab;
  const convArea = document.getElementById('convArea');
  const songArea = document.getElementById('songArea');
  const settingBar = document.getElementById('settingBar');
  const playControls = document.getElementById('playControls');
  const jpBtn = document.getElementById('jpBtn');
  const tabConv = document.getElementById('tabConv');
  const tabSong = document.getElementById('tabSong');

  const isConv = tab === 'conv';
  convArea?.classList.toggle('hidden', !isConv);
  songArea?.classList.toggle('hidden', isConv);
  settingBar?.classList.toggle('hidden', !isConv);
  playControls?.classList.toggle('hidden', !isConv);
  if (jpBtn) jpBtn.style.display = isConv ? '' : 'none';
  tabConv?.classList.toggle('active', isConv);
  tabSong?.classList.toggle('active', !isConv);

  // Load YouTube iframe lazily
  if (!isConv && state.currentSong.videoId && !state.currentSong.hasLocalAudio) {
    const frame = document.getElementById('ytFrame');
    if (frame && !frame.src.includes('youtube')) {
      frame.src = `https://www.youtube.com/embed/${state.currentSong.videoId}?autoplay=1`;
    }
  } else if (isConv) {
    // Pause YouTube when switching back
    const frame = document.getElementById('ytFrame');
    if (frame) frame.src = '';
    // Pause local audio
    const audio = document.getElementById('songAudioPlayer');
    if (audio) { audio.pause(); }
  }
}

// ============================================================
// SONG AUDIO CONTROLS
// ============================================================
function updateSongPlayBtn(isPlaying) {
  const btn = document.getElementById('songPlayBtn');
  if (btn) {
    btn.innerHTML = isPlaying 
      ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' // Pause icon
      : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'; // Play icon
    btn.classList.toggle('playing', isPlaying);
  }
}

function toggleSongPlay() {
  const audio = document.getElementById('songAudioPlayer');
  if (!audio) return;
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function skipSongAudio(seconds) {
  const audio = document.getElementById('songAudioPlayer');
  if (!audio) return;
  audio.currentTime = Math.max(0, audio.currentTime + seconds);
}

// Global Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  if (state.view !== 'shadowing' || state.activeTab !== 'song' || !state.currentSong?.hasLocalAudio) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.code === 'Space') {
    e.preventDefault();
    toggleSongPlay();
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    skipSongAudio(e.shiftKey ? -5 : -1);
  } else if (e.code === 'ArrowRight') {
    e.preventDefault();
    skipSongAudio(e.shiftKey ? 5 : 1);
  }
});

// Build flat index from turn+sentence indices
function getFlatIndex(turnIndex, sentenceIndex) {
  const song = state.currentSong;
  let idx = 0;
  for (let t = 0; t < turnIndex; t++) {
    idx += song.conversation[t].sentences.length;
  }
  return idx + sentenceIndex;
}

// ============================================================
// AUDIO ENGINE
// ============================================================
function initAudio(song) {
  stopAudio();
  state.sentenceList = [];
  state.audioElements = [];
  state.currentIndex = -1;
  state.isPlaying = false;

  song.conversation.forEach((turn) => {
    turn.sentences.forEach((s) => {
      state.sentenceList.push(s);
      const audio = new Audio(s.audio);
      audio.preload = 'auto';
      state.audioElements.push(audio);
    });
  });

  state.audioElements.forEach((audio, i) => {
    audio.onended = () => {
      if (!state.isPlaying) return;

      // Single sentence repeat
      if (state.repeatMode === 'one') {
        clearTimeout(state.repeatTimer);
        state.repeatTimer = setTimeout(() => playSentence(i), 1000);
        return;
      }

      // Normal next / full repeat
      if (i + 1 < state.audioElements.length) {
        playSentence(i + 1);
      } else if (state.repeatMode === 'all') {
        clearTimeout(state.repeatTimer);
        state.repeatTimer = setTimeout(() => playSentence(0), 1000);
      } else {
        state.isPlaying = false;
        updatePlayBtn();
      }
    };
  });
}

function playSentence(idx) {
  if (idx < 0 || idx >= state.audioElements.length) return;

  // Stop current
  if (state.currentIndex >= 0) {
    const cur = state.audioElements[state.currentIndex];
    cur.pause();
    cur.currentTime = 0;
  }

  state.currentIndex = idx;
  state.isPlaying = true;
  state.audioElements[idx].play().catch(() => {});
  updateHighlights();
  updatePlayBtn();

  // Scroll into view
  const el = document.getElementById(`sent-${idx}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function togglePlay() {
  if (state.isPlaying) {
    state.audioElements[state.currentIndex]?.pause();
    state.isPlaying = false;
    updatePlayBtn();
  } else {
    const idx = state.currentIndex < 0 ? 0 : state.currentIndex;
    playSentence(idx);
  }
}

function restartAll() {
  stopAudio();
  state.currentIndex = -1;
  updateHighlights();
  updatePlayBtn();
}

function cycleRepeat() {
  clearTimeout(state.repeatTimer);
  const modes = ['off', 'one', 'all'];
  const idx = modes.indexOf(state.repeatMode);
  state.repeatMode = modes[(idx + 1) % modes.length];
  updateRepeatBtn();
}

function updateRepeatBtn() {
  const btn = document.getElementById('repeatBtn');
  if (!btn) return;
  const isActive = state.repeatMode !== 'off';
  btn.classList.toggle('active', isActive);
  const icon = state.repeatMode === 'one' ? '🔂' : '🔁';
  const label = state.repeatMode === 'one' ? '1' : state.repeatMode === 'all' ? 'All' : '';
  btn.innerHTML = icon + (label ? `<span class="repeat-label">${label}</span>` : '');
}

function stopAudio() {
  clearTimeout(state.repeatTimer);
  if (state.currentIndex >= 0 && state.audioElements[state.currentIndex]) {
    state.audioElements[state.currentIndex].pause();
    state.audioElements[state.currentIndex].currentTime = 0;
  }
  state.isPlaying = false;
}

function clickSentence(flatIdx) {
  playSentence(flatIdx);
}

function updateHighlights() {
  document.querySelectorAll('.sentence-item').forEach((el, i) => {
    el.classList.remove('playing', 'played');
    if (i === state.currentIndex) el.classList.add('playing');
    else if (i < state.currentIndex) el.classList.add('played');
  });
}

function updatePlayBtn() {
  const btn = document.getElementById('playBtn');
  if (!btn) return;
  btn.textContent = state.isPlaying ? '⏸' : '▶';
  btn.classList.toggle('playing', state.isPlaying);
}


// ============================================================
// JAPANESE TOGGLE
// ============================================================
function toggleJapanese() {
  state.showJapanese = !state.showJapanese;
  const btn = document.getElementById('jpBtn');
  if (btn) btn.classList.toggle('active', state.showJapanese);

  document.querySelectorAll('[id^="jp-"]').forEach((el) => {
    el.classList.toggle('visible', state.showJapanese);
  });
}

// ============================================================
// UTILS
// ============================================================
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ============================================================
// PREVIEW AND ADD WORKFLOW
// ============================================================
function showAddModal() {
  const mc = document.getElementById('modalContainer');
  mc.innerHTML = `
    <div class="modal-overlay" onclick="closeAddModal()">
      <div class="modal-sheet" onclick="event.stopPropagation()">
        <div class="modal-handle"></div>
        <h2 class="modal-title">新しい曲を追加</h2>
        
        <div class="form-group">
          <label class="form-label">曲名 (Song Name)</label>
          <input type="text" id="addSongName" class="form-input" placeholder="例: It Will Rain">
        </div>
        <div class="form-group">
          <label class="form-label">アーティスト (Artist)</label>
          <input type="text" id="addArtist" class="form-input" placeholder="例: Bruno Mars">
        </div>
        <div class="form-group">
          <label class="form-label">YouTube ID (オプション)</label>
          <input type="text" id="addVideoId" class="form-input" placeholder="例: FRtXs73iICo">
        </div>
        
        <h3 class="modal-title" style="margin-top:24px; font-size:1rem;">会話のコンテキスト指定</h3>
        <div class="form-group">
          <label class="form-label">関係性 (Relationship)</label>
          <select id="addRel" class="form-input">
            <option value="">おまかせ</option>
            <option value="恋人">恋人</option>
            <option value="友達">友達</option>
            <option value="夫婦">夫婦</option>
            <option value="上司と部下">上司と部下</option>
            <option value="同僚">職場の同僚</option>
            <option value="家族">家族・兄弟</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">具体的なシーン・設定 (Setting)</label>
          <textarea id="addSetting" class="form-input" rows="2" placeholder="例: 激しい口論をしている、カフェで偶然再会した 等"></textarea>
        </div>

        <button class="generate-btn" onclick="startPreview()">プレビューを生成する</button>
      </div>
    </div>
  `;
}

function closeAddModal() {
  document.getElementById('modalContainer').innerHTML = '';
}

function showProgress(title) {
  const pc = document.getElementById('progressContainer');
  pc.innerHTML = `
    <div class="progress-overlay" id="progressOverlay">
      <div class="progress-icon">🎧</div>
      <div class="progress-title">${title}</div>
      <div class="progress-message" id="progressMsg">少々お待ちください...</div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill"></div></div>
    </div>
  `;
}

function hideProgress() {
  const pc = document.getElementById('progressContainer');
  if (pc) pc.innerHTML = '';
}

function updateProgressMsg(msg) {
  const el = document.getElementById('progressMsg');
  if (el) el.textContent = msg;
}

async function startPreview() {
  const songName = document.getElementById('addSongName').value.trim();
  const artist = document.getElementById('addArtist').value.trim();
  const videoId = document.getElementById('addVideoId').value.trim();
  const relationship = document.getElementById('addRel').value.trim();
  const setting = document.getElementById('addSetting').value.trim();

  if (!songName || !artist) return showToast('曲名とアーティストを入力してください');
  
  closeAddModal();
  showProgress('プレビューを生成中...');

  const qs = new URLSearchParams({ songName, artist, videoId, relationship, setting });
  const eventSource = new EventSource('/api/preview/stream?' + qs.toString());

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'progress') {
      updateProgressMsg(data.message);
    } else if (data.type === 'done') {
      eventSource.close();
      hideProgress();
      showPreviewView(data.preview);
    } else if (data.type === 'error') {
      eventSource.close();
      hideProgress();
      showToast(data.message);
      renderHome();
    }
  };
}

async function startRegen() {
  const hint = prompt('再生成への指示があれば入力してください (空でも可)', 'Relationship MUST be... ');
  if (hint === null) return;

  stopAudio();
  showProgress('会話を再生成中...');

  const qs = new URLSearchParams({ contextHint: hint });
  const eventSource = new EventSource('/api/preview/regen-stream?' + qs.toString());

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'progress') {
      updateProgressMsg(data.message);
    } else if (data.type === 'done') {
      eventSource.close();
      hideProgress();
      showPreviewView(data.preview);
    } else if (data.type === 'error') {
      eventSource.close();
      hideProgress();
      showToast(data.message);
    }
  };
}

async function finalizePreview() {
  stopAudio();
  showProgress('音声を生成して保存中...');

  const eventSource = new EventSource('/api/preview/finalize-stream');

  eventSource.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'progress') {
      updateProgressMsg(data.message);
    } else if (data.type === 'done') {
      eventSource.close();
      hideProgress();
      showToast('追加完了！👏');
      await loadSongs();
      showShadowing(data.song);
    } else if (data.type === 'error') {
      eventSource.close();
      hideProgress();
      showToast(data.message);
    }
  };
}

async function cancelPreview() {
  if (!confirm('本当にキャンセルしますか？プレビューは破棄されます。')) return;
  await fetch('/api/preview', { method: 'DELETE' });
  state.view = 'home';
  renderHome();
}

function showPreviewView(preview) {
  state.currentSong = preview; // Use the preview object
  state.view = 'preview';
  state.showJapanese = true; // Default to showing Japanese for review
  
  const app = document.getElementById('app');
  
  // Reuse render function portions
  const turnsHtml = preview.conversation.map((turn, tIdx) => {
    const isA = turn.speaker === 'A';
    const cardClass = isA ? 'speaker-a' : 'speaker-b';
    const avatarClass = isA ? 'speaker-a-avatar' : 'speaker-b-avatar';
    const icon = SPEAKER_ICONS[isA ? preview.speakerA.type : preview.speakerB.type] || '🎤';
    
    // Preview doesn't have split sentences with markup typically, wait! It might just have text, wait, 
    // actually prepareConversation output HAS .english and .japanese, but finalize returns .sentences.
    // tmp-preview.json has { english, japanese } instead of .sentences array!
    
    return `<div class="turn-card ${cardClass}">
      <div class="turn-header">
        <div class="speaker-avatar ${avatarClass}">${icon}</div>
        <span class="speaker-name">${esc(isA ? preview.speakerA.name : preview.speakerB.name)} - ${esc(isA ? preview.speakerA.voice : preview.speakerB.voice)}</span>
      </div>
      <div class="sentences-list">
        <div class="sentence-item"><div class="sentence-text">${esc(turn.english)}</div></div>
      </div>
      <div class="japanese-text visible">${esc(turn.japanese)}</div>
    </div>`;
  }).join('');

  app.innerHTML = `
    <div class="shadowing-view">
      <div class="shadowing-header" style="background: rgba(139,92,246,0.3); border-bottom-color: var(--purple);">
        <div class="title-jp-group">
          <div class="shadowing-song-info">
            <div class="shadowing-song-name">【プレビュー】${esc(preview.songName)}</div>
            <div class="shadowing-song-artist">${esc(preview.artist)}</div>
          </div>
        </div>
      </div>
      
      <div class="setting-bar">
        <span class="rel-badge rel-${preview.relationship}">${esc(preview.relationship)}</span>
        <span class="setting-text">${esc(preview.setting)}</span>
      </div>
      
      <div class="conversation-area" style="padding-bottom:180px;">
        <p style="color:var(--amber); font-size:0.8rem; text-align:center; padding-top:10px;">
          ※まだ音声はありません。内容を確認して確定してください。
        </p>
        ${turnsHtml}
      </div>

      <div class="play-controls" style="flex-direction:column; gap:10px; background:rgba(6,6,26,0.9); padding:20px;">
        <button class="generate-btn" style="margin:0; width:100%; border-radius:30px;" onclick="finalizePreview()">この内容で音声生成＆確定する</button>
        <div style="display:flex; gap:10px; width:100%;">
          <button class="restart-btn" style="flex:1; border-radius:30px; border-color:var(--dim); color:var(--text); width:auto;" onclick="startRegen()">🔄 会話を再生成</button>
          <button class="restart-btn" style="flex:1; border-radius:30px; border-color:#e11d48; color:#f43f5e; width:auto;" onclick="cancelPreview()">キャンセル</button>
        </div>
      </div>
      <div id="progressContainer"></div>
    </div>
  `;
}

// ============================================================
// START
// ============================================================
init();
