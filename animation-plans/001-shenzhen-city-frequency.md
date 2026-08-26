# Shenzhen City Frequency — Motion Plan

**Audited commit:** `7d270a1`
**Scope:** `be-a-viewer/shenzhen/`
**Intent:** Make the page feel like a live city signal moving from bay to street to ridge, without scroll-jacking or decorative motion noise.

## Existing Pattern Read

- City pages consistently pause hero video when it leaves the viewport.
- `IntersectionObserver` is the established reveal primitive and keeps scroll work off the main thread.
- Existing pages use several long generic fades. Shenzhen should tighten UI feedback and reserve longer motion for the media itself.
- Reduced-motion support exists across the city system and must remain complete.

## Motion Vocabulary

| Element | Trigger | State change | Duration | Easing |
| --- | --- | --- | --- | --- |
| Section signal | chapter crosses 52% viewport | timestamp, district and active rail marker update | 180ms | `cubic-bezier(.23,1,.32,1)` |
| Chapter copy | first intersection | opacity 0→1, translateY 12px→0 | 220ms | `cubic-bezier(.23,1,.32,1)` |
| Media exposure | first intersection | opacity 0→1, translateY 12px→0 | 220ms | `cubic-bezier(.23,1,.32,1)` |
| Rail marker | active chapter changes | scale .72→1, fill paper→signal red | 180ms | `cubic-bezier(.23,1,.32,1)` |
| Image hover | pointer hover | image scale 1→1.015 | 220ms | `cubic-bezier(.23,1,.32,1)` |
| Sound/pause control | click/keyboard | icon and label swap in place | 160ms | `ease-out` |

## Scroll Logic

1. Use a single `IntersectionObserver` for chapter activation with a middle viewport root margin.
2. Keep the left signal rail sticky only on wide screens; on small screens it becomes a horizontal chapter index above the story.
3. Do not scrub transforms against every scroll pixel. Native scrolling remains in control.
4. Pause video whenever its section is outside the viewport or the document is hidden.
5. Do not auto-play sound. The page begins muted and the control clearly reports its state.

## Reduced Motion

- Reveal all text and media immediately.
- Remove clip-path, transform and transition effects.
- Keep the hero poster visible; video may play only after explicit user activation.
- Chapter state updates remain instantaneous so orientation is preserved.

## Accessibility Checks

- Keyboard focus uses a visible signal-red outline with 3:1 contrast.
- The active chapter is exposed through `aria-current="step"` on the rail.
- Decorative route lines are hidden from assistive technology.
- Media controls remain native buttons with current-state labels.
