# First Spread Review

## Must Fix

1. **Cover contract and cover/Hero separation fail.** `index.html:27-46` is a full-width, near-viewport Hero containing the title, lead, metadata, and chart; `data-hub.css:39-44` has neither the required 3:4 cover shell nor the viewport-derived width cap. On mobile it becomes a full-viewport copy block plus a 560–600px figure (`data-hub.css:911-924,1001-1022`). It therefore duplicates the planned Hero material (`plan.md:34,39`) instead of acting as a distinct visual hook. Make the cover a self-contained 3:4 publication object and give the following Hero/lead different wording and work.
2. **The required four-signal common-baseline visual is missing.** The brief requires GDP `+5.0%`, CPI `~0%`, PPI `-2.6%`, and public-budget revenue `-1.7%` on one baseline (`source.en.md:29`; `plan.md:45-48`). `index.html:58-63` renders four independent cards with no shared quantitative scale. The only baseline graphic is on the cover and substitutes retail sales and property investment, leaving only three tracks (`index.html:38-45`). Build the four-value range strip as specified; do not use the cover as a partial substitute.
3. **First-spread citations do not meet the source rule.** The source requires source and publication date beside every new statistic (`source.en.md:169-174`). The cover and opening display statistics with no adjacent citation, while the strip gives only agency plus month/year and no source link (`index.html:31-44,51-62`). Add an exact publication date and resolvable source label/link at each first appearance; keep fact, institutional reading, and Galok interpretation visibly distinct.
4. **The 2025-to-WDI handoff is unclear.** The page jumps from 2025 cards directly into a 2000–2024 explorer (`index.html:58-65`), while the explanation that the common WDI window ends in 2024 appears only after the explorer (`index.html:67-77`). Add a short transition before the explorer that names the window, series, units, and why 2025 is outside it. This prevents readers from mistaking the cards and WDI series for one continuous release.
5. **The explorer's tab semantics are incomplete.** All generated tabs point `aria-controls` to `data-series-panel`, but that id is placed on a table rather than a `role="tabpanel"`, with no `aria-labelledby` relationship (`data-hub.js:81-100,110-121,285-294`). Use a real labelled tabpanel (or simpler buttons if tab semantics are unnecessary) and keep the changing chart, reading, metadata, and table inside the controlled region.

## Should Fix

- Bring the first spread closer to Tufte's data-ink discipline. The large filled definition block and four bordered, 300px-high metric cards (`data-hub.css:237-243,269-311`) read more like panels than editorial evidence. Reduce framing and let shared axes, type, rules, and source notes carry hierarchy.
- Shorten the mobile runway. Below 640px the cover consumes at least one viewport plus a 560px chart, then the signal cards consume about 1,040px (`data-hub.css:1001-1042`) before the explorer begins. A compact 3:4 cover and one shared signal strip would preserve the reading sequence without burying the representative visual.
- Consolidate the unused legacy `.data-hero*` rules (`data-hub.css:313-400,907-953,996-1064`) after the cover/Hero structure is settled; their presence obscures which first-spread contract is implemented.
- The Beautiful Article cover rule requires theme-token styling, but the spread uses custom `--data-*` variables plus hard-coded colors, fonts, and pixel values (`data-hub.css:1-15` and throughout). If this page is meant to conform strictly to the selected Tufte/Reacticle contract, map these to `--ra-*` tokens rather than maintaining a parallel theme system.

## Pass Notes

- The opening accurately states the source's central distinction between real output and nominal household, company, and fiscal experience (`index.html:51-54`; `source.en.md:19-29`).
- Main reading measures are comfortable: opening prose is capped at 61–69ch with 1.54–1.78 line height (`data-hub.css:221-235`).
- Base document semantics are strong: one `main`, one `h1`, ordered `h2` sections, a labelled `figure`/`figcaption`, `dl` metadata, an `aside` for definitions, and scoped `section`/`article` elements (`index.html:26-79`).
- The four headline values themselves match the source, and their agency/month labels at least establish visible provenance (`index.html:58-63`).
- The existing WDI explorer retains all four requested 2000–2024 series, uses a single axis, exposes source/indicator metadata, a complete table, CSV downloads, keyboard year inspection, SVG title/description, and a reduced-motion rule (`data-hub.js`; `data-hub.css:1158-1162`). `node --check data-hub.js` passes.
- Responsive rules exist for 2-column and 1-column signal layouts, stacked explorer reading, and horizontally scrollable mobile charts (`data-hub.css:902-989,991-1156`).

The first spread is editorially promising, but the cover contract, required four-signal baseline, citation discipline, WDI handoff, and tab semantics must be corrected before Checkpoint 2.

## Verdict

**FAIL**
