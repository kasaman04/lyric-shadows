const fs = require('fs');

const lyricsMap = {
  "Dont Look Back in Anger Oasis": `Slip inside the eye of your mind
Don't you know you might find
A better place to play?
You said that you'd never been
But all the things that you've seen
Will slowly fade away

So I'll start a revolution from my bed
'Cos you said the brains I had went to my head
Step outside, the summertime's in bloom
Stand up beside the fireplace
Take that look from off your face
You ain't ever gonna burn my heart out

And so Sally can wait
She knows it's too late as we're walking on by
Her soul slides away
"But don't look back in anger," I heard you say

Take me to the place where you go
Where nobody knows if it's night or day
Please don't put your life in the hands
Of a Rock 'n' Roll band
Who'll throw it all away

I'm gonna start a revolution from my bed
'Cos you said the brains I had went to my head
Step outside 'cause summertime's in bloom
Stand up beside the fireplace
Take that look from off your face
'Cos you ain't ever gonna burn my heart out

And so Sally can wait
She knows it's too late as she's walking on by
My soul slides away
"But don't look back in anger," I heard you say

So Sally can wait
She knows it's too late as we're walking on by
Her soul slides away
"But don't look back in anger," I heard you say

So Sally can wait
She knows it's too late as she's walking on by
My soul slides away
"But don't look back in anger, don't look back in anger"
I heard you say, "at least not today"`,

  "Mad at Disney salem ilese": `I'm mad at Disney, Disney
They tricked me, tricked me
Had me wishing on a shooting star
But now I'm twenty something
I still know nothing
About who I am or what I'm not

So call me a pessimist
But I don't believe in it
Finding a true love's kiss is bullshit
'Cause I felt sad love
I felt bad love
Sometimes happy love
Turns into giving up
I felt hurt love
By the word love
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
To the motel on his snow-white horse

So call me a pessimist
But I don't believe in it
Finding a true love's kiss is bullshit
'Cause I felt sad love
I felt bad love
Sometimes happy love
Turns into giving up
I felt hurt love
By the word love
What the hell is love supposed to feel like?

What the hell is love?
What the hell is love?
What the hell is love supposed to feel like?
What the hell is love?
What the hell is love?
What the hell is love supposed to feel like?

I'm mad at Disney, Disney
They tricked me, tricked me
No more wishing on a shooting star`,

  "These Tears Andy Grammer": `These tears mean I'm lettin' you go
I'm learnin' how to be alone
I'm broken, but give it time
I'm gon' be alright

These tears mean it's settlin' in
That I'm not gon' see you again
'Til one day in another life
But I'm gon' be al—, I'm gon' be alright

I been missin' you tonight
I'll be missin' you tomorrow
It's the hardest pill to swallow
But I'm startin' to get it down
I try to think of all the times
I thought I wouldn't make it through
But somehow I always do
And I do the same for you

It don't mean I'm good with goodbye-bye-bye
But it ain't all that bad when I cry, cry, cry
'Cause these tears mean I'm lettin' you go
I'm learnin' how to be alone
I'm broken, but give it time
I'm gon' be alright
These tears mean it's settlin' in
That I'm not gon' see you again
'Til one day in another life
But I'm gon' be al—, I'm gon' be alright

I see you everywhere
On the sidewalks of my dreams
Like a distant melody
I hear you callin' and callin' to me
And I love you, but I leave you in the past, baby
Because I need to, to not go insane
And I know I love you the same

It don't mean I'm good with goodbye-bye-bye
But it ain't all that bad when I cry, cry, cry

These tears mean I'm lettin' you go
I'm learnin' how to be alone
I'm broken, but give it time
I'm gon' be alright
These tears mean it's settlin' in
That I'm not gon' see you again
'Til one day in another life
But I'm gon' be al—, I'm gon' be alright

Woah-oh, woah-oh
Woah-oh, I'm gon' be al—, I'm gon' be alright
Woah-oh, woah-oh
Woah-oh, I'm gon' be al—, I'm gon' be alright`,

  "Euphoria keshi": `She's toxic for the thrill of it
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
'Cause if I stay, you'll be the death of me

I know there's no such thing as a free ride
But when it comes to you, I'm down to pay the price
Got me cut wide open, girl, I'm bleeding
I don't know why I still need it
So kiss me and put me to sleep tonight

Heat, heat, heat, heat
Heat up, here, u-for-you, u-for-you
I try to walk away
'Cause if I stay, you'll be the death of me

Your touch is my favorite drug
Fiending for a faded love
I'm gone, all for you

Take me to euphoria, euphoria
I need you in my veins
I crave the sweet escape of euphoria, euphoria
I try to walk away
'Cause if I stay, you'll be the death of me

Yeah, yeah, yeah
Euphoria, euphoria`
};

Object.keys(lyricsMap).forEach(dir => {
  const jsonPath = `c:/Users/kazuk/Desktop/英語字幕/songs/${dir}/song.json`;
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    data.lyrics = lyricsMap[dir];
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Updated lyrics for ${dir}`);
  } else {
    console.log(`❌ File not found: ${jsonPath}`);
  }
});
