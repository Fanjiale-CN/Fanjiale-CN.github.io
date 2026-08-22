# Design QA — Homepage rain-film hero

## Comparison target

- Source visual truth: `qa-home-hero-source.jpg`, extracted from the user-supplied 33.3-second rain-transit film at 00:18.
- Browser-rendered implementation: `qa-home-hero-implementation.jpg`, captured from `https://www.galok.me/?hero=ea364f0c-2` after the final stylesheet and script versions reached GitHub Pages.
- Combined comparison evidence: `qa-home-hero-comparison.jpg` (source film frame on the left; finished hero on the right).
- Source pixels: 1280 × 720.
- Implementation pixels: 1348 × 926 from a 1363 × 936 CSS-pixel Chrome viewport at device-pixel-ratio 1.
- Comparison normalization: the source frame was scaled to 674 × 379 and centred on a 674 × 463 dark canvas; the implementation was scaled proportionally to 674 × 463; both were joined into one 1348 × 463 image.
- State: desktop opening frame, video ready, user-paused state with the play control visible.

## Findings

- No actionable P0/P1/P2 differences remain in the tested homepage hero.
- Typography: the existing Galok sans stack, weights and all-caps metadata remain unchanged. The new headline holds a deliberate two-line measure, with natural wrapping and enough contrast against the rain field.
- Spacing and layout: the editorial copy occupies the dark left field while the red transit subject remains unobstructed on the right. Top metadata, CTA, film duration and playback control use the existing square-corner, hairline-rule system.
- Colours and tokens: the treatment uses the existing near-black, white and signal-red visual language. The media wash is restrained and local to the hero; no new palette, rounded card system or generic gradient language was introduced.
- Image quality: the supplied 1280 × 720 H.264 film was re-encoded without audio at 25 fps and 2.9 MB for desktop. A 540 × 960, 1.9 MB mobile crop keeps the red transit subject in frame. The 16 KB WebP poster preserves the same scene and tone.
- Copy and content: “The city keeps the evidence.” gives the film one short editorial claim; the supporting sentence names Galok's actual subjects and formats without generic manifesto language.

## Interaction and runtime checks

- The live HTTPS homepage loaded the final `styles.css?v=ia-20260822-rain-hero-2` and `script.js?v=ia-20260822-rain-hero` assets.
- The desktop film loaded from `/assets/hero/video/rain-transit.mp4` with a 33.32-second duration and ready state 4.
- The film control changed correctly between Play and Pause and updated its accessible label in both states.
- “Enter the magazine” navigated to `#field-routing`; the destination settled below the sticky navigation.
- No page-authored JavaScript error was present in the browser console. Logged errors belonged to the cloud-browser extension, not `www.galok.me`.
- Mobile rules were checked statically: the 540 × 960 source, full-viewport media, three-line headline allowance, 30-character copy measure, bottom controls and overflow containment all stay within the phone canvas. Reduced-motion mode falls back to the poster and removes the playback control.

## Comparison history

### Pass 1 — initial live deployment

- [P2] The headline inherited a narrow measure and wrapped into four short lines, weakening the intended editorial hierarchy.
- [P2] The first deployment retained the previous script cache key, so the visible film control did not receive the new single-film playback handler.

### Fixes applied

- Increased the headline measure to hold the intended two-line statement while retaining the existing responsive type scale.
- Versioned both the hero stylesheet and script so GitHub Pages and browser caches load the new composition and control logic together.

### Pass 2 — post-fix evidence

- `qa-home-hero-comparison.jpg` shows the supplied rain frame preserved as the dominant visual and the finished two-line editorial overlay occupying the darker left field.
- Browser measurements confirmed the title, CTA, duration note and film control remain inside the 1348-pixel hero canvas.
- Playback and anchor interactions passed on the deployed page, with no page-authored console error.

## Follow-up polish

- P3: a physical Safari phone check is still worthwhile after CDN cache expiry because the cloud browser did not expose a separate mobile viewport in this pass.

## Final result

passed
