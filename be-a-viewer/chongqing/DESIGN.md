# Chongqing — Ground Level Undefined

## Design read

Chongqing is treated as a **vertical city**, not as a cyberpunk spectacle. The page begins with two rivers as a flat baseline and progressively turns terrain, streets, transit and buildings into a section drawing. The visitor scrolls downward while the city keeps rising.

The signature instrument is a persistent **altimeter**. It makes elevation legible without pretending to provide survey-grade measurements: the values are narrative markers tied to chapters, while the river remains the visual zero line.

## cq12 editorial recomposition

Mode: redesign · preserve. GALOK’s dark field-note navigation, oxide red, monospaced evidence labels and oversized grotesk remain protected. The old rhythm repeated a chapter headline, a large empty scene, then a small media block too often. The revised page gives each chapter one job: the hero carries night scale; terrain carries the diagram; transit carries a single moving frame; bridges carry lateral travel; food carries heat and table scale; the archive carries documentary density.

| Dial | Setting | Consequence |
| --- | --- | --- |
| Visual variance | 7 / 10 | Asymmetric magazine spreads, cut image edges, and varied media spans replace alternating blocks. |
| Motion intensity | 5 / 10 | Four existing scroll scenes remain; ordinary image chapters stay still. |
| Information density | 5 / 10 | Long inert scroll distances are reduced; captions stay attached to evidence. |
| Asset dependence | 9 / 10 | Supplied photography and video stay central; no decorative substitute imagery. |
| Brand fidelity | 9 / 10 | Route, nav, title, media, accessibility and existing field-note voice remain intact. |

The motion rule follows the page’s purpose: scrolling moves terrain, rail state, bridge travel and descent; it does not animate every photograph. Reduced-motion keeps the reading order and media controls intact.

## Narrative sequence

| Chapter | Spatial device | Editorial claim |
| --- | --- | --- |
| 01 / Terrain | contours rise out of a flat field | The city starts before the buildings. |
| 02 / Street Level? | stacked road/building section | Ground is conditional. |
| 03 / Stairs | repeated climbing geometry | Walking is vertical transport. |
| 04 / Transit | monorail changes state with scroll | The train negotiates the section. |
| Cableway pause | one slow river crossing | Height briefly becomes distance. |
| 05 / Bridge City | vertical scroll drives horizontal travel | Bridges stitch separated levels and banks. |
| 06 / Vertical Life | ordinary uses stack by height | The spectacular section is daily life. |
| 07 / Old Chungking | archival rail | The slope predates the skyline. |
| 08 / Descend | altitude falls toward the river | The city stays above the viewer. |
| 09 / After Dark | light arrives after structure | Night is the final layer, not the premise. |

## Palette

- Deep concrete `#090d0f`: night, transit and structural void.
- Warm concrete `#d7d2c7`: daylight ground.
- Field paper `#ece8df`: editorial breathing room.
- River grey-green `#536d6c`: geographic baseline.
- Oxide red `#d84b38`: bridge, altitude and intervention.
- Sodium amber `#ee9b57`: late-day light and human warmth.

## Type and grid

- Monumental grotesk/sans-serif headings follow the existing GALOK city system.
- Monospaced labels carry altitude, level, route and archive metadata.
- Desktop grids deliberately change by chapter: contour field, section stack, horizontal bridge track, archival rail.
- Photographs retain their natural ratios wherever documentary readability matters.

## Motion

- Native scroll remains the controller.
- Sticky scenes are limited to Terrain, Transit, Bridges and the river descent.
- Scroll progress drives transforms only; layout properties are not continuously animated.
- IntersectionObserver handles reveal state, media lifecycle and narrative altitude.
- Videos pause offscreen and when the document is hidden.
- Reduced-motion mode removes sticky translation and autoplay.

## Responsive behaviour

- Desktop keeps the fixed altimeter and full sticky scenes.
- Tablet keeps the altimeter but shortens sticky distances, lowers image height budgets and avoids forced portrait crops.
- Mobile flattens every sticky scene into a vertical reading sequence; the altimeter becomes a compact bottom instrument and documentary images use natural height.

## What NOT to do

- No generic neon/cyberpunk Chongqing treatment.
- No tourism-board wall of landmarks.
- No forced portrait crop merely to preserve a desktop grid.
- No fake precision for elevation values.
- No heavy 3D/WebGL layer when CSS perspective and real photographs can carry the idea.
