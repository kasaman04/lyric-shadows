/* Shared Lyric Shadows identity and learning-time collector on the voice subpage. */
(() => {
  'use strict';
  const key = 'phraseDeviceId'; let id = '';
  try { id = localStorage.getItem(key) || ''; } catch {}
  if (!id) { try { id = decodeURIComponent((document.cookie.split('; ').find(part => part.startsWith(key + '=')) || '').slice(key.length + 1)); } catch {} }
  if (!/^[a-z0-9-]{12,80}$/i.test(id)) id = crypto.randomUUID();
  try { localStorage.setItem(key, id); } catch {}
  document.cookie = `${key}=${encodeURIComponent(id)}; max-age=31536000; path=/; samesite=lax`;
  window.PetGame.initialize(id).catch(() => {});
  document.getElementById('pet-open').onclick = () => window.PetGame.open();
  document.getElementById('listening-records').onclick = () => window.PetGame.openRecords();
  window.startConversationGame = () => location.assign('/#challenge');
})();
