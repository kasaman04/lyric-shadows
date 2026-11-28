// Real conversation shorts use the same player, listening ledger and saved list.
(() => {
  'use strict';
  const groups=[
    {key:'random',title:'ランダムチャット',sub:'RANDOM CHAT',description:'初対面から会話が広がる。趣味や暮らし、学び方の話。',matches:s=>s.category==='random'},
    {key:'street',title:'街頭インタビュー',sub:'STREET INTERVIEWS',description:'今日の予定、仕事、日本の印象。街の人の自然な受け答え。',matches:s=>s.category==='street'},
    {key:'daily',title:'日常の掛け合い',sub:'EVERYDAY CONVERSATIONS',description:'家族の雑談や、ちょっとしたすれ違い。日常で使う英語。',matches:s=>s.category==='daily'}
  ];
  window.RealShorts={
    library(){return window.MovieStudy.library({scenes:window.REAL_SHORT_SCENES||[],collections:groups,portrait:true});},
    open(options){
      window.MovieStudy.open({...options,kind:'shorts',scenes:window.REAL_SHORT_SCENES||[],
        filters:[...groups.map(g=>({key:g.key,label:g.title,matches:g.matches})),{key:'all',label:'すべてのジャンル',matches:()=>true}],
        captionModes:['both','en','ja','off'],storageKey:'real-shorts-work',playerHash:'shorts-player',homeHash:'shorts',backLabel:'リアル英会話の一覧に戻る'});
    }
  };
})();
