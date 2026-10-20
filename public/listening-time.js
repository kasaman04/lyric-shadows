(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ListeningTime = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const DAY = 86400000, JST = 9 * 3600000;
  function format(seconds) {
    const value = Math.max(0, Math.floor((Number(seconds) || 0) + 0.000001));
    return `${Math.floor(value / 60)}分${String(value % 60).padStart(2, '0')}秒`;
  }
  // Merge pending playback so overlapping players/tabs cannot inflate the display.
  function totals(save, events, at = Date.now()) {
    const midnight = Math.floor((at + JST) / DAY) * DAY - JST;
    const day = new Date(at + JST).toISOString().slice(0, 10);
    const merged = [];
    for (const event of [...events].sort((a, b) => a.start - b.start)) {
      const start = event.start, end = Math.min(event.end, at);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
      const last = merged.at(-1);
      if (last && start <= last[1]) last[1] = Math.max(last[1], end);
      else merged.push([start, end]);
    }
    const pending = merged.reduce((sum, [s, e]) => sum + (e - s) / 1000, 0);
    const today = merged.reduce((sum, [s, e]) => sum + Math.max(0, Math.min(e, midnight + DAY) - Math.max(s, midnight)) / 1000, 0);
    return { today: (save?.daily?.[day] || 0) + today, total: (save?.totalSeconds || 0) + pending, pending };
  }
  return { format, totals };
});
