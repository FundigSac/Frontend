#!/usr/bin/env python3
"""Compara docs/qa/screenshots/orig vs mine. Uso: diff.py <width> [ids...]
Métricas: alto de página, % de píxeles distintos (umbral por canal 24), y banda con mayor diferencia."""
import sys
from pathlib import Path
from PIL import Image, ImageChops

root = Path("docs/qa/screenshots")
width = sys.argv[1]
ids = sys.argv[2:] or sorted(p.name.split("-")[0] for p in (root / "orig").glob(f"*-{width}.png"))
(root / "diff").mkdir(exist_ok=True)
rows = []
for i in ids:
    o = root / "orig" / f"{i}-{width}.png"
    m = root / "mine" / f"{i}-{width}-light.png"
    if not (o.exists() and m.exists()):
        continue
    a, b = Image.open(o).convert("RGB"), Image.open(m).convert("RGB")
    h = min(a.height, b.height)
    ac, bc = a.crop((0, 0, a.width, h)), b.crop((0, 0, b.width, h))
    d = ImageChops.difference(ac, bc).convert("L").point(lambda v: 255 if v > 24 else 0)
    bbox_hist = d.histogram()
    pct = 100 * bbox_hist[255] / (d.width * d.height)
    # banda de 200px con más diferencia
    worst, worst_y = 0, 0
    for y in range(0, h, 200):
        band = d.crop((0, y, d.width, min(h, y + 200)))
        c = band.histogram()[255]
        if c > worst:
            worst, worst_y = c, y
    # imagen lado a lado
    side = Image.new("RGB", (a.width + b.width + d.width, max(a.height, b.height)), "white")
    side.paste(a, (0, 0)); side.paste(b, (a.width, 0)); side.paste(d.convert("RGB"), (a.width + b.width, 0))
    side.thumbnail((2400, 4000)); side.save(root / "diff" / f"{i}-{width}.png")
    rows.append((i, a.height, b.height, b.height - a.height, pct, worst_y))
import json, datetime
(root / "../results").mkdir(parents=True, exist_ok=True)
rp = root / "../results" / f"visual-{width}.json"
data = json.loads(rp.read_text()) if rp.exists() else {}
for r in rows:
    data[r[0]] = {"orig_h": r[1], "mine_h": r[2], "delta_h": r[3], "diff_pct": round(r[4], 2), "worst_band_y": r[5], "at": datetime.datetime.now().isoformat(timespec="seconds")}
rp.write_text(json.dumps(data, indent=1))
print(f"{'id':4} {'orig_h':>7} {'mine_h':>7} {'Δh':>6} {'diff%':>7} worst_band_y")
for r in rows:
    print(f"{r[0]:4} {r[1]:7} {r[2]:7} {r[3]:6} {r[4]:7.2f} {r[5]}")
