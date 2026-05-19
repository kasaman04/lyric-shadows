# Phrase Images

Save manually generated phrase images in:

```text
public/phrase-images/phrases/
```

Use the phrase id as the filename:

```text
ask-001.webp
clarify-001.webp
```

Prompt bank:

```text
data/phrase-image-prompts.md
data/phrase-image-prompts.json
data/phrase-image-prompts-audio.md
data/phrase-image-prompts-audio.json
```

Recommended image style:
- Strict 16:9 wide landscape card
- Match the approved phrase-card images already in this folder
- Anime-influenced clean linework, soft coloring, readable facial expressions
- Black rounded English phrase label in the upper-left with exact white text
- No Japanese text, speech bubbles, logos, or watermarks
- No photorealism, 3D, vector art, posters, diagrams, charts, or infographics
- The image must be memorable enough that the use case is understandable even if the English label is hidden
- Do not let the cards drift into the same two-people-talking composition
- Two-panel layouts are allowed only when they clearly help the phrase; do not use them as the default
- Across every 10-card batch, mix camera angles and scene types: overhead/tabletop, hands-only, over-the-shoulder, one person in foreground, window/mirror/reflection view, walking scene, doorway/entryway, distant environmental shot, object-led memory cue, and close reaction shot
- Do not let neighboring cards use the same camera height, same subject size, same left/right body placement, or same two-person framing
- Avoid repeating seated face-to-face conversations, cafe-table scenes, or side-by-side listening shots
- Vary ethnicity, age, gender, body type, hair, clothing, occupation, setting, props, body distance, camera angle, subject placement, and negative space
- Do not make East Asian characters or the same young male/female pair the default

Mandatory generation guard:
- Before generating a 30-card batch, make a composition matrix assigning a unique camera/scene type to every card.
- Do not generate from the phrase prompt alone.
- Build each card from the 3-turn dialogue so the reason for the phrase is visible.
- Treat "two people talking across a table", "seated face-to-face conversation", and "same-height medium two-shot" as blocked defaults unless the specific card explicitly requires it.
- Every 5 generated cards, create a quick preview contact sheet and check for repeated framing before continuing.
- If two cards in the same batch have the same camera distance, same body placement, and same interaction shape, regenerate one before moving on.
- Regenerate if the contact sheet shows camera angles that are too similar, even when the people or props are different.
- Review the whole 10-pack before copying accepted images into this folder.

Mandatory finalization guard:
- Generated base images must not be treated as finished assets.
- Always run `scripts/finalize-phrase-image.cmd` to crop to 16:9, add the exact English phrase label locally, and save the WebP file.
- Do not call bare `python`; the wrapper locates the bundled Codex Python first and avoids PowerShell execution-policy failures.
- After finalization, open or include the file in a contact sheet before continuing.
