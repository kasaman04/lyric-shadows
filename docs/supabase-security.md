# Supabase RLS の確認と適用

対象プロジェクト: `ocygxcbqrnfpyxtvpvcm`。SQLをGitHubへ保存しても実DBへは適用されない。
本変更は自動でSQLを実行しない。Security Advisorで対象テーブルを確認してから手動適用する。

## 適用前

1. Security Advisorを再チェックし、`0013 / rls_disabled_in_public` の対象スキーマ・テーブル名を全件記録する。通知が過去の状態だけを示している可能性もある。
2. `data/rls-audit.sql` で全publicテーブルのRLS・実効権限・ポリシーを確認する。このSQLは読み取り専用で、ユーザーの行データを取得しない。
3. 公開サーバーとPCワーカーの `SUPABASE_URL` が対象プロジェクトであることを確認する。両方に有効な `SUPABASE_SERVICE_ROLE_KEY` または `SUPABASE_SECRET_KEY` が必要。値はログ・GitHub・ブラウザへ出さない。両方設定時はSERVICE_ROLE_KEYが優先される。
4. 匿名キーだけの既存構成なら、先にサーバー専用キーを設定して動作を確認する。その後サーバー変更を配備する。部分的な設定・匿名キーのみの場合、フレーズAPIは503を返す。接続設定が全くないローカル構成は従来どおり同期無効。
5. 現行のACL・ポリシー・スキーマを管理者用に保存し、バックアップの利用可否を確認する。検証環境でダミーデータによる試験を先に行う。

## 既存DBの修正

承認された適用時に `data/rls-server-only.sql` をSQL Editorで実行する。
対象は `user_phrase_preferences` と `user_pet_states` のみ。存在しないテーブルはNOTICEを出してスキップする。
学習履歴・残高・ペット・図鑑を持つstate JSONBやdevice_idは変更しない。テーブルや列の削除、データ移行、既存ポリシーの削除は行わない。

PUBLIC・anon・authenticatedのテーブル権限と独立した列権限を取り消す。
カスタムロールからの継承などで実効権限が残る場合は一括で追加変更せず、継承元を調査する。
service_roleには取得・追加・更新を許可し、既存の追加権限は取り消さない。
スキーマ全体・Storage全体の権限は一括変更しない。

新規構築では `supabase-setup.sql` と、Supabase育成保存を使う場合の `data/pet-storage.sql` を使う。
既存DBでは列単位の許可も処理する上記修正SQLを使う。

## 検証

- `data/rls-audit.sql` を再実行。対象のRLSがtrueで、anon・authenticatedの表／列のアクセス権がfalse、service_roleのSELECT・INSERT・UPDATEがtrueであること。
- 検証環境でanon・通常のauthenticatedによるRESTのSELECT・INSERT・UPDATE・DELETEが拒否され、TRUNCATE権限もないことを確認。管理者SQL Editorで成功するだけでは検証にならない。
- ダミー端末でフレーズの保存・非表示・再読込、学習時間と日別集計、チャレンジ進捗・コイン・お世話・図鑑の保持を確認。
- PCワーカーの待ち状態取得・画像保存・アプリ経由の画像取得を確認。競合時のrevision比較更新と再送時の重複防止も確認する。
- 本番の既存端末IDを変更したり既存ペットを試験で操作したりしない。ペットAPIのGETもtransact経由で保存が発生するため、読み取り専用の確認には使わない。
- Security Advisorを再チェック。他のテーブルが残る場合は、その利用方法を調べて個別に対応する。
- pet-imagesとvoice-practiceは非公開を想定。pet-storage.sqlは既存バケットを変更しないためpublic=trueなら別途影響を確認し、承認後に対象バケットだけ修正する。

## 障害時

トランザクション途中の失敗はROLLBACKする。commit後に保存できない場合は先に接続先・専用キー・service_roleの権限を確認する。
RLSを無効にしたり匿名アクセスを戻したりして復旧しない。専用キーの修正または事前保存した権限情報に基づく最小限の修正を行う。

## 残るアプリ認証の課題

現在の端末IDはSupabase Authのuser_idではない。`auth.uid() = device_id` のポリシーを足しても解決しない。
service_roleはRLSを迂回するため、この修正だけではアプリAPI経由の他端末へのアクセスは防げない。
既存端末の学習履歴を失わない所有権移行手順を用意し、認証済みユーザーとの対応付け、またはサーバー検証可能な端末認証を別途実装する必要がある。Originチェックは所有者認証ではない。
