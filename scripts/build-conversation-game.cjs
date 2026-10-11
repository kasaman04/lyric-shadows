'use strict';
// Builds from the deployed phrase packs. Audio boundaries are recorded in the
// checked-in audit; ambiguous recordings use isolated, local English speech.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const context = {window:{}}; vm.createContext(context);
for (const f of ['phrases','real-phrases','extra-phrases','more-phrases','first-meeting-phrases','get-to-know-phrases','everyday-pattern-phrases']) vm.runInContext(fs.readFileSync(path.join(root,'public',f+'.js'),'utf8'),context);
const audit = JSON.parse(fs.readFileSync(path.join(root,'data/conversation-game-audio.json'),'utf8'));
const existing = new Map(JSON.parse(fs.readFileSync(path.join(root,'data/conversation-game-questions.json'),'utf8')).filter(q=>q.authored !== false).map(q=>[q.id,q]));
const distractors = [
  ["Preheat the oven to two hundred degrees.", 'オーブンを200度に予熱して。', 'oven|cook|bake|food|recipe|dinner|kitchen', '料理の手順を伝える返答。'],
  ["The Wi-Fi password is on the router.", 'Wi-Fiのパスワードはルーターに書いてあるよ。', 'wifi|wi-fi|password|internet|router|connect|online|computer', 'Wi-Fiのパスワードを聞かれたときの返答。'],
  ["The parcel weighs exactly two kilograms.", '荷物の重さはちょうど2キロです。', 'parcel|package|weight|weigh|ship|delivery|bag', '荷物の重さを伝える返答。'],
  ["Please insert a coin into the washing machine.", '洗濯機にコインを入れてください。', 'wash|laundry|coin|machine|clothes|clean', 'コインランドリーでの操作案内。'],
  ["The printer needs a new ink cartridge.", 'プリンターには新しいインクカートリッジが必要です。', 'print|ink|cartridge|office|work|paper', 'プリンターの状態を説明する返答。'],
  ["Turn the screw clockwise with a screwdriver.", 'ドライバーでネジを時計回りに回して。', 'screw|repair|fix|tool|build|turn|clock', '組み立ての手順を説明する返答。'],
  ["My shoe size is twenty-six centimeters.", '靴のサイズは26センチです。', 'shoe|size|foot|feet|wear|clothes|shop|buy|bought', '靴のサイズを聞かれたときの返答。'],
  ["The battery compartment is under the remote.", '電池入れはリモコンの裏側です。', 'battery|remote|television|tv|control|phone', 'リモコンの電池の場所を説明する返答。'],
  ["Mix the blue paint with the yellow paint.", '青い絵の具と黄色い絵の具を混ぜて。', 'paint|color|colour|blue|yellow|art|mix', '絵の具の混ぜ方を説明する返答。'],
  ["This suitcase has four wheels.", 'このスーツケースには車輪が4つあります。', 'suitcase|wheel|travel|trip|flight|airport|bag', 'スーツケースの仕様を説明する返答。'],
  ["The aquarium filter needs replacing.", '水槽のフィルターを交換する必要があります。', 'aquarium|fish|filter|water|pet|animal', '水槽の手入れについての返答。'],
  ["The elevator's weight limit is eight hundred kilos.", 'エレベーターの重量制限は800キロです。', 'elevator|lift|weight|limit|building|floor', 'エレベーターの重量制限を説明する返答。']
];
const catalog = context.window.CONVERSATION_PHRASES.map((p,index)=> {
  if (existing.has(p.id)) return existing.get(p.id);
  const conversation = p.lines.map(l=>l[1]).join(' ');
  const candidates = distractors.filter(d=>!new RegExp(d[2],'i').test(conversation));
  const wrong = [candidates[index%candidates.length], candidates[(index+1)%candidates.length]];
  if (new Set(wrong).size !== 2) throw new Error('Not enough distractors: '+p.id);
  return {id:p.id,authored:false,category:p.category,place:p.pack || p.category,title:'「'+p.category+'」のひとコマ',alt:'「'+p.category+'」の会話場面',question:p.lines[0][1],questionJa:p.lines[0][2],options:[{en:p.lines[1][1],ja:p.lines[1][2]},...wrong.map(d=>({en:d[0],ja:d[1],feedback:d[3]+' この場面の話題に合わせて返そう。'}))],correct:0,continuation:p.lines[2][1],continuationJa:p.lines[2][2],note:'「'+p.lines[1][2]+'」と返して、会話がつながった。',image:'/phrase-images/phrases/'+p.id+'.webp',clips:['prompt','reply','response'].map(part=>'/conversation-game-audio/'+p.id+'/'+part+'.mp3')};
});
fs.writeFileSync(path.join(root,'data/conversation-game-questions.json'),JSON.stringify(catalog,null,2)+'\n');
if (process.argv.includes('--catalog-only')) process.exit(0);
function run(command,args){ return new Promise((resolve,reject)=>{let stderr='';const child=spawn(command,args,{windowsHide:true});child.stderr.on('data',d=>stderr+=d);child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(stderr)));}); }
async function build(q){
  const record=audit[q.id]; if(!record) throw new Error('Missing audio audit: '+q.id);
  const output=path.join(root,'public/conversation-game-audio',q.id);fs.mkdirSync(output,{recursive:true});
  if(record.mode==='existing') return;
  if(record.mode==='isolated'){
    // WAVs are produced by synthesize-game-clips.ps1 before this build.
    for(const part of ['prompt','reply','response']) await run('ffmpeg',['-y','-v','error','-nostdin','-i',path.join(root,'tmp/game-isolated-audio',q.id,part+'.wav'),'-codec:a','libmp3lame','-b:a','96k',path.join(output,part+'.mp3')]);
  }else{
    const [a,b]=record.boundaries, args=['-y','-v','error','-nostdin','-i',path.join(root,'public',record.source)];
    for(const [part,start,end] of [['prompt',0,a],['reply',a,b],['response',b,record.duration]]) args.push('-ss',String(start),'-t',String(end-start),'-codec:a','libmp3lame','-b:a','96k',path.join(output,part+'.mp3'));
    await run('ffmpeg',args);
  }
}
const requested = process.argv.find(a=>a.startsWith('--ids='))?.slice(6).split(',');
const selected = requested ? catalog.filter(q=>requested.includes(q.id)) : catalog;
let next=0,done=0;
async function worker(){while(next<selected.length){await build(selected[next++]);if(++done%100===0)console.log('Prepared '+done+' / '+selected.length);}}
Promise.all(Array.from({length:4},worker)).then(()=>console.log('Prepared '+selected.length+' question audio sets.')).catch(e=>{console.error(e);process.exitCode=1;});
