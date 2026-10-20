(() => {
  'use strict';
  const app = document.getElementById('app');
  if (!app) return;
  const strip = document.createElement('div');
  strip.className = 'pull-refresh'; strip.dataset.state = 'idle';
  strip.innerHTML = '<i class="pull-refresh-record" aria-hidden="true"></i><span role="status" aria-live="polite"></span>';
  app.before(strip);
  const label = strip.querySelector('span'), threshold = 76;
  let gesture = null, height = 0, refreshing = false, hideTimer;
  function show(state, text, size) {
    strip.dataset.state = state;
    if (label.textContent !== text) label.textContent = text;
    height = size; strip.style.height = size + 'px';
  }
  function hide() { show('idle', '', 0); }
  function blocked(target) {
    return document.body.classList.contains('pet-open') || app.inert ||
      !!document.querySelector('[aria-modal="true"]') ||
      !!target.closest('input,textarea,select,button,a,audio,video,[role="slider"],[contenteditable],.play-controls,.song-audio-player');
  }
  function start(event) {
    if (refreshing || event.touches.length !== 1 || window.scrollY > 1 || blocked(event.target)) return;
    clearTimeout(hideTimer);
    const touch = event.touches[0];
    gesture = { x: touch.clientX, y: touch.clientY, active: false };
  }
  function move(event) {
    if (!gesture) return;
    if (event.touches.length !== 1 || window.scrollY > 1) { cancel(); return; }
    const touch = event.touches[0], dx = touch.clientX - gesture.x, dy = touch.clientY - gesture.y;
    if (!gesture.active) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) || dy < -8) { gesture = null; return; }
      if (dy < 10) return;
      gesture.active = true; strip.classList.add('is-dragging');
    }
    if (event.cancelable) event.preventDefault();
    const size = Math.min(116, Math.max(0, dy * .48));
    show('pull', size >= threshold ? '離すと更新' : '下に引っ張って更新', size);
    strip.querySelector('i').style.transform = `rotate(${dy}deg)`;
  }
  function cancel() {
    gesture = null; strip.classList.remove('is-dragging');
    if (!refreshing) hide();
  }
  async function refresh() {
    if (refreshing) return;
    refreshing = true; strip.querySelector('i').style.transform = '';
    show('loading', '更新中…', 90);
    try {
      // Queue the last media sample durably before navigation; synchronization
      // may fail offline, but the saved queue survives and retries on next load.
      await window.PetGame?.prepareRefresh();
      const url = new URL(location.href);
      url.searchParams.set('_refresh', Date.now().toString());
      const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (!response.ok || !(await response.text()).includes('id="app"')) throw new Error('refresh failed');
      try { sessionStorage.setItem('lyricRefreshComplete', String(Date.now())); } catch {}
      location.replace(url.href);
    } catch {
      refreshing = false;
      show('error', '接続できません。もう一度引っ張って更新', 90);
      hideTimer = setTimeout(hide, 3500);
    }
  }
  function end() {
    const ready = gesture?.active && height >= threshold;
    gesture = null; strip.classList.remove('is-dragging');
    if (ready) refresh(); else if (!refreshing) hide();
  }
  document.addEventListener('touchstart', start, { passive: true });
  document.addEventListener('touchmove', move, { passive: false });
  document.addEventListener('touchend', end, { passive: true });
  document.addEventListener('touchcancel', cancel, { passive: true });
  try {
    const stamp = Number(sessionStorage.getItem('lyricRefreshComplete'));
    sessionStorage.removeItem('lyricRefreshComplete');
    if (stamp && Date.now() - stamp < 60000) {
      show('success', '最新の状態です', 90);
      hideTimer = setTimeout(hide, 1600);
    }
  } catch {}
  window.PullRefresh = { refresh };
})();
