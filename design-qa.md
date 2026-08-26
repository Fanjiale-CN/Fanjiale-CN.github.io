# Design QA — Global stylesheet recovery

## Comparison target

- Source visual truth: `qa-home-train-implementation.jpg`, the last accepted 1348 × 926 production-style homepage capture before the stylesheet regression.
- Browser-rendered implementation: `artifacts/qa/fix-home-source-desktop.png`, a 1348 × 926 Chrome for Testing 152 capture after the repair.
- Combined comparison evidence: `artifacts/qa/site-fix-home-comparison.png`, source on the left and repaired implementation on the right at native size.
- Density normalization: both captures are 1348 × 926 pixels at device-pixel-ratio 1; neither side was resized.
- State: homepage winter train hero at 00:08. The repaired navigation intentionally includes the new Radar destination.
- Focused evidence: `artifacts/qa/fix-home-mobile.png`, `artifacts/qa/fix-home-ipad-landscape.png`, and `artifacts/qa/fix-radar-desktop.png` keep mobile navigation, the reported 2048 × 1536 layout, and the new Radar surface readable at review size.

## Findings

- No actionable P0/P1/P2 difference remains.
- Fonts and typography: the accepted editorial display scale, UI tracking, weights, line height, and sans/serif hierarchy are restored. The browser parses the global stylesheet and no longer falls back to default serif text.
- Spacing and layout rhythm: navigation, hero metadata, headline, call to action, media timer, and following editorial section return to the accepted grid. All tested routes report `scrollWidth === clientWidth` at all six viewports.
- Colors and visual tokens: the near-black winter canvas, paper sections, white editorial type, red mark, hairline rules, and muted copy come from the restored global token file with no new hue or design drift.
- Image quality and asset fidelity: the real Galok mark and production media assets are preserved. The homepage train video remains muted, inline, timed, and visually layered beneath the editorial content; no media or motion code was replaced.
- Copy and content: page text, route labels, metadata, and current Radar addition are unchanged by the repair.
- Interaction states: desktop navigation, mobile Menu control, homepage media control, Radar filters, Radar evidence dialog, Escape close, focus return, and reduced motion remain available.

## Browser acceptance

- Browser: Chrome for Testing 152.0.7977.64.
- Viewports: 390 × 844, 768 × 1024, 1280 × 720, 1440 × 900, 1348 × 926, and 2048 × 1536 at device-pixel-ratio 1.
- Routes: `/`, `/cities/`, `/essays/`, `/radar/`, `/research/`, `/data/`, `/index/`, and `/about/` — 48 route/viewport combinations.
- Runtime checks: every route returned successfully, parsed more than 100 global CSS rules, kept navigation and main content visible, avoided horizontal overflow and oversized logos, and produced no actionable console/page errors or failed local requests.
- Full release checks: discovery rebuilt 34 canonical URLs and 33 searchable documents; 14 repository validators, 45-page link validation, 165 R2 media checks, resource budgets, accessibility, search, observability, Radar runtime, and Lighthouse assertions passed.
- Evidence index: `artifacts/qa/site-fix-visual-acceptance.json`.

## Comparison history

### Pass 1 — blocked

- [P0] `styles.css` was a 300,060-byte binary blob. The browser returned HTTP 200 but parsed zero CSS rules.
- [P0] The homepage brand mark rendered at 512 × 512 pixels, navigation fell back to block text, and the 1348-pixel content viewport overflowed to 1648 pixels.
- [P1] Every route that depended on the shared stylesheet lost its intended typography, spacing, responsive shell, and interaction presentation.

### Fixes applied

- Restored the last complete 304,062-byte UTF-8 stylesheet from commit `56ed102`.
- Updated every stylesheet reference and the research build templates to `styles.css?v=repair-20260827`, preventing Safari and edge caches from reusing the broken response.
- Added `scripts/validate-stylesheets.mjs` to the native release gate so invalid UTF-8, binary control bytes, truncated size, missing root tokens, or missing shell selectors block future publication.
- Added `scripts/visual-acceptance.mjs` and `npm run ci:visual` for repeatable cross-route, cross-viewport CSS parsing and layout checks.

### Pass 2 — passed

- Source and repaired homepage captures align on brand mark, navigation shell, metadata rail, hero composition, type hierarchy, call to action, timer, media treatment, and responsive behavior. The additional Radar link is an expected product change.
- The exact 2048 × 1536 viewport from the reported Safari failure renders the full hero and following editorial section without raw HTML layout or horizontal overflow.
- Mobile, tablet, laptop, desktop, baseline, and iPad-landscape evidence contain no actionable P0/P1/P2 findings.

## Follow-up polish

- None required for this recovery.

final result: passed
