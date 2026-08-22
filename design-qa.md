# Design QA — Research long-form reading layout

## Comparison target

- Source visual truth: `/workspace/scratch/aa2e56b19934/upload/IMG_4260.png` (the previous Research 001 tablet layout).
- Browser-rendered implementation: `qa-research-layout-001-implementation.jpg`.
- Combined comparison evidence: `qa-research-layout-comparison.jpg`.
- Source pixels: 2048 × 1423. Browser chrome was cropped, then the page area was scaled and padded to the 1348 × 926 implementation capture.
- Implementation pixels: 1348 × 926 from a 1363 × 936 CSS-pixel browser viewport at the browser's native capture density.
- State: Research 001, `#introduction`, tablet/medium layout with the right reading wave visible.

## Findings

- No actionable P0/P1/P2 differences remain after the reading-layout pass.
- Typography: the previous extra-wide Helvetica reading measure was replaced with the existing Galok Gambetta text face and Bagnard display face. Body copy now measures 752 px at the tested viewport, with an 18.7 px size and 29–31 px line height.
- Spacing and layout: prose and headings share a centred 47rem measure; figures retain a separate 1120 px measure. The document width remains below the viewport and the right wave does not cover the text column.
- Colour and tokens: the existing paper, ink, muted, red and blue tokens remain unchanged. No gradients, cards or new visual language were introduced.
- Image quality: research hero and figure images are unchanged and retain intrinsic-ratio rendering. No image was replaced, redrawn or recropped.
- Copy and content: paper copy, tables, figures, citations and data are unchanged.

## Interaction and runtime checks

- Research 001 and Research 002 both loaded from the live HTTPS site with `research.css?v=20260822f`.
- Both pages measured a 752 px prose column and 1120 px figure column at 1363 × 936; document width was 1348 px, so no horizontal overflow was present.
- The tablet reading wave remained visible, marked the introduction as active, and updated to a later section after a deep-link reload.
- Browser rendering completed without a visible JavaScript error state. The browser runtime did not expose a console-log reader; the two page validators and generated-page checks therefore remain the authoritative JavaScript/markup gate.
- Mobile rules were checked statically: the phone layout keeps 16 px page gutters, a 1.06rem body size, 1.68 line height, reduced heading scales and the existing compact native contents disclosure.

## Comparison history

### Pass 1 — source issue

- [P1] Prose occupied nearly the full 1200 px tablet manuscript width, producing very long lines and poor return sweeps.
- [P2] Section headings used the same oversized sans treatment as data figures, weakening long-form hierarchy.
- [P2] The tablet figure-width fix had coupled prose width to chart width.

### Fixes applied

- Split the manuscript into a narrow prose measure and a wide figure/table measure.
- Restored Galok's editorial text and display faces inside research pages only.
- Added paragraph rhythm, balanced headings, normal word breaking and calmer mobile heading scales.
- Kept charts, tables, wave navigation, imagery and paper content on their existing sans/data treatment.

### Pass 2 — post-fix evidence

- The combined comparison shows the old wide sans column on the left and the revised centred editorial column on the right.
- Research 001 and Research 002 produce matching measured widths, typefaces and overflow results.
- No further P0/P1/P2 visual issue was found in the rendered tablet state.

## Residual test gap

- A physical phone viewport was not available in the cloud browser for this pass; phone behavior is covered by the existing responsive rules and static validation, but should still receive a quick Safari spot check after cache refresh.

## Final result

passed
