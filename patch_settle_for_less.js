const fs = require('fs');

const lyrics = `I've been watching from the sidelines
His mistakes become my guidelines
'Cause he's holding you back
And you're better than that
I would love to buy you flowers
Take the time to talk for hours
Yeah, I can do that
I can be better than that

You should know
Everybody deserves somebody
But girl, nobody can love you like I do
And I'm not perfect, but you're so worth it
I wanna change the world for you

So baby, don't settle for less
You deserve the best
You're better than the rest
And I can be the best
So baby, don't settle for less

You could be a super model, President, or write a novel
But he's holding you back
And you're better than that
He won't even buy you flowers
Stay up late and talk for hours
I think I can do that
I can be better than that

You should know
Everybody deserves somebody
But girl, nobody can love you like I do
And I'm not perfect, but you're so worth it
I wanna change the world for you

So baby, don't settle for less
You deserve the best
You're better than the rest
And I can be the best
So baby, don't settle for less

He takes you for granted
Girl I can't stand it
Watching you panic over him
See he's just a nobody
I can be somebody
Someone to love til' the end
'Cause everybody deserves somebody
But girl, nobody can love you like I do

So baby, don't settle for less
You deserve the best
You're better than the rest
And I can be the best
So baby, don't settle for less
You deserve the best
You're better than the rest
And I can be the best
So baby, don't settle for less`;

const jsonPath = 'c:/Users/kazuk/Desktop/英語字幕/songs/Settle For Less Before You Exit/song.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
data.lyrics = lyrics;
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed Settle For Less lyrics');
