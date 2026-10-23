/* global VoicePracticeCore */
(() => {
  'use strict';
  const C = VoicePracticeCore, $ = id => document.getElementById(id), API = '/api/voice-practice';
  const fields = ['title', 'relationship', 'place', 'time', 'partnerName', 'context'];
  let config = {}, draft = null, manual = false, view = 'input', busy = false, starting = false;
  let recording = null, generation = null, version = 0;
  function error(text = '') { $('error').hidden = !text; $('error').textContent = text; }
  function step(name) {
    for (const key of ['input', 'confirm', 'conversation']) $('flow-' + key).setAttribute('aria-current', key === name ? 'step' : 'false');
  }
  function readSettings() {
    if (!draft || view !== 'confirm') return null;
    try { return C.settings({ scenario: { ...draft, ...Object.fromEntries(fields.map(key => [key, $('scenario-' + key).value])) }, mode: $('mode').value, grammar: $('grammar').value }); }
    catch { return null; }
  }
  function remember() {
    try { localStorage.setItem('vp-scenario-draft', JSON.stringify({ request: $('scene-request').value, settings: readSettings(), manual, view })); } catch {}
  }
  function controls() {
    const unavailable = busy || starting || Boolean(recording), hasText = Boolean($('scene-request').value.trim());
    $('scene-record').disabled = !config.openai || busy || starting;
    $('scene-record').setAttribute('aria-pressed', String(Boolean(recording)));
    $('scene-record-label').textContent = recording ? '場面を聞いています…' : '日本語で場面を話す';
    $('scene-stop').hidden = !recording;
    $('scene-type').disabled = unavailable;
    $('scene-generate').disabled = unavailable || !config.openai || !hasText;
    $('scene-manual').disabled = unavailable || !hasText;
    $('start').disabled = !config.openai || !readSettings() || unavailable;
    $('scene-status').textContent = recording ? '録音中です。話し終えたら下のボタンへ（最大60秒）。' : busy ? '話した場面を整理しています…' : !config.openai ? 'OpenAI APIキーの設定後に音声入力できます。文字で設定を準備することもできます。' : 'マイクを押して、練習したい場面を伝えてください。';
    $('scene-generate').textContent = busy ? '場面を整理しています…' : 'この内容で設定を確認 →';
  }
  function show(name) {
    view = name; $('scene-input').hidden = name !== 'input'; $('scene-confirm').hidden = name !== 'confirm';
    step(name); controls(); remember();
  }
  function edit(scenario, isManual = false) {
    draft = C.scenario(scenario); manual = isManual;
    fields.forEach(key => { $('scenario-' + key).value = draft[key]; });
    for (const key of ['relationship', 'place', 'time', 'partnerName']) {
      $('assumed-' + key).hidden = !draft.assumed.includes(key);
      $('assumed-' + key).textContent = manual ? '仮の設定' : 'AIが補完';
    }
    $('scene-original').textContent = '「' + draft.request + '」';
    show('confirm');
  }
  function stop() {
    version++; generation?.abort(); generation = null; busy = false; starting = false;
    const session = recording; recording = null;
    if (session) { clearTimeout(session.timer); if (session.recorder.state !== 'inactive') session.recorder.stop(); session.stream.getTracks().forEach(track => track.stop()); }
    controls();
  }
  async function json(url, init) {
    const result = await fetch(API + url, init), body = await result.json();
    if (!result.ok) throw new Error(body.error || '場面を取得できませんでした。'); return body;
  }
  async function generate() {
    if (busy || recording || starting) return;
    const request = $('scene-request').value.trim(); if (!request) return;
    const epoch = ++version, controller = new AbortController(); generation = controller; busy = true; error(''); controls();
    try {
      const value = await json('/scenarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ request }), signal: controller.signal });
      if (version === epoch) edit(value.scenario);
    } catch (e) { if (version === epoch) { $('scene-text').hidden = false; error(e.message + ' 内容を修正するか、自分で設定を入力できます。'); } }
    finally { if (version === epoch) { busy = false; generation = null; controls(); remember(); } }
  }
  async function completeRecording() {
    const session = recording; if (!session || busy) return;
    const epoch = ++version; recording = null; busy = true; controls();
    clearTimeout(session.timer);
    if (session.recorder.state !== 'inactive') session.recorder.stop();
    try {
      await session.done; session.stream.getTracks().forEach(track => track.stop());
      if (version !== epoch) return;
      if (session.error) throw new Error(session.error);
      const audio = new Blob(session.chunks, { type: session.recorder.mimeType || 'audio/webm' });
      if (audio.size < 100 || audio.size > 8 * 1024 * 1024) throw new Error('録音が短すぎるか長すぎました。もう一度お話しください。');
      generation = new AbortController();
      const result = await json('/scene-transcription', { method: 'POST', headers: { 'Content-Type': audio.type }, body: audio, signal: generation.signal });
      if (version !== epoch) return;
      $('scene-request').value = result.text; $('scene-text').hidden = false;
      busy = false; generation = null; controls(); await generate();
    } catch (e) { if (version === epoch) error(e.message); }
    finally { session.stream.getTracks().forEach(track => track.stop()); if (version === epoch) { busy = false; generation = null; controls(); remember(); } }
  }
  async function record() {
    if (recording) return completeRecording();
    if (busy || starting || !config.openai) return;
    error(''); const epoch = ++version; starting = true; controls(); let stream;
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('このブラウザでは録音を利用できません。文字で入力するか、マイク対応ブラウザを使ってください。');
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (epoch !== version) { stream.getTracks().forEach(track => track.stop()); return; }
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error('このブラウザの録音形式に対応していません。文字で入力できます。');
      const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 64000 });
      const session = { recorder, stream, chunks: [], size: 0, error: '', timer: null };
      session.done = new Promise(resolve => { recorder.onstop = resolve; });
      recorder.ondataavailable = e => {
        if (!e.data.size) return;
        session.size += e.data.size;
        if (session.size <= 8 * 1024 * 1024) session.chunks.push(e.data);
        else { session.error = '録音が長すぎました。短い場面説明でもう一度お話しください。'; void completeRecording(); }
      };
      recorder.onerror = () => { session.error = '録音できませんでした。マイクを確認して、もう一度お試しください。'; void completeRecording(); };
      recording = session; recorder.start(250); session.timer = setTimeout(completeRecording, 60000);
    } catch (e) { stream?.getTracks().forEach(track => track.stop()); if (epoch === version) { recording = null; error(e.name === 'NotAllowedError' ? 'マイクの使用を許可してください。文字での入力もできます。' : e.message); } }
    finally { if (epoch === version) { starting = false; controls(); } }
  }
  $('scene-record').onclick = record; $('scene-stop').onclick = completeRecording;
  $('scene-type').onclick = () => { $('scene-text').hidden = false; $('scene-request').focus(); };
  $('scene-generate').onclick = generate;
  $('scene-manual').onclick = () => {
    const request = $('scene-request').value.trim(); if (!request) return;
    edit({ request, title: request.slice(0, 80), relationship: request.slice(0, 250), place: 'カフェ', time: '休日の午後', partnerName: 'Mia', context: '指定した場面で、相手から会話を始める。', assumed: ['place', 'time', 'partnerName'] }, true);
  };
  $('scene-back').onclick = () => { stop(); $('scene-text').hidden = !$('scene-request').value; show('input'); };
  $('scene-request').oninput = () => { if (busy) stop(); draft = null; controls(); remember(); };
  fields.forEach(key => { $('scenario-' + key).oninput = () => { if (draft?.assumed.includes(key)) { draft.assumed = draft.assumed.filter(k => k !== key); $('assumed-' + key).hidden = true; } controls(); remember(); }; });
  $('mode').addEventListener('change', () => { controls(); remember(); }); $('grammar').addEventListener('change', remember);
  window.addEventListener('pagehide', stop);
  window.VoiceSceneSetup = {
    initialize(value) {
      config = value;
      let stored; try { stored = JSON.parse(localStorage.getItem('vp-scenario-draft')); } catch {}
      if (stored?.request) $('scene-request').value = String(stored.request).slice(0, 1500);
      if (stored?.settings?.scenario && stored.view === 'confirm') { try { this.restore(stored.settings, stored.manual); } catch { show('input'); } }
      else { $('scene-text').hidden = !$('scene-request').value; show('input'); }
    },
    getSettings: readSettings, stop, step,
    restore(value, isManual = false) {
      stop(); const s = C.settings(value);
      $('mode').value = s.mode; $('grammar').value = s.grammar; $('mode').onchange?.();
      const scenario = s.scenario || { request: C.sceneName(s), title: C.sceneName(s), relationship: '英語で話す相手', place: C.sceneName(s), time: '会話を始めるとき', partnerName: 'Mia', context: C.sceneContext(s), assumed: [] };
      $('scene-request').value = scenario.request; edit(scenario, isManual);
    }
  };
})();
