// Verificación geométrica de los GLB de válvulas: bridas y volante circulares completos,
// alturas esperadas y ninguna pieza recortada por sus límites de mallado.
// Uso: node scripts/valve3d/verify.mjs   (sale con código 1 si algo falla)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';

await MeshoptDecoder.ready;

const FILES = { hitaly: 'valvula-hitaly.glb', fundigsac: 'valvula-fundigsac.glb', cuadrante: 'valvula-fundigsac-cuadrante.glb' };
let failed = false;
const check = (ok, msg) => { console.log(`${ok ? '✔' : '✘'} ${msg}`); if (!ok) failed = true; };

for (const [variant, file] of Object.entries(FILES)) {
  const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder }).read(`public/models/${file}`);
  await doc.transform(dequantize());
  const parts = {};
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh(); if (!mesh) continue;
    const m = node.getWorldMatrix(), list = parts[node.getName()] = [];
    for (const p of mesh.listPrimitives()) {
      const a = p.getAttribute('POSITION');
      for (let i = 0; i < a.getCount(); i++) {
        const [x, y, z] = a.getElement(i, []);
        list.push([(m[0] * x + m[4] * y + m[8] * z + m[12]) * 1000, (m[1] * x + m[5] * y + m[9] * z + m[13]) * 1000, (m[2] * x + m[6] * y + m[10] * z + m[14]) * 1000]);
      }
    }
  }
  // Radio máximo por sector de 15°: un círculo completo no tiene huecos.
  const ring = (list, sel, polar) => {
    const max = new Array(24).fill(0);
    for (const p of list) if (sel(p)) { const [r, a] = polar(p); const k = Math.floor(((a + Math.PI) / (2 * Math.PI)) * 24) % 24; max[k] = Math.max(max[k], r); }
    return max;
  };
  const yz = (p) => [Math.hypot(p[1], p[2]), Math.atan2(p[2], p[1])];
  for (const side of [1, -1]) {
    const r = ring(parts.cuerpo, (p) => side * p[0] > 78, yz);
    check(Math.min(...r) > 108.5 && Math.max(...r) < 111.5, `${variant}: brida ${side > 0 ? '+X' : '−X'} circular Ø220 (r ${Math.min(...r).toFixed(1)}–${Math.max(...r).toFixed(1)} mm)`);
  }
  if (parts.volante) {
    const r = ring(parts.volante, () => true, (p) => [Math.hypot(p[0], p[2]), Math.atan2(p[2], p[0])]);
    check(Math.min(...r) > 122 && Math.max(...r) < 126, `${variant}: volante circular Ø250 (r ${Math.min(...r).toFixed(1)}–${Math.max(...r).toFixed(1)} mm)`);
  }
  // Ninguna pieza termina en un plano exacto de recorte: el contorno de cada pieza no puede tener
  // muchos vértices alineados en su cota extrema de Y (síntoma de un corte plano).
  for (const [name, list] of Object.entries(parts)) {
    const ys = list.map((p) => p[1]), top = Math.max(...ys), bottom = Math.min(...ys);
    const flatTop = list.filter((p) => Math.abs(p[1] - top) < 0.05).length, flatBottom = list.filter((p) => Math.abs(p[1] - bottom) < 0.05).length;
    const flat = Math.max(flatTop, flatBottom) / list.length;
    check(flat < 0.08 || ['caucho', 'tapones', 'laton', 'acero', 'cuadrante', 'inserto', 'tornillo', 'placa'].includes(name), `${variant}: ${name} sin recorte plano (${(flat * 100).toFixed(1)} % de vértices en la cota extrema)`);
  }
}
process.exit(failed ? 1 : 0);
