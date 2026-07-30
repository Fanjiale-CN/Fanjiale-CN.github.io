# Beijing Viewer — Design QA

## Scope

- Removed the decorative hero crosshair and vermilion diamond markers.
- Increased editorial density in the weather and northern-edge chapters.
- Added `Frame the City｜城市取景器` as Beijing's signature direct-manipulation interaction.
- Preserved the existing GALOK navigation, typography, photography and native document scroll.

## Visual Review

- **Coherence:** 94 / 100 — the camera uses the Beijing ink, paper, vermilion and mist palette with one consistent instrument surface.
- **Hierarchy:** 93 / 100 — chapter numbering, short display copy, supporting paragraphs and metadata retain the established editorial rhythm.
- **Typography:** 92 / 100 — display, body and tracked metadata roles remain distinct; generated postcard text is dynamically fitted to prevent overflow.
- **Interaction:** 95 / 100 — pointer capture, keyboard movement, aspect controls, text-position controls, scene controls and explicit output feedback are all present.
- **Responsive behavior:** 93 / 100 — the camera changes from a two-column instrument to a single-column mobile flow; controls maintain touch-size targets and the stage changes to a portrait-friendly ratio.
- **Motion:** 94 / 100 — direct manipulation updates transforms only; shutter feedback is brief; reduced-motion mode removes non-essential movement.

## Functional Verification

- HTML parsed successfully.
- JavaScript syntax check passed.
- CSS block structure passed.
- All 19 Beijing asset references resolve.
- Production page has no `.beijing-hero-axis` nodes.
- Production document width matches its viewport width.
- Camera opens and closes without forcing document scroll.
- Landscape, square and portrait crops render.
- All four copy positions render.
- Exposure switching updates the image and feedback state.
- Arrow-key reframing works.
- PNG output and download data are generated locally in the browser.

## Final Result

**Passed.**
