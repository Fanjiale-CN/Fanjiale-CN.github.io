# Galok brand film

Source project for the silent 36-second film embedded on `/about/`.

## Production flow

1. From the Galok repository root, serve the site locally on port `4173`.
2. In this directory, run `npm install`.
3. Run `npm run capture` to collect real 1920×1080 / DPR 2 page evidence and the 900px Works/Notes panel captures.
4. Run `npm run prepare` to create lightweight 960×540 city review proxies from the site's existing 4K footage.
5. Run `npm run render`.
6. Strip audio and prepare the web file with:

   `ffmpeg -i out/galok-brand-film.mp4 -an -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart ../../assets/about/galok-brand-film.mp4`

The checked-in deliverable is `assets/about/galok-brand-film.mp4`. Captures, proxies, dependencies, review images and raw renders are intentionally ignored.

## Constraints

- 1920×1080, 30fps, 1080 frames / 36 seconds
- no final audio stream
- only real Galok pages, existing city footage and verified CPI values
- readable main captions at 56px or larger; auxiliary captions at 32px or larger
- no blank boundary frames, shake, glint, synthetic UI or invented data
