# 001 — Stabilize literary scroll reveals

- **Status**: DONE
- **Commit**: 97fab28
- **Severity**: HIGH
- **Category**: Accessibility, easing and duration, performance
- **Estimated scope**: 6 files, small shared motion edit plus cache busts

## Problem

The shared reveal system hides both the entire spread and all of its children, then waits for IntersectionObserver. On slower Safari layout or deep scrolling this can expose a blank panel before the observer catches up. The English line also takes 950ms and the plate transform takes 1050ms, making the editorial content feel staged rather than responsive.

```css
/* be-a-viewer/literary-city.css:332-341 — current */
.literary-motion-ready [data-literary-reveal] { opacity: 0; }
.literary-motion-ready .literary-plate[data-literary-reveal] { transform: translateX(1.5rem); transition: opacity .75s ease-out .08s, transform 1.05s cubic-bezier(.16, 1, .3, 1); }
.literary-motion-ready .literary-spread[data-literary-reveal] .literary-citation,
.literary-motion-ready .literary-spread[data-literary-reveal] .literary-quote,
.literary-motion-ready .literary-spread[data-literary-reveal] .literary-source { opacity: 0; }
.literary-motion-ready .literary-spread[data-literary-reveal] .literary-quote--en { transition: opacity .95s ease-out .32s; }
```

```js
/* be-a-viewer/literary-city.js:21 — current */
reveals.forEach((node) => observer.observe(node));
```

## Target

Never hide the spread container. Reveal only its four content groups with transform and opacity. Use one shared strong ease-out curve `cubic-bezier(0.23, 1, 0.32, 1)`, movement no larger than `.75rem`, 60ms content stagger, and total completion under 600ms. Immediately mark anything already in the initial viewport visible before observing the rest.

```css
/* target motion tokens and content reveal */
.literary-city { --lit-ease-out: cubic-bezier(.23, 1, .32, 1); }
.literary-motion-ready .literary-spread[data-literary-reveal] { opacity: 1; }
.literary-motion-ready .literary-spread[data-literary-reveal] .literary-quote--zh {
  transform: translateY(.75rem);
  transition: opacity 420ms var(--lit-ease-out) 60ms,
              transform 520ms var(--lit-ease-out) 60ms;
}
```

## Repo conventions to follow

- Motion lives in `be-a-viewer/literary-city.css` and activation in `be-a-viewer/literary-city.js`; do not add a dependency.
- Reuse the existing `.literary-motion-ready`, `[data-literary-reveal]`, and `.is-visible` contract.
- Keep no-JS content visible by default and retain the existing `prefers-reduced-motion` branch.

## Steps

1. In `be-a-viewer/literary-city.css`, add `--lit-ease-out`, scope initial opacity to masthead, plate, and spread children, and keep `.literary-spread` itself visible.
2. Replace oversized transforms and 750-1050ms timings with <=.75rem transforms and 280-520ms transitions; stagger citation, Chinese, English, and source by 60ms.
3. In `be-a-viewer/literary-city.js`, test each reveal's bounding rect and add `.is-visible` immediately when it intersects the first 92% of the viewport; observe only offscreen nodes.
4. In the five city HTML files, bump the shared JS version together with the CSS version.

## Boundaries

- Do NOT change literary copy, semantic article markup, city-specific palettes, hero media, or global navigation.
- Do NOT add keyframes, animation libraries, dependencies, blur, scale, or layout-property animation.
- If the shared selectors no longer match the code at commit `97fab28`, STOP and report instead of improvising.

## Verification

- **Mechanical**: `node --check be-a-viewer/literary-city.js && git diff --check` must pass.
- **Feel check**: open each city, scroll through all four literary spreads, and confirm:
  - no full panel is blank while waiting for an observer;
  - content settles in under 600ms with no more than `.75rem` motion;
  - quickly paging or jumping to a hash never leaves content at opacity 0;
  - reduced motion shows all content immediately with no translation.
- **Done when**: all 20 spreads remain readable during and after reveal, with zero console errors.
