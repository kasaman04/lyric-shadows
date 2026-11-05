'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),phrases=require('../data/relative-conversation-phrases.json');
const keys=['who','whose','which','that','what','when','where','why','how','whoever','whatever','whichever','whenever','wherever','however'];
const connectors=['by the time','whether','now that','once','so that','in case','as soon as','even though','unless','while','as'];
const publishedAudio=require('../data/conversation-connectors-audio.json').conversations;
const additions=require('../data/conversation-connectors-additions.json').conversations.filter(c=>publishedAudio[c.id]);
const expectedTotal=150+additions.length;
const expectedBasic=90+additions.filter(c=>['once','as soon as','even though','unless','while','as'].includes(c.type)).length;
const expectedAdvanced=expectedTotal-expectedBasic;
function browser(){
 const timers=new Map();let timerId=0;
 class Audio{constructor(src=''){this.src=src;this.paused=true;this.currentTime=0;this.preload='none'}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}}
 const ctx={window:{addEventListener(){},scrollTo(){}},document:{addEventListener(){},querySelectorAll(){return []},hidden:false},navigator:{},Audio,URL,URLSearchParams,console,seed:phrases,
   setTimeout(fn){const id=++timerId;timers.set(id,fn);return id},clearTimeout(id){timers.delete(id)}};
 const appSource=fs.readFileSync(path.join(root,'public/app.js'),'utf8');
 const startup=appSource.lastIndexOf('\ninit()');
 assert.ok(startup>=0,'Locate browser startup without running it in the unit test');
 vm.createContext(ctx);vm.runInContext(appSource.slice(0,startup),ctx);
 vm.runInContext("state.phrases=seed;stopAudio=()=>{};stopSongAudio=()=>{};renderPhrasePractice=()=>{};setMediaSession=()=>{};clearMediaSession=()=>{};updatePhraseRepeatButtons=()=>{};shuffleArray=()=>{throw Error('Sequential playback must not shuffle')};",ctx);
 return {ctx,timers,run:code=>vm.runInContext(code,ctx)};
}
test('existing and added bilingual conversations have the expected categories, two voices and all audio files',()=>{
 assert.equal(phrases.length,expectedTotal);assert.equal(new Set(phrases.map(p=>p.id)).size,expectedTotal);
 assert.equal(phrases.filter(p=>p.pack==='基本').length,expectedBasic);assert.equal(phrases.filter(p=>p.pack==='応用').length,expectedAdvanced);
 assert.deepEqual(Object.keys(require('../public/phrase-expression-guides.js')),[...keys,...connectors]);
 assert(phrases.every(p=>!['whom','whomever'].includes(p.relativeType)));
 for(const key of keys)assert.equal(phrases.filter(p=>p.category===key).length,10,key);
 for(const key of connectors)assert.equal(phrases.filter(p=>p.category===key).length,additions.filter(c=>c.type===key).length,key);
 for(const c of additions){const p=phrases.find(p=>p.id===c.id);assert.equal(p.phrase,c.targetSentence);assert.deepEqual(p.lines,c.turns.map(t=>[t.speaker,t.en,t.ja]));assert.equal(p.audioDuration,publishedAudio[c.id].duration);assert.deepEqual(p.audioCues,publishedAudio[c.id].cues);}
 for(const p of phrases){assert.deepEqual(p.lines.map(l=>l[0]),['A','B','A']);assert(p.lines.every(l=>l[1]&&l[2]));assert.equal(p.lines[p.targetLineIndex][1],p.phrase);assert(new RegExp('\\b'+p.relativeType+'\\b','i').test(p.phrase));assert.notEqual(p.voiceCast.A.key,p.voiceCast.B.key);assert.equal(p.audioCues.length,3);assert(p.audioDuration>1);assert(fs.statSync(path.join(root,'public',p.audio)).size>1000,p.id)}
 const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'public/relative-phrases.js'),'utf8'),context);assert.deepEqual(JSON.parse(JSON.stringify(context.window.CONVERSATION_PHRASES)),phrases);
 const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');assert.match(html,/relative-phrases\.js\?v=connectors-20261105-1/);assert.doesNotMatch(html,/<script src="(?:phrases|real-phrases|generated-phrase-dialogue)\.js/);
});
test('play all uses current expression or pack in source order, including restart',()=>{
 const b=browser();
 for(const [pack,category,count] of [['すべて','すべて',expectedTotal],['基本','すべて',expectedBasic],['応用','すべて',expectedAdvanced],['すべて','who',10],['応用','however',10],['すべて','by the time',10],['基本','as',additions.filter(c=>c.type==='as').length]]){
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
test('multi-word connector highlighting preserves the text and only marks the target turn',()=>{
 const b=browser();
 for(const expression of connectors){
  b.ctx.expression=expression;
  const text='Please use '+expression+' in this sentence.';b.ctx.english=text;
  const marked=b.run('phraseEnglish({relativeType:expression,targetLineIndex:1},english,1)');
  assert(marked.includes('<mark class="phrase-relative-word">'+expression+'</mark>'),expression);
  assert.equal(marked.replace(/<[^>]+>/g,''),text);
  assert.equal(b.run('phraseEnglish({relativeType:expression,targetLineIndex:1},english,0)'),text);
 }
 assert.equal(b.run("phraseEnglish({relativeType:'as.*'},'as <script>')"),'as &lt;script&gt;');
});
test('each added connector has bilingual usage guidance and examples that highlight the whole expression',()=>{
 const b=browser();b.ctx.window.PHRASE_EXPRESSION_GUIDES=require('../public/phrase-expression-guides.js');
 for(const expression of connectors){
  const guide=b.ctx.window.PHRASE_EXPRESSION_GUIDES[expression];assert(guide.title&&guide.role&&guide.pattern&&guide.note);
  assert(guide.examples.every(e=>e.en&&e.ja&&new RegExp('\\b'+expression+'\\b','i').test(e.en)));
  b.ctx.expression=expression;const rendered=b.run('renderPhraseExpressionGuide(expression)');
  assert(rendered.includes('phrase-expression-guide'));
  assert(rendered.includes('phrase-relative-word">'+expression+'</mark>')||rendered.includes('phrase-relative-word">'+expression[0].toUpperCase()+expression.slice(1)+'</mark>'),expression);
 }
});
test('pending automatic advance is canceled when playback stops or changes',()=>{
 const b=browser();b.run("state.view='phrasePractice';playPhraseSharedAudio('/first.mp3',{autoAdvance:true});savedEnded=state.phrasePracticeAudio.onended;state.phrasePracticeAudio.onended()");assert.equal(b.timers.size,1);
 b.run('stopPhrasePracticeAudio()');assert.equal(b.timers.size,0);
 b.run("playPhraseSharedAudio('/next.mp3',{autoAdvance:true});savedEnded()");assert.equal(b.timers.size,0);assert.equal(b.run('state.phrasePracticeAudio.src'),'/next.mp3');
});

test('card playback selects only the displayed sentence, including middle and final turns',()=>{
 const b=browser();
 b.run('stopDramaAudio=()=>{};stopQuoteCardAudio=()=>{}');
 for(const index of [0,1,2]){
  b.ctx.phrase=phrases.find(p=>p.targetLineIndex===index);
  const src=b.run('getPhraseCardAudioSrc(phrase)');
  assert.equal(src,b.ctx.phrase.audio.replace(/\.mp3$/,`-line-${index+1}.mp3`));
  assert(fs.statSync(path.join(root,'public',src)).size>1000);
  b.run("state.view='home';togglePhraseCardAudio(phrase.id)");
  assert.equal(b.run('state.phrasePracticeAudio.src'),src);
  assert.equal(b.run('state.view'),'home');
  assert.equal(b.run('state.phrasePracticeAudio.loop'),false);
  b.run('state.phrasePracticeAudio.onended()');assert.equal(b.timers.size,0);
  b.run('togglePhraseCardAudio(phrase.id)');assert.equal(b.run('state.phrasePracticeAudio.paused'),true);
  b.run('togglePhraseCardAudio(phrase.id)');assert.equal(b.run('state.phrasePracticeAudio.paused'),false);
 }
 assert.equal(b.run("getPhraseCardAudioSrc({...phrase,audioCues:[]})"),'');
 assert.equal(b.run("getPhraseCardAudioSrc({...phrase,phrase:'a different sentence'})"),'');
 const rules=require('../public/pet-rules');
 for(const phrase of phrases){b.ctx.phrase=phrase;const src=b.run('getPhraseCardAudioSrc(phrase)');assert(fs.statSync(path.join(root,'public',src)).size>1000);assert.equal(rules.phraseAudioPath(src),phrase.audio);}
});
