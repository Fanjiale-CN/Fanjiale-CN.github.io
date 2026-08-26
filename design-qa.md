# Design QA — Galok Radar

## Comparison target

- Source visual truth: `artifacts/qa/radar-source-research-desktop-viewport.png`, a 1440 × 900 browser capture of Galok's existing Research index used as the closest production visual-system reference.
- Browser-rendered implementation: `artifacts/qa/radar-desktop-viewport.png`, a 1440 × 900 capture of `/radar/` in Chrome for Testing 152.
- Combined comparison evidence: `artifacts/qa/radar-design-comparison.png` (Research reference on the left, Radar implementation on the right).
- Density normalization: both captures use a 1440 × 900 CSS-pixel viewport and device-pixel-ratio 1; the combined image joins them at native size without scaling.
- State: initial Radar ledger with all six verified entries available and the `All` filter selected.
- Focused evidence: `artifacts/qa/radar-desktop-first-row.png`, `artifacts/qa/radar-mobile-viewport.png`, and `artifacts/qa/radar-dialog-mobile.png` keep the ledger hierarchy, filter state, evidence action, and mobile dialog readable at review size.

## Findings

- No actionable P0/P1/P2 difference remains.
- Fonts and typography: Radar preserves Galok's editorial serif/sans hierarchy, oversized thesis headline, uppercase utility labels, tight display leading, and restrained small-copy tracking. The page has its own signal-ledger rhythm without leaving the brand system.
- Spacing and layout rhythm: the desktop composition uses an asymmetric masthead, a 238-pixel time rail, and a 1015-pixel content stream. Tablet reduces the stream to 541 pixels; mobile becomes one 354-pixel column. No tested viewport has horizontal overflow.
- Colors and visual tokens: the warm paper, near-black ink, signal red, hairline rules, and square-corner controls match the existing site. The muted copy token was darkened to `#626662` so small text clears WCAG contrast checks.
- Image quality and asset fidelity: the page uses Galok's real square brand mark and contains no synthetic image, placeholder, emoji, CSS illustration, or approximate icon.
- Copy and content: every record exposes editorial state, topic, geography, update time, summary, source count, context, outlet, and source link. Automated discovery is explicitly separated from editorial judgment.
- Interaction states: every filter changes the visible ledger and URL state; evidence opens in a native dialog; Escape closes it and focus returns to the invoking button. Reduced-motion mode removes movement while keeping all tasks available.

## Browser acceptance

- Browser: Chrome for Testing 152.0.7977.64.
- Viewports: 390 × 844, 768 × 1024, 1280 × 720, and 1440 × 900 at device-pixel-ratio 1.
- Primary paths exercised: initial data render; all-state filtering; URL query synchronization; evidence open/close; Escape behavior; focus return; reduced motion; full-archive search; analytics event wiring; responsive layout and overflow.
- Console: local page assets and requests completed. The only console errors were blocked third-party analytics requests in the isolated local browser; no page-authored JavaScript error or failed local request was present.
- Automated accessibility: passed with no Radar violations or baseline regression.
- Lighthouse for `/radar/`: Performance 98, Accessibility 100, Best Practices 96, SEO 100; LCP 0.8 s, CLS 0.078, total blocking time 0 ms.

## Comparison history

### Pass 1

- [P1] `Current editorial signals` carried an undefined `sr-only` class and remained a normal grid item. It consumed the first ledger cell, moved the time rail into the content column, and forced the six-row stream into a 238-pixel track on desktop.
- [P2] Muted status, time-rail, and method labels measured 4.31:1 against the Radar paper background, below the required 4.5:1 ratio for their sizes.
- [P2] Filter, time-rail, and dialog transitions used weak built-in `ease` curves instead of the approved editorial motion token.
- [P2] At 768 pixels, the eighth navigation entry sat beyond an unmarked horizontal-scroll area, leaving Index and About out of view.

### Fixes applied

- Added a scoped visually-hidden rule for the ledger heading so it remains available to assistive technology without participating in grid placement.
- Darkened the Radar muted token from `#6d716d` to `#626662`.
- Added `--radar-ease-out: cubic-bezier(.23,1,.32,1)` and applied it to state, row, and dialog transitions.
- Tightened the 761–1020 pixel navigation scale and gave that range an opaque paper ground with accessible ink text; all eight destinations now fit without scrolling.

### Pass 2

- Desktop stream measures 1014.8 pixels, tablet stream 541.2 pixels, and mobile stream 354 pixels; all match their intended grid tracks.
- All four viewport widths report `scrollWidth === clientWidth`.
- At 768 pixels, the navigation reports `scrollWidth === clientWidth` and keeps Cities through About visible in one row.
- Runtime accessibility, Radar interaction, discovery search, observability, link, resource-budget, and Lighthouse checks pass after the repairs.

## Follow-up polish

- P3: a physical iOS Safari pass remains useful after deployment for native dialog typography and sticky-control behavior; it does not block this Chrome acceptance.

final result: passed
