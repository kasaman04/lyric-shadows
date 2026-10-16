'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const rules=require('../public/pet-rules'),art=require('../public/pet-art');
const {newPet,createState,evolve}=require('../lib/pet-store');
const {validateImage}=require('../lib/pet-image');

function fixture(status='dead',element='grass') {
 const now=Date.now(),state=createState(now),pet=newPet(now-86401000,element);
 pet.growthSeconds=12600;evolve(pet,now-86400000);
 for(const form of pet.forms)form.imageUrl=rules.element(element).imageUrl;
 if(status==='dead'){pet.diedAt=now-1000;pet.deathReason='inactivity';}
 else if(status==='departed')pet.departedAt=now-1000;
 else {pet.lifeExpiresAt=now+86400000;pet.lastFedAt=now;}
 state.pets.push(pet);state.serverNow=now;
 return state;
}
function ui(state) {
 const context={window:{PetRules:rules,PetArt:art},Date,crypto:{randomUUID:()=> 'test-id'}};
 let source=fs.readFileSync(require.resolve('../public/pet.js'),'utf8');
 source=source.replace('  window.PetGame = { initialize,','  window.PetTest = {setState(s){save=s;},header,room,book,detail};\n  window.PetGame = { initialize,');
 vm.runInNewContext(source,context);context.window.PetTest.setState(state);return context.window.PetTest;
}

test('all ten elements have distinct safe inline marks and a named memorial',()=>{
 const marks=new Set();
 for(const element of rules.elements){
  const html=art.memorial({element:element.id,name:'相棒'},null);
  assert.match(html,new RegExp('data-memorial-element="'+element.id+'"'));
  assert.ok(html.includes(element.label+'属性の相棒のお墓'));
  assert.match(html,/memorial-stone-v1\.png/);
  marks.add(html.match(/<svg[^>]*>(.*?)<\/svg>/)[1]);
 }
 assert.equal(marks.size,10);
 assert.match(art.memorial({element:'invalid',name:'相棒'}),/data-memorial-element="grass"/);
});

test('pet names are escaped in both visible inscription and accessible text',()=>{
 const html=art.memorial({element:'fire',name:'<img src=x onerror="bad">'},{name:'<b>相棒</b>'});
 assert.ok(html.includes('&lt;b&gt;相棒&lt;/b&gt;'));assert.ok(!html.includes('<b>'));
 assert.ok(!html.includes('src=x'));assert.ok(!html.includes('onerror='));
});

test('death room, history and detail use the grave while growth photos stay visible',()=>{
 const state=fixture(),before=JSON.stringify(state),view=ui(state);
 for(const render of [view.room,view.book,view.detail]){
  const html=render();assert.equal((html.match(/class="pet-portrait pet-memorial"/g)||[]).length,1);
  assert.match(html,/data-memorial-element="grass"/);
 }
 assert.match(view.header(),/相棒の思い出/);
 assert.ok(!view.room().includes('次の進化まで'));
 assert.match(view.room(),/いっしょに聴いた時間は、ずっと残る。/);
 assert.match(view.room(),/data-action="restart"/);
 assert.match(view.detail(),/pet-timeline/);assert.match(view.detail(),/starter-grass-v1\.png/);
 assert.equal(JSON.stringify(state),before);
});

test('living and departed pets keep their original portraits and never show a grave',()=>{
 for(const status of ['alive','departed']){
  const view=ui(fixture(status,'water'));
  for(const render of [view.room,view.book,view.detail]){const html=render();assert.ok(!html.includes('memorial-stone-v1'));assert.match(html,/starter-water-v1\.png/);}
 }
});

test('the reusable tombstone is a real transparent PNG',()=>{
 const bytes=fs.readFileSync(require.resolve('../public/pet-images/memorial-stone-v1.png'));
 const meta=validateImage(bytes);assert.equal(meta.transparent,true);assert.ok(meta.width>=1024);
});

module.exports={fixture,ui};
