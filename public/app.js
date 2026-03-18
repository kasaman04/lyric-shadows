// ============================================================
// STATE
// ============================================================
const state = {
  view: 'home',
  songs: [],
  currentSong: null,
  showJapanese: false,
  activeTab: 'conv',   // 'conv' | 'song'
  // Playback
  sentenceList: [],
  audioElements: [],
  currentIndex: -1,
  isPlaying: false,
};

const CARD_GRADS = [
  'card-grad-0','card-grad-1','card-grad-2','card-grad-3',
  'card-grad-4','card-grad-5','card-grad-6','card-grad-7'
];

const SPEAKER_ICONS = {
  '男性': '👨', '女性': '👩', '男２': '👴', '少年': '👦', '少女': '👧'
};

// ============================================================
// INIT
// ============================================================
async function init() {
  await loadSongs();
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

// ============================================================
// ROUTING
// ============================================================
function showHome() {
  stopAudio();
  state.currentSong = null;
  state.view = 'home';
  renderHome();
}

function showShadowing(song) {
  state.currentSong = song;
  state.view = 'shadowing';
  state.showJapanese = false;
  state.activeTab = 'conv';
  initAudio(song);
  renderShadowing();
}

// ============================================================
// HOME VIEW
// ============================================================
function renderHome() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="home-header">
      <h1>🎵 Lyric Shadows</h1>
      <p>曲の歌詞から生まれた英会話をシャドーイング</p>
    </div>
    ${renderSongGrid()}
  `;
}

function renderSongGrid() {
  if (state.songs.length === 0) {
    return `
      <div class="empty-state">
        <span class="empty-icon">🎧</span>
        <p>まだ曲がありません。<br>AIに追加してもらいましょう！</p>
      </div>`;
  }
  const cards = state.songs.map((song, i) => {
    const bgStyle = song.thumbnailUrl
      ? `style="background-image:url('${song.thumbnailUrl}')"` : '';
    const grad = CARD_GRADS[i % CARD_GRADS.length];
    return `
      <div class="song-card ${song.thumbnailUrl ? 'has-thumb' : grad}" ${bgStyle}
           onclick="showShadowing(state.songs[${i}])">
        <div class="song-card-overlay">
          <div class="song-card-name">${esc(song.songName)}</div>
          <div class="song-card-artist">${esc(song.artist)}</div>
        </div>
      </div>`;
  }).join('');
  return `<div class="song-grid">${cards}</div>`;
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
  const ytHtml = song.videoId
    ? `<div class="yt-embed-bottom"><iframe id="ytFrame" src="" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`
    : '';
  const songTabHtml = `<div class="lyrics-display">${lyricsHtml}</div>${ytHtml}`;

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
        <button class="tab-btn${state.activeTab === 'conv' ? ' active' : ''}" id="tabConv" onclick="switchTab('conv')">💬 会話</button>
        ${song.videoId ? `<button class="tab-btn${state.activeTab === 'song' ? ' active' : ''}" id="tabSong" onclick="switchTab('song')">🎵 Song</button>` : ''}
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
      </div>
    </div>`;
}

function renderLyrics(song) {
  if (!song.lyrics) return '<p class="no-lyrics">歌詞なし</p>';
  const enLines = song.lyrics.split('\n');
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
  if (!isConv && state.currentSong.videoId) {
    const frame = document.getElementById('ytFrame');
    if (frame && !frame.src.includes('youtube')) {
      frame.src = `https://www.youtube.com/embed/${state.currentSong.videoId}?autoplay=1`;
    }
  } else if (isConv) {
    // Pause YouTube when switching back
    const frame = document.getElementById('ytFrame');
    if (frame) frame.src = '';
  }
}

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
      if (state.isPlaying && i + 1 < state.audioElements.length) {
        playSentence(i + 1);
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

function stopAudio() {
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
// START
// ============================================================
init();
