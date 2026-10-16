'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const rules=require('../public/pet-rules'),art=require('../public/pet-art');
const {newPet,createState,action}=require('../lib/pet-store');
const stamp=Date.parse('2026-10-16T00:00:00Z'),HOUR=3600000;
class Clock extends Date {static now(){return stamp;}}
function fixture(hours=24){const s=createState(stamp),p=newPet(stamp-24*HOUR,'grass');p.lifeExpiresAt=stamp+hours*HOUR;s.pets.push(p);s.bankSeconds=3600;return s;}
function ui(state){
 const badge={textContent:''},context={window:{PetRules:rules,PetArt:art},Date:Clock,crypto:{randomUUID:()=> 'test-id'},document:{querySelectorAll:()=>[badge],getElementById:()=>null}};
 const source=fs.readFileSync(require.resolve('../public/pet.js'),'utf8').replace('  window.PetGame = { initialize,','  window.PetTest={setState(s){save=s;},room,sheetContent,updateBadge,setSheet(s){sheet=s;},setSource(s){careSource=s;},pendingPlayback};\n  window.PetGame = { initialize,');
 vm.runInNewContext(source,context);const view=context.window.PetTest;view.setState(state);view.badge=badge;return view;
}
test('survival percentage follows the listening deadline and clamps at 0 and 100',()=>{
 const pet=fixture(6).pets[0];assert.equal(rules.lifePercent(pet,stamp),25);
 assert.equal(rules.lifePercent(pet,stamp+6*HOUR),0);assert.equal(rules.lifePercent(pet,stamp+7*HOUR),0);
 assert.equal(rules.lifePercent({...pet,lifeExpiresAt:stamp+48*HOUR},stamp),100);
 const legacy={bornAt:stamp,lastListenedAt:stamp};assert.equal(rules.lifePercent(legacy,stamp+12*HOUR),50);
});
test('old feeding time does not make a healthy pet hungry; recent food cannot hide low life',()=>{
 const s=fixture(),p=s.pets[0],view=ui(s);
 p.lastFedAt=stamp-48*HOUR;let html=view.room();view.updateBadge();
 assert.match(html,/aria-label="生存時間"[^>]*aria-valuenow="100"/);assert.match(html,/きょうも、いっしょに聴こう。/);assert.equal(view.badge.textContent,'育成');
 p.lastFedAt=stamp;p.lifeExpiresAt=stamp+6*HOUR;html=view.room();view.updateBadge();
 assert.match(html,/aria-valuenow="25"/);assert.match(html,/力が出ないよ。いっしょに英語を聴こう/);assert.match(html,/生存時間 残り 6時間/);assert.equal(view.badge.textContent,'英語を聴いて回復しよう');
 assert.doesNotMatch(html,/おなか|お腹|ごはんがほしい/);
});
test('unsynced actual playback recovers the displayed life without spending or feeding',()=>{
 const s=fixture(6),p=s.pets[0],view=ui(s);p.lifeBaseAt=stamp-HOUR;p.lifeBaseExpiresAt=stamp+6*HOUR;
 // Five minutes played before now: one hour of recovery.
 view.pendingPlayback.set('pending',{petId:p.id,start:stamp-300000,end:stamp});
 assert.match(view.room(),/生存時間 残り 7時間/);assert.equal(p.lifeExpiresAt,stamp+6*HOUR);assert.equal(s.bankSeconds,3600);
});
test('all three growth items spend the chosen currency and preserve survival time, including retries',()=>{
 for(const payment of ['time','coins'])for(const [type,stat] of [['food','body'],['power','power'],['brain','brain']]){
  const s=fixture(6),p=s.pets[0];s.conversationGame={coins:500};const deadline=p.lifeExpiresAt;
  const request={type,petId:p.id,requestId:`growth-item-${payment}-${type}`,payment,seconds:payment==='time'?1800:300};
  action(s,request,stamp);action(s,request,stamp);
  assert.equal(p.stats[stat],payment==='time'?6:1);assert.equal(p.growthSeconds,request.seconds);assert.equal(p.lifeExpiresAt,deadline);
  for(const other of ['body','power','brain'].filter(k=>k!==stat))assert.equal(p.stats[other],0);
  assert.equal(s.bankSeconds,payment==='time'?1800:3600);assert.equal(s.conversationGame.coins,payment==='time'?500:400);
 }
});
test('care choices and rules explain growth instead of hunger, for both payment methods',()=>{
 const view=ui(fixture());view.setSheet('care');
 for(const source of ['coins','time']){
  view.setSource(source);const html=view.sheetContent();
  assert.match(html,/どんな子に育てる？/);assert.match(html,/体格 \+1/);assert.match(html,/パワー \+1/);assert.match(html,/かしこさ \+1/);
  assert.match(html,/アイテムで能力と進化の方向が育ちます/);assert.match(html,/生存時間は、英語を聴くと回復/);assert.doesNotMatch(html,/おなか|全回復/);
 }
 view.setSheet('rules');assert.doesNotMatch(view.sheetContent(),/おなか|お腹/);assert.match(view.sheetContent(),/30分未満も秒単位で回復/);
});
test('eating animation rewards body growth without animating the survival gauge',()=>{
 let meterQueries=0;const reward={textContent:''},speech={textContent:''};
 const sprite={getBoundingClientRect:()=>({left:0,top:0,width:100,height:100,bottom:100}),animate:()=>({cancel(){}})};
 const layer={style:{setProperty(){}},querySelector:()=>reward,remove(){}};
 const habitat={querySelector(selector){if(selector.includes('meter'))meterQueries++;return selector==='.pet-character-visual'?sprite:selector==='.pet-speech'?speech:null;},getBoundingClientRect:()=>({left:0,top:0,height:300}),appendChild(){},classList:{add(){},remove(){}}};
 const context={window:{},document:{createElement:()=>layer},matchMedia:()=>({matches:false}),setTimeout:()=>1,clearTimeout(){}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../public/pet-reactions.js'),'utf8'),context);
 const reaction=context.window.PetReactions.play({type:'food',habitat});
 assert.equal(reward.textContent,'体格 +1');assert.equal(meterQueries,0);reaction.stop();
});
