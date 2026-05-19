# Remaining Phrase Image 10-Pack Production Plan

Purpose: define composition, characters, and scenes before image generation. Do not generate a 10-pack without checking this file.

If this file conflicts with `data/phrase-image-composition-rules.md`, the stricter rule wins.
The previous failed batch was too dark, too same-character, and too mood-only. Do not repeat that style.

Global rules:
- Final adopted images must include the exact English phrase in a black rounded upper-left label with white text.
- Prefer generating base images with no text, then adding labels with `scripts/finalize-phrase-image.cmd`; if preview images already include a correct label, do not double-label them.
- Match the approved phrase-card art style in `public/phrase-images/phrases`: clean anime-influenced character illustration, visible linework, soft painterly shading, and the same black rounded subtitle-label treatment after local overlay.
- Reject any image that drifts into generic semi-realistic stock art, photorealism, 3D, vector poster art, chart/diagram layouts, or a different generator style family.
- Character design must use the approved app illustration style, but the cast itself should be intentionally diverse for memory retention.
- Vary ethnicity, age, gender presentation, body type, hairstyle, clothing, posture, and role across each batch.
- Do not make East Asian characters the default baseline.
- Do not let a batch drift into any single demographic or repeat one ethnicity/facial template just because the prompt says "adult" or "friend".
- Build each prompt from the phrase's 3-turn dialogue, not from the phrase text alone.
- The image must show a specific conversation situation or immediate before/after moment.
- Do not adopt generic emotional atmosphere cards.
- Do not use repeated face-to-face table conversations.
- Do not use cafe table shots unless explicitly assigned, and never twice in one 10-pack.
- Each 10-pack must include at least 7 distinct composition types.
- Each 10-pack must include at least 7 distinct camera/framing identities.
- Each 10-pack must include at least 7 distinct locations, 7 distinct character designs, and 6 distinct color/lighting identities.
- Do not repeat the same camera height, same subject size, same left/right body placement, or same two-person framing across neighboring cards.
- At least 5 cards per 10-pack must be daylight or clearly bright interiors.
- No more than 2 cards per 10-pack may use night-window / warm-lamp / blue-shadow lighting.
- No more than 2 cards per 10-pack may use quiet apartment or bedroom scenes.
- Do not repeat the same navy-jacket / beige-cardigan / plant / mug / phone / blank-paper visual system.
- After each 5 cards, create a preview sheet and reject repeated characters, repeated lighting, repeated props, or mood-only images.
- After each 10-pack, create a preview sheet and fix duplicates before moving on.
- Do not save final `.webp` files under `public/phrase-images/phrases` until the whole 10-pack preview sheet passes.
- If the 10-pack looks like the same people in the same world with small variations, delete it and restart.
- Use two-panel images by default for dramatic, tense, apologetic, boundary-setting, misunderstanding, or relationship-repair phrases.
- A two-panel image must show a mini-scene: trigger/setup in one panel, speaker reaction/reply/consequence in the other.
- Do not use two panels as decoration; the two panels must have different camera angles and different visual information.

Composition pool:
- Hands-only object cue
- One-person back view
- Window or mirror reflection
- Doorway / threshold
- Wide environmental distance
- Walking side view
- Overhead tabletop
- Low foreground object
- Partial body crop
- Empty-room aftermath
- Split two-panel with different shot types
- Shadow / silhouette

Character pool:
- University-age adult with backpack and layered casual clothes
- Adult in 30s with clean work outfit
- Adult in 30s with soft casual style
- Adult in 40s with cardigan and glasses
- Adult with tied-back hair and simple shirt
- Friend with patterned shirt
- Friend with minimal dark jacket
- Older adult mentor type
- Younger adult learner type
- Solo adult in quiet reflective scene
- Older parent / adult child pair
- Service worker / customer pair
- Teacher / student or mentor / learner pair
- Roommates, siblings, coworkers, casual friends, neighbors, date, ex-partner, and small friend group
- Different body types, skin tones, hairstyles, and clothing silhouettes across neighboring cards

Lighting pool:
- Morning kitchen or classroom
- Bright afternoon sidewalk or park
- Clean daylight office or coworking space
- Fluorescent store / transit / lobby without branding
- Colorful casual social space
- Rainy daylight with high visibility
- Warm evening interior used sparingly
- Night scene used only when the dialogue clearly needs it

## emotion-more-001 to emotion-more-010

Theme: missing someone, hurt, being brushed off.

- `001`: empty chair / phone on nightstand; solo adult by window; night apartment.
- `002`: entryway absence; solo adult looking at empty hook/shoe space; evening apartment.
- `003`: train window reflection; solo traveler, no second person; moving night train.
- `004`: wide group-leaving scene; one person left behind in foreground; campus or station walkway.
- `005`: hands-only old photo / keepsake; no faces; quiet desk.
- `006`: phone face-down and hand on chest; cropped body; bedroom or lounge.
- `007`: office hallway back view; one adult processing personally; coworker distant and blurred.
- `008`: park bench object cue; hand gripping bag strap; other person off-frame.
- `009`: cafe counter side view; one person ignored in foreground; busy background.
- `010`: wide room isolation; one person apart from small group; community room or workplace lounge.

## emotion-more-011 to emotion-more-020

Theme: jealousy, panic, overwhelm.

- `011`: mirror reflection jealousy cue; solo adult seeing vague reflection; phone implied, no readable content.
- `012`: window reflection with unfair jealousy; one person alone; night apartment.
- `013`: event seen through glass; uncomfortable observer outside or near doorway.
- `014`: shadow / silhouette reaction; bad side shown through posture, not faces.
- `015`: aftermath hands covering face; blank apology note nearby; bedroom or sofa edge.
- `016`: tilted desk panic; one-person close reaction; laptop blank.
- `017`: clock/calendar objects; rushing figure in background; no readable calendar text.
- `018`: hallway motion blur; urgent walking path; one person moving fast.
- `019`: overhead clutter; hands and scattered objects; overwhelmed desk.
- `020`: one person seated alone, head down; blank wall, quiet room.

## emotion-more-021 to emotion-more-030

Theme: appreciation, support, mixed feelings.

- `021`: hands receiving small help; gratitude close-up; warm desk or kitchen.
- `022`: warm doorway support; one figure foreground, helper in doorway.
- `023`: someone showing up at door; distant entryway; arrival cue.
- `024`: object-led gratitude; saved seat, held umbrella, or prepared cup.
- `025`: shared desk hands-only; task made easier through practical help.
- `026`: uneasy object arrangement; one person cropped at doorway; living room.
- `027`: split warm/cool lighting; solo adult between two emotional tones.
- `028`: quiet room after conversation; unsettled posture; no direct conversation.
- `029`: empty path with lingering object; weird feeling after someone leaves.
- `030`: mirror / notebook self-analysis; solo adult studying their own reaction.

## relation-001 to relation-010

Theme: relationship opening, care, emotional honesty.

- Use fewer interiors and more threshold / walking scenes.
- Characters: mix university-age pair, adults in 30s, older/younger pair.
- Required composition mix: doorway, walking side view, one-person foreground, hands-only, reflection, wide distance, object-led.
- Avoid: couch conversation repeats and cafe table repeats.

## relation-011 to relation-020

Theme: closeness, uncertainty, boundaries.

- Use scenes with physical distance: opposite ends of platform, separate chairs, hallway depth, window reflection.
- Characters: vary body type, hairstyle, clothing; do not reuse young man / young woman default.
- Required composition mix: distant environmental, back view, partial crop, empty-room aftermath, two-panel contrast.
- Avoid: romantic close two-shots as the default.

## relation-021 to relation-030

Theme: repair, trust, staying connected.

- Use practical memory cues: keys, phone, umbrella, train ticket, prepared cup, blank note.
- Characters: adult friends or partners, mixed ages.
- Required composition mix: object foreground, doorway, walking away/toward, hands-only, reflection.
- Avoid: side-by-side listening shots repeated.

## relation-more-001 to relation-more-010

Theme: deeper emotional relationship phrases.

- Scenes: apartment threshold, quiet street, station platform, workplace lounge, kitchen counter.
- Characters: adults in 30s to 50s; less student-heavy.
- Required composition mix: one-person foreground, distant other figure, mirror reflection, overhead object cue, wide street.
- Avoid: direct confession shot with both faces centered.

## relation-more-011 to relation-more-020

Theme: fragile honesty, attraction, vulnerability.

- Scenes should feel specific, not generic: laundromat, late train, building lobby, small balcony, hallway after event.
- Characters: varied gender presentation and clothing contrast.
- Required composition mix: shadow, doorway, back view, hands-only, window reflection.
- Avoid: two people sitting close on sofa repeatedly.

## relation-more-021 to relation-more-030

Theme: commitment, endings, emotional consequences.

- Use more cinematic distance and environmental storytelling.
- Characters: one or two adults, often separated in frame.
- Required composition mix: empty room, long hallway, departing figure, object left behind, wide outdoor path.
- Avoid: symmetrical two-person conversation.

## slang-001 to slang-010

Theme: casual slang in everyday scenes.

- Scenes: street corner, convenience-store-like counter without branding, shared workspace, station stairs, apartment kitchen.
- Characters: younger adults with varied style, but not same pair.
- Required composition mix: dynamic walking, over-shoulder, hands with phone, wide street, partial crop.
- Avoid: posed educational dialogue shots.

## slang-011 to slang-020

Theme: reactions and casual social language.

- Scenes should be more energetic: game night table, hallway, bus stop, elevator lobby, park path.
- Characters: friends in 20s/30s with varied hair/clothing.
- Required composition mix: object-led, group in background, one-person reaction, reflection, low foreground.
- Avoid: three people all facing camera.

## slang-021 to slang-030

Theme: casual emphasis, surprise, agreement/disagreement.

- Scenes: phone screen implied, backpack, doorway, city sidewalk, work desk.
- Characters: mix solo and pairs; no repeated pair.
- Required composition mix: hands-only, side-walk, back view, distant small figures, doorway.
- Avoid: cafe table as default.

## slang-more-001 to slang-more-010

Theme: extra casual phrases.

- Scenes: late-night apartment, train platform, shared desk, small party aftermath, street crossing.
- Characters: young adults, but vary age between late teens, 20s, and 30s.
- Required composition mix: high angle, low angle, reflection, object cue, motion.
- Avoid: two people standing still and talking.

## slang-more-011 to slang-more-020

Theme: casual emotion and reaction phrases.

- Scenes: kitchen counter, apartment hallway, bookstore-like aisle without readable text, workplace break area.
- Characters: solo reactions and small group background.
- Required composition mix: partial face crop, hands-only, wide environmental, silhouette, doorway.
- Avoid: repeated phone-in-hand closeups.

## slang-more-021 to slang-more-030

Theme: casual nuance and social friction.

- Scenes: park bench, station exit, office hallway, city cafe exterior, living room aftermath.
- Characters: varied adults; avoid default young pair.
- Required composition mix: empty-room aftermath, walking side view, reflection, object foreground, back view.
- Avoid: direct argument across table.

## keep-001 to keep-010

Theme: maintaining contact, promises, follow-through.

- Scenes: phone on table, calendar implied with no text, station goodbye, doorway, shared desk.
- Characters: friends/coworkers with practical clothing.
- Required composition mix: hands-only, wide platform, doorway threshold, object-led, walking side view.
- Avoid: direct goodbye close-up repeated.

## keep-011 to keep-020

Theme: encouragement, checking in, continuity.

- Scenes: park path, quiet office, kitchen light, apartment window, train seat.
- Characters: solo and pairs, mixed ages.
- Required composition mix: distant environmental, one-person foreground, reflection, partial crop, low object foreground.
- Avoid: symmetrical two-person talk.

## keep-021 to keep-030

Theme: staying connected under pressure.

- Scenes: late desk, entryway, rainy window, station stairs, shared workspace.
- Characters: adults in 20s to 50s; vary clothing and posture.
- Required composition mix: overhead desk, back view, silhouette, walking away, object left behind.
- Avoid: same room / same pair repetition across neighboring cards.
