import * as T from 'three';

// Visual proportions from the project's v-01…v-05 photographs, not CAD dimensions.
// Shared geometry is kept independent of materials and export.
export function roundedProfile(points, divisions = 5) {
  const curve = new T.CatmullRomCurve3(points.map(([r, y]) => new T.Vector3(r, y, 0)), false, 'centripetal');
  return curve.getPoints((points.length - 1) * divisions).map(p => new T.Vector2(Math.max(0, p.x), p.y));
}

export function bevelHex(radius, height, bevel = .008) {
  const g = new T.LatheGeometry([
    new T.Vector2(0, -height / 2), new T.Vector2(radius - bevel, -height / 2),
    new T.Vector2(radius, -height / 2 + bevel), new T.Vector2(radius, height / 2 - bevel),
    new T.Vector2(radius - bevel, height / 2), new T.Vector2(0, height / 2),
  ], 6).toNonIndexed();
  // Lathe poles emit zero-area triangles; remove them before computing flat hex normals.
  const valid = [], p = g.attributes.position;
  for (let i = 0; i < p.count; i += 3) {
    const [a, b, c] = [0, 1, 2].map(k => new T.Vector3().fromBufferAttribute(p, i + k));
    if (b.sub(a).cross(c.sub(a)).lengthSq() > 1e-14) valid.push(i, i + 1, i + 2);
  }
  g.setIndex(valid); const clean = g.toNonIndexed(); g.dispose();
  clean.computeVertexNormals(); return clean;
}

export function washer(outer, inner, height) {
  const b = Math.min(.004, height / 4);
  return new T.LatheGeometry([
    [inner, -height / 2], [outer - b, -height / 2], [outer, -height / 2 + b],
    [outer, height / 2 - b], [outer - b, height / 2], [inner, height / 2], [inner, -height / 2],
  ].map(([r, y]) => new T.Vector2(r, y)), 80);
}

// Rounded rectangular casting: ring loft gives continuous shoulders, no flat tent.
export function castBonnet() {
  const curve = new T.CatmullRomCurve3([
    [-.32, .445, .375], [-.295, .491, .419], [-.24, .487, .414],
    [-.13, .455, .392], [0, .402, .348], [.13, .340, .291],
    [.235, .291, .246], [.29, .278, .232], [.32, .262, .218],
  ].map(([y, x, z]) => new T.Vector3(x, y, z)), false, 'centripetal');
  const rings = curve.getPoints(40), sectors = 96, positions = [], uv = [], indices = [];
  for (let j = 0; j < rings.length; j++) {
    const p = rings[j], exponent = 2.7 - .4 * j / (rings.length - 1);
    for (let i = 0; i <= sectors; i++) {
      const a = i / sectors * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      positions.push(p.x * Math.sign(c) * Math.pow(Math.abs(c), 2 / exponent), p.y,
        p.z * Math.sign(s) * Math.pow(Math.abs(s), 2 / exponent));
      uv.push(i / sectors, j / (rings.length - 1));
      if (j && i < sectors) {
        const k = j * (sectors + 1) + i, previous = k - sectors - 1;
        indices.push(previous, k + 1, k, previous, previous + 1, k + 1);
      }
    }
  }
  for (const j of [0, rings.length - 1]) {
    const center = positions.length / 3;
    positions.push(0, rings[j].y, 0); uv.push(.5, .5);
    for (let i = 0; i < sectors; i++) {
      const a = j * (sectors + 1) + i, b = a + 1;
      indices.push(...(j === 0 ? [center, b, a] : [center, a, b]));
    }
  }
  return finish(positions, uv, indices);
}

// Three swept, gently curved cast spokes, with rounded rectangular cross-sections.
export function castSpoke() {
  const path = new T.CubicBezierCurve3(new T.Vector3(.14, -.025, -.01),
    new T.Vector3(.35, -.017, -.11), new T.Vector3(.79, .015, .19), new T.Vector3(.99, .028, .44));
  const rings = 36, sectors = 20, positions = [], uv = [], indices = [];
  for (let j = 0; j <= rings; j++) {
    const t = j / rings, p = path.getPoint(t), tangent = path.getTangent(t);
    const lateral = new T.Vector3(-tangent.z, 0, tangent.x).normalize();
    const vertical = tangent.clone().cross(lateral).normalize();
    const width = .088 + .018 * Math.sin(t * Math.PI) + .025 * t * t;
    for (let i = 0; i <= sectors; i++) {
      const a = i / sectors * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const q = p.clone().addScaledVector(lateral, width * Math.sign(c) * Math.pow(Math.abs(c), .65))
        .addScaledVector(vertical, .047 * Math.sign(s) * Math.pow(Math.abs(s), .65));
      positions.push(q.x, q.y, q.z); uv.push(t, i / sectors);
      if (j && i < sectors) {
        const k = j * (sectors + 1) + i, b = k - sectors - 1;
        indices.push(b, k, k + 1, b, k + 1, b + 1);
      }
    }
  }
  for (const j of [0, rings]) {
    const p = path.getPoint(j / rings), center = positions.length / 3;
    positions.push(p.x, p.y, p.z); uv.push(j / rings, .5);
    for (let i = 0; i < sectors; i++) {
      const a = j * (sectors + 1) + i;
      indices.push(...(j === 0 ? [center, a, a + 1] : [center, a + 1, a]));
    }
  }
  return finish(positions, uv, indices);
}

export function wheelRim() {
  // Flat cast top, generous round-over on both edges; underside has real grip scallops.
  const shape = new T.Shape();
  shape.moveTo(1.045, -.105); shape.lineTo(1.230, -.105);
  shape.quadraticCurveTo(1.270, -.105, 1.270, -.060);
  shape.lineTo(1.270, .070); shape.quadraticCurveTo(1.270, .115, 1.225, .115);
  shape.lineTo(1.055, .115); shape.quadraticCurveTo(1.010, .115, 1.010, .070);
  shape.lineTo(1.010, -.065); shape.quadraticCurveTo(1.010, -.105, 1.045, -.105);
  const g = new T.LatheGeometry(shape.getPoints(7), 144), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), a = Math.atan2(p.getZ(i), p.getX(i));
    if (y < 0) p.setY(i, y + .023 * (1 + Math.cos(a * 18)) * T.MathUtils.smoothstep(-y, 0, .09));
  }
  g.computeVertexNormals(); return g;
}

export function wheelGrip() {
  // Shallow moulded pads visible around the photographed wheel, in the same blue paint.
  const s = new T.Shape(), outer = 1.225, inner = 1.055, halfAngle = .18;
  s.absarc(0, 0, outer, -halfAngle, halfAngle, false);
  s.lineTo(inner * Math.cos(halfAngle), inner * Math.sin(halfAngle));
  s.absarc(0, 0, inner, halfAngle, -halfAngle, true); s.closePath();
  return new T.ExtrudeGeometry(s, { depth: .003, bevelEnabled: true,
    bevelSize: .004, bevelThickness: .004, bevelSegments: 2, curveSegments: 8 });
}

// ExtrudeGeometry's default bevel normals split each small triangle. Analytic normals
// keep circular flange/hole chamfers smooth without smoothing either flat sealing face.
export function smoothFlange(g, holes, depth = .145, bevel = .018) {
  const p = g.attributes.position, n = g.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), radius = Math.hypot(x, y);
    let radial = new T.Vector2(x, y).normalize(), distance = Math.abs(radius - 1.05);
    if (Math.abs(radius - .5) < distance) {
      distance = Math.abs(radius - .5); radial.multiplyScalar(-1);
    }
    for (const [hx, hy] of holes) {
      const dx = x - hx, dy = y - hy, d = Math.abs(Math.hypot(dx, dy) - .094);
      if (d < distance) { distance = d; radial.set(-dx, -dy).normalize(); }
    }
    let side = 1, axis = 0;
    if (z <= -bevel + 1e-5) { side = 0; axis = -1; }
    else if (z >= depth + bevel - 1e-5) { side = 0; axis = 1; }
    else if (z < 0) { const a = (z + bevel) / bevel * Math.PI / 2; side = Math.sin(a); axis = -Math.cos(a); }
    else if (z > depth) { const a = (z - depth) / bevel * Math.PI / 2; side = Math.cos(a); axis = Math.sin(a); }
    n.setXYZ(i, radial.x * side, radial.y * side, axis);
  }
  return g;
}

function finish(positions, uv, indices) {
  for (let i = 0; i < indices.length; i += 3) [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(indices);
  g.computeVertexNormals(); return g;
}
