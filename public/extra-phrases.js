window.CONVERSATION_PHRASES = window.CONVERSATION_PHRASES || [];

(() => {
  const packs = [
    {
      pack: "会話を止めない",
      prefix: "keep",
      items: [
        ["言い換え", "What I mean is...", "自分の言いたいことを別の言い方で補足する。", "What I mean is, I need more time.", "つまり、もう少し時間が必要ってこと。", "Oh, that makes sense.", "ああ、それなら分かる。", "I didn't want it to sound like an excuse.", "言い訳っぽく聞こえたくなかったんだ。"],
        ["言い換え", "Let me put it this way.", "相手に伝わるように言い直す。", "Let me put it this way.", "別の言い方をするとね。", "Okay, I'm listening.", "うん、聞いてるよ。", "If we rush this, we'll regret it later.", "これを急ぐと、あとで後悔すると思う。"],
        ["言い換え", "What I'm trying to say is...", "考えを整理しながら本題を言う。", "What I'm trying to say is, I miss how we used to talk.", "言いたいのは、前みたいに話せてた頃が恋しいってこと。", "I miss that too.", "僕もそれが恋しい。", "Then maybe we can start there.", "じゃあ、そこから始められるかも。"],
        ["言い換え", "In other words...", "要点を短く言い直す。", "In other words, you're not mad at me.", "つまり、僕に怒ってるわけじゃないんだね。", "I'm frustrated, not mad.", "怒ってるんじゃなくて、もどかしいの。", "That's an important difference.", "それは大事な違いだね。"],
        ["言い換え", "To be more specific...", "抽象的な話を具体化する。", "To be more specific, I felt left out.", "もっと具体的に言うと、置いていかれた気がした。", "I didn't realize that.", "それは気づかなかった。", "I know, that's why I'm saying it now.", "分かってる。だから今言ってるんだ。"],
        ["言い換え", "That's not exactly what I meant.", "誤解されそうな時に修正する。", "That's not exactly what I meant.", "それはちょっと意図と違う。", "Then what did you mean?", "じゃあどういう意味だったの？", "I meant we need a better plan, not a new person.", "人を変えるんじゃなくて、計画を良くする必要があるってこと。"],
        ["時間稼ぎ", "Give me a second.", "少し考える時間がほしい時。", "Give me a second.", "ちょっと待って。", "Take your time.", "ゆっくりでいいよ。", "I want to answer this properly.", "ちゃんと答えたいんだ。"],
        ["時間稼ぎ", "Let me think about that.", "すぐ答えずに考える時間を取る。", "Let me think about that.", "それ、少し考えさせて。", "Sure, no rush.", "もちろん、急がなくていいよ。", "I don't want to say the wrong thing.", "変なことを言いたくないんだ。"],
        ["時間稼ぎ", "That's a good question.", "答えに詰まった時に自然につなぐ。", "That's a good question.", "それはいい質問だね。", "You don't have to answer right away.", "すぐ答えなくていいよ。", "No, I want to. I just need a second.", "いや、答えたい。ただ少し時間がいる。"],
        ["時間稼ぎ", "How do I say this?", "言いにくいことを考えながら話す。", "How do I say this?", "これ、どう言えばいいかな。", "Just say it simply.", "シンプルに言って。", "I think I'm more tired than angry.", "怒ってるというより、疲れてるんだと思う。"],
        ["時間稼ぎ", "I'm trying to find the right words.", "言葉を選びながら話したい時。", "I'm trying to find the right words.", "ちょうどいい言葉を探してる。", "I appreciate that.", "そうしてくれてありがたいよ。", "I care about this, so I don't want to rush it.", "大事なことだから、急ぎたくないんだ。"],
        ["時間稼ぎ", "Hold on, let me process that.", "聞いた内容を理解する時間がほしい時。", "Hold on, let me process that.", "待って、ちょっと整理させて。", "Yeah, it was a lot.", "うん、内容多かったよね。", "Okay, I think I understand now.", "よし、今なら分かる気がする。"],
        ["話題転換", "Changing the subject for a second...", "一瞬だけ別の話に切り替える。", "Changing the subject for a second, did you eat?", "一瞬話変えるけど、ご飯食べた？", "Not yet.", "まだ。", "Then let's talk after you get something.", "じゃあ何か食べてから話そう。"],
        ["話題転換", "That reminds me...", "関連する話題へ自然に移る。", "That reminds me, I saw your message.", "それで思い出した、君のメッセージ見たよ。", "Oh, I wasn't sure if it sent.", "あ、送れたか分からなかった。", "It did. I just needed time to reply.", "送れてたよ。ただ返信に時間が必要だった。"],
        ["話題転換", "Speaking of that...", "今の話から別の関連話題につなぐ。", "Speaking of that, did you talk to Alex?", "それで思い出したけど、アレックスと話した？", "Not yet. Should I?", "まだ。話すべき？", "I think it would clear things up.", "話したら整理できると思う。"],
        ["話題転換", "Before I forget...", "忘れる前に言っておく。", "Before I forget, your sister called.", "忘れる前に言うけど、お姉さんから電話あったよ。", "Did she say why?", "理由言ってた？", "She just said to call her back.", "折り返してって言ってただけ。"],
        ["話題転換", "While we're on this topic...", "同じテーマのまま一つ足す。", "While we're on this topic, I should apologize too.", "この話題のついでに、僕も謝るべきだ。", "For what?", "何に対して？", "For making you feel like you had to guess.", "君に察しなきゃいけないと思わせたこと。"],
        ["話題転換", "Anyway, back to you.", "脱線した後に相手の話へ戻す。", "Anyway, back to you. What happened after that?", "とにかく君の話に戻ろう。そのあと何があったの？", "He just walked away.", "彼はそのまま立ち去った。", "Wow. That must have felt awful.", "うわ、それはきつかったね。"],
        ["確認", "Just to be clear...", "誤解がないように確認する。", "Just to be clear, you're not saying no.", "確認だけど、断ってるわけじゃないんだね。", "Right. I just need more details.", "そう。もっと詳細が必要なだけ。", "Got it. I can send them tonight.", "了解。今夜送れるよ。"],
        ["確認", "So you're saying...", "相手の話を自分の言葉で確認する。", "So you're saying you need space, not a breakup.", "つまり、別れじゃなくて距離が必要ってこと？", "Exactly.", "その通り。", "Okay. I can respect that.", "分かった。それは尊重するよ。"],
        ["確認", "Do I have that right?", "自分の理解が合っているか聞く。", "You felt ignored at dinner. Do I have that right?", "夕食の時、無視された感じがした。理解合ってる？", "Yeah, pretty much.", "うん、だいたいそう。", "Then I owe you an apology.", "なら謝らなきゃ。"],
        ["確認", "Are we on the same page?", "お互いの認識が同じか確認する。", "Are we on the same page about tomorrow?", "明日のことで認識合ってる？", "I think so. Ten at the station?", "たぶん。駅に10時？", "Yes, exactly.", "うん、その通り。"],
        ["確認", "Can I check something?", "一つ確認したい時。", "Can I check something?", "ちょっと確認していい？", "Sure.", "もちろん。", "Did you want advice, or did you just want me to listen?", "アドバイスがほしい？それともただ聞いてほしい？"],
        ["確認", "When you say that, do you mean...?", "相手の言葉の意味を丁寧に確認する。", "When you say that, do you mean you're disappointed?", "そう言う時、がっかりしてるって意味？", "A little, yeah.", "少しね。", "Thanks for telling me directly.", "直接言ってくれてありがとう。"],
        ["要約", "Long story short...", "長い話を短くまとめる。", "Long story short, I said yes.", "短く言うと、イエスって言った。", "Wait, to the job?", "待って、仕事に？", "Yeah. I start next month.", "うん。来月始まる。"],
        ["要約", "The short version is...", "要点だけ伝える。", "The short version is, we missed the train.", "短く言うと、電車を逃した。", "Of course you did.", "やっぱりね。", "But we made it work.", "でもなんとかしたよ。"],
        ["要約", "Basically...", "ざっくり要点を言う。", "Basically, I need to stop saying yes to everything.", "要するに、何でもイエスって言うのをやめなきゃ。", "That sounds healthy.", "それは健全だね。", "It sounds hard too.", "でも難しそうでもある。"],
        ["要約", "The point is...", "話の核心を示す。", "The point is, I don't want to lose this.", "大事なのは、これを失いたくないってこと。", "Neither do I.", "僕も失いたくない。", "Then we should actually work on it.", "じゃあ本気で向き合うべきだね。"],
        ["要約", "Here's the thing...", "少し大事な本音や前提を出す。", "Here's the thing. I like the idea, but not the timing.", "問題はね、案は好きだけどタイミングが違う。", "That's fair.", "それは分かる。", "Maybe we revisit it next month.", "来月また考えよう。"],
        ["要約", "All I'm saying is...", "強く言いすぎずに要点だけ伝える。", "All I'm saying is, you deserve better.", "僕が言いたいのは、君はもっと大切にされるべきってこと。", "I know. I just needed to hear it.", "分かってる。ただそれを聞きたかった。", "Then I'll say it again.", "じゃあもう一回言うよ。"]
      ]
    },
    {
      pack: "感情を出す",
      prefix: "emotion",
      items: [
        ["安心", "That's a relief.", "不安がなくなってほっとした時。", "That's a relief.", "それは安心した。", "Were you worried?", "心配してた？", "Yeah, more than I wanted to admit.", "うん、認めたくないくらい心配してた。"],
        ["安心", "I feel better hearing that.", "相手の言葉で気持ちが軽くなった時。", "I feel better hearing that.", "それを聞いて少し安心した。", "I meant every word.", "全部本心だよ。", "Thanks. I needed that.", "ありがとう。それが必要だった。"],
        ["安心", "That takes a weight off my shoulders.", "大きな負担が軽くなった時。", "That takes a weight off my shoulders.", "それで肩の荷が下りた。", "I'm glad.", "よかった。", "I didn't realize how tense I was.", "自分がどれだけ緊張してたか気づいてなかった。"],
        ["安心", "I can breathe now.", "ようやく安心できた時。", "I can breathe now.", "やっと息ができる感じ。", "Was it that stressful?", "そんなにストレスだった？", "Honestly, yeah.", "正直、そう。"],
        ["安心", "I'm glad we're okay.", "関係が大丈夫だと分かって安心した時。", "I'm glad we're okay.", "僕ら大丈夫でよかった。", "Me too. I hated the silence.", "僕も。沈黙が嫌だった。", "Let's not do that again.", "もうああいうのはやめよう。"],
        ["驚き", "I did not expect that.", "予想外のことに驚く。", "I did not expect that.", "それは予想してなかった。", "Good surprise or bad surprise?", "いい驚き？悪い驚き？", "Good. Definitely good.", "いい方。間違いなく。"],
        ["驚き", "That caught me off guard.", "不意を突かれて驚いた時。", "That caught me off guard.", "それは不意打ちだった。", "Sorry, I should've warned you.", "ごめん、先に言うべきだった。", "No, I'm glad you told me.", "いや、言ってくれてよかった。"],
        ["驚き", "I'm still processing it.", "驚きがまだ整理できていない時。", "I'm still processing it.", "まだ整理してるところ。", "Yeah, it's a lot.", "うん、大きな話だよね。", "I need a minute before I react.", "反応する前に少し時間がほしい。"],
        ["驚き", "I wasn't ready for that.", "心の準備ができていなかった時。", "I wasn't ready for that.", "それは心の準備できてなかった。", "Too honest?", "正直すぎた？", "Maybe, but I appreciate it.", "かも。でもありがたい。"],
        ["驚き", "That changes everything.", "状況が大きく変わる情報を聞いた時。", "That changes everything.", "それで全部変わるね。", "In a bad way?", "悪い意味で？", "Not bad. Just different.", "悪くはない。ただ違ってくる。"],
        ["困惑", "I'm not sure how I feel.", "自分の感情がまだ分からない時。", "I'm not sure how I feel.", "自分がどう感じてるか分からない。", "That's okay.", "それでいいよ。", "I just need to sit with it.", "少しこの気持ちと向き合う必要がある。"],
        ["困惑", "I'm kind of torn.", "二つの気持ちで迷っている時。", "I'm kind of torn.", "ちょっと気持ちが割れてる。", "Between what?", "何と何で？", "Staying comfortable and trying something new.", "安心できる場所にいることと、新しいことに挑戦すること。"],
        ["困惑", "I don't know what to make of it.", "どう受け取ればいいか分からない時。", "I don't know what to make of it.", "それをどう受け取ればいいか分からない。", "It was a strange message.", "変なメッセージだったね。", "Exactly. It felt nice and cold at the same time.", "そう。優しいのに冷たくも感じた。"],
        ["困惑", "Something feels off.", "何か違和感がある時。", "Something feels off.", "何か違和感がある。", "With him?", "彼に？", "Yeah, he was too calm.", "うん、落ち着きすぎてた。"],
        ["困惑", "I'm confused, but I'm listening.", "混乱しているが話を聞く姿勢を示す。", "I'm confused, but I'm listening.", "混乱してるけど、聞いてるよ。", "I know this sounds messy.", "ごちゃごちゃに聞こえるのは分かってる。", "Just start from the beginning.", "最初から話して。"],
        ["緊張", "I'm nervous about this.", "これからのことに緊張している時。", "I'm nervous about this.", "これ、緊張する。", "You don't have to do it alone.", "一人でやらなくていいよ。", "Thanks. That helps.", "ありがとう。それ助かる。"],
        ["緊張", "My stomach is in knots.", "かなり緊張している時。", "My stomach is in knots.", "胃がキリキリする。", "Is it the interview?", "面接のこと？", "Yeah, I want it too much.", "うん、欲しすぎるんだ。"],
        ["緊張", "I'm trying to stay calm.", "落ち着こうとしている時。", "I'm trying to stay calm.", "落ち着こうとしてる。", "You're doing better than you think.", "思ってるよりうまくやれてるよ。", "I hope so.", "そうだといいな。"],
        ["緊張", "I keep overthinking it.", "考えすぎてしまう時。", "I keep overthinking it.", "ずっと考えすぎちゃう。", "What part?", "どの部分を？", "Every possible way it could go wrong.", "失敗する可能性全部。"],
        ["緊張", "I just need to get through today.", "今日を乗り切りたい時。", "I just need to get through today.", "今日はただ乗り切りたい。", "One thing at a time.", "一つずつでいいよ。", "Right. One thing at a time.", "そうだね。一つずつ。"],
        ["後悔", "I wish I had said something sooner.", "もっと早く言えばよかったと後悔する。", "I wish I had said something sooner.", "もっと早く言えばよかった。", "Why didn't you?", "なんで言わなかったの？", "I was scared it would make things worse.", "もっと悪くなるのが怖かった。"],
        ["後悔", "I should've handled that better.", "自分の対応を反省する。", "I should've handled that better.", "もっと上手く対応すべきだった。", "You were under pressure.", "プレッシャーがあったからね。", "Still, I hurt her.", "それでも彼女を傷つけた。"],
        ["後悔", "That wasn't my best moment.", "自分の良くない言動を認める。", "That wasn't my best moment.", "あれは良くなかった。", "At least you know that.", "少なくとも分かってるんだね。", "Yeah, and I need to fix it.", "うん、直さないと。"],
        ["後悔", "I hate that I did that.", "自分の行動を強く後悔する。", "I hate that I did that.", "あんなことした自分が嫌だ。", "Then apologize.", "じゃあ謝ろう。", "I will. I just need to do it right.", "そうする。ちゃんと謝りたい。"],
        ["後悔", "I can't stop thinking about it.", "後悔が頭から離れない時。", "I can't stop thinking about it.", "そのことが頭から離れない。", "What would help?", "何が助けになる？", "Maybe owning it instead of hiding.", "隠すんじゃなくて認めることかも。"],
        ["嬉しい", "That made my day.", "相手の言動で一日が良くなった時。", "That made my day.", "それで今日一日が良くなった。", "It was just a small thing.", "ほんの小さなことだよ。", "Not to me.", "僕にとっては違う。"],
        ["嬉しい", "I'm really happy for you.", "相手の良い出来事を心から喜ぶ。", "I'm really happy for you.", "本当に嬉しいよ。", "You mean that?", "本気で言ってる？", "Of course. You worked hard for this.", "もちろん。君はこれに向けて頑張ってた。"],
        ["嬉しい", "I'm glad I said yes.", "やってよかったと思った時。", "I'm glad I said yes.", "イエスって言ってよかった。", "To coming tonight?", "今夜来ることに？", "Yeah, I needed this.", "うん、これが必要だった。"],
        ["嬉しい", "This is exactly what I needed.", "今ほしかったものにぴったりだった時。", "This is exactly what I needed.", "これ、まさに今必要だった。", "A quiet walk?", "静かな散歩が？", "Yeah. And someone who doesn't rush me.", "うん。それと急かさない人。"],
        ["嬉しい", "I can't stop smiling.", "嬉しさが隠せない時。", "I can't stop smiling.", "笑顔が止まらない。", "Good news?", "いい知らせ？", "The best kind.", "最高のやつ。"]
      ]
    },
    {
      pack: "人間関係",
      prefix: "relation",
      items: [
        ["謝る", "I owe you an apology.", "自分からしっかり謝りたい時。", "I owe you an apology.", "君に謝らなきゃいけない。", "For yesterday?", "昨日のこと？", "Yeah. I was unfair to you.", "うん。君に対して不公平だった。"],
        ["謝る", "I shouldn't have said that.", "言ったことを後悔して謝る。", "I shouldn't have said that.", "あんなこと言うべきじゃなかった。", "It really hurt.", "本当に傷ついた。", "I know. I'm sorry.", "分かってる。ごめん。"],
        ["謝る", "I didn't handle that well.", "対応が悪かったと認める。", "I didn't handle that well.", "あれはうまく対応できなかった。", "I felt shut out.", "締め出された感じがした。", "That's on me.", "それは僕の責任だ。"],
        ["謝る", "I'm sorry I made you feel that way.", "相手の受け取り方に対して謝る。", "I'm sorry I made you feel that way.", "そう感じさせてごめん。", "Thank you for saying that.", "そう言ってくれてありがとう。", "I want to understand, not defend myself.", "自己弁護じゃなくて理解したい。"],
        ["謝る", "Let me make it right.", "埋め合わせしたい時。", "Let me make it right.", "ちゃんと埋め合わせさせて。", "How?", "どうやって？", "By listening first this time.", "今回はまず聞くことで。"],
        ["励ます", "You've got this.", "相手を短く励ます。", "You've got this.", "君ならできるよ。", "I don't feel ready.", "準備できてる気がしない。", "No one ever feels fully ready.", "完全に準備できてる人なんていないよ。"],
        ["励ます", "I'm proud of you for trying.", "挑戦したこと自体を認める。", "I'm proud of you for trying.", "挑戦してることを誇りに思うよ。", "Even if it doesn't work?", "うまくいかなくても？", "Especially then.", "むしろそういう時こそ。"],
        ["励ます", "You're stronger than you think.", "自信をなくした相手を励ます。", "You're stronger than you think.", "君は自分で思うより強いよ。", "I don't feel strong.", "強い気がしない。", "Strong people get tired too.", "強い人だって疲れるよ。"],
        ["励ます", "One step at a time.", "大きな問題に圧倒されている相手へ。", "One step at a time.", "一歩ずつでいいよ。", "There are too many things to fix.", "直すことが多すぎる。", "Then we pick one.", "じゃあ一つ選ぼう。"],
        ["励ます", "You don't have to be perfect.", "完璧を求めすぎる相手へ。", "You don't have to be perfect.", "完璧じゃなくていい。", "I know, but I keep trying to be.", "分かってるけど、そうしようとしてしまう。", "Maybe try being honest instead.", "代わりに正直でいることを試してみたら。"],
        ["境界線", "I need some space.", "少し距離や時間が必要な時。", "I need some space.", "少し距離が必要。", "Did I do something wrong?", "僕が何か悪いことした？", "No. I just need to reset.", "違う。ただ立て直す時間が必要。"],
        ["境界線", "I'm not comfortable with that.", "嫌なことをはっきり伝える。", "I'm not comfortable with that.", "それはちょっと嫌だ。", "Thanks for telling me.", "言ってくれてありがとう。", "I didn't want to pretend it was fine.", "平気なふりはしたくなかった。"],
        ["境界線", "I can't do that right now.", "今は無理だと伝える。", "I can't do that right now.", "今はそれできない。", "Too much going on?", "いろいろありすぎる？", "Yeah, and I need to be honest about my limit.", "うん、自分の限界に正直でいたい。"],
        ["境界線", "Please don't put me in the middle.", "板挟みにしないでほしい時。", "Please don't put me in the middle.", "僕を板挟みにしないで。", "I didn't mean to.", "そのつもりじゃなかった。", "I know, but that's how it feels.", "分かってる。でもそう感じる。"],
        ["境界線", "I need you to respect that.", "自分の決断を尊重してほしい時。", "I need you to respect that.", "それは尊重してほしい。", "Even if I disagree?", "賛成できなくても？", "Especially then.", "そういう時こそ。"],
        ["本音", "Can I be honest with you?", "本音を言う前置き。", "Can I be honest with you?", "正直に言っていい？", "Please do.", "言って。", "I felt like you weren't really listening.", "君がちゃんと聞いてない気がした。"],
        ["本音", "I don't want to pretend I'm fine.", "平気なふりをやめたい時。", "I don't want to pretend I'm fine.", "平気なふりはしたくない。", "Then don't.", "じゃあしなくていい。", "I'm hurt, and I need you to know that.", "傷ついてる。それを知ってほしい。"],
        ["本音", "This matters to me.", "自分にとって大切だと伝える。", "This matters to me.", "これは僕にとって大事なんだ。", "I didn't realize it was that important.", "そんなに大事だと思ってなかった。", "It is. That's why I'm bringing it up.", "大事なんだ。だから話してる。"],
        ["本音", "I need you to hear me out.", "最後まで聞いてほしい時。", "I need you to hear me out.", "最後まで聞いてほしい。", "Okay. I won't interrupt.", "分かった。遮らない。", "Thank you. This is hard to say.", "ありがとう。これは言いにくい。"],
        ["本音", "I'm scared this will change us.", "関係が変わることへの不安を伝える。", "I'm scared this will change us.", "これで僕らが変わるのが怖い。", "Maybe it will.", "変わるかもね。", "I just hope it doesn't break us.", "壊れないといいな。"],
        ["誤解", "That's not what I meant.", "誤解をすぐ修正する。", "That's not what I meant.", "そういう意味じゃない。", "Then explain it to me.", "じゃあ説明して。", "I meant I was overwhelmed, not uninterested.", "興味がないんじゃなくて、いっぱいいっぱいだったってこと。"],
        ["誤解", "I think we're misunderstanding each other.", "お互いに誤解している時。", "I think we're misunderstanding each other.", "お互い誤解してると思う。", "Maybe we are.", "そうかも。", "Can we slow down and try again?", "少し落ち着いてやり直せる？"],
        ["誤解", "I see why it sounded that way.", "相手がそう受け取った理由を認める。", "I see why it sounded that way.", "そう聞こえた理由は分かる。", "But you didn't mean it?", "でもそういう意味じゃなかった？", "No. I should've chosen better words.", "違う。もっと言葉を選ぶべきだった。"],
        ["誤解", "Let me clear that up.", "誤解を解きたい時。", "Let me clear that up.", "そこをはっきりさせて。", "Please.", "お願い。", "I was upset with the situation, not with you.", "君に怒ってたんじゃなくて、状況に腹が立ってた。"],
        ["誤解", "We're talking past each other.", "話が噛み合っていない時。", "We're talking past each other.", "話が噛み合ってない。", "Yeah, I can feel that.", "うん、それは感じる。", "Let's start with what we both agree on.", "まずお互い同意できるところから始めよう。"],
        ["断る", "I'll pass this time.", "今回はやめておくと軽く断る。", "I'll pass this time.", "今回はやめておくよ。", "Everything okay?", "大丈夫？", "Yeah, I just need a quiet night.", "うん、静かな夜が必要なだけ。"],
        ["断る", "Maybe another time.", "別の機会にしたい時。", "Maybe another time.", "また別の時にしよう。", "No worries.", "大丈夫。", "I do want to go, just not tonight.", "行きたくないわけじゃなくて、今夜じゃないだけ。"],
        ["断る", "I'm not really up for it.", "気分が乗らない時。", "I'm not really up for it.", "あまり気分じゃない。", "Want to stay in?", "家にいる？", "Yeah, that sounds better.", "うん、そのほうがよさそう。"],
        ["断る", "I don't think I can commit to that.", "約束しきれない時。", "I don't think I can commit to that.", "それは約束しきれないと思う。", "Because of work?", "仕事のせい？", "Yeah, my schedule is too unpredictable.", "うん、予定が読めなさすぎる。"],
        ["断る", "I need to say no to this.", "はっきり断る必要がある時。", "I need to say no to this.", "これは断らなきゃ。", "I understand.", "分かった。", "Thanks. I was nervous to say it.", "ありがとう。言うの緊張してた。"]
      ]
    },
    {
      pack: "リアル口語",
      prefix: "slang",
      items: [
        ["本音の前置き", "Not gonna lie...", "本音をカジュアルに言い始める。", "Not gonna lie, that was awkward.", "正直、あれは気まずかった。", "I felt it too.", "僕も感じた。", "Good, so it wasn't just me.", "よかった、僕だけじゃなかったんだ。"],
        ["本音の前置き", "Honestly, though...", "少し本音に寄せて話す。", "Honestly, though, I'm glad you came.", "でも正直、来てくれて嬉しい。", "I almost didn't.", "来ないところだった。", "Then I'm even more glad.", "じゃあなおさら嬉しい。"],
        ["本音の前置き", "To be fair...", "相手や状況に公平な見方を足す。", "To be fair, she did warn us.", "公平に言うと、彼女は警告してたよ。", "Yeah, we ignored her.", "うん、僕らが無視した。", "And now we're paying for it.", "それで今ツケが回ってきた。"],
        ["本音の前置き", "I'm just saying...", "強く主張しすぎずに一言添える。", "I'm just saying, it looked intentional.", "ただ言うけど、わざとに見えたよ。", "You think so?", "そう思う？", "A little, yeah.", "少しね。"],
        ["本音の前置き", "For what it's worth...", "控えめに自分の意見を出す。", "For what it's worth, I think you did the right thing.", "参考までに言うと、君は正しいことをしたと思う。", "I needed to hear that.", "それを聞きたかった。", "Then I'm glad I said it.", "じゃあ言ってよかった。"],
        ["軽い同意", "Pretty much.", "だいたいそう、と軽く同意する。", "So you just left?", "つまりそのまま帰ったの？", "Pretty much.", "だいたいそんな感じ。", "Honestly, I don't blame you.", "正直、責められないよ。"],
        ["軽い同意", "I mean, yeah.", "少し考えつつ同意する。", "Do you still like her?", "まだ彼女のこと好きなの？", "I mean, yeah.", "まあ、うん。", "Then maybe you should tell her.", "じゃあ伝えたほうがいいかも。"],
        ["軽い同意", "Yeah, kind of.", "少しだけ認める。", "Are you nervous?", "緊張してる？", "Yeah, kind of.", "うん、ちょっと。", "That's normal.", "普通だよ。"],
        ["軽い同意", "That's fair.", "相手の言い分を認める。", "I don't want to talk tonight.", "今夜は話したくない。", "That's fair.", "それは分かる。", "Can we try tomorrow?", "明日話せる？"],
        ["軽い同意", "You're not wrong.", "相手の指摘が当たっている時。", "You avoid hard conversations.", "君は難しい会話を避けるよね。", "You're not wrong.", "間違ってはない。", "I just wish you wouldn't.", "ただ、そうしないでほしい。"],
        ["ツッコミ", "That's bold.", "大胆な発言や行動に反応する。", "I told him exactly what I thought.", "思ったことをそのまま言った。", "That's bold.", "それは大胆だね。", "Maybe too bold.", "大胆すぎたかも。"],
        ["ツッコミ", "Okay, dramatic.", "少し大げさな相手に軽くツッコむ。", "My life is over.", "人生終わった。", "Okay, dramatic.", "はいはい、大げさ。", "Fine, my evening is over.", "分かった、今夜が終わっただけ。"],
        ["ツッコミ", "That's on you.", "それは君の責任だと軽く言う。", "I stayed up until three again.", "また3時まで起きてた。", "That's on you.", "それは自分のせいでしょ。", "I know, but I regret it.", "分かってる。でも後悔してる。"],
        ["ツッコミ", "You walked into that one.", "自分でツッコミどころを作った相手へ。", "I said I never forget things, then forgot my wallet.", "物忘れしないって言って財布忘れた。", "You walked into that one.", "自分でそこに突っ込んでいったね。", "I know. I deserve this.", "分かってる。これは言われても仕方ない。"],
        ["ツッコミ", "Make it make sense.", "意味が分からないことにツッコむ。", "He canceled because he was too early.", "早すぎるからキャンセルしたって。", "Make it make sense.", "意味が分かるように説明して。", "I can't. That's the problem.", "無理。それが問題。"],
        ["ぼかし", "Low-key...", "控えめだけど本音を言う。", "Low-key, I miss hanging out with everyone.", "正直ちょっと、みんなで遊ぶの恋しい。", "Me too.", "僕も。", "We should plan something small.", "小さく何か計画しよう。"],
        ["ぼかし", "Kind of a lot.", "思ったより程度が大きい時。", "Did it bother you?", "それ気になった？", "Kind of a lot.", "かなりね。", "I didn't realize.", "気づかなかった。"],
        ["ぼかし", "A bit much.", "やりすぎ・強すぎに感じた時。", "Was my message too long?", "メッセージ長すぎた？", "A bit much.", "ちょっと重かった。", "Okay, I'll trim it down.", "分かった、短くする。"],
        ["ぼかし", "It's giving...", "雰囲気をカジュアルに表す。", "It's giving first-date nerves.", "初デートの緊張って感じ。", "Is it that obvious?", "そんなに分かりやすい？", "Only a little.", "少しだけ。"],
        ["ぼかし", "More or less.", "だいたいそう、とざっくり答える。", "So the plan worked?", "じゃあ計画はうまくいった？", "More or less.", "だいたいね。", "That sounds suspicious.", "それ怪しい言い方だね。"],
        ["ノリ", "I'm down.", "誘いに乗る時。", "Want to grab food after this?", "このあと何か食べに行く？", "I'm down.", "いいよ。", "Cool, I know a place.", "よし、いい場所知ってる。"],
        ["ノリ", "Say less.", "それ以上言わなくても乗る、という時。", "There's a new taco place nearby.", "近くに新しいタコス屋がある。", "Say less.", "それ以上言わなくていい。", "I figured that would work.", "そう言えば乗ると思った。"],
        ["ノリ", "I'm in.", "参加すると言う時。", "We're doing karaoke Friday.", "金曜カラオケ行くよ。", "I'm in.", "参加する。", "You didn't even ask what time.", "時間も聞いてないじゃん。"],
        ["ノリ", "Bet.", "了解・いいねのカジュアル表現。", "Meet me downstairs in ten.", "10分後に下で会おう。", "Bet.", "了解。", "And don't be late.", "あと遅れないで。"],
        ["ノリ", "Sounds like a plan.", "提案に賛成する。", "Coffee first, then the movie?", "先にコーヒー、それから映画？", "Sounds like a plan.", "それでいこう。", "Great. I'll get tickets.", "よし。チケット取るね。"],
        ["近況", "Same old, same old.", "近況を聞かれて特に変わらない時。", "How have you been?", "最近どう？", "Same old, same old.", "相変わらずだよ。", "That sounds both good and sad.", "良くも悲しくも聞こえるね。"],
        ["近況", "Can't complain.", "まあ悪くないと答える。", "How's work?", "仕事どう？", "Can't complain.", "悪くないよ。", "That's better than usual.", "いつもより良さそうだね。"],
        ["近況", "I've been better.", "あまり調子が良くない時。", "You okay?", "大丈夫？", "I've been better.", "もっと良い時もあった。", "Want to talk about it?", "話したい？"],
        ["近況", "It's been a lot.", "いろいろ大変だった時。", "How was your week?", "今週どうだった？", "It's been a lot.", "いろいろありすぎた。", "Then dinner is on me.", "じゃあ夕食は僕がおごる。"],
        ["近況", "I'm getting there.", "まだ途中だけど良くなっている時。", "Are you feeling better?", "気分良くなってきた？", "I'm getting there.", "少しずつね。", "Good. No pressure.", "よかった。無理しないで。"]
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
