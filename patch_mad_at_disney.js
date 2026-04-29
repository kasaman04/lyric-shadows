const fs = require('fs');

const lyrics = `I'm mad at Disney, Disney
They tricked me, tricked me
Had me wishing on a shooting star
But now I'm twenty-something
I still know nothing
About who I am or what I'm not

So call me a pessimist
But I don't believe in it
Finding a true love's kiss is bullshit
'Cause I felt sad love, I felt bad love
Sometimes happy love
Turns into giving up
I've felt hurt, love
About the word, "love"
What the hell is love supposed to feel like?

What the hell is love?
What the hell is love?
What the hell is love supposed to feel like?
What the hell is love?
What the hell is love?
What the hell is love supposed to feel like?

My fairy grandma warned me
Cinderella's story
Only ended in a bad divorce
The prince ain't sleeping when he
Takes his sleeping beauty
To the motel on his snow white horse

So call me a pessimist
But I don't believe in it
Finding a true love's kiss is bullshit
'Cause I felt sad love, I felt bad love
Sometimes happy love
Turns into giving up
I've felt hurt, love
About the word, "love"
What the hell is love supposed to feel like?

What the hell is love?
What the hell is love?
What the hell is love supposed to feel like?
What the hell is love?
What the hell is love?
What the hell is love supposed to feel like?

(Carry me away to a castle)
(Where we will live happily ever after)
(Carry me away to a castle)
(Where we will live happily ever after)

I'm mad at Disney, Disney
They tricked me, tricked me
Had me wishing on a shooting star
But now I'm twenty-something
I still know nothing
About who I am or what I'm not`;

const jsonPath = 'c:/Users/kazuk/Desktop/英語字幕/songs/Mad at Disney salem ilese/song.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
data.lyrics = lyrics;
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed Mad at Disney lyrics');
