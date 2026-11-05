'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const phrases=JSON.parse(fs.readFileSync(path.join(root,'data/relative-conversation-phrases.json'),'utf8'));
const guides=require('../public/phrase-expression-guides.js');
const keys=[...new Set(phrases.map(p=>p.category))];
assert.equal(new Set(phrases.map(p=>p.id)).size,phrases.length);
for(const key of keys){assert(guides[key],key+' guide missing');assert(phrases.filter(p=>p.category===key).length>0,key);}
for(const p of phrases){assert.equal(p.lines.length,3);assert.deepEqual(p.lines.map(l=>l[0]),['A','B','A']);assert(fs.existsSync(path.join(root,'public',p.audio)),p.id);}
fs.writeFileSync(path.join(root,'public/relative-phrases.js'),'// '+keys.length+' expressions, '+phrases.length+' three-turn conversations. Generated from data/relative-conversation-phrases.json.\nwindow.CONVERSATION_PHRASES = '+JSON.stringify(phrases,null,2)+';\n');
console.log('Built '+phrases.length+' conversation phrases with audio.');
