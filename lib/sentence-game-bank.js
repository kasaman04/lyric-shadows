'use strict';
const crypto = require('node:crypto');
const TYPES = [
  ['who','人を説明する','basic'], ['whom','動作の相手になる人','basic'], ['whose','誰の・何のものか','basic'], ['which','物・動物を説明する','basic'], ['that','人・物を特定する','basic'], ['what','〜するもの・こと','basic'],
  ['when','時間・日を説明する','basic'], ['where','場所を説明する','basic'], ['why','理由を説明する','basic'], ['how','方法を説明する','basic'],
  ['whoever','〜する人は誰でも','advanced'], ['whomever','〜する相手は誰でも','advanced'], ['whatever','〜するものは何でも','advanced'], ['whichever','候補のどれでも','advanced'], ['whenever','〜するときはいつでも','advanced'], ['wherever','〜する場所ならどこでも','advanced'], ['however','どんな方法でも・どんなに〜でも','advanced']
].map(([key,label,level]) => ({key,label,level}));
const rows = [
 ['who','I met a man.','He lives in Tokyo.','I met a man who lives in Tokyo.','who lives in Tokyo が a man を説明しています。that でも正解です。'],
 ['who','I have a friend.','She plays the violin.','I have a friend who plays the violin.','友達がどんな人かを who 以下で説明します。that も使えます。'],
 ['whom','I called the doctor.','You recommended him.','I called the doctor whom you recommended.','you recommended の相手が the doctor です。会話では who・that や省略も正解です。'],
 ['whom','She thanked the woman.','We met that woman yesterday.','She thanked the woman whom we met yesterday.','会った相手を whom でつなぎます。who・that や関係詞の省略も自然です。'],
 ['whose','I know a girl.','Her brother is a chef.','I know a girl whose brother is a chef.','her brother を whose brother に変え、その女の子の兄弟だと示します。'],
 ['whose','We visited a house.','Its roof was red.','We visited a house whose roof was red.','whose roof は「その家の屋根」。whose は物の所有・部分の説明にも使えます。'],
 ['which','I bought a bag.','It has three pockets.','I bought a bag which has three pockets.','which 以下でバッグを説明します。that でも正解です。'],
 ['which','We saw a dog.','It was sleeping outside.','We saw a dog which was sleeping outside.','犬の様子を which 以下で足します。that でも自然です。'],
 ['that','This is the book.','I bought it yesterday.','This is the book that I bought yesterday.','どの本かを that 以下で特定します。which や関係詞の省略も正解です。'],
 ['that','She has a neighbor.','He grows vegetables.','She has a neighbor that grows vegetables.','隣人がどんな人かを説明します。人なので who も使えます。'],
 ['what','You made something.','I like it.','I like what you made.','what you made で「あなたが作ったもの」。what の前に the thing を重ねません。'],
 ['what','You wrote something.','I read it.','I read what you wrote.','what you wrote は「あなたが書いたもの」。the thing that you wrote という形も可能です。'],
 ['when','I remember the day.','We first met on that day.','I remember the day when we first met.','when 以下でどの日かを説明します。the day we first met という省略形も正解です。'],
 ['when','Friday was the day.','I started my new job on Friday.','Friday was the day when I started my new job.','日を説明する when を使います。on which や when の省略も可能です。'],
 ['where','This is the cafe.','We met there.','This is the cafe where we met.','there を where にして、カフェで会ったという場所の関係を示します。'],
 ['where','I visited the town.','My mother grew up there.','I visited the town where my mother grew up.','where 以下で、母が育った町だと説明します。the town my mother grew up in も正解です。'],
 ['why','She told me the reason.','She left for that reason.','She told me the reason why she left.','the reason why で立ち去った理由を説明します。why の省略も自然です。'],
 ['why','I understand the reason.','He canceled the trip for that reason.','I understand the reason why he canceled the trip.','why は理由の説明です。the reason he canceled the trip という形も使えます。'],
 ['how','He solved the problem.','This is the way he did it.','This is how he solved the problem.','how で方法を表します。the way how と重ねず、how か the way を使います。'],
 ['how','She made the cake.','This is the way she did it.','This is how she made the cake.','how she made the cake で「彼女がケーキを作った方法」です。'],
 ['whoever','Any person can join our team.','That person must enjoy running.','Whoever enjoys running can join our team.','whoever enjoys running は「走ることが好きな人なら誰でも」です。'],
 ['whoever','Any person may take a seat.','That person must have a ticket.','Whoever has a ticket may take a seat.','チケットを持つという条件と、誰でもよいという意味を保ってつなぎます。'],
 ['whomever','You may invite any person.','You like that person.','You may invite whomever you like.','you like の目的語なので whomever。会話で使う whoever も認めます。'],
 ['whomever','You can hire any person.','You trust that person.','You can hire whomever you trust.','trust の相手を whomever で表します。anyone you trust という言い換えも正解です。'],
 ['whatever','You can take anything.','You need it.','You can take whatever you need.','whatever you need は「必要なものなら何でも」です。'],
 ['whatever','I will cook anything.','You want it.','I will cook whatever you want.','欲しいものは何でも作る、という意味を一文にします。'],
 ['whichever','You can choose either of these two seats.','You prefer one of them.','You can choose whichever of these two seats you prefer.','whichever は決まった候補の中で「どちらでも・どれでも」を表します。'],
 ['whichever','You can borrow any of these books.','One suits you best.','You can borrow whichever of these books suits you best.','この本の中で、いちばん合うものならどれでも借りられる、という意味です。'],
 ['whenever','You can call me at any time.','You need help at that time.','You can call me whenever you need help.','助けが必要になったときは、いつでも電話できるとつなぎます。'],
 ['whenever','I go for a walk every time.','I feel stressed at that time.','I go for a walk whenever I feel stressed.','whenever は「〜するときはいつも」という意味にもなります。'],
 ['wherever','You can sit in any place.','You like that place.','You can sit wherever you like.','wherever you like は「好きな場所ならどこでも」です。'],
 ['wherever','I will follow you to any place.','You go there.','I will follow you wherever you go.','あなたが行く場所ならどこへでもついていく、という意味をまとめます。'],
 ['however','You can arrange the chairs in any way.','You like that way.','You can arrange the chairs however you like.','この however は「好きな方法で」。逆接の「しかし」とは別の使い方です。'],
 ['however','The task may be difficult.','I will finish it even if it is difficult.','However difficult the task may be, I will finish it.','however difficult で「どんなに難しくても」。難しさにかかわらず終える意味です。']
];
const translations=[
 '東京に住んでいる男性に会いました。','バイオリンを弾く友達がいます。','あなたが勧めてくれた医師に電話しました。','彼女は、私たちが昨日会った女性にお礼を言いました。',
 '兄弟がシェフをしている女の子を知っています。','屋根が赤い家を訪ねました。','ポケットが3つあるバッグを買いました。','外で寝ている犬を見かけました。',
 'これは私が昨日買った本です。','彼女には野菜を育てている隣人がいます。','あなたが作ったものが好きです。','あなたが書いたものを読みました。',
 '初めて会った日を覚えています。','金曜日が、新しい仕事を始めた日でした。','ここが、私たちが会ったカフェです。','母が育った町を訪ねました。',
 '彼女は立ち去った理由を教えてくれました。','彼が旅行を取りやめた理由は分かります。','これが、彼がその問題を解いた方法です。','これが、彼女がケーキを作った方法です。',
 '走ることが好きな人なら誰でもチームに入れます。','チケットを持っている人なら誰でも座れます。','好きな人なら誰でも招待してかまいません。','信頼する人なら誰でも雇えます。',
 '必要なものは何でも持っていっていいですよ。','あなたの食べたいものなら何でも作ります。','この2つの席のうち、好きな方を選んでいいですよ。','この本の中から、あなたに一番合うものを借りていいですよ。',
 '助けが必要なときは、いつでも電話していいですよ。','ストレスを感じるときはいつも散歩に行きます。','好きな場所に座っていいですよ。','あなたの行く場所ならどこへでもついていきます。',
 '好きな方法で椅子を並べていいですよ。','その仕事がどんなに難しくても、やり遂げます。'
];
const sentenceTranslations=[
 ['私は男性に会いました。','彼は東京に住んでいます。'],
 ['私には友達がいます。','彼女はバイオリンを弾きます。'],
 ['私はその医師に電話しました。','あなたはその医師を勧めました。'],
 ['彼女はその女性にお礼を言いました。','私たちは昨日、その女性に会いました。'],
 ['私はある女の子を知っています。','その子の兄弟はシェフです。'],
 ['私たちはある家を訪ねました。','その家の屋根は赤かったです。'],
 ['私はバッグを買いました。','そのバッグにはポケットが3つあります。'],
 ['私たちは犬を見かけました。','その犬は外で寝ていました。'],
 ['これはその本です。','私は昨日、その本を買いました。'],
 ['彼女には隣人がいます。','その人は野菜を育てています。'],
 ['あなたは何かを作りました。','私はそれが好きです。'],
 ['あなたは何かを書きました。','私はそれを読みました。'],
 ['私はその日を覚えています。','私たちはその日に初めて会いました。'],
 ['金曜日がその日でした。','私は金曜日に新しい仕事を始めました。'],
 ['ここがそのカフェです。','私たちはそこで会いました。'],
 ['私はその町を訪ねました。','私の母はそこで育ちました。'],
 ['彼女は私にその理由を教えました。','彼女はその理由で立ち去りました。'],
 ['私はその理由が分かります。','彼はその理由で旅行を取りやめました。'],
 ['彼はその問題を解きました。','これが、彼がそれをした方法です。'],
 ['彼女はそのケーキを作りました。','これが、彼女がそれをした方法です。'],
 ['誰でも私たちのチームに参加できます。','その人は走ることが好きでなければなりません。'],
 ['誰でも座ってかまいません。','その人はチケットを持っていなければなりません。'],
 ['あなたは誰を招待してもかまいません。','あなたはその人が好きです。'],
 ['あなたは誰を雇ってもかまいません。','あなたはその人を信頼しています。'],
 ['あなたは何を持っていってもかまいません。','あなたはそれを必要としています。'],
 ['私は何でも料理します。','あなたはそれを食べたいと思っています。'],
 ['この2つの席のどちらを選んでもかまいません。','あなたはそのうちの一方の席のほうが好きです。'],
 ['この本の中から、どれを借りてもかまいません。','そのうちの1冊があなたに一番合っています。'],
 ['あなたはいつでも私に電話してかまいません。','あなたはそのとき助けが必要です。'],
 ['私は毎回、散歩に行きます。','私はそのときストレスを感じています。'],
 ['あなたはどこに座ってもかまいません。','あなたはその場所が好きです。'],
 ['私はどんな場所へでもあなたについていきます。','あなたはそこへ行きます。'],
 ['あなたはどんな方法で椅子を並べてもかまいません。','あなたはその方法が好きです。'],
 ['その仕事は難しいかもしれません。','難しくても、私はその仕事を終わらせます。']
];
const QUESTIONS = rows.map(([type, first, second, answer, explanation], index) => ({id:`${type}-${index+1}`,type,sentences:[first,second],sentenceJapanese:sentenceTranslations[index],answer,explanation,japanese:translations[index]}));
function selectQuestion(filter = 'all', excluded = [], random = crypto.randomInt) {
  if (!['all','basic','advanced',...TYPES.map(t=>t.key)].includes(filter)) throw Object.assign(new Error('出題する表現を選び直してください。'),{status:400});
  const eligible = QUESTIONS.filter(q => filter==='all'||q.type===filter||TYPES.find(t=>t.key===q.type).level===filter);
  const fresh = eligible.filter(q=>!excluded.includes(q.id)); const pool = fresh.length ? fresh : eligible;
  return pool[random(pool.length)];
}
module.exports = { TYPES, QUESTIONS, selectQuestion };
