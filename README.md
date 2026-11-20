# Palm Fever Studio — gta6-cover-art-01

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/zesty-pika-87/gta6-cover-art-01-v11/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/zesty-pika-87/gta6-cover-art-01-v11/reward.svg)](https://make.fun/c/gta6-cover-art-01)

A GTA-style cover maker built from the winning pattern: **photo-led covers**.
Six different photos fill six different panels, a giant gradient title with a
script line overlapping it sits on top, and full poster furniture — five stars,
a fake-press quote, a VOL. badge, a role tag on every panel, a tagline strip,
a billing block, COMING SOON, a barcode and a gold ORIGINAL COVER ART seal —
frames every cover like a cinema one-sheet.

Four invented covers ship in the app (PALM FEVER, HIGH TIDE HUSTLE, HEATWAVE,
AFTER DARK), each with its own layout, warm grade and photo order, so the
editor's live preview always shows a different cover from the flagship. Photos
are graded warm and clean — no halftone ever touches them — and no borrowed
game wording appears anywhere on a cover.

## The editor

A visible 3-step wizard: **1 Add photos → 2 Caption & style → 3 Export PNG**.
The tray holds six different photos (two kit samples plus four more made with
an image model, all free to use); click any photo to zoom, flip, swap or
re-tag its panel. Layout presets (Hero mosaic, Hero + three, Six grid,
Diagonal) and grades (Sunset, Golden hour, Neon night, After dark) restyle the
cover live, and export writes 1080 × 1080, 1080 × 1350 and 1920 × 1080 PNGs —
one button exports all three.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Static files only, no build step, no network request: `app/index.html` opens in
desktop Chrome and works offline. Your photos are read on your own machine and
never uploaded.
