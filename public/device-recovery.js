(() => {
  'use strict';
  const status = document.getElementById('status'), detail = document.getElementById('detail');
  const retry = document.getElementById('retry'), home = document.getElementById('home');
  const target = new URLSearchParams(location.hash.slice(1)).get('device');
  // The identifier stays out of requests, referrers, and the final page URL.
  history.replaceState(null, '', location.pathname + location.search);
  const valid = id => /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id || '');
  const cookieValue = key => document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(key + '='))?.slice(key.length + 1) || '';
  const cookieId = () => cookieValue('phraseDeviceId');
  function writeCookie(value, key = 'phraseDeviceId') {
    document.cookie = key + '=' + value + '; max-age=' + (value ? 31536000 : 0) + '; path=/; samesite=lax' + (location.protocol === 'https:' ? '; secure' : '');
  }
  async function get(url) {
    const response = await fetch(url, {cache:'no-store',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(15000)});
    if (!response.ok) throw new Error('保存先に接続できません。時間をおいてもう一度お試しください。');
    return response.json();
  }
  async function restore() {
    retry.hidden = true;
    if (!valid(target)) {
      status.textContent = '復旧リンクを確認してください。';
      detail.textContent = '案内された復旧リンクを、データが表示されないブラウザで開いてください。';
      return;
    }
    status.textContent = '元の学習記録に接続しています…';
    let before, previousCookies, changed = false;
    try {
      const [state, prefs] = await Promise.all([
        get('/api/pet/' + encodeURIComponent(target)),
        get('/api/phrase-preferences/' + encodeURIComponent(target))
      ]);
      if (!Array.isArray(state.pets) || !state.pets.length && !state.totalSeconds && !Object.keys(state.sentenceReview?.items || {}).length) {
        throw new Error('元の学習記録を確認できませんでした。端末情報は変更していません。');
      }
      if (!prefs.enabled || !prefs.found || !Array.isArray(prefs.savedPhraseIds) || !Array.isArray(prefs.hiddenPhraseIds)) {
        throw new Error('保存フレーズの確認ができませんでした。端末情報は変更していません。');
      }
      const pet = state.pets.at(-1);
      const restoredDetail = (pet ? '相棒 Lv.' + pet.forms.at(-1).level + ' · ' : '') + '復習 ' + Object.keys(state.sentenceReview?.items || {}).length + '件。ホームに戻ります。';
      const keys = ['phraseDeviceId', 'savedPhraseIds', 'hiddenPhraseIds', 'petState:' + target];
      before = Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]));
      previousCookies = Object.fromEntries(['phraseDeviceId', 'savedPhraseIds', 'hiddenPhraseIds'].map(key => [key, cookieValue(key)]));
      const backups = JSON.parse(localStorage.getItem('lyricIdentityBackupsV1') || '[]');
      if (!Array.isArray(backups)) throw new Error('このブラウザに退避情報を保存できません。');
      backups.push({at:Date.now(),previousCookies,values:before});
      localStorage.setItem('lyricIdentityBackupsV1', JSON.stringify(backups));
      changed = true;
      writeCookie(target);
      if (cookieId() !== target) throw new Error('Cookieを保存できません。ブラウザの保存設定を確認してください。');
      localStorage.setItem('phraseDeviceId', target);
      localStorage.setItem('savedPhraseIds', JSON.stringify(prefs.savedPhraseIds));
      localStorage.setItem('hiddenPhraseIds', JSON.stringify(prefs.hiddenPhraseIds));
      localStorage.setItem('petState:' + target, JSON.stringify(state));
      if (localStorage.getItem('phraseDeviceId') !== target) throw new Error('端末情報を保存できません。ブラウザの保存設定を確認してください。');
      // Preferences also have cookie fallbacks; replace them along with the ID.
      for (const [key, ids] of [['savedPhraseIds', prefs.savedPhraseIds], ['hiddenPhraseIds', prefs.hiddenPhraseIds]]) {
        writeCookie(encodeURIComponent(JSON.stringify(ids)), key);
      }
      status.textContent = '元のデータに接続しました。';
      detail.textContent = restoredDetail;
      home.hidden = false;
      location.replace('/#saved-device=' + encodeURIComponent(target));
    } catch (error) {
      if (changed) {
        for (const [key, value] of Object.entries(before)) {
          try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch {}
        }
        for (const [key, value] of Object.entries(previousCookies)) { try { writeCookie(value, key); } catch {} }
      }
      status.textContent = '復旧を完了できませんでした。';
      detail.textContent = error.message || '接続とブラウザの保存設定を確認してください。';
      retry.hidden = false;
    }
  }
  retry.addEventListener('click', restore);
  restore();
})();
