(function (root) {
  'use strict';
  const cards = [
    ['go-get', 'go + 動詞', 'I’ll go get it.', '取ってくるよ。', '棚の上の物を、取りに行こうとしている。', '棚の上のスマホを指さして、取りに向かう人'],
    ['go-see', 'go + 動詞', 'I’ll go see her.', '彼女に会いに行くよ。', '会いたい相手の家を訪ねるところ。', '花を持って女性の家を訪ねる人'],
    ['go-eat', 'go + 動詞', 'Let’s go eat something.', '何か食べに行こう。', 'おなかがすいた友達を、食事に誘う。', 'レストランに向かって歩き出す友達'],
    ['go-ask', 'go + 動詞', 'I’ll go ask her.', '彼女に聞いてくるよ。', '分からないことを、あの女性に聞きに行く。', '案内係の女性に質問しに向かう人'],
    ['come-see', 'come + 動詞', 'Come see me sometime.', '今度会いに来てよ。', '別れ際に、また遊びに来てほしいと伝える。', '玄関先で友達をまた家に招く人'],
    ['come-get', 'come + 動詞', 'Come get your stuff.', '荷物を取りに来て。', '相手の忘れ物をまとめて、取りに来るように呼ぶ。', '友達のバッグとジャケットを持って呼びかける人'],
    ['come-help', 'come + 動詞', 'Come help me.', 'こっちに来て手伝って。', '一人では難しいので、少し離れた相手を呼ぶ。', '庭の重い手押し車を押しながら助けを呼ぶ人'],
    ['help-carry', 'help + 人 + 動詞', 'Help me carry this.', 'これを運ぶのを手伝って。', '引っ越し中。箱の反対側を持ってほしい。', '大きな段ボール箱を一緒に持ち上げる二人'],
    ['help-find', 'help + 人 + 動詞', 'Can you help me find my keys?', '鍵を探すのを手伝ってくれる？', '出かける前に、鍵が見つからない。', 'ソファの下やクッションの間で鍵を探す二人'],
    ['help-understand', 'help + 人 + 動詞', 'Help me understand.', '理解できるように説明して。', '説明がまだよく分からず、もう少し教えてほしい。', '難しい組み立て図を見て説明を求める人'],
    ['help-fix', 'help + 人 + 動詞', 'Help me fix this.', 'これを直すのを手伝って。', '壊れた物を直すために、手を貸してほしい。', '自転車の外れたチェーンを二人で直す場面'],
    ['let-know', 'let + 人 + 動詞', 'Let me know.', '教えてね。', '予定が決まったら、連絡がほしい。', '予定を相談してスマホで連絡を頼む二人'],
    ['let-think', 'let + 人 + 動詞', 'Let me think.', 'ちょっと考えさせて。', 'すぐには答えず、少し考える時間がほしい。', 'メニューを前にあごに手を当てて考える人'],
    ['let-try', 'let + 人 + 動詞', 'Let me try.', '私にもやらせて。', '相手がやっていることを、自分も試したい。', '友達のギターを弾いてみたいと手を伸ばす人'],
    ['make-laugh', 'make + 人 + 動詞', 'You make me laugh.', '君といると笑っちゃう。', '相手のおかしな言動で、思わず笑ってしまう。', '変な帽子をかぶった友達を見て大笑いする人'],
    ['make-smile', 'make + 人 + 動詞', 'You make me smile.', '君がいると笑顔になるよ。', '相手のおかげで、自然と笑顔になる。', '花を差し出す子どもに優しくほほえむ大人'],
    ['see-leave', 'see + 人 + 動詞', 'I saw her leave.', '彼女が出ていくのを見た。', '女性がその場を去るところを、目にした。', '女性がスーツケースを引いて出ていくのを見る人'],
    ['hear-laugh', 'hear + 人 + 動詞', 'I heard him laugh.', '彼が笑うのが聞こえた。', '隣の部屋から、男性の笑い声が聞こえた。', '開いたドア越しに男性の笑い声に気づく人'],
    ['watch-dance', 'watch + 人 + 動詞', 'I watched her dance.', '彼女が踊るのを見た。', '女性が踊る様子を、じっと見ていた。', '小さな舞台で踊る女性を客席から見守る人'],
    ['better-go', 'had better + 動詞', 'You’d better go.', 'もう行ったほうがいいよ。', '出発の時間が迫り、相手に急ぐよう勧める。', '駅の時計を指して友達に出発を促す人']
  ].map(([id, pattern, english, japanese, hint, alt]) => Object.freeze({
    id, pattern, english, japanese, hint, alt, image: '/flashcard-images/' + id + '.webp'
  }));
  const deck = Object.freeze({ id: 'verb-pairs-v1', title: '動詞が続く表現', cards: Object.freeze(cards) });
  if (typeof module === 'object' && module.exports) module.exports = deck;
  else root.ILLUSTRATED_FLASHCARD_DECK = deck;
})(typeof window === 'object' ? window : globalThis);
