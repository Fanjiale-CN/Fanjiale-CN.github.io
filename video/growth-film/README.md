# Galok growth film

A silent 38-second film for `/design/`. It translates the site's design philosophy into one sequence: growth establishes the field; viewing, framing and observing give it meaning; cities, images, writing and data become one archive.

```bash
python render.py --render out/growth-film.mp4
python render.py --still 700 out/review-frame.png
```

The renderer uses Pillow and FFmpeg already available in the production workspace. It streams raw frames directly into H.264, so there is no frame dump or browser dependency. The render is deterministic, all imagery comes from Galok's own archive, and the final composition contains no audio track.
