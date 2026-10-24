# 2文をつなぐ

ホームの旧「AIと話す」は、この音声ゲームに置き換えました。旧会話APIはマウントしません。旧ページURLは `/sentence-game.html` に移動します。既存の会話データは削除せず、新ゲームの保存先と分離します。

1. 基本10種類、応用7種類、または個別の表現を選ぶ。
2. 「はじめる」でマイクを許可。ランダムな2文をElevenLabsで再生する。
3. 音声要素の `ended` を受けて録音開始。5秒以内に発話がなければ「回答なし」。話し始めた場合は5秒制限を解除し、1.6秒の無音で自動提出する（最大45秒）。録音は問題音声の再生中には開始しない。
4. OpenAIで英語音声を書き起こし、2文の意味を保つ1文になっているか採点。お手本との完全一致は要求しない。
5. 結果と短い解説、お手本音声。同じ問題を再挑戦するか、次のランダム問題へ進む。

基本: who, whom, whose, which, that, what, when, where, why, how。
応用: whoever, whomever, whatever, whichever, whenever, wherever, however。
what は先行詞を含む関係代名詞、how は方法の表現として扱います。however は方法・程度の用法です。「しかし」の接続副詞用法は対象外です。

`OPENAI_API_KEY` と `ELEVENLABS_API_KEY` はサーバーにのみ設定。既存のキーを使用します。任意設定: `OPENAI_TRANSCRIPTION_MODEL`、`SENTENCE_GAME_GRADING_MODEL`、`SENTENCE_GAME_VOICE`（ElevenLabs voice ID）、`SENTENCE_GAME_TTS_MODEL`。

保存先は標準で `data/sentence-game`。`SENTENCE_GAME_STORAGE=supabase` または既存の `PET_STORAGE=supabase` の場合は同じSupabase接続の非公開 `sentence-game` バケットを使います。`SENTENCE_GAME_STORAGE=local` でローカル保存に固定できます。音声は問題文・モデル・声から生成したIDでキャッシュし、録り直しでは再生成しません。回答の採点も同じ試行IDでは重複実行しません。公開APIから模範解答が返るのは採点後です。

マイクを使う前にiOSの音声セッションを `play-and-record` にし、終了・離脱時にマイクを停止します。画面を離れた場合は無回答扱いにせず中断します。APIエラーは採点の不正解にせず再試行できます。

検証: `node --test test/sentence-game*.test.cjs`。実API確認: `node scripts/check-sentence-game.js`（合成した英文のみ使用、キーは出力しない）。

## モンスターの生存条件

旧「聴いた時間で寿命回復」を、毎日10回の音声回答に置き換えます。正誤は不問で、同じ問題の再挑戦も1回。無回答、空の音声認識結果、お手本の再生だけは数えません。

日本時間0:00〜24:00で集計。10回未満の日があれば、その日の終了時に死亡します。アプリを閉じている場合も次回接続時に未達日を判定します。導入時点の生存中の相棒と新しい相棒には、翌日の最初の丸一日から条件を適用します。過去の死亡や図鑑は変更しません。余分に回答しても翌日への繰越はありません。

採点済み試行IDをサーバーで重複排除し、音声回答を受信したサーバー時刻の日付に加算します。締切前に届いた10回目の採点が遅れても、正しい提出日に計上します。育成保存に失敗した場合も、採点済みの結果を再利用して回数だけ同期します。端末IDは試行開始時のCookieに固定し、回答送信時に差し替えません。

聴いた時間・成長・コインによるお世話は継続します。毎日の回数はゲーム画面と育成画面に表示します。検証: `node --test test/pet-practice.test.cjs test/sentence-game.test.cjs`。
