# Design QA — Night-train hero and Cities visual archive

## Comparison target

- Source visual truth: `qa-cities-archive-source.jpg`, cropped from the user-supplied Cities reference screenshot.
- Browser-rendered implementation: `qa-cities-archive-implementation.jpg`, captured from the deployed Xi’an state at `https://www.galok.me/cities/`.
- Combined comparison evidence: `qa-cities-archive-comparison.jpg` (reference on the left; deployed implementation on the right).
- Homepage browser evidence: `qa-home-train-implementation.jpg`, captured from the deployed night-train hero at `https://www.galok.me/`.
- Implementation viewport: 1348 × 926 CSS pixels at device-pixel-ratio 1.

## Findings

- No actionable P0/P1/P2 difference remains in the tested homepage hero or Cities archive browser.
- The homepage now uses the selected snow-night train as the single moving-image subject. The existing Galok type, rules, palette and square-corner editorial controls remain intact.
- The Cities archive keeps the reference’s dark exhibit field and natural-ratio postcard artwork, but replaces the duplicated static card area with one readable four-edition index.
- City name, issue number, coordinates, editorial note and destination links form one hierarchy; photography is contained rather than cropped.
- The edition rail uses visible metadata and small image samples, so the archive works as navigation rather than decorative cards.
- Desktop uses a wide exhibition layout. The existing mobile breakpoint turns the exhibit into one column and the edition rail into a contained horizontal index without changing the desktop composition.

## Interaction and runtime checks

- The homepage video loaded from `/assets/hero/video/night-train.mp4`, reported ready state 4 and was playing in the live browser. The poster resolves to `/assets/hero/video/night-train-poster.webp`.
- The Cities film carousel begins playback automatically. Choosing the previous or next film loads and plays the new video; an ended film advances to the next city.
- The Cities archive advances automatically every 6.2 seconds. Clicking an edition restarts the full reading interval before the next automatic change.
- The archive controls expose selected state with `aria-selected` and `aria-current`; left/right keyboard navigation and reduced-motion handling remain available.
- All four archive destinations resolve to the existing city archives, and each postcard action routes to the matching `/postcards/?card=…` entry.
- The deployed Cities document reported no horizontal overflow at the tested desktop viewport.
- No page-authored JavaScript error was present in the homepage or Cities browser console.
- `node --check` passed for both `be-a-viewer/viewer.js` and `be-a-viewer/city-archive.js`; `git diff --check` reported no whitespace error.

## Comparison history

### Pass 1

- [P2] The prior Cities section repeated the same city choice in a large visual panel and a separate card grid.
- [P2] The prior film carousel required manual play after navigating to a different city.
- [P2] The first archive timer used a repeating interval, so a manual selection could inherit a nearly elapsed cycle.

### Fixes applied

- Consolidated the postcard and archive entry points into one editorial exhibit and one metadata-rich edition rail.
- Added autoplay on initial film load, previous/next navigation and ended-film advance while preserving an explicit user pause.
- Replaced the archive interval with a one-shot timeout that resets after every manual selection.
- Added a desktop and a portrait mobile rendition of the selected train film plus a matching lightweight poster.

### Pass 2

- Live browser test: a manual Xi’an archive selection remained active during its reading interval and then advanced to Beijing after 6.2 seconds.
- Live browser test: film navigation changed city and the destination video reported `paused: false` and ready state 4.
- The comparison image confirms the reference’s editorial materiality, postcard ratio and restrained typography are preserved while the duplicate entry system is removed.

## Follow-up polish

- P3: a final physical iOS Safari check is still useful after CDN cache expiry because this cloud-browser pass used a desktop viewport; responsive rules were checked statically.

final result: passed
