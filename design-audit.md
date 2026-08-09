# Galok design audit

## Mode

Redesign · Preserve

## Preserve

- Documentary photography and video
- Large editorial typography and indexed chapters
- Red accent, paper neutrals and dark field sections
- Existing content, routes, anchors and brand mark

## Improve

- One primary navigation vocabulary across every page: Be a Viewer, Works, Notes, Archive, About
- A homepage that exposes the three main ways into the site
- A filterable city index and a shared continuation rail on every open city story
- Dedicated Works and Notes surfaces, plus one searchable cross-site archive
- Deliberate scroll-direction chrome with stronger mobile hysteresis
- Tighter interior-page introductions
- A shared, useful footer and contact path
- Consistent keyboard focus, reduced motion and touch targets
- Clearer card affordance and typography wrapping

## Remove

- Legacy View / Frame / Observe labels from the primary navigation
- Previous / next controls duplicated by the numbered hero selector
- Decorative percentage bars on the About page
- Excessive empty space above interior-page introductions

## Implemented archive spine

- `archive-system.css` owns the shared paper, ink, red and deep-blue tokens for new archive surfaces.
- `script.js` normalizes navigation and directory footers without breaking existing article or city URLs.
- `archive-system.js` owns the city filters, Works reel, Notes stream and archive search.
- The motion system uses transform/opacity transitions, strong ease-out curves, press feedback and a reduced-motion path.
- New pages retain real site media; the generated paper composition is non-identity-critical and used as an editorial cover.

## Design read

- Artifact: independent editorial and visual-story website
- Audience: readers interested in cities, consumption and everyday systems
- Visual language: documentary kinetic editorial
- Mode: redesign-preserve
- Visual variance: 6 / 10
- Motion intensity: 5 / 10
- Information density: 4 / 10
- Asset dependence: 9 / 10
- Brand fidelity: 9 / 10
