'use strict';
// Prepare text lessons offline. This script never calls a model or an audio service.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const phrases = require('../data/relative-conversation-phrases.json');
const focusRows = {
  who: `who works at this cafe|who has a van|who sits next to me|who enjoys hiking|who just bought a sandwich|who walks her dog in the morning|who knows this area well|who used to live upstairs|who fixed my car last winter|who wants to run`,
  whose: `whose coat is on that chair|whose daughter is in the hospital|whose book I lent you last month|whose car it is|whose dog keeps stealing our tennis balls|whose portfolio includes that cafe redesign|whose owner speaks Japanese|whose phone has died today|whose entrance faces the river|whose songs got me through college`,
  which: `which folds up|which they bake every morning|which was a relief|which made it even better|which goes straight to the airport|which he thinks is really clever|which closes at six|which stays cool while you cook|which gives us another day to prepare|which overlooks the whole bay`,
  that: `that I lent you|that I made yesterday|that you can walk in all day|that I lost last week|that gets plenty of sunlight|that doesn't sound right|that stays open until midnight|that make a birthday special|that we need for the trip|that we used to play on road trips`,
  what: `what you're serving with the fish|what she said about the deadline|What he really needs|what you're having|what you mean|what I'm looking for|what I needed|what you think|what I made in my woodworking class|what you need to do`,
  when: `when the power went out|when there were no cafes here|when I found out I'd got the job|when everyone comes in after work|when we lived by the sea|when I'm free after five|in the first hour they're open|when everything felt new|when I cooked for all my friends|when we missed the last train`,
  where: `where we had breakfast last Sunday|where you grew up|where I can take a video call|where we bought all those spices|where I can get a better signal|where I can grow herbs|where I can clear my head|where we won't block the delivery trucks|where we celebrated our first anniversary|where I could work between meetings`,
  why: `why you couldn't come|why people keep coming back|why I want to stay here|why I was late|why it's so cheap|why I started|why it wouldn't arrive|why I go there|why he's scared|why we chose that month`,
  how: `how I measure the water|how I avoided the main road|how I print them all at once|how I hold the phone against the railing|how I said it|how I keep track of my spending|how I water mine|how I do it|how I handle nerves|how it folds down`,
  whoever: `Whoever wants it|Whoever is at the front desk|Whoever wants to come|whoever cooks|Whoever finishes work first|whoever wins|Whoever gets the job|Whoever it is|whoever made this playlist|Whoever has the car this evening`,
  whatever: `whatever you make|whatever you'd like to drink|whatever you make for her|whatever you need|Whatever we do|whatever I can|whatever looks fresh|Whatever happens|whatever sounds good to you|whatever is on your mind`,
  whichever: `Whichever you prefer|whichever one is shorter|whichever route has less traffic|whichever one fits better|whichever one has a bigger screen|whichever slice you want|whichever time works better for you|whichever station is closest|Whichever one you don't want|whichever one includes breakfast`,
  whenever: `whenever you need help|whenever you're ready|whenever the forecast looks uncertain|Whenever I smell fresh bread|whenever I have a few minutes|Whenever I can get a few days off|Whenever I walk onstage|whenever she wants a treat|Whenever I'm in the neighborhood|whenever you've finished checking them`,
  wherever: `wherever we find a nice place|wherever I have a reliable internet connection|wherever I go|wherever you like|wherever I go|Wherever you end up|wherever they're out of the way|Wherever we go|wherever I travel|wherever there's some shade`,
  however: `however you like|however you think is clearest|however you like|however you prefer|however you find easiest|However long it takes|however busy I get|However hard it is|However little time you have|However late you get home`,
  'by the time': `By the time I got there|by the time you get home|by the time we sat down|by the time we leave|by the time I got upstairs|by the time I left the store|by the time we get there|by the time you arrive|by the time we leave|by the time you called`,
  whether: `whether it rains|whether to get tea or coffee|whether Sam is coming|whether it's open|whether to take a jacket|whether it's spicy or just sweet|whether you come or not|whether to walk or take the bus|whether your booking went through|whether we're supposed to dress up`,
  'now that': `Now that everyone's here|Now that I've unpacked|Now that the rain's stopped|now that the presentation's over|Now that you live nearby|Now that I can see properly|Now that we have a car|Now that class is over|Now that it's cooled down|Now that she's older`,
  once: `Once you get used to it|once you get there|once I finish this email|Once the water boils|Once you know the quiet routes|once everyone's settled|once I get paid|once the baby's asleep|Once we've booked the flights|once you've wiped them down`,
  'so that': `so that you can find the entrance|So that we can show Maya the vegetarian options|so that we don't have to rush|so that we don't wake the baby|So that I can sleep a little longer tomorrow|so that you can see the photo|so that I wouldn't forget my keys|so that we can sit together|so that they cook faster|so that we can hear each other`,
  'in case': `in case it rains|in case someone needs it|in case you lose your signal|in case the kids get hungry|in case they don't take cards|In case you can't find the old message|in case it gets cold later|in case anything happens to your laptop|in case there's traffic|in case the delivery driver calls`,
  'as soon as': `as soon as you get home|as soon as I bought it|as soon as I'm free|as soon as they go on sale|as soon as my head hit the pillow|as soon as the rain stops|as soon as it gets here|as soon as we met|as soon as the timer goes off|as soon as I saw it`,
  'even though': `even though I slept for nine hours|even though it was raining|even though it was a bit expensive|even though I'm already full|even though we live so close|even though I've seen it so many times|even though I know the area|even though she was really busy|even though it's freezing outside|even though I've practiced the whole thing`,
  unless: `unless it rains|unless I text you|unless this one breaks|unless it's urgent|unless we go really early|unless you think it needs it|unless you'd rather be inside|unless my meeting runs late|unless you're sure you're keeping it|unless you're sure you won't need it`,
  while: `while you take a shower|while we wait|while she was talking|while I'm away|while it's still hot|while I clean|while we're in the area|while Ben prefers tea|While I like the idea|while Maya finished cooking`,
  as: `just as I was leaving|as you leave|as we were walking home`
};
// Each pair is used as a ready-written, text-only example; none is synthesized.
const exampleRows = {
  who: [["Do you know anyone who can fix this?","これを直せる知り合い、いる？"],["She's the friend who taught me to drive.","運転を教えてくれた友達だよ。"]],
  whose: [["Is that the guy whose bike was stolen?","あれ、自転車を盗まれた人？"],["I have a friend whose mum runs a bakery.","お母さんがパン屋をやってる友達がいるんだ。"]],
  which: [["The train was empty, which was nice.","電車が空いてて、よかったよ。"],["The cafe has a terrace, which gets a lot of sun.","そのカフェには、日当たりのいいテラスがあるよ。"]],
  that: [["Is this the bag that you lost?","なくしたバッグって、これ？"],["I need a charger that works with my phone.","自分のスマホで使える充電器が必要なんだ。"]],
  what: [["Just tell me what you need.","必要なものを教えてね。"],["That's exactly what I was thinking.","まさに私もそう思ってた。"]],
  when: [["Do you remember when we first met?","初めて会ったとき、覚えてる？"],["Sunday's the only day when I can sleep in.","日曜日だけは、朝ゆっくり寝ていられるんだ。"]],
  where: [["Is there somewhere where we can sit down?","どこか座れるところ、ある？"],["That's where I left my umbrella.","傘を置いてきたの、そこだよ。"]],
  why: [["I don't know why she's upset.","なんで彼女が怒ってるのか、わからないんだ。"],["That's why I called you.","だから電話したんだよ。"]],
  how: [["Can you show me how this works?","これの使い方、教えてくれる？"],["I like how you've arranged the room.","この部屋の配置、いいね。"]],
  whoever: [["Give it to whoever needs it.","必要な人にあげて。"],["Whoever gets up first can make coffee.","先に起きたほうがコーヒーを入れよう。"]],
  whatever: [["Order whatever you feel like.","食べたいものを頼んでね。"],["Whatever happens, I'll be there.","何があっても、そばにいるよ。"]],
  whichever: [["Take whichever bus comes first.","先に来たほうのバスに乗って。"],["Whichever day works for you is fine.","都合のいい日で大丈夫だよ。"]],
  whenever: [["Drop by whenever you like.","好きなときに寄ってね。"],["Whenever I hear that song, I think of you.","あの曲を聞くたびに、あなたを思い出すよ。"]],
  wherever: [["We can stop wherever you want.","好きなところで休憩できるよ。"],["Wherever you move, let's stay in touch.","どこに引っ越しても、連絡を取り合おうね。"]],
  however: [["Cook it however you like.","好きなように調理してね。"],["However tired I am, I always brush my teeth.","どんなに疲れていても、必ず歯を磨くよ。"]],
  'by the time': [["By the time I woke up, everyone had left.","起きたときには、みんな出かけてた。"],["I'll be home by the time dinner's ready.","夕食ができるころには帰るよ。"]],
  whether: [["I'm not sure whether he's free tonight.","今夜、彼が空いてるかどうかわからないな。"],["Have you decided whether to stay or go?","残るか行くか、決めた？"]],
  'now that': [["Now that we're here, let's get something to eat.","せっかく来たし、何か食べよう。"],["Now that I've finished work, I can relax.","仕事が終わったから、のんびりできるよ。"]],
  once: [["I'll call you once I know more.","詳しいことがわかったら電話するね。"],["Once you try it, you'll understand.","一度やってみれば、わかるよ。"]],
  'so that': [["I'll move so that you can see.","見えるように、私が移動するね。"],["Write it down so that you don't forget.","忘れないように、書いておいて。"]],
  'in case': [["Keep my number in case you need help.","困ったときのために、私の番号を保存しておいて。"],["I'll take a sweater in case it gets chilly.","肌寒くなるといけないから、セーターを持っていくね。"]],
  'as soon as': [["I'll tell you as soon as I hear anything.","何かわかったらすぐ教えるね。"],["She smiled as soon as she saw me.","私を見た途端に、彼女は笑顔になった。"]],
  'even though': [["I went for a walk even though I was tired.","疲れてたけど、散歩に行ったよ。"],["He came even though he was busy.","忙しかったのに、来てくれたんだ。"]],
  unless: [["I won't go unless you come with me.","一緒に来てくれなければ、行かないよ。"],["Call me unless you're too tired.","疲れすぎてなければ、電話してね。"]],
  while: [["Can you watch my bag while I order?","注文してる間、バッグを見ててくれる？"],["I like coffee, while my sister prefers tea.","私はコーヒーが好きだけど、妹は紅茶派なんだ。"]],
  as: [["I saw her just as I was getting on the bus.","バスに乗るところで、彼女を見かけたよ。"],["Wave to me as you go past.","通り過ぎるときに手を振ってね。"]]
};
const rules = {
  who: ['直前の人がどんな人かを説明しています','who の後に、その人の行動や状態を続けます。'],
  whose: ['誰の持ち物・家族なのかをつないで説明しています','whose のすぐ後に、coat や daughter などの名詞を置きます。'],
  which: ['物について情報を付け足しています','which が主語になる場合は、その後に動詞が続きます。'],
  that: ['直前の人や物を絞り込んでいます','何のことか伝わるように、that の後で特徴や出来事を説明します。'],
  what: ['「何を〜するか」「〜するもの・こと」をひとまとまりにしています','what の前に the thing を重ねる必要はありません。'],
  when: ['いつのことかを説明しています','when の後は普通の文の語順です。会話では、時を説明する when を省ける場合もあります。'],
  where: ['どんな場所か・どこでのことかを説明しています','where の後は「主語＋動詞」。場所を表す there を重ねる必要はありません。'],
  why: ['理由を説明しています','why の後は「主語＋動詞」。疑問文の語順にはしません。'],
  how: ['やり方や様子をひとまとまりにしています','how の後は「主語＋動詞」。how do I のような質問の語順にはしません。'],
  whoever: ['「〜する人なら誰でも」という意味です','特定の名前ではなく、条件に当てはまる人を指します。'],
  whatever: ['「〜するものなら何でも」という意味です','ものを特定せず、相手の選択などに任せるときに使えます。'],
  whichever: ['選択肢の中で「〜するほうならどれでも」という意味です','one・route・time など、選ぶ対象の名詞を続けることもできます。'],
  whenever: ['「〜するときはいつでも」という意味です','時間を限定せず、都合のよいときや繰り返し起こるときを表せます。'],
  wherever: ['「〜する場所ならどこでも」という意味です','場所を一つに決めず、条件に合う場所を示しています。'],
  however: ['「〜する方法ならどんな方法でも」という意味です','好きなやり方に任せる表現です。「しかし」の however とは使い方が違います。'],
  'by the time': ['ある時点までに、別の出来事が進んでいることを示しています','「そのころには、もう」という二つの出来事の前後関係がポイントです。'],
  whether: ['「〜かどうか」という迷いや確認を表しています','yes / no の可能性や、二つの選択肢をひとまとまりにします。'],
  'now that': ['「今はもう〜なので」と、変わった状況を理由にしています','仮の条件ではなく、すでにそうなったことを前提に続けます。'],
  once: ['「〜したら、そのあとで」という順序を表しています','その状態や出来事が実現してから、次の行動に移るという意味です。'],
  'so that': ['「〜できるように」という行動の目的です','会話では that を省いて so だけでつなぐ言い方も自然です。'],
  'in case': ['「〜するといけないから」という備えの理由です','起きてから対応するのではなく、起きるかもしれないことに今から備えています。'],
  'as soon as': ['「〜したらすぐに」というタイミングです','二つの出来事の間を空けずに、すぐ次のことが起こると伝えています。'],
  'even though': ['「〜なのに」と、予想とは違う結果をつないでいます','実際に起きたこと・今そうであることとの対比です。仮の話ではありません。'],
  unless: ['「〜でない限り」という例外の条件です','unless 自体に「もし〜でなければ」という意味があるので、否定を重ねると意味が変わります。'],
  while: ['「〜している間に」と、二つのことが同時に進むことを表しています','動作だけでなく、留守や温かさなどの状態が続く間にも使えます。'],
  as: ['「〜するとき・〜している途中で」というタイミングです','この問題の as は、二つの動作が重なる場面を表しています。']
};
const overrides = {
  'whose-dialogue-04': {answer:"I'll find out whose car it is.",explanation:'持ち主を確かめるときは find out whose car it is が自然です。whose car は「誰の車」。文の途中なので whose car is it ではなく、whose car it is の語順にします。'},
  'when-dialogue-04': {answer:'Evenings are when everyone comes in after work.',explanation:'Evenings are when ... で「夕方から夜は、みんなが〜する時間だ」と言えます。the time when と言っても正解ですが、会話では the time を入れなくても自然です。'},
  'when-dialogue-07': {answer:"Try coming in the first hour they're open. It's usually quiet then.",explanation:'Try coming ... は「〜の時間に来てみて」という提案です。in the first hour they\'re open で「開店してから最初の1時間」。会話では時を説明する when を省いたこの形も自然です。'},
  'why-dialogue-01': {answer:"No, I understand why you couldn't come.",explanation:'understand why you couldn\'t come で「来られなかった理由はわかる」と言えます。the reason を足しても正解ですが、会話では understand why ... だけで十分です。couldn\'t は過去の「来られなかった」です。'},
  'why-dialogue-04': {answer:'Yeah, I explained why I was late.',explanation:'explained why I was late で「なぜ遅れたのか説明した」。説明したことも遅れたことも過去なので、explained と was を使います。the reason は不要です。Yes / Yeah を省いて I explained why I was late. と答えても自然です。',acceptedAnswers:['Yes. I explained why I was late.','I explained why I was late.']},
  'why-dialogue-05': {answer:"There's a reason why it's so cheap. The battery only lasts an hour.",explanation:'There\'s a reason why ... で「〜なのには理由がある」。so cheap は「そんなに安い」、only lasts an hour は「1時間しかもたない」です。後ろの文で安さの理由を具体的に伝えています。'},
  'why-dialogue-06': {answer:'I remind myself why I started.',explanation:'remind myself why I started で「なぜ始めたのかを自分に思い出させる」。remind myself of the reason why ... と長く言わなくても自然です。started は、始めたときの過去を表しています。'},
  'why-dialogue-07': {answer:"Yeah, I can't think of a reason why it wouldn't arrive.",explanation:'can\'t think of a reason why ... は「〜する理由が思い当たらない」。wouldn\'t arrive と否定にすることで、「届かない理由はない＝届くと思う」と伝えています。'},
  'however-dialogue-05': {answer:'Learn them however you find easiest.',explanation:'however you find easiest で「自分が一番覚えやすいと思う方法で」。やり方を相手に任せる意味です。in whatever way works best for you と言い換えても自然です。',acceptedAnswers:['Learn them in whatever way works best for you.']}
};
const specific = {
  'which-dialogue-02':'which they bake every morning は sourdough の補足説明です。they が主語なので、which は bake の目的語に当たります。「毎朝焼いている」という情報を付け足しています。',
  'which-dialogue-03':'which was a relief は「ケーブルの交換だけで済んだ」という出来事全体を受けて「それにはほっとした」と伝えています。ケーブルそのものが relief なのではありません。',
  'which-dialogue-04':'which made it even better は「結末が意外だったこと」を受けています。「それが作品をさらによくした」という感想を自然につなぐ言い方です。',
  'which-dialogue-06':'which he thinks is really clever は、ソーラー式であることへの彼の感想です。「彼はそれをよくできていると思っている」と補足しています。',
  'which-dialogue-09':'which gives us another day to prepare は、金曜日に変更された結果を説明しています。「そのおかげで、準備する日がもう1日ある」という意味です。',
  'why-dialogue-02':'the main reason why people keep coming back で「みんなが繰り返し来る一番の理由」。keep coming back は「何度も戻ってくる」です。The coffee is why people keep coming back. と短く言っても自然です。',
  'why-dialogue-03':'one reason why I want to stay here は「ここに残りたい理由の一つ」。理由がほかにもあることを含みます。one reason I want to stay here のように why を省いても自然です。',
  'why-dialogue-08':'The owner is the reason why I go there. で「その店主さんがいるから、あそこに行く」。the reason I go there と why を省いた形でも同じ内容を自然に伝えられます。',
  'why-dialogue-09':'the reason why he\'s scared は「彼が怖がっている理由」。probably を入れることで、花火が原因だと断定せず「たぶん」と推測しています。',
  'why-dialogue-10':'one reason why we chose that month は「その月を選んだ理由の一つ」。chose は choose の過去形で、すでに選んだときの話です。one reason we chose that month とも言えます。',
  'whatever-dialogue-05':'Whatever we do は「何をするにしても」。何をするかとは別に、「パソコンは家に置いていこう」と提案しています。「何でもする」という意味ではありません。',
  'whatever-dialogue-08':'Whatever happens は「何が起きても」。起こる出来事にかかわらず、アイスを楽しめるという気楽な言い方です。',
  'whoever-dialogue-08':'Whoever it is は「それが誰であっても」。訪ねてきた人が誰かはわからないけれど、雨でずぶぬれになっていそうだから入れてあげよう、と伝えています。',
  'whether-dialogue-02':'whether to get tea or coffee は「紅茶にするか、コーヒーにするか」。自分がこれから選ぶ行動は whether to ＋動詞の原形で表せます。',
  'whether-dialogue-05':'whether to take a jacket は「上着を持っていくかどうか」。whether to ＋動詞の原形を decide の後に置いて、行動を決められないことを伝えています。',
  'whether-dialogue-07':'whether you come or not は「あなたが来ても来なくても」。どちらの場合でも自分は行く、という意思を伝えています。',
  'whether-dialogue-08':'whether to walk or take the bus は「歩くか、バスに乗るか」。Have you decided ...? で、もう決めたかを尋ねています。',
  'so-that-dialogue-02':'So that we can show Maya ... は、目的を尋ねられたときの短い返事として自然です。会話では、前の質問からわかる主節を繰り返さなくてもかまいません。',
  'so-that-dialogue-05':'So that I can sleep ... は「〜できるように」という目的だけを答える短い返事です。会話の中なら、このような文の一部だけでも自然な回答になります。',
  'so-that-dialogue-07':'I put it there は過去に置いた話です。それを置いた目的が so that I wouldn\'t forget my keys（鍵を忘れないように）。過去の目的なので wouldn\'t を使っています。',
  'while-dialogue-08':'ここでの while は「〜する間」ではなく「それに対して」という対比です。自分はコーヒーを飲む一方、ベンは紅茶派だと伝えています。',
  'while-dialogue-09':'While I like the idea は「アイデアはいいと思うけれど」。賛成できる点を先に認めてから、費用についての心配をやわらかく伝えています。'
};
const lessons = {};
for (const phrase of phrases) {
  const number = Number(phrase.id.match(/-(\d+)$/)[1]) - 1;
  const edit = overrides[phrase.id] || {};
  const answer = edit.answer || phrase.phrase;
  const focus = focusRows[phrase.relativeType].split('|')[number];
  assert(answer.includes(focus), phrase.id + ': focus must appear in the conversational answer');
  const [point,tip] = rules[phrase.relativeType];
  let explanation = edit.explanation || specific[phrase.id] || `「${focus}」は、${point}。${tip}`;
  if (phrase.relativeType === 'however' && number >= 5) explanation = `「${focus}」は「どんなに〜でも」という意味です。however の後に long・busy・hard などの形容詞や副詞を置いて、程度にかかわらないことを伝えています。`;
  if (phrase.relativeType === 'whatever' && [0,2,3,5,6,8,9].includes(number)) explanation += ' ここでは「何が起きても」という条件ではなく、ものや内容を表しています。';
  if (phrase.relativeType === 'that' && [0,1,3,8,9].includes(number)) explanation += ' この that は目的語に当たるため、会話では省いても自然です。';
  const answers = [answer,phrase.phrase,...(edit.acceptedAnswers || [])];
  for (const value of [...answers]) {
    const shorter = value.replace(/^(?:Yes[,.]|Yeah[,.]|Sure[,.]|Of course[,.])\s+/i,'');
    if (shorter !== value) answers.push(shorter.charAt(0).toUpperCase() + shorter.slice(1));
  }
  if (phrase.relativeType === 'that' && [0,1,3,8,9].includes(number)) answers.push(answer.replace(' that ', ' '));
  if (phrase.relativeType === 'why' && ![3,6].includes(number)) answers.push(answer.replace(/the reason why /, 'why ').replace(/one reason why /, 'one reason '));
  const examples = exampleRows[phrase.relativeType].map(([en,ja])=>({en,ja}));
  assert(examples.length === 2 && examples.every(e=>e.en && e.ja));
  lessons['translation-' + phrase.id] = {answer,acceptedAnswers:[...new Set(answers)],explanation,examples};
}
assert.equal(Object.keys(lessons).length,253);
fs.writeFileSync(path.join(__dirname,'../data/sentence-translation-lessons.json'),JSON.stringify({version:1,lessons},null,2)+'\n');
console.log(JSON.stringify({lessons:Object.keys(lessons).length,examples:253*2,audioGenerated:0}));
