# 属性ごとのお墓

死亡時のお部屋、図鑑のカード、個体記録の先頭にお墓を表示する。育成中・旅立った個体は元の肖像を表示し、過去の成長写真は死亡後もそのまま残す。お部屋の背景は既存のレベル別画像を使う。育成データ・死亡判定・再生による回復量は変更しない。

墓石素材: `public/pet-images/memorial-stone-v1.png`。承認されたデモの丸い墓石と白い花を、組み込み画像生成ツール（built-in image_gen、編集モード）で透過PNGにした。名前と属性マークはゲーム側で重ねる。

属性マーク: 火＝炎、水＝しずく、草＝双葉、雷＝稲妻、氷＝雪の結晶、風＝風の線、土＝山・岩、毒＝きのこ、光＝太陽、闇＝三日月。`public/pet-art.js` のコードで同じ輪郭・配色に揃えたSVGを描く。

## 生成に使用した最終プロンプト

```text
Use case: background-extraction / precise-object-edit. Edit the approved reference image. Extract ONLY the little simple cartoon tombstone and its single small white flower from the center of the room, making a reusable transparent game sprite. Preserve the exact approved drawing style: thick dark olive-brown outline, chunky rounded arch, warm pale gray-beige stone, minimal soft shading, a narrow light inset edge, plain low rectangular base, tiny white five-petal flower with yellow center and one green leaf at the bottom right. Remove the sprout emblem and the Japanese name from the stone face, leaving a clean BLANK uninterrupted face where code will place the element emblem and pet name. Remove ALL room, floor, shadows outside the sprite, plants, furniture, UI, labels and text. Real transparent alpha outside the sprite, no fake checkerboard and no solid background. One whole centered front-facing tombstone with flower, no cropping, on a square canvas, sprite fills about 75% of canvas width and 90% of height. Match the proportions of the approved grave; do not add sculptural detail or realism. No text, no emblem, no symbols on the face, no living character, no ghost, no skull, no cross. The original cute 2D game artwork must remain consistent; do not redraw as photorealism or a garden scene.
```

参照: 承認済みデモ `exec-9f5c7bd7-14ea-4dc3-a59a-64f4edcfd2fa.png`。元のゲームの画風を維持し、背景やUIは素材へ焼き込まない。

## 確認

`node --test test/pet-memorial.test.cjs test/pet-listening-life.test.cjs test/pet.test.cjs test/pet-frames.test.cjs`

`node tmp/preview-pet-memorial.cjs` はテスト用データだけを描画し、10属性のスマホ画面と図鑑・記録を確認する。実際の相棒をテストのために死亡させない。
