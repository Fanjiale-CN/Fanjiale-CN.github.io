# 003 — Unify editorial hover motion

- **Status**: DONE
- **Commit**: 5c4483c
- **Severity**: MEDIUM
- **Category**: Purpose, frequency, accessibility and cohesion
- **Estimated scope**: 5 CSS files, approximately 45 declarations

## Problem

The shared editorial surfaces use many different hover distances and durations for the same action. A common card hover may run for 460–850ms, while adjacent lists use 160ms. Several transform hovers are not enclosed by a fine-pointer query. This makes a frequently used navigation gesture feel heavier than the reading interface and allows touch devices to enter sticky hover states.

Confirmed examples:

```css
/* styles.css — before */
.field-route {
  transition: transform 460ms cubic-bezier(0.2, 0.7, 0.1, 1), box-shadow 460ms ease;
}

/* archive-system.css — before */
.work-case figure img {
  transition: transform 640ms cubic-bezier(0.16, 1, 0.3, 1), filter 260ms ease;
}

/* about/about.css — before */
.about-method-visual figure {
  transition: opacity 520ms var(--about-ease), transform 800ms var(--about-ease);
}
```

The long image drift can remain for rare explanatory transitions. The frequently triggered card, row and link hovers should not inherit that timing.

## Target

Use the existing crisp editorial personality and the audit values below:

```css
:root {
  --motion-ui-fast: 160ms;
  --motion-ui: 220ms;
  --motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}

@media (hover: hover) and (pointer: fine) {
  .interactive-card {
    transition: transform var(--motion-ui) var(--motion-ease-out),
                color var(--motion-ui-fast) ease,
                background-color var(--motion-ui-fast) ease;
  }
  .interactive-card:hover { transform: translateY(-4px); }
}
```

- Button and row feedback: 100–160ms.
- Card movement: 220ms, maximum 4px.
- Image zoom on deliberate project cards: 260–300ms, maximum `scale(1.02)`.
- Marketing hero drift and explanatory city transitions are out of scope.
- Reduced motion keeps color/opacity feedback and removes movement.

## Repo conventions to follow

- Strong ease-out tokens already exist in `archive-system.css:9` and `data/data-hub.css:11`: `cubic-bezier(0.23, 1, 0.32, 1)`.
- Fine-pointer gating already exists in `archive-system.css:310` for project-card image zoom.
- Reduced-motion sections already exist at the end of every target stylesheet. Extend those blocks instead of creating disconnected exceptions.

## Implemented

1. Added `--motion-ui-fast`, `--motion-ui`, and `--motion-ease-out` to the current Field System `:root` in `styles.css`; reused the same curve values in files that cannot inherit the root.
2. Moved transform-based hover declarations for `.field-route` and `.field-latest-lead` inside `@media (hover: hover) and (pointer: fine)`. Reduced route movement to `translateY(-4px)` and card/image timing to 220–300ms.
3. Kept explanatory state changes and reduced repeated `.work-card`, `.notes-row`, `.work-case`, and `.archive-result` hover motion. Transform hovers are now fine-pointer gated.
4. Left selection-rail drag and method image state transitions unchanged. Gated project-image hover transforms and capped them at 280ms.
5. Separated rare modal/reveal motion from repeated city-edition and postcard hover motion. Repeated motion now uses 220–280ms, maximum 4px/1.02 scale and fine-pointer gating.
6. Preserved the existing reduced-motion overrides: affected elements keep color or opacity feedback while spatial motion is removed.

## Boundaries

- Do NOT change HTML structure, JavaScript, carousel timing, route labels or media.
- Do NOT change the city hero crossfade, About method state transition, postcard editor flip, or literary scroll reveal.
- Do NOT add dependencies.
- If a cited selector has changed since commit `5c4483c`, STOP and report instead of applying a similar-looking global rule.

## Verification

- **Mechanical**: run `git diff --check`; run `rg -n "transition: all|scale\\(0\\)|ease-in\\b" styles.css archive-system.css about/about.css be-a-viewer/city-archive.css postcards/postcards.css` and confirm no new UI regressions.
- **Feel check**: at desktop width, move the pointer repeatedly across homepage routes, essay rows, archive results and project cases. Each hover should respond immediately, move no more than 4px, and settle before the pointer reaches the next item. At 10% playback, no card should continue drifting after the pointer leaves.
- **Touch check**: use a coarse-pointer emulation and tap every affected card. No transform state may stick after navigation is cancelled.
- **Reduced motion**: emulate `prefers-reduced-motion: reduce`; color and underline feedback remain, spatial motion is absent.
- **Done when**: common navigation hovers feel like one family, all transform hovers are fine-pointer gated, and the rare cinematic transitions remain visually distinct.
