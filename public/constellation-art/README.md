# Constellation paintings

Pictures here are drawn behind the constellation lines when a poster has
"نقش صورت‌های فلکی" switched on. Each one is pinned to three stars, so it sits
exactly where the constellation is, at any date, place and size.

## What a picture must be

- **Licence first.** The poster downloads are sold, so every picture needs a licence
  that allows commercial use (made for the project, bought, or properly licensed).
  Do not add pictures copied from Stellarium, Google Images, IAAS or any atlas unless
  their licence says so. Keep the licence/credit next to the file (see `LICENSES.md`).
- **Look.** The figure painted light (white / silver / soft gold) on a **transparent**
  background, like a shaded statue or a constellation atlas. Dark parts of the picture
  will just look like dark patches on the sky, so keep the background empty.
- **Orientation.** As the sky looks from the ground: north up, east to the left, the
  same way the chart is drawn. (Pictures from Stellarium-style atlases already are.)
- **File.** WebP or PNG with alpha, at most ~1200 px on the long side and ≤ 150 KB.
  Name it by the IAU abbreviation: `Ori.webp`, `UMa.webp`, `Sco.webp` …

## Adding one

1. Put the file here.
2. Pick **three well-spread stars** in the picture (corners of the figure are best, not
   three in a line) and note each one's pixel position and its J2000 right ascension and
   declination in degrees (any star atlas lists them).
3. Add an entry to `src/features/sky/data/art-images.ts` (the example is in that file).

The picture is then stretched, turned and moved so those three pixels land on those
three stars. That constellation's built-in line figure is skipped.
