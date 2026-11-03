(function (root) {
  'use strict';
  const original = typeof module === 'object' && module.exports
    ? require('./flashcards-data.js') : root.ILLUSTRATED_FLASHCARD_DECK;
  const reused = ["go-see","go-get","go-ask","go-eat","come-see","come-get","come-help"];
  const entries = [
    ["go-grab","I’ll go grab some food.","ちょっと食べ物を買ってくるよ。"],
    ["go-check","I’ll go check the mailbox.","郵便受けを見てくるね。"],
    ["go-find","Let’s go find your mom.","お母さんを探しに行こう。"],
    ["go-look","Go look in the garage.","ガレージを見てきて。"],
    ["go-buy","I’ll go buy some milk.","牛乳を買ってくるよ。"],
    ["go-drink","Let’s go drink some water.","水を飲みに行こう。"],
    ["go-watch","Let’s go watch the game.","試合を見に行こう。"],
    ["go-talk","I’ll go talk to him.","彼と話してくるよ。"],
    ["go-meet","I’ll go meet Sam at the station.","駅までサムに会いに行くよ。"],
    ["go-help","Go help your sister.","お姉ちゃんを手伝ってきて。"],
    ["go-pick-up","I’ll go pick up the kids.","子どもたちを迎えに行ってくるよ。"],
    ["go-take","I’ll go take a shower.","シャワーを浴びてくるね。"],
    ["go-try","Let’s go try that new pizza place.","あの新しいピザ屋に行ってみよう。"],
    ["go-tell","I’ll go tell Dad the good news.","お父さんにいい知らせを伝えてくる。"],
    ["go-call","I’ll go call my mom.","母に電話してくるね。"],
    ["go-play","Go play outside.","外で遊んでおいで。"],
    ["go-explore","Let’s go explore the old town.","旧市街を歩いてみよう。"],
    ["go-visit","Let’s go visit Grandma.","おばあちゃんのところに行こう。"],
    ["go-relax","Go relax on the porch.","ポーチでくつろいでおいで。"],
    ["go-rest","Go rest for a bit.","少し休んできなよ。"],
    ["go-sit","Let’s go sit by the window.","窓際に座りに行こう。"],
    ["go-lie-down","I’ll go lie down for a bit.","ちょっと横になってくるね。"],
    ["go-wash","Go wash your hands.","手を洗ってきて。"],
    ["go-clean","I’ll go clean the kitchen.","キッチンを掃除してくるね。"],
    ["go-fix","I’ll go fix the bike.","自転車を直してくるよ。"],
    ["go-change","I’ll go change my clothes.","着替えてくるね。"],
    ["come-grab","Come grab a cookie.","クッキー取りにおいで。"],
    ["come-check","Come check the oven.","オーブンを確認しに来て。"],
    ["come-look","Come look at this rainbow.","こっちに来て、この虹を見て。"],
    ["come-watch","Come watch the movie with us.","こっちに来て、一緒に映画を見よう。"],
    ["come-eat","Come eat dinner.","夕ごはん食べにおいで。"],
    ["come-drink","Come drink some water.","水を飲みにおいで。"],
    ["come-join","Come join us.","こっちに来て一緒にやろう。"],
    ["come-visit","Come visit us next weekend.","来週末、うちに遊びに来てね。"],
    ["come-meet","Come meet my new roommate.","こっちに来て、新しいルームメイトを紹介するよ。"],
    ["come-talk","Come talk to me for a minute.","ちょっとこっちに来て、話そう。"],
    ["come-sit","Come sit next to me.","こっちに来て、隣に座って。"],
    ["come-stay","Come stay with us this weekend.","今週末、うちに泊まりにおいで。"],
    ["come-play","Come play with us.","こっちに来て、一緒に遊ぼう。"],
    ["come-try","Come try this soup.","こっちに来て、このスープを味見して。"],
    ["come-take","Come take one.","こっちに来て、一つ取って。"],
    ["come-pick-up","Can you come pick me up?","迎えに来てくれる？"],
    ["come-find","Come find me when you’re done.","終わったら私を探しに来てね。"],
    ["come-celebrate","Come celebrate with us.","こっちに来て、一緒にお祝いしよう。"],
    ["come-hang-out","Come hang out with us.","こっちに来て、一緒にのんびりしようよ。"],
    ["come-relax","Come relax with us in the backyard.","裏庭に来て、一緒にくつろごう。"],
    ["come-listen","Come listen to this song.","こっちに来て、この曲を聴いて。"],
    ["come-learn","Come learn how to make pasta.","パスタの作り方を習いにおいで。"],
    ["help-clean","I’ll help clean the room.","部屋の掃除を手伝うよ。"],
    ["help-cook","I can help cook dinner.","夕ごはん作りを手伝えるよ。"],
    ["help-carry","I’ll help carry the box.","箱を運ぶのを手伝うよ。","help-carry"],
    ["help-build","I can help build the bookshelf.","本棚を組み立てるのを手伝えるよ。"],
    ["help-fix","I’ll help fix the bike.","自転車を直すのを手伝うよ。","help-fix"],
    ["help-find","Can you help find my keys?","私の鍵を探すのを手伝ってくれる？","help-find"],
    ["help-prepare","I’ll help prepare the snacks.","おやつの準備を手伝うよ。"],
    ["help-organize","I’ll help organize the closet.","クローゼットの整理を手伝うよ。"],
    ["help-move","I can help move the couch.","ソファを動かすのを手伝えるよ。"],
    ["help-pay","I can help pay the bill.","支払いなら少し出せるよ。"],
    ["help-raise","I help raise my little brother.","弟の面倒を見て、育てるのを手伝っているよ。"],
    ["help-solve","Can you help solve this puzzle?","このパズルを解くのを手伝ってくれる？"],
    ["help-improve","This app can help improve your English.","このアプリは英語の上達に役立つよ。"],
    ["help-reduce","Turning off the lights can help reduce your electric bill.","照明を消すと、電気代を抑えるのに役立つよ。"],
    ["dare-say","I dare say you’re right.","たぶん君の言うとおりだね。"],
    ["dare-ask","I don’t dare ask her.","彼女には怖くて聞けないよ。"],
    ["let-go","Let go of my sleeve.","袖から手を離して。"],
    ["make-do","We’ll make do with what we have.","手元にあるもので間に合わせよう。"]
  ];

  let tile = 0;
  const cards = entries.map(([phrase, english, japanese, reusedImage]) => {
    const verb = phrase.split('-')[0];
    const pattern = ['go', 'come', 'help'].includes(verb) ? verb + ' + 動詞' : phrase.replaceAll('-', ' ');
    const art = reusedImage
      ? { image: '/flashcard-images/' + reusedImage + '.webp' }
      : {
          image: '/flashcard-images/direct-atlas-' + (1 + Math.floor(tile / 9)) + '.webp',
          tile: tile++ % 9
        };
    return Object.freeze({ id: 'direct-' + phrase, english, japanese, pattern, alt: japanese, ...art });
  });

  const deck = Object.freeze({
    id: 'direct-verb-pairs-v1',
    title: '原形が続く表現',
    cards: Object.freeze([...reused.map(id => original.cards.find(card => card.id === id)), ...cards])
  });
  if (typeof module === 'object' && module.exports) module.exports = deck;
  else root.DIRECT_FLASHCARD_DECK = deck;
})(typeof window === 'object' ? window : globalThis);
