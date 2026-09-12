# Galok Editorial Direction

## Public identity

- The public author identity is **Galok**.
- Galok is a digital-native visual research and publishing practice.
- Cities remains its own art-directed project family. Every other public surface follows the shared editorial system below.

## Design system: Digital Editorial Modernism

Galok is built for screens first. It should feel young, current, rigorous and usable, not archival, nostalgic or faux-print.

### Core palette

Every page uses a monochrome base plus one signal color:

- Background: cool off-white `#F5F6F7`
- Surface: white `#FFFFFF`
- Ink: near-black `#0A0C0E`
- Muted text: cool gray `#626B73`
- Rules: `#D9DEE2`
- Default Galok signal: cyan `#00AECA`

Warm paper, aged parchment, cream editorial backgrounds and faux-antique treatments are retired from the main system.

## Three lenses

The conceptual core is three distances of observation. They describe **how** a piece looks at the world, not which section it belongs to.

### 视 / View

- English: **View**
- Glyph: **视**. Do not use `視` in Galok interface labels.
- Signal: `#FF4057`
- Meaning: pull back far enough to see systems, cycles, institutions and macro pressure.

### 框 / Frame

- English: **Frame**
- Glyph: **框**
- Signal: `#2F63FF`
- Meaning: choose the boundary, variables and comparison that make an argument legible.

### 察 / Observe

- English: **Observe**
- Glyph: **察**
- Signal: `#B7E600`
- Meaning: stay close to street-level evidence, behavior, images, interfaces and small scenes.

### Lens typography

All three Chinese lens glyphs use the self-hosted seal-script font:

`/assets/fonts/yishanbeizhuanti.ttf`

CSS family name: **Galok Glyph Display**.

The glyph is a classification mark, not ordinary body typography. MiSans remains the primary interface and editorial sans.

## Color discipline

The page should remain approximately **90% black / white / gray and 10% signal color**.

Signal color is reserved for:

- lens glyphs and lens labels
- section indexes
- active controls
- key statistics
- chart emphasis
- one or two structural rules

Do not turn the theme color into a full-page wash. Photography, video and data may carry their own factual color when needed.

## Typography

- Primary sans: **MiSans**
- Lens glyphs: **Galok Glyph Display**
- Historical source text may keep its source-appropriate Chinese serif system in Reading.
- Monospace is reserved for code, coordinates, evidence IDs and machine-readable metadata.

Large type creates rhythm. It should not imitate a newspaper masthead or an academic PDF cover.

## Layout

- Strong grids and deliberate asymmetry.
- Square editorial surfaces by default.
- Hairline rules instead of decorative borders.
- Cold white space instead of paper texture.
- Images stay in the document flow unless a page-specific layout explicitly owns a breakout.
- Charts must never depend on viewport breakout transforms for basic alignment.

## Navigation

- Essay and Research detail pages are navigation-free reading surfaces.
- Collection and utility pages use the shared restrained site navigation.
- Reading may keep chapter progress where it materially helps navigation.
- Cities is exempt and keeps its own project-specific navigation and art direction.

## Motion

Motion is interface feedback, never a tollbooth.

- Prefer opacity and transform.
- No bounce or decorative overshoot.
- UI motion normally completes in 160–260 ms.
- Respect `prefers-reduced-motion`.
- Content must remain fully usable if motion does not run.

## Section behavior

The shared system is promoted to Home, Essays, Research, Radar, Data, Reading, Work, Index, About, Themes, Design, Visual Notes, Postcards and Press Print.

Press Print may preserve its black editorial identity, but its surrounding UI follows the same discipline and its graphic accents should collapse toward one dominant signal at a time.

Cities and `/be-a-viewer/*` remain intentionally outside this shared skin.

## Implementation authority

1. This file defines Galok's current visual direction.
2. `/assets/galok-modern-system.css` is the shared implementation entry point for non-Cities surfaces.
3. `/assets/galok-modern-core.css`, `/assets/galok-modern-longform.css`, and `/assets/galok-modern-surfaces.css` split the system into maintainable layers.
4. Section-specific CSS may refine layout, but it must not reintroduce warm paper, multiple competing accents, rounded SaaS cards, or non-seal lens glyph typography.
5. `/assets/observability.js` applies the shared system at runtime and normalizes legacy lens UI from `視` to `视`.

## Working principle

**Monochrome system. One lens. One signal.**

The site should feel like publishing rebuilt for the browser, not paper reproduced on a screen.
