# 🎵 Lyric Shadows

英語の歌詞から生まれた自然な会話でシャドーイング練習ができるWebアプリ。

## 機能

- YouTube サムネイル付き曲カード
- Gemini AI が歌詞をベースに自然な英会話を生成
- ElevenLabs で音声合成（シャドーイング用）
- 💬 会話タブ：文ごとに再生・日本語訳表示
- 🎵 Song タブ：歌詞（英語＋日本語）＋ YouTube 再生

## セットアップ

1. **依存関係インストール**
```bash
npm install
```

2. **`.env` ファイルを作成**
```
GEMINI_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
YOUTUBE_API_KEY=your_key
PORT=3000
```

3. **サーバー起動**
```bash
node server.js
```

4. **曲を追加**
```bash
node add-song.js "曲名" "アーティスト名"
```

## 技術スタック

- **Backend**: Node.js / Express
- **AI**: Gemini 2.5 Flash（会話生成・歌詞翻訳）
- **TTS**: ElevenLabs
- **API**: YouTube Data API v3 / lyrics.ovh
- **Frontend**: Vanilla JS / CSS
