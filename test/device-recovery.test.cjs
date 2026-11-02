const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../public/device-recovery.js'), 'utf8');
const target = '12345678-1234-4234-8234-123456789abc';
const previous = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
async function run(options = {}) {
  const memory = new Map([['phraseDeviceId', previous], ['savedPhraseIds', '["old"]'], ['hiddenPhraseIds', '["old-hidden"]'], ['petState:' + previous, '{"preserved":true}']]);
  const cookies = new Map([['phraseDeviceId', previous], ['savedPhraseIds', '%5B%22old%22%5D']]);
  const elements = Object.fromEntries(['status', 'detail', 'retry', 'home'].map(k => [k, {textContent:'', hidden:true, addEventListener(){}}]));
  const requests = [], navigations = [], historyCalls = [];
  const document = {getElementById:id => elements[id], get cookie(){return [...cookies].map(([k,v]) => k + '=' + v).join('; ');}, set cookie(value){if(options.blockCookies)return;const [pair] = value.split(';');const at = pair.indexOf('=');const key=pair.slice(0,at);if(value.includes('max-age=0;'))cookies.delete(key);else cookies.set(key,pair.slice(at+1));}};
  const context = {document, location:{hash:'#device=' + (options.target || target),pathname:'/restore.html',search:'',protocol:'https:',replace:url => navigations.push(url)},history:{replaceState:(...args)=>historyCalls.push(args)},localStorage:{getItem:k=>memory.get(k)??null,setItem(k,v){if(options.quota && k==='petState:'+target)throw Error('Storage full');memory.set(k,v);},removeItem:k=>memory.delete(k)},URLSearchParams,AbortSignal,Date,
    fetch:async(url,init)=>{requests.push({url,init});if(options.offline)throw Error('offline');return {ok:true,json:async()=>url.includes('phrase-preferences')?{enabled:true,found:!options.noPrefs,savedPhraseIds:['saved'],hiddenPhraseIds:[]}:(options.empty?{pets:[],totalSeconds:0}:{pets:[{forms:[{level:6}]}],totalSeconds:98126,sentenceReview:{items:{one:{}}}})};}};
  vm.runInNewContext(source, context);
  await new Promise(setImmediate);
  return {memory,cookies,elements,requests,navigations,historyCalls};
}
test('recovery reconnects identity and preferences, retains previous data, and removes link secret', async()=>{
  const s=await run();assert.deepEqual(s.navigations,['/#saved-device='+target]);assert.equal(s.memory.get('phraseDeviceId'),target);assert.equal(s.cookies.get('phraseDeviceId'),target);
  assert.equal(s.memory.get('savedPhraseIds'),'["saved"]');assert.equal(s.memory.get('hiddenPhraseIds'),'[]');assert.equal(s.cookies.get('savedPhraseIds'),'%5B%22saved%22%5D');
  assert.equal(s.memory.get('petState:'+previous),'{"preserved":true}');const backup=JSON.parse(s.memory.get('lyricIdentityBackupsV1'))[0];assert.equal(backup.values.phraseDeviceId,previous);assert.equal(backup.values.savedPhraseIds,'["old"]');
  assert.equal(s.historyCalls[0][2],'/restore.html');assert.equal(s.requests.length,2);assert(s.requests.every(r=>r.init.referrerPolicy==='no-referrer'));
});
test('invalid identifiers cannot start recovery',async()=>{const s=await run({target:'invalid'});assert.equal(s.requests.length,0);assert.equal(s.memory.get('phraseDeviceId'),previous);assert.deepEqual(s.navigations,[]);});
for(const option of ['offline','empty','noPrefs','blockCookies','quota'])test(option+' preserves the previous identity and preferences',async()=>{
  const s=await run({[option]:true});assert.equal(s.memory.get('phraseDeviceId'),previous);assert.equal(s.memory.get('savedPhraseIds'),'["old"]');assert.equal(s.cookies.get('phraseDeviceId'),previous);assert.equal(s.cookies.get('savedPhraseIds'),'%5B%22old%22%5D');assert.equal(s.memory.has('petState:'+target),false);assert.deepEqual(s.navigations,[]);assert.equal(s.elements.retry.hidden,false);
});
