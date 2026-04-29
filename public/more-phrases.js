window.CONVERSATION_PHRASES = window.CONVERSATION_PHRASES || [];

(() => {
  const packs = [
    {
      pack: "感情を出す",
      prefix: "emotion-more",
      items: [
        ["寂しさ", "I kind of miss you.", "少し照れながら寂しさを伝える。", "I kind of miss you.", "ちょっと君が恋しい。", "Kind of?", "ちょっとだけ？", "Okay, maybe more than kind of.", "分かった、ちょっと以上かも。"],
        ["寂しさ", "It feels weird without you here.", "相手がいない違和感を伝える。", "It feels weird without you here.", "君がここにいないと変な感じ。", "I didn't know you noticed.", "気づいてると思わなかった。", "Of course I noticed.", "もちろん気づくよ。"],
        ["寂しさ", "I wish you were here.", "今ここにいてほしい時。", "I wish you were here.", "君がここにいたらいいのに。", "Me too.", "僕も。", "This place isn't the same without you.", "ここは君がいないと同じじゃない。"],
        ["寂しさ", "I feel a little left behind.", "置いていかれたように感じる時。", "I feel a little left behind.", "少し置いていかれた気がする。", "I didn't mean to make you feel that way.", "そう感じさせるつもりはなかった。", "I know. I just needed to say it.", "分かってる。ただ言いたかった。"],
        ["寂しさ", "I miss how things used to be.", "以前の関係や空気が恋しい時。", "I miss how things used to be.", "前みたいだった頃が恋しい。", "I do too.", "僕も。", "Maybe we can find a new version of that.", "新しい形で取り戻せるかも。"],
        ["傷ついた", "That actually hurt.", "思った以上に傷ついた時。", "That actually hurt.", "それ、本当に傷ついた。", "I didn't realize.", "気づかなかった。", "I know, but I need you to know now.", "分かってる。でも今は知ってほしい。"],
        ["傷ついた", "I took that personally.", "個人的に受け取ってしまった時。", "I took that personally.", "それ、個人的に受け取っちゃった。", "I wasn't aiming it at you.", "君に向けたつもりじゃなかった。", "Okay, but it landed that way.", "分かった。でもそう響いたんだ。"],
        ["傷ついた", "That stung a little.", "少し刺さるように傷ついた時。", "That stung a little.", "それ、ちょっと刺さった。", "I'm sorry.", "ごめん。", "Thanks. I just needed you to hear that.", "ありがとう。ただそれを聞いてほしかった。"],
        ["傷ついた", "I felt brushed off.", "軽く扱われたように感じた時。", "I felt brushed off.", "軽く流された感じがした。", "When I changed the subject?", "話題を変えた時？", "Yeah, I was trying to tell you something real.", "うん。本気の話をしようとしてた。"],
        ["傷ついた", "I felt like I didn't matter.", "自分が大切にされていないと感じた時。", "I felt like I didn't matter.", "自分が大事じゃないみたいに感じた。", "You do matter.", "大事だよ。", "Then I need your actions to show that.", "じゃあ行動で見せてほしい。"],
        ["嫉妬", "I got jealous.", "嫉妬したことを認める。", "I got jealous.", "嫉妬した。", "Of who?", "誰に？", "Of how easy you are with him.", "君が彼とすごく自然に話すことに。"],
        ["嫉妬", "I know it's not fair, but I felt jealous.", "不公平だと分かりつつ嫉妬を伝える。", "I know it's not fair, but I felt jealous.", "不公平なのは分かってるけど、嫉妬した。", "Thanks for being honest.", "正直に言ってくれてありがとう。", "I'm trying not to hide from it.", "それから逃げないようにしてる。"],
        ["嫉妬", "I didn't like seeing that.", "見ていて嫌だったと伝える。", "I didn't like seeing that.", "あれを見るのは嫌だった。", "You mean us talking?", "僕らが話してたこと？", "Yeah, and I know that's my issue.", "うん。それが僕の問題なのは分かってる。"],
        ["嫉妬", "It brought out a bad side of me.", "嫉妬で嫌な自分が出た時。", "It brought out a bad side of me.", "嫌な自分が出た。", "At least you're noticing it.", "気づいてるだけいいよ。", "Now I need to deal with it.", "あとは向き合わなきゃ。"],
        ["嫉妬", "I'm not proud of how I reacted.", "嫉妬による反応を反省する。", "I'm not proud of how I reacted.", "あの反応は誇れない。", "It was intense.", "かなり強かったね。", "I know. I'm sorry for that.", "分かってる。そのことはごめん。"],
        ["焦り", "I'm starting to panic.", "焦りや不安が強くなってきた時。", "I'm starting to panic.", "焦ってきた。", "Look at me. Breathe.", "こっち見て。息して。", "Okay. I'm trying.", "うん。やってみる。"],
        ["焦り", "I feel like I'm running out of time.", "時間が足りない感覚を伝える。", "I feel like I'm running out of time.", "時間がなくなってる気がする。", "For what?", "何の？", "For figuring out what I actually want.", "自分が本当に望むものを見つけること。"],
        ["焦り", "Everything feels urgent.", "全部が急ぎに感じる時。", "Everything feels urgent.", "全部急ぎに感じる。", "Maybe not everything is.", "全部ではないかもよ。", "I need help seeing that.", "そう見えるように助けてほしい。"],
        ["焦り", "I'm overwhelmed.", "抱えきれない気持ちを伝える。", "I'm overwhelmed.", "いっぱいいっぱい。", "What can I take off your plate?", "何を引き受けられる？", "Honestly, just stay with me for a minute.", "正直、少しそばにいてほしい。"],
        ["焦り", "I can't think straight right now.", "頭が回らない時。", "I can't think straight right now.", "今ちゃんと考えられない。", "Then don't decide right now.", "じゃあ今決めなくていい。", "That might be the smartest thing.", "それが一番賢いかも。"],
        ["感謝", "I really appreciate you.", "相手の存在や支えに感謝する。", "I really appreciate you.", "本当に君に感謝してる。", "Where is this coming from?", "急にどうしたの？", "I just don't say it enough.", "ただ、あまり言えてないから。"],
        ["感謝", "That means more than you know.", "相手の行動が思った以上に嬉しい時。", "That means more than you know.", "それ、思ってる以上に嬉しい。", "It was nothing.", "大したことじゃないよ。", "It wasn't nothing to me.", "僕にとっては大したことだった。"],
        ["感謝", "Thanks for showing up.", "来てくれた・支えてくれたことに感謝する。", "Thanks for showing up.", "来てくれてありがとう。", "I said I would.", "行くって言ったからね。", "I know, but it still matters.", "分かってる。でもそれでも大事なんだ。"],
        ["感謝", "I don't take that for granted.", "当たり前だと思っていないと伝える。", "I don't take that for granted.", "それを当たり前だと思ってないよ。", "Good, because I care a lot.", "よかった。僕はすごく大事に思ってるから。", "I know. I care too.", "分かってる。僕も大事に思ってる。"],
        ["感謝", "You made that easier for me.", "相手のおかげで楽になった時。", "You made that easier for me.", "君のおかげで楽になった。", "I'm glad I could help.", "助けになれてよかった。", "You helped more than you think.", "思ってる以上に助かったよ。"],
        ["モヤモヤ", "Something about it bothered me.", "はっきりしない違和感を伝える。", "Something about it bothered me.", "何かが引っかかった。", "Can you name it?", "それが何か言える？", "Not yet, but I can feel it.", "まだ。でも感じるんだ。"],
        ["モヤモヤ", "I have mixed feelings.", "複雑な感情がある時。", "I have mixed feelings.", "複雑な気持ち。", "Good mixed or bad mixed?", "いい複雑？悪い複雑？", "Both, honestly.", "正直、両方。"],
        ["モヤモヤ", "I don't feel settled about it.", "まだ納得しきれていない時。", "I don't feel settled about it.", "まだすっきりしてない。", "Do you want to talk more?", "もう少し話す？", "Yeah, I think I need to.", "うん、必要だと思う。"],
        ["モヤモヤ", "It left a weird feeling.", "後味が悪い時。", "It left a weird feeling.", "変な感じが残った。", "The conversation?", "会話が？", "Yeah, like we skipped the real issue.", "うん。本当の問題を飛ばしたみたい。"],
        ["モヤモヤ", "I'm trying to understand my reaction.", "自分の反応を理解しようとしている時。", "I'm trying to understand my reaction.", "自分の反応を理解しようとしてる。", "That's actually healthy.", "それは健全だと思う。", "I hope so, because it's confusing.", "そうだといいな。混乱するから。"]
      ]
    },
    {
      pack: "人間関係",
      prefix: "relation-more",
      items: [
        ["仲直り", "Can we fix this?", "関係を修復したい時。", "Can we fix this?", "これ、直せるかな？", "I want to try.", "試したい。", "Me too. I don't want to lose us.", "僕も。僕らを失いたくない。"],
        ["仲直り", "I don't want to stay mad.", "怒ったままでいたくない時。", "I don't want to stay mad.", "怒ったままでいたくない。", "Me neither.", "僕も。", "Then let's actually talk.", "じゃあちゃんと話そう。"],
        ["仲直り", "Let's meet halfway.", "お互い歩み寄りたい時。", "Let's meet halfway.", "お互い歩み寄ろう。", "What does that look like?", "具体的には？", "I listen more, and you tell me sooner.", "僕はもっと聞く。君はもっと早く言う。"],
        ["仲直り", "I still care about us.", "揉めても関係を大事に思っている時。", "I still care about us.", "まだ僕らのことを大事に思ってる。", "I needed to hear that.", "それを聞きたかった。", "I should've said it earlier.", "もっと早く言うべきだった。"],
        ["仲直り", "I don't want this to be the end of it.", "ここで終わらせたくない時。", "I don't want this to be the end of it.", "これで終わりにしたくない。", "Then what do you want?", "じゃあどうしたい？", "A real conversation, not another fight.", "また喧嘩じゃなくて、本当の会話。"],
        ["信頼", "I need to rebuild trust.", "信頼を取り戻す必要がある時。", "I need to rebuild trust.", "信頼を取り戻さなきゃ。", "That takes time.", "それは時間がかかるよ。", "I know. I'm willing to do the work.", "分かってる。ちゃんと努力する。"],
        ["信頼", "I want to believe you.", "信じたいが不安がある時。", "I want to believe you.", "君を信じたい。", "But you're not there yet.", "でもまだそこまで行けてない。", "Not yet. I need consistency.", "まだ。安定した行動が必要。"],
        ["信頼", "You can count on me.", "頼っていいと伝える。", "You can count on me.", "僕を頼っていいよ。", "I have a hard time doing that.", "それが苦手なんだ。", "Then let me earn it slowly.", "じゃあ少しずつ信頼を得させて。"],
        ["信頼", "I don't want to let you down.", "相手を失望させたくない時。", "I don't want to let you down.", "君をがっかりさせたくない。", "Then be honest with me.", "じゃあ正直でいて。", "I can do that.", "それはできる。"],
        ["信頼", "I trust your judgment.", "相手の判断を信頼していると伝える。", "I trust your judgment.", "君の判断を信頼してる。", "Even if it's different from yours?", "君と違っても？", "Especially then.", "そういう時こそ。"],
        ["距離感", "I don't want to crowd you.", "相手に近づきすぎたくない時。", "I don't want to crowd you.", "君を圧迫したくない。", "I appreciate that.", "それはありがたい。", "Tell me if you need space.", "距離が必要なら言って。"],
        ["距離感", "Can we take this slowly?", "関係をゆっくり進めたい時。", "Can we take this slowly?", "これ、ゆっくり進められる？", "Yeah, I don't want to rush either.", "うん、僕も急ぎたくない。", "Good. I like where this is going.", "よかった。この流れは好きだから。"],
        ["距離感", "I need a little more time.", "もう少し時間が必要な時。", "I need a little more time.", "もう少し時間が必要。", "For us?", "僕らのことに？", "For me to understand what I want.", "自分が何を望んでるか分かるために。"],
        ["距離感", "I don't want to rush into anything.", "急いで何かを決めたくない時。", "I don't want to rush into anything.", "何かに急いで飛び込みたくない。", "That's fair.", "それは分かる。", "I just want this to be real.", "これを本物にしたいだけ。"],
        ["距離感", "Let's not force it.", "無理に関係や会話を進めたくない時。", "Let's not force it.", "無理に進めるのはやめよう。", "You think we're forcing it?", "無理してると思う？", "A little. Maybe we should breathe.", "少しね。ちょっと落ち着いたほうがいいかも。"],
        ["約束", "I don't want to make a promise I can't keep.", "守れない約束をしたくない時。", "I don't want to make a promise I can't keep.", "守れない約束はしたくない。", "I respect that.", "それは尊重する。", "I can promise to try, though.", "でも努力することは約束できる。"],
        ["約束", "I'll do better next time.", "次は改善すると伝える。", "I'll do better next time.", "次はもっとちゃんとする。", "I need more than words.", "言葉だけじゃ足りない。", "I know. I'll show you.", "分かってる。行動で見せる。"],
        ["約束", "You have my word.", "約束する・信じてほしい時。", "You have my word.", "約束する。", "Don't say that lightly.", "軽く言わないで。", "I'm not. I mean it.", "軽く言ってない。本気だよ。"],
        ["約束", "Let's be honest if it changes.", "状況が変わったら正直に話す約束。", "Let's be honest if it changes.", "変わったら正直に言おう。", "Even if it's hard?", "言いにくくても？", "Especially if it's hard.", "言いにくい時こそ。"],
        ["約束", "I don't want to disappear on you.", "急に連絡を断ちたくない時。", "I don't want to disappear on you.", "君の前から急に消えたくない。", "Then don't.", "じゃあ消えないで。", "I won't. I'll tell you when I need space.", "消えない。距離が必要な時は言う。"],
        ["支える", "You don't have to carry this alone.", "一人で抱えなくていいと伝える。", "You don't have to carry this alone.", "一人で抱えなくていい。", "I don't know how to ask for help.", "助けを求める方法が分からない。", "Start with one small thing.", "小さいこと一つから始めよう。"],
        ["支える", "Let me be there for you.", "支えになりたい時。", "Let me be there for you.", "君の支えでいさせて。", "I don't want to be a burden.", "負担になりたくない。", "You're not a burden to me.", "君は僕の負担じゃない。"],
        ["支える", "I'm not going anywhere.", "そばにいると安心させる。", "I'm not going anywhere.", "僕はどこにも行かないよ。", "You can't promise that.", "そんな約束できないでしょ。", "Maybe not forever, but I can promise tonight.", "永遠は無理でも、今夜は約束できる。"],
        ["支える", "Lean on me a little.", "少し頼ってほしい時。", "Lean on me a little.", "少し僕を頼って。", "I'm not used to that.", "慣れてないんだ。", "Then we can practice.", "じゃあ練習すればいい。"],
        ["支える", "You can fall apart for a minute.", "一瞬崩れてもいいと伝える。", "You can fall apart for a minute.", "少しくらい崩れてもいいよ。", "What if I can't stop?", "止まらなかったら？", "Then I'll sit with you until you can.", "止まれるまで一緒にいる。"],
        ["本音", "I need more from you.", "相手にもっと向き合ってほしい時。", "I need more from you.", "君からもっと必要なんだ。", "More what?", "もっと何を？", "More honesty. More effort.", "もっと正直さ。もっと努力。"],
        ["本音", "I don't feel chosen.", "自分が選ばれていないように感じる時。", "I don't feel chosen.", "自分が選ばれてる感じがしない。", "I didn't know you felt that way.", "そんなふうに感じてたんだね。", "I didn't want to sound needy.", "重いと思われたくなかった。"],
        ["本音", "I need to know where I stand.", "自分の立場や関係性を知りたい時。", "I need to know where I stand.", "自分がどういう立場なのか知りたい。", "With me?", "僕との関係で？", "Yeah. I can't keep guessing.", "うん。ずっと推測していられない。"],
        ["本音", "I want us to be more honest.", "関係の中で正直さを増やしたい時。", "I want us to be more honest.", "僕ら、もっと正直でいたい。", "Even about the uncomfortable stuff?", "気まずいことも？", "Especially that stuff.", "むしろそういうことこそ。"],
        ["本音", "I don't want to lose myself in this.", "関係の中で自分を失いたくない時。", "I don't want to lose myself in this.", "この中で自分を失いたくない。", "I don't want that either.", "僕もそれは望んでない。", "Then we need better boundaries.", "じゃあもっといい境界線が必要だね。"]
      ]
    },
    {
      pack: "リアル口語",
      prefix: "slang-more",
      items: [
        ["軽い謝罪", "My bad.", "軽いミスを謝る。", "My bad, I thought you knew.", "ごめん、知ってると思ってた。", "I definitely did not.", "全然知らなかった。", "Okay, that's on me.", "うん、それは僕のせい。"],
        ["軽い謝罪", "That's on me.", "自分の責任だと認める。", "That's on me.", "それは僕の責任だ。", "I appreciate you saying that.", "そう言ってくれてありがたい。", "I should've checked first.", "先に確認すべきだった。"],
        ["軽い謝罪", "I messed up.", "失敗したと素直に言う。", "I messed up.", "やらかした。", "How bad?", "どのくらい？", "Not terrible, but not great.", "最悪ではないけど、良くもない。"],
        ["軽い謝罪", "I dropped the ball.", "自分がやるべきことを落とした時。", "I dropped the ball.", "僕がミスった。", "Can we still fix it?", "まだ直せる？", "Yeah, if we move fast.", "うん、急げば。"],
        ["軽い謝罪", "I blanked.", "一瞬忘れた・頭が真っ白になった時。", "I blanked.", "頭が真っ白になった。", "During the presentation?", "発表中に？", "Right when they asked the easiest question.", "一番簡単な質問をされた瞬間に。"],
        ["共感", "I feel you.", "相手の気持ちに共感する。", "I feel you.", "その気持ち分かる。", "It's just been exhausting.", "ただ本当に疲れるんだ。", "Yeah, that kind of thing wears you down.", "うん、そういうのは削られるよね。"],
        ["共感", "That's rough.", "大変だったね、と反応する。", "That's rough.", "それはきついね。", "I didn't expect it to hit me that hard.", "そんなに響くと思ってなかった。", "Makes sense that it did.", "そう感じても当然だよ。"],
        ["共感", "I get where you're coming from.", "相手の立場を理解する。", "I get where you're coming from.", "君の言いたいことは分かる。", "Even if you don't agree?", "同意しなくても？", "Yeah. I still get it.", "うん。それでも分かる。"],
        ["共感", "That tracks.", "話の流れとして納得できる時。", "That tracks.", "それは筋が通るね。", "You think so?", "そう思う？", "Yeah, given what happened yesterday.", "うん、昨日のことを考えると。"],
        ["共感", "No wonder.", "それならそうなるよね、と反応する。", "No wonder you were quiet.", "だから静かだったんだね。", "I didn't want to ruin the mood.", "空気を壊したくなかった。", "You don't have to hide that with me.", "僕の前で隠さなくていいよ。"],
        ["リアクション", "For real?", "本当に？とカジュアルに驚く。", "For real?", "マジで？", "Yeah, they offered me the role.", "うん、その役をオファーされた。", "That's huge.", "それすごいじゃん。"],
        ["リアクション", "No shot.", "まさか、ありえないと驚く。", "No shot.", "まさか。", "I'm serious.", "本当だよ。", "You actually met her there?", "本当にそこで彼女に会ったの？"],
        ["リアクション", "That's a lot.", "情報や状況が重い時。", "That's a lot.", "それは大きいね。", "Yeah, I'm still figuring it out.", "うん、まだ整理してる。", "Take your time with it.", "ゆっくり考えて。"],
        ["リアクション", "That's so real.", "相手の発言にリアルに共感する。", "That's so real.", "それめっちゃ分かる。", "You do that too?", "君もそうする？", "All the time.", "いつも。"],
        ["リアクション", "Couldn't be me.", "自分には無理、と冗談っぽく言う。", "I woke up at five to run.", "5時に起きて走った。", "Couldn't be me.", "僕には無理。", "I knew you'd say that.", "そう言うと思った。"],
        ["諦め", "It is what it is.", "仕方ないと受け止める。", "It is what it is.", "仕方ないね。", "You sound too calm.", "落ち着きすぎじゃない？", "I'm trying not to spiral.", "考えすぎないようにしてる。"],
        ["諦め", "We'll figure it out.", "なんとかしようと前向きに言う。", "We'll figure it out.", "なんとかなるよ。", "You always say that.", "いつもそう言うね。", "And we usually do.", "だいたい本当になんとかなるし。"],
        ["諦め", "Worst case, we leave.", "最悪の場合を軽く出す。", "Worst case, we leave.", "最悪、帰ればいい。", "That's your plan?", "それが計画？", "It's a backup plan.", "予備の計画だよ。"],
        ["諦め", "Not ideal, but okay.", "理想ではないが受け入れる。", "Not ideal, but okay.", "理想ではないけど、大丈夫。", "Are you sure?", "本当に？", "Yeah, we can work with it.", "うん、それでなんとかできる。"],
        ["諦め", "We'll take the win.", "完璧ではないが成功として受け取る。", "We'll take the win.", "これは成功ってことにしよう。", "Even though it was messy?", "ごちゃごちゃだったけど？", "Especially because it was messy.", "ごちゃごちゃだったからこそ。"],
        ["会話のノリ", "You know what I mean?", "分かるでしょ？と確認する。", "You know what I mean?", "言いたいこと分かる？", "Yeah, you're tired of guessing.", "うん、推測するのに疲れたんだね。", "Exactly.", "その通り。"],
        ["会話のノリ", "You get it.", "相手が理解してくれた時。", "You get it.", "分かってくれてるね。", "I try.", "努力はしてる。", "No, seriously. Thank you.", "いや、本当に。ありがとう。"],
        ["会話のノリ", "That's the thing.", "まさにそこが問題、と言う時。", "That's the thing.", "そこなんだよ。", "You don't know what she wants.", "彼女が何を望んでるか分からない。", "Exactly, and I don't want to guess wrong.", "そう。間違って推測したくない。"],
        ["会話のノリ", "Here's the thing.", "本題や問題点を切り出す。", "Here's the thing.", "問題はね。", "Okay, hit me.", "うん、言って。", "I like the plan, but not the timing.", "計画は好き。でもタイミングが違う。"],
        ["会話のノリ", "That's where I'm at.", "今の自分の立場をまとめる。", "That's where I'm at.", "今の僕はそんな感じ。", "Still unsure, but open?", "まだ迷ってるけど、可能性はある？", "Yeah, exactly.", "うん、まさに。"],
        ["短い返し", "No worries.", "大丈夫だよ、と軽く返す。", "Sorry I'm late.", "遅れてごめん。", "No worries.", "大丈夫。", "I saved us a table.", "席取っておいたよ。"],
        ["短い返し", "All good.", "問題ないとカジュアルに返す。", "I forgot to text you back.", "返信忘れてた。", "All good.", "全然大丈夫。", "I figured you were busy.", "忙しいんだと思ってた。"],
        ["短い返し", "Fair.", "相手の言い分を短く認める。", "I don't want to go if he's there.", "彼がいるなら行きたくない。", "Fair.", "それは分かる。", "I just don't want drama.", "揉めごとは避けたいだけ。"],
        ["短い返し", "Valid.", "相手の感情や意見がもっともだと認める。", "I'm upset about it.", "それで腹が立ってる。", "Valid.", "それは当然。", "I was worried I was overreacting.", "大げさかと思ってた。"],
        ["短い返し", "Say that.", "相手の発言に強く同意する。", "I just want people to be direct.", "ただ直接言ってほしいだけ。", "Say that.", "ほんとそれ。", "Guessing is exhausting.", "察するのは疲れる。"]
      ]
    }
  ];

  packs.forEach(({ pack, prefix, items }) => {
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
  });
})();
