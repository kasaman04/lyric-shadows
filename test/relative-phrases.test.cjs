'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),phrases=require('../data/relative-conversation-phrases.json');
const keys=['who','whom','whose','which','that','what','when','where','why','how','whoever','whomever','whatever','whichever','whenever','wherever','however'];
function browser(){
 const timers=new Map();let timerId=0;
 class Audio{constructor(src=''){this.src=src;this.paused=true;this.currentTime=0;this.preload='none'}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}}
 const ctx={window:{addEventListener(){},scrollTo(){}},document:{addEventListener(){},hidden:false},navigator:{},Audio,URL,URLSearchParams,console,seed:phrases,
   setTimeout(fn){const id=++timerId;timers.set(id,fn);return id},clearTimeout(id){timers.delete(id)}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'public/app.js'),'utf8').replace(/init\(\);\s*$/,''),ctx);
 vm.runInContext("state.phrases=seed;stopAudio=()=>{};stopSongAudio=()=>{};renderPhrasePractice=()=>{};setMediaSession=()=>{};clearMediaSession=()=>{};updatePhraseRepeatButtons=()=>{};shuffleArray=()=>{throw Error('Sequential playback must not shuffle')};",ctx);
 return {ctx,timers,run:code=>vm.runInContext(code,ctx)};
}
test('170 complete bilingual conversations, ten per expression, with two voices and all audio files',()=>{
 assert.equal(phrases.length,170);assert.equal(new Set(phrases.map(p=>p.id)).size,170);
 assert.equal(phrases.filter(p=>p.pack==='基本').length,100);assert.equal(phrases.filter(p=>p.pack==='応用').length,70);
 for(const key of keys)assert.equal(phrases.filter(p=>p.category===key).length,10,key);
 for(const p of phrases){assert.deepEqual(p.lines.map(l=>l[0]),['A','B','A']);assert(p.lines.every(l=>l[1]&&l[2]));assert.equal(p.lines[p.targetLineIndex][1],p.phrase);assert(new RegExp('\\b'+p.relativeType+'\\b','i').test(p.phrase));assert.notEqual(p.voiceCast.A.key,p.voiceCast.B.key);assert.equal(p.audioCues.length,3);assert(p.audioDuration>1);assert(fs.statSync(path.join(root,'public',p.audio)).size>1000,p.id)}
 const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'public/relative-phrases.js'),'utf8'),context);assert.equal(context.window.CONVERSATION_PHRASES.length,170);
 const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');assert.match(html,/relative-phrases\.js\?v=relative-conversations-20261030-1/);assert.doesNotMatch(html,/<script src="(?:phrases|real-phrases|generated-phrase-dialogue)\.js/);
});
test('play all uses current expression or pack in source order, including restart',()=>{
 const b=browser();
 for(const [pack,category,count] of [['すべて','すべて',170],['基本','すべて',100],['応用','すべて',70],['すべて','who',10],['応用','however',10]]){
  b.ctx.selection={pack,category};b.run("state.phrasePack=selection.pack;state.phraseCategory=selection.category;startSelectedPhrasePlayback()");
  assert.equal(b.run('state.practiceSet.length'),count);assert.equal(b.run('state.practiceMode'),'sequential');assert.equal(b.run('state.practiceIndex'),0);
  const expected=phrases.filter(p=>(pack==='すべて'||p.pack===pack)&&(category==='すべて'||p.category===category)).map(p=>p.id);
  assert.deepEqual(Array.from(b.run('state.practiceSet.map(p=>p.id)')),expected);
  b.run('state.practiceIndex=5;restartPractice()');assert.equal(b.run('state.practiceIndex'),0);assert.deepEqual(Array.from(b.run('state.practiceSet.map(p=>p.id)')),expected);
 }
});
test('highlight only marks the relative expression, preserving the original English',()=>{
 const b=browser(),p=phrases.find(p=>p.id==='who-dialogue-03');b.ctx.phrase=p;
 assert.equal(b.run('phraseEnglish(phrase,phrase.lines[0][1],0)'),p.lines[0][1]);
 const marked=b.run('phraseEnglish(phrase,phrase.lines[1][1],1)');assert.match(marked,/<mark class="phrase-relative-word">who<\/mark>/);assert.equal(marked.replace(/<[^>]+>/g,''),p.lines[1][1]);
});
test('pending automatic advance is canceled when playback stops or changes',()=>{
 const b=browser();b.run("state.view='phrasePractice';playPhraseSharedAudio('/first.mp3',{autoAdvance:true});savedEnded=state.phrasePracticeAudio.onended;state.phrasePracticeAudio.onended()");assert.equal(b.timers.size,1);
 b.run('stopPhrasePracticeAudio()');assert.equal(b.timers.size,0);
 b.run("playPhraseSharedAudio('/next.mp3',{autoAdvance:true});savedEnded()");assert.equal(b.timers.size,0);assert.equal(b.run('state.phrasePracticeAudio.src'),'/next.mp3');
});
