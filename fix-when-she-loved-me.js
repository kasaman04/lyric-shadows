/**
 * fix-when-she-loved-me.js
 * Jessie & Ryanの承認済み会話で音声を再生成してsong.jsonを上書きする
 */
const path = require('path');
const fs = require('fs-extra');
const { finalizeSong, VOICE_MAP } = require('./lib/generate');
require('dotenv').config();

const SONGS_DIR = path.join(__dirname, 'songs');
const FOLDER_NAME = 'When She Loved Me Sarah McLachlan';
const SONG_DIR = path.join(SONGS_DIR, FOLDER_NAME);

// 既存のlyricsJaを引き継ぐ
const existingSong = require(path.join(SONG_DIR, 'song.json'));

const convData = {
  relationship: '友達',
  setting: 'Two friends talking at a coffee shop about an old friendship that faded away.',
  speakerA: { name: 'Jessie', type: '女性' },
  speakerB: { name: 'Ryan', type: '男性' },
  conversation: [
    {
      speaker: 'A',
      english: 'I saw my old best friend today. We hadn\'t talked in years.',
      japanese: '今日、昔の親友に会ったの。もう何年も話してなかったんだけど。'
    },
    {
      speaker: 'B',
      english: 'Wow, really? You two used to be inseparable, right?',
      japanese: 'え、マジで？ふたりっていつも一緒だったよね？'
    },
    {
      speaker: 'A',
      english: 'Yeah. {{We had each other, and that was all}} we needed. {{Through the summer and the fall}}, we did everything together.',
      japanese: 'うん。お互いがいれば、それだけでよかった。夏も秋も、何でも一緒にやったよ。'
    },
    {
      speaker: 'B',
      english: 'So what happened? Why did you [[drift]] apart?',
      japanese: 'じゃあ何があったの？なんで離れちゃったの？'
    },
    {
      speaker: 'A',
      english: '{{The years went by}} and she just started changing. I {{stayed the same}}, but {{she began to drift away}}. I was kind of {{left alone}}.',
      japanese: '年月が経って、あの子はどんどん変わっていった。私は変わらなかったのに、あの子は少しずつ離れていって。置いていかれた感じだった。'
    },
    {
      speaker: 'B',
      english: 'That must have been tough. Did you try reaching out?',
      japanese: 'それはつらかったね。連絡してみたりしなかったの？'
    },
    {
      speaker: 'A',
      english: 'Not really. I just kept {{waiting for the day}} she\'d come back. I felt so [[lonely]] and [[forgotten]]. I {{never thought she\'d look my way}} again.',
      japanese: 'ううん。いつか戻ってきてくれるのをずっと待ってた。すごく寂しくて、忘れられたみたいで。もう振り向いてくれないと思ってた。'
    },
    {
      speaker: 'B',
      english: 'But you said you saw her today. What happened?',
      japanese: 'でも今日会ったんでしょ？どうだったの？'
    },
    {
      speaker: 'A',
      english: '{{She smiled at me and held me}}, {{just like she used to do}}. And I realized that {{every hour we spent together}} still {{lives within my heart}}.',
      japanese: 'あの子、笑って抱きしめてくれたの、昔みたいに。一緒に過ごした時間は全部、まだ胸の中にあるんだなって気づいた。'
    }
  ]
};

async function main() {
  // 古いmp3を削除
  const files = await fs.readdir(SONG_DIR);
  const mp3s = files.filter(f => f.endsWith('.mp3'));
  for (const f of mp3s) {
    await fs.remove(path.join(SONG_DIR, f));
  }
  console.log(`🗑️  Removed ${mp3s.length} old audio files`);

  const getVoice = (type) => VOICE_MAP[type] || VOICE_MAP['男性'];

  const prepared = {
    songName: 'When She Loved Me',
    artist: 'Sarah McLachlan',
    folderName: FOLDER_NAME,
    lyrics: existingSong.lyrics,
    lyricsJa: existingSong.lyricsJa,
    ytData: {
      videoId: existingSong.videoId,
      thumbnailUrl: existingSong.thumbnailUrl
    },
    convData,
    speakerA: { name: 'Jessie', type: '女性', voice: getVoice('女性') },
    speakerB: { name: 'Ryan', type: '男性', voice: getVoice('男性') },
  };

  console.log('\n🔊 Generating audio...\n');
  const song = await finalizeSong(prepared, SONGS_DIR, {
    onStatus: (msg) => console.log(msg),
  });

  console.log(`\n✅ Done!`);
  console.log(`   Folder: songs/${song.folderName}/`);
  console.log(`   Turns: ${song.conversation.length}`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
