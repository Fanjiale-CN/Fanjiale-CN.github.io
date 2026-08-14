# 004 — Publish The Curator's Curse with restrained editorial motion

- **Status**: DONE
- **Severity**: MEDIUM
- **Category**: Purpose, continuity and accessibility
- **Estimated scope**: one article stylesheet; existing shared JavaScript

## Problem

A new long-form page can feel inert if its evidence figure has no state feedback, but the essay's serious tone would be weakened by repeated scroll theatrics or decorative motion. The cover, chapter links and evidence controls need one coherent, interruptible motion vocabulary.

## Target

```css
.curator-interactive {
  --curator-motion-fast: 160ms;
  --curator-motion-ui: 220ms;
  --curator-motion-reveal: 480ms;
  --curator-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}
```

- Cover artwork settles once with opacity plus a maximum 2.5% scale change.
- Evidence controls respond in 160–220ms, moving no more than 2px.
- Existing `data-reveal` elements use the shared reveal system; no new scroll listener is added.
- Chapter state changes remain immediate enough for reading navigation.
- Hover transforms are gated to `hover:hover` and `pointer:fine`.
- Reduced-motion removes transforms and nonessential animation while preserving state colour, underline and content changes.

## Implementation

1. Reuse `initInteractiveCharts()` for pointer, focus and click parity.
2. Scope all additional motion to `.curator-article`; do not modify other essays.
3. Keep cover type static and animate only the raster art layer.
4. Use opacity/transform only; no layout animation, auto-advance, spring, parallax or continuous loop.

## Boundaries

- No new animation dependency.
- No animation that delays access to article text.
- No hover-only evidence.
- No sound or autoplay video.

## Verification

- Repeated pointer movement settles before the next control is reached.
- Keyboard focus activates the same evidence detail as pointer/click.
- At `prefers-reduced-motion: reduce`, the page is fully visible and only colour/opacity state feedback remains.
- Search for `transition: all`, layout-property animation, ungated hover transforms and durations above 520ms.
