/**
 * preview-with-lyrics.js - Preview conversation with manual lyrics (no audio)
 * Generates conversation + lyrics translation, saves to tmp-preview.json
 */
const path = require('path');
const fs = require('fs-extra');
const {
  translateLyrics,
  generateConversation,
  VOICE_MAP,
} = require('./lib/generate');
require('dotenv').config();

const SONGS_DIR = path.join(__dirname, 'songs');
const PREVIEW_PATH = path.join(__dirname, 'tmp-preview.json');

// ===== CONFIG =====
const CONFIG = {
  songName: 'Forever',
  artist: '赤西仁',
  videoId: 'NB6PIoxp4k8',
  lyrics: `Da Da Da Da Da- Da Da- Da Da Da Da Da da Da Da
Da Da Da Da Da- Da Da- Da Da Da Da Da da Da Da

No matter what you do,
you know that I will always be there
And you will never leave a voicemail
I'll answer every call you make to me
And if you're ever feeling cold I'll chop your firewood
And when you're feeling bad you know
I'll hold you 'til you're feeling good
'Cuz you got the thing
that makes my heart sing when I'm next to you

And I don't care
How long it takes
Cuz I just care
About the joy you make
In my life, be my wife
I just want you to know

I hope this love lasts forever, ever, ever
I hope this love lasts forever, ever, ever

Whenever I get lonely I make myself remember your smile
And when the rain drops outside,
I picture myself cuddling next you
And if we're running a race you know I'll let you win
I'm carving our names on a tree like back when we were ten
My mouth can't translate the things my heart says
When we're together and you're taking my breath away

And I don't care how long it takes
I swear I swear
For you I'd wait
Anywhere, just say you'll be there
We'll walk hand in hand

And make this love last forever, ever, ever
We'll make this love last forever, ever, ever

So close your eyes and count to ten
I'm not ready you should do it again
Just give me one second 'cuz I
I- I
I got a special message but I
I-I-I
I gotta breathe
Cuz now I can't breathe
I'm takin' a knee...
This ring is a sign, I want you as mine, forever and ever

Da Da Da Da Da- Da Da- Da Da Da Da Da da Da Da
Da Da Da Da Da- Da Da- Da Da Da Da Da da Da Da
Da Da Da Da Da- Da Da- Da Da Da Da Da da Da Da
Da Da Da Da Da- Da Da- Da Da Da Da Da da Da Da`,
};

async function main() {
  const { songName, artist, videoId, lyrics } = CONFIG;
  const ytData = {
    videoId,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };

  console.log(`\n🎵 Previewing: "${songName}" by "${artist}"\n`);

  // Translate lyrics
  console.log('📝 Translating lyrics...');
  const lyricsJa = await translateLyrics(lyrics, songName, artist);
  console.log(lyricsJa ? '  → Translation done' : '  → Translation failed');

  // Generate conversation (no audio)
  const convData = await generateConversation(songName, artist, lyrics, {
    onStatus: (msg) => console.log(msg),
  });

  // Show preview
  console.log('\n' + '─'.repeat(60));
  console.log('📋 CONVERSATION PREVIEW');
  console.log('─'.repeat(60));
  console.log(`  Relationship : ${convData.relationship}`);
  console.log(`  Setting      : ${convData.setting}`);
  console.log(`  Speaker A    : ${convData.speakerA.name} (${convData.speakerA.type})`);
  console.log(`  Speaker B    : ${convData.speakerB.name} (${convData.speakerB.type})`);
  console.log('─'.repeat(60));

  for (const turn of convData.conversation) {
    const name = turn.speaker === 'A' ? convData.speakerA.name : convData.speakerB.name;
    const english = turn.english.replace(/\{\{([^}]+)\}\}/g, '[$1]').replace(/\[\[([^\]]+)\]\]/g, '[$1]');
    console.log(`\n  ${turn.speaker} (${name}): ${english}`);
    console.log(`    → ${turn.japanese}`);
  }
  console.log('\n' + '─'.repeat(60));

  // Save to tmp-preview.json for finalize-preview.js
  const getVoice = (type) => VOICE_MAP[type] || VOICE_MAP['男性'];
  const folderName = `${songName} ${artist}`.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').trim().slice(0, 200);

  await fs.writeJson(PREVIEW_PATH, {
    isNew: true,
    songName,
    artist,
    folderName,
    lyrics,
    lyricsJa,
    ytData,
    relationship: convData.relationship,
    setting: convData.setting,
    speakerA: { name: convData.speakerA.name, type: convData.speakerA.type, voice: getVoice(convData.speakerA.type) },
    speakerB: { name: convData.speakerB.name, type: convData.speakerB.type, voice: getVoice(convData.speakerB.type) },
    conversation: convData.conversation,
  }, { spaces: 2 });

  console.log('\n✅ Preview saved to tmp-preview.json');
  console.log('👉 OKなら: node finalize-preview.js で音声生成');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
