const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function fixture() {
  const context = vm.createContext({ window: { addEventListener() {} }, navigator: {}, document: { addEventListener() {} } });
  for (const file of ['dramas.js', 'drama-playback.js', 'drama-compilations.js', 'drama-player.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'public', file), 'utf8').replace(/\binit\(\);\s*$/, ''), context);
  }
  vm.runInContext('state.dramas = window.DRAMAS; state.currentDramaId = "first-love-2022";', context);
  return { context, run: code => vm.runInContext(code, context) };
}
test('all nine episodes are joined in order with every original clip boundary', () => {
  const { context, run } = fixture();
  const drama = context.window.DRAMAS.find(item => item.id === 'first-love-2022');
  const compilation = context.window.DRAMA_COMPILATIONS[drama.id];
  assert.equal(drama.episodes.length, 9);
  assert.equal(compilation.starts.length, 413);
  assert.equal(context.window.DRAMA_PLAYBACK[`${drama.id}:all-episodes`], compilation);
  let sampleOffset = 0, clipIndex = 0;
  for (const [i, episode] of drama.episodes.entries()) {
    assert.equal(compilation.episodeIds[i], episode.id);
    assert.equal(compilation.episodeStarts[i].clipIndex, clipIndex);
    const track = context.window.DRAMA_PLAYBACK[`${drama.id}:${episode.id}`];
    for (const start of track.starts) {
      assert.ok(Math.abs(compilation.starts[clipIndex++] - (sampleOffset / 44100 + start)) < 0.000002);
    }
    sampleOffset += Math.round(track.duration * 44100);
  }
  assert.equal(compilation.duration, sampleOffset / 44100);
  assert.ok(fs.statSync(path.join(root, 'public', compilation.audio)).size > 1000000);
  const clips = run('dramaCompilationEpisode(state.dramas[0]).clips');
  assert.equal(clips.length, 413);
  assert.equal(clips[46], drama.episodes[1].clips[0]);
  assert.equal(clips.at(-1), drama.episodes.at(-1).clips.at(-1));
});
test('the library adds a compilation while preserving nine episode entries and original counts', () => {
  const { run } = fixture();
  const html = run('renderDramaGrid()');
  assert.match(html, /全話まとめ/);
  assert.match(html, /音声413件 · 22分46秒/);
  assert.equal((html.match(/class="drama-episode"/g) || []).length, 10);
  run('state.currentDramaId = null');
  assert.match(run('renderDramaGrid()'), /9話 · 音声413件/);
  run('state.currentDramaId = "breaking-bad"');
  assert.doesNotMatch(run('renderDramaGrid()'), /全話まとめ/);
});
test('compilation playback stays light with one audio element and no individual cards', () => {
  const { run } = fixture();
  run('state.currentEpisodeId = "all-episodes"');
  const html = run('renderDramaGrid()');
  assert.match(html, /第1話〜第9話 全話まとめ/);
  assert.match(html, /全話の音声/);
  assert.match(html, /all-episodes-20261029-v1\.mp3/);
  assert.match(html, /download/);
  assert.equal((html.match(/<audio\b/g) || []).length, 1);
  assert.match(html, /preload="none"/);
  assert.match(html, /href="\/first-love-audio.html"/);
  assert.equal((html.match(/class="drama-clip"/g) || []).length, 0);
  assert.equal((html.match(/class="drama-example"/g) || []).length, 0);
  run('state.currentEpisodeId = "episode-1"');
  const original = run('renderDramaGrid()');
  assert.match(original, /第1話 リラの花咲く頃/);
  assert.equal((original.match(/class="drama-clip"/g) || []).length, 46);
  assert.doesNotMatch(original, /全話まとめの音声をダウンロード/);
});
