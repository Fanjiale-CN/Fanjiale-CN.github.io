# Design and motion specification

## Production mode

Video Shotcraft mode: autonomous free creation. The user requested direct completion and deployment, so script, storyboard, render and review proceed as one production pass.

## Brand system

- Paper: `#F2EFE5`
- Ink: `#0D1115`
- Signal red: `#EE3B32`
- Muted ink: `#6D6B65`
- Rule: `#CFC9BC`
- Type: Galok English / system sans for display and UI; monospace only for indexes and coordinates
- Geometry: square editorial frames, hairline rules, no rounded SaaS cards, no decorative gradients
- Spacing: 8px base unit; 96px safe title margins in the film

## Website rules

- One clear hero statement and one primary action
- Poster occupies the visual anchor, not a decorative background
- Four archive branches form the information spine: Cities, Works, Notes, Data
- Contact contains only email and X / @galokview
- The embedded film is silent, muted, inline and user-controllable
- Motion is restrained and respects `prefers-reduced-motion`

## Motion rules

- 1920×1080, 30fps, 1080 frames / 36 seconds
- No audio track, sound effect or synthetic voice
- All screenshots come from real Galok pages; city quadrants use real Galok city footage
- Captions are 60–88px; metadata is at least 32px
- One hero action per shot; camera moves settle before the cut
- No shake, glint, springy UI bounce, wipe presets or repeated transition gimmicks
- Use smoothstep or cubic ease-in-out for spatial motion; final holds are at least 24 frames

## Shotcraft research decisions

The Shotcraft cards were inspected as a motion vocabulary and timing reference, not selected as exact implementation recipes. The film uses custom editorial shots because Galok's identity depends on legibility, real page evidence and restrained motion rather than theatrical card effects.

| Inspected card | Decision | Film implementation |
|---|---|---|
| `brand-ink-open` | Reject crosshair, letterpress-per-glyph and typewriter cursor as too mannered | Custom quiet seal reveal with whole-lockup settle and a long brand hold |
| `spotlight-hero-card` | Reject roaming spotlight, levitation, perimeter beam and 3D page swing | Custom straight-on real-page push that settles for the final 30 frames |
| `quad-split-parallel-scenes` | Keep the parallel 2×2 grammar and 3–6-frame stagger; replace demo UI actions with real city footage | Custom four-city parallel shot with an initial stagger and a second staggered crop push |
| `mosaic-reframe` | Reject 12-tile A/B/C rearrangement because it turns editorial pages into decorative tiles | Custom two-panel real-page reframe preserving complete Works and Notes titles |
| `chart-live-moves / oscilloscope-stream` | Reject synthetic stream, spike and live readout because the site contains a real verified historical series | Custom historical CPI line reveal using the exact NBS values in `data/data.js` |
| `logo-shrink-wordmark-lockup` | Keep the mark-to-lockup structure; reject neon arcs and playful overshoot | Custom Galok seal retreat, wordmark settle and large static destination CTA |

These are therefore **custom Shotcraft-informed shots**, not claims of card fidelity. The exact card names must not be used as storyboard shot labels.

## Deliberate aesthetic exception

Shotcraft Q8 normally asks the final shot to be the highest-energy feature family. Galok deliberately ends with a low-energy brand hold instead. A feature fly-in, particle stage or product-family orbit would contradict the archive's quiet editorial character and repeat content already shown. The destination and hold are treated as the climax: the seal resolves, `LOOK CLOSER. / GALOK.ME` appears at 64px and remains fully visible for more than one second.

## Required QA

- Real-page capture check at 1920×1080 / DPR 2
- Per-shot still frames before full render
- Full-film frame extraction at each chapter boundary
- Black-frame and audio-stream checks
- Independent final-review pass against the Shotcraft aesthetic rules
