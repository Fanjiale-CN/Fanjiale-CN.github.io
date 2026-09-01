# Dongjing Meng Hua Lu · Entries 12–14 · V0 design record

## Mode

Extension. The batch extends the live Entry 07–11 Reading system without changing its routes, navigation, typography roles, evidence hierarchy, metadata policy, or editorial voice.

## Design read

- Artifact: three linked long-form digital-humanities reading entries
- Audience: readers using English interpretation to approach a Traditional Chinese primary text
- Visual language: contemporary editorial archive + urban systems diagram
- Visual variance: 7/10 — one shared skeleton, three text-derived visual logics
- Motion intensity: 5/10 — structural state changes only; production transitions remain at or below 240ms
- Information density: 7/10 — dense evidence with clear reading layers
- Asset dependence: 4/10 — typography, source scans and diagrammatic layout carry the pages
- Brand fidelity: 10/10

## Preserve

- Warm paper, near-black ink, signal red, hairline rules and square corners
- Qiji display titles and GenRyu TW primary-text typography
- PRIMARY TEXT → WORKING TRANSLATION → GALOK READING
- Source attribution, uncertainty labels and non-modernizing historical language
- Existing nav, footer, canonical pattern, noindex policy and prev/next sequence

## Improve within this batch

- Make the Reading Room HTML the source of truth for Entries 07–14 rather than patching status in JavaScript
- Introduce shared Reading motion tokens instead of repeated `.2s ease`
- Preserve short color feedback under reduced motion while removing positional/scale motion
- Replace the one-shot font workflow with a deterministic branch-local build script

## Entry concepts

### 12 · Panlou East Streets

Relative topology, not a precise map. Tushizi is the anchor; predawn, east, south and north form four reading branches. A five-watch-to-dawn strip explains the Ghost Market without supernatural styling.

### 13 · Wine Houses

An architectural section links frontage, corridor, courtyards, private rooms, towers and flying bridges. A parallel supply diagram distinguishes zhengdian and jiaodian. The palace sightline ends the page with `VIEW RESTRICTED`.

### 14 · Food & Fruit

The table is a market. Concentric service layers move from in-house roles to casual labor, performance, outside sellers and regional food flow. Dense dish names remain an evidence register rather than illustrated recipe cards.

## Motion contract

- Production: opacity and transform only, maximum 240ms
- State changes: `cubic-bezier(.23,1,.32,1)`
- Moving indicators: `cubic-bezier(.77,0,.175,1)`
- No loops, floating, particles, bounce, decorative parallax or spooky Ghost Market effects
- Reduced motion removes travel/scale while retaining immediate or short color feedback

## V0 scope

The first review commit contains the three routes, hero hierarchy and core structural visualization only. Full primary text, translations, source register, responsive refinements, font rebuilding and discovery assets follow after visual approval.

## Protected contracts

Routes, nav labels, identity assets, analytics wiring, canonical policy, structured text hierarchy, source links, font families and existing Entries 01–11.

## Rollback

The V0 is isolated to `work/dongjing-12-14`. No changes reach `main` before full local release gates and pull-request review.
