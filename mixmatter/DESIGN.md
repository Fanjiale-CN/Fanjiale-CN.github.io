# MixMatter Web Design System

## Intent

The website should behave like a MixMatter reconstruction, not a SaaS landing page wrapped around MixMatter outputs. The page itself is a flat visual system built from source imagery, hard fields, selective halftone, crop, interruption, index-like typography, and active quiet space.

## Visual Thesis

Photography is material. UI chrome is structure. Motion reveals decisions.

The layout establishes dominant, supporting, field, and quiet roles before any texture appears. Image fragments are cropped and overlapped for structural reasons. Halftone is bounded and local. No glass cards, pill-heavy controls, diffuse shadows, decorative gradients, or fake paper nostalgia.

## Colors

- Cold paper: #EEF2F0
- Ink: #0A0D0C
- Cobalt field: #1769FF
- Cyan signal: #B8EFFF
- Forest structural dark: #0C4B39
- Sulfur yellow accent: #F3C744

## Typography

- Primary: Inter / MiSans / Helvetica Neue / Arial
- Index and technical labels: system monospace
- Display typography is large, compressed, left-biased, and treated as a structural plane rather than decorative branding.

## Geometry

- Default border radius: 0
- 1px rules define zones and index structures.
- Use 12-column asymmetrical layouts.
- Crops and overlaps may be irregular, but must protect subject identity.
- Quiet areas are allowed to remain quiet.

## Motion

Motion follows HyperFrames-style choreography principles:

- Build final layout first, animate from temporary offsets into the designed state.
- Prefer transform and opacity.
- Entrances reveal hierarchy in order: title, primary image, supporting fragments, labels.
- Pointer parallax is restrained and depth-weighted.
- Section reveals use short power3 / expo style easing, never bouncy app-like motion.
- Motion is disabled or flattened under prefers-reduced-motion.

## What NOT to Do

- No frosted glass hero container.
- No default rounded SaaS cards.
- No blue-purple glow gradients as a substitute for composition.
- No random torn-paper decoration on every edge.
- No global halftone overlay.
- No deep cinematic parallax or pseudo-3D stage lighting.
- No new visual motif unless it grows from MixMatter's source / hierarchy / material logic.
