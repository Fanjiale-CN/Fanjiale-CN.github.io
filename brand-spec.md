# Galok brand and interface specification

## Identity

- Logo: `/assets/galok-symbol.svg`
- Logo colors: `#E5392D`, `#111111`
- Wordmark: `GALOK / Field notes`
- Voice: observant, direct, editorial, specific
- Primary routes: `/views/`, `/visual-notes/`, `/be-a-viewer/`, `/about/`; `/essays/` is retained only as a compatibility redirect while article permalinks remain under `/essays/{slug}/`.

## Visual system

- Paper: `#f4f5f3`
- White: `#f8f9f7`
- Ink: `#101214`
- Muted: `#62676b`
- Red index accent: `#a32424`
- Frame blue: `#355f7d`
- Dark field: `#0d1115`
- Typography: Helvetica Neue / Arial Nova / Arial for display, body and utility copy; Noto Serif HK assets are reserved for Chinese glyphs.
- Layout: sharp editorial rules, oversized statements, restrained asymmetry, real documentary imagery.
- Radius: square for editorial controls and content blocks; 20–30px only for immersive viewer cards and media frames.

## Motion

- Interaction feedback: 160–220ms.
- Content entrances: 480–720ms with varied easing and a single focal sequence per section.
- Navigation hides only after deliberate downward travel and returns after deliberate upward travel.
- Scroll position never drives broad layout state or continuous text transforms.
- `prefers-reduced-motion` removes nonessential transforms, smooth scrolling and timed media advancement.

## Protected contracts

- Preserve routes, slugs, primary navigation labels and article URLs.
- Preserve the current logo asset and documentary image treatment.
- Preserve keyboard focus, semantic headings, menu escape behavior and article reading progress.
- Do not reintroduce a fixed bottom navigation on mobile.

## Avoid

- Repeated decorative eyebrow/headline/paragraph stacks without informational value.
- Duplicate controls for the same carousel action.
- Fabricated metrics, percentages or trust signals.
- Continuous scroll-scrubbing on touch devices.
- Gradient decoration, rounded-card grids or motion that does not communicate hierarchy or feedback.
