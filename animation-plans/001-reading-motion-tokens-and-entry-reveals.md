# Reading motion tokens and Entry 12–14 reveals

## Production rule

Motion exists to reveal information structure, not decorate it.

- Properties: `opacity` and `transform` only.
- Single reveal duration: 220ms (hard ceiling: ~240ms).
- Easing: `cubic-bezier(.2,.72,.2,1)`.
- Trigger: one-shot `IntersectionObserver`.
- Fallback: reveal immediately when IntersectionObserver is unavailable.
- Accessibility: `prefers-reduced-motion: reduce` disables animation.
- Mobile: no sticky or orbit animation is required for comprehension.

## Entry 12

Reveal the four market branches as the network comes into view. The topology remains static; animation must not imply exact map geometry.

## Entry 13

Reveal the architectural layers from the visible end-state and the zhengdian–jiaodian supply nodes. Do not animate fabricated building dimensions.

## Entry 14

Reveal service roles around the table. On narrow screens the same roles remain a linear reading sequence.

## HyperFrames boundary

`hyperframes/dongjing-12-14-motion-study/` is an independent review composition. Production pages do not import GSAP or HyperFrames.
