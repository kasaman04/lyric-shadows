'use strict';
const rules=require('../public/pet-rules');
const DAY=86400000;
function enablePractice(state,now,policy){
  if(!state.sentencePractice&&!policy)return;
  state.sentencePractice||={version:1,policy:policy||'daily',daily:{},receipts:{}};
  const ledger=state.sentencePractice;
  state.phraseListening||={version:1,daily:{},totalSeconds:0,intervals:[]};
  ledger.policy='time';ledger.version=3;
  const pet=state.pets.at(-1);
  if(!pet||pet.departedAt||pet.diedAt&&!pet.practice)return;
  // Existing pets receive their first full Japan calendar day; no retroactive deaths.
  pet.practice||={from:rules.nextDay(rules.dayKey(now)),policy:ledger.policy};
  if(pet.practice.policy==='daily'){
    // The daily-only release reused lifeExpiresAt as a calendar deadline.
    // Carry its remaining time forward (within the original 24-hour cap),
    // then resume the time ledger without paying past listening twice.
    const expires=Math.min(rules.listeningDeadline(pet),now+rules.listeningTimeoutMs);
    pet.lifeBaseAt=now;pet.lifeBaseExpiresAt=expires;pet.lifeExpiresAt=expires;
    pet.lifeIntervals=[];pet.lifeCreditedMs=0;pet.practice.timeRuleRestoredAt=now;
  }
  pet.practice.policy='time';
  pet.practice.counts=ledger.daily;
  pet.practice.phraseSeconds=state.phraseListening.daily;
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
  return {...rules.practiceStatus(null,now),...rules.practiceProgress(count,state.phraseListening?.daily?.[rules.dayKey(now)])};
}
module.exports={enablePractice,recordPractice,viewPractice};
