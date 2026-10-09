// A fixed media element and one continuous file per episode. Card boundaries
// update the UI; they never pause, reload, detach or replace the playing audio.
function currentDramaTrack() {
  return window.DRAMA_PLAYBACK?.[`${state.currentDramaId}:${state.currentEpisodeId}`];
}

function isCurrentDramaPlayer(audio) {
  return audio && document.getElementById('dramaEpisodeAudio') === audio;
}

function cancelDramaPlayRequest() {
  state.dramaPlayRequest += 1;
  clearTimeout(state.dramaRetryTimer);
  clearTimeout(state.dramaWatchTimer);
  state.dramaRetryTimer = null;
  state.dramaWatchTimer = null;
}

function updateDramaPlaybackStatus(text) {
  state.dramaPlaybackStatus = text;
  const label = document.getElementById('dramaPlaybackStatus');
  if (label) label.textContent = text;
}

function highlightDramaClip(index, scroll = false) {
  document.querySelectorAll('.drama-clip').forEach((card, cardIndex) => {
    const active = state.dramaPlaylistActive && cardIndex === index;
    card.classList.toggle('is-playing', active);
    if (active && scroll) card.querySelector('.drama-clip-english')?.scrollIntoView({
      behavior: 'auto', block: 'center'
    });
  });
  const label = document.getElementById('dramaCurrentClip');
  if (label) label.textContent = `音声 ${String(index + 1).padStart(2, '0')} / ${currentDramaTrack()?.starts.length || 0}`;
}

function onDramaPlaylistTime(audio, force = false) {
  if (!isCurrentDramaPlayer(audio) || state.dramaReloading) return;
  const track = currentDramaTrack();
  if (!track) return;
  state.dramaResumeTime = audio.currentTime;
  let low = 0, high = track.starts.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (track.starts[mid] <= audio.currentTime) low = mid;
    else high = mid - 1;
  }
  const changed = state.dramaPlaylistIndex !== low;
  state.dramaPlaylistIndex = low;
  if (changed || force) highlightDramaClip(low, state.dramaPlaylistActive);
}

function onDramaPlaylistLoaded(audio) {
  if (!isCurrentDramaPlayer(audio)) return;
  if (state.dramaReloading) {
    audio.currentTime = state.dramaResumeTime;
    state.dramaReloading = false;
  }
  onDramaPlaylistTime(audio, true);
}

function onDramaPlaylistPlay(audio) {
  if (!isCurrentDramaPlayer(audio) || audio.paused) return;
  clearDramaSingleRepeat();
  document.querySelectorAll('.drama-audio').forEach(clip => clip.pause());
  // Native audio controls can also start/resume this player.
  if (!state.dramaPlaylistActive) {
    cancelDramaPlayRequest();
    state.dramaRetryCount = 0;
    audio.dramaPlayRequest = state.dramaPlayRequest;
    watchDramaAudioProgress(audio, state.dramaPlayRequest);
  }
  state.dramaPlaylistActive = true;
  onDramaPlaylistTime(audio, true);
  updateDramaPlaybackButtons();
}

function onDramaPlaylistPlaying(audio) {
  if (!isCurrentDramaPlayer(audio)) return;
  updateDramaPlaybackStatus('');
  onDramaPlaylistTime(audio, true);
}

function onDramaPlaylistPause(audio) {
  if (!isCurrentDramaPlayer(audio) || !audio.paused || audio.ended || state.dramaReloading) return;
  state.dramaResumeTime = audio.currentTime;
  if (!state.dramaPlaylistActive) return;
  state.dramaPlaylistActive = false;
  cancelDramaPlayRequest();
  highlightDramaClip(state.dramaPlaylistIndex);
  updateDramaPlaybackButtons();
}

function onDramaPlaylistWaiting(audio) {
  if (isCurrentDramaPlayer(audio) && state.dramaPlaylistActive) updateDramaPlaybackStatus('音声を読み込み中…');
}

function onDramaPlaylistEnded(audio) {
  if (!isCurrentDramaPlayer(audio) || !audio.ended || !state.dramaPlaylistActive) return;
  cancelDramaPlayRequest();
  state.dramaResumeTime = 0;
  if (completeDramaRound()) return;
  if (state.dramaRepeat) {
    playDramaAudioAt(0, true);
    return;
  }
  state.dramaPlaylistActive = false;
  state.dramaPlaylistIndex = 0;
  highlightDramaClip(0);
  updateDramaPlaybackButtons();
}

function watchDramaAudioProgress(audio, request, position = state.dramaResumeTime) {
  state.dramaWatchTimer = setTimeout(() => {
    state.dramaWatchTimer = null;
    if (request !== state.dramaPlayRequest || !state.dramaPlaylistActive || !isCurrentDramaPlayer(audio) || audio.ended) return;
    if (audio.currentTime > position + 0.01) {
      watchDramaAudioProgress(audio, request, audio.currentTime);
    } else {
      onDramaAudioError(audio, { name: 'PlaybackTimeoutError' }, request);
    }
  }, 12000);
}

function onDramaAudioError(audio, error, request = audio.dramaPlayRequest) {
  if (!error && !audio.error) return;
  if (!isCurrentDramaPlayer(audio) || !state.dramaPlaylistActive || request !== state.dramaPlayRequest) return;
  if (!state.dramaReloading) state.dramaResumeTime = audio.currentTime;
  cancelDramaPlayRequest();
  // Ignore pause events from our own recovery, and preserve the exact position.
  state.dramaReloading = true;
  audio.pause();
  if (error?.name !== 'NotAllowedError' && state.dramaRetryCount < 2) {
    updateDramaPlaybackStatus('音声を再読み込み中…');
    state.dramaRetryTimer = setTimeout(() => {
      state.dramaRetryTimer = null;
      audio.load();
      startDramaPlaylist(audio, state.dramaRetryCount + 1);
    }, 800);
  } else {
    state.dramaPlaylistActive = false;
    state.dramaReloading = false;
    updateDramaPlaybackStatus('再生が止まりました。「まとめて再生」で続きから再開できます。');
    highlightDramaClip(state.dramaPlaylistIndex);
  }
  updateDramaPlaybackButtons();
}

function startDramaPlaylist(audio, retryCount = 0) {
  cancelDramaPlayRequest();
  const request = state.dramaPlayRequest;
  audio.dramaPlayRequest = request;
  state.dramaRetryCount = retryCount;
  state.dramaPlaylistActive = true;
  if (audio.error) {
    state.dramaReloading = true;
    audio.load();
  }
  if (audio.readyState > 0) {
    audio.currentTime = state.dramaResumeTime;
    state.dramaReloading = false;
  } else {
    // Metadata applies the seek before playback begins, including after reload.
    state.dramaReloading = true;
  }
  if (!retryCount) updateDramaPlaybackStatus('');
  watchDramaAudioProgress(audio, request);
  audio.play().catch(error => onDramaAudioError(audio, error, request));
  updateDramaPlaybackButtons();
}

function playDramaAudioAt(index, restart = false) {
  const audio = document.getElementById('dramaEpisodeAudio');
  const track = currentDramaTrack();
  if (!audio || !track || track.starts[index] === undefined) return;
  clearDramaSingleRepeat();
  document.querySelectorAll('.drama-audio').forEach(clip => clip.pause());
  if (restart || index !== state.dramaPlaylistIndex || audio.ended) state.dramaResumeTime = track.starts[index];
  state.dramaPlaylistIndex = index;
  startDramaPlaylist(audio);
}

function toggleDramaPlayAll() {
  const audio = document.getElementById('dramaEpisodeAudio');
  if (!audio) return;
  if (state.dramaPlaylistActive) {
    state.dramaPlaylistActive = false;
    cancelDramaPlayRequest();
    audio.pause();
    highlightDramaClip(state.dramaPlaylistIndex);
    updateDramaPlaybackButtons();
  } else {
    playDramaAudioAt(state.dramaPlaylistIndex);
  }
}

function toggleDramaRepeat() {
  state.dramaRepeat = !state.dramaRepeat;
  if (state.dramaRepeat) clearDramaSingleRepeat();
  updateDramaPlaybackButtons();
}

function onDramaAudioPlay(activeAudio) {
  if (activeAudio.paused) return;
  const playlist = document.getElementById('dramaEpisodeAudio');
  if (playlist) playlist.pause();
  state.dramaPlaylistActive = false;
  cancelDramaPlayRequest();
  if (state.dramaSingleRepeatIndex >= 0 && document.querySelectorAll('.drama-audio')[state.dramaSingleRepeatIndex] !== activeAudio) clearDramaSingleRepeat();
  document.querySelectorAll('.drama-audio').forEach(audio => {
    if (audio !== activeAudio) audio.pause();
    audio.closest('.drama-clip')?.classList.toggle('is-playing', audio === activeAudio);
  });
  updateDramaPlaybackButtons();
}

function onDramaAudioPause(audio) {
  if (audio.paused && !state.dramaPlaylistActive) audio.closest('.drama-clip')?.classList.remove('is-playing');
}

function clearDramaSingleRepeat() {
  document.querySelectorAll('.drama-audio').forEach(audio => { audio.loop = false; });
  state.dramaSingleRepeatIndex = -1;
  updateDramaSingleRepeatButtons();
}

function toggleDramaSingleRepeat(index) {
  const audio = document.querySelectorAll('.drama-audio')[index];
  if (!audio) return;
  if (state.dramaSingleRepeatIndex === index) {
    clearDramaSingleRepeat();
    return;
  }
  document.getElementById('dramaEpisodeAudio')?.pause();
  state.dramaPlaylistActive = false;
  cancelDramaPlayRequest();
  clearDramaSingleRepeat();
  state.dramaRepeat = false;
  state.dramaSingleRepeatIndex = index;
  audio.loop = true;
  audio.currentTime = 0;
  updateDramaSingleRepeatButtons();
  updateDramaPlaybackButtons();
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
