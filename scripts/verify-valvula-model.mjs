import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import * as T from 'three';
import { NodeIO } from '@gltf-transform/core';
import { KHRMaterialsClearcoat } from '@gltf-transform/extensions';

// Baseline saved before the user-authorized full exterior update.
const io = new NodeIO().registerExtensions([KHRMaterialsClearcoat]);
const before = await io.read('../output/valvula-realismo/antes.glb');
const after = await io.read('public/models/valvula-compuerta.glb');
const nodes = after.getRoot().listNodes();
const find = (document, name) => document.getRoot().listNodes().find(n => n.getName() === name);
const digest = node => {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify([node.getTranslation(), node.getRotation(), node.getScale()]));
  for (const p of node.getMesh().listPrimitives()) {
    for (const semantic of p.listSemantics()) hash.update(Buffer.from(p.getAttribute(semantic).getArray().buffer));
    hash.update(Buffer.from(p.getIndices().getArray().buffer));
  }
  return hash.digest('hex');
};
const lowerWedge = process.argv.includes('--lower-wedge');
let descent;
if (!lowerWedge) {
  assert.equal(digest(find(after, 'cuna-elastomero-EPDM')), digest(find(before, 'cuna-elastomero-EPDM')),
    'Previously corrected wedge geometry and pose must be preserved');
} else {
  const previous = await io.read('../output/valvula-descenso/antes.glb');
  const lowest = document => {
    const node = find(document, 'cuna-elastomero-EPDM'), p = node.getMesh().listPrimitives()[0].getAttribute('POSITION');
    let min = Infinity;
    for (let i = 0; i < p.getCount(); i++) min = Math.min(min, p.getElement(i, [])[1] + node.getTranslation()[1]);
    return min;
  };
  const oldBottom = lowest(previous), newBottom = lowest(after);
  assert(newBottom < oldBottom - .10, 'Wedge must actually descend by more than 10% of the bore diameter');
  let exteriorNodes = 0;
  for (const node of previous.getRoot().listNodes()) {
    if (!node.getMesh() || node.getName() === 'cuna-elastomero-EPDM') continue;
    // Names repeat for bolts/spokes, so compare the same ordered occurrence.
    const index = previous.getRoot().listNodes().indexOf(node), actual = nodes[index];
    assert.equal(actual.getName(), node.getName());
    assert.equal(digest(actual), digest(node), `Exterior changed: ${node.getName()}`); exteriorNodes++;
  }
  for (const original of previous.getRoot().listMaterials()) {
    if (original.getName() === 'cuna-EPDM-negro') continue;
    const actual = after.getRoot().listMaterials().find(m => m.getName() === original.getName());
    assert.deepEqual(actual.getBaseColorFactor(), original.getBaseColorFactor());
    assert.equal(actual.getRoughnessFactor(), original.getRoughnessFactor());
    assert.equal(actual.getMetallicFactor(), original.getMetallicFactor());
    for (const getter of ['getBaseColorTexture', 'getNormalTexture', 'getMetallicRoughnessTexture']) {
      assert.deepEqual(actual[getter]()?.getImage(), original[getter]()?.getImage(), `Exterior texture changed: ${original.getName()}`);
    }
  }
  descent = { oldBottom, newBottom, fractionOfBoreDiameter: oldBottom - newBottom, exteriorNodesUnchanged: exteriorNodes };
}
for (const [name, expected] of [['brazo-curvo-volante', 3], ['brida-taladrada--1', 1],
  ['brida-taladrada-1', 1], ['perno-hexagonal', 6], ['vastago-pulido', 1]]) {
  assert.equal(nodes.filter(n => n.getName() === name).length, expected, `Product identity: ${name}`);
}

const geometry = node => {
  const p = node.getMesh().listPrimitives()[0], g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(p.getAttribute('POSITION').getArray(), 3));
  if (p.getIndices()) g.setIndex(Array.from(p.getIndices().getArray()));
  return g;
};
let triangleCount = 0, vertexCount = 0, zeroNormals = 0;
for (const mesh of after.getRoot().listMeshes()) for (const primitive of mesh.listPrimitives()) {
  const p = primitive.getAttribute('POSITION'), n = primitive.getAttribute('NORMAL');
  triangleCount += (primitive.getIndices()?.getCount() ?? p.getCount()) / 3; vertexCount += p.getCount();
  for (const attribute of primitive.listAttributes()) assert(attribute.getArray().every(Number.isFinite), `${mesh.getName()}: nonfinite data`);
  if (n) for (let i = 0; i < n.getCount(); i++) {
    const length = Math.hypot(...n.getElement(i, []));
    if (length < 1e-6) zeroNormals++;
    else assert(Math.abs(length - 1) < .02, `${mesh.getName()}: invalid normal`);
  }
  const ids = primitive.getIndices()?.getArray();
  if (ids) assert(ids.every(i => i < p.getCount()), `${mesh.getName()}: invalid index`);
}
assert.equal(zeroNormals, 0, 'All visible vertices must have nonzero normals');
assert(triangleCount < 175000 && vertexCount < 140000, 'Web geometry budget');

// Rays test actual exported meshes, not the generator's hole-count loop.
const holes = [0, 35, 70, 110, 145, 180, 215, 250, 290, 325];
for (const side of [-1, 1]) {
  const node = find(after, `brida-taladrada-${side}`), g = geometry(node);
  const mesh = new T.Mesh(g, new T.MeshBasicMaterial({ side: T.DoubleSide }));
  mesh.position.fromArray(node.getTranslation()); mesh.updateMatrixWorld();
  const hits = (y, z) => new T.Raycaster(new T.Vector3(side * 2, y, z), new T.Vector3(-side, 0, 0)).intersectObject(mesh).length;
  for (const angle of holes) {
    const a = angle * Math.PI / 180;
    assert.equal(hits(.86 * Math.sin(a), -side * .86 * Math.cos(a)), 0, `Blocked flange hole ${side}/${angle}`);
  }
  assert.equal(hits(0, 0), 0, 'Flange bore must be open');
  assert(hits(.99, 0) > 0, 'Flange sealing face must remain solid');
  g.dispose(); mesh.material.dispose();
}

// Signed volumes detect reversed winding on the newly swept/lofted parts.
const volumes = {};
for (const name of ['bonete-redondeado', 'brazo-curvo-volante', 'volante-aro-ondulado']) {
  const g = geometry(find(after, name)), p = g.attributes.position;
  let volume = 0;
  for (let i = 0; i < g.index.count; i += 3) {
    const [a, b, c] = [0, 1, 2].map(k => new T.Vector3().fromBufferAttribute(p, g.index.getX(i + k)));
    volume += a.dot(b.clone().cross(c)) / 6;
  }
  assert(volume > 0, `${name}: reversed winding`); volumes[name] = volume; g.dispose();
}
const extent = document => {
  const box = new T.Box3();
  for (const node of document.getRoot().listNodes()) {
    if (!node.getMesh()) continue;
    const g = geometry(node); g.computeBoundingBox();
    box.union(g.boundingBox.translate(new T.Vector3(...node.getTranslation()))); g.dispose();
  }
  return box.getSize(new T.Vector3()).toArray();
};
const previousExtent = extent(before), currentExtent = extent(after);
assert(currentExtent.every((d, i) => Math.abs(d - previousExtent[i]) < .025), 'Overall dimensions must retain the product proportions');
for (const texture of after.getRoot().listTextures()) assert(texture.getImage()?.length > 0, `Missing texture: ${texture.getURI()}`);
const blue = after.getRoot().listMaterials().find(m => m.getName() === 'epoxi-azul');
assert.equal(blue.getMetallicFactor(), 0, 'Epoxy paint is dielectric');
assert(blue.getNormalTexture() && blue.getMetallicRoughnessTexture(), 'Paint surface maps');
assert(blue.getExtension('KHR_materials_clearcoat').getClearcoatNormalTexture(), 'Paint clearcoat must follow casting relief');
const result = { valid: true, triangleCount, vertexCount, zeroNormals,
  product: { spokes: 3, flangeHoles: [10, 10], bonnetBolts: 6, previousExtent, currentExtent },
  wedgeGeometryAndPoseUnchanged: !lowerWedge, ...(descent ? { descent } : {}), allTextureFilesResolved: true, positiveVolumes: volumes,
  glbBytes: fs.statSync('public/models/valvula-compuerta.glb').size };
fs.writeFileSync(`${lowerWedge ? '../output/valvula-descenso' : '../output/valvula-realismo'}/model-checks.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
