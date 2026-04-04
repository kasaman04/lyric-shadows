/**
 * add-too-good.js
 * "Too Good to Say Goodbye / Bruno Mars" を承認済み会話で追加する
 */
const path = require('path');
const fs = require('fs-extra');
const { translateLyrics, finalizeSong, VOICE_MAP } = require('./lib/generate');
require('dotenv').config();

const SONGS_DIR = path.join(__dirname, 'songs');

const lyrics = `I've made mistakes
I could have treated you better
I let you get away
There goes my happily ever after

Tell me why, why can't we try and start again?
This can't be how our story ends
You're more than my girl, you're my best friend
Tell me you remember when
I was your man and you were my girl
It was you and me against the world

Baby, ain't nobody gonna love me like the way you do
And you ain't never gonna find a love like mine
Tell me, what can I do to make it up to you?
'Cause what we got's too good to say goodbye, goodbye

Yeah, I'm still in love with you, darlin'
I know you feel the same
Oh, what's the point of both of us being broken-hearted?
I pray it's never too late

So tell me why, why can't we try and start again?
This can't be how our story ends
You're more than my girl, you're my best friend
Tell me you remember when
I was your man and you were my girl
It was you and me against the world

Baby, ain't nobody gonna love me like the way you do
And you ain't never gonna find a love like mine
Tell me, what can I do to make it up to you?
'Cause what we got's too good to say goodbye, goodbye

Girl, won't you listen?
It's you that I'm missin'
Take my hand, I wanna go, I wanna go
If we're gonna fight this fight for better days
I know we're gonna make it
This is the chance, let's take it

Baby, ain't nobody gonna love me like the way you do
And you ain't never gonna find a love like mine
Tell me, what can I do to make it up to you?
'Cause what we got's too good to say goodbye
Goodbye`;

const convData = {
  relationship: '恋人（元カップル）',
  setting: 'A park bench at night. Jake is trying to stop Emma from walking away.',
  speakerA: { name: 'Jake', type: '男性' },
  speakerB: { name: 'Emma', type: '女性' },
  conversation: [
    {
      speaker: 'A',
      english: "Emma, wait. Please don't go yet.",
      japanese: 'エマ、待って。まだ行かないでくれ。'
    },
    {
      speaker: 'B',
      english: "Jake, I've been thinking, and I think it's better if we just... move on.",
      japanese: 'ジェイク、ずっと考えてたけど、もう前に進んだほうがいいと思う。'
    },
    {
      speaker: 'A',
      english: "I know {{I've made mistakes}}. {{I could have treated you better}}. I see that now.",
      japanese: '俺が間違えてたのはわかってる。もっと大切にできたはずだった。今はそれがわかる。'
    },
    {
      speaker: 'B',
      english: "It's not just that. I just... I don't know if this can work anymore.",
      japanese: 'それだけじゃないの。もうこれがうまくいくかどうか、わからなくて。'
    },
    {
      speaker: 'A',
      english: "But {{this can't be how our story ends}}. {{You're more than my girl, you're my best friend}}.",
      japanese: 'でも、こんな終わり方でいいはずがない。君は彼女っていうより、一番の親友なんだよ。'
    },
    {
      speaker: 'B',
      english: "I know. That's what makes this so hard.",
      japanese: 'わかってる。だからこそ、つらいんじゃない。'
    },
    {
      speaker: 'A',
      english: "Emma, {{ain't nobody gonna love me like the way you do}}. And I know I can't love anyone the way I love you. {{What we got's too good to say goodbye}}.",
      japanese: 'エマ、君みたいに俺を愛してくれる人、他に誰もいない。俺だって君以上に好きになれる人はいない。こんなに大切なものを、さよならの一言で終わらせたくない。'
    },
    {
      speaker: 'B',
      english: 'Jake...',
      japanese: 'ジェイク…'
    },
    {
      speaker: 'A',
      english: "{{It's you that I'm missin'}}. Every single day. {{Take my hand}}. Let's figure this out together.",
      japanese: '恋しいのは君だけなんだ。毎日ずっと。手をつないでくれ。一緒に乗り越えよう。'
    }
  ]
};

async function main() {
  const songName = 'Too Good to Say Goodbye';
  const artist = 'Bruno Mars';
  const videoId = 'qCq-1oQuq90';

  console.log(`\n🎵 Adding: "${songName}" by "${artist}"\n`);

  console.log('📝 Translating lyrics...');
  const lyricsJa = await translateLyrics(lyrics, songName, artist);
  console.log(lyricsJa ? '  → Translation done' : '  → Translation failed');

  const getVoice = (type) => VOICE_MAP[type] || VOICE_MAP['男性'];
  const folderName = `${songName} ${artist}`.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').trim().slice(0, 200);

  const prepared = {
    songName,
    artist,
    folderName,
    lyrics,
    lyricsJa,
    ytData: {
      videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    },
    convData,
    speakerA: { name: 'Jake', type: '男性', voice: getVoice('男性') },
    speakerB: { name: 'Emma', type: '女性', voice: getVoice('女性') },
  };

  console.log('\n🔊 Generating audio...\n');
  const song = await finalizeSong(prepared, SONGS_DIR, {
    onStatus: (msg) => console.log(msg),
  });

  console.log(`\n✅ Done!`);
  console.log(`   Folder: songs/${song.folderName}/`);
  console.log(`   Turns: ${song.conversation.length}\n`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
