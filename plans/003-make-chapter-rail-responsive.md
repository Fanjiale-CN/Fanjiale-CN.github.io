# 003 — Make the chapter rail responsive

- **Status**: DONE
- **Commit**: dffbb17
- **Severity**: MEDIUM
- **Category**: Easing, interruptibility and accessibility
- **Estimated scope**: one shared CSS file, one shared JavaScript file, 11 HTML consumers

## Problem

Chapter links currently occupy a full-width sticky row and use multiple local hover/state transitions. On touch screens the same controls become horizontal scrollers. The interaction has no shared motion contract.

## Target

Create a shared left rail. Link width changes from `2.75rem` to at most `13.5rem` with `220ms cubic-bezier(.23,1,.32,1)`. Opacity and color use `160ms cubic-bezier(.23,1,.32,1)`. Touch uses first tap to reveal and second tap to follow. Keyboard focus reveals the label. Reduced motion removes width and transform transitions but retains color feedback.

## Repo conventions to follow

- Reuse the current `is-active` and `aria-current="location"` state owners.
- Reuse existing progress elements inside each navigator.
- Keep presentation in a shared root stylesheet and interaction enhancement in a shared root script.

## Steps

1. Add the shared stylesheet and script.
2. Add `.chapter-rail` to each traced in-page navigator and load the shared assets.
3. Remove only local rules that hide the rail or translate it vertically.
4. Validate pointer, touch, keyboard and reduced-motion states.

## Boundaries

- Do not rewrite section observers.
- Do not animate layout outside the rail.
- Do not add dependencies.

## Verification

- **Mechanical**: `node --check chapter-rail.js`; `git diff --check`; confirm every rail page loads both shared files.
- **Feel check**: repeatedly hover between adjacent links and confirm widths retarget without snapping; focus through every link; emulate touch and confirm first tap previews while second tap follows; enable reduced motion and confirm labels reveal without sliding.
- **Done when**: every full-width chapter strip is replaced, active state remains accurate and no page gains horizontal overflow.
