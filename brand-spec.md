# Galok brand and interface specification

## Identity

- Primary logo: `/assets/galok-symbol.svg` (black / `#111111`, transparent background)
- Inverse logo: `/assets/galok-symbol-white.svg` (white / `#FFFFFF`, transparent background)
- Legacy-compatible mark path: `/assets/galok-mark.svg` resolves to the same current monochrome geometry; the former multicolor mountain mark is retired.
- Logo usage: black mark on light surfaces; white mark on dark or image-heavy surfaces. Geometry must remain identical across both variants.
- Favicon: `/assets/favicon.svg`, a square optical composition of the same mark with light/dark browser-chrome adaptation.
- Default social card: `/assets/social/galok-default-og.png` at 1200×630. `/assets/social/galok-default-og.svg` is the editable source, not the crawler-facing `og:image` asset.
- Wordmark: `GALOK / Field notes`
- Voice: observant, direct, editorial, specific
- Primary routes: `/cities/`, `/essays/`, `/research/`, `/data/`, `/work/`, `/index/`, `/about/`. `/be-a-viewer/`, `/works/`, `/notes/`, `/views/` and `/archive/` are compatibility redirects; city chapters keep their established `/be-a-viewer/{city}/` routes.

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

## Logo rules

- Preserve the mark geometry, proportions and clear space.
- Use the black mark on light paper, white and pale image fields.
- Use the white mark on dark chrome, dark photography and video.
- Navigation may switch between the two variants as its background state changes; the transition must not change size or geometry.
- Do not recolor the mark with section accents, red, gradients or arbitrary brand colors.
- Do not add outlines, drop shadows, glow, texture, rotation or distortion.
- Browser favicons use the dedicated optical favicon asset rather than shrinking the full navigation logo ad hoc.

## Social identity

- The default brand card uses the dark-field system, the monochrome mark, `GALOK / FIELD NOTES`, the line `THE CITY KEEPS THE EVIDENCE.`, and `galok.me`.
- Use the 1200×630 PNG for generic brand surfaces, the homepage, directory/index pages and pages without a strong content-specific cover.
- Essays, research, city stories and reading chapters should retain content-specific imagery when that image materially identifies the page. Brand consistency should be added through future card templates rather than replacing every content image with the generic card.
- Do not use SVG directly as `og:image` or `twitter:image`; crawler and social-platform support is inconsistent. Keep SVG as the editable source and publish a raster PNG/WebP derivative.
- Social-card text must remain inside generous safe areas so X, Instagram, messaging apps and search previews can crop without removing the identity or title.

## Motion

- Interaction feedback: 160–220ms.
- Content entrances: 480–720ms with varied easing and a single focal sequence per section.
- Navigation hides only after deliberate downward travel and returns after deliberate upward travel.
- Scroll position never drives broad layout state or continuous text transforms.
- `prefers-reduced-motion` removes nonessential transforms, smooth scrolling and timed media advancement.

## Protected contracts

- Preserve routes, slugs, the current archive navigation vocabulary and article URLs.
- Preserve the current Galok mark geometry and the black/white contrast rules above.
- Preserve keyboard focus, semantic headings, menu escape behavior and article reading progress.
- Do not reintroduce a fixed bottom navigation on mobile.

## Avoid

- Repeated decorative eyebrow/headline/paragraph stacks without informational value.
- Duplicate controls for the same carousel action.
- Fabricated metrics, percentages or trust signals.
- Continuous scroll-scrubbing on touch devices.
- Gradient decoration, rounded-card grids or motion that does not communicate hierarchy or feedback.
