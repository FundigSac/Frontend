// Funciones de distancia con signo (SDF) para piezas fundidas, en milímetros.
// Convención: Y hacia arriba, X = eje de la tubería, Z = ancho de la cuña.
// Las uniones redondeadas imitan los radios de fundición y el espesor del esmalte epoxi.

export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
export const mix = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Unión con filete circular de radio r (hg_sdf fOpUnionRound). */
export function unionRound(a, b, r) {
  if (r <= 0) return Math.min(a, b);
  const ux = Math.max(r - a, 0), uy = Math.max(r - b, 0);
  return Math.max(r, Math.min(a, b)) - Math.hypot(ux, uy);
}
/** Intersección con arista redondeada de radio r. */
export function intersectRound(a, b, r) {
  if (r <= 0) return Math.max(a, b);
  const ux = Math.max(r + a, 0), uy = Math.max(r + b, 0);
  return Math.min(-r, Math.max(a, b)) + Math.hypot(ux, uy);
}
/** Resta (a menos b) con arista redondeada. */
export const subtractRound = (a, b, r) => intersectRound(a, -b, r);
/** Unión suave polinómica (para formas orgánicas, no para filetes precisos). */
export function smin(a, b, k) {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
export const smax = (a, b, k) => -smin(-a, -b, k);

// ---------- 2D ----------
export function sdRoundRect2(x, y, hx, hy, r) {
  const qx = Math.abs(x) - hx + r, qy = Math.abs(y) - hy + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
/** Rectángulo redondeado tipo "superelipse" suave: radios de esquina grandes sin tramos planos rígidos. */
export function sdCircle2(x, y, r) { return Math.hypot(x, y) - r; }
export function sdSegment2(px, py, ax, ay, bx, by) {
  const pax = px - ax, pay = py - ay, bax = bx - ax, bay = by - ay;
  const h = clamp((pax * bax + pay * bay) / (bax * bax + bay * bay), 0, 1);
  return Math.hypot(pax - bax * h, pay - bay * h);
}
/** Trapecio isósceles (iq): semiancho inferior r1, superior r2, semialtura he, centrado en el origen. */
export function sdTrapezoid2(px, py, r1, r2, he) {
  const k1x = r2, k1y = he, k2x = r2 - r1, k2y = 2 * he;
  px = Math.abs(px);
  const cax = px - Math.min(px, py < 0 ? r1 : r2), cay = Math.abs(py) - he;
  const t = clamp(((k1x - px) * k2x + (k1y - py) * k2y) / (k2x * k2x + k2y * k2y), 0, 1);
  const cbx = px - k1x + k2x * t, cby = py - k1y + k2y * t;
  const s = cbx < 0 && cay < 0 ? -1 : 1;
  return s * Math.sqrt(Math.min(cax * cax + cay * cay, cbx * cbx + cby * cby));
}
/** Polígono cerrado arbitrario (lista [[x,y],...]), distancia exacta con signo por paridad. */
export function sdPolygon2(px, py, pts) {
  let d = Infinity, s = 1;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i, i++) {
    const [ax, ay] = pts[j], [bx, by] = pts[i];
    const ex = bx - ax, ey = by - ay, wx = px - ax, wy = py - ay;
    const h = clamp((wx * ex + wy * ey) / (ex * ex + ey * ey), 0, 1);
    const dx = wx - ex * h, dy = wy - ey * h;
    d = Math.min(d, dx * dx + dy * dy);
    const c1 = py >= ay, c2 = py < by, c3 = ex * wy > ey * wx;
    if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
  }
  return s * Math.sqrt(d);
}

// ---------- 3D ----------
export function sdBox(x, y, z, hx, hy, hz, r = 0) {
  const qx = Math.abs(x) - hx + r, qy = Math.abs(y) - hy + r, qz = Math.abs(z) - hz + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
}
export function sdSphere(x, y, z, r) { return Math.hypot(x, y, z) - r; }
/** Cilindro de radio r y semialtura h a lo largo de un eje (radial = distancia al eje), aristas redondeadas rr. */
export function sdCylinderAxis(radial, axial, r, h, rr = 0) {
  const dx = radial - r + rr, dy = Math.abs(axial) - h + rr;
  return Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) - rr;
}
export const sdCylY = (x, y, z, r, h, rr = 0) => sdCylinderAxis(Math.hypot(x, z), y, r, h, rr);
export const sdCylX = (x, y, z, r, h, rr = 0) => sdCylinderAxis(Math.hypot(y, z), x, r, h, rr);
export const sdCylZ = (x, y, z, r, h, rr = 0) => sdCylinderAxis(Math.hypot(x, y), z, r, h, rr);
/** Extrusión de una distancia 2D d2 a lo largo de w con semiespesor h y redondeo rr. */
export function extrude(d2, w, h, rr = 0) {
  const ax = d2 + rr, ay = Math.abs(w) - h + rr;
  return Math.min(Math.max(ax, ay), 0) + Math.hypot(Math.max(ax, 0), Math.max(ay, 0)) - rr;
}
/** Cápsula entre dos puntos. */
export function sdCapsule(x, y, z, ax, ay, az, bx, by, bz, r) {
  const pax = x - ax, pay = y - ay, paz = z - az, bax = bx - ax, bay = by - ay, baz = bz - az;
  const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz), 0, 1);
  return Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - r;
}
/** Cápsula de radio variable (iq sdRoundCone por segmento). */
export function sdRoundCone(x, y, z, ax, ay, az, bx, by, bz, r1, r2) {
  const bax = bx - ax, bay = by - ay, baz = bz - az;
  const l2 = bax * bax + bay * bay + baz * baz, rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  const pax = x - ax, pay = y - ay, paz = z - az;
  const yy = pax * bax + pay * bay + paz * baz, z0 = yy - l2;
  const qx = pax * l2 - bax * yy, qy = pay * l2 - bay * yy, qz = paz * l2 - baz * yy;
  const x2 = qx * qx + qy * qy + qz * qz, y2 = yy * yy * l2, z2 = z0 * z0 * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(z0) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
  if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
  return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
}
export function sdTorusY(x, y, z, R, r) { return Math.hypot(Math.hypot(x, z) - R, y) - r; }
/** Elipsoide (aproximación de iq, buena cerca de la superficie). */
export function sdEllipsoid(x, y, z, rx, ry, rz) {
  const k0 = Math.hypot(x / rx, y / ry, z / rz), k1 = Math.hypot(x / (rx * rx), y / (ry * ry), z / (rz * rz));
  return k1 === 0 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
}
/** Hexágono 2D (distancia entre caras = 2*r). */
export function sdHexagon2(px, py, r) {
  const kx = -0.866025404, ky = 0.5, kz = 0.577350269;
  px = Math.abs(px); py = Math.abs(py);
  const d = 2 * Math.min(kx * px + ky * py, 0);
  px -= d * kx; py -= d * ky;
  px -= clamp(px, -kz * r, kz * r); py -= r;
  return Math.hypot(px, py) * Math.sign(py);
}

/** Muestreo bilineal de un campo 2D de distancias (Float32Array w*h, mm), con origen y paso en mm. */
export function sampleField(field, u, v) {
  const { data, w, h, u0, v0, step, far } = field;
  let fx = (u - u0) / step, fy = (v - v0) / step, extra = 0;
  if (fx < 0 || fy < 0 || fx > w - 1.001 || fy > h - 1.001) {
    // Fuera del lienzo: valor del borde más la distancia hasta el borde (el lienzo tiene margen sin tinta).
    const cx = clamp(fx, 0, w - 1.001), cy = clamp(fy, 0, h - 1.001);
    extra = Math.hypot(fx - cx, fy - cy) * step; fx = cx; fy = cy;
  }
  const ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy, i = iy * w + ix;
  if (extra > 0) {
    const a = data[i], b = data[i + 1], c = data[i + w], d = data[i + w + 1];
    return Math.max(far, (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty + extra);
  }
  const a = data[i], b = data[i + 1], c = data[i + w], d = data[i + w + 1];
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
}
