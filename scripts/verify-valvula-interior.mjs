import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { Document, NodeIO } from '@gltf-transform/core';
import { KHRMaterialsClearcoat } from '@gltf-transform/extensions';
import { createResilientWedge, borePlanes, chamberPlanes } from './valvula-interior.mjs';

const output = '../output/valvula-interior';
const io = new NodeIO().registerExtensions([KHRMaterialsClearcoat]);
const original = await io.read(`${output}/valvula-compuerta-original.glb`);
const current = await io.read('public/models/valvula-compuerta.glb');
const modified = new Set(['cuerpo-paso-real', 'carcasa-fundida']);
const added = new Set(['camara-interior-cuna', 'cuna-elastomero-EPDM']);
const nodeSignature = node => {
  const data = [node.getName(), node.getTranslation(), node.getRotation(), node.getScale()];
  for (const p of node.getMesh()?.listPrimitives() ?? []) {
    const m = p.getMaterial();
    data.push(p.getMode(), m?.getName(), m?.getBaseColorFactor(), m?.getMetallicFactor(), m?.getRoughnessFactor());
    for (const name of p.listSemantics()) {
      const array = p.getAttribute(name).getArray();
      data.push(name, crypto.createHash('sha256').update(Buffer.from(array.buffer, array.byteOffset, array.byteLength)).digest('hex'));
    }
    const index = p.getIndices()?.getArray();
    data.push(index ? crypto.createHash('sha256').update(Buffer.from(index.buffer, index.byteOffset, index.byteLength)).digest('hex') : null);
  }
  return JSON.stringify(data);
};
const before = original.getRoot().listNodes().filter(n => !modified.has(n.getName()));
const after = current.getRoot().listNodes().filter(n => !modified.has(n.getName()) && !added.has(n.getName()));
assert.deepEqual(after.map(nodeSignature), before.map(nodeSignature), 'Exterior nodes must remain byte-identical');
let retainedExteriorTriangles = 0;
function triangles(node) {
  const result = [], translation = node.getTranslation();
  for (const primitive of node.getMesh().listPrimitives()) {
    const p = primitive.getAttribute('POSITION').getArray(), ids = primitive.getIndices()?.getArray();
    for (let i = 0; i < (ids?.length ?? p.length / 3); i += 3) {
      result.push([0, 1, 2].map(k => {
        const id = ids ? ids[i + k] : i + k;
        return [0, 1, 2].map(axis => p[id * 3 + axis] + translation[axis]);
      }));
    }
  }
  return result;
}
const triangleKey = vertices => vertices.map(v => v.map(x => Math.round(x * 1e4)).join(',')).sort().join(';');
for (const [name, planes] of [['carcasa-fundida', borePlanes()], ['cuerpo-paso-real', chamberPlanes]]) {
  const old = original.getRoot().listNodes().find(n => n.getName() === name);
  const updated = current.getRoot().listNodes().find(n => n.getName() === name);
  const preserved = new Set(triangles(updated).map(triangleKey));
  for (const triangle of triangles(old)) {
    if (planes.some(([nx, ny, nz, d]) => triangle.every(([x, y, z]) => nx * x + ny * y + nz * z > d + 1e-5))) {
      assert(preserved.has(triangleKey(triangle)), `Exterior triangle changed: ${name}`);
      retainedExteriorTriangles++;
    }
  }
}
for (const m of original.getRoot().listMaterials()) {
  const actual = current.getRoot().listMaterials().find(v => v.getName() === m.getName());
  assert(actual);
  assert.deepEqual(actual.getBaseColorFactor(), m.getBaseColorFactor());
  assert.equal(actual.getRoughnessFactor(), m.getRoughnessFactor());
  assert.equal(actual.getMetallicFactor(), m.getMetallicFactor());
  const a = actual.getExtension('KHR_materials_clearcoat'), b = m.getExtension('KHR_materials_clearcoat');
  if (b) { assert.equal(a.getClearcoatFactor(), b.getClearcoatFactor()); assert.equal(a.getClearcoatRoughnessFactor(), b.getClearcoatRoughnessFactor()); }
}
const g = createResilientWedge(), p = g.attributes.position, index = g.index;
const edges = new Map();
let signedVolume = 0;
for (let i = 0; i < index.count; i += 3) {
  const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
  for (let j = 0; j < 3; j++) {
    const a = ids[j], b = ids[(j + 1) % 3], key = `${Math.min(a, b)}:${Math.max(a, b)}`;
    const edge = edges.get(key) ?? { count: 0, winding: 0 };
    edge.count++; edge.winding += a < b ? 1 : -1; edges.set(key, edge);
  }
  const [a, b, c] = ids.map(id => [p.getX(id), p.getY(id), p.getZ(id)]);
  signedVolume += (a[0] * (b[1] * c[2] - b[2] * c[1]) + a[1] * (b[2] * c[0] - b[0] * c[2]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
}
assert([...edges.values()].every(e => e.count === 2 && e.winding === 0), 'Wedge must be closed with consistent winding');
assert(signedVolume > 0, 'Wedge normals must face outwards');
for (const a of Object.values(g.attributes)) assert([...a.array].every(Number.isFinite));
for (let i = 0; i < p.count; i++) {
  assert(Math.abs(p.getX(i)) < .21 && Math.abs(p.getZ(i)) < .515 && p.getY(i) < 1.025, 'Wedge must fit chamber');
  if (p.getY(i) < .05) assert(p.getY(i) ** 2 + p.getZ(i) ** 2 < .5 ** 2, 'Lower wedge must fit waterway');
}
const material = current.getRoot().listMaterials().find(m => m.getName() === 'cuna-EPDM-negro');
assert(material && material.getMetallicFactor() === 0 && material.getRoughnessFactor() === .82);
const result = {
  exteriorNodesUnchanged: before.length, retainedExteriorTriangles, originalMaterialsUnchanged: true,
  wedge: { vertices: p.count, triangles: index.count / 3, closedManifold: true, positiveVolume: signedVolume, fitsChamber: true },
  glbBytes: fs.statSync('public/models/valvula-compuerta.glb').size,
  note: 'Visual reconstruction; no certified dimensions. Rear face and thickness are inferred.',
};
fs.writeFileSync(`${output}/geometry-checks.json`, JSON.stringify(result, null, 2));
const isolated = new Document(), buffer = isolated.createBuffer();
const primitive = isolated.createPrimitive().setMaterial(isolated.createMaterial('EPDM-negro')
  .setBaseColorFactor(material.getBaseColorFactor()).setMetallicFactor(0).setRoughnessFactor(.82));
for (const [semantic, attribute, type] of [['POSITION', 'position', 'VEC3'], ['NORMAL', 'normal', 'VEC3'], ['TEXCOORD_0', 'uv', 'VEC2']])
  primitive.setAttribute(semantic, isolated.createAccessor().setType(type).setArray(g.attributes[attribute].array).setBuffer(buffer));
primitive.setIndices(isolated.createAccessor().setType('SCALAR').setArray(index.array).setBuffer(buffer));
isolated.createScene('Cuña aislada para inspección').addChild(isolated.createNode('cuna-elastomero-EPDM')
  .setMesh(isolated.createMesh('cuna-elastomero-EPDM').addPrimitive(primitive)));
await io.write(`${output}/cuna-EPDM.glb`, isolated);
console.log(JSON.stringify(result, null, 2));
g.dispose();
