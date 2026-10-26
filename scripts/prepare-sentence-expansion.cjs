'use strict';
// Compile authored, fixed tasks. No text generation occurs during practice.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const baseFile=path.join(root,'data/sentence-game-base.json');
if(!fs.existsSync(baseFile))fs.copyFileSync(path.join(root,'tmp/sentence-expansion/original-34.json'),baseFile);
const base=JSON.parse(fs.readFileSync(baseFile,'utf8'));
assert.equal(base.length,34,'Keep existing IDs and review-note contents stable.');
const rules={
 who:'人を表す名詞を who 以下で説明します。主語の he・she・they は重ねません。制限用法では that も使えます。',
 whom:'説明する人が後ろの節の目的語です。whom のほか、前置詞を末尾に置けば who・that・関係詞の省略も使えます。前置詞の直後は whom を使います。',
 whose:'人や物の所有・部分を whose＋名詞で表します。his・her・its・their を whose に置き換えます。',
 which:'物や動物を which 以下で説明します。制限用法では that も可能です。目的格は省略できますが、前置詞の直後では which を使います。',
 that:'先行詞を that 以下で特定します。人なら who、物なら which も使えます。目的語に当たる関係詞は省略できます。',
 what:'what 以下で「〜するもの・こと」をまとめます。what 自体が先行詞を含むので、the thing what のようには重ねません。',
 when:'時を表す名詞を when 以下で説明します。後ろの節に on that day・at that time など同じ時を示す語句を重ねません。',
 where:'場所を表す名詞を where 以下で説明します。後ろの節に there を重ねません。場所に合う前置詞＋which に言い換えられます。',
 why:'the reason を why 以下で説明します。for that reason は取り除きます。the reason の後の why は省略も可能です。',
 how:'how 以下で「どのように〜するか・したか」を一つのまとまりにします。the way how とはせず how か the way を使います。',
 whoever:'whoever 以下で条件に合う「人なら誰でも」を表します。anyone who に言い換えられます。人の範囲と条件を両方残します。',
 whomever:'whomever 以下全体が動詞や前置詞の目的語になり、その節の中でも whomever が目的語です。会話では whoever、または anyone＋関係節も自然です。',
 whatever:'whatever 以下で「〜するものなら何でも」を表します。anything that と言い換えられます。候補を特定の集合に狭めません。',
 whichever:'whichever 以下で、示された候補の中の「どれでも・どちらでも」を表します。of these など候補の範囲を残します。',
 whenever:'whenever 以下で「〜するときはいつでも・〜するたびに」を表します。at any time または every time の意味を保ちます。',
 wherever:'wherever 以下で「〜する場所ならどこでも」を表します。anywhere that などでも表せます。場所の無制限の意味を保ちます。',
 however:'方法の however は「どんな方法でも」、形容詞・副詞を伴う however は「どんなに〜でも」です。逆接の「しかし」と区別します。'
};
let type;const counts={};const added=[];
for(const [i,line] of fs.readFileSync(path.join(root,'data/sentence-game-additions.tsv'),'utf8').split(/\r?\n/).entries()){
 if(line.startsWith('## ')){type=line.slice(3).trim();assert(rules[type],`Unknown type at line ${i+1}`);continue;}
 if(!line.trim()||line.startsWith('#'))continue;
 assert(type,`Missing type at line ${i+1}`);
 const fields=line.split('|').map(s=>s.trim());assert.equal(fields.length,6,`Six fields at line ${i+1}`);
 const [first,second,answer,j1,j2,japanese]=fields;assert(fields.every(Boolean));
 assert([first,second,answer].every(s=>/^[A-Z]/.test(s)&&/[.?]$/.test(s)),`Punctuation at line ${i+1}`);
 assert([j1,j2,japanese].every(s=>/[ぁ-んァ-ン一-龯]/.test(s)),`Translations at line ${i+1}`);
 const index=counts[type]=(counts[type]||0)+1;
 added.push({id:`${type}-extra-${String(index).padStart(3,'0')}`,type,sentences:[first,second],sentenceJapanese:[j1,j2],answer,explanation:rules[type],japanese});
}
for(const [key,n]of Object.entries(counts))assert.equal(n,28,`${key}: 28 additions required`);
if(!process.argv.includes('--partial'))assert.equal(Object.keys(counts).length,17,'All 17 types required');
const all=[...base,...added];assert.equal(new Set(all.map(q=>q.id)).size,all.length);
assert.equal(new Set(all.map(q=>JSON.stringify(q.sentences))).size,all.length,'No duplicate questions');
assert.equal(new Set(all.map(q=>q.answer.toLowerCase())).size,all.length,'No duplicate answers');
fs.writeFileSync(path.join(root,'data/sentence-game-questions.json'),JSON.stringify(all,null,2)+'\n');
console.log(JSON.stringify({questions:all.length,added:added.length,perAddedType:counts,characters:all.reduce((n,q)=>n+q.sentences.join('').length+q.answer.length,0)}));
