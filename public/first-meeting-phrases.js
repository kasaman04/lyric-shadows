window.CONVERSATION_PHRASES = window.CONVERSATION_PHRASES || [];

(() => {
  const pack = "初対面";
  const prefix = "first-meet";
  const items = [
    ["最初の一言", "It's nice to finally meet you.", "オンラインや紹介後に、初めて直接会った時。", "It's nice to finally meet you.", "やっと会えて嬉しいです。", "Yeah, same here.", "うん、こちらこそ。", "I've heard a lot about you.", "あなたのことはよく聞いていました。"],
    ["最初の一言", "Thanks for making time today.", "会う時間を作ってくれた相手に感謝する。", "Thanks for making time today.", "今日は時間を作ってくれてありがとう。", "Of course. I'm glad we could do this.", "もちろん。こうして会えてよかったです。", "Me too. I've been looking forward to it.", "僕も。楽しみにしていました。"],
    ["最初の一言", "I'm glad this worked out.", "予定が合って会えたことを喜ぶ。", "I'm glad this worked out.", "予定が合ってよかったです。", "Same. It took us a while.", "同じく。少しかかりましたね。", "Yeah, but we made it happen.", "うん、でも実現しましたね。"],
    ["最初の一言", "I hope I didn't keep you waiting.", "待たせたか気になる時。", "I hope I didn't keep you waiting.", "待たせてなければいいんですが。", "Not at all. I just got here.", "全然。今来たところです。", "Perfect. Good timing, then.", "よかった。じゃあちょうどいいタイミングですね。"],
    ["最初の一言", "This place is easier to find than I expected.", "待ち合わせ場所などで自然に始める。", "This place is easier to find than I expected.", "ここ、思ったより見つけやすかったです。", "Right? I was worried it might be confusing.", "ですよね。分かりにくいかもって心配してました。", "No, it was a good choice.", "いや、いい場所でした。"],
    ["最初の一言", "I'm a little early, I guess.", "少し早く着いた時の軽い一言。", "I'm a little early, I guess.", "少し早かったみたいです。", "That's better than being late.", "遅れるよりいいですよ。", "True. I was too nervous to wait at home.", "たしかに。緊張して家で待てませんでした。"],
    ["最初の一言", "I wasn't sure what to expect.", "初対面で少し緊張していることを自然に出す。", "I wasn't sure what to expect.", "どんな感じか分からなかったです。", "Same, honestly.", "正直、僕もです。", "Well, this already feels easier than I thought.", "でも、思ったより話しやすそうです。"],
    ["最初の一言", "It's good to put a face to the name.", "名前だけ知っていた相手に初めて会う時。", "It's good to put a face to the name.", "名前と顔がつながってよかったです。", "I know what you mean.", "分かります。", "Now you're not just a name in my phone.", "これでただの連絡先の名前じゃなくなりました。"],
    ["最初の一言", "I like your energy already.", "最初の印象が良い時に軽く伝える。", "I like your energy already.", "もう雰囲気いいですね。", "That's a nice first impression.", "いい第一印象ですね。", "I mean it. You seem easy to talk to.", "本当です。話しやすそう。"],
    ["最初の一言", "This is less awkward than I imagined.", "気まずさを軽く笑いに変える。", "This is less awkward than I imagined.", "思ってたより気まずくないですね。", "You imagined it being awkward?", "気まずいと思ってたんですか？", "A little. First meetings can be weird.", "少し。初対面って変な感じになることもあるから。"],

    ["自然な自己紹介", "I do a bit of design work.", "仕事や活動をざっくり説明する。", "I do a bit of design work.", "少しデザイン系の仕事をしています。", "Oh, what kind?", "へえ、どんなものですか？", "Mostly websites and small brand projects.", "主にWebサイトや小さなブランド案件です。"],
    ["自然な自己紹介", "I'm originally from Tokyo.", "出身地を自然に話す。", "I'm originally from Tokyo.", "出身は東京です。", "Do you still live there?", "今もそこに住んでるんですか？", "No, I moved a few years ago.", "いえ、数年前に引っ越しました。"],
    ["自然な自己紹介", "I've been living here for a few years.", "住んでいる期間を話す。", "I've been living here for a few years.", "ここには数年住んでいます。", "Do you like it?", "気に入っていますか？", "Yeah, it feels like home now.", "はい、今はもう家みたいな感じです。"],
    ["自然な自己紹介", "I'm kind of into music lately.", "最近ハマっているものを話す。", "I'm kind of into music lately.", "最近ちょっと音楽にハマっています。", "What kind of music?", "どんな音楽ですか？", "Mostly rock, but I'm open to anything.", "主にロックですが、何でも聴きます。"],
    ["自然な自己紹介", "I usually keep things pretty low-key.", "自分の性格や過ごし方を軽く話す。", "I usually keep things pretty low-key.", "普段はわりと落ち着いた感じで過ごしています。", "That sounds nice.", "いいですね。", "Yeah, I like quiet places more than loud ones.", "はい、にぎやかな場所より静かな場所が好きです。"],
    ["自然な自己紹介", "I'm not the best at talking about myself.", "自己紹介が苦手なことを自然に言う。", "I'm not the best at talking about myself.", "自分のことを話すのはあまり得意じゃないです。", "That's okay. We can keep it easy.", "大丈夫です。気楽にいきましょう。", "I appreciate that.", "助かります。"],
    ["自然な自己紹介", "I spend a lot of time working on small projects.", "普段の活動を話す。", "I spend a lot of time working on small projects.", "小さなプロジェクトに時間を使うことが多いです。", "Like creative projects?", "クリエイティブ系ですか？", "Yeah, mostly things I can build myself.", "はい、自分で作れるものが多いです。"],
    ["自然な自己紹介", "I'm trying to get better at English conversation.", "英会話学習中であることを伝える。", "I'm trying to get better at English conversation.", "英会話をもっと上達させようとしています。", "You're doing fine.", "ちゃんと話せてますよ。", "Thanks. I'm still nervous, though.", "ありがとう。でもまだ緊張します。"],
    ["自然な自己紹介", "I'm more of a listener at first.", "最初は聞き役になりがちな性格を伝える。", "I'm more of a listener at first.", "最初は聞き役になることが多いです。", "I can work with that.", "それでも大丈夫です。", "Good. I warm up eventually.", "よかった。だんだん慣れてきます。"],
    ["自然な自己紹介", "I like learning how people think.", "人に興味があることを自然に伝える。", "I like learning how people think.", "人がどう考えるかを知るのが好きです。", "That's an interesting answer.", "面白い答えですね。", "I guess I'm curious about people.", "たぶん人に興味があるんです。"],

    ["相手に質問する", "How do you know everyone here?", "集まりやイベントで関係性を聞く。", "How do you know everyone here?", "ここの人たちとはどういう知り合いですか？", "Mostly through work.", "主に仕事つながりです。", "That makes sense. It seems like a close group.", "なるほど。仲が良さそうなグループですね。"],
    ["相手に質問する", "What got you into that?", "相手の趣味や仕事に興味を持つ。", "What got you into that?", "それを始めたきっかけは何ですか？", "A friend introduced me to it.", "友達に紹介されたんです。", "That's usually how the best hobbies start.", "いい趣味ってだいたいそうやって始まりますよね。"],
    ["相手に質問する", "How long have you been doing that?", "相手の経験年数を自然に聞く。", "How long have you been doing that?", "それはどれくらいやってるんですか？", "About three years now.", "もう3年くらいです。", "That's long enough to get pretty good.", "それだけやってたらかなり上手そうですね。"],
    ["相手に質問する", "What do you usually do on weekends?", "休日の過ごし方を聞く。", "What do you usually do on weekends?", "週末は普段何をしていますか？", "It depends, but I like going out for coffee.", "時によりますが、コーヒーを飲みに行くのが好きです。", "That's a solid weekend plan.", "いい週末の過ごし方ですね。"],
    ["相手に質問する", "Have you always been into that?", "昔から好きだったのか聞く。", "Have you always been into that?", "それは昔から好きだったんですか？", "Not really. I got into it recently.", "そうでもないです。最近ハマりました。", "Those are sometimes the most fun.", "そういうのって一番楽しかったりしますよね。"],
    ["相手に質問する", "What's been keeping you busy lately?", "最近忙しい理由をやわらかく聞く。", "What's been keeping you busy lately?", "最近は何で忙しいんですか？", "Mostly work, but I'm trying to make time for friends.", "主に仕事ですが、友達との時間も作ろうとしています。", "That's a good balance to aim for.", "それはいいバランスですね。"],
    ["相手に質問する", "Do you come here often?", "場所について自然に聞く。", "Do you come here often?", "ここにはよく来るんですか？", "A few times, yeah.", "何回か来たことあります。", "Good sign. I chose the right place.", "いいですね。場所選び正解でした。"],
    ["相手に質問する", "What kind of places do you like?", "相手の好みを聞く。", "What kind of places do you like?", "どんな場所が好きですか？", "Somewhere calm, not too crowded.", "落ち着いていて、混みすぎてない場所です。", "Same. I like being able to actually talk.", "同じです。ちゃんと話せる場所が好きです。"],
    ["相手に質問する", "What's something you've been enjoying lately?", "最近楽しんでいることを聞く。", "What's something you've been enjoying lately?", "最近楽しんでいることはありますか？", "I've been cooking more.", "料理をすることが増えました。", "That's cool. What do you like making?", "いいですね。何を作るのが好きですか？"],
    ["相手に質問する", "Are you more of a morning person or a night person?", "軽い性格質問で会話を広げる。", "Are you more of a morning person or a night person?", "朝型ですか？夜型ですか？", "Definitely a night person.", "完全に夜型です。", "I had a feeling.", "そんな気がしました。"],
    ["相手に質問する", "What made you say yes to meeting today?", "会うことにした理由を聞く。", "What made you say yes to meeting today?", "今日会おうと思った理由は何ですか？", "You seemed easy to talk to.", "話しやすそうだったからです。", "That's actually really nice to hear.", "それはすごく嬉しいです。"],
    ["相手に質問する", "What's your usual coffee order?", "カフェで使いやすい軽い質問。", "What's your usual coffee order?", "いつものコーヒー注文は何ですか？", "Usually a latte.", "だいたいラテです。", "Classic choice. Hard to go wrong.", "定番ですね。外しにくい。"],
    ["相手に質問する", "Do you like trying new things?", "新しいものへの好みを聞く。", "Do you like trying new things?", "新しいことを試すのは好きですか？", "Sometimes, if I trust the person suggesting it.", "時々。すすめる人を信頼できれば。", "That's a very reasonable answer.", "すごく納得できる答えですね。"],
    ["相手に質問する", "What are you usually like when you first meet someone?", "初対面での性格を聞く。", "What are you usually like when you first meet someone?", "初対面の時って普段どんな感じですか？", "A little quiet at first.", "最初は少し静かです。", "Same. I need a little warm-up time.", "同じです。少し慣れる時間が必要です。"],
    ["相手に質問する", "What's something people usually get wrong about you?", "少し深めに相手を知る質問。", "What's something people usually get wrong about you?", "人に誤解されがちなことはありますか？", "People think I'm serious all the time.", "いつも真面目だと思われます。", "And are you?", "実際は？"],

    ["会話を広げる", "What was that like?", "相手の経験を詳しく聞く。", "What was that like?", "それはどんな感じだったんですか？", "Honestly, a little overwhelming.", "正直、少し圧倒されました。", "I can imagine. It sounds intense.", "想像できます。かなり大変そう。"],
    ["会話を広げる", "How did that happen?", "出来事の流れを聞く。", "How did that happen?", "どうしてそうなったんですか？", "It started as a small idea.", "小さなアイデアから始まったんです。", "Those always turn into something bigger.", "そういうのって大きくなりがちですよね。"],
    ["会話を広げる", "Tell me more about that.", "もっと聞きたい時。", "Tell me more about that.", "それ、もう少し聞かせてください。", "Really? It's kind of random.", "本当に？ちょっと変な話ですよ。", "Random stories are usually the best ones.", "変な話ほど面白いです。"],
    ["会話を広げる", "That sounds interesting.", "相手の話に自然に興味を示す。", "That sounds interesting.", "それ面白そうですね。", "It is, once you get into it.", "ハマると面白いです。", "Now I'm curious.", "気になってきました。"],
    ["会話を広げる", "What happened next?", "相手の話の続きを促す。", "What happened next?", "それで次に何が起きたんですか？", "That's the funny part.", "そこが面白いところです。", "Okay, now you have to tell me.", "それは聞かないといけないですね。"],
    ["会話を広げる", "How did you feel about it?", "出来事に対する感情を聞く。", "How did you feel about it?", "それについてどう感じましたか？", "Confused at first, then excited.", "最初は混乱して、そのあとワクワクしました。", "That's a good combination sometimes.", "それって時々いい組み合わせですね。"],
    ["会話を広げる", "Would you do it again?", "経験をもう一度したいか聞く。", "Would you do it again?", "もう一回やりたいですか？", "Maybe, but differently.", "たぶん。でも違うやり方で。", "That's usually how you know you learned something.", "何か学んだ証拠ですね。"],
    ["会話を広げる", "What's the best part of it?", "相手の好きなポイントを聞く。", "What's the best part of it?", "それの一番いいところは何ですか？", "You meet all kinds of people.", "いろんな人に会えることです。", "That sounds like something you'd be good at.", "それ、あなた得意そうですね。"],
    ["会話を広げる", "What's the hardest part?", "大変な部分を聞く。", "What's the hardest part?", "一番大変なところは何ですか？", "Not taking things personally.", "個人的に受け取りすぎないことです。", "That's hard in any situation.", "それはどんな状況でも難しいですね。"],
    ["会話を広げる", "How did you get used to it?", "慣れた方法を聞く。", "How did you get used to it?", "どうやって慣れたんですか？", "I didn't at first. I just kept showing up.", "最初は慣れませんでした。ただ続けました。", "That's honestly impressive.", "それは本当にすごいです。"],
    ["会話を広げる", "What surprised you the most?", "一番驚いたことを聞く。", "What surprised you the most?", "一番驚いたことは何ですか？", "How kind people were.", "人がすごく親切だったことです。", "That's a nice surprise.", "それはいい驚きですね。"],
    ["会話を広げる", "Was it what you expected?", "期待通りだったか聞く。", "Was it what you expected?", "予想通りでしたか？", "Not at all, actually.", "実は全然違いました。", "Now I want the story.", "それは話を聞きたくなります。"],
    ["会話を広げる", "What would you recommend?", "相手のおすすめを聞く。", "What would you recommend?", "何がおすすめですか？", "Start small and don't overthink it.", "小さく始めて、考えすぎないことです。", "That advice works for a lot of things.", "それ、いろんなことに効くアドバイスですね。"],
    ["会話を広げる", "How did you decide?", "決断の理由を聞く。", "How did you decide?", "どうやって決めたんですか？", "I went with what felt calmer.", "より落ち着く方を選びました。", "I like that way of choosing.", "その選び方いいですね。"],
    ["会話を広げる", "What's the story there?", "背景や理由を聞く。", "What's the story there?", "そこにはどんな話があるんですか？", "It's kind of a long one.", "ちょっと長い話です。", "I don't mind. I'm curious.", "大丈夫です。気になります。"],

    ["共通点を見つける", "I'm the same way.", "自分も同じだと伝える。", "I'm the same way.", "僕も同じタイプです。", "Really? I thought I was the only one.", "本当に？自分だけかと思ってました。", "No, I do that all the time.", "いや、僕もいつもそうです。"],
    ["共通点を見つける", "We might have that in common.", "共通点がありそうな時。", "We might have that in common.", "そこは共通してるかもしれません。", "The quiet places thing?", "静かな場所が好きってこと？", "Yeah. Loud places drain me fast.", "はい。にぎやかな場所はすぐ疲れます。"],
    ["共通点を見つける", "I've been meaning to try that.", "相手の趣味に興味を示す。", "I've been meaning to try that.", "それ、前から試してみたかったんです。", "You should. It's easier than it looks.", "やってみるべきです。見た目より簡単ですよ。", "Then I might ask you for tips.", "じゃあコツを聞くかもしれません。"],
    ["共通点を見つける", "I know exactly what you mean.", "相手の感覚に強く共感する。", "I know exactly what you mean.", "言ってることすごく分かります。", "You get that feeling too?", "君もそう感じる？", "Yeah, especially in big groups.", "はい、特に大人数だと。"],
    ["共通点を見つける", "That's my kind of day.", "相手の理想の過ごし方に共感する。", "That's my kind of day.", "それ、僕の好きな一日です。", "Coffee and no plans?", "コーヒーと予定なし？", "Exactly. Perfect.", "その通り。完璧です。"],
    ["共通点を見つける", "I was just thinking that.", "同じことを考えていた時。", "I was just thinking that.", "ちょうど同じこと考えてました。", "That's a good sign.", "いい兆候ですね。", "Or we're both overthinking.", "もしくは二人とも考えすぎですね。"],
    ["共通点を見つける", "I'm glad you said that.", "同じ気持ちを相手が先に言ってくれた時。", "I'm glad you said that.", "それ言ってくれて嬉しいです。", "Why?", "どうして？", "Because I felt the same but wasn't sure if I should say it.", "同じことを感じてたけど、言っていいか分からなかったから。"],
    ["共通点を見つける", "That makes two of us.", "自分も同じだと軽く返す。", "I'm terrible with names.", "名前を覚えるのが苦手です。", "That makes two of us.", "僕もです。", "Then we should both get a pass.", "じゃあ二人とも許されるべきですね。"],
    ["共通点を見つける", "We're off to a good start.", "共通点が見つかっていい流れの時。", "We're off to a good start.", "いいスタートですね。", "Because we both like quiet cafes?", "二人とも静かなカフェが好きだから？", "That's enough for me.", "僕にはそれで十分です。"],
    ["共通点を見つける", "I can relate to that.", "相手の経験に共感する。", "I can relate to that.", "それは共感できます。", "You've been through something similar?", "似た経験がありますか？", "Yeah, more than once.", "はい、一度以上あります。"],

    ["気まずさを防ぐ", "I'm a little nervous, honestly.", "緊張していることを正直に言う。", "I'm a little nervous, honestly.", "正直、少し緊張しています。", "That's kind of comforting.", "それ、ちょっと安心します。", "Good, because I wasn't hiding it well.", "よかった。全然隠せてなかったので。"],
    ["気まずさを防ぐ", "I'm not great at small talk.", "雑談が得意ではないと軽く言う。", "I'm not great at small talk.", "雑談はあまり得意じゃないです。", "Me neither, actually.", "実は僕もです。", "Perfect. Then we can skip the fake part.", "完璧ですね。じゃあ作り物っぽい部分は飛ばせます。"],
    ["気まずさを防ぐ", "Sorry, I totally lost my train of thought.", "話している途中で何を言うか忘れた時。", "Sorry, I totally lost my train of thought.", "ごめんなさい、何を言おうとしたか完全に忘れました。", "That happens to me all the time.", "それ、僕もしょっちゅうあります。", "Okay, good. I feel less alone.", "よかった。自分だけじゃなくて安心しました。"],
    ["気まずさを防ぐ", "This is my first-meeting brain.", "初対面で頭が回らないことを冗談っぽく言う。", "This is my first-meeting brain.", "これ、初対面モードの脳です。", "I like that excuse.", "その言い訳いいですね。", "Feel free to use it.", "ぜひ使ってください。"],
    ["気まずさを防ぐ", "If I seem quiet, I'm just warming up.", "静かな理由を先に伝える。", "If I seem quiet, I'm just warming up.", "静かに見えたら、ただ慣れてる途中です。", "That's good to know.", "知れてよかったです。", "I promise I get more normal.", "そのうちもっと普通になります。"],
    ["気まずさを防ぐ", "No pressure to answer if that's too personal.", "個人的すぎる質問かもしれない時。", "No pressure to answer if that's too personal.", "個人的すぎたら答えなくて大丈夫です。", "No, it's okay.", "いえ、大丈夫です。", "Cool. I didn't want to overstep.", "よかった。踏み込みすぎたくなかったので。"],
    ["気まずさを防ぐ", "Was that too direct?", "直接的すぎたか確認する。", "Was that too direct?", "今の、直接的すぎましたか？", "A little, but not in a bad way.", "少し。でも悪い意味ではないです。", "Okay, I'll take that.", "分かりました。それならよかったです。"],
    ["気まずさを防ぐ", "We can change the subject if you want.", "相手が話しにくそうな時。", "We can change the subject if you want.", "よければ話題変えましょうか。", "Thanks, maybe for a second.", "ありがとう。少しだけそうしたいかも。", "Of course. What's a safer topic?", "もちろん。もっと安全な話題は何ですか？"],
    ["気まずさを防ぐ", "I didn't mean to make that awkward.", "自分の発言で気まずくしたかもしれない時。", "I didn't mean to make that awkward.", "気まずくするつもりじゃなかったです。", "You didn't. I was just thinking.", "してないですよ。ただ考えてただけです。", "Okay, I was worried for a second.", "よかった。一瞬心配しました。"],
    ["気まずさを防ぐ", "Let's blame the first-meeting nerves.", "初対面の緊張のせいにして空気を軽くする。", "Let's blame the first-meeting nerves.", "初対面の緊張のせいにしましょう。", "That seems fair.", "それはありですね。", "Great. We have a shared excuse now.", "よし、共通の言い訳ができました。"],

    ["別れ際", "It was really nice talking with you.", "会話の最後に好印象を伝える。", "It was really nice talking with you.", "話せて本当に楽しかったです。", "Yeah, I had a good time too.", "うん、僕も楽しかったです。", "I'm glad we got to meet.", "会えてよかったです。"],
    ["別れ際", "I'm glad we finally did this.", "やっと会えたことを締めに伝える。", "I'm glad we finally did this.", "やっと会えてよかったです。", "Same. It felt easier than I expected.", "同じです。思ったより自然でした。", "Yeah, in a good way.", "うん、いい意味で。"],
    ["別れ際", "Let's keep in touch.", "連絡を続けたい時。", "Let's keep in touch.", "また連絡取りましょう。", "I'd like that.", "そうしたいです。", "Cool. I'll message you later.", "よかった。あとでメッセージします。"],
    ["別れ際", "We should do this again sometime.", "また会いたい時。", "We should do this again sometime.", "また今度こうしましょう。", "I'd be up for that.", "いいですね。", "Great. No pressure, but I'd like to.", "よかった。無理にではないけど、また会いたいです。"],
    ["別れ際", "I had more fun than I expected.", "予想以上に楽しかった時。", "I had more fun than I expected.", "思ったよりずっと楽しかったです。", "Is that a compliment?", "それは褒め言葉ですか？", "Definitely. A slightly awkward one.", "もちろん。少し不器用な褒め言葉です。"],
    ["別れ際", "Thanks for being easy to talk to.", "話しやすかったことに感謝する。", "Thanks for being easy to talk to.", "話しやすくしてくれてありがとう。", "You made it easy too.", "君も話しやすかったよ。", "That's good to hear.", "そう聞けてよかったです。"],
    ["別れ際", "I don't want to keep you too long.", "相手の時間を気遣って終える。", "I don't want to keep you too long.", "あまり長く引き止めたくないので。", "I appreciate that.", "気遣いありがとう。", "But I did enjoy this.", "でも楽しかったです。"],
    ["別れ際", "Text me when you get home.", "帰宅後の連絡をやさしく促す。", "Text me when you get home.", "家に着いたらメッセージしてください。", "That's sweet. I will.", "優しいですね。そうします。", "Good. Just so I know you're safe.", "よかった。無事だと知りたいので。"],
    ["別れ際", "This was a good first meeting.", "初対面が良かったと伝える。", "This was a good first meeting.", "いい初対面でしたね。", "I agree.", "同感です。", "That's a relief. First meetings can go either way.", "安心しました。初対面ってどっちにも転びますから。"],
    ["別れ際", "I'm leaving with a good impression.", "良い印象で終わったことを伝える。", "I'm leaving with a good impression.", "いい印象で帰れそうです。", "That's a really nice thing to say.", "それ、すごく嬉しいです。", "Good. I meant it.", "よかった。本心です。"]
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
