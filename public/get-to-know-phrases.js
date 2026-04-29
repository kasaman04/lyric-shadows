window.CONVERSATION_PHRASES = window.CONVERSATION_PHRASES || [];

(() => {
  const pack = "相手を知る質問";
  const prefix = "get-know";
  const items = [
    ["価値観を知る","What do you care about most these days?","今の相手が大切にしているものを聞く。","What do you care about most these days?","最近、一番大切にしていることは何ですか？","Probably protecting my time.","たぶん自分の時間を守ることです。","That makes sense. Time feels more valuable lately.","分かります。最近、時間って前より大事に感じます。"],
    ["価値観を知る","What kind of people do you feel comfortable around?","相手が安心できる人柄を知る。","What kind of people do you feel comfortable around?","どんな人といると落ち着きますか？","People who don't rush me.","急かさない人です。","I like that. Calm people make everything easier.","いいですね。落ち着いた人って全部を楽にしてくれます。"],
    ["価値観を知る","What makes you feel at home?","相手が安心する環境を聞く。","What makes you feel at home?","何があると家みたいに感じますか？","Good food and people who laugh easily.","おいしい食べ物と、よく笑う人たちです。","That's a pretty good definition of home.","それ、かなりいい家の定義ですね。"],
    ["価値観を知る","What do you value in a friendship?","友達関係で大事にすることを聞く。","What do you value in a friendship?","友情で大事にしていることは何ですか？","Consistency, I think.","たぶん、安定していることです。","Yeah, showing up matters more than big words.","確かに。大きな言葉より、ちゃんといてくれることが大事ですね。"],
    ["価値観を知る","What kind of honesty do you appreciate?","相手の正直さの好みを知る。","What kind of honesty do you appreciate?","どんな正直さがありがたいですか？","Gentle honesty.","やさしい正直さです。","Same. Truth doesn't have to be harsh.","同じです。本当のことってきつく言う必要はないですよね。"],
    ["価値観を知る","What makes you trust someone?","信頼の基準を聞く。","What makes you trust someone?","どういう時に人を信頼しますか？","When their actions match their words.","言葉と行動が一致している時です。","That's probably the clearest answer.","それが一番分かりやすい答えかもしれません。"],
    ["価値観を知る","What do you try not to compromise on?","譲れないものを聞く。","What do you try not to compromise on?","譲らないようにしていることは何ですか？","My peace, mostly.","主に自分の心の平和です。","That's a strong answer. I respect that.","強い答えですね。尊重します。"],
    ["価値観を知る","What kind of life feels good to you?","理想の生活感を聞く。","What kind of life feels good to you?","どんな生活が心地いいですか？","Simple, but not boring.","シンプルだけど退屈じゃない生活です。","That's a nice balance to aim for.","それはいいバランスですね。"],
    ["価値観を知る","What makes you feel respected?","尊重されていると感じる瞬間を聞く。","What makes you feel respected?","どういう時に尊重されていると感じますか？","When people listen without planning their reply.","返事を考えながらじゃなく、ちゃんと聞いてくれる時です。","That's rare, but it means a lot.","それは珍しいけど、すごく大事ですね。"],
    ["価値観を知る","What do you want more of in your life?","今もっと欲しいものを聞く。","What do you want more of in your life?","人生でもっと増やしたいものは何ですか？","More calm, honestly.","正直、もっと落ち着きです。","I feel that. Calm is underrated.","分かります。落ち着きって過小評価されがちです。"],

    ["最近のことを聞く","What's been on your mind lately?","最近考えていることを聞く。","What's been on your mind lately?","最近、何が頭にありますか？","Whether I'm spending my time the right way.","自分の時間の使い方が合ってるかどうかです。","That's a big question, but a good one.","大きな問いですね。でもいい問いです。"],
    ["最近のことを聞く","What's something you're looking forward to?","楽しみにしていることを聞く。","What's something you're looking forward to?","楽しみにしていることはありますか？","A quiet weekend, honestly.","正直、静かな週末です。","That sounds perfect in its own way.","それはそれで最高ですね。"],
    ["最近のことを聞く","What's been making you happy recently?","最近の小さな幸せを聞く。","What's been making you happy recently?","最近、何が嬉しいですか？","Morning walks before work.","仕事前の朝の散歩です。","That sounds like a peaceful habit.","平和な習慣ですね。"],
    ["最近のことを聞く","What's been taking up your energy?","最近エネルギーを使っていることを聞く。","What's been taking up your energy?","最近、何にエネルギーを使っていますか？","Work, but also trying to be more social.","仕事と、もう少し社交的になろうとすることです。","That second one can be surprisingly tiring.","二つ目って意外と疲れますよね。"],
    ["最近のことを聞く","What's something new you've noticed about yourself?","最近の自己発見を聞く。","What's something new you've noticed about yourself?","最近、自分について気づいたことはありますか？","I need more quiet than I thought.","思っていたより静けさが必要だと気づきました。","That's useful to know about yourself.","それを知ってるのは大事ですね。"],
    ["最近のことを聞く","What's been challenging you lately?","最近の課題を聞く。","What's been challenging you lately?","最近、何が大変ですか？","Saying no without feeling guilty.","罪悪感なく断ることです。","That's a hard one for a lot of people.","それは多くの人にとって難しいですね。"],
    ["最近のことを聞く","What's something you've been learning lately?","最近学んでいることを聞く。","What's something you've been learning lately?","最近、何か学んでいることはありますか？","How to slow down a little.","少しペースを落とす方法です。","That might be one of the hardest skills.","それ、かなり難しいスキルかもしれません。"],
    ["最近のことを聞く","What has been surprisingly good lately?","意外によかったことを聞く。","What has been surprisingly good lately?","最近、意外によかったことは何ですか？","Spending time alone.","一人の時間です。","That's a nice surprise to have.","それはいい発見ですね。"],
    ["最近のことを聞く","What's been making you laugh lately?","最近笑ったことを聞く。","What's been making you laugh lately?","最近、何で笑っていますか？","My friend's terrible voice messages.","友達のひどいボイスメッセージです。","Those are usually the best kind.","そういうのがだいたい一番いいですよね。"],
    ["最近のことを聞く","What's something you're trying to get better at?","上達したいことを聞く。","What's something you're trying to get better at?","もっと上手くなりたいことは何ですか？","Being direct without sounding cold.","冷たく聞こえずに直接言うことです。","That's a skill I respect a lot.","それはかなり尊敬するスキルです。"],

    ["好きなものを深掘り","What do you like about it?","相手の好きなものを深掘りする。","What do you like about it?","それのどこが好きなんですか？","It makes me feel focused.","集中できる感じがするんです。","That makes sense. Some things quiet your mind.","分かります。頭を静かにしてくれるものってありますよね。"],
    ["好きなものを深掘り","What keeps you coming back to it?","続けている理由を聞く。","What keeps you coming back to it?","何があって続けているんですか？","It still surprises me.","まだ驚かせてくれるところです。","That's a good reason to keep doing anything.","何かを続ける理由として最高ですね。"],
    ["好きなものを深掘り","When did you realize you liked it?","好きだと気づいた時を聞く。","When did you realize you liked it?","それが好きだと気づいたのはいつですか？","Probably during my first trip alone.","たぶん初めて一人旅をした時です。","That sounds like a story.", "それは話がありそうですね。"],
    ["好きなものを深掘り","Do you like doing it alone or with people?","一人派か誰かと一緒派か聞く。","Do you like doing it alone or with people?","それは一人でやるのが好きですか？誰かと一緒が好きですか？","Usually alone, but the right person helps.","普段は一人です。でも合う人なら一緒もいいです。","That's a very specific but real answer.","すごく具体的だけどリアルな答えですね。"],
    ["好きなものを深掘り","What does it give you?","それが自分に与えてくれるものを聞く。","What does it give you?","それはあなたに何をくれますか？","A break from overthinking.","考えすぎからの休憩です。","That might be the best kind of hobby.","それは最高の趣味かもしれません。"],
    ["好きなものを深掘り","Who introduced you to it?","きっかけになった人を聞く。","Who introduced you to it?","誰がそれを紹介してくれたんですか？","My older sister.", "姉です。","Sounds like she has good taste.","センスのいいお姉さんですね。"],
    ["好きなものを深掘り","What would you show someone first?","初心者に何を見せるか聞く。","What would you show someone first?","初めての人には何を最初に見せますか？","Something easy to enjoy, not the deep stuff.","深いやつじゃなく、楽しみやすいものです。","Smart. Don't scare people away first.","賢いですね。最初に怖がらせない。"],
    ["好きなものを深掘り","What do people misunderstand about it?","誤解されがちな点を聞く。","What do people misunderstand about it?","それについて人が誤解しがちなことは何ですか？","They think it's boring.", "退屈だと思われます。","And you strongly disagree?", "そこは強く反対ですか？"],
    ["好きなものを深掘り","What part never gets old?","飽きない部分を聞く。","What part never gets old?","どの部分が何度でも楽しいですか？","The beginning, when everything feels possible.","始まりです。全部が可能に感じる時。","That's a beautiful way to put it.","すごくいい表現ですね。"],
    ["好きなものを深掘り","What would make me understand it better?","自分が理解するには何が必要か聞く。","What would make me understand it better?","僕がそれを理解するには何が必要ですか？","You'd have to try it once.", "一回やってみる必要があります。","Fair. I might need a guide then.", "たしかに。じゃあ案内役が必要かも。"],

    ["人柄を知る","What are you like when you're comfortable with someone?","打ち解けた時の相手を知る。","What are you like when you're comfortable with someone?","誰かに慣れたらどんな感じになりますか？","A lot more playful.", "もっとふざける感じになります。","Good to know. I'll wait for that version.", "知れてよかった。そのバージョンを待ちます。"],
    ["人柄を知る","What do your friends usually come to you for?","友達から頼られることを聞く。","What do your friends usually come to you for?","友達は普段どんなことであなたに頼りますか？","Honest advice, mostly.", "主に正直なアドバイスです。","That says a lot about you.", "それ、あなたの人柄が出ますね。"],
    ["人柄を知る","What's something people don't notice about you at first?","第一印象では分からない面を聞く。","What's something people don't notice about you at first?","最初は気づかれにくい自分の一面は何ですか？","I'm softer than I look.", "見た目よりやわらかいです。","I can actually see that.", "なんとなく分かる気がします。"],
    ["人柄を知る","What makes you open up to someone?","心を開く条件を聞く。","What makes you open up to someone?","どういう人に心を開きますか？","When they don't make everything about themselves.", "何でも自分の話にしない人です。","That's a fair standard.", "それは納得できる基準ですね。"],
    ["人柄を知る","What kind of compliment means the most to you?","嬉しい褒め言葉を聞く。","What kind of compliment means the most to you?","どんな褒め言葉が一番嬉しいですか？","When someone notices effort.", "努力に気づいてくれる時です。","That's a good one. Effort is easy to miss.", "それいいですね。努力って見逃されがちです。"],
    ["人柄を知る","How do you act when you really like something?","好きなものへの反応を聞く。","How do you act when you really like something?","本当に何かが好きな時、どんな感じになりますか？","I talk too much about it.", "それについて話しすぎます。","That's not a bad sign.", "それは悪いサインじゃないです。"],
    ["人柄を知る","Are you more careful or spontaneous?","慎重派か直感派か聞く。","Are you more careful or spontaneous?","慎重派ですか？思いつき派ですか？","Careful, until I trust the situation.", "状況を信頼できるまでは慎重です。","That sounds very reasonable.", "すごく理にかなってますね。"],
    ["人柄を知る","What do you do when you're stressed?","ストレス時の行動を聞く。","What do you do when you're stressed?","ストレスがある時は何をしますか？","I clean, weirdly.", "なぜか掃除します。","That's productive stress, at least.", "少なくとも生産的なストレスですね。"],
    ["人柄を知る","What kind of conversations do you enjoy most?","好きな会話のタイプを聞く。","What kind of conversations do you enjoy most?","どんな会話が一番好きですか？","The ones that get honest by accident.", "偶然本音っぽくなる会話です。","That's a really good answer.", "それ、すごくいい答えですね。"],
    ["人柄を知る","What makes you feel understood?","理解されていると感じる瞬間を聞く。","What makes you feel understood?","どういう時に理解されていると感じますか？","When someone remembers the small things.", "小さなことを覚えてくれている時です。","That says a lot about what you value.", "大事にしているものが伝わりますね。"],

    ["会話を深める","What does that mean to you?","相手にとっての意味を聞く。","What does that mean to you?","それはあなたにとってどういう意味ですか？","It means I didn't give up on myself.", "自分を諦めなかったということです。","That's powerful.", "それは強いですね。"],
    ["会話を深める","How did that shape you?","経験が相手をどう変えたか聞く。","How did that shape you?","それはあなたにどんな影響を与えましたか？","It made me more careful with people.", "人に対してもっと慎重になりました。","I can understand why.", "それは分かります。"],
    ["会話を深める","What did you learn from that?","経験から学んだことを聞く。","What did you learn from that?","そこから何を学びましたか？","That silence can be an answer too.", "沈黙も答えになるということです。","That's a hard lesson.", "それはつらい学びですね。"],
    ["会話を深める","Would you change anything about it?","やり直せるなら変えるか聞く。","Would you change anything about it?","何か変えられるなら変えますか？","Maybe how long I waited.", "待ちすぎたことかもしれません。","Waiting can feel safe until it doesn't.", "待つことって、安全に見えてそうじゃなくなる時がありますね。"],
    ["会話を深める","What do you think that says about you?","その話が相手について何を示すか聞く。","What do you think that says about you?","それはあなたについて何を表していると思いますか？","That I care more than I pretend to.", "見せているよりずっと気にする人間だということです。","That's not a bad thing.", "それは悪いことじゃないですよ。"],
    ["会話を深める","How do you see it now?","今ならどう見るか聞く。","How do you see it now?","今はそれをどう見ていますか？","Less like a failure, more like a turning point.", "失敗というより転機だと思っています。","That's a healthier way to hold it.", "その捉え方は健全ですね。"],
    ["会話を深める","What made that hard for you?","何が難しかったのか聞く。","What made that hard for you?","何がそんなに難しかったんですか？","I didn't want to disappoint anyone.", "誰もがっかりさせたくなかったんです。","That's a heavy thing to carry.", "それは重いものを背負ってましたね。"],
    ["会話を深める","What did you need back then?","当時必要だったものを聞く。","What did you need back then?","その時、何が必要でしたか？","Someone to tell me I wasn't crazy.", "自分がおかしいわけじゃないと言ってくれる人です。","I wish you had that.", "それがあったらよかったですね。"],
    ["会話を深める","What would you tell your younger self?","昔の自分への言葉を聞く。","What would you tell your younger self?","昔の自分に何と言いますか？","You don't have to earn rest.", "休む権利を得ようとしなくていい。","I might need to hear that too.", "僕もそれ聞く必要がありそうです。"],
    ["会話を深める","What do you understand now that you didn't before?","今になって分かることを聞く。","What do you understand now that you didn't before?","前は分からなかったけど今は分かることは何ですか？","That being calm doesn't mean you don't care.", "落ち着いていることは、気にしていないという意味じゃないことです。","That's a really important one.", "それは本当に大事ですね。"],

    ["軽めだけど広がる","What's a small thing that makes your day better?","小さな幸せを聞く。","What's a small thing that makes your day better?","一日を少し良くしてくれる小さなものは何ですか？","A good message at the right time.", "ちょうどいいタイミングのいいメッセージです。","That's simple, but very real.", "シンプルだけどすごくリアルですね。"],
    ["軽めだけど広がる","What's your ideal slow day?","ゆっくりした理想の一日を聞く。","What's your ideal slow day?","理想のゆっくりした一日はどんな感じですか？","Coffee, a walk, and no schedule.", "コーヒー、散歩、予定なしです。","That sounds dangerously perfect.", "それは危険なくらい完璧ですね。"],
    ["軽めだけど広がる","What kind of place makes you feel relaxed?","落ち着く場所を聞く。","What kind of place makes you feel relaxed?","どんな場所だと落ち着きますか？","Somewhere with soft lighting and not too much noise.", "柔らかい照明で、うるさすぎない場所です。","That's exactly my kind of place.", "まさに僕の好きな場所です。"],
    ["軽めだけど広がる","What's your comfort food?","安心する食べ物を聞く。","What's your comfort food?","安心する食べ物は何ですか？","Probably ramen.", "たぶんラーメンです。","That's a strong answer.", "それは強い答えですね。"],
    ["軽めだけど広がる","What's a song you never skip?","必ず聴く曲を聞く。","What's a song you never skip?","絶対にスキップしない曲は何ですか？","It changes, but right now it's a rock song.", "変わりますが、今はロックの曲です。","Now I want to know which one.", "それ、どの曲か知りたいです。"],
    ["軽めだけど広がる","What's a movie you can always rewatch?","何度も見られる映画を聞く。","What's a movie you can always rewatch?","何度でも見られる映画はありますか？","Anything that feels warm and nostalgic.", "温かくて懐かしい感じのものなら何でも。","That's more of a mood than a title.", "それはタイトルというより雰囲気ですね。"],
    ["軽めだけど広がる","What's your favorite kind of weather?","好きな天気を聞く。","What's your favorite kind of weather?","好きな天気は何ですか？","Cloudy, but not rainy.", "曇り、でも雨じゃない天気です。","That's specific. I respect it.", "具体的ですね。尊重します。"],
    ["軽めだけど広がる","What's something you never get tired of talking about?","ずっと話せる話題を聞く。","What's something you never get tired of talking about?","話していて飽きないことは何ですか？","Why people do what they do.", "人がなぜそう行動するのかです。","That could become a long conversation.", "それは長い会話になりそうですね。"],
    ["軽めだけど広がる","What's a tiny habit you like about yourself?","自分の好きな小さな習慣を聞く。","What's a tiny habit you like about yourself?","自分の好きな小さな習慣はありますか？","I write things down when I want to remember them.", "覚えておきたいことは書きます。","That's kind of sweet, actually.", "それ、実はちょっと素敵ですね。"],
    ["軽めだけど広がる","What's something that instantly improves your mood?","気分が上がるものを聞く。","What's something that instantly improves your mood?","すぐ気分が良くなるものは何ですか？","A good laugh at the wrong time.", "変なタイミングで笑うことです。","That's dangerous, but I get it.", "危険だけど分かります。"]
  ];

  items.forEach((item, index) => {
    window.CONVERSATION_PHRASES.push({
      id: `${prefix}-${String(index + 1).padStart(3, "0")}`,
      pack,
      category: item[0],
      phrase: item[1],
      usageNote: item[2],
      lines: [
        ["A", item[3], item[4]],
        ["B", item[5], item[6]],
        ["A", item[7], item[8]]
      ]
    });
  });
})();
