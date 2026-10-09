#!/usr/bin/env python3
"""Genera src/app/space-compat.css: semántica Tailwind v3 de space-x/y-* (ADR-001 usa v4, Stitch fue exportado con v3).
v3: `> :not([hidden]) ~ :not([hidden])` recibe margin-top/left. v4: el hermano anterior recibe margin-block-end.
Escanea src/**/*.tsx y emite reglas sin capa (ganan a las utilidades v4)."""
import re, glob, collections
BP = {"": None, "sm": 640, "md": 768, "lg": 1024, "xl": 1280, "2xl": 1536}
found = collections.OrderedDict()
for f in glob.glob("src/**/*.tsx", recursive=True):
    for m in re.finditer(r'(?<![\w-])((?:(?:sm|md|lg|xl|2xl):)?)space-([xy])-(px|\d+(?:\.\d+)?|\[[^\]]+\])(?![\w-])', open(f).read()):
        found[(m.group(1)[:-1], m.group(2), m.group(3))] = True

def val(v):
    if v == "px": return "1px"
    if v.startswith("["): return v[1:-1]
    return f"{float(v) * 0.25:g}rem"

def esc(c):
    return re.sub(r'([.\[\]:/])', r'\\\1', c)

out = ["/* GENERADO por scripts/stitch/gen-space-compat.py — no editar a mano. */", "@layer utilities {"]
for bp in ["", "sm", "md", "lg", "xl", "2xl"]:
    rules = []
    for (p, axis, v) in found:
        if p != bp: continue
        cls = (f"{p}:" if p else "") + f"space-{axis}-{v}"
        prop, zero = ("margin-top", "margin-bottom") if axis == "y" else ("margin-left", "margin-right")
        # 1) neutraliza la regla v4 (especificidad 0, misma capa, declarada después)
        rules.append(f":where(.{esc(cls)} > :not(:last-child)) {{ margin-block-start: 0; margin-block-end: 0; margin-inline-start: 0; margin-inline-end: 0; }}")
        # 2) semántica v3: el hermano siguiente recibe el margen (especificidad 0,3,0 como en v3)
        rules.append(f".{esc(cls)} > :not([hidden]) ~ :not([hidden]) {{ {prop}: {val(v)}; {zero}: 0; }}")
    # el 0 explícito de v3 (space-y-0) también anula el espacio heredado de breakpoints menores
    if rules:
        if BP[bp]: out.append(f"  @media (min-width: {BP[bp]}px) {{\n    " + "\n    ".join(rules) + "\n  }")
        else: out += ["  " + r for r in rules]
out.append("}")
open("src/app/space-compat.css", "w").write("\n".join(out) + "\n")
print(len(found), "utilidades space-* emitidas")
