# まめぷにの初期画像

完成画像: `baby-v2.png`（透過PNG）。組み込み画像生成ツールで編集し、生成されたアルファをそのまま保存。

編集時のプロンプト:

> Use case: precise-object-edit. Edit target: the attached transparent game character. Remove the pink bowl and its contents completely. Redraw only its two short arms so they hang naturally relaxed along either side, tiny mitten hands empty. Its mint body belly is unobstructed. Preserve this exact character identity: pale mint pear-shaped round body, black pill eyes, tiny flat horizontal mouth, thick organic black outlines, two little feet, yellow bean-shaped head sprout, soft subtle flat color texture, frontal pose, framing and transparent alpha background. No plate, bowl, food, utensil or held object. No new accessories, text, shadow, scenery or UI. One whole character with real transparent background.

進化時のプロンプトは `lib/pet-image.js` の `evolutionPrompt`。その子の直前の画像を参照してapp-serverが生成する。
