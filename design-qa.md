# Design QA — Research tablet reading wave

## Comparison target

- Source issue: `/workspace/scratch/aa2e56b19934/upload/IMG_4259.png`.
- Side-by-side source and implementation evidence: `qa-research-wave-comparison.jpg`.
- Rendered viewport: 1363 × 936 CSS pixels, medium/tablet layout.
- Tested state: Research 002 body at an active section, with the right-edge wave visible.

## Visual comparison

- The fixed horizontal chapter strip in the source is removed from the reading column.
- The replacement uses the existing Galok Reading Wave visual language: quiet hairlines, a fixed centre playhead, restrained chapter accents and a paper-coloured inspector.
- The article typography, paper colour, section spacing, figures and copy are unchanged.
- The wave occupies the safe right edge without creating horizontal overflow or covering the reading column.
- Research 001 and Research 002 use the same shared component and breakpoint rules.

## Interaction checks

- Scroll tracking: active chapter and reading percentage update with document scroll.
- Touch/pen scrub: pointer capture keeps the wave responsive while dragging.
- Direct jump: tapping the wave moves to the corresponding document position.
- Inspector: the chapter label follows the inspected position and dismisses after 1.1 seconds on touch/pen.
- Position measurement: chapter positions use document-relative bounding rectangles so long, dynamically laid-out papers do not drift.
- Accessibility: the interactive track exposes scrollbar semantics, current percentage, chapter text and keyboard controls.
- Responsive fallback: wide desktop retains the left contents rail; phone retains the compact native contents disclosure.

## Validation

- Both generated research pages contain the shared wave stylesheet, script and chapter navigation.
- No horizontal overflow was observed in the rendered tablet state.
- No page JavaScript errors were observed; the only browser console message came from the browser extension environment.
- Static validators, JavaScript syntax checks and `git diff --check` pass.

## Findings resolved

- [P1] Tablet contents navigation was fixed at the page top and disappeared after scrolling.
- [P1] The horizontal list exceeded the available width and made later chapters hard to reach.
- [P2] Long-paper chapter positions could drift when measured through offset-parent chains.
- [P2] Touch inspection could leave a label visible indefinitely.

## Final result

passed
