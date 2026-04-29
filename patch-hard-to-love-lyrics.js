const fs = require('fs');
const path = require('path');

const fullRaw = `When I was just a kid
僕がまだほんの子供だった頃
I couldn't wait till I grew up
早く大人になりたくて仕方なかった
Tried walking in your shoes
あなたの靴を履いて歩こうとしたけど
But I couldn't even tie them up
靴紐を結ぶことすらできなかったね
No matter how big and tall I grew
どれだけ僕が大きく背が伸びたとしても
I was always looking up to you
いつだってあなたを見上げてばかりいた

You showed me that I was just a diamond in the rough
あなたは僕が「ただのダイヤの原石」なんだって教えてくれた
You helped me to grow into the man that I've become
今の僕という大人になれるように育ててくれた
We've been down, we've been up
落ち込んだ時期もあれば、上手くいった時期もあったけど
I hope I've made you proud enough
あなたが少しでも僕を誇りに思ってくれていたらいいな
You make it look easy, even when I'm hard to love
愛するのが難しいような（手のかかる）僕でさえ、あなたは事もなげに愛してくれた

When I dropped out of school
僕が学校を辞めた時
You told me that my time was up
あなたは「もう時間切れだ」って言ったね
I was a rebel with a cause
信念を持って反抗していたつもりだった
Just didn't know what it was
ただそれが何なのか分からなかっただけなんだ
So I waited, but jumped the barricade
だから待ったけど、結局バリケードを飛び越えてしまった
You said you did the same thing at my age
あなたも「お前と同じ歳の頃に同じことをしたよ」って言ってくれたね

You showed me that I was just a diamond in the rough
あなたは僕が「ただのダイヤの原石」なんだって教えてくれた
You helped me to grow into the man that I've become
今の僕という大人になれるように育ててくれた
We've been down, we've been up
落ち込んだ時期もあれば、上手くいった時期もあったけど
I hope I've made you proud enough
あなたが少しでも僕を誇りに思ってくれていたらいいな
You make it look easy, even when I'm hard to love
愛するのが難しいような僕でさえ、あなたは事もなげに愛してくれた

Sometimes I work a job that barely pays
時々、割に合わないような仕事をして
Sometimes I'm barely making it through the day
その日を乗り切るだけで精一杯な時もある
But I'll be fine because I've got your blood in my veins
でも大丈夫、僕の体にはあなたの血が流れているから
You taught me how to live and what it means to be brave
あなたは僕に生き方と、勇敢であることの意味を教えてくれた

You showed me that I was just a diamond in the rough
あなたは僕が「ただのダイヤの原石」なんだって教えてくれた
You helped me to grow into the man that I've become
今の僕という大人になれるように育ててくれた
We've been down, we've been up
落ち込んだ時期もあれば、上手くいった時期もあったけど
I hope I've made you proud enough
あなたが少しでも僕を誇りに思ってくれていたらいいな
You make it look easy, even when I'm hard to love
愛するのが難しいような僕でさえ、あなたは事もなげに愛してくれた
Yeah, you make it look easy, even when I'm hard to love
本当に、愛しにくいような僕でさえ、あなたは難なく愛してくれた`;

const lines = fullRaw.split('\n');
const lyricsJa = [];
const lyricsEnOnly = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) {
    lyricsJa.push({ en: "", ja: "" });
    lyricsEnOnly.push("");
    continue;
  }
  // Even line index: EN, Odd line index: JA
  // But due to empty lines, it's better to peek ahead
  const en = line;
  let ja = "";
  if (i + 1 < lines.length && lines[i+1].trim() !== "" && !line.match(/^[a-zA-Z]/) === false) {
    // next line is JA
    const nextLine = lines[i+1].trim();
    // basic check to see if next line contains Japanese chars
    if (/[ぁ-んァ-ヶｱ-ﾝﾞﾟ一-龠]/.test(nextLine)) {
      ja = nextLine;
      i++; // skip next line
    }
  }
  lyricsJa.push({ en, ja });
  lyricsEnOnly.push(en);
}

const targetFile = path.join(__dirname, 'songs', 'Hard To Love ONE OK ROCK', 'song.json');
const data = JSON.parse(fs.readFileSync(targetFile, 'utf8'));

data.lyrics = lyricsEnOnly.join('\n');
data.lyricsJa = lyricsJa;

fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf8');
console.log('Patch complete!');
