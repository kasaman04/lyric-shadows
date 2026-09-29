// ============================================================
// STATE
// ============================================================
const state = {
  view: 'home',
  songs: [],
  voices: [],
  phrases: [],
  dramas: [],
  currentDramaId: null,
  currentEpisodeId: null,
  dramaPlaylistActive: false,
  dramaPlaylistIndex: 0,
  dramaPlaylistExpectedAudio: null,
  dramaRepeat: false,
  dramaSingleRepeatIndex: -1,
  phraseImages: {},
  currentSong: null,
  activeLyricIndex: -1,
  currentPhrase: null,
  showJapanese: false,
  activeTab: 'conv',   // 'conv' | 'song'
  homeFilter: 'A',     // 'A' | 'C'
  phrasePack: '基本',
  phraseCategory: 'すべて',
  hiddenPhraseIds: new Set(),
  savedPhraseIds: new Set(),
  practiceSet: [],
  practiceIndex: 0,
  practiceTitle: '',
  practiceCount: '10',
  practiceMode: 'random',
  phrasePracticeAudio: null,
  phraseAudioRepeat: false,
  phraseAudioSrc: '',
  shouldAutoplayPractice: false,
  deviceId: '',
  phrasePrefsSyncTimer: null,
  // Playback
  sentenceList: [],
  sentenceSpeakers: [],
  audioSources: [],
  conversationAudio: null,
  conversationPlayRequest: 0,
  currentIndex: -1,
  isPlaying: false,
  repeatMode: 'off',   // 'off' | 'one' | 'all'
  repeatTimer: null,
  advanceTimer: null,
  pendingNextIndex: -1,
  conversationCycleNext: 0,
  conversationFinished: false,
  songTicketSessionActive: false,
  songTicketStartPending: false,
};

const CARD_GRADS = [
  'card-grad-0','card-grad-1','card-grad-2','card-grad-3',
  'card-grad-4','card-grad-5','card-grad-6','card-grad-7'
];

const SPEAKER_ICONS = {
  '男性': '👨', '女性': '👩', '中性': '🎙️', '男２': '👴', '少年': '👦', '少女': '👧'
};

const PLAYER_PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 10 7-10 7V5Z" fill="currentColor"/></svg>';
const PLAYER_PAUSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zm7 0h3v14h-3z" fill="currentColor"/></svg>';
const PLAYER_REPEAT_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3l3 3-3 3M4 10V8a2 2 0 0 1 2-2h14M7 21l-3-3 3-3m13-1v2a2 2 0 0 1-2 2H4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function repeatControlContent() {
  const mode = state.repeatMode === 'one' ? '1行' : state.repeatMode === 'all' ? '全体' : 'オフ';
  return `${PLAYER_REPEAT_ICON}<span class="control-label">リピート</span><span class="control-state">${mode}</span>`;
}

function speakerAvatar(song, side, avatarClass) {
  const speaker = side === 'A' ? song.speakerA : song.speakerB;
  const image = window.SONG_CHARACTER_AVATARS?.[song.id || song.folderName]?.[side];
  if (image) {
    return `<div class="speaker-avatar ${avatarClass}"><img src="${esc(image)}" alt="" width="40" height="40" loading="lazy"></div>`;
  }
  return `<div class="speaker-avatar ${avatarClass}">${SPEAKER_ICONS[speaker?.type] || '🎤'}</div>`;
}

const PHRASE_AUTO_ADVANCE_DELAY_MS = 1200;
const CONVERSATION_SPEAKER_PAUSE_MS = 1100;
const STORAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const DEVICE_ID_KEY = 'phraseDeviceId';
const TODAY_PHRASE_SET_KEY = 'todayPhraseSetV1';
const TODAY_PHRASE_SCOPE_KEY = 'all-conversations';
const TODAY_PHRASE_LIMIT = 15;
const SONG_LISTENS_PER_PLAY = 5;

let activeMediaType = '';

function setMediaPlaybackState(playing) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  }
}

function setMediaSession(type, title, artist) {
  activeMediaType = type;
  // Keep the browser's audio session in the playback category on iOS.
  if (navigator.audioSession) {
    try { navigator.audioSession.type = 'playback'; } catch {}
  }
  if (!('mediaSession' in navigator)) return;
  if ('MediaMetadata' in window) {
    navigator.mediaSession.metadata = new MediaMetadata({ title, artist });
  }
  const actions = {
    play: () => {
      if (type !== activeMediaType) return;
      if (type === 'song') toggleSongPlay();
      else if (type === 'conversation' && !state.isPlaying) togglePlay();
      else if (type === 'phrase') state.phrasePracticeAudio?.play().catch(() => {});
    },
    pause: () => {
      if (type !== activeMediaType) return;
      if (type === 'song') document.getElementById('songAudioPlayer')?.pause();
      else if (type === 'conversation' && state.isPlaying) togglePlay();
      else if (type === 'phrase') state.phrasePracticeAudio?.pause();
    },
    previoustrack: type === 'song' ? null : () => {
      if (type !== activeMediaType) return;
      if (type === 'conversation' && state.currentIndex > 0) playSentence(state.currentIndex - 1);
      else if (type === 'phrase' && state.view === 'phrasePractice' && state.practiceIndex > 0) movePractice(-1);
    },
    nexttrack: type === 'song' ? null : () => {
      if (type !== activeMediaType) return;
      if (type === 'conversation' && state.currentIndex + 1 < state.audioSources.length) playSentence(state.currentIndex + 1);
      else if (type === 'phrase' && state.view === 'phrasePractice') movePractice(1);
    }
  };
  for (const [action, handler] of Object.entries(actions)) {
    try { navigator.mediaSession.setActionHandler(action, handler); } catch {}
  }
  if (type === 'song') {
    for (const [action, seconds] of [['seekbackward', -10], ['seekforward', 10]]) {
      try { navigator.mediaSession.setActionHandler(action, () => skipSongAudio(seconds)); } catch {}
    }
  } else {
    for (const action of ['seekbackward', 'seekforward']) {
      try { navigator.mediaSession.setActionHandler(action, null); } catch {}
    }
  }
}

function clearMediaSession(type) {
  if (activeMediaType !== type) return;
  activeMediaType = '';
  setMediaPlaybackState(false);
}

function stopSongAudio() {
  document.getElementById('songAudioPlayer')?.pause();
  state.songTicketSessionActive = false;
  clearMediaSession('song');
}

// ============================================================
// INIT
// ============================================================
async function init() {
  await loadSongs();
  await loadVoices();
  await loadPhraseImages();
  state.phrases = Array.isArray(window.CONVERSATION_PHRASES) ? window.CONVERSATION_PHRASES : [];
  state.dramas = Array.isArray(window.DRAMAS) ? window.DRAMAS : [];
  applyGeneratedPhraseAudio();
  loadHiddenPhrases();
  loadSavedPhrases();
  state.deviceId = loadDeviceId();
  renderHome();
  syncPhrasePreferencesFromServer();
}

async function loadVoices() {
  try {
    const res = await fetch('/api/voices');
    state.voices = res.ok ? await res.json() : [];
  } catch {
    state.voices = [];
  }
}

async function loadSongs() {
  try {
    const res = await fetch('/api/songs');
    state.songs = await res.json();
  } catch {
    state.songs = [];
  }
}

async function loadPhraseImages() {
  try {
    const res = await fetch('/api/phrase-images');
    state.phraseImages = await res.json();
  } catch {
    state.phraseImages = {};
  }
}

function applyGeneratedPhraseAudio() {
  const generatedAudio = window.GENERATED_PHRASE_AUDIO || {};
  const dialogueAudio = window.GENERATED_PHRASE_DIALOGUE || {};
  state.phrases.forEach(phrase => {
    if (generatedAudio[phrase.id]) phrase.audio = generatedAudio[phrase.id];
    if (dialogueAudio[phrase.id]?.audio) {
      phrase.audio = dialogueAudio[phrase.id].audio;
      phrase.voiceCast = dialogueAudio[phrase.id];
    }
  });
}

// ============================================================
// ROUTING
// ============================================================
function showHome() {
  stopAudio();
  stopPhrasePracticeAudio();
  stopSongAudio();
  stopDramaAudio();
  state.currentSong = null;
  state.currentPhrase = null;
  state.currentDramaId = null;
  state.currentEpisodeId = null;
  state.view = 'home';
  renderHome();
}

function showShadowing(song) {
  stopSongAudio();
  stopPhrasePracticeAudio();
  state.currentSong = song;
  state.activeLyricIndex = -1;
  state.view = 'shadowing';
  state.showJapanese = false;
  state.activeTab = 'conv';
  state.songTicketSessionActive = false;
  initAudio(song);
  renderShadowing();
}

function showPhrase(phrase) {
  stopAudio();
  stopPhrasePracticeAudio();
  stopSongAudio();
  state.currentPhrase = phrase;
  state.currentSong = null;
  state.view = 'phrase';
  renderPhraseDetail();
}

function getPhraseDetailSequence() {
  const packPhrases = getPhrasesForCurrentPack();
  const filtered = state.phraseCategory === 'すべて'
    ? packPhrases
    : packPhrases.filter(p => p.category === state.phraseCategory);
  return filtered.length ? filtered : state.phrases;
}

function movePhraseDetail(delta) {
  const sequence = getPhraseDetailSequence();
  if (!state.currentPhrase || sequence.length === 0) return;
  const currentIndex = sequence.findIndex(p => p.id === state.currentPhrase.id);
  const baseIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (baseIndex + delta + sequence.length) % sequence.length;
  showPhrase(sequence[nextIndex]);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showNextPhrase() {
  movePhraseDetail(1);
}

function showPreviousPhrase() {
  movePhraseDetail(-1);
}

// ============================================================
// HOME VIEW
// ============================================================
function renderHome() {
  const app = document.getElementById('app');
  app.className = 'page-home';
  app.innerHTML = `
    <main class="home-shell">
      <header class="home-header">
        <div class="brand-mark" aria-hidden="true">♫</div>
        <div class="brand-copy"><span class="brand-name">Lyric Shadows</span><span class="brand-caption">ENGLISH THROUGH SOUND</span></div>
      </header>
      <section class="home-hero" aria-labelledby="home-title">
        <div class="hero-vinyl" aria-hidden="true"><div></div></div>
        <div class="hero-copy">
          <p class="section-eyebrow">TODAY'S PRACTICE</p>
          <h1 id="home-title">英語を、<br>耳から好きになる。</h1>
          <p class="hero-description">好きな曲と会話で、毎日少しずつ。</p>
          <button class="hero-cta" onclick="startTodayPhrasePractice()">今日の練習を始める <span aria-hidden="true">→</span></button>
        </div>
      </section>
      <nav class="home-tabs" aria-label="学習方法">
        <button class="home-tab ${state.homeFilter === 'A' ? 'active' : ''}" onclick="setHomeFilter('A')" aria-current="${state.homeFilter === 'A' ? 'page' : 'false'}">♫ <span>洋楽で学ぶ</span></button>
        <button class="home-tab ${state.homeFilter === 'C' ? 'active' : ''}" onclick="setHomeFilter('C')" aria-current="${state.homeFilter === 'C' ? 'page' : 'false'}">☏ <span>会話フレーズ</span></button>
        <button class="home-tab ${state.homeFilter === 'D' ? 'active' : ''}" onclick="setHomeFilter('D')" aria-current="${state.homeFilter === 'D' ? 'page' : 'false'}">🎬 <span>ドラマ</span></button>
      </nav>
    ${renderSongGrid()}
    </main>
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
  if (!['A', 'C', 'D'].includes(filter)) filter = 'A';
  stopDramaAudio();
  state.homeFilter = filter;
  state.currentDramaId = null;
  state.currentEpisodeId = null;
  renderHome();
}

function stopDramaAudio() {
  document.querySelectorAll('.drama-audio').forEach(audio => {
    audio.loop = false;
    audio.pause();
  });
  state.dramaPlaylistActive = false;
  state.dramaPlaylistIndex = 0;
  state.dramaPlaylistExpectedAudio = null;
  state.dramaSingleRepeatIndex = -1;
}

function showDrama(dramaId) {
  stopDramaAudio();
  state.currentDramaId = dramaId;
  state.currentEpisodeId = null;
  renderHome();
}

function showDramaEpisode(episodeId) {
  stopDramaAudio();
  state.currentEpisodeId = episodeId;
  renderHome();
}

function onDramaAudioPlay(activeAudio) {
  const audios = [...document.querySelectorAll('.drama-audio')];
  if (state.dramaSingleRepeatIndex >= 0 && audios[state.dramaSingleRepeatIndex] !== activeAudio) {
    clearDramaSingleRepeat();
  }
  audios.forEach(audio => {
    if (audio !== activeAudio) audio.pause();
    audio.closest('.drama-clip')?.classList.toggle('is-playing', audio === activeAudio);
  });
  const activeText = activeAudio.closest('.drama-clip')?.querySelector('.drama-clip-english');
  activeText?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'center'
  });
  if (activeAudio === state.dramaPlaylistExpectedAudio) {
    state.dramaPlaylistExpectedAudio = null;
  } else {
    state.dramaPlaylistActive = false;
    state.dramaPlaylistIndex = 0;
    updateDramaPlaybackButtons();
  }
}

function onDramaAudioPause(audio) {
  audio.closest('.drama-clip')?.classList.remove('is-playing');
  const audios = [...document.querySelectorAll('.drama-audio')];
  if (state.dramaPlaylistActive && audios[state.dramaPlaylistIndex] === audio && !audio.ended) {
    state.dramaPlaylistActive = false;
    state.dramaPlaylistExpectedAudio = null;
    updateDramaPlaybackButtons();
  }
}

function onDramaAudioEnded(audio) {
  audio.closest('.drama-clip')?.classList.remove('is-playing');
  if (!state.dramaPlaylistActive) return;
  const audios = [...document.querySelectorAll('.drama-audio')];
  if (audios[state.dramaPlaylistIndex] !== audio) return;
  const nextIndex = state.dramaPlaylistIndex + 1;
  if (nextIndex < audios.length) {
    playDramaAudioAt(nextIndex);
  } else if (state.dramaRepeat) {
    playDramaAudioAt(0, true);
  } else {
    state.dramaPlaylistActive = false;
    state.dramaPlaylistIndex = 0;
    updateDramaPlaybackButtons();
  }
}

function playDramaAudioAt(index, restart = false) {
  const audios = [...document.querySelectorAll('.drama-audio')];
  const audio = audios[index];
  if (!audio) return;
  state.dramaPlaylistIndex = index;
  state.dramaPlaylistActive = true;
  state.dramaPlaylistExpectedAudio = audio;
  if (restart) audio.currentTime = 0;
  audio.play().catch(() => {
    state.dramaPlaylistActive = false;
    state.dramaPlaylistExpectedAudio = null;
    updateDramaPlaybackButtons();
  });
  updateDramaPlaybackButtons();
}

function toggleDramaPlayAll() {
  const audios = [...document.querySelectorAll('.drama-audio')];
  if (!audios.length) return;
  if (state.dramaPlaylistActive) {
    state.dramaPlaylistActive = false;
    state.dramaPlaylistExpectedAudio = null;
    audios[state.dramaPlaylistIndex]?.pause();
    updateDramaPlaybackButtons();
    return;
  }
  clearDramaSingleRepeat();
  playDramaAudioAt(state.dramaPlaylistIndex);
}

function toggleDramaRepeat() {
  state.dramaRepeat = !state.dramaRepeat;
  if (state.dramaRepeat) clearDramaSingleRepeat();
  updateDramaPlaybackButtons();
}

function clearDramaSingleRepeat() {
  document.querySelectorAll('.drama-audio').forEach(audio => { audio.loop = false; });
  state.dramaSingleRepeatIndex = -1;
  updateDramaSingleRepeatButtons();
}

function toggleDramaSingleRepeat(index) {
  const audios = [...document.querySelectorAll('.drama-audio')];
  const audio = audios[index];
  if (!audio) return;
  if (state.dramaSingleRepeatIndex === index) {
    clearDramaSingleRepeat();
    return;
  }
  clearDramaSingleRepeat();
  state.dramaPlaylistActive = false;
  state.dramaPlaylistIndex = 0;
  state.dramaPlaylistExpectedAudio = null;
  state.dramaRepeat = false;
  updateDramaPlaybackButtons();
  state.dramaSingleRepeatIndex = index;
  audio.loop = true;
  audio.currentTime = 0;
  updateDramaSingleRepeatButtons();
  audio.play().catch(() => {});
}

function updateDramaSingleRepeatButtons() {
  document.querySelectorAll('.drama-single-repeat').forEach((button, index) => {
    const active = state.dramaSingleRepeatIndex === index;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', `この音声をリピート ${active ? 'オン' : 'オフ'}`);
    button.textContent = active ? '↻ リピート中' : '↻ この音声をリピート';
  });
}

function updateDramaPlaybackButtons() {
  const playButton = document.getElementById('dramaPlayAll');
  const repeatButton = document.getElementById('dramaRepeat');
  if (playButton) {
    playButton.innerHTML = state.dramaPlaylistActive ? '❚❚ <span>一時停止</span>' : '▶ <span>まとめて再生</span>';
    playButton.setAttribute('aria-label', state.dramaPlaylistActive ? 'まとめて再生を一時停止' : 'まとめて再生');
  }
  if (repeatButton) {
    repeatButton.classList.toggle('active', state.dramaRepeat);
    repeatButton.setAttribute('aria-pressed', String(state.dramaRepeat));
    repeatButton.setAttribute('aria-label', `リピート ${state.dramaRepeat ? 'オン' : 'オフ'}`);
  }
}

function toggleDramaExamples(index) {
  const panel = document.getElementById(`dramaExamples-${index}`);
  const button = document.getElementById(`dramaMore-${index}`);
  if (!panel || !button) return;
  panel.hidden = !panel.hidden;
  button.setAttribute('aria-expanded', String(!panel.hidden));
  button.textContent = panel.hidden ? 'その他 ▾' : 'その他 ▴';
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
  if (state.homeFilter === 'D') return renderDramaGrid();

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
      <button class="song-card" onclick="showShadowing(state.songs[${originalIndex}])">
        <div class="song-art ${song.thumbnailUrl ? 'has-thumb' : grad}" ${bgStyle}>
          <span class="song-play-icon" aria-hidden="true">▶</span>
        </div>
        <div class="song-card-overlay">
          <div class="song-card-name">${esc(song.songName)}</div>
          <div class="song-card-artist">${esc(song.artist)}</div>
        </div>
      </button>`;
  }).join('');
  return `<section class="home-library"><div class="section-heading"><div><p class="section-eyebrow">LEARN WITH MUSIC</p><h2>洋楽から学ぶ</h2></div><span>${filteredSongs.length}曲</span></div><div class="song-grid">${cards}</div></section>`;
}

function renderDramaGrid() {
  const drama = state.dramas.find(item => item.id === state.currentDramaId);
  const episode = drama?.episodes.find(item => item.id === state.currentEpisodeId);

  if (episode) {
    const clips = episode.clips.map((clip, index) => {
      const examples = Array.isArray(clip.otherExamples) ? clip.otherExamples : [];
      const examplesHtml = examples.map(example => `
        <li class="drama-example">
          <p lang="en">${esc(example.english)}</p>
          <p>${esc(example.japanese)}</p>
        </li>`).join('');
      return `
      <article class="drama-clip">
        <div class="drama-clip-heading"><span>${String(index + 1).padStart(2, '0')}</span><span>音声</span></div>
        <p class="drama-clip-english" lang="en">${esc(clip.english)}</p>
        <p class="drama-clip-japanese">${esc(clip.japanese)}</p>
        <audio class="drama-audio" controls preload="none" src="${esc(clip.audio)}" onplay="onDramaAudioPlay(this)" onpause="onDramaAudioPause(this)" onended="onDramaAudioEnded(this)" aria-label="${esc(clip.english)}"></audio>
        <div class="drama-clip-actions">
          <button class="drama-single-repeat" onclick="toggleDramaSingleRepeat(${index})" aria-pressed="false" aria-label="この音声をリピート オフ">↻ この音声をリピート</button>
          ${examples.length ? `<button id="dramaMore-${index}" class="drama-more" onclick="toggleDramaExamples(${index})" aria-expanded="false" aria-controls="dramaExamples-${index}">その他 ▾</button>` : ''}
        </div>
        ${examples.length ? `<div id="dramaExamples-${index}" class="drama-examples" hidden>
          <h4>この構文を使った短い言い方</h4>
          <ul>${examplesHtml}</ul>
        </div>` : ''}
      </article>`;
    }).join('');
    return `<section class="home-library drama-library">
      <button class="drama-back" onclick="showDrama('${drama.id}')">← 話数一覧へ</button>
      <p class="section-eyebrow">DRAMA PHRASES</p>
      <h2 class="drama-page-title">${esc(drama.title)}</h2>
      <p class="drama-page-subtitle">第${episode.number}話 ${esc(episode.title)}</p>
      <div class="section-heading drama-section-heading"><h3>この回の音声</h3><span>${episode.clips.length}件</span></div>
      <div class="drama-playback-controls">
        <button id="dramaPlayAll" class="drama-play-all" onclick="toggleDramaPlayAll()" aria-label="まとめて再生">▶ <span>まとめて再生</span></button>
        <button id="dramaRepeat" class="drama-repeat ${state.dramaRepeat ? 'active' : ''}" onclick="toggleDramaRepeat()" aria-pressed="${state.dramaRepeat}" aria-label="リピート ${state.dramaRepeat ? 'オン' : 'オフ'}">↻ <span>リピート</span></button>
      </div>
      <div class="drama-clip-list">${clips}</div>
    </section>`;
  }

  if (drama) {
    const episodes = drama.episodes.map(item => `
      <button class="drama-episode" onclick="showDramaEpisode('${item.id}')">
        <span class="drama-episode-number">第${item.number}話</span>
        <span class="drama-episode-title">${esc(item.title)}</span>
        <span class="drama-episode-count">音声${item.clips.length}件</span>
        <span class="drama-episode-arrow" aria-hidden="true">›</span>
      </button>`).join('');
    return `<section class="home-library drama-library">
      <button class="drama-back" onclick="showDrama(null)">← ドラマ一覧へ</button>
      <p class="section-eyebrow">DRAMA LIBRARY</p>
      <h2 class="drama-page-title">${esc(drama.title)}</h2>
      <div class="drama-episode-list">${episodes}</div>
    </section>`;
  }

  const cards = state.dramas.map(item => `
    <div class="drama-title-tile">
      <button class="drama-title-card" onclick="showDrama('${item.id}')">
        <span class="drama-title-image" style="background-image:linear-gradient(0deg,rgba(22,41,43,.1),rgba(22,41,43,.1)),url('${esc(item.image)}')"></span>
        <span class="drama-title-info"><strong>${esc(item.title)}</strong><small>${item.episodes.length}話 · 音声${item.episodes.reduce((sum, entry) => sum + entry.clips.length, 0)}件</small></span>
      </button>
      <a class="drama-image-credit" href="${esc(item.imageSource)}" target="_blank" rel="noopener noreferrer">画像出典</a>
    </div>`).join('');
  return `<section class="home-library drama-library">
    <div class="section-heading"><div><p class="section-eyebrow">DRAMA LIBRARY</p><h2>ドラマから学ぶ</h2></div><span>${state.dramas.length}作品</span></div>
    ${cards ? `<div class="drama-title-grid">${cards}</div>` : '<p class="drama-empty">ドラマのデータはまだありません。</p>'}
  </section>`;
}

function renderPhraseGrid() {
  const packPhrases = getPhrasesForCurrentPack();
  const categories = ['すべて', ...Array.from(new Set(packPhrases.map(p => p.category)))];
  if (!categories.includes(state.phraseCategory)) state.phraseCategory = 'すべて';
  const categoryPhrases = state.phraseCategory === 'すべて'
    ? packPhrases
    : packPhrases.filter(p => p.category === state.phraseCategory);
  const filtered = categoryPhrases;
  const visiblePlayableCount = categoryPhrases.filter(p => p.audio).length;

  const chips = categories.map(category => `
    <button class="phrase-filter-chip ${state.phraseCategory === category ? 'active' : ''}"
            onclick="setPhraseCategory('${esc(category)}')">${esc(category)}</button>
  `).join('');

  const packTabs = ['基本', 'リアル会話', '初対面', '相手を知る質問', '会話を止めない', '感情を出す', '人間関係', 'リアル口語', '使い回せる型', 'すべて'].map(pack => `
    <button class="phrase-pack-tab ${state.phrasePack === pack ? 'active' : ''}" onclick="setPhrasePack('${pack}')">${pack}</button>
  `).join('');

  const cards = filtered.map((phrase, index) => `
    <div class="phrase-card phrase-card-${index % 12}" onclick="showPhrase(state.phrases.find(p => p.id === '${phrase.id}'))">
      <div class="phrase-card-category">${esc(phrase.category)}</div>
      <div class="phrase-card-title">${esc(phrase.phrase)}</div>
      <div class="phrase-card-note">${esc(phrase.usageNote)}</div>
      <div class="phrase-card-count">${phrase.lines.length}ラリー</div>
    </div>
  `).join('');

  const featured = filtered.find(phrase => phrase.audio) || filtered[0];
  const featuredTranslation = featured?.lines.find(([, english]) => english === featured.phrase)?.[2] || featured?.lines[0]?.[2] || '';
  return `
    <section class="home-library phrase-library">
      <div class="section-heading"><div><p class="section-eyebrow">SPEAK NATURALLY</p><h2>今日使えるひと言</h2></div></div>
      ${featured ? `<button class="featured-phrase" onclick="showPhrase(state.phrases.find(p => p.id === '${featured.id}'))"><span class="featured-kicker">まずは、このフレーズから</span><strong>${esc(featured.phrase)}</strong><span class="featured-translation">${esc(featuredTranslation)}</span><span class="featured-action">会話を見る <span aria-hidden="true">→</span></span></button>` : ''}
      <div class="section-heading phrase-explore-heading"><div><p class="section-eyebrow">EXPLORE</p><h2>シーンから探す</h2></div></div>
    <div class="phrase-tools">
      <div class="phrase-pack-tabs" id="phrasePackTabs">${packTabs}</div>
      <div class="phrase-count">${filtered.length} フレーズ <span>・音声あり ${visiblePlayableCount}</span></div>
      <div class="phrase-filter-wrap">
        <div class="phrase-filter-row" id="phraseFilterRow">${chips}</div>
      </div>
      <div class="phrase-random-panel">
        <span>ランダム練習</span>
        <button class="phrase-today-btn" onclick="startTodayPhrasePractice()">Today</button>
        <button onclick="startPhrasePractice(10)">10</button>
        <button onclick="startPhrasePractice(30)">30</button>
        <button onclick="startPhrasePractice('all')">すべて</button>
      </div>
    </div>
    <div class="phrase-grid">${cards}</div>
    </section>
  `;
}

function getPhrasePack(phrase) {
  return phrase.pack || '基本';
}

function getPhrasesForCurrentPack() {
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
  const audioControls = renderPhraseAudioControls(phrase, false);
  const imageSrc = getPhraseImageSrc(phrase);
  const translation = phrase.lines.find(([, english]) => english === phrase.phrase)?.[2] || phrase.lines[0]?.[2] || '';
  app.className = 'page-phrase-detail';

  app.innerHTML = `
    <div class="shadowing-view phrase-detail-view">
      <div class="shadowing-header">
        <button class="back-btn" onclick="showHome()" aria-label="ホームに戻る">←</button>
        <div class="title-jp-group">
          <div class="shadowing-song-info">
            <div class="shadowing-song-name">会話フレーズ</div>
            <div class="shadowing-song-artist">${esc(phrase.category)}</div>
          </div>
        </div>
      </div>
      <div class="phrase-detail-heading"><p class="section-eyebrow">SPEAK NATURALLY</p><h1>今日使えるひと言</h1></div>
      <section class="phrase-feature-detail">
        ${imageSrc ? `<div class="phrase-feature-image"><img src="${esc(imageSrc)}" alt="${esc(phrase.phrase)}"></div>` : `<div class="phrase-feature-art" aria-hidden="true"><span>“</span></div>`}
        <div class="phrase-feature-body">
          <span class="phrase-feature-category">${esc(phrase.category)}</span>
          <h2>${esc(phrase.phrase)}</h2>
          <p>${esc(translation)}</p>
          ${phrase.voiceCast ? `<div class="phrase-voice-cast"><span>A · ${esc(phrase.voiceCast.A.name)}</span><span>B · ${esc(phrase.voiceCast.B.name)}</span></div>` : ''}
          ${audioControls}
        </div>
      </section>
      <div class="phrase-conversation">
        <div class="section-heading conversation-heading"><div><p class="section-eyebrow">IN CONVERSATION</p><h2>会話で使ってみる</h2></div></div>
        ${turnsHtml}
        <div class="phrase-usage-note">
          <span>使う場面</span>
          <p>${esc(phrase.usageNote)}</p>
        </div>
        <div class="phrase-audio-note">${phrase.voiceCast ? 'A・Bを別の声で収録した会話音声です。' : phrase.audio ? '3ラリーを1本にまとめた音声です。' : '音声は次の工程で生成予定です。'}</div>
        <div class="phrase-detail-nav">
          <button class="phrase-prev-btn" onclick="showPreviousPhrase()">prev</button>
          <button class="phrase-next-btn" onclick="showNextPhrase()">next</button>
        </div>
      </div>
    </div>
  `;
}

function renderPhraseAudioControls(phrase, shouldAutoAdvance) {
  if (!phrase.audio) return '';
  const isRepeating = state.phraseAudioRepeat && state.phraseAudioSrc === normalizePhraseAudioSrc(phrase.audio);
  const src = esc(phrase.audio);
  return `
    <div class="phrase-audio-controls">
      <button class="phrase-play-all-btn" onclick="playPhraseSharedAudio('${src}', { autoAdvance: ${shouldAutoAdvance} })">▶ 再生</button>
      <button class="phrase-repeat-btn ${isRepeating ? 'active' : ''}"
              data-phrase-repeat-src="${src}"
              onclick="togglePhraseRepeat('${src}')">
        ${isRepeating ? '↻ リピート中' : '↻ リピート'}
      </button>
    </div>
  `;
}

function getPhraseImageSrc(phrase) {
  return state.phraseImages?.[phrase.id] || '';
}

function renderPhraseVisual(phrase, { label, cardIndex }) {
  const src = getPhraseImageSrc(phrase);
  if (!src) {
    return `
      <div class="phrase-hero phrase-card-${cardIndex % 12}">
        <div class="phrase-hero-label">${esc(label)}</div>
        <h2>${esc(phrase.phrase)}</h2>
        <p>${esc(phrase.usageNote)}</p>
      </div>
    `;
  }

  return `
    <div class="phrase-image-shell">
      <div class="phrase-image-card">
        <img src="${esc(src)}" alt="${esc(phrase.phrase)}" class="phrase-image">
      </div>
      <div class="phrase-image-meta">
        <div class="phrase-image-label">${esc(label)}</div>
        <p>${esc(phrase.usageNote)}</p>
      </div>
    </div>
  `;
}

function playPhraseAudio(src) {
  playPhraseSharedAudio(src, { autoAdvance: false });
}

function readStoredValue(key) {
  try {
    const value = localStorage.getItem(key);
    if (value) return value;
  } catch {}

  try {
    const match = document.cookie
      .split('; ')
      .find(part => part.startsWith(`${key}=`));
    if (!match) return '';
    return decodeURIComponent(match.slice(key.length + 1));
  } catch {
    return '';
  }
}

function writeStoredValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}

  try {
    document.cookie = `${key}=${encodeURIComponent(value)}; max-age=${STORAGE_COOKIE_MAX_AGE}; path=/; samesite=lax`;
  } catch {}
}

function readStoredIds(key) {
  try {
    const ids = JSON.parse(readStoredValue(key) || '[]');
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

function writeStoredIds(key, ids) {
  writeStoredValue(key, JSON.stringify(ids));
}

function createDeviceId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadDeviceId() {
  let id = readStoredValue(DEVICE_ID_KEY);
  if (!/^[a-z0-9-]{12,80}$/i.test(id)) id = createDeviceId();
  writeStoredValue(DEVICE_ID_KEY, id);
  return id;
}

function loadHiddenPhrases() {
  state.hiddenPhraseIds = new Set(readStoredIds('hiddenPhraseIds'));
}

function loadSavedPhrases() {
  state.savedPhraseIds = new Set(readStoredIds('savedPhraseIds'));
}

function saveHiddenPhrases() {
  writeStoredIds('hiddenPhraseIds', Array.from(state.hiddenPhraseIds));
  queuePhrasePreferencesSync();
}

function saveSavedPhrases() {
  writeStoredIds('savedPhraseIds', Array.from(state.savedPhraseIds));
  queuePhrasePreferencesSync();
}

function renderCurrentPhraseView() {
  if (state.view === 'phrase') renderPhraseDetail();
  else if (state.view === 'phrasePractice') renderPhrasePractice();
  else renderHome();
}

function mergePhrasePreferenceIds(remoteIds, localSet) {
  return new Set([
    ...Array.from(localSet),
    ...(Array.isArray(remoteIds) ? remoteIds : [])
  ]);
}

function queuePhrasePreferencesSync() {
  if (!state.deviceId) return;
  clearTimeout(state.phrasePrefsSyncTimer);
  state.phrasePrefsSyncTimer = setTimeout(pushPhrasePreferencesToServer, 500);
}

async function syncPhrasePreferencesFromServer() {
  if (!state.deviceId) return;

  try {
    const res = await fetch(`/api/phrase-preferences/${encodeURIComponent(state.deviceId)}`);
    if (!res.ok) return;
    const prefs = await res.json();
    if (!prefs.enabled) return;

    if (prefs.found) {
      state.savedPhraseIds = mergePhrasePreferenceIds(prefs.savedPhraseIds, state.savedPhraseIds);
      state.hiddenPhraseIds = mergePhrasePreferenceIds(prefs.hiddenPhraseIds, state.hiddenPhraseIds);
      writeStoredIds('savedPhraseIds', Array.from(state.savedPhraseIds));
      writeStoredIds('hiddenPhraseIds', Array.from(state.hiddenPhraseIds));
      renderCurrentPhraseView();
    }

    pushPhrasePreferencesToServer();
  } catch {}
}

async function pushPhrasePreferencesToServer() {
  if (!state.deviceId) return;

  try {
    await fetch(`/api/phrase-preferences/${encodeURIComponent(state.deviceId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        savedPhraseIds: Array.from(state.savedPhraseIds),
        hiddenPhraseIds: Array.from(state.hiddenPhraseIds)
      })
    });
  } catch {}
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
  return byCategory.filter(p => p.audio);
}

function getAllPhrasePool() {
  return state.phrases.filter(p => p.audio);
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayPhraseScopeKey() {
  return TODAY_PHRASE_SCOPE_KEY;
}

function hashStringToSeed(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seedText) {
  let seed = hashStringToSeed(seedText);
  return () => {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffleArray(items, seedText) {
  const copy = [...items];
  const random = seededRandom(seedText);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function readTodayPhraseStore() {
  try {
    const store = JSON.parse(readStoredValue(TODAY_PHRASE_SET_KEY) || '{}');
    return store && typeof store === 'object' && !Array.isArray(store) ? store : {};
  } catch {
    return {};
  }
}

function writeTodayPhraseStore(store) {
  writeStoredValue(TODAY_PHRASE_SET_KEY, JSON.stringify(store));
}

function getTodayPhraseSet(pool) {
  const dateKey = getLocalDateKey();
  const scopeKey = getTodayPhraseScopeKey();
  const limit = Math.min(TODAY_PHRASE_LIMIT, pool.length);
  const phraseById = new Map(pool.map(phrase => [phrase.id, phrase]));
  const store = readTodayPhraseStore();
  const stored = store[scopeKey];

  let phrases = [];
  if (stored?.date === dateKey && Array.isArray(stored.ids)) {
    phrases = stored.ids.map(id => phraseById.get(id)).filter(Boolean).slice(0, limit);
  }

  if (phrases.length < limit) {
    const selectedIds = new Set(phrases.map(phrase => phrase.id));
    const candidates = seededShuffleArray(
      pool.filter(phrase => !selectedIds.has(phrase.id)),
      `${dateKey}::${scopeKey}`
    );
    phrases = phrases.concat(candidates.slice(0, limit - phrases.length));
  }

  store[scopeKey] = { date: dateKey, ids: phrases.map(phrase => phrase.id) };
  writeTodayPhraseStore(store);
  return { dateKey, phrases };
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
  state.practiceMode = 'random';
  state.shouldAutoplayPractice = true;
  state.view = 'phrasePractice';
  renderPhrasePractice();
}

function startTodayPhrasePractice() {
  stopAudio();
  stopPhrasePracticeAudio();

  const pool = getAllPhrasePool();
  if (pool.length === 0) {
    showToast('再生できる会話音声がありません');
    return;
  }

  const todaySet = getTodayPhraseSet(pool);
  state.practiceSet = shuffleArray(todaySet.phrases);
  state.practiceIndex = 0;
  state.practiceCount = String(todaySet.phrases.length);
  state.practiceTitle = `Today ${todaySet.dateKey}`;
  state.practiceMode = 'today';
  state.shouldAutoplayPractice = true;
  state.view = 'phrasePractice';
  renderPhrasePractice();
}

function restartPractice() {
  if (state.practiceSet.length === 0) return;
  stopPhrasePracticeAudio();
  state.practiceSet = shuffleArray(state.practiceSet);
  state.practiceIndex = 0;
  state.shouldAutoplayPractice = true;
  state.view = 'phrasePractice';
  renderPhrasePractice();
}

function getPracticeLineText(line) {
  const speaker = Array.isArray(line) ? line[0] : line.speaker;
  const english = Array.isArray(line) ? line[1] : line.english;
  return `${speaker}: ${english}`;
}

function getTodayPracticeCopyText() {
  const dateKey = state.practiceTitle.replace(/^Today\s+/, '') || getLocalDateKey();
  const entries = state.practiceSet.map((phrase, index) => {
    const lines = phrase.lines.map(getPracticeLineText).join('\n');
    return `${index + 1}. [${phrase.category}] ${phrase.phrase}\nID: ${phrase.id}\n${lines}`;
  }).join('\n\n');

  return [
    `今日のランダム15個 (${dateKey})`,
    'この15個だけを使って、AI音声で英会話練習してください。',
    '英語の会話行は、下に貼ったA/B/Aの原文だけを使ってください。',
    '新しい英文、別の返答、別シナリオは作らないでください。',
    'AIスタート、自分スタート、シャドーイングの練習に対応してください。',
    '',
    entries
  ].join('\n');
}

async function writeClipboardText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('copy failed');
}

async function copyTodayPracticeSet() {
  if (state.practiceMode !== 'today' || state.practiceSet.length === 0) {
    showToast('今日の15個がありません');
    return;
  }

  try {
    await writeClipboardText(getTodayPracticeCopyText());
    showToast('今日の15個をコピーしました');
  } catch {
    showToast('コピーできませんでした');
  }
}

function renderPhrasePractice() {
  const app = document.getElementById('app');
  app.className = 'page-phrase-practice';
  const total = state.practiceSet.length;
  const phrase = state.practiceSet[state.practiceIndex];
  const isPracticeComplete = state.practiceSet.length > 0;
  const isTodayPracticeComplete = state.practiceMode === 'today' && isPracticeComplete;
  const againButtonHtml = isPracticeComplete
    ? '<button class="practice-again-btn" onclick="restartPractice()">Again</button>'
    : '';
  const copyButtonHtml = isTodayPracticeComplete
    ? '<button class="practice-copy-btn" onclick="copyTodayPracticeSet()">今日の15個をコピー</button>'
    : '';
  const completeMessage = isPracticeComplete
    ? 'Againで同じセットを最初から練習できます。'
    : 'おつかれさまでした。もう一度やる場合は会話フレーズから始められます。';

  if (!phrase) {
    app.innerHTML = `
      <div class="shadowing-view phrase-practice-view">
        <div class="shadowing-header">
          <button class="back-btn" onclick="showHome()">←</button>
          <div class="shadowing-song-info">
            <div class="shadowing-song-name">${esc(state.practiceTitle || 'ランダム練習')}</div>
            <div class="shadowing-song-artist">完了</div>
          </div>
        </div>
        <div class="practice-complete">
          <h2>今回のセットは完了しました</h2>
          <p>${completeMessage}</p>
          <div class="practice-complete-actions">
            ${againButtonHtml}
            ${copyButtonHtml}
            <button class="practice-back-btn" onclick="showHome()">会話フレーズに戻る</button>
          </div>
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
  const audioControls = renderPhraseAudioControls(phrase, true);
  const headerCopyButtonHtml = state.practiceMode === 'today'
    ? '<button class="practice-copy-btn practice-header-copy-btn" onclick="copyTodayPracticeSet()">15をコピー</button>'
    : '';
  const phraseVisual = renderPhraseVisual(phrase, {
    label: `${phrase.category} ・ ${state.practiceIndex + 1} / ${total}`,
    cardIndex: state.phrases.indexOf(phrase)
  });

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
        ${headerCopyButtonHtml}
      </div>

      <div class="practice-progress">
        <div style="width:${((state.practiceIndex + 1) / total) * 100}%"></div>
      </div>

      ${phraseVisual}

      <div class="phrase-conversation">
        ${audioControls}
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
  playPhraseSharedAudio(src, { autoAdvance: true });
}

function normalizePhraseAudioSrc(src) {
  try {
    return new URL(src, window.location.href).href;
  } catch {
    return src;
  }
}

function playPhraseSharedAudio(src, { repeat = false, autoAdvance = false } = {}) {
  stopAudio();
  if (!state.phrasePracticeAudio) {
    state.phrasePracticeAudio = new Audio();
    state.phrasePracticeAudio.preload = 'auto';
  } else {
    state.phrasePracticeAudio.pause();
    try { state.phrasePracticeAudio.currentTime = 0; } catch {}
  }

  const absoluteSrc = normalizePhraseAudioSrc(src);
  if (state.phrasePracticeAudio.src !== absoluteSrc) {
    state.phrasePracticeAudio.src = src;
  }

  state.phraseAudioRepeat = repeat;
  state.phraseAudioSrc = absoluteSrc;
  state.phrasePracticeAudio.loop = repeat;
  state.phrasePracticeAudio.onended = () => {
    if (!repeat && autoAdvance && state.view === 'phrasePractice') {
      const advance = () => {
        if (state.view === 'phrasePractice') movePractice(1);
      };
      if (document.hidden) advance();
      else setTimeout(advance, PHRASE_AUTO_ADVANCE_DELAY_MS);
    }
  };
  state.phrasePracticeAudio.onplay = () => {
    if (activeMediaType === 'phrase') setMediaPlaybackState(true);
  };
  state.phrasePracticeAudio.onpause = () => {
    if (activeMediaType === 'phrase') setMediaPlaybackState(false);
  };
  updatePhraseRepeatButtons();
  const phrase = state.view === 'phrasePractice' ? state.practiceSet[state.practiceIndex] : state.currentPhrase;
  setMediaSession('phrase', phrase?.phrase || '会話フレーズ', 'Lyric Shadows');
  state.phrasePracticeAudio.play().catch(() => showToast('音声を再生できませんでした。再生ボタンを押してください'));
}

function togglePhraseRepeat(src) {
  const absoluteSrc = normalizePhraseAudioSrc(src);
  if (state.phraseAudioRepeat && state.phraseAudioSrc === absoluteSrc) {
    stopPhrasePracticeAudio();
    showToast('リピートを停止しました');
    return;
  }
  playPhraseSharedAudio(src, { repeat: true, autoAdvance: false });
  showToast('リピート再生中');
}

function updatePhraseRepeatButtons() {
  document.querySelectorAll('[data-phrase-repeat-src]').forEach(btn => {
    const isActive = state.phraseAudioRepeat && state.phraseAudioSrc === normalizePhraseAudioSrc(btn.dataset.phraseRepeatSrc);
    btn.classList.toggle('active', isActive);
    btn.textContent = isActive ? '↻ リピート中' : '↻ リピート';
  });
}

function stopPhrasePracticeAudio() {
  if (state.phrasePracticeAudio) {
    state.phrasePracticeAudio.pause();
    try { state.phrasePracticeAudio.currentTime = 0; } catch {}
    state.phrasePracticeAudio.loop = false;
    state.phrasePracticeAudio.onended = null;
  }
  state.phraseAudioRepeat = false;
  state.phraseAudioSrc = '';
  clearMediaSession('phrase');
  updatePhraseRepeatButtons();
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
function renderLyricConnections(links, open = false) {
  if (!Array.isArray(links) || !links.length) return '';
  return `<details class="lyric-connections" ${open ? 'open' : ''}>
    <summary>歌詞と会話のつながり <span>${links.length}表現</span></summary>
    <div class="lyric-connection-list">${links.map(link => `
      <div class="lyric-connection">
        <div><small>歌詞</small><strong>${esc(link.lyricExpression || '')}</strong></div>
        <div><small>会話では</small><strong>${esc(link.conversationExpression || '')}</strong></div>
        <p>${esc(link.explanationJa || '')}</p>
      </div>`).join('')}</div>
  </details>`;
}

function hasConversationAudio(song) {
  return song.conversationAudioStatus !== 'text_only' && song.conversation?.some(turn => turn.sentences?.some(sentence => sentence.audio));
}

function songTicketKey(song = state.currentSong) {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return `songTicketsV1:${song?.folderName || song?.id}:${day}`;
}

function getSongTickets() {
  try {
    const saved = JSON.parse(localStorage.getItem(songTicketKey()) || '{}');
    return { listens: Math.max(0, Number(saved.listens) || 0), used: Math.max(0, Number(saved.used) || 0) };
  } catch {
    return { listens: 0, used: 0 };
  }
}

function saveSongTickets(tickets) {
  try { localStorage.setItem(songTicketKey(), JSON.stringify(tickets)); } catch {}
  updateSongTicketDisplay();
}

function availableSongTickets(tickets = getSongTickets()) {
  return Math.max(0, Math.floor(tickets.listens / SONG_LISTENS_PER_PLAY) - tickets.used);
}

function updateSongTicketDisplay() {
  const tickets = getSongTickets();
  const available = availableSongTickets(tickets);
  const progress = tickets.listens % SONG_LISTENS_PER_PLAY;
  document.querySelectorAll('.song-ticket-count').forEach(el => { el.textContent = `${available}回`; });
  document.querySelectorAll('.song-ticket-progress').forEach(el => { el.textContent = `${progress} / ${SONG_LISTENS_PER_PLAY}回`; });
  document.querySelectorAll('.song-ticket-bar-fill').forEach(el => { el.style.width = `${progress / SONG_LISTENS_PER_PLAY * 100}%`; });
  document.querySelectorAll('.song-ticket-listens').forEach(el => { el.textContent = `今日の会話：${tickets.listens}回完了`; });
  const start = document.getElementById('songTicketStart');
  if (start) {
    start.disabled = available === 0 && !state.songTicketSessionActive;
    start.textContent = state.songTicketSessionActive ? 'Songを再開' : available > 0 ? `Songを聞く（残り${available}回）` : 'あと会話を聞いて解放';
  }
  const play = document.getElementById('songPlayBtn');
  if (play) play.disabled = available === 0 && !state.songTicketSessionActive;
}

function renderSongTicketCard(withButton = false) {
  return `<section class="song-ticket-card" aria-label="今日のSong再生券">
    <div class="song-ticket-heading"><span>♫ 今日のSong再生券</span><strong class="song-ticket-count">0回</strong></div>
    <p class="song-ticket-rule">会話を最後まで5回聞くと、Songを1回再生できます。</p>
    <div class="song-ticket-progress-row"><span>次の1回まで</span><strong class="song-ticket-progress">0 / 5回</strong></div>
    <div class="song-ticket-bar"><div class="song-ticket-bar-fill"></div></div>
    <p class="song-ticket-listens">今日の会話：0回完了</p>
    ${withButton ? '<button class="song-ticket-start" id="songTicketStart" onclick="startSongFromTicket()" disabled>あと会話を聞いて解放</button>' : ''}
  </section>`;
}

function renderShadowing() {
  const song = state.currentSong;
  const hasAudio = hasConversationAudio(song);
  const app = document.getElementById('app');
  app.className = 'page-shadowing';

  // ---- Conversation HTML ----
  const turnsHtml = song.conversation.map((turn, tIdx) => {
    const isA = turn.speaker === 'A';
    const cardClass = isA ? 'speaker-a' : 'speaker-b';
    const avatarClass = isA ? 'speaker-a-avatar' : 'speaker-b-avatar';
    const sentHtml = turn.sentences.map((s, sIdx) => {
      const flatIdx = getFlatIndex(tIdx, sIdx);
      const content = s.displayHtml || esc(s.text);
      return `<div class="sentence-item" id="sent-${flatIdx}" ${hasAudio ? `onclick="clickSentence(${flatIdx})"` : ''}>
        <div class="sentence-text">${content}</div></div>`;
    }).join('');
    const jpClass = state.showJapanese ? 'japanese-text visible' : 'japanese-text';
    return `<div class="turn-card ${cardClass}">
      <div class="turn-header">
        ${speakerAvatar(song, turn.speaker, avatarClass)}
        <span class="speaker-name">${esc(turn.speakerName)}</span>
      </div>
      <div class="sentences-list">${sentHtml}</div>
      <div class="${jpClass}" id="jp-${tIdx}">${esc(turn.japanese)}</div>
    </div>`;
  }).join('');

  // ---- Song tab HTML: lyrics + video below ----
  const lyricsHtml = renderLyrics(song.lyricDisplay ? { ...song, ...song.lyricDisplay } : song);
  let mediaHtml = '';
  if (song.hasLocalAudio) {
    mediaHtml = `
      <div class="song-audio-player">
        <audio id="songAudioPlayer" src="/songs/${encodeURIComponent(song.folderName)}/original.mp3" onplay="onSongAudioPlay()" onpause="onSongAudioPause()" onended="onSongAudioEnded()" ontimeupdate="updateLyricSync()" onseeked="updateLyricSync()"></audio>
        <div class="song-controls">
          <button class="song-ctrl-btn" onclick="skipSongAudio(-5)" title="5秒戻る">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
            <span>5s</span>
          </button>
          <button class="song-ctrl-btn" onclick="skipSongAudio(-1)" title="1秒戻る">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            <span>1s</span>
          </button>
          <button class="song-ctrl-play" id="songPlayBtn" onclick="toggleSongPlay()" aria-label="Songを再生">
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
  const timingNote = song.lyricTimingStatus === 'estimated' ? '<p class="lyric-sync-note">仮同期：歌詞の時刻は概算です</p>' : '';
  const songTabHtml = `${renderSongTicketCard(true)}${timingNote}<div class="lyrics-display" ${song.hasLocalAudio ? 'style="padding-bottom: 90px;"' : ''}>${lyricsHtml}</div>${mediaHtml}`;

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
      ${renderLyricConnections(song.lyricConnections)}
      <div class="conversation-area" id="convArea">${hasAudio ? renderSongTicketCard() : '<p class="text-only-notice">会話文を新しい方針で作成しました。対応する会話音声はまだありません。</p>'}${turnsHtml}</div>
      <div class="song-area hidden" id="songArea">${songTabHtml}</div>
      <div class="play-controls conversation-player ${hasAudio ? '' : 'hidden'}" id="playControls">
        <div class="player-dock">
          <button class="restart-btn" onclick="restartAll()" aria-label="最初からやり直す" title="最初からやり直す">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11a8 8 0 1 1 2.1 6.4M4 4v7h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span class="control-label">最初から</span>
          </button>
          <button class="play-btn" id="playBtn" onclick="togglePlay()" aria-label="再生">${PLAYER_PLAY_ICON}<span class="control-label">再生</span></button>
          <button class="repeat-btn ${state.repeatMode !== 'off' ? 'active' : ''}" id="repeatBtn" onclick="cycleRepeat()" aria-label="リピート: ${state.repeatMode === 'one' ? '1行' : state.repeatMode === 'all' ? '全体' : 'オフ'}" title="リピートを切り替える">${repeatControlContent()}</button>
        </div>
      </div>
    </div>`;

  if (song.hasLocalAudio && Array.isArray(song.lyricTimings)) {
    const lyricsDisplay = app.querySelector('.lyrics-display');
    const seekFromRow = event => {
      const row = event.target.closest('.lyric-seek');
      if (row && lyricsDisplay.contains(row)) seekToLyric(Number(row.dataset.lyricIndex));
    };
    lyricsDisplay.addEventListener('click', seekFromRow);
    lyricsDisplay.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      seekFromRow(event);
    });
  }
  updateSongTicketDisplay();
}

function lyricPairOpenTag(song, index, line) {
  const seekable = song.hasLocalAudio && song.lyricTimings?.some(row => row.index === index);
  return `<div class="lyric-pair${seekable ? ' lyric-seek' : ''}" data-lyric-index="${index}"${seekable ? ` role="button" tabindex="0" aria-label="${esc(line)}から再生"` : ''}>`;
}

function renderLyrics(song) {
  if (!song.lyrics) return '<p class="no-lyrics">歌詞なし</p>';

  const enLines = song.lyrics.split('\n');

  if (Array.isArray(song.lyricsJa)) {
    if (song.lyricsJa.length === enLines.length) {
      return enLines.map((line, i) => {
        if (!line.trim()) return '<div class="lyric-spacer"></div>';
        const pair = song.lyricsJa[i] || {};
        const ja = pair.ja && pair.ja.trim() ? `<div class="lyric-ja">${esc(pair.ja)}</div>` : '';
        return `${lyricPairOpenTag(song, i, line)}<div class="lyric-en">${esc(line)}</div>${ja}</div>`;
      }).join('');
    }

    let availableJa = [...song.lyricsJa].filter(p => p.en && p.en.trim() && p.ja);
    const getWords = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    return enLines.map((line, index) => {
      if (!line.trim()) return '<div class="lyric-spacer"></div>';
      
      const lineWords = getWords(line);
      if (lineWords.length === 0) return `${lyricPairOpenTag(song, index, line)}<div class="lyric-en">${esc(line)}</div></div>`;
      
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
      
      return `${lyricPairOpenTag(song, index, line)}<div class="lyric-en">${esc(line)}</div>${jaHtml}</div>`;
    }).join('');
  }

  // Legacy fallback: lyricsJa is a plain string matched line-by-line
  const jaLines = song.lyricsJa ? song.lyricsJa.split('\n') : [];
  return enLines.map((line, i) => {
    if (!line.trim()) return '<div class="lyric-spacer"></div>';
    const ja = jaLines[i] && jaLines[i].trim() ? `<div class="lyric-ja">${esc(jaLines[i])}</div>` : '';
    return `${lyricPairOpenTag(song, i, line)}<div class="lyric-en">${esc(line)}</div>${ja}</div>`;
  }).join('');
}

function seekToLyric(index) {
  const timing = state.currentSong?.lyricTimings?.find(row => row.index === index);
  const audio = document.getElementById('songAudioPlayer');
  if (!timing || !audio) return;
  if (!state.songTicketSessionActive && availableSongTickets() === 0) {
    showToast('会話を5回聞くとSongを再生できます');
    return;
  }
  audio.currentTime = timing.start;
  updateLyricSync();
  if (audio.paused) startSongPlayback();
}

function updateLyricSync() {
  const audio = document.getElementById('songAudioPlayer');
  const timings = state.currentSong?.lyricTimings;
  if (!audio || !Array.isArray(timings) || !timings.length) return;

  const time = audio.currentTime;
  const current = timings.find(row => time >= row.start && time < row.end);
  const index = current ? current.index : -1;
  if (index !== state.activeLyricIndex) {
    document.querySelector('.lyric-pair.is-current')?.classList.remove('is-current');
    state.activeLyricIndex = index;
    if (index >= 0) {
      const row = document.querySelector(`.lyric-pair[data-lyric-index="${index}"]`);
      row?.classList.add('is-current');
      if (state.activeTab === 'song') row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  if (current) {
    const row = document.querySelector(`.lyric-pair[data-lyric-index="${index}"]`);
    const progress = Math.max(0, Math.min(100, (time - current.start) / (current.end - current.start) * 100));
    row?.style.setProperty('--lyric-progress', `${progress}%`);
  }
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
  if (!isConv) stopAudio();
  convArea?.classList.toggle('hidden', !isConv);
  songArea?.classList.toggle('hidden', isConv);
  settingBar?.classList.toggle('hidden', !isConv);
  playControls?.classList.toggle('hidden', !isConv || !hasConversationAudio(state.currentSong));
  if (jpBtn) jpBtn.style.display = isConv ? '' : 'none';
  tabConv?.classList.toggle('active', isConv);
  tabSong?.classList.toggle('active', !isConv);
  if (!isConv) updateLyricSync();

  if (isConv) {
    // Pause YouTube when switching back
    const frame = document.getElementById('ytFrame');
    if (frame) frame.src = '';
    // Pause local audio
    const audio = document.getElementById('songAudioPlayer');
    if (audio) { audio.pause(); }
    clearMediaSession('song');
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
    btn.setAttribute('aria-label', isPlaying ? 'Songを一時停止' : 'Songを再生');
  }
}

function onSongAudioPlay() {
  if (!state.songTicketSessionActive) {
    document.getElementById('songAudioPlayer')?.pause();
    return;
  }
  stopAudio();
  stopPhrasePracticeAudio();
  setMediaSession('song', state.currentSong?.songName || 'Song', state.currentSong?.artist || 'Lyric Shadows');
  setMediaPlaybackState(true);
  updateSongPlayBtn(true);
}

function onSongAudioPause() {
  if (activeMediaType === 'song') setMediaPlaybackState(false);
  updateSongPlayBtn(false);
}

function onSongAudioEnded() {
  state.songTicketSessionActive = false;
  updateSongPlayBtn(false);
  setMediaPlaybackState(false);
  updateLyricSync();
  updateSongTicketDisplay();
}

async function startSongPlayback() {
  const audio = document.getElementById('songAudioPlayer');
  if (!audio || state.songTicketStartPending) return;
  const newSession = !state.songTicketSessionActive;
  if (newSession && availableSongTickets() === 0) {
    showToast('会話を5回聞くとSongを再生できます');
    return;
  }
  state.songTicketStartPending = true;
  state.songTicketSessionActive = true;
  if (newSession && audio.ended) audio.currentTime = 0;
  try {
    await audio.play();
    if (newSession) {
      const tickets = getSongTickets();
      tickets.used += 1;
      saveSongTickets(tickets);
    }
  } catch {
    if (newSession) state.songTicketSessionActive = false;
    updateSongTicketDisplay();
  } finally {
    state.songTicketStartPending = false;
  }
}

function startSongFromTicket() {
  if (state.currentSong?.hasLocalAudio) {
    startSongPlayback();
  } else if (state.currentSong?.videoId && availableSongTickets() > 0) {
    const tickets = getSongTickets();
    tickets.used += 1;
    saveSongTickets(tickets);
    const frame = document.getElementById('ytFrame');
    if (frame) frame.src = `https://www.youtube.com/embed/${encodeURIComponent(state.currentSong.videoId)}?autoplay=1`;
  }
}

function toggleSongPlay() {
  const audio = document.getElementById('songAudioPlayer');
  if (!audio) return;
  if (audio.paused) {
    startSongPlayback();
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
    if (e.target.closest?.('.lyric-seek')) return;
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
  state.sentenceSpeakers = [];
  state.audioSources = [];
  state.currentIndex = -1;
  state.isPlaying = false;
  state.conversationCycleNext = 0;
  state.conversationFinished = false;

  if (!hasConversationAudio(song)) return;

  if (!state.conversationAudio) {
    state.conversationAudio = new Audio();
    state.conversationAudio.preload = 'auto';
  }

  song.conversation.forEach((turn) => {
    turn.sentences.forEach((s) => {
      state.sentenceList.push(s);
      state.sentenceSpeakers.push(turn.speaker);
      state.audioSources.push(s.audio);
    });
  });

  state.conversationAudio.onended = () => {
    if (!state.isPlaying) return;
    const i = state.currentIndex;
    if (i === state.conversationCycleNext) {
      state.conversationCycleNext += 1;
      if (state.conversationCycleNext === state.audioSources.length) {
        const tickets = getSongTickets();
        tickets.listens += 1;
        saveSongTickets(tickets);
        state.conversationCycleNext = 0;
        showToast('会話を1回聞き終えました');
      }
    }
    let next = -1;
    let delay = 0;
    if (state.repeatMode === 'one') {
      next = i;
      delay = 1000;
    } else if (i + 1 < state.audioSources.length) {
      next = i + 1;
      delay = state.sentenceSpeakers[i] !== state.sentenceSpeakers[next]
        ? CONVERSATION_SPEAKER_PAUSE_MS : 0;
    } else if (state.repeatMode === 'all') {
      next = 0;
      delay = 1000;
    }
    if (next < 0) {
      state.isPlaying = false;
      state.conversationFinished = true;
      setMediaPlaybackState(false);
      updatePlayBtn();
      return;
    }
    if (document.hidden || delay === 0) {
      playSentence(next, 'automatic');
    } else {
      state.pendingNextIndex = next;
      state.advanceTimer = setTimeout(() => {
        state.advanceTimer = null;
        if (state.isPlaying) playSentence(next, 'automatic');
      }, delay);
    }
  };
}

function playSentence(idx, mode = 'manual') {
  if (idx < 0 || idx >= state.audioSources.length) return;
  if (mode === 'manual') state.conversationCycleNext = idx === 0 ? 0 : -1;
  state.conversationFinished = false;
  clearTimeout(state.advanceTimer);
  clearTimeout(state.repeatTimer);
  state.advanceTimer = null;
  state.pendingNextIndex = -1;

  const audio = state.conversationAudio;
  audio.pause();
  state.currentIndex = idx;
  state.isPlaying = true;
  audio.src = state.audioSources[idx];
  const request = ++state.conversationPlayRequest;
  setMediaSession('conversation', state.sentenceList[idx]?.text || '会話', state.currentSong?.songName || 'Lyric Shadows');
  audio.play().then(() => {
    if (request === state.conversationPlayRequest) setMediaPlaybackState(true);
  }).catch(() => {
    if (request !== state.conversationPlayRequest) return;
    state.isPlaying = false;
    state.conversationCycleNext = -1;
    setMediaPlaybackState(false);
    updatePlayBtn();
  });
  updateHighlights();
  updatePlayBtn();

  // Scroll into view
  const el = document.getElementById(`sent-${idx}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function togglePlay() {
  if (state.isPlaying) {
    state.conversationPlayRequest++;
    clearTimeout(state.advanceTimer);
    state.advanceTimer = null;
    state.conversationAudio?.pause();
    state.isPlaying = false;
    setMediaPlaybackState(false);
    updatePlayBtn();
  } else {
    const pending = state.pendingNextIndex >= 0;
    const idx = pending ? state.pendingNextIndex : state.conversationFinished || state.currentIndex < 0 ? 0 : state.currentIndex;
    playSentence(idx, pending ? 'automatic' : state.conversationFinished || state.currentIndex < 0 ? 'manual' : 'resume');
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
  btn.innerHTML = repeatControlContent();
  btn.setAttribute('aria-label', `リピート: ${state.repeatMode === 'one' ? '1行' : state.repeatMode === 'all' ? '全体' : 'オフ'}`);
}

function stopAudio() {
  state.conversationPlayRequest++;
  clearTimeout(state.repeatTimer);
  clearTimeout(state.advanceTimer);
  state.advanceTimer = null;
  state.pendingNextIndex = -1;
  state.conversationCycleNext = 0;
  state.conversationFinished = false;
  if (state.conversationAudio) {
    state.conversationAudio.pause();
    state.conversationAudio.removeAttribute('src');
    state.conversationAudio.load();
  }
  state.isPlaying = false;
  clearMediaSession('conversation');
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
  btn.innerHTML = `${state.isPlaying ? PLAYER_PAUSE_ICON : PLAYER_PLAY_ICON}<span class="control-label">${state.isPlaying ? '一時停止' : '再生'}</span>`;
  btn.setAttribute('aria-label', state.isPlaying ? '一時停止' : '再生');
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
        <p>曲名、アーティスト名、歌詞を Codex に渡して、曲の追加と会話・歌詞の編集を依頼してください。</p>
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

async function updatePreviewVoice(speaker, voiceId) {
  try {
    const res = await fetch('/api/preview/voices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speaker, voiceId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '声を変更できませんでした');
    showPreviewView(data);
  } catch (error) {
    showToast(error.message);
    showPreviewView(state.currentSong);
  }
}

function showPreviewView(preview) {
  state.currentSong = preview; // Use the preview object
  state.view = 'preview';
  state.showJapanese = true; // Default to showing Japanese for review
  
  const app = document.getElementById('app');
  app.className = 'page-shadowing';
  
  // Reuse render function portions
  const turnsHtml = preview.conversation.map((turn, tIdx) => {
    const isA = turn.speaker === 'A';
    const cardClass = isA ? 'speaker-a' : 'speaker-b';
    const avatarClass = isA ? 'speaker-a-avatar' : 'speaker-b-avatar';
    
    // Preview doesn't have split sentences with markup typically, wait! It might just have text, wait, 
    // actually prepareConversation output HAS .english and .japanese, but finalize returns .sentences.
    // tmp-preview.json has { english, japanese } instead of .sentences array!
    
    return `<div class="turn-card ${cardClass}">
      <div class="turn-header">
        ${speakerAvatar(preview, turn.speaker, avatarClass)}
        <span class="speaker-name">${esc(isA ? preview.speakerA.name : preview.speakerB.name)} · ${esc((isA ? preview.speakerA : preview.speakerB).voiceName || '選択した声')}</span>
      </div>
      <div class="sentences-list">
        <div class="sentence-item"><div class="sentence-text">${esc(turn.english)}</div></div>
      </div>
      <div class="japanese-text visible">${esc(turn.japanese)}</div>
    </div>`;
  }).join('');

  const voiceOptions = (selectedId) => `${state.voices.some(voice => voice.id === selectedId) ? '' : `<option value="" selected disabled>現在の声（既存）</option>`}${state.voices.map(voice => {
    const age = { young: '若い', middle_aged: '中年', senior: '年配' }[voice.age] || voice.age;
    const gender = { male: '男性', female: '女性', neutral: '中性' }[voice.gender] || voice.gender;
    return `<option value="${voice.id}" ${voice.id === selectedId ? 'selected' : ''}>${esc(voice.name)} · ${age}${gender} · ${esc(voice.tone)}</option>`;
  }).join('')}`;

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
      ${renderLyricConnections(preview.lyricConnections, true)}
      ${state.voices.length ? `<div class="voice-preview-picker">
        <p>会話に合う声を選ぶ <span>確定前に変更できます</span></p>
        <label>A · ${esc(preview.speakerA.name)}<select onchange="updatePreviewVoice('A', this.value)">${voiceOptions(preview.speakerA.voice)}</select></label>
        <label>B · ${esc(preview.speakerB.name)}<select onchange="updatePreviewVoice('B', this.value)">${voiceOptions(preview.speakerB.voice)}</select></label>
      </div>` : ''}
      
      <div class="conversation-area" style="padding-bottom:180px;">
        <p style="color:var(--amber); font-size:0.8rem; text-align:center; padding-top:10px;">
          ※まだ音声はありません。内容を確認して確定してください。
        </p>
        ${turnsHtml}
      </div>

      <div class="play-controls" style="flex-direction:column; gap:10px; background:rgba(6,6,26,0.9); padding:20px;">
        <button class="generate-btn" style="margin:0; width:100%; border-radius:30px;" onclick="finalizePreview()">この内容で音声生成＆確定する</button>
        <div style="display:flex; gap:10px; width:100%;">
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
