#!/bin/sh
# Regenera las pantallas desde el export de Stitch (no toca el export original).
cd "$(dirname "$0")/../.." || exit 1
python3 scripts/stitch/convert.py ../stitch_design_system_studio src/screens public/images/stitch scripts/stitch/image-map.tsv >/dev/null || exit 1
python3 scripts/stitch/postprocess.py || exit 1
python3 scripts/stitch/gen-space-compat.py
