**Source visual truth**

- User screenshots: `/workspace/scratch/bc4b72cf1f0a/upload/IMG_4189.png`, `/workspace/scratch/bc4b72cf1f0a/upload/IMG_4188.png`.
- Direction: remove the Hangzhou contact sheet shown in those captures; replace it with a literary, Chinese-left / English-right city reader and zine artwork.

**Rendered implementation**

- `https://galok.me/be-a-viewer/hangzhou/#writers-hangzhou`
- Browser: Chrome cloud browser, desktop viewport 1363 × 936 CSS px, DPR 1.
- Source screenshots were 1920 × 1280 and used as problem-state evidence, not a pixel-copy target; density was therefore not normalized for pixel matching.

**Full-view comparison evidence**

- The photographed 20-frame contact sheet, filters and modal are absent from the live DOM (`.hz-contact-sheet` count: 0).
- The replacement reads as a full editorial chapter: running folio, oversized city masthead, five-city series strip, zine plate, four bilingual spreads and colophon.
- Palette, open margins and thin rules follow the requested magazine/book direction while remaining inside Galok’s existing rectangular visual system.

**Focused-region evidence**

- Poster: live Hangzhou plate renders at 881.5 × 587.7 CSS px, ratio 1.500, matching its 1536 × 1024 source and the required horizontal 3:2 format.
- Quote spread: Chinese is visibly left of English; source/author metadata remains a separate left rail. Both columns render without clipping at the tested viewport.
- Series navigation contains five working city links and each city page contains four quote spreads.

**Required fidelity surfaces**

- Fonts and typography: passed. Song-style Chinese display text and a restrained serif English voice form a deliberate bilingual hierarchy; small folio labels remain legible.
- Spacing and layout rhythm: passed. Large reading intervals replace the dense contact sheet, with consistent rails and aligned sources.
- Colors and tokens: passed. Five city palette tokens are scoped per literary section; Hangzhou uses celadon, lake ink and vermilion.
- Image quality and asset fidelity: passed. All generated posters are native assets, not CSS/vector substitutes; 1:1 and 3:2 ratios were browser-verified.
- Copy and content: passed. Four sourced Chinese excerpts and original Galok English translations appear on each of five city pages.

**Primary interactions tested**

- Hash navigation into the literary chapter.
- Five-city series links present on every city page.
- IntersectionObserver staged reveal reaches visible state.
- `prefers-reduced-motion` fallback is present.
- No page console errors or warnings were observed; one browser-extension metadata error was excluded as non-site output.

**Comparison history**

- P2: Hangzhou landscape plate was stretched by a more specific inherited city-page image height rule. Fixed with an explicit auto-height override, cache-busted the shared stylesheet, redeployed and rechecked at 1.500 ratio.
- No remaining P0/P1/P2 findings.

**Follow-up polish**

- P3: Future city additions should reuse the shared series nav and add one new palette only after the quote sources are locked.

final result: passed
