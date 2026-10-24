'use strict';
const rules=require('../public/pet-rules');
const DAY=86400000;
function enablePractice(state,now,policy){
  if(!state.sentencePractice&&!policy)return;
  state.sentencePractice||={version:1,policy:policy||'daily',daily:{},receipts:{}};
  const ledger=state.sentencePractice;
  const pet=state.pets.at(-1);
  if(!pet||pet.departedAt||pet.diedAt&&!pet.practice)return;
  // Existing pets receive their first full Japan calendar day; no retroactive deaths.
  pet.practice||={from:rules.nextDay(rules.dayKey(now)),policy:ledger.policy};
  pet.practice.counts=ledger.daily;
  // Old background designers also inspect this field. Keep their deadline in
  // sync so a worker already running cannot kill a pet that met today's goal.
  if(pet.practice.policy==='daily')pet.lifeExpiresAt=rules.practiceDeadline(pet,now);
}
function recordPractice(state,{id,at},now){
  const ledger=state.sentencePractice;
  if(!ledger)return;
  if(!/^[a-f0-9-]{36}$/.test(id)||!Number.isFinite(at)||at>now+5000||at<now-7*DAY)return;
  for(const [key,time]of Object.entries(ledger.receipts))if(time<now-7*DAY)delete ledger.receipts[key];
  if(ledger.receipts[id]!==undefined)return;
  const day=rules.dayKey(at);ledger.daily[day]=(ledger.daily[day]||0)+1;ledger.receipts[id]=at;
}
function viewPractice(state,now){
  const pet=state.pets.at(-1);
  if(pet?.practice)return rules.practiceStatus(pet,now);
  const count=state.sentencePractice?.daily?.[rules.dayKey(now)]||0;
  return {...rules.practiceStatus(null,now),count,remaining:Math.max(0,10-count),met:count>=10};
}
module.exports={enablePractice,recordPractice,viewPractice};
