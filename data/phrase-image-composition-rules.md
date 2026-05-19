# Phrase Image Composition Rules

These rules exist because phrase-card image generation easily drifts into repeated mood shots.
The image must teach the phrase through a concrete conversation situation, not just match the emotion.

## Fixed Canonical Rules

The user's fixed rules are authoritative. If another local note conflicts with this section, follow this section.

Purpose:

- The image is not decoration. It exists to make the phrase memorable.
- Even with the English label hidden, the viewer should be able to imagine when and why the phrase is said.

Visual style:

- Match the approved images in `C:\Users\kazuk\Desktop\英語字幕\public\phrase-images\phrases`.
- Use clean anime-influenced linework, soft coloring, and readable facial expressions.
- Final assets are 16:9 English card images.
- Final assets must have a black rounded label in the upper-left with the exact English phrase in white.
- Reject photorealism, 3D, vector art, diagrams, posters, and infographics.

People:

- Intentionally vary ethnicity, age, gender, body type, clothing, occupation, and hairstyle.
- Do not make East Asian characters the default.
- Do not continue the same young male/female pair, same face, same clothing, or same relationship type.
- Treat character design itself as a memory hook.

Scene:

- Generate from the 3-turn conversation, not from the phrase mood alone.
- Show why the phrase is being said.
- Communicate meaning through props, location, expression, body distance, and the other speaker's action or reaction.
- Do not rely on generic sad rooms, phones, mugs, or window scenes.

Two-panel rule:

- Use two panels by default when the phrase has drama, misunderstanding, apology, refusal, boundary-setting, jealousy, relationship repair, emotional reaction, or a trigger from another person's behavior.
- Left panel: cause, setup, trigger, or the other person's action.
- Right panel: spoken phrase, reaction, result, or the moment of facing the issue.

Batch variation:

- In every 10-card batch, vary location, people, brightness, composition, props, emotion type, and body distance.
- Vary camera angle deliberately: eye-level, high angle, low angle, over-the-shoulder, back view, side view, object foreground, reflection, wide environmental, close reaction, hands-only, and partial crop should be mixed.
- Do not let neighboring cards share the same camera height, same subject size, same left/right body placement, or same two-person framing.
- Reject the batch if dark rooms, night views, the same desk, the same couple, or the same composition repeats.

Adoption flow:

- Generate previews first.
- Reject images that are too similar, too dark, off-style, weak in situation, or biased toward one demographic.
- Only approved images are copied into `public/phrase-images/phrases`.
- Review the whole 10-pack before final adoption.

## Non-negotiable workflow

1. Build a 30-card composition matrix before generating images.
2. Assign each card a primary composition type before writing the image prompt.
3. Read the phrase's 3-turn dialogue and usage note before writing the image prompt.
4. Lock the visual style against approved `public/phrase-images/phrases` cards before generating.
5. Generate from the conversation-specific scene and composition, not from the phrase mood alone.
6. Review a contact sheet after every 5 cards.
7. Regenerate repeated framing, repeated characters, repeated lighting, vague mood-only cards, or style-drifted cards immediately.
8. Do not save to `public/phrase-images/phrases` until the contact sheet passes the acceptance check.
9. Never bulk-adopt old generated images from `.codex/generated_images` without a fresh contact-sheet review.

## Style Lock

The card must match the approved phrase-card artwork already in `public/phrase-images/phrases`.

Required:

- Wide 16:9 card image with the same polished learning-card feel as approved `ask-*`, `clarify-*`, `first-meet-*`, and `emotion-*` assets.
- Clean Japanese/anime-influenced character illustration, not generic semi-realistic stock art.
- Visible ink/line definition around faces, hair, hands, clothing folds, and key props.
- Soft painterly shading with controlled highlights, not photoreal skin texture or plastic 3D rendering.
- Warm natural lighting and readable color contrast, but not gloomy unless the dialogue specifically requires it.
- The final adopted asset includes the app-style black rounded subtitle label with exact white English text.
- Base generation should avoid generated text; overlay the phrase locally whenever possible.

Reject:

- Any image that looks like a different generator/style family from the approved assets.
- Photorealistic lifestyle photos, glossy 3D, flat vector, poster art, comic-book halftone, infographic, chart, diagram, or educational layout.
- Images whose faces, hands, or clothing lack the approved card's clean linework.
- Images whose composition works only as a generic illustration and not as this app's phrase card.

## Conversation Fit

Each card must show why the phrase is being said in that specific dialogue.

Required:

- The image must depict the situation from the 3-turn dialogue, or the immediate moment before or after it.
- The viewer should understand the use case without reading the Japanese note.
- Props must come from the dialogue or clearly explain the conversation trigger.
- The other speaker's presence or reaction should be visible when the phrase depends on a response.
- A phrase about clarification, planning, apology, slang, or boundaries must not collapse into a generic sad person.

Reject:

- Mood-only images that show only loneliness, sadness, anxiety, or distance.
- Generic window-looking, hallway-standing, phone-on-table, or cup-on-table scenes with no dialogue-specific reason.
- A scene that could fit five neighboring cards equally well.
- A card whose object cue is decorative rather than semantic.

## Batch Identity

Each 10-pack must look like ten different cards when seen as thumbnails.

Required:

- At least 7 distinct locations per 10-pack.
- At least 7 distinct character designs per 10-pack.
- At least 6 distinct color/lighting identities per 10-pack.
- At least 7 distinct composition types per 10-pack.
- At least 7 distinct camera/framing identities per 10-pack.
- Category identity must be visible: slang should feel casual and lively, keep should feel clear and communicative, relation should feel specific and interpersonal, emotion should feel emotionally readable without becoming all dark interiors.

Reject the whole 10-pack if the contact sheet reads as the same person in the same world with small variations.
Also reject or regenerate neighboring cards that use the same camera angle, same camera distance, and same body placement even if the props or characters differ.

## Brightness And Color

Do not let the set drift into dark blue night interiors.

Per 10-pack:

- At least 5 cards must be daylight or clearly bright interior scenes.
- No more than 2 cards may use night-window / warm-lamp / blue-shadow lighting.
- No more than 2 cards may use a quiet apartment or bedroom.
- Use bright public spaces, classrooms, shops without branding, parks, transit, kitchens, offices, gyms, building lobbies, sidewalks, and event spaces deliberately.
- Vary palette across neighboring cards; avoid repeated navy jacket, beige cardigan, warm lamp, plant, mug, phone, blank paper combinations.

## Character Variety

Do not reuse the same default attractive young man / young woman pair.
Do not let the generator choose ethnicity, age, gender, or facial type by default.

The app style must stay consistent, but the cast must be intentionally diverse so each phrase becomes easier to remember.
Use varied ethnicity, age, gender presentation, body type, hairstyle, clothing, posture, and social role as memory hooks.
Do not make East-Asian characters the baseline, and do not let a batch drift into any single default demographic.

Across each 10-pack, vary:

- Age group: teens/20s/30s/40s/50s where appropriate.
- Body type, hairstyle, clothing, posture, and social role.
- Skin tone, ethnicity, and facial features across a broad range, without making all characters the same person.
- Solo, pair, small group, hands-only, distant figures, and cropped-body cards.

Reject adjacent cards if the same character design, demographic template, outfit family, or body language is recognizable.

## Two-Panel Use

Two-panel images are allowed when they improve meaning.

Use two panels by default when the phrase has drama, tension, misunderstanding, emotional reaction, apology, boundary-setting, or relationship repair.
The card must let the viewer imagine the scene, not just identify a mood.

Use two panels for:

- Before/after contrast.
- Misunderstanding vs clarification.
- Cause vs reaction.
- Invitation vs refusal.
- Text-message implication vs in-person reaction.
- Speaker's phrase vs listener's visible response.
- What happened first vs why this phrase is being said now.

Required:

- One panel should show the trigger, setup, or other person's action.
- The other panel should show the speaker's reaction, reply, or consequence.
- The panels must create a readable mini-scene even if the English label is hidden.
- The two panels must have different camera angles and different visual information.

Do not use two panels as decoration or as two similar shots of the same mood.

## Blocked Defaults

Do not use these as default compositions:

- Two people sitting face-to-face across a table
- Cafe table conversation
- Same-height medium two-shot
- Side-by-side listening shot
- Chest-up conversation with both faces visible
- Repeated over-the-shoulder conversation
- Repeated night apartment window scene
- Repeated hallway distance scene
- Repeated sad person seated alone
- Repeated mug / phone / blank paper / plant tabletop cue

## Required Variety Pool

Use these deliberately across each 30-card batch:

- Hands-only / object-led
- One person only
- One person foreground, other distant
- Window or mirror reflection
- Doorway / threshold
- Walking side view
- Distant environmental shot
- Overhead tabletop
- Low angle object foreground
- Back view / over-the-shoulder without both faces
- Partial body crop
- Person partly outside frame
- Empty-room aftermath with personal objects
- Split two-panel with different shot types on each side
- Shadow or silhouette

## Acceptance Check

Before saving a batch as done, the preview sheet must show:

- No more than one face-to-face table scene per 30 cards
- At least 10 clearly different composition types
- Meaningful variation in camera height, body distance, and subject placement
- Different character age, clothing, hairstyle, and posture across neighboring cards
- A readable local overlay label, with no generated text inside the base image
- No repeated dark blue / warm lamp visual system across neighboring cards
- No repeated default character pair across neighboring cards
- Every card has a visible reason tied to its 3-turn dialogue
- Every card has a memory hook that would still be recognizable if the English label were hidden

If any of these fail, the image is not adopted. If many fail, delete the batch and restart from prompts.
