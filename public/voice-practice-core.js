(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.VoicePracticeCore = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const GRAMMAR = ['because', 'when', 'what', 'if', 'that', 'even though'];
  const SCENES = {
    cafe: { name: 'カフェでMiaと', description: 'Two friends chatting in a cozy café about hobbies, weekends and experiences.' },
    school: { name: '学校で友達と', description: 'Friends catching up at school about their day and interests.' },
    meeting: { name: '初対面で仲良くなる', description: 'Meeting a new friend and discovering things you have in common.' },
    relationship: { name: '友達と恋愛相談', description: 'A supportive conversation between friends about relationships.' },
    travel: { name: '旅先での会話', description: 'Making a friend while traveling and sharing experiences and plans.' }
  };
  const SCENARIO_FIELDS = { request: 1500, title: 80, relationship: 250, place: 150, time: 150, partnerName: 60, context: 1200 };
  function scenario(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('会話の設定を確認してください。');
    const result = {};
    for (const [key, limit] of Object.entries(SCENARIO_FIELDS)) {
      if (typeof value[key] !== 'string' || !value[key].trim() || value[key].length > limit) throw new Error('会話の設定に未入力・長すぎる項目があります。');
      result[key] = value[key].trim();
    }
    result.assumed = Array.isArray(value.assumed) ? [...new Set(value.assumed.filter(key => ['relationship', 'place', 'time', 'partnerName'].includes(key)))] : [];
    return result;
  }
  function settings(value = {}) {
    const custom = value.scenario == null ? null : scenario(value.scenario);
    return { scene: custom ? 'custom' : SCENES[value.scene] ? value.scene : 'cafe', ...(custom ? { scenario: custom } : {}), mode: value.mode === 'free' ? 'free' : 'grammar', grammar: GRAMMAR.includes(value.grammar) ? value.grammar : 'because' };
  }
  const partner = value => value?.scenario?.partnerName || 'Mia';
  const sceneName = value => value?.scenario?.title || SCENES[value?.scene]?.name || SCENES.cafe.name;
  const sceneContext = value => value?.scenario ? JSON.stringify(value.scenario) : (SCENES[value?.scene] || SCENES.cafe).description;
  function endIntent(text, partnerName = 'Mia') {
    let s = String(text).trim().replace(/[。！？.!?]+$/g, '').trim();
    const name = String(partnerName).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (name) s = s.replace(new RegExp('(?:,\\s*|\\s+)' + name + '$', 'iu'), '');
    return /^(?:今日はここまで(?:にする|にします)?|(?:会話|練習)を(?:終わり|終了)(?:にしたい|にする|します)?|もう終わり(?:にする|にします)?|終わりにしよう)$/.test(s) || /^(?:(?:okay|ok|well|alright)[,\s]+)?(?:bye(?: bye)?(?:,? mia)?|goodbye(?:,? mia)?|that['’]s all for (?:today|now)|let['’]s (?:stop|finish|wrap up) (?:here|for today)|i (?:have|need|gotta) to go(?: now)?|i gotta go(?: now)?|i['’]d like to end (?:our|this|the) (?:chat|conversation))$/i.test(s);
  }
  function normalizeTurns(turns) {
    if (!Array.isArray(turns) || turns.length > 240) throw new Error('会話が長すぎます。いったん保存してください。');
    let size = 0;
    const seen = new Set();
    return turns.filter(t => t && ['user', 'assistant'].includes(t.role) && String(t.text || '').trim()).map((t, i) => {
      const text = String(t.text).trim(); size += text.length;
      if (text.length > 6000 || size > 50000) throw new Error('会話の文字数が上限を超えました。');
      const id = /^[a-zA-Z0-9_-]{1,100}$/.test(t.id || '') ? t.id : 'turn-' + i;
      if (seen.has(id)) throw new Error('発言IDが重複しています。');
      seen.add(id);
      return { id, role: t.role, text, ja: typeof t.ja === 'string' ? t.ja.slice(0, 6000) : '' };
    });
  }
  function mergeTurns(turns) {
    const result = [];
    for (const turn of normalizeTurns(turns)) {
      const last = result[result.length - 1];
      if (last && last.role === turn.role) { last.text += ' ' + turn.text; last.ja = [last.ja, turn.ja].filter(Boolean).join(' '); }
      else result.push({ ...turn });
    }
    return result;
  }
  function splitText(text, limit = 1600) {
    const pieces = []; let remaining = String(text).trim();
    while (remaining.length > limit) {
      let split = remaining.lastIndexOf(' ', limit);
      if (split < limit / 2) split = limit;
      pieces.push(remaining.slice(0, split).trim()); remaining = remaining.slice(split).trim();
    }
    if (remaining) pieces.push(remaining);
    return pieces;
  }
  function dialogueChunks(turns, voices, limit = 1800) {
    const chunks = []; let chunk = [], length = 0;
    turns.forEach((turn, turnIndex) => {
      for (const text of splitText(turn.text, Math.min(1600, limit))) {
        if (length + text.length > limit) { chunks.push(chunk); chunk = []; length = 0; }
        chunk.push({ text, voice_id: voices[turn.role], turnIndex }); length += text.length;
      }
    });
    if (chunk.length) chunks.push(chunk);
    return chunks;
  }
  function cueAt(cues, seconds) {
    let index = 0;
    for (let i = 0; i < cues.length; i++) if (seconds >= cues[i].start) index = i; else break;
    return index;
  }
  return { GRAMMAR, SCENES, scenario, settings, partner, sceneName, sceneContext, endIntent, normalizeTurns, mergeTurns, splitText, dialogueChunks, cueAt };
});
