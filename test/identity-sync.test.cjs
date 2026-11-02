const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../public/identity-sync.js'),'utf8');
const old='previous-device-1234',next='recovered-device-1234';
function setup(fail=false){let handler;const calls=[],root={inert:false},storage={getItem:()=>next},session={},notice={setAttribute(){},style:{}};
 vm.runInNewContext(source,{window:{addEventListener:(type,fn)=>handler=fn,PetGame:{prepareRefresh:async()=>{calls.push('persist');if(fail)throw Error('full');}}},localStorage:storage,document:{getElementById:()=>root,createElement:()=>notice,body:{appendChild:()=>calls.push('notice')}},location:{reload:()=>calls.push('reload')}});
 return {calls,root,notice,event:(overrides={})=>handler({key:'phraseDeviceId',oldValue:old,newValue:next,storageArea:storage,...overrides}),session};}
test('other tabs persist pending playback then reload the recovered identity once',async()=>{const s=setup();await s.event();await s.event();assert.deepEqual(s.calls,['notice','persist','reload']);assert.equal(s.root.inert,true);});
test('ordinary storage writes, removals, invalid IDs and session storage do not reload',async()=>{for(const args of [{key:'savedPhraseIds'},{newValue:null},{newValue:'invalid'},{newValue:old},{storageArea:{}}]){const s=setup();await s.event(args);assert.deepEqual(s.calls,[]);}});
test('failed playback persistence keeps the tab and explains why switching stopped',async()=>{const s=setup(true);await s.event();assert.deepEqual(s.calls,['notice','persist']);assert.equal(s.root.inert,false);assert.match(s.notice.textContent,/保存できませんでした/);});
