(() => {
  'use strict';
  const rice = '<svg viewBox="0 0 48 48"><path d="M8 37Q2 34 7 25L20 6q4-6 8 0l14 20q5 10-2 12Z" fill="#fff5dc" stroke="#765e43" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 27h13v13H18Z" fill="#4f6a50"/><path d="m13 22 2-2m16-3 2 2m-11-4 1 2" stroke="#dccaa6" stroke-width="2" stroke-linecap="round"/></svg>';
  const bulb = '<svg viewBox="0 0 48 56"><path d="M15 35C1 21 10 7 24 7s23 14 9 28l-2 7H17Z" fill="#ffe29b" stroke="#95733e" stroke-width="2.5"/><path d="M17 43h14m-13 5h12m-10 4h8M20 26l4 5 5-7m-5 7v11" fill="none" stroke="#95733e" stroke-width="2.5" stroke-linecap="round"/></svg>';
  function particles(symbol, count, kind) {
    return Array.from({ length: count }, (_, i) => `<i class="pet-care-particle ${kind}" style="--dx:${(i - (count - 1) / 2) * 32}px;--delay:${.9 + i * .13}s;--twist:${i % 2 ? 18 : -18}deg">${symbol}</i>`).join('');
  }
  const scenes = {
    food: { duration: 3600, reward: 'おなか 100% · 体格 +1', words: [[0,'いただきます！'],[850,'もぐもぐ、もぐもぐ…'],[2250,'ぷはぁ。おなかいっぱい！']],
      art: `<div class="pet-care-actor" aria-hidden="true"><div class="pet-care-rice">${rice}</div><span class="pet-care-munch">もぐもぐ</span>${particles('♥',5,'pet-care-heart')}</div>` },
    power: { duration: 3800, reward: 'パワー +1', words: [[0,'ぐぐぐ…！'],[1150,'ふんっ！'],[2650,'まだまだ強くなる！']],
      art: `<div class="pet-care-floor" aria-hidden="true"><i class="pet-care-ring"></i><i class="pet-care-ring second"></i><span class="pet-care-impact">ドンッ</span></div><div class="pet-care-actor" aria-hidden="true">${particles('✦',7,'pet-care-spark')}</div>` },
    brain: { duration: 4200, reward: 'かしこさ +1', words: [[0,'うーん…？'],[1650,'あっ、わかった！'],[3000,'ひとつ賢くなった！']],
      art: `<div class="pet-care-thought" aria-hidden="true"><span>… ?</span><div class="pet-care-bulb">${bulb}</div><i class="pet-care-idea-ring"></i></div><div class="pet-care-actor" aria-hidden="true">${particles('✧',6,'pet-care-star')}</div>` }
  };
  function frames(type) {
    if (type === 'food') return [
      [0,'translateY(0) scale(1)'],[.1,'translateY(7px) rotate(-7deg) scale(.98,1.02)'],
      [.22,'translateY(0) scale(1.08,.94)'],[.29,'translateY(0) scale(.96,1.04)'],
      [.36,'translateY(0) scale(1.08,.94)'],[.43,'translateY(0) scale(.96,1.04)'],
      [.50,'translateY(0) scale(1.07,.95)'],[.57,'translateY(0) scale(.98,1.02)'],
      [.68,'translateY(2px) scale(1.1,.93)'],[.77,'translateY(-24px) rotate(5deg) scale(.96,1.04)'],
      [.86,'translateY(0) rotate(-4deg) scale(1.05,.96)'],[1,'translateY(0) scale(1)'] ];
    if (type === 'power') return [
      [0,'translateY(0) scale(1)'],[.15,'translateY(12px) scale(1.13,.86)'],
      [.23,'translateY(12px) rotate(-3deg) scale(1.13,.86)'],[.28,'translateY(12px) rotate(3deg) scale(1.13,.86)'],
      [.34,'translateY(-50px) rotate(-5deg) scale(.9,1.12)'],[.43,'translateY(-34px) rotate(4deg) scale(1)'],
      [.50,'translateY(8px) scale(1.2,.82)'],[.58,'translateY(-15px) scale(.97,1.04)'],
      [.68,'translateY(0) scale(1.08,.95)'],[.82,'translateY(-7px) rotate(-4deg) scale(1.05)'],[1,'translateY(0) scale(1)'] ];
    return [ [0,'translateY(0) scale(1)'],[.16,'translateY(0) rotate(-9deg)'],
      [.32,'translateY(0) rotate(7deg)'],[.42,'translateY(6px) rotate(-6deg) scale(1.06,.96)'],
      [.52,'translateY(-23px) rotate(0) scale(.96,1.05)'],[.63,'translateY(-12px) scale(1.04)'],
      [.8,'translateY(-5px) rotate(4deg)'],[1,'translateY(0) scale(1)'] ];
  }
  function play({ type, habitat, framePlayer, beforeHunger = 100, reward, onEnd = () => {} }) {
    const scene = scenes[type], sprite = habitat?.querySelector('.pet-character-visual');
    if (!scene || !sprite) return null;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 1800 : scene.duration;
    const rect = sprite.getBoundingClientRect(), room = habitat.getBoundingClientRect();
    const layer = document.createElement('div'); layer.className = `pet-care-scene pet-care-${type}`;
    layer.style.setProperty('--care-x', `${rect.left - room.left + rect.width / 2}px`);
    layer.style.setProperty('--care-y', `${rect.top - room.top + rect.height * .52}px`);
    layer.style.setProperty('--care-head', `${Math.max(62,rect.top - room.top + rect.height * .12)}px`);
    layer.style.setProperty('--care-floor', `${Math.min(room.height - 78,rect.bottom - room.top - rect.height * .10)}px`);
    layer.innerHTML = scene.art + '<div class="pet-care-reward" role="status"></div>';
    layer.querySelector('.pet-care-reward').textContent = reward || scene.reward;
    habitat.appendChild(layer); habitat.classList.add('pet-reacting', `pet-reacting-${type}`);
    const speech = habitat.querySelector('.pet-speech');
    const timers = [], animations = []; let active = true;
    const schedule = (fn, ms) => timers.push(setTimeout(() => { if (active) fn(); }, ms));
    framePlayer?.play(type,duration);
    if (!reduced && sprite.animate) animations.push(sprite.animate(frames(type).map(([offset, transform]) => ({ offset, transform })), { duration, easing: 'ease-in-out', fill: 'none' }));
    if (type === 'food') {
      const meter = habitat.querySelector('.pet-meter i');
      if (!reduced && meter?.animate) animations.push(meter.animate([{ width: `${beforeHunger}%` }, { width: '100%' }], { delay: 900, duration: 1500, easing: 'ease-out', fill: 'backwards' }));
    }
    if (type === 'power' && !reduced) {
      const background = habitat.querySelector('.pet-room');
      if (background?.animate) animations.push(background.animate([{transform:'translate(0)'},{transform:'translate(-4px,2px)'},{transform:'translate(4px,-2px)'},{transform:'translate(-2px,1px)'},{transform:'translate(0)'}],{delay:duration*.5,duration:350,easing:'ease-out'}));
    }
    if (!reduced) for (const [ms, words] of scene.words) schedule(() => { if (speech) speech.textContent = words; }, ms);
    if (reduced && speech) speech.textContent = scene.words.at(-1)[1];
    const stop = (complete = false) => {
      if (!active) return; active = false;
      timers.forEach(clearTimeout); animations.forEach(a => a.cancel());
      layer.remove(); habitat.classList.remove('pet-reacting', `pet-reacting-${type}`);
      if (complete) onEnd();
    };
    schedule(() => stop(true), duration);
    return { stop };
  }
  window.PetReactions = { play };
})();
