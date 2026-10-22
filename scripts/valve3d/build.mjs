// Construye los GLB de las válvulas de compuerta a partir de las SDF de models.mjs.
// Uso: node scripts/valve3d/build.mjs [hitaly|fundigsac|cuadrante|all] [--fast]
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { Document, NodeIO, Format } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMaterialsClearcoat, KHRMeshQuantization, KHRTextureTransform } from '@gltf-transform/extensions';
import { quantize, reorder } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { Pool, meshPart } from './mesher.mjs';
import { prepareAssets, CONFIG } from './models.mjs';
import { textBlockField, logoField } from './fields.mjs';
import { writeValveStudio } from '../valvula-studio.mjs';
import sharp from 'sharp';

const arg = process.argv[2] ?? 'all';
const fast = process.argv.includes('--fast');
const variants = arg === 'all' ? ['hitaly', 'fundigsac', 'cuadrante'] : arg === 'studio' ? [] : [arg];
const OUT = { hitaly: 'valvula-hitaly.glb', fundigsac: 'valvula-fundigsac.glb', cuadrante: 'valvula-fundigsac-cuadrante.glb' };

// Esmalte epoxi azul RAL 5005 medido en las fotos (sRGB ~ 5, 67, 190 a plena luz), barniz brillante.
const MATERIALS = {
  epoxi: { color: [0.0045, 0.064, 0.56], rough: 0.3, clearcoat: 1, ccRough: 0.06, peel: 0.05, coatPeel: 0.11 },
  // Dado del cuadrante: caras planas y lisas en las fotos (q-02, q-04), con la piel de naranja apenas insinuada.
  'epoxi-dado': { color: [0.0045, 0.064, 0.56], rough: 0.3, clearcoat: 1, ccRough: 0.05, peel: 0.01, coatPeel: 0.015 },
  'epoxi-interior': { color: [0.0045, 0.064, 0.56], rough: 0.55, peel: 0.05 },
  // Inserto de hierro mecanizado sin pintar en el fondo del dado (q-05): gris mate.
  hierro: { color: [0.5, 0.5, 0.48], rough: 0.6, metal: 0.6 },
  epdm: { color: [0.055, 0.056, 0.06], rough: 0.42 },
  acero: { color: [0.86, 0.86, 0.87], rough: 0.24, metal: 0.8 },
  laton: { color: [0.95, 0.68, 0.3], rough: 0.22, metal: 1 },
  caucho: { color: [0.02, 0.02, 0.022], rough: 0.5 },
  blanco: { color: [0.82, 0.83, 0.82], rough: 0.32 },
  placa: { color: [1, 1, 1], rough: 0.32, metal: 0.65 },
};

/**
 * Mapa de normales tileable de esmalte epoxi en polvo: "piel de naranja" fina (Ø ~1–2 mm) y ondulación
 * amplia (4–10 mm), con pendiente efectiva de ~0,5° (mapa guardado con s = 0.15 y escala 0.05–0.11 en el material).
 * Ondas de frecuencia entera: el mosaico no tiene costuras.
 */
export const UV_TILE_MM = 40;
// UV comprimidas a [0,1] (cuantizables a 16 bits) y repetidas UV_REPEAT veces con KHR_texture_transform.
const UV_REPEAT = 14, UV_OFFSET = 4;
async function orangePeelNormalMap(size = 256) {
  let seed = 20261015;
  const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const waves = [];
  const band = (count, fMin, fMax, amp) => {
    for (let i = 0; i < count; i++) {
      const f = fMin + rnd() * (fMax - fMin), a = rnd() * Math.PI * 2;
      waves.push([Math.round(f * Math.cos(a)), Math.round(f * Math.sin(a)), rnd() * Math.PI * 2, amp * (0.6 + 0.4 * rnd())]);
    }
  };
  band(40, 4, 10, 1.0);
  band(50, 20, 36, 0.15);
  const px = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let dx = 0, dy = 0;
    for (const [fx, fy, ph, amp] of waves) {
      const k = 2 * Math.PI / size, c = Math.cos(k * (fx * x + fy * y) + ph) * amp * k;
      dx += c * fx; dy += c * fy;
    }
    const s = 0.15, nx = -dx * s, ny = -dy * s, l = Math.hypot(nx, ny, 1), i = (y * size + x) * 3;
    px[i] = Math.round((nx / l * 0.5 + 0.5) * 255); px[i + 1] = Math.round((ny / l * 0.5 + 0.5) * 255); px[i + 2] = Math.round((1 / l * 0.5 + 0.5) * 255);
  }
  return sharp(px, { raw: { width: size, height: size, channels: 3 } }).png({ compressionLevel: 9 }).toBuffer();
}

/** Textura de la placa de identificación: aluminio negro, borde y texto plateados, dos remaches. */
async function nameplateTexture(lines, W = 512, H = 224) {
  const px = Buffer.alloc(W * H * 4);
  const put = (x, y, c, a = 255) => { const i = (y * W + x) * 4; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = a; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const edge = Math.min(x, y, W - 1 - x, H - 1 - y);
    const silver = edge < 7 || (edge >= 12 && edge < 15);
    put(x, y, silver ? [196, 198, 202] : [22, 23, 26]);
    for (const cx of [26, W - 27]) {
      const d = Math.hypot(x - cx, y - H / 2);
      if (d < 11) { const s = Math.round(150 + 90 * Math.max(0, 1 - Math.hypot(x - cx + 4, y - H / 2 + 4) / 11)); put(x, y, [s, s, s + 4]); }
    }
  }
  let img = sharp(px, { raw: { width: W, height: H, channels: 4 } });
  const comps = [];
  let y = 30;
  for (const [text, size] of lines) {
    const t = await sharp({ text: { text, font: 'Arial Bold', fontfile: 'C:/Windows/Fonts/arialbd.ttf', dpi: size, rgba: true } }).raw().toBuffer({ resolveWithObject: true });
    const tw = t.info.width, th = t.info.height, tint = Buffer.alloc(tw * th * 4);
    for (let i = 0; i < tw * th; i++) { tint[i * 4] = 205; tint[i * 4 + 1] = 207; tint[i * 4 + 2] = 211; tint[i * 4 + 3] = t.data[i * 4 + 3]; }
    comps.push({ input: tint, raw: { width: tw, height: th, channels: 4 }, left: Math.round((W - tw) / 2), top: y });
    y += th + 8;
  }
  return img.composite(comps).flatten({ background: '#16171a' }).png().toBuffer();
}

/** Placa curva sobre el canto de la brida (malla directa con UV, no SDF). */
function nameplateGeometry({ side, angle, length, width, R }) {
  const nu = 24, nv = 6, half = length / R / 2, x0 = side * 84 - width / 2;
  const P = [], N = [], UV = [], I = [];
  const at = (r, th, x) => [x, r * Math.cos(th), r * Math.sin(th)];
  // Cara superior.
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const th = angle - half + (2 * half * i) / nu, x = x0 + (width * j) / nv;
    P.push(...at(R + 0.7, th, x)); N.push(0, Math.cos(th), Math.sin(th)); UV.push(side > 0 ? i / nu : 1 - i / nu, j / nv);
  }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; I.push(a, c, b, b, c, d); }
  // Cantos (0,7 mm), con el color del borde plateado.
  const ring = [];
  for (let i = 0; i <= nu; i++) ring.push([angle - half + (2 * half * i) / nu, x0]);
  for (let j = 1; j <= nv; j++) ring.push([angle + half, x0 + (width * j) / nv]);
  for (let i = nu - 1; i >= 0; i--) ring.push([angle - half + (2 * half * i) / nu, x0 + width]);
  for (let j = nv - 1; j >= 1; j--) ring.push([angle - half, x0 + (width * j) / nv]);
  const base = P.length / 3;
  for (const [th, x] of ring) {
    for (const r of [R + 0.7, R - 0.2]) { P.push(...at(r, th, x)); N.push(0, Math.cos(th), Math.sin(th)); UV.push(0.004, 0.02); }
  }
  for (let k = 0; k < ring.length; k++) { const a = base + k * 2, b = base + ((k + 1) % ring.length) * 2; I.push(a, a + 1, b, b, a + 1, b + 1); }
  // Orientación hacia fuera.
  for (let t = 0; t < I.length; t += 3) {
    const [a, b, c] = [I[t], I[t + 1], I[t + 2]];
    const u = [0, 1, 2].map((k) => P[b * 3 + k] - P[a * 3 + k]), v = [0, 1, 2].map((k) => P[c * 3 + k] - P[a * 3 + k]);
    const f = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const cx = (P[a * 3] + P[b * 3] + P[c * 3]) / 3, cy = (P[a * 3 + 1] + P[b * 3 + 1] + P[c * 3 + 1]) / 3, cz = (P[a * 3 + 2] + P[b * 3 + 2] + P[c * 3 + 2]) / 3;
    const out = Math.abs(cx - x0 - width / 2) > width / 2 - 1e-3 ? [Math.sign(cx - x0 - width / 2), 0, 0] : [0, cy, cz];
    if (f[0] * out[0] + f[1] * out[1] + f[2] * out[2] < 0) [I[t + 1], I[t + 2]] = [I[t + 2], I[t + 1]];
  }
  return { P: Float32Array.from(P), N: Float32Array.from(N), UV: Float32Array.from(UV), I: Uint16Array.from(I) };
}

/**
 * Empaqueta el GLB con las imágenes fuera, como PNG del mismo origen. La CSP del sitio (connect-src 'self') bloquea
 * las URL blob: que GLTFLoader crea para las texturas incrustadas. El nombre lleva un hash del contenido: la caché
 * de 7 días de /models se renueva sola cuando cambia una textura. Las mallas van con EXT_meshopt_compression
 * (sin pérdida sobre la cuantización): el GLB pesa varias veces menos y se decodifica con WASM en el navegador.
 */
async function writePackedGlb(doc, glbPath, prefix) {
  const written = [];
  for (const tex of doc.getRoot().listTextures()) {
    const hash = createHash('sha1').update(tex.getImage()).digest('hex').slice(0, 8);
    const name = `${tex.getName() === 'esmalte-piel-naranja' ? 'valvula-esmalte' : `${prefix}-${tex.getName()}`}-${hash}.png`;
    tex.setURI(name); written.push(name);
  }
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });
  const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMaterialsClearcoat, KHRMeshQuantization, KHRTextureTransform]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  const { json, resources } = await io.writeJSON(doc, { format: Format.GLTF, basename: prefix });
  for (const img of json.images ?? []) fs.writeFileSync(`public/models/${img.uri}`, resources[img.uri]);
  // El búfer con datos pasa a ser el BIN del GLB (índice 0); el de respaldo de meshopt no lleva bytes.
  const main = json.buffers.findIndex((buf) => buf.uri);
  const bin = Buffer.from(resources[json.buffers[main].uri]);
  delete json.buffers[main].uri;
  if (main !== 0) {
    const swap = (i) => (i === main ? 0 : i === 0 ? main : i);
    [json.buffers[0], json.buffers[main]] = [json.buffers[main], json.buffers[0]];
    for (const view of json.bufferViews) {
      view.buffer = swap(view.buffer);
      const ext = view.extensions?.EXT_meshopt_compression;
      if (ext) ext.buffer = swap(ext.buffer);
    }
  }
  const rawJson = Buffer.from(JSON.stringify(json)), jsonChunk = Buffer.alloc(Math.ceil(rawJson.length / 4) * 4, 0x20); rawJson.copy(jsonChunk);
  const binChunk = Buffer.alloc(Math.ceil(bin.length / 4) * 4); bin.copy(binChunk);
  const header = Buffer.alloc(12), jh = Buffer.alloc(8), bh = Buffer.alloc(8);
  header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + binChunk.length, 8);
  jh.writeUInt32LE(jsonChunk.length, 0); jh.writeUInt32LE(0x4e4f534a, 4); bh.writeUInt32LE(binChunk.length, 0); bh.writeUInt32LE(0x004e4942, 4);
  fs.writeFileSync(glbPath, Buffer.concat([header, jh, jsonChunk, bh, binChunk]));
  return written;
}

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
  if (part === 'cuadrante') return Math.hypot(x, z) < 33.9 && y > 286 && y < 334;
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
  const peel = doc.createTexture('esmalte-piel-naranja').setImage(await orangePeelNormalMap()).setMimeType('image/png');
  const tt = doc.createExtension(KHRTextureTransform).setRequired(false);
  const repeat = () => tt.createTransform().setScale([UV_REPEAT, UV_REPEAT]);
  for (const [name, m] of Object.entries(MATERIALS)) {
    const mat = doc.createMaterial(name).setBaseColorFactor([...m.color, 1]).setRoughnessFactor(m.rough).setMetallicFactor(m.metal ?? 0);
    if (m.peel) { mat.setNormalTexture(peel).setNormalScale(m.peel); mat.getNormalTextureInfo().setExtension('KHR_texture_transform', repeat()); }
    if (m.clearcoat) {
      const coat = cc.createClearcoat().setClearcoatFactor(m.clearcoat).setClearcoatRoughnessFactor(m.ccRough);
      if (m.coatPeel) { coat.setClearcoatNormalTexture(peel).setClearcoatNormalScale(m.coatPeel); coat.getClearcoatNormalTextureInfo().setExtension('KHR_texture_transform', repeat()); }
      mat.setExtension('KHR_materials_clearcoat', coat);
    }
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
      const mat = spec.material.startsWith('epoxi') && isInterior(name, cx, cy, cz) ? 'epoxi-interior' : spec.material;
      if (!groups.has(mat)) groups.set(mat, []);
      groups.get(mat).push(a, b, c);
    }
    // Primitivas de menos de 65 536 vértices: índices de 16 bits.
    const gMesh = doc.createMesh(name);
    for (const [mat, idx] of groups) {
      for (let start = 0; start < idx.length;) {
        // Con textura de esmalte: UV por proyección sobre el eje dominante de cada triángulo (vértices
        // duplicados solo donde cambia el eje).
        const textured = !!MATERIALS[mat].peel, remap = new Map(), local = [], P = mesh.positions;
        let t = start;
        for (; t < idx.length && remap.size < 65520; t += 3) {
          let axis = 3;
          if (textured) {
            const [a, b2, c2] = [idx[t], idx[t + 1], idx[t + 2]];
            const ux = P[b2 * 3] - P[a * 3], uy = P[b2 * 3 + 1] - P[a * 3 + 1], uz = P[b2 * 3 + 2] - P[a * 3 + 2];
            const vx = P[c2 * 3] - P[a * 3], vy = P[c2 * 3 + 1] - P[a * 3 + 1], vz = P[c2 * 3 + 2] - P[a * 3 + 2];
            const fx = Math.abs(uy * vz - uz * vy), fy = Math.abs(uz * vx - ux * vz), fz = Math.abs(ux * vy - uy * vx);
            axis = fx >= fy && fx >= fz ? 0 : fy >= fz ? 1 : 2;
          }
          for (let k = 0; k < 3; k++) {
            const key = idx[t + k] * 4 + axis;
            if (!remap.has(key)) remap.set(key, remap.size);
            local.push(remap.get(key));
          }
        }
        const m = remap.size, Pp = new Float32Array(m * 3), N = new Float32Array(m * 3), C = new Float32Array(m * 3), UV = new Float32Array(m * 2);
        for (const [key, l] of remap) {
          const g = key >> 2, axis = key & 3;
          for (let a = 0; a < 3; a++) { Pp[l * 3 + a] = P[g * 3 + a]; N[l * 3 + a] = mesh.normals[g * 3 + a]; C[l * 3 + a] = colors[g * 3 + a]; }
          const x = P[g * 3], y = P[g * 3 + 1], z = P[g * 3 + 2];
          const [u, v] = axis === 0 ? [z, y] : axis === 1 ? [x, z] : [x, y];
          UV[l * 2] = (u / UV_TILE_MM + UV_OFFSET) / UV_REPEAT; UV[l * 2 + 1] = (v / UV_TILE_MM + UV_OFFSET) / UV_REPEAT;
        }
        const acc = (arr, type) => doc.createAccessor().setType(type).setArray(arr).setBuffer(buffer);
        const prim = doc.createPrimitive().setMaterial(mats[mat]).setAttribute('POSITION', acc(Pp, 'VEC3')).setAttribute('NORMAL', acc(N, 'VEC3'))
          .setAttribute('COLOR_0', acc(C, 'VEC3')).setIndices(acc(Uint16Array.from(local), 'SCALAR'));
        if (textured) prim.setAttribute('TEXCOORD_0', acc(UV, 'VEC2'));
        gMesh.addPrimitive(prim);
        start = t;
      }
    }
    root.addChild(doc.createNode(name).setMesh(gMesh));
  }
  await pool.close();
  const plate = CONFIG[variant].nameplate;
  if (plate) {
    const g = nameplateGeometry(plate), acc = (arr, type) => doc.createAccessor().setType(type).setArray(arr).setBuffer(buffer);
    const mat = mats.placa.setBaseColorTexture(doc.createTexture('placa-identificacion').setImage(await nameplateTexture(plate.lines)).setMimeType('image/png'));
    const prim = doc.createPrimitive().setMaterial(mat).setAttribute('POSITION', acc(g.P, 'VEC3')).setAttribute('NORMAL', acc(g.N, 'VEC3'))
      .setAttribute('TEXCOORD_0', acc(g.UV, 'VEC2')).setIndices(acc(g.I, 'SCALAR'));
    root.addChild(doc.createNode('placa').setMesh(doc.createMesh('placa').addPrimitive(prim)));
  }
  // Materiales sin uso (p. ej. "blanco" en H-ITALY) se eliminan.
  for (const m of doc.getRoot().listMaterials()) if (!m.listParents().some((p) => p.propertyType === 'Primitive')) m.dispose();
  await MeshoptEncoder.ready;
  await doc.transform(reorder({ encoder: MeshoptEncoder, target: 'size' }), quantize({ quantizePosition: 14, quantizeNormal: 12, quantizeColor: 8, quantizeTexcoord: 16 }));
  const file = `public/models/${OUT[variant]}`;
  const base = OUT[variant].replace(/\.glb$/, ''), images = await writePackedGlb(doc, file, base);
  // Texturas propias de compilaciones anteriores que ya no se usan.
  for (const old of fs.readdirSync('public/models')) if (old.startsWith(`${base}-`) && old.endsWith('.png') && !images.includes(old)) fs.rmSync(`public/models/${old}`);
  console.log(`✔ ${file}: ${(fs.statSync(file).size / 1024).toFixed(0)} KB + ${images.join(', ')} en ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

for (const v of variants) await buildVariant(v);
// Texturas compartidas (esmalte) que ya no referencia ningún GLB.
const used = new Set();
for (const glb of Object.values(OUT)) {
  const path = `public/models/${glb}`;
  if (!fs.existsSync(path)) continue;
  const packed = fs.readFileSync(path), json = JSON.parse(packed.subarray(20, 20 + packed.readUInt32LE(12)).toString());
  for (const img of json.images ?? []) if (img.uri) used.add(img.uri);
}
for (const file of fs.readdirSync('public/models')) if (file.startsWith('valvula-esmalte-') && !used.has(file)) fs.rmSync(`public/models/${file}`);
// Estudio fotográfico de fondo blanco, como las fotos de producto: barrido claro y cajas de luz.
// Estudio de producto: entorno gris oscuro y grandes cajas de luz blancas (reflejos nítidos sobre el barniz).
const studio = writeValveStudio('public/models/valvula-estudio-producto.hdr', 1024, 512, {
  ambient: [0.05, 0.07], gain: 0.45,
  extra: [
    { direction: [-0.5, 0.42, 0.75], horizontal: 0.5, vertical: 0.42, radiance: 5.5 },
    { direction: [0.62, 0.3, 0.72], horizontal: 0.34, vertical: 0.5, radiance: 3.2 },
    { direction: [0.95, 0.25, -0.1], horizontal: 0.07, vertical: 0.6, radiance: 34 },
    { direction: [-0.95, 0.25, -0.2], horizontal: 0.07, vertical: 0.6, radiance: 30 },
    { direction: [0.05, 0.97, 0.2], horizontal: 0.35, vertical: 0.12, radiance: 4 },
    { direction: [0, 0.1, -1], horizontal: 0.6, vertical: 0.3, radiance: 1.2 },
    { direction: [0.15, 0.55, 0.82], horizontal: 0.9, vertical: 0.035, radiance: 18 },
    { direction: [-0.1, -0.15, 0.98], horizontal: 0.9, vertical: 0.04, radiance: 10 },
  ],
});
console.log('Estudio HDR', studio);
