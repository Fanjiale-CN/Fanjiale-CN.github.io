#!/usr/bin/env bash
set -euo pipefail
# Prepare vertical 9:16 proxies from the site's existing 4K city footage.
# Cities' master videos are portrait (vertical) already; scale to 540x960.
mkdir -p public/city-render
if [[ ! -f public/galok-symbol.svg ]]; then
  ln -sf ../../assets/galok-symbol.svg public/galok-symbol.svg
fi
if [[ ! -f public/field-note-poster.webp ]]; then
  ln -sf ../../assets/about/galok-field-note-poster.webp public/field-note-poster.webp
fi
for city in beijing shanghai xian xiamen; do
  source_file="../../assets/be-a-viewer/video/${city}.mp4"
  render_file="public/city-render/${city}.mp4"
  if [[ ! -f "$render_file" || "$source_file" -nt "$render_file" ]]; then
    ffmpeg -y \
      -i "$source_file" \
      -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
      -vf "scale=540:960:force_original_aspect_ratio=increase,crop=540:960,fps=30" \
      -map 0:v:0 -map 1:a:0 \
      -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p \
      -c:a aac -b:a 64k -shortest -movflags +faststart \
      "$render_file"
  fi
done
