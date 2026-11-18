#!/usr/bin/env bash
# Makes the posters the app ships (assets/images/poster-*.jpg) from the
# full-size artwork in art/. Posters show at most 260x390 on a 1920-wide
# screen, so 520x780 keeps them sharp at a quarter of the original's pixels.
# The originals stay in art/ because scripts/make-clips.sh films them.
#
#   bash scripts/make-images.sh
#
# Requires ffmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."

for src in art/poster-*.jpg; do
  out="assets/images/$(basename "$src")"
  ffmpeg -y -loglevel error -i "$src" -vf "scale=520:-2:flags=lanczos" -q:v 3 "$out"
  echo "$out $(du -h "$out" | cut -f1)"
done
