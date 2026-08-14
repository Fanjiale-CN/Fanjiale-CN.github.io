# The Curator's Curse — article publication plan

## Status

DONE — implementation authorized by the user and completed on 2026-08-14.

## Problem

The supplied essay needs to join Galok as a sourced argument rather than a generic blog post. The existing long-form system has the right editorial materials, but a repeated stock cover and a continuous text column would flatten the essay's central movement from consumer joke to labour-market and class analysis.

## Evidence

- The supplied manuscript moves through three named lenses: Macro, Frame and Scene.
- Its factual spine depends on four memorable reported figures: 900,000 likes, RMB 6,200, roughly 70 store closures and 21.3% youth unemployment.
- The supplied source file provides local reporting, trade reporting, an official NBS methodology note and theoretical background.
- Existing Galok article pages already provide chapter navigation, read progress, source lists, keyboard focus and a dependency-free interactive-chart pattern.
- The user requires a dense zine poster with only 15–20% calm space and a proportionally controlled penguin.

## Direction

1. Publish at `/essays/the-curators-curse/` with Galok as the only public identity.
2. Use a 3:5 dense editorial collage as the cover art; keep exact title, deck and statistics in HTML above the image so generated lettering cannot corrupt the article.
3. Preserve a comfortable 60–72 character prose measure and generous paragraph rhythm. Break the argument into six semantic chapters without rewriting its thesis.
4. Place citation anchors beside factual claims and provide a dated source ledger at the end. Distinguish official data, reported figures and analysis.
5. Add one evidence switcher that lets readers compare the four reported numbers and what each number can and cannot establish. Do not turn prose into a dashboard.
6. Add the essay to the Notes stream, archive search, homepage latest list and sitemap.

## Visual system

- Warm paper, near-black ink and one oxblood accent remain the site foundation.
- The cover gains a deep ink/coffee field, cropped receipt fragments, menu rules and one anatomically coherent penguin occupying roughly one quarter of the composition.
- Square corners, hairlines, serif reading text and sans/mono utility labels remain unchanged.
- The poster should feel printed and full, not like a centered AI object floating in empty space.

## Accessibility and responsive behavior

- One H1, sequential H2s and descriptive link text.
- 44px minimum controls; visible focus; `aria-pressed` and live detail for the evidence switcher.
- Desktop side notes collapse into the reading flow below 900px.
- Cover remains a bounded 3:5 object at phone, tablet and desktop sizes.
- No information is available only on hover.

## Files

- `essays/the-curators-curse/index.html`
- `essays/the-curators-curse/curators-curse.css`
- `assets/views/articles/the-curators-curse-zine.webp`
- `content.js`, `notes/index.html`, `index.html`, `sitemap.xml`

## Verification

- Validate HTML structure, unique IDs, local asset paths and source-link count.
- Check 375, 414, 768, 1024 and 1440px rules statically and in a local render if a browser is available.
- Confirm keyboard/focus and reduced-motion behavior.
- Scan the tracked public source for personal-name variants.
- Run `node --check` and `git diff --check` before publishing.
