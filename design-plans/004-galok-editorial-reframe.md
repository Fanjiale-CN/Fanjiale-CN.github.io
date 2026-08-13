# Galok editorial reframe

## Scope

Reframe the existing site as a personal magazine of economic observation and city memory while preserving the Galok identity and all existing public routes.

## Decisions

1. Public identity remains Galok. No personal name is introduced.
2. Primary navigation becomes Cities / Essays / Work / Index / About.
3. Data is represented as a research feature within Essays and remains available at `/data/`.
4. The homepage uses one stable feature rather than eight competing hero slides.
5. The existing zine assets remain part of the visual language and are used as edition covers rather than generic decoration.
6. Works gains three on-page case studies with direct links to live outcomes.
7. About removes location disclosure and states Galok's editorial position and method.

## Runtime owners

- `script.js` owns navigation normalization and shared footer links.
- `index.html` and `styles.css` own the homepage editorial reframe.
- `notes/index.html` and `archive-system.css` own the Essays hub.
- `works/index.html` and `archive-system.css` own case-study presentation.
- `about/index.html` and `about/about.css` own the public identity page.
- `archive-system.js` owns archive labels, entries and filters.

## Tool roles

- **Product Design** set the publishing model, route hierarchy and case-study structure.
- **Improve UI** supplied the audit criteria for hierarchy, repeated patterns, navigation and mobile readability.
- **Minimal Zine Poster** produced the current research-edition cover from the household-receipt and street-map concept.
- **Web Design** fixed the visual rules for type, paper, signal colour, imagery and editorial rhythm.
- **Web Design Engineer** translated those decisions into the existing dependency-free HTML, CSS and JavaScript system.
- **Figma** remains a downstream handoff target; no callable Figma workspace was exposed in this build session, so the design contract is recorded in `DESIGN.md` rather than claimed as a Figma artifact.

## Verification

- Verify desktop and mobile navigation on all primary routes.
- Verify no personal-name string appears in tracked public source.
- Verify homepage has one H1 and one active hero video.
- Verify keyboard focus, menu escape behavior and reduced motion.
- Verify `/data/`, city routes, essays, postcards and visual notes remain reachable.
