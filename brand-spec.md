# Galok brand and interface specification

## Identity

- Logo: `/assets/galok-symbol.svg`
- Logo colors: `#E5392D`, `#111111`
- Wordmark: `GALOK / Field notes`
- Voice: observant, direct, editorial, specific
- Primary routes: `/be-a-viewer/`, `/works/`, `/notes/`, `/archive/`, `/about/`. Existing `/views/`, `/visual-notes/`, `/postcards/` and `/essays/{slug}/` routes remain public archive destinations.

## Visual system

- Paper: `#f2efe5`
- White: `#fbfaf5`
- Ink: `#101214`
- Muted: `#62676b`
- Red index accent: `#c74637`
- Frame blue: `#173f53`
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

- Preserve routes, slugs, the current archive navigation vocabulary and article URLs.
- Preserve the current logo asset and documentary image treatment.
- Preserve keyboard focus, semantic headings, menu escape behavior and article reading progress.
- Do not reintroduce a fixed bottom navigation on mobile.

## Avoid

- Repeated decorative eyebrow/headline/paragraph stacks without informational value.
- Duplicate controls for the same carousel action.
- Fabricated metrics, percentages or trust signals.
- Continuous scroll-scrubbing on touch devices.
- Gradient decoration, rounded-card grids or motion that does not communicate hierarchy or feedback.
