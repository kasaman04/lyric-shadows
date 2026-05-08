# Phrase Image Prompts

Manual image-generation prompt bank for the Conversation Phrases tab.

Recommended output:
- Save each image as WebP when possible.
- Put files in `public/phrase-images/phrases/`.
- File name must match the phrase id, for example `ask-001.webp`.
- Use a strict 16:9 wide landscape card image.
- Keep only the English phrase as small overlay text in the image.
- Do not put Japanese text, speech bubbles, logos, or watermarks in the image.
- Most prompts use a two-panel card. Short reaction phrases may use a single strong moment.
- Keep the art style consistent, but vary characters, age, hair, clothing, setting, props, and camera angle.

Style direction:
- Clean modern educational illustration.
- Mature and app-friendly, not childish, not anime, not photorealistic.
- Semi-flat digital illustration with gentle depth.
- Simple background, clear facial expressions, natural colors.
- Same style across cards; different people and memorable situations across cards.

## 1. ask-001 - Can I ask you something?

- Category: 話しかける
- Usage note: 少し真面目な質問や相談を切り出すとき。
- File name: `ask-001.webp`
- Target file: `public/phrase-images/phrases/ask-001.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Can I ask you something?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Can I ask you something?
B: Yeah, of course. What is it?
A: Do you think I should text her back?
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Can I ask you something?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a smartphone on the table showing an unread-message feeling, but with no readable screen text.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Can I ask you something?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Can I ask you something?"
Context for the image only, do not render this Japanese text: 少し真面目な質問や相談を切り出すとき。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Can I ask you something?".
```

## 2. clarify-001 - What do you mean?

- Category: 聞き返す
- Usage note: 意味がはっきりしないときに聞き返す。
- File name: `clarify-001.webp`
- Target file: `public/phrase-images/phrases/clarify-001.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "What do you mean?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I think we need some space.
B: What do you mean?
A: I mean we should slow things down a little.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "What do you mean?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using two people with a little physical distance between them, using chairs, a sofa, or a quiet corner to show emotional delicacy.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "What do you mean?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "What do you mean?"
Context for the image only, do not render this Japanese text: 意味がはっきりしないときに聞き返す。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "What do you mean?".
```

## 3. clarify-002 - Sorry, what was that?

- Category: 聞き返す
- Usage note: 聞こえなかったときの自然な聞き返し。
- File name: `clarify-002.webp`
- Target file: `public/phrase-images/phrases/clarify-002.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Sorry, what was that?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Sorry, what was that?
B: I said the meeting got moved to three.
A: Got it. Thanks.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Sorry, what was that?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a work setting with a laptop, notebook, or meeting-room detail that makes this feel like a specific workplace moment.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Sorry, what was that?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Sorry, what was that?"
Context for the image only, do not render this Japanese text: 聞こえなかったときの自然な聞き返し。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Sorry, what was that?".
```

## 4. clarify-003 - Can you say that again?

- Category: 聞き返す
- Usage note: もう一度言ってほしいとき。
- File name: `clarify-003.webp`
- Target file: `public/phrase-images/phrases/clarify-003.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Can you say that again?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Can you say that again?
B: Sure. Take the second exit, then turn left.
A: Okay, second exit, then left.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Can you say that again?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a location cue such as a station map, doorway, package, or hallway object that makes the situation instantly recognizable.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Can you say that again?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Can you say that again?"
Context for the image only, do not render this Japanese text: もう一度言ってほしいとき。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Can you say that again?".
```

## 5. clarify-004 - Wait, really?

- Category: 聞き返す
- Usage note: 驚きながら確認するとき。
- File name: `clarify-004.webp`
- Target file: `public/phrase-images/phrases/clarify-004.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Wait, really?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: They offered me the job.
B: Wait, really?
A: Yeah. I still can't believe it.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Wait, really?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a work setting with a laptop, notebook, or meeting-room detail that makes this feel like a specific workplace moment.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Wait, really?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Wait, really?"
Context for the image only, do not render this Japanese text: 驚きながら確認するとき。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Wait, really?".
```

## 6. clarify-005 - How come?

- Category: 聞き返す
- Usage note: 理由を自然に聞くとき。
- File name: `clarify-005.webp`
- Target file: `public/phrase-images/phrases/clarify-005.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "How come?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I'm not going tonight.
B: How come?
A: I'm exhausted, and I need a quiet night.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "How come?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using an evening-at-home cue such as a sofa, warm lamp, shoes by the door, or untouched going-out bag.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "How come?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "How come?"
Context for the image only, do not render this Japanese text: 理由を自然に聞くとき。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "How come?".
```

## 7. clarify-006 - In what way?

- Category: 聞き返す
- Usage note: 相手の表現を具体化してほしいとき。
- File name: `clarify-006.webp`
- Target file: `public/phrase-images/phrases/clarify-006.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "In what way?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: It just felt different.
B: In what way?
A: Like she was already somewhere else mentally.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "In what way?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a kitchen table in soft evening light, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "In what way?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "In what way?"
Context for the image only, do not render this Japanese text: 相手の表現を具体化してほしいとき。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "In what way?".
```

## 8. clarify-007 - What makes you say that?

- Category: 聞き返す
- Usage note: 相手がそう思った理由を聞くとき。
- File name: `clarify-007.webp`
- Target file: `public/phrase-images/phrases/clarify-007.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "What makes you say that?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I don't think he trusts me.
B: What makes you say that?
A: He double-checks everything I do.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "What makes you say that?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using two people with a little physical distance between them, using chairs, a sofa, or a quiet corner to show emotional delicacy.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "What makes you say that?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "What makes you say that?"
Context for the image only, do not render this Japanese text: 相手がそう思った理由を聞くとき。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "What makes you say that?".
```

## 9. clarify-008 - Are you saying...?

- Category: 聞き返す
- Usage note: 相手の意図を確認しながら言い換えるとき。
- File name: `clarify-008.webp`
- Target file: `public/phrase-images/phrases/clarify-008.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Are you saying...?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: We might need to start over.
B: Are you saying the whole plan is off?
A: Not off, just not ready yet.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Are you saying...?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a classroom corner after class, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Are you saying...?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Are you saying...?"
Context for the image only, do not render this Japanese text: 相手の意図を確認しながら言い換えるとき。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Are you saying...?".
```

## 10. clarify-009 - Do you mean...?

- Category: 聞き返す
- Usage note: 自分の理解が合っているか確認するとき。
- File name: `clarify-009.webp`
- Target file: `public/phrase-images/phrases/clarify-009.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Do you mean...?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Let's keep it casual.
B: Do you mean no labels?
A: Yeah, at least for now.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Do you mean...?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using two people with a little physical distance between them, using chairs, a sofa, or a quiet corner to show emotional delicacy.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Do you mean...?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Do you mean...?"
Context for the image only, do not render this Japanese text: 自分の理解が合っているか確認するとき。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Do you mean...?".
```

## 11. clarify-010 - Could you be more specific?

- Category: 聞き返す
- Usage note: もっと具体的に説明してほしいとき。
- File name: `clarify-010.webp`
- Target file: `public/phrase-images/phrases/clarify-010.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Could you be more specific?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: The design feels off.
B: Could you be more specific?
A: The colors feel too loud for this app.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Could you be more specific?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a work setting with a laptop, notebook, or meeting-room detail that makes this feel like a specific workplace moment.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Could you be more specific?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Could you be more specific?"
Context for the image only, do not render this Japanese text: もっと具体的に説明してほしいとき。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Could you be more specific?".
```

## 12. real-awkward-001 - I didn't mean it like that.

- Category: 気まずさをほどく
- Usage note: 言い方がきつく聞こえたかもしれない時に、誤解をほどく。
- File name: `real-awkward-001.webp`
- Target file: `public/phrase-images/phrases/real-awkward-001.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I didn't mean it like that.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I didn't mean it like that.
B: It just sounded kind of harsh.
A: I know. Let me say it again.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I didn't mean it like that." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a quiet workplace lounge with a laptop and notebooks, over-the-shoulder view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I didn't mean it like that." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I didn't mean it like that."
Context for the image only, do not render this Japanese text: 言い方がきつく聞こえたかもしれない時に、誤解をほどく。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I didn't mean it like that.".
```

## 13. real-awkward-002 - Let's not make this weird.

- Category: 気まずさをほどく
- Usage note: 変な空気になりそうな時に、軽く戻す。
- File name: `real-awkward-002.webp`
- Target file: `public/phrase-images/phrases/real-awkward-002.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Let's not make this weird.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Let's not make this weird.
B: Yeah, I don't want that either.
A: Good. We can just be normal.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Let's not make this weird." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using two people with a little physical distance between them, using chairs, a sofa, or a quiet corner to show emotional delicacy.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Let's not make this weird." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Let's not make this weird."
Context for the image only, do not render this Japanese text: 変な空気になりそうな時に、軽く戻す。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Let's not make this weird.".
```

## 14. real-awkward-003 - Can we start over?

- Category: 気まずさをほどく
- Usage note: 会話がこじれた時に、やり直したいと伝える。
- File name: `real-awkward-003.webp`
- Target file: `public/phrase-images/phrases/real-awkward-003.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Can we start over?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Can we start over?
B: I think I'd like that.
A: Okay. I should've listened first.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Can we start over?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a bright office hallway near an elevator, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Can we start over?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Can we start over?"
Context for the image only, do not render this Japanese text: 会話がこじれた時に、やり直したいと伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Can we start over?".
```

## 15. real-awkward-004 - That came out wrong.

- Category: 気まずさをほどく
- Usage note: 自分の言い方が悪かったとすぐ修正する。
- File name: `real-awkward-004.webp`
- Target file: `public/phrase-images/phrases/real-awkward-004.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "That came out wrong.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: That came out wrong.
B: Yeah, it kind of did.
A: Sorry. I meant I'm worried about you.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "That came out wrong." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a cozy apartment living room, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "That came out wrong." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "That came out wrong."
Context for the image only, do not render this Japanese text: 自分の言い方が悪かったとすぐ修正する。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "That came out wrong.".
```

## 16. real-awkward-005 - I don't want this to be a thing.

- Category: 気まずさをほどく
- Usage note: 小さな違和感を大ごとにしたくない時。
- File name: `real-awkward-005.webp`
- Target file: `public/phrase-images/phrases/real-awkward-005.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I don't want this to be a thing.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I don't want this to be a thing.
B: Me neither, but it bothered me.
A: Then let's talk about it now.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I don't want this to be a thing." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a train station concourse with an abstract map board, wide environmental two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I don't want this to be a thing." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I don't want this to be a thing."
Context for the image only, do not render this Japanese text: 小さな違和感を大ごとにしたくない時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I don't want this to be a thing.".
```

## 17. real-awkward-006 - I feel like we're avoiding the obvious.

- Category: 気まずさをほどく
- Usage note: お互い避けている話題に触れる。
- File name: `real-awkward-006.webp`
- Target file: `public/phrase-images/phrases/real-awkward-006.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I feel like we're avoiding the obvious.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I feel like we're avoiding the obvious.
B: You mean what happened last night?
A: Yeah. We should probably talk about it.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I feel like we're avoiding the obvious." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a kitchen table in soft evening light, diagonal composition with one person in the foreground.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I feel like we're avoiding the obvious." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I feel like we're avoiding the obvious."
Context for the image only, do not render this Japanese text: お互い避けている話題に触れる。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I feel like we're avoiding the obvious.".
```

## 18. real-awkward-007 - No hard feelings.

- Category: 気まずさをほどく
- Usage note: 悪く思っていないと伝えて空気を軽くする。
- File name: `real-awkward-007.webp`
- Target file: `public/phrase-images/phrases/real-awkward-007.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "No hard feelings.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: No hard feelings.
B: Really? I felt bad about it.
A: Really. We're okay.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "No hard feelings." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a park bench on a calm afternoon, over-the-shoulder view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "No hard feelings." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "No hard feelings."
Context for the image only, do not render this Japanese text: 悪く思っていないと伝えて空気を軽くする。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "No hard feelings.".
```

## 19. real-awkward-008 - I don't want to assume.

- Category: 気まずさをほどく
- Usage note: 決めつけずに確認したい時。
- File name: `real-awkward-008.webp`
- Target file: `public/phrase-images/phrases/real-awkward-008.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I don't want to assume.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I don't want to assume.
B: Ask me.
A: Are you upset with me?
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I don't want to assume." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a classroom corner after class, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I don't want to assume." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I don't want to assume."
Context for the image only, do not render this Japanese text: 決めつけずに確認したい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I don't want to assume.".
```

## 20. real-awkward-009 - Can we clear the air?

- Category: 気まずさをほどく
- Usage note: モヤモヤした空気を解消したい時。
- File name: `real-awkward-009.webp`
- Target file: `public/phrase-images/phrases/real-awkward-009.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Can we clear the air?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Can we clear the air?
B: Yeah, I think we need to.
A: I don't want us acting strange all week.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Can we clear the air?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a shared workspace with plants and a tablet, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Can we clear the air?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Can we clear the air?"
Context for the image only, do not render this Japanese text: モヤモヤした空気を解消したい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Can we clear the air?".
```

## 21. real-awkward-010 - I know this is awkward.

- Category: 気まずさをほどく
- Usage note: 気まずさを認めてから話し始める。
- File name: `real-awkward-010.webp`
- Target file: `public/phrase-images/phrases/real-awkward-010.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I know this is awkward.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I know this is awkward.
B: A little, yeah.
A: But I'd rather be honest than pretend.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I know this is awkward." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a front-door entryway with bags and shoes, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I know this is awkward." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I know this is awkward."
Context for the image only, do not render this Japanese text: 気まずさを認めてから話し始める。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I know this is awkward.".
```

## 22. real-close-001 - I'm glad you came.

- Category: 距離を縮める
- Usage note: 来てくれて嬉しいと素直に伝える。
- File name: `real-close-001.webp`
- Target file: `public/phrase-images/phrases/real-close-001.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I'm glad you came.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I'm glad you came.
B: I almost didn't.
A: Well, I'm really glad you did.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I'm glad you came." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a quiet workplace lounge with a laptop and notebooks, wide environmental two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I'm glad you came." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I'm glad you came."
Context for the image only, do not render this Japanese text: 来てくれて嬉しいと素直に伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I'm glad you came.".
```

## 23. real-close-002 - I was hoping you'd say that.

- Category: 距離を縮める
- Usage note: 相手の返事が嬉しかった時。
- File name: `real-close-002.webp`
- Target file: `public/phrase-images/phrases/real-close-002.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I was hoping you'd say that.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I think I'd like to see you again.
B: I was hoping you'd say that.
A: Good. Then dinner next week?
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I was hoping you'd say that." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using an evening-at-home cue such as a sofa, warm lamp, shoes by the door, or untouched going-out bag.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I was hoping you'd say that." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I was hoping you'd say that."
Context for the image only, do not render this Japanese text: 相手の返事が嬉しかった時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I was hoping you'd say that.".
```

## 24. real-close-003 - I feel like we get each other.

- Category: 距離を縮める
- Usage note: お互い分かり合えている感覚を伝える。
- File name: `real-close-003.webp`
- Target file: `public/phrase-images/phrases/real-close-003.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I feel like we get each other.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I feel like we get each other.
B: Yeah, it's weirdly easy.
A: Exactly. I don't have to explain everything.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I feel like we get each other." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using two people with a little physical distance between them, using chairs, a sofa, or a quiet corner to show emotional delicacy.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I feel like we get each other." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I feel like we get each other."
Context for the image only, do not render this Japanese text: お互い分かり合えている感覚を伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I feel like we get each other.".
```

## 25. real-close-004 - You make it easy to talk.

- Category: 距離を縮める
- Usage note: 相手に話しやすさを伝える。
- File name: `real-close-004.webp`
- Target file: `public/phrase-images/phrases/real-close-004.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "You make it easy to talk.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: You make it easy to talk.
B: That's a really nice thing to say.
A: I mean it. I don't feel judged.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "You make it easy to talk." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a cozy apartment living room, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "You make it easy to talk." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "You make it easy to talk."
Context for the image only, do not render this Japanese text: 相手に話しやすさを伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "You make it easy to talk.".
```

## 26. real-close-005 - I like being around you.

- Category: 距離を縮める
- Usage note: 一緒にいる心地よさを伝える。
- File name: `real-close-005.webp`
- Target file: `public/phrase-images/phrases/real-close-005.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I like being around you.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I like being around you.
B: Even when I'm complaining?
A: Especially then. It's kind of honest.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I like being around you." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a train station concourse with an abstract map board, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I like being around you." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I like being around you."
Context for the image only, do not render this Japanese text: 一緒にいる心地よさを伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I like being around you.".
```

## 27. real-close-006 - I didn't expect to have this much fun.

- Category: 距離を縮める
- Usage note: 予想以上に楽しかった時。
- File name: `real-close-006.webp`
- Target file: `public/phrase-images/phrases/real-close-006.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I didn't expect to have this much fun.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I didn't expect to have this much fun.
B: Same. This was surprisingly great.
A: We should do this again.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I didn't expect to have this much fun." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a kitchen table in soft evening light, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I didn't expect to have this much fun." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I didn't expect to have this much fun."
Context for the image only, do not render this Japanese text: 予想以上に楽しかった時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I didn't expect to have this much fun.".
```

## 28. real-close-007 - You can tell me stuff.

- Category: 距離を縮める
- Usage note: 相手に安心して話していいと伝える。
- File name: `real-close-007.webp`
- Target file: `public/phrase-images/phrases/real-close-007.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "You can tell me stuff.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: You can tell me stuff.
B: I know. I'm just not used to that.
A: Take your time. I'm not going anywhere.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "You can tell me stuff." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a park bench on a calm afternoon, wide environmental two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "You can tell me stuff." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "You can tell me stuff."
Context for the image only, do not render this Japanese text: 相手に安心して話していいと伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "You can tell me stuff.".
```

## 29. real-close-008 - That means a lot.

- Category: 距離を縮める
- Usage note: 相手の言葉や行動が嬉しかった時。
- File name: `real-close-008.webp`
- Target file: `public/phrase-images/phrases/real-close-008.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "That means a lot.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I saved you a seat.
B: That means a lot.
A: Of course. I know today was rough.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "That means a lot." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a classroom corner after class, diagonal composition with one person in the foreground.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "That means a lot." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "That means a lot."
Context for the image only, do not render this Japanese text: 相手の言葉や行動が嬉しかった時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "That means a lot.".
```

## 30. real-close-009 - I'm happy you're here.

- Category: 距離を縮める
- Usage note: 相手がいること自体が嬉しい時。
- File name: `real-close-009.webp`
- Target file: `public/phrase-images/phrases/real-close-009.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I'm happy you're here.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I'm happy you're here.
B: I needed to get out of my head.
A: Then stay as long as you want.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I'm happy you're here." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a shared workspace with plants and a tablet, over-the-shoulder view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I'm happy you're here." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I'm happy you're here."
Context for the image only, do not render this Japanese text: 相手がいること自体が嬉しい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I'm happy you're here.".
```

## 31. real-close-010 - I trust you with this.

- Category: 距離を縮める
- Usage note: 大事なことを相手に任せたり打ち明ける時。
- File name: `real-close-010.webp`
- Target file: `public/phrase-images/phrases/real-close-010.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I trust you with this.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I trust you with this.
B: I won't tell anyone.
A: I know. That's why I'm telling you.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I trust you with this." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using two people with a little physical distance between them, using chairs, a sofa, or a quiet corner to show emotional delicacy.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I trust you with this." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I trust you with this."
Context for the image only, do not render this Japanese text: 大事なことを相手に任せたり打ち明ける時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I trust you with this.".
```

## 32. real-honest-001 - I need to be honest with you.

- Category: 本音を言う
- Usage note: 大事な本音を切り出す。
- File name: `real-honest-001.webp`
- Target file: `public/phrase-images/phrases/real-honest-001.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I need to be honest with you.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I need to be honest with you.
B: Okay. What's going on?
A: I've been pretending I'm okay, but I'm not.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I need to be honest with you." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a quiet workplace lounge with a laptop and notebooks, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I need to be honest with you." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I need to be honest with you."
Context for the image only, do not render this Japanese text: 大事な本音を切り出す。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I need to be honest with you.".
```

## 33. real-honest-002 - This is hard for me to admit.

- Category: 本音を言う
- Usage note: 認めづらいことを話す時。
- File name: `real-honest-002.webp`
- Target file: `public/phrase-images/phrases/real-honest-002.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "This is hard for me to admit.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: This is hard for me to admit.
B: You can say it.
A: I think I was jealous.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "This is hard for me to admit." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a smartphone on the table showing an unread-message feeling, but with no readable screen text.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "This is hard for me to admit." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "This is hard for me to admit."
Context for the image only, do not render this Japanese text: 認めづらいことを話す時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "This is hard for me to admit.".
```

## 34. real-honest-003 - I don't know how to say this.

- Category: 本音を言う
- Usage note: 言いにくい話を始める。
- File name: `real-honest-003.webp`
- Target file: `public/phrase-images/phrases/real-honest-003.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I don't know how to say this.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I don't know how to say this.
B: Just say it plainly.
A: I don't think this is working anymore.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I don't know how to say this." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a work setting with a laptop, notebook, or meeting-room detail that makes this feel like a specific workplace moment.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I don't know how to say this." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I don't know how to say this."
Context for the image only, do not render this Japanese text: 言いにくい話を始める。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I don't know how to say this.".
```

## 35. real-honest-004 - I might be overthinking this.

- Category: 本音を言う
- Usage note: 考えすぎかもしれないと前置きする。
- File name: `real-honest-004.webp`
- Target file: `public/phrase-images/phrases/real-honest-004.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I might be overthinking this.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I might be overthinking this.
B: Tell me anyway.
A: You seemed distant after dinner.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I might be overthinking this." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using an evening-at-home cue such as a sofa, warm lamp, shoes by the door, or untouched going-out bag.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I might be overthinking this." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I might be overthinking this."
Context for the image only, do not render this Japanese text: 考えすぎかもしれないと前置きする。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I might be overthinking this.".
```

## 36. real-honest-005 - I don't want to lie to you.

- Category: 本音を言う
- Usage note: 嘘をつきたくないと正直に話す。
- File name: `real-honest-005.webp`
- Target file: `public/phrase-images/phrases/real-honest-005.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I don't want to lie to you.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I don't want to lie to you.
B: Then don't.
A: I still have feelings for her.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I don't want to lie to you." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a train station concourse with an abstract map board, over-the-shoulder view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I don't want to lie to you." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I don't want to lie to you."
Context for the image only, do not render this Japanese text: 嘘をつきたくないと正直に話す。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I don't want to lie to you.".
```

## 37. real-honest-006 - Part of me wants to say yes.

- Category: 本音を言う
- Usage note: 迷っている本音を伝える。
- File name: `real-honest-006.webp`
- Target file: `public/phrase-images/phrases/real-honest-006.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Part of me wants to say yes.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Part of me wants to say yes.
B: And the other part?
A: The other part is scared it'll change everything.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Part of me wants to say yes." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a kitchen table in soft evening light, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Part of me wants to say yes." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Part of me wants to say yes."
Context for the image only, do not render this Japanese text: 迷っている本音を伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Part of me wants to say yes.".
```

## 38. real-honest-007 - I wasn't ready to talk about it.

- Category: 本音を言う
- Usage note: まだ話す準備ができていなかったと伝える。
- File name: `real-honest-007.webp`
- Target file: `public/phrase-images/phrases/real-honest-007.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I wasn't ready to talk about it.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I wasn't ready to talk about it.
B: I wish you had told me that.
A: I know. I shut down instead.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I wasn't ready to talk about it." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a park bench on a calm afternoon, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I wasn't ready to talk about it." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I wasn't ready to talk about it."
Context for the image only, do not render this Japanese text: まだ話す準備ができていなかったと伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I wasn't ready to talk about it.".
```

## 39. real-honest-008 - I care more than I let on.

- Category: 本音を言う
- Usage note: 平気なふりをしていたけど本当は気にしている時。
- File name: `real-honest-008.webp`
- Target file: `public/phrase-images/phrases/real-honest-008.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I care more than I let on.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I care more than I let on.
B: About me?
A: Yeah. More than I planned to.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I care more than I let on." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a classroom corner after class, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I care more than I let on." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I care more than I let on."
Context for the image only, do not render this Japanese text: 平気なふりをしていたけど本当は気にしている時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I care more than I let on.".
```

## 40. real-honest-009 - I'm trying not to take it personally.

- Category: 本音を言う
- Usage note: 傷つきすぎないようにしていると伝える。
- File name: `real-honest-009.webp`
- Target file: `public/phrase-images/phrases/real-honest-009.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I'm trying not to take it personally.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I'm trying not to take it personally.
B: But it still hurts?
A: Yeah. A little more than I expected.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I'm trying not to take it personally." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using two people with a little physical distance between them, using chairs, a sofa, or a quiet corner to show emotional delicacy.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I'm trying not to take it personally." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I'm trying not to take it personally."
Context for the image only, do not render this Japanese text: 傷つきすぎないようにしていると伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I'm trying not to take it personally.".
```

## 41. real-honest-010 - I don't want to pretend anymore.

- Category: 本音を言う
- Usage note: もう取り繕いたくない時。
- File name: `real-honest-010.webp`
- Target file: `public/phrase-images/phrases/real-honest-010.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I don't want to pretend anymore.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I don't want to pretend anymore.
B: Pretend what?
A: That I'm fine with how things are.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I don't want to pretend anymore." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a front-door entryway with bags and shoes, diagonal composition with one person in the foreground.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I don't want to pretend anymore." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I don't want to pretend anymore."
Context for the image only, do not render this Japanese text: もう取り繕いたくない時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I don't want to pretend anymore.".
```

## 42. real-schedule-001 - Does that still work for you?

- Category: 予定を調整する
- Usage note: 予定がまだ大丈夫か確認する。
- File name: `real-schedule-001.webp`
- Target file: `public/phrase-images/phrases/real-schedule-001.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Does that still work for you?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Does that still work for you?
B: Yeah, six still works.
A: Perfect. I'll meet you there.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Does that still work for you?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a work setting with a laptop, notebook, or meeting-room detail that makes this feel like a specific workplace moment.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Does that still work for you?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Does that still work for you?"
Context for the image only, do not render this Japanese text: 予定がまだ大丈夫か確認する。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Does that still work for you?".
```

## 43. real-schedule-002 - Can we push it back a bit?

- Category: 予定を調整する
- Usage note: 予定を少し遅らせたい時。
- File name: `real-schedule-002.webp`
- Target file: `public/phrase-images/phrases/real-schedule-002.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Can we push it back a bit?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Can we push it back a bit?
B: How much time do you need?
A: Maybe thirty minutes.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Can we push it back a bit?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a small city cafe by a window, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Can we push it back a bit?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Can we push it back a bit?"
Context for the image only, do not render this Japanese text: 予定を少し遅らせたい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Can we push it back a bit?".
```

## 44. real-schedule-003 - I'm running a little late.

- Category: 予定を調整する
- Usage note: 少し遅れていると伝える。
- File name: `real-schedule-003.webp`
- Target file: `public/phrase-images/phrases/real-schedule-003.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I'm running a little late.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I'm running a little late.
B: No worries. How far out are you?
A: About ten minutes.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I'm running a little late." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a bright office hallway near an elevator, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I'm running a little late." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I'm running a little late."
Context for the image only, do not render this Japanese text: 少し遅れていると伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I'm running a little late.".
```

## 45. real-schedule-004 - Can we rain check?

- Category: 予定を調整する
- Usage note: 予定を別日にしたい時。
- File name: `real-schedule-004.webp`
- Target file: `public/phrase-images/phrases/real-schedule-004.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Can we rain check?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Can we rain check?
B: Yeah, everything okay?
A: Yeah, just exhausted from work.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Can we rain check?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a work setting with a laptop, notebook, or meeting-room detail that makes this feel like a specific workplace moment.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Can we rain check?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Can we rain check?"
Context for the image only, do not render this Japanese text: 予定を別日にしたい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Can we rain check?".
```

## 46. real-schedule-005 - Let's play it by ear.

- Category: 予定を調整する
- Usage note: 状況を見て決めたい時。
- File name: `real-schedule-005.webp`
- Target file: `public/phrase-images/phrases/real-schedule-005.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Let's play it by ear.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Should we book a table now?
B: Let's play it by ear.
A: Okay, we'll see how hungry we are.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Let's play it by ear." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a train station concourse with an abstract map board, wide environmental two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Let's play it by ear." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Let's play it by ear."
Context for the image only, do not render this Japanese text: 状況を見て決めたい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Let's play it by ear.".
```

## 47. real-schedule-006 - What time works best?

- Category: 予定を調整する
- Usage note: 相手に都合の良い時間を聞く。
- File name: `real-schedule-006.webp`
- Target file: `public/phrase-images/phrases/real-schedule-006.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "What time works best?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: What time works best?
B: Probably after four.
A: Cool, let's say four thirty.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "What time works best?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a work setting with a laptop, notebook, or meeting-room detail that makes this feel like a specific workplace moment.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "What time works best?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "What time works best?"
Context for the image only, do not render this Japanese text: 相手に都合の良い時間を聞く。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "What time works best?".
```

## 48. real-schedule-007 - I'm flexible.

- Category: 予定を調整する
- Usage note: 自分は相手に合わせられると伝える。
- File name: `real-schedule-007.webp`
- Target file: `public/phrase-images/phrases/real-schedule-007.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I'm flexible.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I'm flexible.
B: Then maybe Friday night?
A: Works for me.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I'm flexible." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a work setting with a laptop, notebook, or meeting-room detail that makes this feel like a specific workplace moment.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I'm flexible." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I'm flexible."
Context for the image only, do not render this Japanese text: 自分は相手に合わせられると伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I'm flexible.".
```

## 49. real-schedule-008 - Let's lock it in.

- Category: 予定を調整する
- Usage note: 予定を確定させたい時。
- File name: `real-schedule-008.webp`
- Target file: `public/phrase-images/phrases/real-schedule-008.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Let's lock it in.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Let's lock it in.
B: Saturday at noon?
A: Yep. I'll put it on my calendar.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Let's lock it in." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a classroom corner after class, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Let's lock it in." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Let's lock it in."
Context for the image only, do not render this Japanese text: 予定を確定させたい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Let's lock it in.".
```

## 50. real-schedule-009 - I'll keep you posted.

- Category: 予定を調整する
- Usage note: 状況が分かったら知らせる時。
- File name: `real-schedule-009.webp`
- Target file: `public/phrase-images/phrases/real-schedule-009.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I'll keep you posted.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I'll keep you posted.
B: Thanks. I just need to plan around it.
A: Totally. I'll know by tonight.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I'll keep you posted." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using an evening-at-home cue such as a sofa, warm lamp, shoes by the door, or untouched going-out bag.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I'll keep you posted." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I'll keep you posted."
Context for the image only, do not render this Japanese text: 状況が分かったら知らせる時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I'll keep you posted.".
```

## 51. real-schedule-010 - Let's aim for...

- Category: 予定を調整する
- Usage note: ざっくり目標時間を決める。
- File name: `real-schedule-010.webp`
- Target file: `public/phrase-images/phrases/real-schedule-010.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Let's aim for...".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Let's aim for seven.
B: If traffic isn't terrible.
A: Right. Text me when you leave.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Let's aim for..." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a smartphone on the table showing an unread-message feeling, but with no readable screen text.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Let's aim for..." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Let's aim for..."
Context for the image only, do not render this Japanese text: ざっくり目標時間を決める。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Let's aim for...".
```

## 52. real-care-001 - Are you holding up okay?

- Category: 相手を気遣う
- Usage note: 大変そうな相手に持ちこたえているか聞く。
- File name: `real-care-001.webp`
- Target file: `public/phrase-images/phrases/real-care-001.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Are you holding up okay?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Are you holding up okay?
B: Barely, but I'm trying.
A: You don't have to do it alone.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Are you holding up okay?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a quiet workplace lounge with a laptop and notebooks, wide environmental two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Are you holding up okay?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Are you holding up okay?"
Context for the image only, do not render this Japanese text: 大変そうな相手に持ちこたえているか聞く。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Are you holding up okay?".
```

## 53. real-care-002 - You don't have to pretend with me.

- Category: 相手を気遣う
- Usage note: 無理して平気なふりをしなくていいと伝える。
- File name: `real-care-002.webp`
- Target file: `public/phrase-images/phrases/real-care-002.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "You don't have to pretend with me.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: You don't have to pretend with me.
B: I don't know how to stop.
A: Start by telling me the truth.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "You don't have to pretend with me." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a small city cafe by a window, diagonal composition with one person in the foreground.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "You don't have to pretend with me." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "You don't have to pretend with me."
Context for the image only, do not render this Japanese text: 無理して平気なふりをしなくていいと伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "You don't have to pretend with me.".
```

## 54. real-care-003 - Take your time.

- Category: 相手を気遣う
- Usage note: 急がなくていいと安心させる。
- File name: `real-care-003.webp`
- Target file: `public/phrase-images/phrases/real-care-003.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Take your time.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Take your time.
B: I don't want to keep you waiting.
A: You're not. I'm here.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Take your time." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a bright office hallway near an elevator, over-the-shoulder view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Take your time." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Take your time."
Context for the image only, do not render this Japanese text: 急がなくていいと安心させる。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Take your time.".
```

## 55. real-care-004 - Do you want to talk about it?

- Category: 相手を気遣う
- Usage note: 話したいかどうか相手に委ねる。
- File name: `real-care-004.webp`
- Target file: `public/phrase-images/phrases/real-care-004.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Do you want to talk about it?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Do you want to talk about it?
B: Not yet.
A: Okay. We don't have to.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Do you want to talk about it?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a cozy apartment living room, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Do you want to talk about it?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Do you want to talk about it?"
Context for the image only, do not render this Japanese text: 話したいかどうか相手に委ねる。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Do you want to talk about it?".
```

## 56. real-care-005 - I'm here if you need me.

- Category: 相手を気遣う
- Usage note: 必要ならそばにいると伝える。
- File name: `real-care-005.webp`
- Target file: `public/phrase-images/phrases/real-care-005.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I'm here if you need me.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I'm here if you need me.
B: Thanks. I might need a minute.
A: Take all the time you need.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I'm here if you need me." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a train station concourse with an abstract map board, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I'm here if you need me." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I'm here if you need me."
Context for the image only, do not render this Japanese text: 必要ならそばにいると伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I'm here if you need me.".
```

## 57. real-care-006 - You seem a little off.

- Category: 相手を気遣う
- Usage note: 相手の様子がいつもと違う時。
- File name: `real-care-006.webp`
- Target file: `public/phrase-images/phrases/real-care-006.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "You seem a little off.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: You seem a little off.
B: I didn't think anyone noticed.
A: I noticed. What's going on?
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "You seem a little off." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a kitchen table in soft evening light, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "You seem a little off." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "You seem a little off."
Context for the image only, do not render this Japanese text: 相手の様子がいつもと違う時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "You seem a little off.".
```

## 58. real-care-007 - Don't be so hard on yourself.

- Category: 相手を気遣う
- Usage note: 自分を責めすぎる相手に言う。
- File name: `real-care-007.webp`
- Target file: `public/phrase-images/phrases/real-care-007.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Don't be so hard on yourself.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Don't be so hard on yourself.
B: I should've known better.
A: Maybe, but you're still human.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Don't be so hard on yourself." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a park bench on a calm afternoon, wide environmental two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Don't be so hard on yourself." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Don't be so hard on yourself."
Context for the image only, do not render this Japanese text: 自分を責めすぎる相手に言う。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Don't be so hard on yourself.".
```

## 59. real-care-008 - You did what you could.

- Category: 相手を気遣う
- Usage note: 相手が尽くしたことを認める。
- File name: `real-care-008.webp`
- Target file: `public/phrase-images/phrases/real-care-008.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "You did what you could.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: You did what you could.
B: It doesn't feel like enough.
A: I know, but it mattered.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "You did what you could." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a classroom corner after class, diagonal composition with one person in the foreground.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "You did what you could." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "You did what you could."
Context for the image only, do not render this Japanese text: 相手が尽くしたことを認める。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "You did what you could.".
```

## 60. real-care-009 - Let me take care of that.

- Category: 相手を気遣う
- Usage note: 相手の負担を少し引き受ける。
- File name: `real-care-009.webp`
- Target file: `public/phrase-images/phrases/real-care-009.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Let me take care of that.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Let me take care of that.
B: You don't have to.
A: I know. I want to.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Let me take care of that." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a shared workspace with plants and a tablet, over-the-shoulder view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Let me take care of that." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Let me take care of that."
Context for the image only, do not render this Japanese text: 相手の負担を少し引き受ける。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Let me take care of that.".
```

## 61. real-care-010 - You need a break.

- Category: 相手を気遣う
- Usage note: 休んだほうがいいと伝える。
- File name: `real-care-010.webp`
- Target file: `public/phrase-images/phrases/real-care-010.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "You need a break.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: You need a break.
B: I don't have time for one.
A: Then we make time.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "You need a break." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a front-door entryway with bags and shoes, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "You need a break." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "You need a break."
Context for the image only, do not render this Japanese text: 休んだほうがいいと伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "You need a break.".
```

## 62. real-tease-001 - That's such a you thing to say.

- Category: 軽くツッコむ
- Usage note: 相手らしい発言に軽くツッコむ。
- File name: `real-tease-001.webp`
- Target file: `public/phrase-images/phrases/real-tease-001.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "That's such a you thing to say.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I brought backup snacks.
B: That's such a you thing to say.
A: And yet you're going to eat them.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "That's such a you thing to say." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a quiet workplace lounge with a laptop and notebooks, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "That's such a you thing to say." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "That's such a you thing to say."
Context for the image only, do not render this Japanese text: 相手らしい発言に軽くツッコむ。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "That's such a you thing to say.".
```

## 63. real-tease-002 - You always say that.

- Category: 軽くツッコむ
- Usage note: 相手のいつもの口癖に軽く反応する。
- File name: `real-tease-002.webp`
- Target file: `public/phrase-images/phrases/real-tease-002.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "You always say that.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: This time I'm serious.
B: You always say that.
A: Okay, fair. But this time I mean it.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "You always say that." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a small city cafe by a window, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "You always say that." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "You always say that."
Context for the image only, do not render this Japanese text: 相手のいつもの口癖に軽く反応する。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "You always say that.".
```

## 64. real-tease-003 - Okay, now you're just showing off.

- Category: 軽くツッコむ
- Usage note: 相手がすごいことをした時に茶化す。
- File name: `real-tease-003.webp`
- Target file: `public/phrase-images/phrases/real-tease-003.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Okay, now you're just showing off.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I fixed it in five minutes.
B: Okay, now you're just showing off.
A: Maybe a little.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Okay, now you're just showing off." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a bright office hallway near an elevator, wide environmental two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Okay, now you're just showing off." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Okay, now you're just showing off."
Context for the image only, do not render this Japanese text: 相手がすごいことをした時に茶化す。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Okay, now you're just showing off.".
```

## 65. real-tease-004 - Look at you.

- Category: 軽くツッコむ
- Usage note: 相手の意外な一面を軽く褒める/茶化す。
- File name: `real-tease-004.webp`
- Target file: `public/phrase-images/phrases/real-tease-004.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Look at you.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I made reservations.
B: Look at you, being responsible.
A: Don't get used to it.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Look at you." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a cozy apartment living room, diagonal composition with one person in the foreground.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Look at you." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Look at you."
Context for the image only, do not render this Japanese text: 相手の意外な一面を軽く褒める/茶化す。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Look at you.".
```

## 66. real-tease-005 - Who are you and what did you do with my friend?

- Category: 軽くツッコむ
- Usage note: 相手が珍しい行動をした時に冗談で言う。
- File name: `real-tease-005.webp`
- Target file: `public/phrase-images/phrases/real-tease-005.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Who are you and what did you do with my friend?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I woke up at six and went for a run.
B: Who are you and what did you do with my friend?
A: I know. I'm scared too.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Who are you and what did you do with my friend?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a train station concourse with an abstract map board, over-the-shoulder view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Who are you and what did you do with my friend?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Who are you and what did you do with my friend?"
Context for the image only, do not render this Japanese text: 相手が珍しい行動をした時に冗談で言う。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Who are you and what did you do with my friend?".
```

## 67. real-tease-006 - You're impossible.

- Category: 軽くツッコむ
- Usage note: 相手が手に負えないけど憎めない時。
- File name: `real-tease-006.webp`
- Target file: `public/phrase-images/phrases/real-tease-006.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "You're impossible.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I ordered dessert first.
B: You're impossible.
A: But you're smiling.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "You're impossible." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a kitchen table in soft evening light, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "You're impossible." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "You're impossible."
Context for the image only, do not render this Japanese text: 相手が手に負えないけど憎めない時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "You're impossible.".
```

## 68. real-tease-007 - There it is.

- Category: 軽くツッコむ
- Usage note: 予想通りの反応が出た時。
- File name: `real-tease-007.webp`
- Target file: `public/phrase-images/phrases/real-tease-007.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "There it is.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I just think the book was better.
B: There it is.
A: What? I'm right.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "There it is." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a park bench on a calm afternoon, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "There it is." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "There it is."
Context for the image only, do not render this Japanese text: 予想通りの反応が出た時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "There it is.".
```

## 69. real-tease-008 - Classic.

- Category: 軽くツッコむ
- Usage note: いかにもその人らしい出来事に反応する。
- File name: `real-tease-008.webp`
- Target file: `public/phrase-images/phrases/real-tease-008.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Classic.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I forgot my keys again.
B: Classic.
A: I deserve that.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Classic." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using one concrete prop from the conversation, such as a phone with photos, backpack, package, or reminder note, with no readable text.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Classic." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Classic."
Context for the image only, do not render this Japanese text: いかにもその人らしい出来事に反応する。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Classic.".
```

## 70. real-tease-009 - You're not slick.

- Category: 軽くツッコむ
- Usage note: 相手のごまかしを軽く見抜く。
- File name: `real-tease-009.webp`
- Target file: `public/phrase-images/phrases/real-tease-009.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "You're not slick.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I wasn't trying to avoid the question.
B: You're not slick.
A: Okay, maybe I was a little.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "You're not slick." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a shared workspace with plants and a tablet, wide environmental two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "You're not slick." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "You're not slick."
Context for the image only, do not render this Japanese text: 相手のごまかしを軽く見抜く。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "You're not slick.".
```

## 71. real-tease-010 - Nice save.

- Category: 軽くツッコむ
- Usage note: 相手がうまく取り繕った時に言う。
- File name: `real-tease-010.webp`
- Target file: `public/phrase-images/phrases/real-tease-010.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Nice save.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I meant that in a good way.
B: Nice save.
A: Thank you. I panicked.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Nice save." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a front-door entryway with bags and shoes, diagonal composition with one person in the foreground.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Nice save." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Nice save."
Context for the image only, do not render this Japanese text: 相手がうまく取り繕った時に言う。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Nice save.".
```

## 72. real-back-001 - Where was I?

- Category: 話を戻す
- Usage note: 話が脱線したあとに戻る。
- File name: `real-back-001.webp`
- Target file: `public/phrase-images/phrases/real-back-001.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Where was I?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Where was I?
B: You were talking about the interview.
A: Right. So the second question completely threw me.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Where was I?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a quiet workplace lounge with a laptop and notebooks, over-the-shoulder view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Where was I?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Where was I?"
Context for the image only, do not render this Japanese text: 話が脱線したあとに戻る。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Where was I?".
```

## 73. real-back-002 - What were we talking about?

- Category: 話を戻す
- Usage note: 会話の流れを思い出す時。
- File name: `real-back-002.webp`
- Target file: `public/phrase-images/phrases/real-back-002.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "What were we talking about?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: What were we talking about?
B: Your trip next month.
A: Oh, right. I still haven't booked anything.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "What were we talking about?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using one concrete prop from the conversation, such as a phone with photos, backpack, package, or reminder note, with no readable text.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "What were we talking about?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "What were we talking about?"
Context for the image only, do not render this Japanese text: 会話の流れを思い出す時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "What were we talking about?".
```

## 74. real-back-003 - Anyway, back to what I was saying.

- Category: 話を戻す
- Usage note: 脱線後に本題へ戻る。
- File name: `real-back-003.webp`
- Target file: `public/phrase-images/phrases/real-back-003.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Anyway, back to what I was saying.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Anyway, back to what I was saying.
B: Right, the email.
A: Yeah, I don't think I should send it yet.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Anyway, back to what I was saying." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a smartphone on the table showing an unread-message feeling, but with no readable screen text.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Anyway, back to what I was saying." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Anyway, back to what I was saying."
Context for the image only, do not render this Japanese text: 脱線後に本題へ戻る。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Anyway, back to what I was saying.".
```

## 75. real-back-004 - Let's not get sidetracked.

- Category: 話を戻す
- Usage note: 脱線しすぎないようにする。
- File name: `real-back-004.webp`
- Target file: `public/phrase-images/phrases/real-back-004.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Let's not get sidetracked.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Let's not get sidetracked.
B: Fair. We have ten minutes.
A: Then we need to decide now.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Let's not get sidetracked." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a cozy apartment living room, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Let's not get sidetracked." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Let's not get sidetracked."
Context for the image only, do not render this Japanese text: 脱線しすぎないようにする。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Let's not get sidetracked.".
```

## 76. real-back-005 - Before we move on...

- Category: 話を戻す
- Usage note: 次に行く前に一つ確認する。
- File name: `real-back-005.webp`
- Target file: `public/phrase-images/phrases/real-back-005.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Before we move on...".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Before we move on, can I ask one thing?
B: Sure.
A: Are we actually okay with this plan?
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Before we move on..." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using two people with a little physical distance between them, using chairs, a sofa, or a quiet corner to show emotional delicacy.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Before we move on..." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Before we move on..."
Context for the image only, do not render this Japanese text: 次に行く前に一つ確認する。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Before we move on...".
```

## 77. real-back-006 - Let's circle back to that.

- Category: 話を戻す
- Usage note: あとでその話に戻る。
- File name: `real-back-006.webp`
- Target file: `public/phrase-images/phrases/real-back-006.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Let's circle back to that.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Let's circle back to that.
B: Because it's too big for now?
A: Exactly. We need more time.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Let's circle back to that." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a kitchen table in soft evening light, diagonal composition with one person in the foreground.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Let's circle back to that." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Let's circle back to that."
Context for the image only, do not render this Japanese text: あとでその話に戻る。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Let's circle back to that.".
```

## 78. real-back-007 - That's a separate conversation.

- Category: 話を戻す
- Usage note: 別件として切り分ける。
- File name: `real-back-007.webp`
- Target file: `public/phrase-images/phrases/real-back-007.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "That's a separate conversation.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: That's a separate conversation.
B: Yeah, you're right.
A: For now, let's focus on tonight.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "That's a separate conversation." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using an evening-at-home cue such as a sofa, warm lamp, shoes by the door, or untouched going-out bag.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "That's a separate conversation." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "That's a separate conversation."
Context for the image only, do not render this Japanese text: 別件として切り分ける。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "That's a separate conversation.".
```

## 79. real-back-008 - Let's stay on track.

- Category: 話を戻す
- Usage note: 会議や相談で本題に戻す。
- File name: `real-back-008.webp`
- Target file: `public/phrase-images/phrases/real-back-008.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Let's stay on track.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Let's stay on track.
B: Sorry, I went off a little.
A: It's fine. We just need an answer today.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Let's stay on track." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a classroom corner after class, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Let's stay on track." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Let's stay on track."
Context for the image only, do not render this Japanese text: 会議や相談で本題に戻す。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Let's stay on track.".
```

## 80. real-back-009 - That brings me to my next point.

- Category: 話を戻す
- Usage note: 自然に次のポイントへつなぐ。
- File name: `real-back-009.webp`
- Target file: `public/phrase-images/phrases/real-back-009.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "That brings me to my next point.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: That brings me to my next point.
B: Which is?
A: We need to talk about timing.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "That brings me to my next point." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a shared workspace with plants and a tablet, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "That brings me to my next point." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "That brings me to my next point."
Context for the image only, do not render this Japanese text: 自然に次のポイントへつなぐ。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "That brings me to my next point.".
```

## 81. real-back-010 - Let me finish this thought.

- Category: 話を戻す
- Usage note: 考えを最後まで言わせてほしい時。
- File name: `real-back-010.webp`
- Target file: `public/phrase-images/phrases/real-back-010.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Let me finish this thought.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Let me finish this thought.
B: Sorry, go ahead.
A: I think we both want the same thing.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Let me finish this thought." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a front-door entryway with bags and shoes, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Let me finish this thought." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Let me finish this thought."
Context for the image only, do not render this Japanese text: 考えを最後まで言わせてほしい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Let me finish this thought.".
```

## 82. real-relationship-001 - I don't want to read too much into it.

- Category: 恋愛・関係性
- Usage note: 相手の行動を深読みしすぎたくない時。
- File name: `real-relationship-001.webp`
- Target file: `public/phrase-images/phrases/real-relationship-001.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I don't want to read too much into it.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I don't want to read too much into it.
B: But the message felt different?
A: Yeah. Shorter than usual.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I don't want to read too much into it." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a smartphone on the table showing an unread-message feeling, but with no readable screen text.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I don't want to read too much into it." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I don't want to read too much into it."
Context for the image only, do not render this Japanese text: 相手の行動を深読みしすぎたくない時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I don't want to read too much into it.".
```

## 83. real-relationship-002 - I thought we were on the same page.

- Category: 恋愛・関係性
- Usage note: 同じ認識だと思っていた時。
- File name: `real-relationship-002.webp`
- Target file: `public/phrase-images/phrases/real-relationship-002.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I thought we were on the same page.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I thought we were on the same page.
B: I guess we weren't.
A: Then we should talk about what this is.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I thought we were on the same page." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a small city cafe by a window, diagonal composition with one person in the foreground.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I thought we were on the same page." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I thought we were on the same page."
Context for the image only, do not render this Japanese text: 同じ認識だと思っていた時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I thought we were on the same page.".
```

## 84. real-relationship-003 - I need to know where we stand.

- Category: 恋愛・関係性
- Usage note: 関係性をはっきりさせたい時。
- File name: `real-relationship-003.webp`
- Target file: `public/phrase-images/phrases/real-relationship-003.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I need to know where we stand.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I need to know where we stand.
B: I was afraid you'd ask that.
A: I can't keep guessing.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I need to know where we stand." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a bright office hallway near an elevator, over-the-shoulder view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I need to know where we stand." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I need to know where we stand."
Context for the image only, do not render this Japanese text: 関係性をはっきりさせたい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I need to know where we stand.".
```

## 85. real-relationship-004 - I'm not trying to pressure you.

- Category: 恋愛・関係性
- Usage note: 相手を急かしたいわけではない時。
- File name: `real-relationship-004.webp`
- Target file: `public/phrase-images/phrases/real-relationship-004.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I'm not trying to pressure you.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I'm not trying to pressure you.
B: It kind of feels like pressure.
A: Then I'll slow down. I just needed to be honest.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I'm not trying to pressure you." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using two people with a little physical distance between them, using chairs, a sofa, or a quiet corner to show emotional delicacy.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I'm not trying to pressure you." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I'm not trying to pressure you."
Context for the image only, do not render this Japanese text: 相手を急かしたいわけではない時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I'm not trying to pressure you.".
```

## 86. real-relationship-005 - I don't want to mess this up.

- Category: 恋愛・関係性
- Usage note: 大切だから壊したくない時。
- File name: `real-relationship-005.webp`
- Target file: `public/phrase-images/phrases/real-relationship-005.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I don't want to mess this up.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I don't want to mess this up.
B: Then don't disappear when things get real.
A: You're right. I need to stop doing that.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I don't want to mess this up." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a train station concourse with an abstract map board, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I don't want to mess this up." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I don't want to mess this up."
Context for the image only, do not render this Japanese text: 大切だから壊したくない時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I don't want to mess this up.".
```

## 87. real-relationship-006 - This feels different.

- Category: 恋愛・関係性
- Usage note: 今までと違う特別さを感じる時。
- File name: `real-relationship-006.webp`
- Target file: `public/phrase-images/phrases/real-relationship-006.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "This feels different.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: This feels different.
B: Different good or different scary?
A: Honestly, both.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "This feels different." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a kitchen table in soft evening light, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "This feels different." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "This feels different."
Context for the image only, do not render this Japanese text: 今までと違う特別さを感じる時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "This feels different.".
```

## 88. real-relationship-007 - I need a little space.

- Category: 恋愛・関係性
- Usage note: 少し距離や時間が必要な時。
- File name: `real-relationship-007.webp`
- Target file: `public/phrase-images/phrases/real-relationship-007.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I need a little space.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I need a little space.
B: Are you ending this?
A: No. I just need to breathe.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I need a little space." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using two people with a little physical distance between them, using chairs, a sofa, or a quiet corner to show emotional delicacy.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I need a little space." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I need a little space."
Context for the image only, do not render this Japanese text: 少し距離や時間が必要な時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I need a little space.".
```

## 89. real-relationship-008 - I still care about you.

- Category: 恋愛・関係性
- Usage note: 別れても気持ちは残っている時。
- File name: `real-relationship-008.webp`
- Target file: `public/phrase-images/phrases/real-relationship-008.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I still care about you.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I still care about you.
B: That makes this harder.
A: I know. I wish caring was enough.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I still care about you." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a classroom corner after class, diagonal composition with one person in the foreground.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I still care about you." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I still care about you."
Context for the image only, do not render this Japanese text: 別れても気持ちは残っている時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I still care about you.".
```

## 90. real-relationship-009 - I don't want to be your backup plan.

- Category: 恋愛・関係性
- Usage note: 都合のいい存在になりたくない時。
- File name: `real-relationship-009.webp`
- Target file: `public/phrase-images/phrases/real-relationship-009.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I don't want to be your backup plan.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I don't want to be your backup plan.
B: That's not what this is.
A: Then show me that.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I don't want to be your backup plan." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a shared workspace with plants and a tablet, over-the-shoulder view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I don't want to be your backup plan." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I don't want to be your backup plan."
Context for the image only, do not render this Japanese text: 都合のいい存在になりたくない時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I don't want to be your backup plan.".
```

## 91. real-relationship-010 - We need to be honest about this.

- Category: 恋愛・関係性
- Usage note: 関係について正直に話す必要がある時。
- File name: `real-relationship-010.webp`
- Target file: `public/phrase-images/phrases/real-relationship-010.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "We need to be honest about this.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: We need to be honest about this.
B: I know. I've been avoiding it.
A: Me too, but it's not helping.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "We need to be honest about this." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a front-door entryway with bags and shoes, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "We need to be honest about this." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "We need to be honest about this."
Context for the image only, do not render this Japanese text: 関係について正直に話す必要がある時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "We need to be honest about this.".
```

## 92. real-work-001 - Can we circle back to that?

- Category: 仕事の会話
- Usage note: 仕事で後ほど再検討したい時。
- File name: `real-work-001.webp`
- Target file: `public/phrase-images/phrases/real-work-001.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Can we circle back to that?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Can we circle back to that?
B: Sure, what's the concern?
A: I think we need more context first.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Can we circle back to that?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a smartphone on the table showing an unread-message feeling, but with no readable screen text.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Can we circle back to that?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Can we circle back to that?"
Context for the image only, do not render this Japanese text: 仕事で後ほど再検討したい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Can we circle back to that?".
```

## 93. real-work-002 - I just want to make sure we're aligned.

- Category: 仕事の会話
- Usage note: 認識を合わせたい時。
- File name: `real-work-002.webp`
- Target file: `public/phrase-images/phrases/real-work-002.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I just want to make sure we're aligned.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I just want to make sure we're aligned.
B: Good idea. What's your understanding?
A: That we're prioritizing the mobile flow first.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I just want to make sure we're aligned." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a small city cafe by a window, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I just want to make sure we're aligned." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I just want to make sure we're aligned."
Context for the image only, do not render this Japanese text: 認識を合わせたい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I just want to make sure we're aligned.".
```

## 94. real-work-003 - Let's not overcomplicate this.

- Category: 仕事の会話
- Usage note: 仕事で複雑にしすぎないように言う。
- File name: `real-work-003.webp`
- Target file: `public/phrase-images/phrases/real-work-003.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Let's not overcomplicate this.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Let's not overcomplicate this.
B: Agreed. What's the simplest version?
A: One screen, one action, one clear result.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Let's not overcomplicate this." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a bright office hallway near an elevator, wide environmental two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Let's not overcomplicate this." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Let's not overcomplicate this."
Context for the image only, do not render this Japanese text: 仕事で複雑にしすぎないように言う。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Let's not overcomplicate this.".
```

## 95. real-work-004 - What's the blocker?

- Category: 仕事の会話
- Usage note: 何が詰まっているか聞く。
- File name: `real-work-004.webp`
- Target file: `public/phrase-images/phrases/real-work-004.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "What's the blocker?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: What's the blocker?
B: We don't have the final copy yet.
A: Okay, I'll follow up with marketing.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "What's the blocker?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a cozy apartment living room, diagonal composition with one person in the foreground.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "What's the blocker?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "What's the blocker?"
Context for the image only, do not render this Japanese text: 何が詰まっているか聞く。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "What's the blocker?".
```

## 96. real-work-005 - Can we make that the priority?

- Category: 仕事の会話
- Usage note: 優先順位を上げたい時。
- File name: `real-work-005.webp`
- Target file: `public/phrase-images/phrases/real-work-005.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Can we make that the priority?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Can we make that the priority?
B: We can, but something else has to move.
A: Then let's move the nice-to-have items.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Can we make that the priority?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a train station concourse with an abstract map board, over-the-shoulder view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Can we make that the priority?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Can we make that the priority?"
Context for the image only, do not render this Japanese text: 優先順位を上げたい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Can we make that the priority?".
```

## 97. real-work-006 - That works on my end.

- Category: 仕事の会話
- Usage note: 自分側では問題ないと伝える。
- File name: `real-work-006.webp`
- Target file: `public/phrase-images/phrases/real-work-006.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "That works on my end.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: That works on my end.
B: Great, I'll send the invite.
A: Thanks. I'll add the agenda.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "That works on my end." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a smartphone on the table showing an unread-message feeling, but with no readable screen text.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "That works on my end." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "That works on my end."
Context for the image only, do not render this Japanese text: 自分側では問題ないと伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "That works on my end.".
```

## 98. real-work-007 - Can you walk me through it?

- Category: 仕事の会話
- Usage note: 手順や考えを説明してもらう。
- File name: `real-work-007.webp`
- Target file: `public/phrase-images/phrases/real-work-007.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Can you walk me through it?".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Can you walk me through it?
B: Sure. First, the user signs in.
A: Got it. Then they land on the dashboard?
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Can you walk me through it?" naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a park bench on a calm afternoon, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Can you walk me through it?" as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Can you walk me through it?"
Context for the image only, do not render this Japanese text: 手順や考えを説明してもらう。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Can you walk me through it?".
```

## 99. real-work-008 - Let's keep this moving.

- Category: 仕事の会話
- Usage note: 会議や作業を前に進めたい時。
- File name: `real-work-008.webp`
- Target file: `public/phrase-images/phrases/real-work-008.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Let's keep this moving.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Let's keep this moving.
B: Next item is the launch checklist.
A: Perfect. What still needs an owner?
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Let's keep this moving." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a classroom corner after class, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Let's keep this moving." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Let's keep this moving."
Context for the image only, do not render this Japanese text: 会議や作業を前に進めたい時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Let's keep this moving.".
```

## 100. real-work-009 - I can take a first pass.

- Category: 仕事の会話
- Usage note: 初稿や一次対応を引き受ける。
- File name: `real-work-009.webp`
- Target file: `public/phrase-images/phrases/real-work-009.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I can take a first pass.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I can take a first pass.
B: That would help a lot.
A: I'll share something by tomorrow morning.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I can take a first pass." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a shared workspace with plants and a tablet, wide environmental two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I can take a first pass." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I can take a first pass."
Context for the image only, do not render this Japanese text: 初稿や一次対応を引き受ける。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I can take a first pass.".
```

## 101. real-work-010 - Let's make a call.

- Category: 仕事の会話
- Usage note: 迷っていることに決断を出す。
- File name: `real-work-010.webp`
- Target file: `public/phrase-images/phrases/real-work-010.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "Let's make a call.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: Let's make a call.
B: You mean ship it today?
A: Yes. The risk is low enough.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "Let's make a call." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a smartphone on the table showing an unread-message feeling, but with no readable screen text.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "Let's make a call." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "Let's make a call."
Context for the image only, do not render this Japanese text: 迷っていることに決断を出す。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "Let's make a call.".
```

## 102. real-emotion-001 - I'm really happy for you.

- Category: 感情を伝える
- Usage note: 相手の良い出来事を心から喜ぶ。
- File name: `real-emotion-001.webp`
- Target file: `public/phrase-images/phrases/real-emotion-001.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I'm really happy for you.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I got the offer.
B: I'm really happy for you.
A: Thanks. I needed to hear that.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I'm really happy for you." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a quiet workplace lounge with a laptop and notebooks, over-the-shoulder view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I'm really happy for you." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I'm really happy for you."
Context for the image only, do not render this Japanese text: 相手の良い出来事を心から喜ぶ。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I'm really happy for you.".
```

## 103. real-emotion-002 - That hurt more than I expected.

- Category: 感情を伝える
- Usage note: 思った以上に傷ついたと伝える。
- File name: `real-emotion-002.webp`
- Target file: `public/phrase-images/phrases/real-emotion-002.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "That hurt more than I expected.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: That hurt more than I expected.
B: I'm sorry. I didn't realize.
A: I know. I just needed you to know.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "That hurt more than I expected." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a small city cafe by a window, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "That hurt more than I expected." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "That hurt more than I expected."
Context for the image only, do not render this Japanese text: 思った以上に傷ついたと伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "That hurt more than I expected.".
```

## 104. real-emotion-003 - I'm proud of you.

- Category: 感情を伝える
- Usage note: 相手の頑張りを誇りに思う時。
- File name: `real-emotion-003.webp`
- Target file: `public/phrase-images/phrases/real-emotion-003.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I'm proud of you.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I finally told my boss no.
B: I'm proud of you.
A: I was shaking the whole time.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I'm proud of you." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a bright office hallway near an elevator, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults with different body types and personal styles, one in a light jacket, the other in relaxed home clothes. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I'm proud of you." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I'm proud of you."
Context for the image only, do not render this Japanese text: 相手の頑張りを誇りに思う時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I'm proud of you.".
```

## 105. real-emotion-004 - I feel a little overwhelmed.

- Category: 感情を伝える
- Usage note: 圧倒されていると伝える。
- File name: `real-emotion-004.webp`
- Target file: `public/phrase-images/phrases/real-emotion-004.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I feel a little overwhelmed.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I feel a little overwhelmed.
B: Do you want to take a break?
A: Yeah, I think I need one.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I feel a little overwhelmed." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a cozy apartment living room, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 30s to 50s, one with a clean work outfit, the other with a softer casual style and distinct hairstyle. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I feel a little overwhelmed." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I feel a little overwhelmed."
Context for the image only, do not render this Japanese text: 圧倒されていると伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I feel a little overwhelmed.".
```

## 106. real-emotion-005 - I'm not mad. I'm disappointed.

- Category: 感情を伝える
- Usage note: 怒りより失望を伝える。
- File name: `real-emotion-005.webp`
- Target file: `public/phrase-images/phrases/real-emotion-005.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I'm not mad. I'm disappointed.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I'm not mad. I'm disappointed.
B: That's worse, honestly.
A: I know, but it's the truth.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I'm not mad. I'm disappointed." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a train station concourse with an abstract map board, wide environmental two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends with different gender presentation and contrasting outfits, such as a patterned shirt and a minimal dark jacket. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I'm not mad. I'm disappointed." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I'm not mad. I'm disappointed."
Context for the image only, do not render this Japanese text: 怒りより失望を伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I'm not mad. I'm disappointed.".
```

## 107. real-emotion-006 - I needed that.

- Category: 感情を伝える
- Usage note: 相手の言葉や行動に救われた時。
- File name: `real-emotion-006.webp`
- Target file: `public/phrase-images/phrases/real-emotion-006.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I needed that.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I needed that.
B: The hug or the honesty?
A: Both, actually.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I needed that." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a kitchen table in soft evening light, diagonal composition with one person in the foreground.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two everyday adults, one older and one younger, with natural hairstyles and practical clothing suited to the setting. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I needed that." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I needed that."
Context for the image only, do not render this Japanese text: 相手の言葉や行動に救われた時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I needed that.".
```

## 108. real-emotion-007 - I'm scared, but I want this.

- Category: 感情を伝える
- Usage note: 怖いけど望んでいると伝える。
- File name: `real-emotion-007.webp`
- Target file: `public/phrase-images/phrases/real-emotion-007.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I'm scared, but I want this.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I'm scared, but I want this.
B: Then we go slow.
A: I can do slow.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I'm scared, but I want this." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using two people with a little physical distance between them, using chairs, a sofa, or a quiet corner to show emotional delicacy.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two coworkers in their 30s, one with short curly hair and a casual blazer, the other with tied-back hair and a simple shirt. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I'm scared, but I want this." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I'm scared, but I want this."
Context for the image only, do not render this Japanese text: 怖いけど望んでいると伝える。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I'm scared, but I want this.".
```

## 109. real-emotion-008 - That means more than you know.

- Category: 感情を伝える
- Usage note: 相手の言葉が想像以上に大きかった時。
- File name: `real-emotion-008.webp`
- Target file: `public/phrase-images/phrases/real-emotion-008.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "That means more than you know.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: That means more than you know.
B: I meant every word.
A: I believe you.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "That means more than you know." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a classroom corner after class, slight top-down table view.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two friends in their 20s, one with a hoodie and cropped hair, the other with a denim jacket and shoulder-length hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "That means more than you know." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "That means more than you know."
Context for the image only, do not render this Japanese text: 相手の言葉が想像以上に大きかった時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "That means more than you know.".
```

## 110. real-emotion-009 - I feel lighter now.

- Category: 感情を伝える
- Usage note: 話して気持ちが軽くなった時。
- File name: `real-emotion-009.webp`
- Target file: `public/phrase-images/phrases/real-emotion-009.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I feel lighter now.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I feel lighter now.
B: I'm glad you said it out loud.
A: Me too. I was carrying it for too long.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I feel lighter now." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a shared workspace with plants and a tablet, medium side profile composition.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two adults in their 40s, one wearing a cardigan and glasses, the other in a neat work shirt with salt-and-pepper hair. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I feel lighter now." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I feel lighter now."
Context for the image only, do not render this Japanese text: 話して気持ちが軽くなった時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I feel lighter now.".
```

## 111. real-emotion-010 - I don't want to lose this.

- Category: 感情を伝える
- Usage note: 大切な関係や状況を失いたくない時。
- File name: `real-emotion-010.webp`
- Target file: `public/phrase-images/phrases/real-emotion-010.webp`
- Has audio: yes
- Prompt mode: two-panel

```text
Use case: illustration-story
Asset type: English learning app phrase card image
Primary request: Create one landscape illustration for the English conversation phrase "I don't want to lose this.".
Scene/backdrop: A natural everyday conversation scene based on this 3-turn dialogue:
A: I don't want to lose this.
B: Then let's take care of it.
A: Yeah. Starting with being honest.
Subject: Two adults in a realistic daily setting. One person is using or about to use the phrase "I don't want to lose this." naturally; the other person is listening or responding in a way that makes the situation clear.
Visual memory hook: Make this card visually memorable and distinct from other phrase cards by using a distinctive setting and prop combination: a front-door entryway with bags and shoes, close conversational two-shot.
Panel/story structure: Create a clean two-panel scene card in one strict 16:9 wide landscape image. Left panel: the situation just before the phrase or the reason the phrase is needed. Right panel: the moment when the phrase is used, or the listener's immediate reaction. Use a thin subtle divider between panels. Do not use speech bubbles or panel captions.
Character variation: Use two university-age adults, one with a backpack and layered casual clothes, the other with short hair and a plain sweater. Do not reuse the same young man / young woman pair, hairstyle, clothing, or body language across cards.
Style/medium: clean modern educational illustration, similar to a mature English learning app. Semi-flat digital illustration with gentle depth, simple shapes, clear facial expressions, and restrained natural colors. Not childish, not anime, not photorealistic.
Composition/framing: strict 16:9 wide landscape smartphone-card composition, not 3:2, not 4:3, not square, not portrait. Do not default to two people sitting at a cafe table unless the dialogue clearly needs that. Vary the setting, props, camera angle, body distance, age, hairstyle, clothing, and posture so the scene is easy to remember. Put the exact text "I don't want to lose this." as a small readable overlay in the upper-left inside a dark translucent rounded label. Keep the lower area visually calm because the app will place the usage note below the image.
Lighting/mood: calm, warm, conversational, thoughtful, friendly.
Color palette: clean natural tones with soft contrast; avoid overly purple, dark, beige-only, or noisy palettes.
Text (verbatim): "I don't want to lose this."
Context for the image only, do not render this Japanese text: 大切な関係や状況を失いたくない時。
Constraints: output must be a wide 16:9 landscape image; no 3:2, no 4:3, no square, no portrait. No speech bubbles, no logos, no watermarks, no extra captions, no Japanese text, no UI chrome, no duplicate text, no generic repeated cafe-table composition, no same-looking characters across cards. The overlay text must be spelled exactly as "I don't want to lose this.".
```
