# 2文をつなぐ：固定510問と事前生成音声

17種類に各30問。元の34問のID・英文・訳を維持し、476問を追加した。各問題に2つの英文と訳、お手本の英文と訳、文法の説明がある。

- `data/sentence-game-base.json`: 元の34問。保存済み復習ノートとの互換性を保つ。
- `data/sentence-game-additions.tsv`: 追加476問の編集元。`|`区切りで問題文1・問題文2・お手本・各日本語訳の6列。
- `data/sentence-game-questions.json`: アプリが使う全510問。
- `data/sentence-game-audio.json`: 問題・お手本のMP3と文ごとの再生時刻。
- `public/sentence-game-audio/`: 公開用MP3のみ、1,020本。

音声はElevenLabsのBelle、`eleven_v4`で事前生成。24kHz・モノラル・64kbps MP3。既存の3発言をまとめた元音声をローカルで単語単位に照合し、問題2文とお手本の間の無音で分ける。切り出した後に時刻を0へ戻して音量・フェードを調整する。これにより問題への答えの冒頭の混入や、後半が消音される問題を避ける。

アプリは一致する固定音声を優先し、通常の出題・お手本・復習再生ではElevenLabsに接続しない。文字起こし・採点のためのOpenAI接続は引き続き必要。従来の保存済み英文など固定音声と一致しない文は従来のキャッシュ／生成処理を使う。

出題済みIDをブラウザに保存し、再読み込み後も未出題を優先する。全種類では510問、種類指定では30問を一巡すると次の周回に進む。他の種類の履歴は残す。「同じ問題でもう一度」は履歴をリセットしない。履歴は使用中のブラウザ内に保存する。

## 例文・音声を更新する手順

1. TSVの英文・訳を編集し、`node scripts/prepare-sentence-expansion.cjs`で再構築する。各種類28問の追加、重複、訳、句読点を確認する。
2. `node scripts/generate-sentence-audio.cjs --cache-only`で未作成の元音声を取得する。APIキーは`.env`に置く。既存の同一英文・声・モデルはキャッシュを再利用する。
3. `python scripts/align-sentence-audio.py`で単語の時刻を求める。ローカルのfaster-whisperとダウンロード済みbase.enモデルが必要。`SENTENCE_ALIGN_MODEL`でモデルのパスを指定できる。音声は外部へ送らない。
4. `node scripts/generate-sentence-audio.cjs`で公開用MP3を作る。元音声と照合結果があれば追加の音声生成費用はかからない。
5. `node scripts/verify-sentence-audio.cjs`で全MP3をデコード確認する。`--asr`を付けると各種類と長さの外れ値から選んだ問題・お手本を既存の文字起こしAPIで照合する。
6. `node --test test/sentence-game.test.cjs`で出題・履歴・固定音声・復習・採点を確認する。

生成は同時2件、途中停止後も再開可能。FFmpegが必要。元WAV・照合データ・検証用ファイルは`tmp/sentence-expansion/`に保存し、GitHubへは公開用MP3と上記の例文・音声インデックスを保存する。APIキー・録音・端末の個人データを追加しない。
