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

---

## Responsive bilingual reflow — 2026-08-13

**Source visual truth**

- User screenshots: `/workspace/scratch/bc4b72cf1f0a/upload/IMG_4190.png` and `/workspace/scratch/bc4b72cf1f0a/upload/IMG_4191.png`.
- Both are problem-state evidence from iPad landscape. The visible P0 defect is the fourth article moving Chinese into the narrow metadata rail, producing one-to-three characters per line.
- Intended state is defined by the content requirement and semantic markup: Chinese on the left, English on the right, with the author/citation separated from both reading columns.

**Rendered implementation**

- Live routes: `https://galok.me/be-a-viewer/{hangzhou,beijing,shanghai,xian,xiamen}/`.
- Browser-rendered focused evidence: Xi'an `04 / DUST` and Xiamen `04 / ISLAND RECORD` after commit `cdcd3885647c34ec8f9e9b7e3a645fb821d37077` deployed.
- Verification viewport: 1363 × 936 CSS px, DPR 1. User source captures are 1920 × 1280 device pixels and include Safari chrome; they were normalized conceptually by comparing the content region and same fourth-article state rather than used as pixel-copy targets.

**Full-view comparison evidence**

- Before: the even-spread CSS put Chinese in a fractional metadata track and separated citation metadata into the far-right reading column.
- After: the fourth Xi'an and Xiamen articles visibly render Chinese as full phrases in the left half, English as paragraphs in the right half, citation in a full-width header, and sources in a full-width footer.
- All five live routes load `literary-city.css?v=cities-in-words-20260813c`; each contains four spreads and reports no positive horizontal overflow at the verification viewport.

**Focused-region comparison evidence**

- Xi'an `04 / DUST`: `长安回望绣成堆，/ 山顶千门次第开。` renders in two normal horizontal lines rather than a one-character vertical stack.
- Xiamen `04 / ISLAND RECORD`: the longest Chinese excerpt occupies a bounded 16-character measure on the left while the full English translation remains readable on the right.
- No `.literary-spread:nth-child(even)` layout selector remains.

**Required fidelity surfaces**

- Fonts and typography: passed. Existing Song-style Chinese and Baskerville/Iowan-style English pairing is retained; Chinese is forced to `horizontal-tb`, strict CJK line breaking, and a responsive 2.35–5.1rem display range.
- Spacing and layout rhythm: passed. Two minmax-protected columns, compact citation header, source footer and reduced section height remove both collapsed copy and excessive empty distance.
- Colors and visual tokens: passed. Each city palette is untouched; only a shared motion easing token was added.
- Image quality and asset fidelity: not affected. No visual assets changed.
- Copy and content: passed. All 20 excerpts, attributions, translations and source links are unchanged.

**Primary interactions tested**

- Navigated all five live city routes and confirmed the literary series and four-spread structure.
- Jumped directly to the fourth Xi'an and Xiamen article and inspected the visible content state.
- Confirmed CSS/JS cache-bust `20260813c` on every route after GitHub Pages deployment.
- Confirmed no site-wide horizontal overflow at the verification viewport.
- Motion audit: spread containers never become transparent; only content children reveal, initial viewport nodes are marked visible synchronously, and reduced-motion fallback remains.

**Comparison history**

- P0: Chinese copy collapsed into the narrow rail on even articles. Fixed by deleting the nth-child reversal and using one stable bilingual grid.
- P1: whole spread and children were both hidden before the observer fired. Fixed by keeping the spread visible, reducing motion to <=.75rem and <=520ms, and revealing initial-viewport nodes synchronously.
- Post-fix browser captures show no remaining P0/P1/P2 issue in the affected fourth-article state.

**Evidence limits**

- The cloud browser viewport is 1363 × 936 rather than the user’s exact Safari CSS viewport, so Safari-specific zoom text was not re-simulated. The layout defect was selector-driven rather than engine-specific, and the responsible selector has been removed globally.

final result: passed
