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
      <h1><img src="/rogo2.png" alt="Lyric Shadows" class="header-logo"> Lyric Shadows</h1>
    </div>
    ${renderSongGrid()}
    <div id="modalContainer"></div>
    <div id="progressContainer"></div>
  `;
  checkExistingPreview();
}

async function checkExistingPreview() {
  try {
    const res = await fetch('/api/preview');
    const preview = await res.json();
    if (preview) showPreviewView(preview);
  } catch {}
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
        <button class="repeat-btn ${state.repeatMode !== 'off' ? 'active' : ''}" id="repeatBtn" onclick="cycleRepeat()" title="リピート">
          ${state.repeatMode === 'one' ? '🔂' : '🔁'}
          ${state.repeatMode !== 'off' ? '<span class="repeat-label">' + (state.repeatMode === 'one' ? '1' : 'All') + '</span>' : ''}
        </button>
      </div>
    </div>`;
}

function renderLyrics(song) {
  if (!song.lyrics) return '<p class="no-lyrics">歌詞なし</p>';

  // New format: lyricsJa is an array of {en, ja} phrase pairs
  if (Array.isArray(song.lyricsJa)) {
    return song.lyricsJa.map(pair => {
      const enHtml = pair.en.split('\n').map(l => `<div class="lyric-en">${esc(l)}</div>`).join('');
      const jaHtml = pair.ja ? `<div class="lyric-ja">${esc(pair.ja)}</div>` : '';
      return `<div class="lyric-pair">${enHtml}${jaHtml}</div>`;
    }).join('<div class="lyric-spacer"></div>');
  }

  // Legacy fallback: lyricsJa is a plain string matched line-by-line
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

        <button class="generate-btn" onclick="startPreview()">プレビューを生成する ✨</button>
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
        <button class="generate-btn" style="margin:0; width:100%; border-radius:30px;" onclick="finalizePreview()">👉 この内容で音声生成＆確定する</button>
        <div style="display:flex; gap:10px; width:100%;">
          <button class="restart-btn" style="flex:1; border-radius:30px; border-color:var(--dim); color:var(--text); width:auto;" onclick="startRegen()">🔄 会話を再生成</button>
          <button class="restart-btn" style="flex:1; border-radius:30px; border-color:#e11d48; color:#f43f5e; width:auto;" onclick="cancelPreview()">❌ キャンセル</button>
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
