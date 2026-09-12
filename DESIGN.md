# Galok Editorial Direction

## Public identity

- The public author identity is **Galok**.
- Personal names must not appear in navigation, metadata, article bylines, structured data, contact copy, or public-facing source comments.
- Contact remains `galokview@outlook.com` and `@galokview`.

## Design philosophy: observation, not nostalgia

Galok is a digital-native editorial system. It should feel young, current, precise and built for a browser rather than inherited from a newspaper, archive room or old book.

The conceptual core remains three distances of observation: **View (視), Frame (框), Observe (察)**. These describe how a piece looks at the world, not which section of the site it belongs to.

- **View / 視** — step back. Read systems, trends, cycles, institutions and large-scale pressure.
- **Frame / 框** — choose a boundary. Define variables, comparisons, evidence structures and arguments.
- **Observe / 察** — move close. Read street-level evidence, interfaces, behavior, objects, images and small scenes.
- **Design serves information.** Hierarchy, color and motion must improve comprehension before they improve spectacle.
- **Digital first.** Do not imitate paper texture, archival yellowing, newspaper furniture or book ornament unless a specific project materially requires it.

## Lens identity

The lenses are a brand system, not a retro seal system.

- Use the glyphs **視 · 框 · 察** as modern classification symbols set in the primary sans system.
- Do not default to faux seals, stamped ink, calligraphic framing or heritage styling.
- Always pair the glyph with an English label where comprehension matters: `VIEW / 視`, `FRAME / 框`, `OBSERVE / 察`.
- The lens is independent of content type. A Research paper can be Frame; a city story can be View; an Essay can be Observe.
- The page itself should express the lens through information scale and composition, not only through a label.

## Information architecture

- **Cities** — visual city records and literary city chapters.
- **Essays** — finished arguments, working notes and visual essays.
- **Research** — independent research and working papers.
- **Data** — structured evidence and analytical surfaces.
- **Reading** — source-led reading projects and editions.
- **Work** — selected editorial systems and case studies.
- **Index** — the searchable site archive.
- **About** — Galok's method, archive and contact.

The lens system sits across this information architecture rather than replacing it.

## Visual system

### Core palette

Every editorial page uses a monochrome base plus one signal color.

- **Background:** cold white / near-white, not warm paper.
- **Ink:** near-black.
- **Secondary text:** neutral gray.
- **Rules / borders:** cool light gray.
- **Signal:** one theme color only per page.

Default digital neutrals:

- Background `#F6F7F8`
- Surface `#FFFFFF`
- Ink `#0B0D0F`
- Muted `#69717A`
- Rule `#DFE3E7`

Current lens signals:

- **View / 視:** electric coral-red `#FF4057`
- **Frame / 框:** cobalt `#2F63FF`
- **Observe / 察:** acid lime `#B7E600`
- **Research 003 experimental signal:** cyan `#00B8D4`

The target ratio is approximately **90% monochrome / 10% signal**. Signal color is for hierarchy, active evidence, key numbers, rules, selected chart marks and classification. Do not wash whole pages in theme color by default.

### Typography

- **MiSans** is the primary interface and editorial sans.
- Large sans-serif headlines carry the identity.
- Body copy may remain sans when the page benefits from a contemporary digital tone.
- Monospace is reserved for code, machine-readable evidence or data where the distinction is meaningful, not as generic editorial decoration.
- Serif is optional and should never be used merely to make a page feel literary or prestigious.

### Geometry

- Prefer square or lightly rounded geometry.
- Hairline rules, strong grids and deliberate whitespace carry structure.
- Avoid universal rounded cards.
- Avoid fake paper, torn-paper decoration and ornamental archival framing outside intentionally art-directed projects such as Press Print.

## Lens composition

The three lenses should look different because they operate at different scales.

### View / 視

- Larger visual scale and wider compositions.
- Strong headline dominance.
- Trends, maps, system diagrams and wide evidence fields are appropriate.
- The page should feel panoramic rather than dense.

### Frame / 框

- Strongest grid discipline.
- Comparisons, variables, figures, tables and explicit evidence architecture.
- The page should feel analytical and constructed.

### Observe / 察

- Photography and source material can break wider than the text column.
- Captions, timestamps, objects, interfaces and close evidence are important.
- The page should feel immediate and specific without becoming scrapbook-like.

## Long-form navigation policy

As of the current design experiment, **Essay and Research detail pages are navigation-free surfaces**.

- No persistent site navigation.
- No Dynamic-Island-style article navigation.
- No floating TOC capsule.
- Reading and other specialized formats may keep their own controls where navigation is integral to the format.
- Reintroduce article navigation only after it is designed from the editorial system outward rather than imported as an unrelated UI object.

This is an intentional reset so long-form design can establish a coherent visual language before additional interaction chrome returns.

## Motion

- Motion reveals structure or gives feedback.
- Page reading must never wait for decorative motion.
- Prefer opacity and transform for short transitions.
- Avoid bounce, overshoot and elastic motion unless the object being represented materially calls for it.
- Every motion system respects `prefers-reduced-motion`.
- Navigation efficiency takes priority over animation duration.

## Editorial rules

- One stable identity statement appears on the homepage.
- One current feature leads the homepage. There is no automatic multi-story hero carousel.
- Real source material is preferred over decorative mock evidence.
- Research figures distinguish evidence, interpretation and limitation.
- Project pages explain intent, role, decisions, material and result. They do not rely on images alone.
- Press Print may keep a distinct experimental visual language while sharing Galok's information hierarchy and typography discipline where appropriate.

## External design reference library

Galok keeps an external reference library at `design-references/awesome-design-md`, installed as a pinned Git submodule from `VoltAgent/awesome-design-md`.

### Authority order

1. This root `DESIGN.md` defines Galok's visual identity and has final authority.
2. Section- or feature-specific Galok design documentation may refine these rules for a bounded context.
3. Files inside `design-references/` are research material. They provide patterns and vocabulary only.

### Agent workflow

Before a substantial UI change:

1. Read this file.
2. Inspect the existing page and its shared components/tokens.
3. If external references would materially help, inspect only the relevant `DESIGN.md` files under `design-references/awesome-design-md/design-md/`.
4. Extract transferable principles such as spacing rhythm, hierarchy, typography roles, image treatment, responsive behavior, motion limits and anti-patterns.
5. Translate those principles into Galok tokens and components. Keep third-party branding, proprietary font assumptions, logos, signature brand colors and distinctive branded compositions out of Galok.
6. If a new reusable rule emerges, document it here or in bounded Galok design documentation.

### Recommended reference map

- **Digital editorial / long-form:** `wired`, selectively `theverge`.
- **Whitespace and image hierarchy:** `apple`.
- **Precision UI, hairlines and restrained states:** `linear.app`, `vercel`.
- **Data and research surfaces:** `ibm`.
- **Content organization:** `notion`.
- **Cinematic visual chapters:** `runwayml`, selectively `ferrari`.

The reference library is an ingredient shelf. Galok's visual language remains authored here.

## Reference logic

- Works in Progress supports strict editorial grids and typography for complex ideas without requiring legacy newspaper styling.
- Contemporary technology publications support large type, bold scale changes and digital-native pacing.
- The Pudding supports interaction only when it clarifies evidence or advances an argument.
- Precision product interfaces support restrained state changes, clear hierarchy and low visual noise.

These references provide structural lessons, not a visual skin. Galok's differentiator is the combination of independent research, city observation, visual publishing and a coherent observation-lens system.
