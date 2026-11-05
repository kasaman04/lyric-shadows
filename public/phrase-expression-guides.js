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
    },
    'by the time': {
      title: '「〜するころには・〜したときには」を表す',
      role: 'ある時点を基準に、そのときには何かがすでに起きていたり、ある状態になっていたりすることを伝えます。',
      pattern: 'by the time + 主語 + 動詞 …, 主語 + 動詞 …',
      examples: [{ en: "By the time I got there, they'd sold out.", ja: '着いたころには、売り切れていました。' }, { en: "It'll be ready by the time you get home.", ja: '家に着くころには、できています。' }],
      note: '過去の時点より前に完了したことには had + 過去分詞がよく使われます。未来のことでも by the time の後ろは通常、現在形にします。'
    },
    whether: {
      title: '「〜かどうか・どちらにするか」を表す',
      role: 'まだわからないことや、二つの選択肢のどちらかを、文の中のひとまとまりにします。',
      pattern: 'whether + 主語 + 動詞 … ／ whether to + 動詞 … ／ whether … or …',
      examples: [{ en: "It depends on whether it rains.", ja: '雨が降るかどうかによります。' }, { en: "I can't decide whether to take a jacket.", ja: '上着を持っていくか決められません。' }],
      note: '単純な「〜かどうか」では if も使えますが、on whether のような前置詞の直後や whether to の形では whether を使います。whether … or not で「〜してもしなくても」と表すこともできます。'
    },
    'now that': {
      title: '「今はもう〜だから・〜したことだし」を表す',
      role: '状況が変わったことや、今そろっている条件を理由にして、次にすることや今の気持ちを伝えます。',
      pattern: 'now that + 主語 + 動詞 …, 主語 + 動詞 …',
      examples: [{ en: "Now that everyone's here, shall we order?", ja: 'みんなそろったし、注文しましょうか？' }],
      note: 'because と同じく理由を表しますが、「今はそうなったので」という状況の変化や成立に焦点があります。'
    },
    once: {
      title: '「いったん〜すれば・〜したら」を表す',
      role: '何かが起きたり終わったりしたことを区切りとして、その後にすることや成り立つことを伝えます。',
      pattern: 'once + 主語 + 動詞 …, 主語 + 動詞 …',
      examples: [{ en: "Once you get used to it, it's actually pretty easy.", ja: '慣れると、実は結構簡単です。' }],
      note: 'ここでは「一度」という回数ではなく、文をつなぐ once を練習します。未来の予定でも once の後ろは通常、現在形や現在完了形にします。'
    },
    'so that': {
      title: '「〜できるように・〜しないように」を表す',
      role: '何のために行動するのか、その行動で実現したいことや避けたいことを説明します。',
      pattern: '行動 + so that + 主語 + can / will / 動詞 …',
      examples: [{ en: "Let's book now so that we can sit together.", ja: '一緒に座れるように、今予約しましょう。' }],
      note: '目的を表す so that です。can・could・will・would などがよく続きます。会話では that を省くこともあります。'
    },
    'in case': {
      title: '「〜するといけないから・〜に備えて」を表す',
      role: '起きるかもしれないことを考えて、先に準備したり予防したりする理由を伝えます。',
      pattern: '準備・予防の行動 + in case + 主語 + 動詞 …',
      examples: [{ en: 'Take an umbrella in case it rains.', ja: '雨が降るといけないから、傘を持っていってください。' }],
      note: '雨が降る前から傘を持つ、という備えです。「雨が降ったら持つ」という条件の if とは意味が違います。'
    },
    'as soon as': {
      title: '「〜したらすぐ・〜した途端に」を表す',
      role: 'あることが起きてから、ほとんど間を置かずに次のことが起きると伝えます。',
      pattern: 'as soon as + 主語 + 動詞 …, 主語 + 動詞 …',
      examples: [{ en: 'Text me as soon as you get home.', ja: '家に着いたらすぐにメッセージしてください。' }],
      note: '未来のことでも as soon as の後ろは通常、現在形です。過去の出来事では「〜した途端に」という意味でも使えます。'
    },
    'even though': {
      title: '「実際に〜なのに・〜だけれど」を表す',
      role: '実際の事実から予想されることと、結果が違うときに使います。',
      pattern: '結果 + even though + 事実 ／ even though + 事実, 結果',
      examples: [{ en: 'We played even though it was raining.', ja: '雨が降っていましたが、試合をしました。' }],
      note: '実際に雨が降っていた、という事実を表します。「たとえ雨が降っても」という仮定の even if と区別します。'
    },
    unless: {
      title: '「〜でない限り・〜の場合を除いて」を表す',
      role: '基本の予定や判断を伝えたうえで、それが変わる例外の条件を付け足します。',
      pattern: '基本の予定・判断 + unless + 例外となる条件',
      examples: [{ en: "I'll cycle to work unless it rains.", ja: '雨でない限り、自転車で仕事に行きます。' }],
      note: 'unless it rains は if it does not rain に近い意味です。未来の条件でも unless の後ろは通常、現在形にします。'
    },
    while: {
      title: '「〜している間に・一方で」を表す',
      role: '二つのことが同時に起きることを伝えます。また、二人の好みの違いや、評価の両面を示すこともできます。',
      pattern: '主語 + 動詞 … + while + 主語 + 動詞 …',
      examples: [{ en: "I'll cook while you take a shower.", ja: 'シャワーを浴びている間に料理します。' }, { en: "While I like the idea, I'm worried about the cost.", ja: 'アイデアはいいと思いますが、費用が心配です。' }],
      note: '時間の「間に・しながら」だけでなく、対比や「〜だけれど」という意味でも使います。前後の文から意味を判断します。'
    },
    as: {
      title: '「〜するとき・〜のように・〜として」を表す',
      role: '同時に起きること、やり方、役割、理由などを表します。何をつなげているのかで意味が変わります。',
      pattern: 'as + 主語 + 動詞 … ／ 動詞 + as + 役割を表す名詞',
      examples: [{ en: 'My phone rang just as I was leaving.', ja: 'ちょうど出かけるところで電話が鳴りました。' }, { en: 'Just do it as I showed you.', ja: '見せたとおりにやってください。' }, { en: 'I work as a designer.', ja: 'デザイナーとして働いています。' }, { en: "As we're both here, let's sort it out now.", ja: '二人ともここにいるので、今決めてしまいましょう。' }],
      note: 'as + 文は「〜するとき」「〜のように」「〜なので」など。as a designer の as は前置詞で、役割を表します。意味と場面をセットで覚えましょう。'
    }
  };
});
