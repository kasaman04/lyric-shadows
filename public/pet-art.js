(function (root, factory) {
  const art = factory();
  if (typeof module === 'object' && module.exports) module.exports = art; else root.PetArt = art;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const emblems = {
    fire: {label:'火', shape:'<path fill="#df9a77" d="M33 6C37 21 52 24 51 40a19 19 0 0 1-38 0c0-9 5-16 12-23-1 11 3 14 5 13 5-4 6-13 3-24Z"/><path fill="#f3d79c" d="M32 32c7 7 10 11 8 16-2 7-14 7-16 0-2-5 3-11 8-16Z"/>'},
    water: {label:'水', shape:'<path fill="#9cbdce" d="M32 7C28 16 14 30 14 41a18 18 0 0 0 36 0C50 30 36 16 32 7Z"/><path d="M23 39q-2 10 8 11" fill="none" stroke="#e9f1e9"/>'},
    grass: {label:'草', shape:'<path fill="#a8b67d" d="M31 40C14 43 8 30 7 19c17-1 27 5 25 20M33 40c17 3 23-10 24-21-17-1-27 5-25 20Z"/><path d="M32 56V38M31 39 17 28m16 11 14-11" fill="none"/>'},
    thunder: {label:'雷', shape:'<path fill="#d4bb70" d="m36 6-22 29h16l-3 23 24-31H35Z"/>'},
    ice: {label:'氷', shape:'<path d="M32 6v52M10 19l44 26M10 45l44-26M24 13l8 7 8-7M24 51l8-7 8 7M12 28l10-3-2-10m32 21-10 3 2 10M20 49l2-10-10-3m32-21-2 10 10 3" fill="none" stroke="#71989e"/>'},
    wind: {label:'風', shape:'<path d="M7 23h34c14 0 14-18 3-18-6 0-8 4-8 7M7 34h45M7 45h27c14 0 14 15 4 15-5 0-8-4-8-7" fill="none"/>'},
    earth: {label:'土', shape:'<path fill="#b99a7c" d="m7 50 13-25q4-7 8 0l7 13 6-10q4-6 8 0l9 22Z"/><path d="m17 50 7-13m15 13 7-10" fill="none"/>'},
    poison: {label:'毒', shape:'<path fill="#ede6cb" d="m26 31-3 24q8 5 18 0l-3-24Z"/><path fill="#b9a0c2" d="M8 31C8 1 56 1 56 31q-24 10-48 0Z"/><circle cx="22" cy="22" r="3" fill="#efe8d4"/><circle cx="39" cy="16" r="4" fill="#efe8d4"/><circle cx="47" cy="29" r="2" fill="#efe8d4"/>'},
    light: {label:'光', shape:'<circle fill="#dfc97d" cx="32" cy="32" r="13"/><path d="M32 5v9m0 36v9M5 32h9m36 0h9M13 13l6 6m26 26 6 6M13 51l6-6m26-26 6-6" fill="none"/>'},
    dark: {label:'闇', shape:'<path fill="#8c8a91" d="M44 8C14 0 3 37 25 52c10 7 24 3 31-7C29 53 20 23 44 8Z"/>'}
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function memorial(pet, form, {still=false}={}) {
    const element=emblems[pet.element] ? pet.element : 'grass', mark=emblems[element];
    const name=escape(form?.name||pet.name||'相棒');
    return `<div class="pet-portrait pet-memorial" role="img" aria-label="${mark.label}属性の${name}のお墓"><div class="pet-character-visual pet-memorial-visual"><img class="pet-memorial-stone" src="/pet-images/memorial-stone-v1.png" alt="" loading="${still?'lazy':'eager'}" draggable="false"><svg class="pet-memorial-mark" data-memorial-element="${element}" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="#574d37" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${mark.shape}</svg><span class="pet-memorial-name" aria-hidden="true">${name}</span></div></div>`;
  }
  function room(level) {
    const stage = Math.max(1, Math.min(5, Math.floor(((Number(level) || 1) - 1) / 2) + 1));
    return `<img class="pet-room" src="/pet-backgrounds/room-stage-${stage}-v1.png" alt="" aria-hidden="true" draggable="false">`;
  }
  return { room, memorial };
});
