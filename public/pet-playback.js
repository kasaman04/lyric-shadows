(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PetPlayback = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  function credit(previous, current) {
    if (!previous.active || current.seeking || current.source !== previous.source || current.muted) return 0;
    const wall = (current.time - previous.time) / 1000;
    const media = current.position - previous.position;
    if (wall <= 0 || wall > 86400 || media <= 0 || media > wall * previous.rate + 1.5) return 0;
    return Math.min(wall, media / Math.max(.1, previous.rate));
  }
  if (typeof window !== 'object') return { credit };
  const watched = new WeakMap(), players = new Set();
  const tabId = crypto.randomUUID(), lockKey = 'petListeningOwnerV1';
  let sink = () => {}, petId = () => null, deviceId = '', owns = false;
  function lease() {
    if (!deviceId) return false;
    try {
      const key = lockKey + deviceId;
      const lock = JSON.parse(localStorage.getItem(key) || 'null'), now = Date.now();
      if (lock && lock.id !== tabId && lock.until > now) { owns = false; return false; }
      localStorage.setItem(key, JSON.stringify({ id: tabId, until: now + 15000 }));
      owns = JSON.parse(localStorage.getItem(key)).id === tabId; return owns;
    } catch { owns = true; return true; }
  }
  function snapshot(audio, active) {
    return { time: performance.now(), position: audio.currentTime, rate: audio.playbackRate || 1, source: audio.currentSrc || audio.src,
      seeking: audio.seeking, muted: audio.muted || audio.volume === 0,
      active: active && !audio.paused && !audio.ended && audio.readyState >= 2 && !audio.seeking && !audio.muted && audio.volume > 0 };
  }
  function sample(audio) {
    const record = watched.get(audio); if (!record) return;
    const current = snapshot(audio, record.playing), now = Date.now();
    const seconds = credit(record.last, current);
    // Media delta is authoritative. A wall-clock jump cannot create study credit.
    if (seconds > 0 && lease() && Math.abs(now - record.wall - (current.time - record.last.time)) < 2000) {
      let start = now - seconds * 1000;
      while (start < now) {
        const end = Math.min(now, start + 30000);
        sink({ start, end, petId: petId() }); start = end;
      }
    }
    record.last = current; record.wall = now;
  }
  function watch(audio) {
    if (!audio || watched.has(audio)) return audio;
    const record = { playing: !audio.paused && audio.readyState >= 2, last: snapshot(audio, false), wall: Date.now() };
    watched.set(audio, record); players.add(audio);
    const reset = () => { record.last = snapshot(audio, record.playing); record.wall = Date.now(); };
    audio.addEventListener('playing', () => { record.playing = true; reset(); });
    for (const event of ['pause', 'ended', 'waiting', 'stalled', 'error', 'emptied']) audio.addEventListener(event, () => { sample(audio); record.playing = false; reset(); });
    audio.addEventListener('seeking', () => { record.playing = false; reset(); });
    audio.addEventListener('seeked', () => { record.playing = !audio.paused && audio.readyState >= 2; reset(); });
    audio.addEventListener('ratechange', () => { sample(audio); reset(); });
    audio.addEventListener('volumechange', reset);
    audio.addEventListener('timeupdate', () => sample(audio));
    audio.addEventListener('loadedmetadata', reset);
    return audio;
  }
  document.addEventListener('play', event => { if (event.target instanceof HTMLMediaElement) watch(event.target); }, true);
  document.addEventListener('playing', event => {
    if (!(event.target instanceof HTMLMediaElement)) return;
    const audio = watch(event.target), r = watched.get(audio);
    players.add(audio);
    r.playing = true; r.last = snapshot(audio, true); r.wall = Date.now();
  }, true);
  setInterval(() => {
    for (const audio of players) {
      sample(audio);
      if (audio.paused && !audio.isConnected && watched.get(audio)?.playing === false) players.delete(audio);
    }
    // Retain ownership only while media is actually playing.
    if ([...players].some(a => !a.paused) && owns) lease();
  }, 1000);
  // Detached reusable Audio objects rejoin the sample set on play.
  function managed(audio) { watch(audio); audio.addEventListener('play', () => players.add(audio)); return audio; }
  function release() {
    for (const audio of players) sample(audio);
    try { const key = lockKey + deviceId; if (JSON.parse(localStorage.getItem(key) || 'null')?.id === tabId) localStorage.removeItem(key); } catch {}
    owns = false;
  }
  window.addEventListener('pagehide', release);
  return { credit, watch: managed, configure(options) { sink = options.onCredit; petId = options.petId; deviceId = options.deviceId; }, flush() { for (const audio of players) sample(audio); }, release };
});
