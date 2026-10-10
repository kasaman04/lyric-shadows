(function (root, factory) {
  const rules = factory();
  if (typeof module === 'object' && module.exports) module.exports = rules; else root.PetRules = rules;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const bands = [30, 60, 120, 180, 300, 480, 720, 1080, 1440];
  const careAmounts = [300, 1800, 3600], maxLevel = 10;
  const elements = [
    ['fire','火','ひだねぷに','#e8a08b','小さな炎から、へんてこな火のかたまりへ','coral red, a living orange-yellow flame'],
    ['water','水','しずくぷに','#93bfda','しずくから、ぷるぷるの水のバケモノへ','sky blue, water drop and watery tail'],
    ['grass','草','めばえぷに','#98c59b','小さな芽から、もじゃもじゃの植物へ','mint green, green leaves and plant sprouts'],
    ['thunder','雷','ぱちぷに','#dbc875','ぱちぱちした耳から、大きな雷の手へ','lemon yellow, angular ears and zigzag tail'],
    ['ice','氷','こおりぷに','#a9d3de','氷の角から、ごつごつの氷の体へ','icy blue, translucent crystal spikes'],
    ['wind','風','ふわぷに','#bbd3d1','ふわふわの雲から、ぐるぐるの風へ','pale blue-white, cloud lobes and curled air tuft'],
    ['earth','土','どろぷに','#bc977e','泥だんごから、ずっしりした大きな塊へ','terracotta brown, pebble body and stone knobs'],
    ['poison','毒','どくぷに','#b79ac8','小さなきのこから、不思議な毒の体へ','lilac purple, mushroom tuft and dark purple spots'],
    ['light','光','ぴかぷに','#ddcd8d','小さな光から、まぶしい不思議な姿へ','buttery yellow, a floating golden halo'],
    ['dark','闇','かげぷに','#81848b','小さな影から、形の読めない影の巨体へ','charcoal black, cream pill eyes and curled shadow tuft']
  ].map(([id,label,name,color,description,design],i)=>({id,label,name,color,description,design,index:i,imageUrl:`/pet-images/starter-${id}-v1.png`}));
  const element = id => elements.find(e=>e.id===id);
  const growth = pet => pet.growthSeconds ?? pet.seconds ?? 0;
  function required(level) { return level >= maxLevel ? 0 : bands[Math.max(0,level-1)] * 60; }
  function progress(seconds) {
    let level=1,remaining=Math.max(0,seconds);
    while(level<maxLevel && remaining>=required(level)){remaining-=required(level);level++;}
    return {level,earned:level===maxLevel?0:remaining,required:required(level)};
  }
  const stage = level => Math.max(1,Math.min(maxLevel,level));
  const titles=['','こぷに','のびぷに','でかぷに','もじゃぷに','へんぷに','大ぷに','巨ぷに','ぷにの主','ぷに大王'];
  const catalog=elements.flatMap(e=>Array.from({length:maxLevel},(_,i)=>({id:e.index*10+i+1,name:i===0?e.name:`${e.label}の${titles[i]}`,element:e.id,stage:i+1,family:e.id,variant:i,parents:i===0?[]:[e.index*10+i]})));
  const species = (id,level) => catalog[(element(id)?.index ?? 2)*10+stage(level)-1];
  function dominant(stats) { return ['body','power','brain'].sort((a,b)=>stats[b]-stats[a])[0]; }
  function choose(level,stats,previous,seed,id) { return species(id || catalog[previous-1]?.element || 'grass',level); }
  const ended = pet => !!(pet?.diedAt || pet?.departedAt);
  function hunger(pet,now) { return Math.max(0,Math.min(100,100*(1-((pet.diedAt||pet.departedAt||now)-pet.lastFedAt)/(72*3600000)))); }
  function dayKey(now) { return new Date(now+9*3600000).toISOString().slice(0,10); }
  const frameStates={idle:[0,1,2,3],food:[4,5,6,7,8,9],power:[10,11,12,13,14,15],brain:[16,17,18,19,20,21],hungry:[22,23,24,25],weak:[26,27]};
  return {bands,maxLevel,careAmounts,elements,element,species,growth,required,progress,stage,catalog,choose,dominant,ended,hunger,dayKey,frameStates};
});
