# Independent final review — Galok growth film

**Verdict: PASS — approved for release. No remaining blockers.**

This review covers the exact published asset with SHA-256 `4fc1951295c254e78acf1b54d00442ea2a88dff03758881f2e288b6464f9597a`. The last Q11 failure is resolved: meaning-bearing metadata now measures 33–37px of actual rendered ink, frame-support prose measures at least 35px, and the updated QA frames show the larger type reflowed without clipping or collisions. All earlier loop, accessibility, type-token, attribution, convergence, hold and page-embedding findings remain fixed.

Review basis: current `PLANNING.md`, `README.md`, `render.py`, selected Shotcraft recipe documents and exact demo TSX, `design/index.html`, `design/design.css`, `design/design.js`, the published/working MP4 and poster, and current `out/qa` assets including `q11-contact.png` and the release loop pair. No production file was changed by this review.

## Exact delivery verification

| Check | Result |
| --- | --- |
| Published / working MP4 | Byte-identical; SHA-256 `4fc1951295c254e78acf1b54d00442ea2a88dff03758881f2e288b6464f9597a` |
| Size / bitrate | 2,369,397 bytes; 498,820 bit/s |
| Container / codec | MP4; H.264 High; `yuv420p` |
| Raster / rate / length | 1920×1080; 30 fps; 1,140 frames; exactly 38.000 s |
| Streams | One video stream only; no audio stream |
| Determinism | Fixed frame math/assets; no time/random source |

## Final-review findings

### P — Product goal

- **P1 ✓** Frames 52–113 clearly identify Galok, the View / Frame / Observe system, and “A personal magazine and city memory book.”
- **P2 ✓** The sequence prioritizes the recorded philosophy: growth, the three lenses, archival convergence, then brand/archive resolution.
- **P3 ✓** No invented product capability or misleading interface claim appears.
- **P4 ✓** Palette, typography, motion, imagery, silence, loop, accessibility and recipe decisions all have corresponding implementation evidence.

### F — Functional/story completeness

- **F1 ✓** Growth, View, Frame, Observe and archive/findability each receive a distinct, understandable sequence.
- **F2 ✓** Every shot adds information; no duplicate functional shot or repeated tagline weakens the sequence.
- **F3 ✓** CITY / IMAGE / WRITING / DATA are now clear above their source nodes and remain understandable without relying on the red accent alone.

### V — Visual direction

- **V1 ✓** Floane display, exact Gambetta Regular/Italic reading faces, tracked metadata, paper/ink/signal-red palette, square geometry and hairlines match the recorded Galok direction. Pillow/FreeType directly identifies the WOFF2 files as Gambetta, not fallbacks.
- **V2 ✓** Motion is calm, deterministic and stable, with measured ease/smooth curves and adequate holds.
- **V3 ✓** The film grows from Galok's own visual system and does not drift into Ink Press amber, neon, rounded tech UI or generic promo styling.
- **V4 ✓** No forbidden accent, bounce, elastic scale, group glint or decorative glow is present.

### S — Shotcraft recipe fidelity and honest adaptation

- **S1/S2 ✓** `PLANNING.md` accurately distinguishes three direct recipe adaptations from three custom Shotcraft-informed compositions. The direct names resolve to the same-named single style keys in the Gallery index.
- **S3 ✓** `brand-ink-open` retains the low-energy crosshair/ink reveal and one-second lockup; `word-relay-filmstrip` moves exactly one 630px card height only in the two 18-frame verb-switch windows; `bezier-source-converge-merge` retains staggered draw-on, path-following nodes, absorption and reverse erasure.
- **S4 ✓** Convergence now erases from the source end with `path_start=round(100*erase)` over local frames 128–156. The latest staggered node finishes at approximately local frame 121, so all sources are absorbed before erasure begins.
- **S5 ✓** Real Galok archive images, coordinates, crop treatment and brand tokens feel natural after adaptation.
- **S6 N/A** No custom-only or missing-preview Gallery style is claimed as a literal implementation. Scan, observe and outro are explicitly documented as custom compositions rather than falsely attributed to exact card variants.

### B — Storyboard, holds and loop

- **B1/B2 ✓** The seven frame ranges, shot order, source images, captions, transitions and silent treatment match the current storyboard.
- **B3 ✓** Opening lockup holds frames 84–113 (30 frames / 1.0 s). Outro Galok wordmark is complete by frame 1082 and unblended through frame 1115 (34 frames / 1.13 s). The archive conclusion completes at global frame 928 and holds through frame 977 (50 frames / 1.67 s). Batch convergence is fully settled before its erasure/transition.
- **Loop ✓** Frames 1116–1139 dissolve to the exact opening field. Independent ImageMagick comparison of the supplied release loop pair gives normalized MAE `0.000362262`, equivalent to about **0.092 8-bit levels per channel**. The boundary is visually seamless.
- **B4 unable to verify** No historical user-approved storyboard package was supplied; current plan-to-current-film consistency is verified.

### D — Data and source integrity

- **D1/D2 ✓** The film uses generic archive categories and public site imagery; no customer, personal, secret, internal, live or unstable data appears.
- **D3 ✓** Hangzhou, Beijing, Shanghai, Xi'an and Xiamen scenes are real tracked Galok assets, not fabricated product screens.
- **D4 ✓** Sources are fully loaded, recognizable and sharp. Treatment is limited to crop, grayscale, contrast and controlled ink blending.
- **D5 ✓** No sensitive or dynamic dataset is exposed. DATA is a symbolic archive-source category rather than a false screenshot.

### A — Audio

- **A1–A8 N/A by deliberate direction.** The plan chooses silence for the editorial field. `ffprobe` confirms that the actual MP4 has no audio stream, so there is no hidden track, sync, clipping, SFX or alternate-BGM issue.

### Q — Visual technical quality

- **Q1/Q2 ✓** Real source imagery is sharp at its display scale; no 3D texture-resampling path exists.
- **Q3 ✓** No unintended camera jitter or handheld motion.
- **Q4 ✓** No cheap light sweep, glint group or rounded-mask leak.
- **Q5–Q10 ✓ / N/A as applicable.** Composition stays front-on and readable; no fake UI/document, illegible 3D annotation or floating layout artifact is used.
- **Q11 ✓** The final renderer uses nominal 44px for semantic metadata and 46px for frame-support prose. Independent exact-font bounding boxes measure:

| Meaning-bearing text / face | Effective ink height |
| --- | ---: |
| `WRITING`, DejaVu Sans Bold 44 | 33px |
| `FIELD NOTE / DESIGN LANGUAGE`, DejaVu Sans Bold 44 | 37px |
| `This matters.`, Gambetta Regular 46 | 35px |
| `The field sets the form.`, Gambetta Regular 42 | 32px |
| `Everything remains findable.`, Gambetta Italic 34 | 33px |

All meet the ≥32px auxiliary floor by actual rasterized ink height, not merely nominal size. Large narrative lines remain above the ≥56px main-caption floor. `q11-contact.png` shows the reflowed city labels, crop tag, observation labels, source boxes, headings and lockups without clipping; the 480px mental-scale check remains readable for the intended hierarchy.

### Page embedding and accessibility

- **Embed ✓** `/design/` references the reviewed published MP4 and poster with muted autoplay, loop, playsinline, metadata preload, native controls, controls list and descriptive label. Responsive film CSS preserves aspect ratio.
- **Reduced motion ✓** `design/design.js` pauses the media and seeks to the meaningful closing title at 36.3 s whenever `(prefers-reduced-motion: reduce)` matches, including preference changes. Native controls let every user pause/play.
- **Caption styling ✓** HTML uses `growth-figcaption`, matching the film-specific CSS selector.

## Non-blocking limitations

- Gallery preview MP4s are absent locally, so no sample-pixel identity claim is made. Recipe documents and exact demo TSX were available and sufficient for the motion-grammar review.
- Historical approval provenance is unavailable; this does not affect the verified consistency of the current plan, source and final artifact.

## Approval

**Approved for release.** The final published asset meets the recorded Galok brief, Video Shotcraft adaptation/quality requirements, technical MP4 constraints, silent direction, accessibility controls, source-integrity standard, readability floor, hold timing and seamless-loop requirement.
