/* Share microphone ownership across scene recording and live conversation. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.VoicePracticeAudio = factory(navigator);
})(typeof window === 'object' ? window : globalThis, function (nav) {
  'use strict';
  let captures = 0, session, previous;
  function acquire() {
    if (captures++ === 0) {
      // Safari can retain the music page's explicit playback category. Switch
      // before creating/resuming Web Audio or asking for a microphone.
      try { session = nav.audioSession; previous = session?.type; if (session) session.type = 'play-and-record'; } catch {}
    }
    let released = false;
    return () => {
      if (released) return; released = true;
      if (--captures === 0) {
        try { if (session?.type === 'play-and-record') session.type = previous || 'auto'; } catch {}
        session = null; previous = null;
      }
    };
  }
  function message(error) {
    return /AudioSession.*category|not compatible with audio capture/i.test(error?.message || '')
      ? 'マイク用の音声設定に切り替えられませんでした。ページを再読み込みして、もう一度お試しください。'
      : error?.message || 'マイクを開始できませんでした。';
  }
  return { acquire, message };
});
