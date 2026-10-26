#!/usr/bin/env python3
"""
Imports the constellation paintings of Stellarium's "western" sky culture
(illustrations by Johan Meuris, Free Art License 1.3 — see
public/constellation-art/LICENSES.md) into the poster's art pipeline.

    git clone --depth 1 --filter=blob:none --sparse https://github.com/Stellarium/stellarium-skycultures.git sc
    (cd sc && git sparse-checkout set western)
    git clone --depth 1 https://github.com/ofrohn/d3-celestial d3
    python3 scripts/import-stellarium-art.py sc/western d3/data

For each constellation it
  • turns the black background into transparency (the paintings are light figures
    on black), keeping the figure's own brightness as opacity, and writes
    public/constellation-art/<IAU>.webp;
  • converts Stellarium's three anchor stars (Hipparcos numbers) into J2000 RA/Dec
    using d3-celestial's catalog, and writes src/features/sky/data/art-images.json.
"""
import json
import sys
from pathlib import Path

from PIL import Image

if len(sys.argv) != 3:
    sys.exit(__doc__)
western, d3data = Path(sys.argv[1]), Path(sys.argv[2])
root = Path(__file__).resolve().parent.parent
out_img = root / "public" / "constellation-art"
out_json = root / "src" / "features" / "sky" / "data" / "art-images.json"

# Hipparcos number -> (RA, Dec) in degrees
hip = {}
for name in ("stars.6.json", "stars.8.json", "stars.14.json"):
    for feature in json.loads((d3data / name).read_text())["features"]:
        lon, lat = feature["geometry"]["coordinates"]
        hip.setdefault(feature["id"], ((lon + 360) % 360, lat))

index = json.loads((western / "index.json").read_text())
# Well-known figures drawn on the poster; the rest stay on disk but are not shown,
# so the sky keeps dark space between the pictures.
FEATURED = set("Ori UMa UMi Cas Cyg Lyr Aql Sco Sgr Leo Tau Gem Vir Peg And Per Aur CMa Boo Her Dra Aqr Cru Cen".split())
entries = []
for c in index["constellations"]:
    image = c.get("image")
    if not image:
        continue
    iau = c["iau"]
    anchors = image["anchors"]
    missing = [a["hip"] for a in anchors if a["hip"] not in hip]
    if missing:
        print(f"skip {iau}: no coordinates for HIP {missing}")
        continue

    import numpy as np

    src = np.asarray(Image.open(western / image["file"]).convert("RGB"), dtype=np.float32)
    h, w = src.shape[:2]
    a = src.max(axis=2)  # brightness becomes opacity ...
    k = np.where(a >= 6, 255.0 / np.maximum(a, 1), 0)  # ... and the colour stays full
    rgb = np.clip(src * k[..., None], 0, 255)
    alpha = np.where(a >= 6, a, 0)  # the black backdrop vanishes
    rgba = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), "RGBA")
    rgba.save(out_img / f"{iau}.webp", "WEBP", quality=82, method=4)

    entries.append(
        {
            "id": iau,
            "src": f"/constellation-art/{iau}.webp",
            "width": w,
            "height": h,
            "featured": iau in FEATURED,
            "opacity": 0.4,
            "anchors": [
                {"px": a["pos"], "star": [round(hip[a["hip"]][0], 4), round(hip[a["hip"]][1], 4)]}
                for a in anchors
            ],
        }
    )

entries.sort(key=lambda e: e["id"])
out_json.write_text(json.dumps({"images": entries}, indent=1) + "\n")
print(f"{len(entries)} paintings")
