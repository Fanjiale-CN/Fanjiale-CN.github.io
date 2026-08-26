# Shenzhen — A City in Many Frequencies

## Design read

The supplied material contains two Shenzhens at once: an expansive waterfront city and a close-grained street city. The page uses that tension as its structure. It does not arrange the work as a destination guide or a generic masonry gallery.

The central device is a live **city-frequency board**. Five time signals move through Bay, Crossing, Street, Ridge and Light. The signal rail behaves like a compact transit readout without copying a transport brand. Each chapter changes the signal colour and updates its time, district and reading mode.

## Reference synthesis

- [Epic Places / Tablo](https://tablo.de/epic-places) informed the changing chapter palette and the idea of a map-like journey that responds to scroll.
- [Chicago 00](https://chicago00.org/) informed the site-specific link between image, time and urban memory.
- [Pastpic](https://www.pastpic.com/) informed the use of location as editorial context rather than as a decorative map.
- [Rose Island / Rhumb](https://www.rhumb.co/work/rose-island) informed the commitment to cinematic flow with a light runtime.
- [Highrise / NFB](https://highrise.nfb.ca/) informed the city-as-many-voices approach.

These references contribute interaction logic. Their visual surfaces are not reproduced.

## Narrative sequence

| Time | Frequency | Material role | Editorial claim |
| --- | --- | --- | --- |
| 05:12 | Bay | waterline, rocks, Spring Bamboo | The city begins horizontally. |
| 08:47 | Crossing | Luohu station, signs, scooter | Arrival is part of the form. |
| 12:26 | Street | alley, lanterns, speech | The new city has old thresholds. |
| 18:41 | Ridge | mountain, port, sunset | The mountain checks the speed. |
| 22:18 | Light | towers, wheel, civic ground | After dark, the signal doubles. |

## Cultural layer

The Cantonese phrase `得閒飲茶` appears as a pause, not as a decorative slogan. The surrounding copy acknowledges Hakka architecture, Mandarin and the many regional accents carried into Shenzhen. The city is presented as a plural voice.

## Palette

- Ink `#0a1012`: night field and navigation anchor.
- Warm paper `#eeeae0`: Galok continuity and long-read comfort.
- Signal red `#e14b3b`: route state, intervention and closing chapter.
- Tidal cyan `#77b9bd`: bay light and active frequency.
- Sodium amber `#ef9e45`: port and late-day transition.

Colour changes occur by chapter and keep four functional roles: ground, ink, signal and rule.

## Type and grid

- Monumental sans-serif city names and chapter claims.
- Monospaced coordinates, timestamps and captions.
- Traditional Chinese uses the site’s Hong Kong Ming face.
- A recurring `18 / 48 / remainder` grid ties the hero, prologue, rail and closing film note together.
- Square media frames and hairline rules maintain the Galok field-note system.

## Motion

- Native scroll remains fully in control.
- One `IntersectionObserver` updates chapter state; one observes first-entry reveals.
- UI state changes complete in 180ms; text enters in 220ms.
- Media hover uses a 1.5% scale within 220ms.
- Hero film pauses offscreen and when the document is hidden.
- `prefers-reduced-motion` removes every non-essential transition and requires explicit video playback.

## Responsive behaviour

- Desktop uses a full-height sticky signal rail.
- Tablet turns the rail into a horizontal in-page index.
- Mobile flattens all editorial grids into a single reading column while preserving timestamps and captions.
- Mobile receives separate 960px images and the existing mobile R2 film encode.
