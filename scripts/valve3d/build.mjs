// Construye los GLB de las válvulas de compuerta a partir de las SDF de models.mjs.
// Uso: node scripts/valve3d/build.mjs [hitaly|fundigsac|cuadrante|all] [--fast]
import fs from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { KHRMaterialsClearcoat, KHRMeshQuantization } from '@gltf-transform/extensions';
import { quantize, reorder } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { Pool, meshPart } from './mesher.mjs';
import { prepareAssets } from './models.mjs';
import { textBlockField, logoField } from './fields.mjs';
import { writeValveStudio } from '../valvula-studio.mjs';

const arg = process.argv[2] ?? 'all';
const fast = process.argv.includes('--fast');
const variants = arg === 'all' ? ['hitaly', 'fundigsac', 'cuadrante'] : arg === 'studio' ? [] : [arg];
const OUT = { hitaly: 'valvula-hitaly.glb', fundigsac: 'valvula-fundigsac.glb', cuadrante: 'valvula-fundigsac-cuadrante.glb' };

// Esmalte epoxi azul RAL 5005 medido en las fotos (sRGB ~ 5, 67, 190 a plena luz), barniz brillante.
const MATERIALS = {
  epoxi: { color: [0.0045, 0.064, 0.56], rough: 0.3, clearcoat: 1, ccRough: 0.06 },
  'epoxi-interior': { color: [0.0045, 0.064, 0.56], rough: 0.55 },
  epdm: { color: [0.055, 0.056, 0.06], rough: 0.42 },
  acero: { color: [0.8, 0.8, 0.81], rough: 0.36, metal: 0.85 },
  laton: { color: [0.9, 0.62, 0.26], rough: 0.3, metal: 1 },
  caucho: { color: [0.02, 0.02, 0.022], rough: 0.5 },
  blanco: { color: [0.82, 0.83, 0.82], rough: 0.32 },
};

/** Oclusión ambiental horneada por vértice (pasos a lo largo de la normal sobre la SDF de la escena). */
async function bakeAo(pool, mesh) {
  // mesh = { positions, normals } de la malla completa.
  const steps = [1.5, 4, 9, 18, 32], n = mesh.positions.length / 3;
  const pts = new Float32Array(n * steps.length * 3);
  for (let i = 0; i < n; i++) for (let k = 0; k < steps.length; k++) {
    const o = (i * steps.length + k) * 3;
    for (let a = 0; a < 3; a++) pts[o + a] = mesh.positions[i * 3 + a] + mesh.normals[i * 3 + a] * steps[k];
  }
  const jobs = [], chunk = 20000 * steps.length;
  for (let s = 0; s < pts.length / 3; s += chunk) jobs.push(pool.run({ type: 'points', part: 'escena', points: pts.slice(s * 3, Math.min(pts.length, (s + chunk) * 3)), h: 0.05 }));
  const res = await Promise.all(jobs), d = new Float32Array(pts.length / 3);
  let o = 0; for (const r of res) for (let i = 0; i < r.length; i += 4) d[o++] = r[i];
  const ao = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let occ = 0, w = 0.5;
    for (let k = 0; k < steps.length; k++) { occ += w * Math.max(0, steps[k] - d[i * steps.length + k]) / steps[k]; w *= 0.8; }
    ao[i] = Math.max(0.22, Math.min(1, 1 - 0.95 * occ));
  }
  return ao;
}

/** Superficies interiores (paso, cámara y cavidad del bonete): esmalte sin barniz para no reflejar el estudio. */
function isInterior(part, x, y, z) {
  if (part === 'cuerpo') return (Math.hypot(y, z) < BORE_IN && Math.abs(x) < 94) || (Math.abs(x) < 22.6 && Math.abs(z) < 64.6 && y > -60 && y < 92);
  if (part === 'bonete') return Math.abs(x) < 20.6 && Math.abs(z) < 62.6 && y < 150;
  if (part === 'cuadrante') return Math.hypot(x, z) < 17.4 && y > 300;
  return false;
}
const BORE_IN = 50.6;

async function buildVariant(variant) {
  const t0 = Date.now();
  console.log(`\n▶ ${variant}`);
  const assets = await prepareAssets(variant, { textBlockField, logoField });
  const pool = new Pool(new URL('./models.mjs', import.meta.url).href, assets);
  await pool.ready;
  const { buildParts } = await import('./models.mjs');
  const specs = buildParts(assets);
  const doc = new Document(), buffer = doc.createBuffer(), scene = doc.createScene(variant);
  const cc = doc.createExtension(KHRMaterialsClearcoat);
  doc.createExtension(KHRMeshQuantization).setRequired(true);
  const mats = {};
  for (const [name, m] of Object.entries(MATERIALS)) {
    const mat = doc.createMaterial(name).setBaseColorFactor([...m.color, 1]).setRoughnessFactor(m.rough).setMetallicFactor(m.metal ?? 0);
    if (m.clearcoat) mat.setExtension('KHR_materials_clearcoat', cc.createClearcoat().setClearcoatFactor(m.clearcoat).setClearcoatRoughnessFactor(m.ccRough));
    mats[name] = mat;
  }
  const root = doc.createNode('valvula').setScale([0.001, 0.001, 0.001]);
  scene.addChild(root);
  for (const [name, spec] of Object.entries(specs)) {
    if (!spec.bounds) continue;
    const voxel = fast ? spec.voxel * 1.8 : spec.voxel;
    const mesh = await meshPart(pool, { ...spec, name, voxel, ao: (positions, normals) => bakeAo(pool, { positions, normals }) });
    const ao = mesh.ao;
    const n = mesh.positions.length / 3, colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = ao[i];
    // Grupos por material (exterior barnizado / interior mate).
    const groups = new Map();
    for (let t = 0; t < mesh.indices.length; t += 3) {
      const [a, b, c] = [mesh.indices[t], mesh.indices[t + 1], mesh.indices[t + 2]];
      const cx = (mesh.positions[a * 3] + mesh.positions[b * 3] + mesh.positions[c * 3]) / 3;
      const cy = (mesh.positions[a * 3 + 1] + mesh.positions[b * 3 + 1] + mesh.positions[c * 3 + 1]) / 3;
      const cz = (mesh.positions[a * 3 + 2] + mesh.positions[b * 3 + 2] + mesh.positions[c * 3 + 2]) / 3;
      const mat = spec.material === 'epoxi' && isInterior(name, cx, cy, cz) ? 'epoxi-interior' : spec.material;
      if (!groups.has(mat)) groups.set(mat, []);
      groups.get(mat).push(a, b, c);
    }
    // Primitivas de menos de 65 536 vértices: índices de 16 bits.
    const gMesh = doc.createMesh(name);
    for (const [mat, idx] of groups) {
      for (let start = 0; start < idx.length;) {
        const remap = new Map(), local = [];
        let t = start;
        for (; t < idx.length && remap.size < 65530; t += 3) for (let k = 0; k < 3; k++) {
          const g = idx[t + k];
          if (!remap.has(g)) remap.set(g, remap.size);
          local.push(remap.get(g));
        }
        const m = remap.size, P = new Float32Array(m * 3), N = new Float32Array(m * 3), C = new Float32Array(m * 3);
        for (const [g, l] of remap) for (let a = 0; a < 3; a++) { P[l * 3 + a] = mesh.positions[g * 3 + a]; N[l * 3 + a] = mesh.normals[g * 3 + a]; C[l * 3 + a] = colors[g * 3 + a]; }
        const acc = (arr, type) => doc.createAccessor().setType(type).setArray(arr).setBuffer(buffer);
        gMesh.addPrimitive(doc.createPrimitive().setMaterial(mats[mat]).setAttribute('POSITION', acc(P, 'VEC3')).setAttribute('NORMAL', acc(N, 'VEC3'))
          .setAttribute('COLOR_0', acc(C, 'VEC3')).setIndices(acc(Uint16Array.from(local), 'SCALAR')));
        start = t;
      }
    }
    root.addChild(doc.createNode(name).setMesh(gMesh));
  }
  await pool.close();
  // Materiales sin uso (p. ej. "blanco" en H-ITALY) se eliminan.
  for (const m of doc.getRoot().listMaterials()) if (!m.listParents().some((p) => p.propertyType === 'Primitive')) m.dispose();
  await MeshoptEncoder.ready;
  await doc.transform(reorder({ encoder: MeshoptEncoder, target: 'size' }), quantize({ quantizePosition: 14, quantizeNormal: 12, quantizeColor: 8 }));
  const file = `public/models/${OUT[variant]}`;
  await new NodeIO().registerExtensions([KHRMaterialsClearcoat, KHRMeshQuantization]).write(file, doc);
  console.log(`✔ ${file}: ${(fs.statSync(file).size / 1024).toFixed(0)} KB en ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

for (const v of variants) await buildVariant(v);
// Estudio fotográfico de fondo blanco, como las fotos de producto: barrido claro y cajas de luz.
// Estudio de producto: entorno gris oscuro y grandes cajas de luz blancas (reflejos nítidos sobre el barniz).
const studio = writeValveStudio('public/models/valvula-estudio-blanco.hdr', 1024, 512, {
  ambient: [0.2, 0.26], gain: 1,
  extra: [
    { direction: [-0.5, 0.42, 0.75], horizontal: 0.5, vertical: 0.42, radiance: 5.5 },
    { direction: [0.62, 0.3, 0.72], horizontal: 0.34, vertical: 0.5, radiance: 3.2 },
    { direction: [0.95, 0.25, -0.1], horizontal: 0.07, vertical: 0.6, radiance: 16 },
    { direction: [-0.95, 0.25, -0.2], horizontal: 0.07, vertical: 0.6, radiance: 14 },
    { direction: [0.05, 0.97, 0.2], horizontal: 0.35, vertical: 0.12, radiance: 4 },
    { direction: [0, 0.1, -1], horizontal: 0.6, vertical: 0.3, radiance: 1.2 },
    { direction: [0.15, 0.55, 0.82], horizontal: 0.9, vertical: 0.035, radiance: 7 },
    { direction: [-0.1, -0.15, 0.98], horizontal: 0.9, vertical: 0.04, radiance: 5 },
  ],
});
console.log('Estudio HDR', studio);
