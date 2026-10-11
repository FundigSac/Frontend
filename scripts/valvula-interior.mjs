import * as T from 'three';

// Visual proportions relative to the existing bore, not millimetres or certified CAD.
// PHOTO-2026-10-10-11-28-26.jpg: raised middle, sloping cheeks, curved lower lip,
// partially raised wedge. The unseen rear face is a symmetric reconstruction.
export function sampleWedge(s, t, { radius = .5, lift = .38, thickness = .13,
  relief = .082 } = {}) {
  const width = radius * (.98 - .13 * T.MathUtils.smoothstep(t, .65, 1));
  const z = s * width;
  const bottom = lift - radius;
  // The photograph has a shallow, broad sealing arc, not a semicircular cap.
  const lower = bottom + radius * .62 * (1 - Math.sqrt(1 - (z / radius) ** 2));
  const upper = radius * 1.82 + .055 * (1 - s * s);
  const y = T.MathUtils.lerp(lower, upper, t);
  const distanceToLip = y - lower;
  const edge = Math.min(1 - Math.abs(s), t * 5, (1 - t) * 5);
  const rounded = T.MathUtils.smoothstep(edge, 0, .14);
  const bossWidth = radius * .45;
  const bossCrossSection = Math.sqrt(Math.max(0, 1 - (z / bossWidth) ** 2));
  const bossBottom = bottom + radius * .22 + radius * .13 * (1 - bossCrossSection);
  const bossSide = 1 - T.MathUtils.smoothstep(Math.abs(z), radius * .34, bossWidth);
  const boss = bossSide * T.MathUtils.smoothstep(y - bossBottom, -.02, .028);
  // Full inclined cheek surfaces meet the vertical boss and the lower seal.
  // Their upper edge follows the oblique shoulders visible in the supplied photo.
  const diagonal = bottom + radius * .24 + .68 * Math.abs(z);
  const flank = T.MathUtils.smoothstep(Math.abs(z), radius * .30, radius * .56);
  const cheek = flank * (1 - T.MathUtils.smoothstep(y - diagonal, -.035, .035))
    * T.MathUtils.smoothstep(distanceToLip, .025, .105);
  const lip = Math.exp(-Math.pow((distanceToLip - radius * .06) / (radius * .045), 2));
  const halfDepth = thickness * (.36 + .12 * t) + rounded *
    (.010 + relief * boss * (.72 + .28 * bossCrossSection) + .034 * cheek + .020 * lip);
  return { z, y, halfDepth, boss, bossSide, cheek, distanceToLip, diagonal };
}

export function createResilientWedge({ segments = 64, ...proportions } = {}) {
  const positions = [], indices = [], uv = [];
  const stride = segments + 1, faceSize = stride * stride;
  for (const side of [1, -1]) {
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      for (let i = 0; i <= segments; i++) {
        const s = 2 * i / segments - 1;
        const { z, y, halfDepth } = sampleWedge(s, t, proportions);
        positions.push(side * halfDepth, y, z);
        uv.push(i / segments, t);
      }
    }
  }
  for (let face = 0; face < 2; face++) {
    const offset = face * faceSize;
    for (let j = 0; j < segments; j++) for (let i = 0; i < segments; i++) {
      const a = offset + j * stride + i, b = a + 1, c = a + stride, d = c + 1;
      if (face === 0) indices.push(a, c, b, b, c, d);
      else indices.push(a, b, c, b, d, c);
    }
  }
  // Shared perimeter vertices: watertight volume with a real back and rounded lip.
  const perimeter = [];
  for (let i = 0; i < segments; i++) perimeter.push(i);
  for (let j = 0; j < segments; j++) perimeter.push(j * stride + segments);
  for (let i = segments; i > 0; i--) perimeter.push(segments * stride + i);
  for (let j = segments; j > 0; j--) perimeter.push(j * stride);
  for (let i = 0; i < perimeter.length; i++) {
    const a = perimeter[i], b = perimeter[(i + 1) % perimeter.length];
    indices.push(a, b, a + faceSize, b, b + faceSize, a + faceSize);
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

export const chamberPlanes = [
  [1, 0, 0, .21], [-1, 0, 0, .21], [0, 1, 0, 1.025],
  [0, -1, 0, -.05], [0, 0, 1, .515], [0, 0, -1, .515],
];

export function borePlanes(radius = .5, segments = 96) {
  // Polygon follows the chords of the existing 96-segment lathed waterway.
  return Array.from({ length: segments }, (_, i) => {
    const angle = (i + .5) * Math.PI * 2 / segments;
    return [0, Math.cos(angle), Math.sin(angle), radius * Math.cos(Math.PI / segments)];
  });
}

// Subtract a convex volume from a surface. Original outside vertices and interpolated
// normals/UVs are retained: no smoothing, scaling or rebuilding of the exterior.
// This clips surfaces only; the existing waterway and added chamber supply cavity walls.
export function subtractInterior(g, planes) {
  const source = g.index ? g.toNonIndexed() : g;
  const attributes = Object.entries(source.attributes);
  const arrays = Object.fromEntries(attributes.map(([name]) => [name, []]));
  const read = i => Object.fromEntries(attributes.map(([name, attr]) =>
    [name, Array.from({ length: attr.itemSize }, (_, k) => attr.array[i * attr.itemSize + k])]));
  const mix = (a, b, t) => Object.fromEntries(attributes.map(([name]) =>
    [name, a[name].map((v, k) => T.MathUtils.lerp(v, b[name][k], t))]));
  const emit = polygon => {
    for (let i = 1; i < polygon.length - 1; i++) {
      const triangle = [polygon[0], polygon[i], polygon[i + 1]];
      const [a, b, c] = triangle.map(v => new T.Vector3(...v.position));
      if (b.sub(a).cross(c.sub(a)).lengthSq() < 1e-18) continue;
      for (const v of triangle) for (const [name] of attributes) arrays[name].push(...v[name]);
    }
  };
  for (let i = 0; i < source.attributes.position.count; i += 3) {
    let remaining = [read(i), read(i + 1), read(i + 2)];
    if (planes.some(([nx, ny, nz, d]) => remaining.every(v =>
      nx * v.position[0] + ny * v.position[1] + nz * v.position[2] > d))) {
      emit(remaining); continue;
    }
    for (const [nx, ny, nz, distance] of planes) {
      if (remaining.length < 3) break;
      const inside = [], outside = [];
      const signed = v => nx * v.position[0] + ny * v.position[1] + nz * v.position[2] - distance;
      for (let k = 0; k < remaining.length; k++) {
        const a = remaining[k], b = remaining[(k + 1) % remaining.length];
        const da = signed(a), db = signed(b);
        (da > 0 ? outside : inside).push(a);
        if ((da > 0) !== (db > 0)) {
          const intersection = mix(a, b, da / (da - db));
          inside.push(intersection); outside.push(intersection);
        }
      }
      emit(outside);
      remaining = inside;
    }
  }
  const result = new T.BufferGeometry();
  for (const [name, attr] of attributes)
    result.setAttribute(name, new T.Float32BufferAttribute(arrays[name], attr.itemSize));
  result.normalizeNormals();
  if (source !== g) source.dispose();
  g.dispose();
  return result;
}

export function createChamber() {
  const g = new T.BoxGeometry(.42, .975, 1.03);
  g.translate(0, .5375, 0);
  // Inner surfaces face the cavity; remove their intersection with the circular bore.
  const index = g.index;
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i); index.setX(i, index.getX(i + 2)); index.setX(i + 2, a);
  }
  g.computeVertexNormals();
  return subtractInterior(g, borePlanes());
}
