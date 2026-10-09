# src/screens

`wNN.tsx` se generaron una sola vez con `scripts/stitch/convert.py` desde `stitch_design_system_studio/wNN_*/code.html`
y **desde ese momento son código fuente mantenido a mano** (no se regeneran: `scripts/stitch/regen.sh` sobrescribiría
las interacciones). Copia pristina del export convertido: `.legacy-2026-10-08/screens-generated/`.

Reglas:
- El estado inicial renderizado debe seguir coincidiendo con Stitch (`node scripts/qa/capture.mjs --only wNN` + `python3 scripts/qa/diff.py 1440 wNN`).
- Las interacciones viven en `src/screens/islands/*` (componentes cliente) y los `wNN.tsx` siguen siendo componentes de servidor.
- Tailwind v4 ≠ v3 (Stitch): no combinar dos utilidades de tamaño de texto en un mismo elemento (`text-body-compact text-[13px]`).
