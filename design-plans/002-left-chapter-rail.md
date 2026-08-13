# 002 — Replace top chapter strips with one left reading rail

- **Status**: IMPLEMENTED
- **Commit**: dffbb17
- **Scope**: Data, batch essays, Beijing, Hangzhou, Shanghai, Xi’an and Xiamen chapter navigation

## Design language

- **Audited surface**: in-page chapter navigation that follows long-form reading.
- **Design sources**: the supplied screenshot; current Galok paper, ink and city accent tokens; current active-section scripts.
- **Documented decision**: keep navigation visible without taking a full horizontal row from the reading surface.
- **Governing owners and consumers**: `data/data-hub.css`, `styles.css`, the five city stylesheets and their existing section-state scripts.
- **Explicit exceptions**: primary site navigation and the in-content “Cities in words” series index.

## Finding

All traced chapter navigators use a full-width horizontal strip. This duplicates the same interaction across seven style owners, consumes vertical space, and turns into horizontally scrolling tabs on narrower screens.

## Target

Use one shared `.chapter-rail` presentation:

- fixed at the left edge and vertically centred;
- each chapter is a horizontal bar with the number always visible;
- pointer hover, keyboard focus, active chapter, or a deliberate touch reveals the full label;
- a slim progress line remains inside the rail;
- width transitions use `220ms cubic-bezier(.23,1,.32,1)` and stay interruptible;
- touch widths reveal on first tap and navigate on second tap;
- under 720px the rail is narrower and overlays the page edge without changing document flow;
- reduced-motion retains color feedback and removes width movement.

## Boundaries

- Do not change article or city content.
- Do not change primary navigation.
- Do not alter the literary city-series index.
- Reuse existing section observers and progress owners.
