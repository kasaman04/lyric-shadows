(function (root, factory) {
  const art = factory();
  if (typeof module === 'object' && module.exports) module.exports = art; else root.PetArt = art;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  function room(level) {
    const stage = Math.max(1, Math.min(5, Math.floor(((Number(level) || 1) - 1) / 2) + 1));
    return `<img class="pet-room" src="/pet-backgrounds/room-stage-${stage}-v1.png" alt="" aria-hidden="true" draggable="false">`;
  }
  return { room };
});
