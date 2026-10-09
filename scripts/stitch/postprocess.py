#!/usr/bin/env python3
"""Ajustes posteriores a la conversión: imágenes en estilos inline y atributos no portables."""
import re
m = {u: h for h, u, _ in (l.split("\t") for l in open("scripts/stitch/image-map.tsv").read().splitlines())}
p = "src/screens/w12.tsx"
s = open(p).read()
s = re.sub(r"https://lh3\.googleusercontent\.com[^'\")\s]*", lambda mo: f"/images/stitch/{m[mo.group(0)]}.jpg", s)
s = re.sub(r' data-location="[^"]*"', "", s)
open(p, "w").write(s)
