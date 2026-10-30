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
  // Preview only unsynced, unique phrase intervals. Stored intervals are
  // subtracted too, so another tab's acknowledgment cannot double the meter.
  function phraseTotals(save,events,at=Date.now()) {
    const ledger=save?.phraseListening||{},daily={...ledger.daily};
    let covered=[...(ledger.intervals||[])],pending=0;
    const eligible=[...events].filter(e=>/^\/relative-phrase-audio\/[a-z]+-dialogue-\d{2}-[a-f0-9]{12}\.mp3$/.test(e.source||'')).sort((a,b)=>a.start-b.start);
    for(const event of eligible){
      const start=event.start,end=Math.min(event.end,at);if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)continue;
      let pieces=[[start,end]];
      for(const [a,b]of covered)pieces=pieces.flatMap(([s,e])=>b<=s||a>=e?[[s,e]]:[[s,Math.min(e,a)],[Math.max(s,b),e]].filter(([x,y])=>y>x));
      for(const [s,e]of pieces){pending+=(e-s)/1000;for(let cursor=s;cursor<e;){const day=new Date(cursor+JST).toISOString().slice(0,10),finish=Math.min(e,Date.parse(day+'T15:00:00Z'));daily[day]=(daily[day]||0)+(finish-cursor)/1000;cursor=finish;}}
      covered.push([start,end]);
    }
    const today=new Date(at+JST).toISOString().slice(0,10);
    return {today:daily[today]||0,total:(ledger.totalSeconds||0)+pending,pending,daily};
  }
  return { format, totals, phraseTotals };
});
