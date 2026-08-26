# Galok Radar — design and source research

## Research set

The visual and interaction study covered Reuters, Bloomberg, the Financial Times, The Economist, The Guardian, The Verge, Rest of World, Semafor, Nikkei Asia, South China Morning Post, SND award work, ProPublica and The Pudding. The data contract was checked against the official GDELT DOC 2.0 documentation.

## What transfers to Galok

- Reuters: timestamps and topic hierarchy make recency legible without turning every item into an alert.
- Bloomberg and FT: a dense opening surface can remain readable when typography, rules and alignment carry the hierarchy.
- Guardian and Semafor: summary, evidence and analysis should remain visibly distinct.
- Rest of World and Nikkei Asia: regional specificity belongs in the framing and source mix, not ornamental motifs.
- SND, ProPublica and The Pudding: explanatory graphics work best when they answer one editorial question and expose their evidence.

## Galok-native direction

Radar is an expandable editorial signal ledger on Galok's warm paper ground. It uses the existing square brand mark, ink/red palette, hairline rules, serif/sans hierarchy and restrained motion timings. The composition is asymmetric: a lead signal anchors the left field; a time rail, evidence count and state sit on the right. No floating dashboard cards, generic KPI tiles, fake maps or decorative data art.

The four editorial states are stable:

1. **Signal** — verified new activity with more reporting still needed.
2. **Brief** — enough corroboration for a concise editorial account.
3. **Lead** — a durable line of inquiry for future Galok work.
4. **Archive** — retained context, no longer treated as breaking activity.

## Data contract

GDELT DOC 2.0 is an optional upstream discovery source. It does not publish directly to the page. A Worker queries a small controlled topic set, validates URLs and timestamps, removes duplicate URL/title pairs, emits first-stage `Signal` records, and caches the normalized response for 15 minutes with a one-day stale fallback. The checked-in JSON snapshot is always available when the edge source is unavailable.

Every visible item exposes its state, update time, geography, topic, source count and source links. Source count is derived from the evidence array. Evidence URLs point to specific reports rather than media section pages. The UI never implies that an automated match is a Galok conclusion.

## Motion contract

Motion communicates state changes only: filter selection, source-drawer entry, active time position and a short coverage trace. Timings stay between 160–220ms. `prefers-reduced-motion` removes transitions and active animations.
