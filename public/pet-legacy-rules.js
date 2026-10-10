(function (root, factory) {
  const rules = factory();
  if (typeof module === 'object' && module.exports) module.exports = rules;
  else root.PetRules = rules;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const bands = [10, 30, 60, 90, 120, 180, 240, 360, 480, 720];
  const careAmounts = [300, 1800, 3600];
  function growth(pet) { return pet.growthSeconds ?? pet.seconds ?? 0; }
  function required(level) { return level >= 100 ? 0 : bands[Math.floor((level - 1) / 10)] * 60; }
  function progress(seconds) {
    let level = 1, remaining = Math.max(0, seconds);
    while (level < 100 && remaining >= required(level)) { remaining -= required(level); level++; }
    return { level, earned: level === 100 ? 0 : remaining, required: required(level) };
  }
  function stage(level) { return level < 10 ? 1 : level < 20 ? 2 : level < 40 ? 3 : level < 70 ? 4 : 5; }
  const families = [
    ['arms', 'power', 2, 'ながうでぷに|だらうで|おおてぶくろ|てのひら顔|うでひきずり王|うで橋さま|てぶくろ巨人|おてて大王'],
    ['hands', 'power', 2, 'よつてぷに|おててならび|背中てて|腹てて|おてて百段|拍手のかたまり|うしろ抱っこ王|皿もち観音'],
    ['legs', 'power', 2, 'あしのびぷに|ひざなが|足裏でか|あし増し|ひょろあし巨人|折り畳み長老|くつ底大王|ぞろぞろ腹獣'],
    ['belly', 'body', 3, 'ぽんぽこぷに|床つき腹|腹だんだん|ほっぺ腹|おなか山|腹ころがし|三段腹さま|もち壁大王'],
    ['stack', 'body', 3, '二段ぷに|三段もち|よこだんご|ずれだるま|十段もち王|逆もちタワー|だんご列車|斜め積み巨人'],
    ['soft', 'body', 3, 'やわぷに|たれほっぺ|ぺたもち|ひだぷに|たれ幕大王|ほっぺ脚さま|床いっぱいぷに|折り目巨獣'],
    ['long', 'brain', 4, 'どうながぷに|くび胴いっしょ|くねぷに|わっか胴|棒ぷに大王|のぞき首さま|くねり大蛇|輪っか巨人'],
    ['tail', 'brain', 4, 'しっぽ芽ぷに|しっぽ座布団|しっぽ手|しっぽ顔|しっぽ絨毯王|しっぽ背もたれ|しっぽ歩き巨人|前後ぷに王'],
    ['sprout', 'brain', 4, '芽のびぷに|芽ふたまた|芽くるくる|芽てて|芽冠大王|芽もじゃ巨人|芽うずまき山|芽つかみさま'],
    ['ears', 'power', 2, 'みみ芽ぷに|みみだれ|みみひらき|みみ顔|耳ひきずり王|耳巻き長老|耳ついたて|三顔みみ獣'],
    ['mouth', 'body', 3, 'くちひろぷに|くちだれ|ほっぺ袋|腹ぐち|あご袋大王|くち座布団|ほっぺ倉庫獣|おなか食堂'],
    ['shadow', 'brain', 4, 'かげぷに|かげのび|ふたご背中|からぷに|影だけ大王|影だっこ巨人|ぷに団地|歴代ぷにさま']
  ];
  const catalog = [
    { id: 1, name: 'まめぷに', stage: 1, family: 'baby', variant: 0, parents: [] },
    { id: 2, name: 'てのびぷに', stage: 2, family: 'arms', variant: 0, parents: [1] },
    { id: 3, name: 'ふくぷに', stage: 2, family: 'belly', variant: 0, parents: [1] },
    { id: 4, name: 'のびぷに', stage: 2, family: 'long', variant: 0, parents: [1] }
  ];
  families.forEach(([family, stat, parent, names], f) => names.split('|').forEach((name, v) => {
    const first = 5 + f * 8;
    const parents = v === 0 ? [parent] : v < 4 ? [first] : [first + (v < 6 ? 1 : v === 6 ? 2 : 3)];
    catalog.push({ id: first + v, name, family, stat, variant: v, stage: v === 0 ? 3 : v < 4 ? 4 : 5, parents });
  }));
  function dominant(stats) { return ['body', 'power', 'brain'].sort((a, b) => stats[b] - stats[a])[0]; }
  function choose(level, stats, previous, seed) {
    const target = stage(level);
    if (target === 1) return catalog[0];
    let choices = catalog.filter(c => c.stage === target && c.parents.includes(previous));
    if (!choices.length) choices = catalog.filter(c => c.stage === target);
    if (target === 2) return catalog[{ power: 1, body: 2, brain: 3 }[dominant(stats)]];
    if (target === 3) choices = choices.filter(c => c.stat === dominant(stats)).length ? choices.filter(c => c.stat === dominant(stats)) : choices;
    const mix = Math.round(stats.body * 7 + stats.power * 13 + stats.brain * 19 + seed);
    return choices[((mix % choices.length) + choices.length) % choices.length];
  }
  function hunger(pet, now) { return Math.max(0, 100 * (1 - (now - pet.lastFedAt) / (72 * 3600000))); }
  function dayKey(now) { return new Date(now + 9 * 3600000).toISOString().slice(0, 10); }
  return { bands, careAmounts, growth, required, progress, stage, catalog, choose, hunger, dayKey };
});
