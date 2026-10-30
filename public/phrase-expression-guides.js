(function (root, factory) {
  const guides = factory();
  if (typeof module === 'object' && module.exports) module.exports = guides;
  else root.PHRASE_EXPRESSION_GUIDES = guides;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  return {
    who: {
      title: '「どんな人か」を説明する',
      role: '人を表す名詞に、後ろから説明を付け足します。who は後ろの文の中で「その人が〜する」の「その人が」を受け持ちます。',
      pattern: '人 + who + 動詞 …',
      examples: [{ en: 'The woman who works at this cafe remembered my order.', ja: 'このカフェで働いている女性が、私の注文を覚えていました。' }],
      note: 'who works … で「働いている人」のように、人の行動や特徴を説明できます。'
    },
    whom: {
      title: '動作の相手になる「人」を説明する',
      role: '人について「誰に会ったか」「誰を招待したか」などの説明を付け足します。whom は後ろの文の中で、動作を受ける相手を表します。',
      pattern: '人 + whom + 主語 + 動詞 …',
      examples: [{ en: "She's a researcher whom I met at a conference.", ja: '彼女は、私が学会で会った研究者です。' }],
      note: '改まった表現です。会話では the person I met のように省略する言い方もよく使います。with whom のように、前置詞の後ろに置く形もあります。'
    },
    whose: {
      title: '「その人の・その物の〜」を説明する',
      role: '人や物と、その持ち物・家族・一部分をつなぎます。whose の直後に名詞を置いて、「その人の兄弟」「その家の屋根」のような関係を表します。',
      pattern: '人・物 + whose + 名詞 …',
      examples: [{ en: 'I know a girl whose brother is a chef.', ja: '兄弟がシェフをしている女の子を知っています。' }],
      note: 'her brother を whose brother にすると、「その女の子の兄弟」という関係を一文にまとめられます。'
    },
    which: {
      title: '物・動物や、直前の内容を説明する',
      role: '物や動物を表す名詞に、どんなものかの説明を付け足します。コンマの後ろの which で、直前の出来事や内容全体を受ける使い方もあります。',
      pattern: '物・動物 + which … ／ 文, which …',
      examples: [{ en: 'It just needed a new cable, which was a relief.', ja: '新しいケーブルが必要なだけで、それにはほっとしました。' }],
      note: 'この例の which は「ケーブルの交換だけで済んだこと」を受けています。'
    },
    that: {
      title: '人や物を「どれか」わかるように説明する',
      role: '人や物に説明を付け足して、「どの人・どの物か」を絞り込みます。「昨日買った本」のように、名詞を特定したいときに使います。',
      pattern: '人・物 + that + 説明 …',
      examples: [{ en: 'This is the book that I bought yesterday.', ja: 'これは、私が昨日買った本です。' }],
      note: '後ろの文で目的語になる that は、the book I bought のように省略できます。ここでは関係詞の that を練習します。'
    },
    what: {
      title: '「〜するもの・こと」をひとまとまりにする',
      role: '後ろの文と合わせて「作ったもの」「言ったこと」のような名詞のまとまりを作ります。what 自体に「もの・こと」の意味が含まれます。',
      pattern: 'what + 主語 + 動詞 … ＝ 〜するもの・こと',
      examples: [{ en: 'I like what you made.', ja: 'あなたが作ったものが好きです。' }],
      note: 'what you made 全体が、like の相手である「好きなもの」になります。what の前に the thing を重ねません。'
    },
    when: {
      title: '「いつのことか」を説明する',
      role: '日・時・瞬間を表す名詞に、そのとき何があったかを付け足します。「初めて会った日」のように、どの時を指すか伝える役割です。',
      pattern: '日・時・瞬間 + when + 出来事 …',
      examples: [{ en: 'I remember the day when we first met.', ja: '私たちが初めて会った日を覚えています。' }],
      note: 'この when は、質問の「いつ？」ではなく、the day の説明をつなぐ働きをしています。'
    },
    where: {
      title: '「どんな場所か・そこで何をするか」を説明する',
      role: '場所と、そこで起こることをつなぎます。「私たちが会ったカフェ」のように、場所の説明を付け足せます。',
      pattern: '場所 + where + そこでの出来事 …',
      examples: [{ en: 'This is the cafe where we met.', ja: 'ここが、私たちが会ったカフェです。' }],
      note: 'we met there の there（そこで）に当たる役割を where が受け持ちます。'
    },
    why: {
      title: '「何の理由か」を説明する',
      role: 'reason（理由）に、何が起きた理由なのかを付け足します。「彼が帰った理由」のように、理由の内容をつなぐ役割です。',
      pattern: 'the reason + why + 主語 + 動詞 …',
      examples: [{ en: 'I understand the reason why he left.', ja: '彼が帰った理由はわかります。' }],
      note: '会話では the reason he left のように、why を省く言い方もよく使います。'
    },
    how: {
      title: '「どうやってするか・その方法」を表す',
      role: '後ろの文と合わせて、やり方や方法をひとまとまりで表します。「どう作ったかを見せる」「これが作り方だ」のように使います。',
      pattern: 'how + 主語 + 動詞 … ＝ 〜する方法',
      examples: [{ en: 'This is how she made the cake.', ja: 'これが、彼女がそのケーキを作った方法です。' }],
      note: '方法を表すときは how か the way を使い、the way how とは重ねません。'
    },
    whoever: {
      title: '「〜する人なら誰でも」を表す',
      role: '特定の一人に決めず、条件に合う人なら誰でもよいと伝えます。whoever のまとまり全体で、「〜する人」という役割を果たします。',
      pattern: 'whoever + 動詞 … ＝ 〜する人は誰でも',
      examples: [{ en: 'Whoever wants to come is welcome.', ja: '来たい人は誰でも歓迎です。' }],
      note: 'whoever wants to come 全体が、歓迎される「人」を表しています。'
    },
    whomever: {
      title: '動作の相手を「誰でもよい」と表す',
      role: '招待する・頼むなどの相手を限定せず、「〜する相手なら誰でも」と伝えます。whomever に続く節の中で、その人が動作の相手になるときに使います。',
      pattern: 'whomever + 主語 + 動詞 … ＝ 〜する相手なら誰でも',
      examples: [{ en: 'Invite whomever you like.', ja: '好きな人なら誰でも招待してください。' }],
      note: 'この例では、you like の相手を whomever が表します。改まった表現で、会話では anyone you like などもよく使います。'
    },
    whatever: {
      title: 'もの・ことを「何でもよい」と表す',
      role: 'ものや内容を一つに限定せず、「〜するものなら何でも」と伝えます。「何が起きても」のように、条件に左右されないことを表す使い方もあります。',
      pattern: 'whatever + 説明 … ＝ 〜するものは何でも',
      examples: [{ en: "I'll eat whatever you make.", ja: '作ってくれるものなら何でも食べます。' }],
      note: 'whatever you make 全体が、食べる対象を表しています。'
    },
    whichever: {
      title: '決まった候補から「どれでも」を表す',
      role: 'すでにある候補の中から、「好きなほう・条件に合うものならどれでも」と伝えます。二つなら「どちらでも」、三つ以上なら「どれでも」という意味です。',
      pattern: 'whichever（+ 名詞）+ 説明 …',
      examples: [{ en: 'Choose whichever seat you like.', ja: '好きな席をどれでも選んでください。' }],
      note: 'この場にある席、示された二つの案など、選ぶ範囲が決まっているときに使います。'
    },
    whenever: {
      title: '時を限定せず「いつでも・そのたびに」を表す',
      role: 'あることが起きる時ならいつでもよい、と伝えます。「必要なときはいつでも」や、「〜するたびに」という時間の条件を付け足します。',
      pattern: 'whenever + 主語 + 動詞 …',
      examples: [{ en: 'Call me whenever you need help.', ja: '助けが必要なときは、いつでも電話してください。' }],
      note: 'いつ電話してよいかを、whenever you need help で説明しています。'
    },
    wherever: {
      title: '場所を限定せず「どこでも」を表す',
      role: '特定の場所に決めず、「〜する場所ならどこでも」と伝えます。「どこに行っても」のように、場所が変わっても同じことが成り立つ場合にも使います。',
      pattern: 'wherever + 主語 + 動詞 …',
      examples: [{ en: 'Sit wherever you like.', ja: '好きな場所に座ってください。' }],
      note: '座る場所を一つに限定せず、好きな場所ならどこでもよいと伝えています。'
    },
    however: {
      title: '「どんな方法でも・どんなに〜でも」を表す',
      role: '方法を自由に選べることを伝えます。また、形容詞や副詞を続けると、「どんなに難しくても」のように、程度に左右されないことを表せます。',
      pattern: 'however + 主語 + 動詞 … ／ however + 形容詞・副詞 + 主語 + 動詞 …',
      examples: [
        { en: 'Arrange the chairs however you like.', ja: '好きな方法で椅子を並べてください。' },
        { en: "However hard it is, I'll try.", ja: 'どんなに難しくても、やってみます。' }
      ],
      note: 'ここで練習する however は、文をつなぐ「しかし」という意味の however とは使い方が異なります。'
    }
  };
});
