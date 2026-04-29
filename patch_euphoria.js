const fs = require('fs');

const lyrics = `She's toxic for the thrill of it
Bad news but I'm into it, she's all mine
I chase that dragon all the time
She knows how to reel me in
Use me up and she's gone again, oh, my
I stick around just for the high

Your touch is my favorite drug
Fiending for a faded love
I'm gone, all for you

Take me to euphoria, euphoria
I need you in my veins
I crave the sweet escape of euphoria, euphoria
I try to walk away
'Cause if I stay you'll be the death of me

I know there's no such thing as a free ride
(I do, I do, I do)
But when it comes to you I'm down to pay the price
Got me cut wide open, girl, I'm bleeding
(I do, I do, I do)
Just want you to kiss me and put me to sleep

Your touch is my favorite drug
Fiending for a faded love
I'm gone, all for you

Take me to euphoria, euphoria
I need you in my veins
I crave the sweet escape of euphoria, euphoria
I try to walk away
'Cause if I stay you'll be the death of me

Yeah, yeah, yeah
Euphoria, euphoria
I try to walk away
'Cause if I stay you'll be the death of me
Yeah, yeah, yeah, yeah, yeah, yeah`;

const jsonPath = 'c:/Users/kazuk/Desktop/英語字幕/songs/Euphoria keshi/song.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
data.lyrics = lyrics;
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed Euphoria lyrics');
