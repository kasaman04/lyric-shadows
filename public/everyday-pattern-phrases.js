window.CONVERSATION_PHRASES = window.CONVERSATION_PHRASES || [];

// Candidate numbers correspond to data/everyday-conversation-patterns.md.
// Existing cards already cover the omitted patterns.
(() => {
  const items = [
    [2, "記憶・予定を確認する", "Weren't you going to call her?", "Weren't you going to ...? 相手が以前話していた予定を確認する。", "I haven't told Mia yet.", "まだミアに伝えてないんだ。", "Weren't you going to call her?", "彼女に電話する予定じゃなかったっけ？", "I was, but I got nervous.", "そうだったんだけど、緊張しちゃって。"],
    [3, "記憶・予定を確認する", "I thought you already knew.", "I thought you ... は、自分がそう思っていたことを伝える。", "Wait, Sam's moving?", "待って、サム引っ越すの？", "I thought you already knew.", "もう知ってると思ってた。", "No, this is the first I've heard of it.", "いや、今初めて聞いたよ。"],
    [4, "記憶・予定を確認する", "I thought we were meeting at six.", "I thought we were ... は、予定の食い違いをやわらかく確認する。", "I thought we were meeting at six.", "6時に会うと思ってた。", "We were, but I got here early.", "そうだよ。でも僕が早く着いたんだ。", "Oh, good. I thought I'd messed up.", "ああ、よかった。間違えたかと思った。"],
    [5, "記憶・予定を確認する", "Aren't we supposed to leave now?", "Aren't we supposed to ...? 決まっている予定を確認する。", "Aren't we supposed to leave now?", "もう出ることになってない？", "In five minutes. I'm almost ready.", "あと5分。もうすぐ準備できる。", "Okay, I'll wait by the door.", "わかった、玄関で待ってるね。"],
    [6, "記憶・予定を確認する", "Didn't we agree to wait?", "Didn't we agree to ...? 前に決めたことを確認する。強い口調だと非難に聞こえる。", "I'm going to send the message now.", "今メッセージ送るね。", "Didn't we agree to wait?", "待つって決めなかったっけ？", "You're right. I got ahead of myself.", "そうだった。ちょっと先走った。"],
    [7, "記憶・予定を確認する", "You said Friday, right?", "You said ..., right? 相手が言った内容を短く確認する。", "I'll book the table for Friday.", "金曜日で席を予約するね。", "You said Friday, right?", "金曜日って言ってたよね？", "Yeah, Friday works for everyone.", "うん、金曜日ならみんな大丈夫。"],
    [8, "記憶・予定を確認する", "Do you still live nearby?", "Do you still ...? 以前から続いていることか尋ねる。", "Do you still live nearby?", "まだこの近くに住んでる？", "Yeah, just around the corner.", "うん、すぐそこの角を曲がったところ。", "Nice. We should grab coffee sometime.", "いいね。今度コーヒーでも飲もうよ。"],
    [9, "記憶・予定を確認する", "Have you talked to Sam yet?", "Have you ... yet? もう済ませたかを自然に聞く。", "Have you talked to Sam yet?", "もうサムと話した？", "Not yet. I'll see him after work.", "まだ。仕事のあと会うよ。", "Okay, let me know how it goes.", "わかった。どうなったか教えてね。"],
    [10, "記憶・予定を確認する", "Wasn't it next Thursday?", "Wasn't it ...? 日付や場所などの記憶を確かめる。", "The appointment's this Thursday.", "予約、今週の木曜だよ。", "Wasn't it next Thursday?", "来週の木曜じゃなかったっけ？", "No, they moved it up a week.", "いや、1週間早まったんだ。"],

    [11, "意味・意図を確かめる", "What do you mean by soon?", "What do you mean by ...? 曖昧な言葉の意味を具体的に聞く。", "I'll be there soon.", "もうすぐ着くよ。", "What do you mean by soon?", "「もうすぐ」って具体的にどのくらい？", "About twenty minutes.", "あと20分くらい。"],
    [16, "意味・意図を確かめる", "How do you mean?", "How do you mean? 相手の言葉の意味をもう少し聞きたいとき。", "This feels different from last time.", "前回とは違う感じがする。", "How do you mean?", "どういう意味で？", "Everyone seems more relaxed.", "みんな前よりリラックスしてる。"],

    [22, "理由・背景を聞く", "Why didn't you tell me?", "Why didn't you ...? しなかった理由を聞く。言い方によっては責めて聞こえる。", "I knew about the change yesterday.", "昨日、変更を知ってたんだ。", "Why didn't you tell me?", "なんで教えてくれなかったの？", "I wanted to be sure before I said anything.", "確かなことが分かってから言いたかったんだ。"],
    [23, "理由・背景を聞く", "What happened to your plan to move?", "What happened to ...? 以前の予定がどうなったか聞く。", "I think I'll stay here after all.", "やっぱりここに残ろうと思う。", "What happened to your plan to move?", "引っ越す計画はどうなったの？", "I got a new job here.", "ここで新しい仕事が決まったんだ。"],
    [24, "理由・背景を聞く", "What made you change your mind?", "What made you ...? 気持ちや行動が変わったきっかけを聞く。", "I've decided to take the job.", "その仕事を引き受けることにした。", "What made you change your mind?", "どうして気が変わったの？", "The team seems really good.", "チームがすごく良さそうで。"],
    [25, "理由・背景を聞く", "How did you end up here?", "How did you end up ...? 意外な経緯を自然に聞く。", "I never expected to live in this city.", "この街に住むとは思わなかった。", "How did you end up here?", "どういう経緯でここに来たの？", "A job offer turned into a long stay.", "仕事の誘いで来て、そのまま長くいるんだ。"],
    [26, "理由・背景を聞く", "What brought you to Tokyo?", "What brought you to ...? そこに来たきっかけを聞く。", "I've been in Tokyo for two years.", "東京に来て2年になるよ。", "What brought you to Tokyo?", "東京に来たきっかけは？", "Work at first, but I stayed for the people.", "最初は仕事。でも人が好きで残った。"],
    [27, "理由・背景を聞く", "Since when do you drink coffee?", "Since when do you ...? 意外な変化に驚いて聞く。口調によってはツッコミになる。", "I'll have an iced coffee.", "アイスコーヒーにする。", "Since when do you drink coffee?", "いつからコーヒー飲むようになったの？", "Since I started working early shifts.", "早番の仕事を始めてから。"],
    [28, "理由・背景を聞く", "What was that about?", "What was that about? 今起きたことの事情を聞く。", "He just walked out in the middle of dinner.", "彼、夕食の途中で出ていったよ。", "What was that about?", "今のは何だったの？", "I think he got a call from home.", "家から電話が来たんだと思う。"],
    [29, "理由・背景を聞く", "Is there a reason you waited?", "Is there a reason ...? 行動の理由を確認する。穏やかな口調で使う。", "I waited until today to tell you.", "今日まで言うのを待ったんだ。", "Is there a reason you waited?", "待ったのには理由がある？", "I needed time to think it through.", "ちゃんと考える時間が必要だった。"],
    [30, "理由・背景を聞く", "What changed?", "What changed? 以前との違いが生まれた理由を聞く。", "I think I want to go after all.", "やっぱり行きたいかも。", "What changed?", "何が変わったの？", "I realized I'd regret missing it.", "行かなかったら後悔するって気づいた。"],

    [31, "考え・気持ちを聞く", "What do you think of this place?", "What do you think of ...? ものや場所などへの意見を聞く。", "What do you think of this place?", "この場所どう思う？", "I like it. It's quieter than I expected.", "いいね。思ったより静か。", "Yeah, I could come here again.", "うん、また来たいな。"],
    [32, "考え・気持ちを聞く", "How do you feel about moving?", "How do you feel about ...? 意見だけでなく気持ちを聞く。", "How do you feel about moving?", "引っ越しについてどう感じてる？", "Excited, but a little scared.", "楽しみだけど、ちょっと怖い。", "That makes sense. It's a big change.", "そうだよね。大きな変化だし。"],
    [34, "考え・気持ちを聞く", "Would you rather stay or go?", "Would you rather ... or ...? 二つの選択肢から好みを聞く。", "Would you rather stay or go?", "残るのと帰るの、どっちがいい？", "Let's stay a little longer.", "もう少しここにいよう。", "Sure. I'm not in a hurry.", "いいよ。急いでないし。"],
    [35, "考え・気持ちを聞く", "Which one would you go with?", "Which one would you go with? どれを選ぶか意見を聞く。", "These two designs are both good.", "この2つのデザイン、どっちもいいね。", "Which one would you go with?", "どっちを選ぶ？", "The blue one. It feels cleaner.", "青い方。すっきりして見える。"],
    [36, "考え・気持ちを聞く", "Are you okay with meeting later?", "Are you okay with ...? 相手がその予定や条件で大丈夫か聞く。", "Are you okay with meeting later?", "会う時間を遅らせても大丈夫？", "Yeah, what time were you thinking?", "うん、何時くらいを考えてる？", "Around eight, if that works.", "大丈夫なら8時ごろ。"],
    [37, "考え・気持ちを聞く", "Does that work for you?", "Does that work for you? 提案した時間や方法で都合がいいか聞く。", "I can meet you at the station at six.", "6時に駅で会えるよ。", "Does that work for you?", "それで都合いい？", "Yeah, six is perfect.", "うん、6時ならちょうどいい。"],
    [39, "考え・気持ちを聞く", "Would it bother you if I opened the window?", "Would it bother you if ...? 相手に差し障りがあるか丁寧に聞く。", "Would it bother you if I opened the window?", "窓を開けたら困る？", "Not at all. It's warm in here.", "全然。ここ暑いし。", "Thanks. I'll just open it a little.", "ありがとう。少しだけ開けるね。"],

    [42, "考えを伝える", "I don't think he's coming.", "I don't think ... は否定的な予想や意見を自然に伝える。", "Should we wait for Leo?", "レオを待つ？", "I don't think he's coming.", "彼は来ないと思う。", "Okay, let's order without him.", "じゃあ先に注文しよう。"],
    [44, "考えを伝える", "It seems like she's busy.", "It seems like ... は見聞きした様子からの判断を伝える。", "Should I call her now?", "今、彼女に電話したほうがいいかな？", "It seems like she's busy.", "忙しそうだよ。", "I'll text her instead.", "じゃあメッセージにする。"],
    [46, "考えを伝える", "I bet she's already there.", "I bet ... は「きっと～だよ」という確信をくだけて表す。", "Do you think Nina's still on her way?", "ニナはまだ向かってる途中かな？", "I bet she's already there.", "もう着いてると思うよ。", "You're probably right. She's always early.", "たぶんそうだね。いつも早いし。"],
    [47, "考えを伝える", "As far as I know, it's still on.", "As far as I know, ... は知っている範囲に限って答える。", "Did they cancel the event?", "イベント中止になった？", "As far as I know, it's still on.", "知る限りでは、まだ開催予定だよ。", "Okay, I'll check before I leave.", "わかった。出る前に確認する。"],
    [50, "考えを伝える", "I could be wrong, but I think he left.", "I could be wrong, but ... は確信がないときに控えめに言う。", "Is Daniel still here?", "ダニエルまだいる？", "I could be wrong, but I think he left.", "違うかもしれないけど、もう帰ったと思う。", "I'll send him a message.", "メッセージしてみる。"],

    [52, "やわらかく言う", "I'm not saying it's a bad idea.", "I'm not saying ... は相手の受け取り方をやわらかく修正する。", "So you hate my idea?", "つまり私の案が嫌なの？", "I'm not saying it's a bad idea.", "悪い案だと言ってるわけじゃないよ。", "Okay. What part worries you?", "わかった。どこが気になる？"],
    [53, "やわらかく言う", "It's not that I don't trust you.", "It's not that ... は誤解されそうな理由を否定して説明する。", "Why do you keep checking on me?", "なんで何度も確認するの？", "It's not that I don't trust you.", "信用してないわけじゃないんだ。", "I know. You're just worried.", "わかってる。心配なんだよね。"],
    [57, "やわらかく言う", "In a way, she's right.", "In a way, ... は一部はそうだと認める。", "Do you agree with her?", "彼女に賛成？", "In a way, she's right.", "ある意味、彼女の言う通りだよ。", "But you see it differently?", "でも違う見方もある？"],
    [60, "やわらかく言う", "Maybe we could leave early.", "Maybe we could ... は押しつけずに提案する。", "It's getting pretty loud in here.", "ここ、かなり騒がしくなってきたね。", "Maybe we could leave early.", "早めに出てもいいかも。", "Yeah, let's head out.", "うん、出よう。"],

    [65, "頼む・申し出る", "Do you happen to know her number?", "Do you happen to know ...? 相手が知っているか控えめに聞く。", "Do you happen to know her number?", "もしかして彼女の番号知ってる？", "I don't, but I can ask Mia.", "知らないけど、ミアに聞けるよ。", "That would help. Thanks.", "助かる。ありがとう。"],
    [66, "頼む・申し出る", "Can I get some water?", "Can I get ...? 店などで自然に注文・依頼する。", "Can I get some water?", "お水をもらえますか？", "Sure. Still or sparkling?", "もちろんです。普通のお水と炭酸水、どちらにしますか？", "Still, please.", "普通のお水でお願いします。"],
    [67, "頼む・申し出る", "Want me to call them?", "Want me to ...? 親しい相手に手助けを申し出るくだけた形。", "The restaurant isn't answering my text.", "レストランからメッセージの返事がない。", "Want me to call them?", "電話してみようか？", "Could you? That'd be great.", "お願いできる？助かる。"],
    [68, "頼む・申し出る", "Do you need a hand with those bags?", "Do you need a hand with ...? 手伝いが必要か聞く。", "Do you need a hand with those bags?", "その荷物、手伝おうか？", "Thanks. Could you take this one?", "ありがとう。これを持ってくれる？", "Of course. I've got it.", "もちろん。任せて。"],
    [70, "頼む・申し出る", "Is there anything I can do?", "Is there anything I can do? 困っている相手に手助けを申し出る。", "It's been a rough week.", "今週は大変だった。", "Is there anything I can do?", "何かできることある？", "Could you just stay for a bit?", "少し一緒にいてくれる？"],

    [74, "誘う・予定を決める", "What if we meet there instead?", "What if we ...? 別案を軽く提案する。", "The station is really crowded.", "駅、すごく混んでる。", "What if we meet there instead?", "代わりに現地集合にしない？", "Good idea. I'll see you at the cafe.", "いいね。カフェで会おう。"],
    [75, "誘う・予定を決める", "We could always take a taxi.", "We could always ... は代わりの手段を示す。", "We just missed the last train.", "終電を逃しちゃった。", "We could always take a taxi.", "タクシーに乗る手もあるよ。", "Yeah, let's split the fare.", "うん、料金は割り勘にしよう。"],
    [77, "誘う・予定を決める", "Are you up for a walk?", "Are you up for ...? 軽く誘ったり、その気があるか聞いたりする。", "It's nice outside.", "外、気持ちいいよ。", "Are you up for a walk?", "散歩でも行く？", "Sure. I could use some air.", "いいね。外の空気を吸いたい。"],
    [78, "誘う・予定を決める", "Are you free this weekend?", "Are you free ...? 相手の空いている日を聞く。", "Are you free this weekend?", "今週末空いてる？", "Sunday afternoon should work.", "日曜の午後なら大丈夫そう。", "Great. Let's grab lunch then.", "いいね。じゃあランチしよう。"],
    [79, "誘う・予定を決める", "What time works for you?", "What time works for you? 都合のいい時間を相手に聞く。", "I can come by tomorrow.", "明日寄れるよ。", "What time works for you?", "何時が都合いい？", "Anytime after three.", "3時以降ならいつでも。"],

    [84, "反応・相づち", "I see what you mean.", "I see what you mean. 相手の言いたいことを理解したと伝える。", "It feels too formal for this party.", "このパーティーには少し堅すぎる感じ。", "I see what you mean.", "言いたいことわかるよ。", "Maybe I'll change into something simpler.", "もう少し気軽な服に着替えようかな。"],
    [86, "反応・相づち", "Good point.", "Good point. 相手の指摘を短く認める。", "We should check the weather first.", "まず天気を確認したほうがいいよ。", "Good point.", "たしかに、そうだね。", "It might rain later.", "あとで雨が降るかもしれないし。"],
    [87, "反応・相づち", "Tell me about it.", "Tell me about it. ここでは「本当にそうだよね」という強い同意。", "It's been such a long week.", "今週、ほんとに長かった。", "Tell me about it.", "ほんとそれ。", "Let's do absolutely nothing tomorrow.", "明日は何もしない日にしよう。"],
    [88, "反応・相づち", "That sucks.", "That sucks. 嫌な出来事を聞いてくだけた言い方で共感する。", "I missed the last train.", "終電を逃した。", "That sucks.", "それはつらいね。", "Yeah, now I have to get a taxi.", "うん、タクシーで帰るしかない。"],
    [89, "反応・相づち", "I'm glad to hear that.", "I'm glad to hear that. 良い知らせを聞いてうれしいと伝える。", "My sister's feeling much better.", "姉、だいぶ元気になったよ。", "I'm glad to hear that.", "それを聞けてうれしい。", "Thanks. It's a relief for all of us.", "ありがとう。みんなほっとしてる。"],

    [95, "会話をつなぐ", "Where were we?", "Where were we? 脱線したあと、どこまで話したか確認する。", "Where were we?", "どこまで話したっけ？", "You were telling me about your new job.", "新しい仕事の話をしてたよ。", "Right. So, my first day was wild.", "そうだった。初日は大変だったんだ。"],
    [96, "会話をつなぐ", "As I was saying, we can leave early.", "As I was saying, ... は中断した話の続きを始める。", "Sorry, I had to take that call.", "ごめん、電話に出ないといけなくて。", "No problem. What were you saying?", "大丈夫。何の話だった？", "As I was saying, we can leave early.", "さっきの続きだけど、早めに出られるよ。"],

    [14, "意味・意図を確かめる", "So you mean we have to start over?", "So you mean ...? 相手の話を自分の言葉で言い換えて確認する。", "The old version won't work anymore.", "古いバージョンはもう使えないんだ。", "So you mean we have to start over?", "つまり最初からやり直すってこと？", "Not completely. We can keep some parts.", "全部じゃないよ。一部は残せる。"],
    [18, "意味・意図を確かめる", "Am I understanding you right?", "Am I understanding you right? 自分の理解が合っているか直接確認する。", "You want me to wait until Friday before I tell them?", "金曜まで彼らに言わずに待ってほしいってこと？", "Am I understanding you right?", "理解合ってる？", "Yes. I need two more days.", "うん。あと2日必要なんだ。"],
    [19, "意味・意図を確かめる", "You need some time alone. Is that what you mean?", "Is that what you mean? 自分の言い換えが相手の意図と合うか聞く。", "You need some time alone. Is that what you mean?", "少し一人の時間が必要ってこと。そういう意味？", "Yes, just for tonight.", "うん、今夜だけ。", "Okay. I'll give you some space.", "わかった。そっとしておくね。"],
    [20, "意味・意図を確かめる", "What exactly do you mean by done?", "What exactly do you mean by ...? 曖昧な言葉を正確に確かめる。", "I think I'm done with this.", "もうこれは終わりにしたいと思う。", "What exactly do you mean by done?", "「終わり」って正確にはどういう意味？", "I need a break, not a permanent goodbye.", "休みたいだけで、完全にやめるわけじゃない。"],
    [33, "考え・気持ちを聞く", "Do you think she'll come?", "Do you think ...? 相手の予想や意見を気軽に聞く。", "Do you think she'll come?", "彼女、来ると思う？", "Probably. She said she was on her way.", "たぶん。向かってるって言ってたよ。", "Okay, let's save her a seat.", "じゃあ席を取っておこう。"],
    [38, "考え・気持ちを聞く", "Do you mind if I sit here?", "Do you mind if ...? 自分がしてもよいか丁寧に聞く。", "Do you mind if I sit here?", "ここに座ってもいい？", "Not at all. Go ahead.", "もちろん。どうぞ。", "Thanks. It's crowded today.", "ありがとう。今日は混んでるね。"],
    [41, "考えを伝える", "I think we should wait.", "I think ... は自分の考えを自然に切り出す基本形。", "Should we make a decision now?", "今決めたほうがいい？", "I think we should wait.", "もう少し待ったほうがいいと思う。", "You're right. We need more information.", "そうだね。もっと情報が必要だ。"],
    [51, "やわらかく言う", "I'm not sure if this is the right place.", "I'm not sure if ... は確信がないことを控えめに伝える。", "I'm not sure if this is the right place.", "ここで合ってるか自信がない。", "Let me check the address.", "住所を確認するね。", "Oh, it's one street over.", "あ、一つ向こうの通りだ。"],
    [61, "頼む・申し出る", "Could you send me the link?", "Could you ...? 相手にしてほしいことを丁寧に頼む。", "Could you send me the link?", "リンクを送ってもらえる？", "Sure. I'll text it to you now.", "もちろん。今メッセージで送るね。", "Thanks. I couldn't find it.", "ありがとう。見つからなかったんだ。"],
    [62, "頼む・申し出る", "Would you mind closing the door?", "Would you mind ...ing? してもらってよいか丁寧に頼む。", "Would you mind closing the door?", "ドアを閉めてもらってもいい？", "Of course. Is it too loud outside?", "もちろん。外がうるさい？", "A little. Thanks.", "ちょっとね。ありがとう。"],
    [63, "頼む・申し出る", "Can you do me a favor?", "Can you do me a favor? 親しい相手に頼みごとを切り出す。", "Can you do me a favor?", "ちょっとお願いしていい？", "Sure. What do you need?", "もちろん。どうしたの？", "Could you hold this for a second?", "これをちょっと持っててくれる？"],
    [69, "頼む・申し出る", "Let me check.", "Let me ... は「私に～させて」と、自分が何かすることを伝える。", "Is the store still open?", "お店、まだ開いてる？", "Let me check.", "確認するね。", "Thanks. I don't want to go for nothing.", "ありがとう。行って閉まってたら困るし。"],
    [71, "誘う・予定を決める", "Do you want to grab lunch?", "Do you want to ...? 相手を自然に誘う基本形。", "Do you want to grab lunch?", "ランチでも行かない？", "Sure. I know a place nearby.", "いいね。近くにいい店知ってる。", "Perfect. Lead the way.", "いいね。案内して。"],
    [72, "誘う・予定を決める", "Wanna get coffee?", "Wanna ...? Do you want to ...? のくだけた言い方。親しい相手に使う。", "Wanna get coffee?", "コーヒーでも飲まない？", "Yeah, I'd love to.", "うん、ぜひ。", "There's a place around the corner.", "角を曲がったところにお店があるよ。"],
    [93, "会話をつなぐ", "Speaking of work, how's the new job?", "Speaking of ... は今の話題から関連する話を始める。", "I had a long day at the office.", "今日は職場で長い一日だった。", "Speaking of work, how's the new job?", "仕事と言えば、新しい職場はどう？", "Busy, but I'm enjoying it.", "忙しいけど、楽しんでるよ。"]
  ];

  items.sort((a, b) => a[0] - b[0]).forEach(([number, category, phrase, usageNote, aEnglish, aJapanese, bEnglish, bJapanese, lastEnglish, lastJapanese]) => {
    window.CONVERSATION_PHRASES.push({
      id: `pattern-${String(number).padStart(3, "0")}`,
      pack: "使い回せる型",
      category,
      phrase,
      usageNote,
      lines: [["A", aEnglish, aJapanese], ["B", bEnglish, bJapanese], ["A", lastEnglish, lastJapanese]]
    });
  });
})();
