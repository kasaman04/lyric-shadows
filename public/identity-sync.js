(() => {
  'use strict';
  let switching = false;
  window.addEventListener('storage', async event => {
    if (event.key !== 'phraseDeviceId' || event.newValue === event.oldValue || !/^[a-z0-9-]{12,80}$/i.test(event.newValue || '') || switching) return;
    if (event.storageArea !== localStorage || localStorage.getItem('phraseDeviceId') !== event.newValue) return;
    switching = true;
    const root = document.getElementById('app') || document.getElementById('practice');
    const wasInert = root?.inert;
    if (root) root.inert = true;
    const notice = document.createElement('p');
    notice.setAttribute('role', 'status');
    notice.textContent = '復旧したデータに切り替えています…';
    notice.style.cssText = 'position:fixed;inset:16px 16px auto;z-index:100000;margin:0;padding:16px;border-radius:12px;background:#385845;color:#fff;font:14px/1.6 system-ui,sans-serif;box-shadow:0 4px 20px #0002';
    document.body.appendChild(notice);
    try {
      // Persist playback against the previous identity before reloading it.
      await window.PetGame?.prepareRefresh();
      if (location.hash?.includes('saved-device=')) {
        const url = new URL(location.href), params = new URLSearchParams(url.hash.slice(1));
        params.set('saved-device', event.newValue); url.hash = params.toString();
        history.replaceState(null, '', url.href);
      }
      location.reload();
    } catch {
      if (root) root.inert = wasInert;
      notice.textContent = '再生記録を保存できませんでした。接続と空き容量を確認して、この画面を更新してください。';
      switching = false;
    }
  });
})();
