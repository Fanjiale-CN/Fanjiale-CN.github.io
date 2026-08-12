# Section Review — Sections 01–10

## Verdict

**FAIL.** The page has a strong editorial spine, accurate chart arithmetic in most sections, and generally polished English, but it does not yet satisfy the declared `longform · 100%` retention contract. Core source viewpoints are missing in Sections 01, 02, 04, and 07; Section 09 labels a 15-item list as a complete 20-source register; the source's required three framing questions and the planned executive summary are absent before Section 01. Source/date adjacency is also inconsistent across Sections 01–07.

This is a source-relative audit of `data/index.html` against `source.en.md` and `plan.md`; it does not independently re-verify the underlying institutions' 2025 data on the live web. “Source accuracy” below therefore means accurate transcription, attribution, definition, and audit trail relative to the supplied editorial source.

## PASS / FAIL matrix

`Chart honesty` is marked PASS when a section has no quantitative chart, provided its table/list does not encode a misleading comparison. `Responsive` assesses the section body; shared shell risks are listed separately.

| Section | Factual retention | Source accuracy | Narrative continuity | English polish | Chart honesty | Tufte longform fit | Responsive | Overall |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 · Growth & prices | FAIL | FAIL | PASS | PASS | PASS | FAIL | PASS | FAIL |
| 02 · Households | FAIL | FAIL | PASS | PASS | PASS | PASS | PASS | FAIL |
| 03 · Employment | PASS | FAIL | PASS | PASS | PASS | PASS | PASS | FAIL |
| 04 · Property & local finance | FAIL | FAIL | PASS | PASS | FAIL | PASS | PASS | FAIL |
| 05 · Investment | PASS | FAIL | PASS | PASS | PASS | PASS | PASS | FAIL |
| 06 · External balance | PASS | FAIL | PASS | PASS | PASS | PASS | PASS | FAIL |
| 07 · Political economy | FAIL | FAIL | PASS | PASS | FAIL | PASS | PASS | FAIL |
| 08 · Four vantage points | FAIL | FAIL | PASS | FAIL | PASS | PASS | FAIL | FAIL |
| 09 · Method & boundaries | FAIL | FAIL | PASS | PASS | PASS | PASS | PASS | FAIL |
| 10 · Conclusion | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS* |

`*` Section 10 retains the source conclusion, but still misses plan-only deliverables: a next-update line and the planned final provenance cadence.

## Pre-section and whole-article contract

### FAIL — retention and outline

- The source's three framing questions are explicitly mandatory in the plan (`plan.md:8–11`; `source.en.md:13–17`) but do not appear in the cover, opening, or Sections 01–10.
- The planned 30-second summary with three conclusions and four definition warnings (`plan.md:41`) is absent. The definition aside in `index.html:54` is useful but is not that summary.
- The planned lead juxtaposition is `+5% GDP / ~0% CPI / −17.2% property investment / −6.4% private investment` (`plan.md:40`). The opening names the directions, while the nearby strip substitutes PPI and public-budget revenue (`index.html:52,58–65`). Every number appears later, but the planned framing device is not implemented.
- The plan's self-check says “80% recommended density” (`plan.md:116`), contradicting the binding 100% Brief (`plan.md:8`). Acceptance must use 100%; the self-check should be corrected so later reviewers do not normalize omissions.

### FAIL — responsive shell

- At `max-width: 640px`, the cover remains a fixed `3 / 4` box with `overflow: hidden`, while its metadata changes from three columns to three stacked rows (`data-hub.css:39–49,1507–1524`). The two fractional cover rows cannot reliably contain the two-line title, lead, three metadata rows, three chart tracks, source lines, and note at a phone width. This is a high clipping risk, not merely excess whitespace.
- The mobile chapter index becomes a 1,120px horizontal strip (`10 × 112px`) but the reading-state code only toggles the active class; it never scrolls the active chapter into view (`data-hub.css:1415–1419`; `data-hub.js:346–378`). Sections 06–10 can therefore be active while their tab is off-screen.

### FAIL — citation discipline

The source requires the source and publication date beside every new statistic (`source.en.md:169–174`). The cover and four-signal strip meet that standard reasonably well, but most section prose does not. A complete register at the end does not replace local provenance, especially when the same paragraph mixes NBS facts, World Bank estimates, institutional readings, and Galok interpretation.

## Section findings

### 01 · Growth & prices — FAIL

**Pass evidence**

- GDP `+5.0%`, CPI `≈0%`, PPI `−2.6%`, public-budget revenue `−1.7% / RMB 21.60tn`, tax revenue `+0.8%`, and corporate-income-tax receipts `+1.0%` match the source (`index.html:79–81`; `source.en.md:21–27`).
- The shared-baseline signal strip is mathematically correct: `−5% → +5%` maps to 0–100%, and the four point positions match their labels (`index.html:58–65`). It explicitly says the measures are not one index.
- The WDI explorer retains all four requested 2000–2024 series, uses labelled per-series axes rather than a dual axis, discloses the 2024 endpoint, exposes a year table and CSV, and labels the disruption band as Galok's editorial marker (`index.html:85–86,295–299`; `data-hub.js:199–296`).
- The real/nominal explanation and Huang/IMF contrast are clear and connect naturally to the household section.

**Fail evidence**

- The NBS view that the main annual targets were achieved and the IMF's 2026 slowdown expectation are omitted (`source.en.md:21`). The plan allows removal of repeated forecasts, not deletion of the only explicit forward IMF view (`plan.md:20–24,45–48`).
- The tax and corporate-income-tax figures have no adjacent source/date (`index.html:80`). The Huang and IMF readings likewise have no local source/date (`index.html:81`).
- The explorer is more dashboard-like than the selected Tufte profile permits: four 96px tabs, a 2×2 grid of 170px statistic panels, filled active states, and four accent colours dominate the reading surface (`data-hub.css:503–640`). Retain the explorer, but reduce panel framing and make the line, definition, and provenance the primary ink.
- `<em>strong supply, weak demand</em>` renders italic emphasis (`index.html:81`), contrary to the selected profile's no-italic emphasis rule.

### 02 · Households — FAIL

**Pass evidence**

- Mean income, median income, their growth rates, the 31% saving estimate, retail-sales growth, trade-in qualification, births/deaths, demographic mechanism, behavioural-proxy boundary, and the safety-net/consumption mechanism are all retained (`index.html:93–115`; `source.en.md:33–43`).
- The income-gap chart is honest. Its 30,000–45,000 range is shown, both point values are labelled, the positions are arithmetically correct, and the derived RMB 7,146 / 16.5% gap is correct (`index.html:100–105`; `data-hub.css:1185–1223`).

**Fail evidence**

- The source attributes the domestic interpretation to Huang Yiping and Liu Yuanchun; the HTML reduces that to unnamed “Chinese scholars” (`source.en.md:41`; `index.html:110–113`). In a 100% viewpoint-retention article, named attribution should not disappear.
- The World Bank's local-fiscal-repair condition and the IMF's explicit move away from debt-led investment and export dependence are compressed out (`source.en.md:43`; `index.html:113`). Those are substantive differences in policy frame, not repetition.
- The saving rate, retail-sales rate, births/deaths, and institutional readings lack adjacent publication dates and direct source labels. Only the income chart carries a dated NBS note.
- The planned safety-net → precautionary saving → consumption chain and Section-02 viewpoint comparison are not implemented as such (`plan.md:49–52`). The prose contains the mechanism, so this is an outline-delivery failure rather than fabricated content.

### 03 · Employment — FAIL

**Pass evidence**

- The aggregate rate, 12.67 million jobs, three age rates, 48.6-hour workweek, 2023 method break, student exclusion, rural/labour-force/job-quality limitations, and “coexistence” argument are all retained (`index.html:123–142`; `source.en.md:47–53`).
- The age bars share a labelled 0–20% axis, use proportional lengths, and clearly distinguish November age rates from the annual aggregate rate (`index.html:130–136`).
- The method break is beside the chart and the prose is concise and careful.

**Fail evidence**

- The chart source is “NBS releases and authoritative reporting,” with neither an exact publication date nor a resolvable source (`index.html:136`). That description is not auditable and the complete register does not identify the exact age-series release.
- The 5.2%, 12.67 million, and 48.6-hour statistics also need local dates/source links under the source's editorial rule.

### 04 · Property & local finance — FAIL

**Pass evidence**

- Property investment, floor-space sales, sales value, land-sale revenue, government-fund revenue/expenditure, the 85% local-spending share, debt instruments, the debt-swap-versus-new-flow distinction, and the three institutional perspectives are substantially retained (`index.html:149–169`; `source.en.md:57–65`).
- The sequence from property to land finance to service capacity is narratively clear.

**Fail evidence**

- “Infrastructure” is omitted from the list of local responsibilities (`source.en.md:61`; `index.html:153`). The source and plan treat the 85% responsibility bundle as core (`plan.md:14,57–60`).
- The Chinese-research perspective loses the question of reconciling local growth incentives with public-service obligations (`source.en.md:65`; `index.html:169`).
- The figure changes the source's “sales value” for new commercial floor space into “New-home sales value” (`index.html:160`). That is a narrower category than the supplied source and must not be silently substituted.
- The decline bars encode an undisclosed `0% → −20%` scale through `--value` percentages and right alignment, but show no axis (`index.html:156–161`; `data-hub.css:1225–1283`). Exact labels mitigate the risk but do not explain the visual scale.
- Government-fund figures and the institutional readings lack local dated citations.
- The plan calls for a central/local responsibility ruler and an integrated asset/revenue/spending view; the implementation supplies a three-rate decline chart and prose instead (`plan.md:57–60`). Either implement the planned explanatory job or revise the plan explicitly.

### 05 · Investment — FAIL

**Pass evidence**

- All five investment rates, all four BCI observations, the 50 threshold, sample limitation, K-shaped interpretation, and official/private/external readings are retained (`index.html:178–202`; `source.en.md:69–75`).
- The diverging chart has a labelled `−10% / 0 / +30%` scale. The zero line is at 20% of the plot and each width correctly maps to a 40-point range (`index.html:185–193`; `data-hub.css:1285–1312`). The note correctly warns that growth rate does not equal sector size.

**Fail evidence**

- The NBS chart has month/year provenance, but the BCI values have no adjacent CKGSB link or publication date (`index.html:199`). The “complete” register also omits the December 2025 BCI report.
- The planned BCI threshold band is absent (`plan.md:61–64`). Since the paragraph preserves the threshold and time points, this is a non-factual outline deviation, but it should be implemented or explicitly waived.

### 06 · External balance — FAIL

**Pass evidence**

- The US$1.19tn goods surplus, 3.3%-of-GDP current account, definition distinction, Chinese/international emphasis, productivity upside, and capacity/subsidy dispute are all retained (`index.html:210–227`; `source.en.md:79–83`).
- The accounting ladder is honest: it never places unlike units on one axis, names the intervening service/income/transfer categories, and states that the middle step is conceptual rather than a numerical bridge (`index.html:217–220`).
- The paired questions at the end sharpen the viewpoint difference without adding a false equivalence.

**Fail evidence**

- “Chinese trade statistics” and “IMF 2025 Article IV” are too generic for the source's local citation rule; the figure needs exact publication dates and links (`index.html:220`).
- The institutional-reading paragraphs likewise have no local source/date markers (`index.html:226–227`).

### 07 · Political economy — FAIL

**Pass evidence**

- Public-budget expenditure and category growth, government-fund expenditure, the RMB 6.19tn bond-backed total, the 85% local share, central transfer/quota/earmark levers, all four analytical questions, and the effectiveness/satisfaction boundary are retained (`index.html:236–257`; `source.en.md:89–102`).
- The prose clearly distinguishes capacity, constraint, priority, and feedback.

**Fail evidence**

- The source's explicit methodological boundary—do not reduce politics to a regime label or subjective score; use auditable budgets, central–local relations, investment, jobs, and social spending—is omitted (`source.en.md:87`). The shorter motive caveat in `index.html:240` does not retain that viewpoint.
- The RMB 11.29tn / 11.3% and RMB 6.19tn figures have no adjacent dated source (`index.html:255`).
- The budget bars are proportional to an implicit 0–10% range (`--value: 67%, 57%, 48%, 10%`) but display no axis or declared maximum (`index.html:243–249`). The exact labels prevent numerical falsehood, yet the visual encoding is not fully auditable.
- “Priority lines grew faster” can be read as an inference of intent from growth rates. “Selected lines” would respect the section's own boundary unless an explicit policy-priority source is added.

### 08 · Four vantage points — FAIL

**Pass evidence**

- All four vantage points, objects, representative readings, and blind spots are present, and the anti-false-balance rule sits beside the table (`index.html:264–278`; `source.en.md:106–113`).
- A semantic table is the right desktop form and fits the Tufte evidence-matrix brief.

**Fail evidence**

- “Support consumption, social protection and confidence” becomes “support consumption, protection and confidence” (`source.en.md:109`; `index.html:274`). Dropping “social” changes and ambiguates the policy meaning; “protection” can be read as trade protectionism.
- The plan requires a mobile-accessible definition-list alternative (`plan.md:73–76`). The implementation instead keeps a 900px-wide table inside horizontal overflow at every phone width (`data-hub.css:1338–1353`). Keyboard focus helps desktop accessibility but does not make a four-column matrix legible in a narrow longform flow.
- There is no visible scroll cue or compact summary, so readers can miss columns beyond the viewport. This is the clearest section-level responsive failure.

### 09 · Method & boundaries — FAIL

**Pass evidence**

- All eight limitations are retained accurately (`index.html:282–290`; `source.en.md:117–124`).
- WDI series definitions, the 2024 endpoint, disruption-marker status, refresh date, licence, rounding rule, source link, and CSV download are visible (`index.html:292–300`).
- `<details>` is an appropriate low-friction source drawer and its two-column content stacks at the 900px breakpoint.

**Fail evidence**

- The drawer announces “20 sources” but contains only 15 list items: 6 official, 4 Chinese expert/market, and 5 international (`index.html:303–311`). This is a false count and violates the plan's “complete source register” requirement (`plan.md:19,77–80`).
- Five supplied sources are missing from the drawer: NBS *China Statistical Yearbook 2025*; the frozen WDI entry; CF40's 31 December 2024 household-balance-sheet piece; CKGSB's December 2025 BCI report; and the IMF's 10 December 2025 Article IV mission statement (`source.en.md:146–147,153,156,161`).
- Because the body relies on BCI and several institutional readings, these omissions are not merely bibliographic housekeeping; they weaken the article's audit trail.

### 10 · Conclusion — PASS with plan gap

**Pass evidence**

- The production, balance-sheet, and household-life formulations are faithful to the source, and the conversion question is retained almost verbatim (`index.html:316–320`; `source.en.md:126–134`).
- The triptych is responsive, collapsing to one column below 900px, and the closing sentence provides a clean narrative resolution.
- The ruled, typographic treatment remains article-like and does not add a decorative chart.

**Plan gap**

- The promised next-update time/status is absent (`plan.md:81–84`). Do not invent a date; add a verified cadence or explicitly revise the plan.
- The plan says the article should close with the proposition that data is not itself a conclusion and definitions are part of political economy, followed by sources and contact (`plan.md:86`). The source register instead precedes the conclusion, and that closing proposition is absent. The current source-faithful ending is strong, but this is still an unacknowledged plan deviation.
- On phones, the three conclusion blocks retain a 220px minimum height and a 70px label gap (`data-hub.css:1434–1437`). This is readable but creates avoidable low-information scrolling.

## Must Fix

1. **Restore the missing article frame:** add the source's three questions and the planned summary, and implement or explicitly revise the planned four-number lead.
2. **Complete Section 09's source register:** add the five missing entries and make the displayed count equal the rendered count.
3. **Restore omitted core viewpoints/facts:** Section 01's NBS target/IMF slowdown view; Section 02's named domestic attribution plus World Bank local-fiscal and IMF rebalancing qualifiers; Section 04's infrastructure responsibility and local-incentive/public-service tension; Section 07's regime-label/subjective-score methodological boundary.
4. **Repair local provenance in Sections 01–07:** every newly introduced statistic needs an adjacent source and publication date. Replace generic labels such as “authoritative reporting” and “Chinese trade statistics” with resolvable sources.
5. **Correct meaning-changing text:** restore “social protection” in Section 08 and replace Section 04's unsupported “New-home sales value” with the source's exact category.
6. **Make quantitative encodings auditable:** add declared axes/scales to the Section 04 decline bars and Section 07 budget bars; soften Section 07's “priority” inference unless sourced.
7. **Implement the Section 08 mobile definition-list form** (or an equivalently complete stacked representation) instead of requiring a 900px horizontal table.
8. **Fix the mobile cover layout:** preserve the 3:4 cover without clipping by reducing/reflowing content inside that ratio, rather than stacking all metadata inside fixed fractional rows with `overflow: hidden`.
9. **Keep the active mobile chapter visible:** when Sections 06–10 become current, scroll or center the corresponding chapter tab without hijacking page scroll.
10. **Resolve explicit plan deviations:** Section 04's central/local explanatory view and Section 10's next-update line are required. For the softer Section 02/05/07 visual substitutions, either implement the planned explanatory job or record an intentional plan revision.

## Nonblocking notes

- Section 01's WDI explorer is useful and unusually auditable, but its tab/stat grid should be visually thinned so it reads as evidence inside a longform rather than a compact dashboard.
- Section 02's causal chain is already present in prose; a small line-based mechanism would satisfy the plan more naturally than another boxed panel.
- Section 05 does not need a large second chart. A compact BCI sparkline or threshold strip could preserve Tufte density while making the four observations easier to scan.
- Section 06's accounting ladder is a good example of a non-numeric explanatory figure. Keep its explicit “conceptual, not numerical” note.
- Section 10's “Back to the beginning” control is functional navigation rather than a promotional CTA; it does not violate the no-CTA intent.
- The page uses a parallel `--data-*` theme and several hard-coded colours/fonts rather than `--ra-*` tokens. That is understandable inside the existing Galok site, but it means this is Tufte-inspired site styling rather than strict Beautiful Article/Reacticle theme conformance.
- The plan self-check's 80%/100% contradiction should be corrected before final review even though it does not change this report's 100% acceptance threshold.
