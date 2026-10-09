// Genera public/models/valvula-compuerta.glb: válvula de compuerta bridada (modelo paramétrico detallado).
import { Document, NodeIO } from "@gltf-transform/core";
import { KHRMaterialsClearcoat } from "@gltf-transform/extensions";
import sharp from "sharp";

const doc = new Document();
const clearcoat = doc.createExtension(KHRMaterialsClearcoat);
const buf = doc.createBuffer();
const scene = doc.createScene("valvula");

// ---------- materiales ----------
const paint = (name, rgb) =>
  doc.createMaterial(name).setBaseColorFactor([...rgb, 1]).setMetallicFactor(0.18).setRoughnessFactor(0.34)
    .setExtension("KHR_materials_clearcoat", clearcoat.createClearcoat().setClearcoatFactor(1).setClearcoatRoughnessFactor(0.12));
const BLUE = paint("epoxico-azul", [0.02, 0.15, 0.68]);
const STEEL = doc.createMaterial("acero").setBaseColorFactor([0.78, 0.79, 0.82, 1]).setMetallicFactor(1).setRoughnessFactor(0.24);
const DARK = doc.createMaterial("interior").setBaseColorFactor([0.02, 0.02, 0.025, 1]).setMetallicFactor(0.3).setRoughnessFactor(0.7);

// ---------- geometría ----------
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };

/** Sólido de revolución alrededor de Y. profile = [[radio, y], ...] ordenado de abajo hacia arriba. */
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
  const pos = [], nor = [], idx = [], W = seg + 1;
  for (const row of rows) for (let j = 0; j <= seg; j++) {
    const a = (j / seg) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    pos.push(row.r * c, row.y, row.r * s); nor.push(row.n[0] * c, row.n[1], row.n[0] * s);
  }
  for (let k = 1; k < rows.length; k++) {
    if (!rows[k].link) continue;
    for (let j = 0; j < seg; j++) {
      const a = (k - 1) * W + j, b = k * W + j;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  return { pos, nor, idx };
}

function torus(R, r, seg = 72, tube = 24) {
  const pos = [], nor = [], idx = [];
  for (let i = 0; i <= seg; i++) for (let j = 0; j <= tube; j++) {
    const u = (i / seg) * Math.PI * 2, v = (j / tube) * Math.PI * 2;
    pos.push((R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u));
    nor.push(Math.cos(v) * Math.cos(u), Math.sin(v), Math.cos(v) * Math.sin(u));
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < tube; j++) {
    const a = i * (tube + 1) + j, b = a + tube + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  return { pos, nor, idx };
}

function box(w, h, d) {
  const pos = [], nor = [], idx = [];
  const f = [[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[0,0,1],[-1,0,0]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]]];
  const sz = [w / 2, h / 2, d / 2];
  for (const [n, u, v] of f) {
    const b = pos.length / 3;
    for (const [su, sv] of [[-1,-1],[1,-1],[1,1],[-1,1]]) { pos.push(...[0,1,2].map((k) => (n[k] + su * u[k] + sv * v[k]) * sz[k])); nor.push(...n); }
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  return { pos, nor, idx };
}

/** Tuerca hexagonal con chaflán. */
const nut = (r = 0.07, h = 0.08) => lathe([[0, 0], [r, 0], [r * 1.02, h * 0.12], [r * 1.02, h * 0.88], [r, h], [0, h]], 6);
/** Parche cilíndrico con UV para el logotipo grabado. */
function patch(radius, y0, y1, a0, a1, nu = 24) {
  const pos = [], nor = [], uv = [], idx = [];
  for (let i = 0; i <= nu; i++) for (const [k, y] of [[0, y1], [1, y0]]) {
    const a = a0 + ((a1 - a0) * i) / nu;
    pos.push(radius * Math.sin(a), y, radius * Math.cos(a)); nor.push(Math.sin(a), 0, Math.cos(a)); uv.push(i / nu, k);
  }
  for (let i = 0; i < nu; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  return { pos, nor, uv, idx };
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

const rotZ90 = [0, 0, Math.SQRT1_2, Math.SQRT1_2];
const yaw = (a) => [0, Math.sin(a / 2), 0, Math.cos(a / 2)];
const root = doc.createNode("valvula");
scene.addChild(root);

// ---------- cuerpo horizontal con bridas (eje del lathe = X tras girar) ----------
const body = [];
const left = [[0, -1.12], [0.62, -1.12], [0.62, -1.085], [0.93, -1.085], [0.96, -1.07], [0.96, -0.93], [0.93, -0.915], [0.68, -0.915], [0.58, -0.82], [0.53, -0.7], [0.52, -0.5]];
for (const [r, t] of left) body.push([r, t]);
for (const [r, t] of [...left].reverse()) body.push([r, -t]);
addMesh(root, "cuerpo", lathe(body.map(([r, t]) => [r, t])), BLUE, [0, 0, 0], rotZ90);

for (const sx of [-1, 1]) {
  addMesh(root, "pasaje", lathe([[0, 0], [0.4, 0], [0.4, 0.012]]), DARK, [sx * 1.123, 0, 0], sx > 0 ? [0, 0, -Math.SQRT1_2, Math.SQRT1_2] : rotZ90);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    addMesh(root, "agujero", lathe([[0, 0], [0.062, 0], [0.062, 0.012]]), DARK, [sx * 1.0885 + sx * 0.005, 0.78 * Math.cos(a), 0.78 * Math.sin(a)], sx > 0 ? [0, 0, -Math.SQRT1_2, Math.SQRT1_2] : rotZ90);
  }
}

// ---------- cuello, bonete y yugo ----------
addMesh(root, "cuello", lathe([[0, 0.2], [0.5, 0.2], [0.5, 0.78], [0.56, 0.9], [0.56, 0.96]]), BLUE);
addMesh(root, "brida-bonete", lathe([[0, 0.96], [0.84, 0.96], [0.86, 0.985], [0.86, 1.095], [0.84, 1.12], [0.7, 1.12]]), BLUE);
addMesh(root, "brida-cuello", lathe([[0.6, 0.78], [0.76, 0.78], [0.82, 0.86], [0.82, 0.96]]), BLUE);
addMesh(root, "tapa", lathe([[0.7, 1.12], [0.7, 1.2], [0.62, 1.34], [0.52, 1.5], [0.36, 1.6], [0.3, 1.62], [0.3, 1.8], [0.26, 1.82], [0.26, 1.9], [0, 1.9]]), BLUE);
addMesh(root, "anillo-tapa", lathe([[0.62, 1.34], [0.64, 1.34], [0.64, 1.38], [0.62, 1.38]]), BLUE);

// tornillería de la brida del bonete (cabeza arriba, tuerca abajo)
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2;
  const x = 0.74 * Math.cos(a), z = 0.74 * Math.sin(a);
  addMesh(root, "tuerca", nut(0.075, 0.085), STEEL, [x, 1.12, z]);
  addMesh(root, "espiga", lathe([[0, 0], [0.032, 0], [0.032, 0.07]]), STEEL, [x, 1.205, z]);
  addMesh(root, "tuerca-baja", nut(0.075, 0.085), STEEL, [x, 0.875, z]);
}

// ---------- vástago, prensaestopas y volante ----------
const wheelY = 2.34;
addMesh(root, "vastago", lathe([[0, 1.9], [0.075, 1.9], [0.075, wheelY + 0.18], [0, wheelY + 0.18]], 32), STEEL);
addMesh(root, "buje", lathe([[0, wheelY - 0.12], [0.2, wheelY - 0.12], [0.2, wheelY + 0.09], [0.1, wheelY + 0.09], [0, wheelY + 0.09]], 48), BLUE);
addMesh(root, "tuerca-vastago", nut(0.11, 0.1), STEEL, [0, wheelY + 0.09, 0]);
addMesh(root, "volante", torus(0.9, 0.06), BLUE, [0, wheelY, 0]);
addMesh(root, "volante-interior", torus(0.82, 0.03), BLUE, [0, wheelY - 0.005, 0]);
const SP = 6;
for (let i = 0; i < SP; i++) {
  const a = (i / SP) * Math.PI * 2;
  addMesh(root, "radio", box(0.78, 0.06, 0.09), BLUE, [0.51 * Math.cos(a), wheelY, -0.51 * Math.sin(a)], yaw(a));
}

// ---------- logotipo grabado (calcomanía curva en el cuello) ----------
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="320">
  <g font-family="Arial, Helvetica, sans-serif" font-weight="800" text-anchor="middle">
    <text x="514" y="152" font-size="132" fill="#05143f" opacity=".55">FUNDIGSAC</text>
    <text x="512" y="148" font-size="132" fill="#d6e2f2">FUNDIGSAC</text>
    <text x="514" y="288" font-size="100" fill="#05143f" opacity=".55">DN100 PN16</text>
    <text x="512" y="284" font-size="100" fill="#cfdcee">DN100 PN16</text>
  </g></svg>`;
const png = await sharp(Buffer.from(svg)).png().toBuffer();
(await import("node:fs")).writeFileSync("public/models/logo-fundigsac.png", png);
const DECAL = doc.createMaterial("logo").setBaseColorFactor([1, 1, 1, 0.01]).setAlphaMode("BLEND").setMetallicFactor(0.1).setRoughnessFactor(0.4).setDoubleSided(true);
addMesh(root, "logo", patch(0.504, 0.4, 0.72, -0.62, 0.62), DECAL);

root.setTranslation([0, -1.15, 0]);
await new NodeIO().registerExtensions([KHRMaterialsClearcoat]).write("public/models/valvula-compuerta.glb", doc);
console.log("ok");
