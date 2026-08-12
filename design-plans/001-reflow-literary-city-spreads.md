# Reflow the bilingual literary spreads

Written against: 97fab28

## Evidence chain

- Surface: `be-a-viewer/{hangzhou,beijing,shanghai,xian,xiamen}/index.html`, shared by `be-a-viewer/literary-city.css`
- Problem: iPad landscape captures `IMG_4190.png` and `IMG_4191.png` show the fourth Xiamen and Xi'an spreads forcing Chinese copy into the narrow metadata rail, producing one-to-three characters per line and an unusable reading order.
- Design evidence: every spread's HTML order is citation, Chinese, English, source; the stated editorial rule is Chinese left and English right. The current even-spread overrides in `be-a-viewer/literary-city.css:291-294` contradict both.
- Owner: `be-a-viewer/literary-city.css`
- Scope and affected surfaces: all four literary spreads in all five city routes.
- Uncertainty: none; both captures reproduce the same shared-selector defect.

## Design decision

Use one stable two-column editorial grid at desktop and tablet widths: a compact citation header spans both columns, Chinese occupies the left reading column, English occupies the right, and the source line spans the footer. Remove the even-spread positional reversal entirely. Reflow to one column below 900px without changing semantic HTML order.

## Reuse

- Existing city palette variables `--lit-bg`, `--lit-ink`, `--lit-muted`, `--lit-line`, and `--lit-accent`.
- Existing bilingual type families `--literary-han` and `--literary-latin`.
- Exemplar: the semantic content order already present in every `.literary-spread` article.

## Changes

1. `be-a-viewer/literary-city.css`
   - Change: replace the three-track layout and even-child overrides with two equal, minmax-protected reading tracks; explicitly assign citation/Chinese/English/source to rows and columns; constrain Chinese measure and horizontal writing; keep English measure readable.
   - Preserve: city palettes, quotation copy, source links, type pairing, and page-wide editorial identity.
   - Verify: no Chinese line collapses to a one-character column at iPad landscape width; odd and even spreads share the same left-Chinese/right-English reading order.
2. `be-a-viewer/literary-city.css`
   - Change: simplify the <=900px breakpoint to a single-column semantic reflow with no nth-child exceptions.
   - Preserve: horizontal city-series navigation and mobile typography.
   - Verify: no horizontal overflow at 390px and 768px widths.
3. Five city HTML files
   - Change: advance shared CSS and JS query-string versions so Safari does not retain the broken cached rules.
   - Preserve: all markup and copy.
   - Verify: all five routes reference the same new versions.

## Scope

- Inherit: Hangzhou, Beijing, Shanghai, Xi'an, and Xiamen literary modules.
- Verify: all four articles per city, especially every second and fourth article.
- Exclude: city hero, chapter navigation, photography sections, global header/footer, and literary copy.

## Validation

- Product: read every city’s fourth spread in iPad landscape; Chinese must read as phrases on the left and English as paragraphs on the right.
- Interface: verify desktop, iPad landscape, tablet portrait, and phone; inspect first, second, and fourth articles; test source links and city-series links.
- System: confirm one shared grid rule and zero `.literary-spread:nth-child(even)` layout overrides.
- Repository: `git diff --check && node --check be-a-viewer/literary-city.js` -> clean.

## Stop conditions

- Stop if any city has materially different literary markup that cannot follow the shared citation/Chinese/English/source sequence.

## Design documentation

- After acceptance and validation: retain this plan as the rationale for the stable bilingual reading order.
