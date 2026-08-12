# Design QA — `/data/`

## Comparison target

- Source visual truth: current production page, `https://galok.me/data/`, plus the selected Tufte / Galok warm-paper design brief in `data/research/plan/plan.md`.
- Implementation: local `data/index.html`, `data/data-hub.css`, `data/data-hub.js`.
- Intended viewports: desktop 1440 × 1000 and mobile 390 × 844, device scale factor 1.
- Intended states: cover, article body, WDI indicator selection, sticky chapter index, open source drawer, reduced motion.

## Evidence status

- Source capture was inspected before implementation during this task.
- Browser-rendered local implementation screenshot: unavailable. The managed cloud browser rejected local-loopback URLs; `host.docker.internal` returned a gateway error. The local Playwright runtime had no bundled Chromium, and downloading a browser binary was blocked by the environment network policy.
- Full-view combined comparison: not possible without a rendered implementation capture.
- Focused region comparison: not possible for the same reason.

## Code-level checks completed

- Fonts / typography: body prose is Georgia at 1.04–1.16rem with 1.74–1.78 line height and a 69ch maximum; display sizes scale with `clamp()`.
- Spacing / rhythm: wide 1400px shell, 720px reading column, figure widths capped at 1120px, and mobile single-column rules at 640px.
- Colours / tokens: warm paper, ink, muted text, hairline rules and four restrained data accents are centralised as `--data-*` tokens.
- Images: no external imagery by design; data visuals are semantic HTML or the existing data-driven SVG explorer.
- Copy: English-only editorial copy, ten numbered chapters, three framing questions, a 30-second summary, local source labels and a 20-item source register.
- Interactions: indicator selection, keyboard year inspection, CSV downloads, chapter reading state, native source drawer and reduced-motion branch.
- Static validation: `node --check data/data-hub.js` and `git diff --check` pass; IDs are unique and in-page navigation targets resolve.

## Primary interaction test status

Code paths were inspected, but a live browser interaction pass and console-error check could not be completed before deployment because the local implementation could not be opened in the managed browser.

## Findings

- [P1] Rendered evidence missing.
  - Impact: Typography wrapping, mobile cover height, sticky navigation, horizontal overflow and chart state cannot be accepted from code alone.
  - Fix: deploy to GitHub Pages, capture production desktop/mobile states, check console logs, then compare the production result against the original production visual truth and the brief.

## Final result

blocked
