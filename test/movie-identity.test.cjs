'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../public/app.js'),'utf8');
const functions=source.slice(source.indexOf('function linkedDeviceId()'),source.indexOf('function loadHiddenPhrases()'));
const oldId='12345678-1234-4234-8234-123456789abc',newId='abcdefab-1234-4234-8234-123456789abc';
function page(href,values=new Map()){
 const context={URL,URLSearchParams,location:new URL(href),DEVICE_ID_KEY:'phraseDeviceId',state:{savedPhraseIds:new Set(),hiddenPhraseIds:new Set()},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},readStoredValue:k=>values.get(k)||'',writeStoredValue:(k,v)=>values.set(k,v),writeStoredIds:(k,v)=>values.set(k,JSON.stringify(v)),createDeviceId:()=>newId};
 context.window=context;
 context.history={replaceState:(state,title,url)=>context.location=new URL(url,context.location)};
 vm.createContext(context);vm.runInContext(functions,context);return context;
}
test('movie navigation keeps the recovered identity after local storage and cookies are cleared',()=>{
 const values=new Map(),p=page('https://example.test/#saved-device='+oldId,values);
 assert.equal(p.loadDeviceId(),oldId);
 p.location.hash='movie-player';p.location.searchParams.set('scene','train-invitation');
 values.clear();assert.equal(p.loadDeviceId(),oldId);
 assert.equal(p.location.searchParams.get('saved-device'),oldId);assert.equal(p.location.hash,'#movie-player');
});
test('an explicit recovery link replaces an old URL identity and keeps a backup',()=>{
 const values=new Map([['phraseDeviceId',oldId]]),p=page('https://example.test/?saved-device='+oldId+'#saved-device='+newId,values);
 assert.equal(p.loadDeviceId(),newId);assert.equal(p.location.searchParams.get('saved-device'),newId);
 assert.equal(JSON.parse(values.get('lyricIdentityBackupsV1'))[0].values.phraseDeviceId,oldId);
});
test('switching identity in another tab updates the persistent URL before reload',async()=>{
 let handler,reloaded=false;const values=new Map([['phraseDeviceId',newId]]),localStorage={getItem:k=>values.get(k)};
 const context={URL,URLSearchParams,localStorage,location:new URL('https://example.test/?saved-device='+oldId+'#movie-player'),window:{addEventListener:(type,fn)=>handler=fn,PetGame:{prepareRefresh:async()=>{}}},document:{getElementById:()=>null,createElement:()=>({setAttribute(){},style:{}}),body:{appendChild(){}}}};
 context.history={replaceState:(state,title,url)=>{context.location.href=url;}};context.location.reload=()=>{reloaded=true};
 vm.runInNewContext(fs.readFileSync(require.resolve('../public/identity-sync.js'),'utf8'),context);
 await handler({key:'phraseDeviceId',oldValue:oldId,newValue:newId,storageArea:localStorage});
 assert.equal(reloaded,true);assert.equal(context.location.searchParams.get('saved-device'),newId);assert.equal(context.location.hash,'#movie-player');
});
