'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const phrases=JSON.parse(fs.readFileSync(path.join(root,'data/relative-conversation-phrases.json'),'utf8'));
assert.equal(phrases.length,170);assert.equal(new Set(phrases.map(p=>p.id)).size,170);
for(const p of phrases){assert.equal(p.lines.length,3);assert.deepEqual(p.lines.map(l=>l[0]),['A','B','A']);assert(fs.existsSync(path.join(root,'public',p.audio)),p.id);}
fs.writeFileSync(path.join(root,'public/relative-phrases.js'),'// 17 expressions, 10 three-turn conversations each. Generated from data/relative-conversation-phrases.json.\nwindow.CONVERSATION_PHRASES = '+JSON.stringify(phrases,null,2)+';\n');
console.log('Built '+phrases.length+' conversation phrases with audio.');
