# 002 — Make data state changes crisp and interruptible

- **Status**: DONE
- **Commit**: 016651c
- **Severity**: MEDIUM
- **Category**: Easing, duration, cohesion and accessibility
- **Estimated scope**: 2 files, shared tokens plus state-transition polish

## Problem

The current data explorer has one isolated easing curve for the active-tab underline, while the chart, reading block, tooltip and disclosure icon teleport between states. The underline curve is close to a strong ease-out but is an unregistered one-off. Hover colors are also ungated for coarse pointers.

```css
/* data/data-hub.css:188-196 — current */
.data-hub-tab::after {
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 220ms cubic-bezier(0.2, 0.7, 0.2, 1);
}
```

```js
/* data/data-hub.js:166-170 — current */
selectIndicator(id) {
  this.activeId = id;
  this.selectedYear = YEAR_END;
  this.render();
}
```

## Target

Register exact motion tokens on `.data-page`, reuse them for UI state, and keep every UI transition under 250ms. Do not animate chart geometry after a keyboard action; update it immediately. Only use a brief opacity/translate reveal for explanatory chart annotations when a section first enters.

```css
.data-page {
  --data-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --data-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --data-duration-fast: 160ms;
  --data-duration-ui: 220ms;
}

.data-hub-tab::after {
  transition: transform var(--data-duration-ui) var(--data-ease-out);
}
```

## Repo conventions to follow

- Data-specific tokens live at the top of `data/data-hub.css` with the existing `--data-*` palette.
- Data interaction remains dependency-free in `data/data-hub.js`.
- The global site already branches on `prefers-reduced-motion`; the data page must add a local branch for new explanatory motion.

## Steps

1. Add the exact `--data-ease-out`, `--data-ease-in-out`, `--data-duration-fast`, and `--data-duration-ui` tokens to `.data-page`.
2. Replace the one-off tab underline curve with `var(--data-duration-ui) var(--data-ease-out)`.
3. Add `transition: opacity var(--data-duration-fast) var(--data-ease-out), transform var(--data-duration-fast) var(--data-ease-out)` to the tooltip. Its hidden/visible state may use at most `translateY(4px)` in addition to its existing positioning transform. Do not animate `left`, `top`, width, height, margins or padding.
4. Rotate only the source-disclosure marker using `transform` over 180ms; preserve native `<details>` behavior and the plus/minus accessible text.
5. Gate hover-only transforms/colors with `@media (hover: hover) and (pointer: fine)`; focus-visible and active states remain available everywhere.
6. In `prefers-reduced-motion: reduce`, remove translation but retain <=160ms opacity/color feedback. Do not set all transitions to none.

## Boundaries

- Do NOT animate the path between indicators or delay keyboard/pointer updates.
- Do NOT add keyframes, spring libraries, smooth-scroll interception, blur, scale(0), or `transition: all`.
- Do NOT edit global `styles.css` or `script.js` for this plan.
- If selectors differ from commit `016651c`, STOP and report rather than inventing replacements.

## Verification

- **Mechanical**: `node --check data/data-hub.js && git diff --check` passes.
- **Feel check**: at 10% playback, repeatedly click and keyboard-arrow through indicator tabs:
  - the data changes immediately and never queues or restarts a chart tween;
  - underline and tooltip feedback settle in <=220ms;
  - touch emulation does not leave false hover states;
  - reduced motion removes translation but keeps readable state feedback.
- **Done when**: state changes feel immediate, the animation explains active state only, and no content is hidden while waiting for motion.
