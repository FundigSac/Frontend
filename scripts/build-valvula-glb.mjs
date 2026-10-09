// Genera public/models/valvula-compuerta.glb: válvula de compuerta bridada DN100,
// reconstruida a partir de las fotos del producto (bonete cuadrado, volante, latón, etiqueta en brida).
import { Document, NodeIO } from "@gltf-transform/core";
import { KHRMaterialsClearcoat } from "@gltf-transform/extensions";
import sharp from "sharp";
import fs from "node:fs";

const doc = new Document();
const cc = doc.createExtension(KHRMaterialsClearcoat);
const buf = doc.createBuffer();
const scene = doc.createScene("valvula");

const BLUE = doc.createMaterial("epoxi-azul").setBaseColorFactor([0.02, 0.17, 0.72, 1]).setMetallicFactor(0.12).setRoughnessFactor(0.4)
  .setExtension("KHR_materials_clearcoat", cc.createClearcoat().setClearcoatFactor(0.85).setClearcoatRoughnessFactor(0.18));
const STEEL = doc.createMaterial("acero").setBaseColorFactor([0.8, 0.81, 0.84, 1]).setMetallicFactor(1).setRoughnessFactor(0.28);
const BRASS = doc.createMaterial("laton").setBaseColorFactor([0.85, 0.62, 0.2, 1]).setMetallicFactor(1).setRoughnessFactor(0.3);
const DARK = doc.createMaterial("interior").setBaseColorFactor([0.02, 0.02, 0.03, 1]).setMetallicFactor(0.2).setRoughnessFactor(0.8);
const decal = (name) => doc.createMaterial(name).setBaseColorFactor([1, 1, 1, 0.01]).setAlphaMode("BLEND").setRoughnessFactor(0.5).setDoubleSided(true);
const ETIQUETA = decal("etiqueta");
const MARCADO = decal("marcado");

// Relieve fino de fundición con pintura epoxi (piel de naranja), generado por código.
const N = 512;
const rnd = Buffer.alloc(N * N); for (let i = 0; i < rnd.length; i++) rnd[i] = Math.floor(Math.random() * 256);
const h1 = await sharp(rnd, { raw: { width: N, height: N, channels: 1 } }).blur(1.3).raw().toBuffer();
const h2 = await sharp(rnd, { raw: { width: N, height: N, channels: 1 } }).blur(6).raw().toBuffer();
const nrm = Buffer.alloc(N * N * 3);
const H = (x, y) => { const i = ((y + N) % N) * N + ((x + N) % N); return h1[i] * 0.7 + h2[i] * 2.2; };
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const dx = (H(x + 1, y) - H(x - 1, y)) / 255, dy = (H(x, y + 1) - H(x, y - 1)) / 255;
  const n = [-dx * 2.2, -dy * 2.2, 1], l = Math.hypot(...n), o = (y * N + x) * 3;
  nrm[o] = Math.round((n[0] / l * 0.5 + 0.5) * 255); nrm[o + 1] = Math.round((n[1] / l * 0.5 + 0.5) * 255); nrm[o + 2] = Math.round((n[2] / l * 0.5 + 0.5) * 255);
}
const nrmPng = await sharp(nrm, { raw: { width: N, height: N, channels: 3 } }).png().toBuffer();
fs.mkdirSync("public/models", { recursive: true });
fs.writeFileSync("public/models/relieve-fundicion.png", nrmPng);
const NORMAL_TEX = doc.createTexture("relieve-fundicion").setImage(nrmPng).setMimeType("image/png");
BLUE.setNormalTexture(NORMAL_TEX).setNormalScale(1.8);
STEEL.setNormalTexture(NORMAL_TEX).setNormalScale(0.15);

const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };

function lathe(profile, seg = 72) {
  const m = profile.length, segN = [];
  for (let i = 0; i < m - 1; i++) {
    const dr = profile[i + 1][0] - profile[i][0], dy = profile[i + 1][1] - profile[i][1], L = Math.hypot(dr, dy) || 1;
    segN.push([dy / L, -dr / L]);
  }
  const rows = [];
  const push = (p, n, link) => rows.push({ r: p[0], y: p[1], n, link });
  for (let i = 0; i < m; i++) {
    if (i === 0) push(profile[0], segN[0], false);
    else if (i === m - 1) push(profile[i], segN[m - 2], true);
    else {
      const a = segN[i - 1], b = segN[i];
      if (a[0] * b[0] + a[1] * b[1] > 0.7) push(profile[i], norm([a[0] + b[0], a[1] + b[1]]), true);
      else { push(profile[i], a, true); push(profile[i], b, false); }
    }
  }
  const pos = [], nor = [], idx = [], uv = [], W = seg + 1;
  for (const row of rows) for (let j = 0; j <= seg; j++) {
    const a = (j / seg) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    pos.push(row.r * c, row.y, row.r * s); nor.push(row.n[0] * c, row.n[1], row.n[0] * s);
    uv.push((j / seg) * Math.max(1, Math.round(row.r * 6)), row.y * 4);
  }
  for (let k = 1; k < rows.length; k++) {
    if (!rows[k].link) continue;
    for (let j = 0; j < seg; j++) { const a = (k - 1) * W + j, b = k * W + j; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  }
  return { pos, nor, idx, uv };
}

function box(w, h, d) {
  const pos = [], nor = [], idx = [], uv = [];
  const f = [[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[0,0,1],[-1,0,0]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]]];
  const sz = [w / 2, h / 2, d / 2];
  for (const [n, u, v] of f) {
    const b = pos.length / 3;
    for (const [su, sv] of [[-1,-1],[1,-1],[1,1],[-1,1]]) { pos.push(...[0,1,2].map((k) => (n[k] + su * u[k] + sv * v[k]) * sz[k])); nor.push(...n); }
    uv.push(0,0, w*3,0, w*3,h*3, 0,h*3);
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  return { pos, nor, idx, uv };
}

/** Tronco de pirámide (base w0×d0 abajo, w1×d1 arriba). */
function frustum(w0, d0, w1, d1, h) {
  const B = [[-w0/2,0,-d0/2],[w0/2,0,-d0/2],[w0/2,0,d0/2],[-w0/2,0,d0/2]], T = [[-w1/2,h,-d1/2],[w1/2,h,-d1/2],[w1/2,h,d1/2],[-w1/2,h,d1/2]];
  const pos = [], nor = [], idx = [], uv = [];
  const quad = (a, b, c, d) => {
    const k = pos.length / 3; pos.push(...a, ...b, ...c, ...d);
    const u = [b[0]-a[0], b[1]-a[1], b[2]-a[2]], v = [d[0]-a[0], d[1]-a[1], d[2]-a[2]];
    let n = norm([u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]);
    const cx = (a[0]+b[0]+c[0]+d[0])/4, cy = (a[1]+b[1]+c[1]+d[1])/4 - h/2, cz = (a[2]+b[2]+c[2]+d[2])/4;
    const out = n[0]*cx + n[1]*cy + n[2]*cz > 0;
    if (!out) n = n.map((x) => -x);
    for (let i = 0; i < 4; i++) nor.push(...n);
    for (const p of [a, b, c, d]) uv.push((p[0] + p[2]) * 3, p[1] * 3);
    idx.push(...(out ? [k, k+1, k+2, k, k+2, k+3] : [k, k+2, k+1, k, k+3, k+2]));
  };
  quad(B[0], B[1], T[1], T[0]); quad(B[1], B[2], T[2], T[1]); quad(B[2], B[3], T[3], T[2]); quad(B[3], B[0], T[0], T[3]); quad(T[0], T[1], T[2], T[3]);
  return { pos, nor, idx, uv };
}

const nut = (r, h) => lathe([[0, 0], [r, 0], [r * 1.02, h * 0.12], [r * 1.02, h * 0.88], [r, h], [0, h]], 6);

/** Plano con UV. axis "x": normal +x (derecha en pantalla = -z). axis "z": normal +z (derecha = +x). */
function plane(axis, at, w, h, cy) {
  const pos = [], nor = [], uv = [];
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    if (axis === "x") { pos.push(at, cy + b * h / 2, -a * w / 2); nor.push(1, 0, 0); }
    else { pos.push(a * w / 2, cy + b * h / 2, at); nor.push(0, 0, 1); }
    uv.push((a + 1) / 2, 1 - (b + 1) / 2);
  }
  return { pos, nor, uv, idx: axis === "x" ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3] };
}

function addMesh(parent, name, g, material, t = [0, 0, 0], rot = null) {
  const prim = doc.createPrimitive()
    .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(new Float32Array(g.pos)).setBuffer(buf))
    .setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(new Float32Array(g.nor)).setBuffer(buf))
    .setIndices(doc.createAccessor().setType("SCALAR").setArray(new Uint32Array(g.idx)).setBuffer(buf))
    .setMaterial(material);
  if (g.uv) prim.setAttribute("TEXCOORD_0", doc.createAccessor().setType("VEC2").setArray(new Float32Array(g.uv)).setBuffer(buf));
  const node = doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)).setTranslation(t);
  if (rot) node.setRotation(rot);
  parent.addChild(node);
  return node;
}

const root = doc.createNode("valvula");
scene.addChild(root);
const rotZ90 = [0, 0, Math.SQRT1_2, Math.SQRT1_2];
const rotZm90 = [0, 0, -Math.SQRT1_2, Math.SQRT1_2];
const yaw = (a) => [0, Math.sin(a / 2), 0, Math.cos(a / 2)];

// ---- cuerpo y bridas ----
addMesh(root, "tubo", lathe([[0, -1], [0.64, -1], [0.64, 1], [0, 1]]), BLUE, [0, 0, 0], rotZ90);
for (const sx of [-1, 1]) {
  const rot = sx > 0 ? rotZm90 : rotZ90;
  addMesh(root, "brida", lathe([[0, -0.11], [1.05, -0.11], [1.1, -0.06], [1.1, 0.06], [1.05, 0.11], [0, 0.11]]), BLUE, [sx * 0.97, 0, 0], rotZ90);
  addMesh(root, "realce", lathe([[0, 0], [0.78, 0], [0.78, 0.035], [0, 0.035]]), BLUE, [sx * 1.08, 0, 0], rot);
  addMesh(root, "paso", lathe([[0, 0], [0.5, 0], [0.5, 0.012]]), DARK, [sx * 1.118, 0, 0], rot);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    addMesh(root, "agujero", lathe([[0, 0], [0.085, 0], [0.085, 0.012]]), DARK, [sx * 1.083, 0.9 * Math.cos(a), 0.9 * Math.sin(a)], rot);
  }
}
addMesh(root, "etiqueta", plane("x", 1.13, 1.4, 1.4, 0), ETIQUETA);

// ---- carcasa, bonete y cuello ----
addMesh(root, "carcasa", box(1.0, 1.1, 1.0), BLUE, [0, 0.9, 0]);
addMesh(root, "placa-bonete", box(1.5, 0.14, 1.1), BLUE, [0, 1.53, 0]);
for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
  addMesh(root, "refuerzo", lathe([[0, 0], [0.17, 0], [0.17, 0.2], [0.14, 0.24], [0, 0.24]], 32), BLUE, [sx * 0.62, 1.5, sz * 0.42]);
  addMesh(root, "perno", nut(0.1, 0.07), STEEL, [sx * 0.62, 1.74, sz * 0.42]);
}
addMesh(root, "bonete", frustum(1.0, 0.8, 0.6, 0.55, 0.5), BLUE, [0, 1.6, 0]);
addMesh(root, "nervio-bonete", frustum(0.12, 0.55, 0.1, 0.12, 0.14), BLUE, [0, 2.07, 0.12]);
for (const sx of [-1, 1]) addMesh(root, "escuadra", frustum(0.08, 0.5, 0.03, 0.2, 0.45), BLUE, [sx * 0.52, 1.6, 0]);
addMesh(root, "cuello", lathe([[0, 0], [0.32, 0], [0.32, 0.3], [0.26, 0.42], [0, 0.42]], 48), BLUE, [0, 2.1, 0]);
addMesh(root, "tuerca-laton", nut(0.2, 0.15), BRASS, [0, 2.5, 0]);
addMesh(root, "vastago", lathe([[0, 2.45], [0.105, 2.45], [0.105, 3.15], [0, 3.15]], 32), STEEL);
addMesh(root, "marcado", plane("z", 0.503, 0.82, 0.62, 0.85), MARCADO);

// ---- volante con borde ondulado y tres brazos ----
const wy = 3.0;
addMesh(root, "aro", lathe([[1.0, wy - 0.16], [1.28, wy - 0.16], [1.36, wy - 0.08], [1.36, wy + 0.06], [1.28, wy + 0.13], [1.0, wy + 0.13], [0.95, wy + 0.06], [0.95, wy - 0.08], [1.0, wy - 0.16]], 96), BLUE);
for (let i = 0; i < 24; i++) {
  const a = (i / 24) * Math.PI * 2;
  addMesh(root, "onda", lathe([[0, 0], [0.06, 0], [0.06, 0.09], [0, 0.09]], 12), BLUE, [1.33 * Math.cos(a), wy - 0.2, 1.33 * Math.sin(a)]);
}
addMesh(root, "cubo", lathe([[0, wy - 0.12], [0.24, wy - 0.12], [0.24, wy + 0.1], [0, wy + 0.1]], 48), BLUE);
for (let i = 0; i < 3; i++) {
  const a = (i / 3) * Math.PI * 2 + 0.3;
  addMesh(root, "brazo", box(0.82, 0.1, 0.16), BLUE, [0.58 * Math.cos(a), wy - 0.02, -0.58 * Math.sin(a)], yaw(a));
}
addMesh(root, "tuerca-volante", nut(0.12, 0.11), STEEL, [0, wy + 0.1, 0]);

root.setTranslation([0, -1.55, 0]);
root.setScale([0.9, 0.9, 0.9]);

// ---- texturas de las calcomanías (el visor las aplica al cargar el modelo) ----
fs.mkdirSync("public/models", { recursive: true });
const etiqueta = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><clipPath id="c"><circle cx="512" cy="512" r="468"/></clipPath></defs>
<circle cx="512" cy="512" r="505" fill="#2a1a14"/><circle cx="512" cy="512" r="478" fill="#7a4a3a"/><circle cx="512" cy="512" r="468" fill="#f6f6f6"/>
<g clip-path="url(#c)" font-family="Arial,Helvetica,sans-serif" font-weight="800" text-anchor="middle">
<rect x="60" y="300" width="130" height="14" rx="7" fill="#b3231f"/><rect x="834" y="300" width="130" height="14" rx="7" fill="#b3231f"/>
<text x="512" y="340" font-size="132" fill="#1a1a1a">H-IT<tspan fill="#c8261f">ALY</tspan></text>
<text x="512" y="560" font-size="170" fill="#111">DN100</text><text x="512" y="740" font-size="200" fill="#111">4"</text>
<text x="512" y="880" font-size="52" font-weight="700" fill="#222" font-family="Georgia,serif">PUMP VALVE APPROPRIATE</text></g></svg>`;
await sharp(Buffer.from(etiqueta)).png().toFile("public/models/etiqueta-hitaly.png");
const marcado = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="620"><g font-family="Arial,Helvetica,sans-serif" font-weight="800" text-anchor="middle">
<text x="410" y="200" font-size="170" fill="#0a2a7a" opacity=".85">DN100</text><text x="410" y="380" font-size="170" fill="#0a2a7a" opacity=".85">PN16</text><text x="410" y="560" font-size="170" fill="#0a2a7a" opacity=".85">GGG50</text></g></svg>`;
await sharp(Buffer.from(marcado)).png().toFile("public/models/marcado-cuerpo.png");

await new NodeIO().registerExtensions([KHRMaterialsClearcoat]).write("public/models/valvula-compuerta.glb", doc);
console.log("ok");
