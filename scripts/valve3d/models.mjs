// Geometría SDF de las tres válvulas de compuerta DN100 PN16 (milímetros).
// Ejes: Y arriba, X = eje de la tubería (L = 190 entre caras, DIN3202 F4), Z = ancho de la cuña.
// Medidas de las fichas FT-HI-100 / FT-HD 002-2024 (brida EN1092-2 PN16, H = 335 al volante, volante Ø250)
// y proporciones medidas en las fotos de cada galería, corregidas por la perspectiva de la cámara.
import { fileURLToPath } from 'node:url';
import * as S from './sdf.mjs';

const { unionRound: U, intersectRound: I, subtractRound: D, extrude, sampleField, smoothstep, mix, clamp } = S;

// ---------- Brida EN1092-2 DN100 PN16 y paso ----------
const L2 = 95, FL_T = 16, RF_H = 3, FL_R = 110, RF_R = 78, PCD = 90, HOLE = 9.5, BORE = 50;
const NECK_R = 60, DRUM_R = 65, DRUM_X = 64;
const SEAM = 72, GASKET = 1.4, BONNET_T = 12.6, Y_BONNET = SEAM + GASKET + BONNET_T;

export const CONFIG = {
  hitaly: {
    bolts: [[-55, -71], [55, -71], [-62, 0], [62, 0], [-55, 71], [55, 71]],
    plate: { hx: 60, hz: 82, r: 20, boss: 13 },
    bossTop: 98,
    nose: { hxTop: 35, hxBottom: 24 },
    bonnet: 'hitaly', domeTop: 160, neckTop: 206,
    operator: 'handwheel', wheel: { y: 266, R: 125, h: 30 },
    textFront: { lines: [{ text: 'H-ITALY', height: 10, tracking: 0.1 }], y: 30, relief: 1.0 },
    textBack: { lines: [{ text: 'DN100', height: 10.4 }, { text: 'PN16', height: 10.4 }, { text: 'GGG50', height: 10.4 }], gap: 3.4, y: 14, relief: 1.0 },
    wheelText: { open: 'OPEN', close: 'CLOSE', openAt: 0, closeAt: Math.PI },
    // Placa de aluminio negro remachada en el canto superior de la brida (v-01, v-02).
    nameplate: { side: -1, angle: 0.62, length: 52, width: 13.5, R: 110, lines: [['H-ITALY', 170], ['GATE VALVE  DN100  PN16', 110], ['GGG50   EN1074-2', 110]] },
  },
  fundigsac: {
    bolts: [[-45, -76], [45, -76], [-45, 76], [45, 76]],
    plate: { hx: 57, hz: 89, r: 22, boss: 13 },
    bossTop: 100,
    nose: { hxTop: 39, hxBottom: 28.5 },
    bonnet: 'fundig4', domeTop: 178, neckTop: 234,
    operator: 'handwheel', wheel: { y: 268, R: 125, h: 30 },
    textFront: { logo: 30, logoWide: 1.3, logoY: 33, lines: [{ text: 'FUNDIG', height: 10.5, tracking: 0.1 }, { text: 'SAC', height: 10.5, tracking: 0.1 }], gap: 2.8, y: -10, relief: 1.0 },
    textBack: { lines: [{ text: 'DN100', height: 10.4 }, { text: 'PN16', height: 10.4 }, { text: 'GGG50', height: 10.4 }], gap: 3.4, y: 14, relief: 1.0 },
    // f-03 (vista superior, eje del tubo horizontal): CLOSE arriba (−Z), OPEN abajo a la izquierda.
    wheelText: { open: 'OPEN', close: 'CLOSE', openAt: Math.PI * 0.75, closeAt: -Math.PI * 0.42 },
  },
  cuadrante: {
    bolts: [[-47, -74], [47, -74], [-61, 0], [61, 0], [-47, 74], [47, 74]],
    plate: { hx: 59, hz: 87, r: 22, boss: 13 },
    bossTop: 110,
    nose: { hxTop: 40, hxBottom: 28.5 },
    // Cuello 20 mm más bajo que en la primera versión: con el dado arriba la válvula mide H = 335 (FT-HD, DN100).
    bonnet: 'fundig6', domeTop: 158, neckTop: 210,
    operator: 'cap', cap: { y0: 252, yF: 266, yT: 335 },
    textFront: { logo: 28, logoWide: 1.3, logoY: 42, lines: [{ text: 'FundigSac', height: 10.6 }, { text: '0721124', height: 10.6 }, { text: 'DN500-7', height: 10.6 }], gap: 3.4, y: -8, relief: 1.0 },
    textBack: { lines: [{ text: 'DN100', height: 10 }, { text: 'PN16/10', height: 10 }, { text: 'GGG50', height: 10 }], gap: 3.2, y: 14, relief: 1.0 },
    bonnetText: ['DN100', 'QT450'],
  },
};

// ---------- utilidades ----------
const plateOutline = (c, x, z) => {
  let d = S.sdRoundRect2(x, z, c.plate.hx, c.plate.hz, c.plate.r);
  for (const [bx, bz] of c.bolts) d = S.smin(d, Math.hypot(x - bx, z - bz) - c.plate.boss, 10);
  return d;
};
/** Relieve plano: campo 2D (u,v) extruido desde la cara (w = distancia hacia fuera). */
const relief = (field, u, v, w, h) => extrude(sampleField(field, u, v), w - (h - 3) / 2, (h + 3) / 2, 0.22);
/** Relieve en contorno (logotipo fundido como líneas). */
const reliefOutline = (field, u, v, w, h, half) => extrude(Math.abs(sampleField(field, u, v)) - half, w - (h - 3) / 2, (h + 3) / 2, 0.22);

// ---------- cuerpo ----------
const NOSE = { hz: 74, top: 64, bottom: -75 };
function bodySdf(c, F) {
  const NX = c.nose;
  const cavity = (x, y, z) => I(S.sdRoundRect2(z, y - 16, 64, 76, y < 16 ? 62 : 4), Math.abs(x) - 22, 2);
  // Nariz del cuerpo: prisma de caras planas que se estrecha hacia abajo (v-01, v-02, f-07, q-01).
  const nose = (x, y, z) => {
    const cy = (NOSE.top + NOSE.bottom) / 2, hy = (NOSE.top - NOSE.bottom) / 2;
    const yz = S.sdRoundRect2(z, y - cy, NOSE.hz, hy, y < cy ? 30 : 6);
    const hx = mix(NX.hxBottom, NX.hxTop, (y - NOSE.bottom) / (NOSE.top - NOSE.bottom));
    return I(yz, (Math.abs(x) - hx) * 0.996, 4.5);
  };
  return (x, y, z) => {
    const ax = Math.abs(x), r = Math.hypot(y, z);
    // Cota rápida: cuerpo central hasta la junta y las dos bridas completas (Ø220, sin recorte superior).
    const box = Math.min(S.sdBox(x, y - (SEAM - 112) / 2, z, L2 + 1, (SEAM + 112) / 2 + 1, 114), S.sdCylinderAxis(r, ax - (L2 - 11), FL_R + 2, 12));
    if (box > 4) return box;
    // Bridas con resalte, estrías y 8 taladros Ø19 en Ø180.
    const xc = L2 - RF_H - FL_T / 2;
    let fl = S.sdCylinderAxis(r, ax - xc, FL_R, FL_T / 2, 1.8);
    fl = U(fl, S.sdCylinderAxis(r, ax - (L2 - RF_H / 2 - 1), RF_R, RF_H / 2 + 1, 0.8), 0.8);
    if (ax > L2 - 3 && r > 54 && r < 77) for (const rk of [61, 67.5, 74]) fl = D(fl, Math.hypot(r - rk, (ax - L2) * 1.8) - 1.1, 0.4);
    const ang = Math.atan2(z, y), k = Math.round((ang - Math.PI / 8) / (Math.PI / 4)), a = Math.PI / 8 + k * Math.PI / 4;
    fl = D(fl, Math.hypot(y - PCD * Math.cos(a), z - PCD * Math.sin(a)) - HOLE, 1.2);
    // Cuellos junto a las bridas y tambor central.
    const neck = S.sdCylX(x, y, z, NECK_R, L2 - RF_H - FL_T + 2);
    const drum = S.sdCylX(x, y, z, DRUM_R, DRUM_X, 6);
    let d = U(fl, U(neck, drum, 5), 9);
    d = U(d, nose(x, y, z), 8);
    const plate = extrude(plateOutline(c, x, z), y - (SEAM - 6), 6, 1.8);
    d = U(d, plate, 7);
    for (const [bx, bz] of c.bolts) d = U(d, S.sdCylY(x - bx, y - (SEAM - 13), z - bz, 10.5, 6, 3), 4);
    // Marcado fundido en las caras de la nariz (z = ±74).
    if (Math.abs(z) > NOSE.hz - 4 && Math.abs(z) < NOSE.hz + 3 && ax < 40) {
      const front = z > 0, w = Math.abs(z) - NOSE.hz, u = front ? x : -x, t = front ? c.textFront : c.textBack;
      let rel = relief(front ? F.front : F.back, u, y - t.y, w, t.relief);
      if (front && F.logo) rel = Math.min(rel, reliefOutline(F.logo, u, y - c.textFront.logoY, w, t.relief, 0.45));
      d = U(d, rel, 0.3);
    }
    d = D(d, r - BORE, 1.2);
    d = D(d, cavity(x, y, z), 1.5);
    return d;
  };
}

// ---------- bonetes ----------
function domeFor(c) {
  const y1 = Y_BONNET, top = c.domeTop, nt = c.neckTop;
  if (c.bonnet === 'hitaly') {
    // Paredes casi verticales, hombro redondeado y meseta ancha (v-01, v-04); nervio en las caras X.
    return (x, y, z) => {
      const t = clamp((y - y1) / (top - y1), 0, 1);
      // Campana: se estrecha hacia arriba con esquinas en planta de radio grande.
      const hx = mix(46, 33, t * (0.6 + 0.4 * t)), hz = mix(66, 41, t);
      let d = I(S.sdRoundRect2(x, z, hx, hz, mix(33, 27, t)) * 0.95, y - top, 16);
      d = I(d, y1 - 6 - y, 2);
      for (const s of [-1, 1]) d = U(d, S.sdRoundCone(x, y, z, s * 56, y1 + 8, 0, s * 42, top - 10, 0, 8.5, 6.5), 7);
      // Cuello rectangular con orejas laterales y collarín superior.
      let neck = S.sdBox(x, y - (nt + top - 14) / 2, z, 22, (nt - top + 14) / 2, 21, 9);
      neck = U(neck, S.sdBox(x, y - (nt - 18), z, 28, 14, 7.5, 3), 3);
      neck = U(neck, S.sdBox(x, y - (nt - 3.5), z, 25, 3.5, 24, 5), 2);
      return U(d, neck, 9);
    };
  }
  if (c.bonnet === 'fundig4') {
    // Capota tipo "pan": vista a lo largo del tubo es un arco de lados casi verticales (f-04, f-06);
    // de frente se estrecha hacia el cuello (f-07) y lleva un panel en relieve que sigue la curva.
    return (x, y, z) => {
      const h = top - y1, cy = (y1 + top) / 2 - 4;
      const yz = S.sdRoundRect2(z, y - cy, 69, h / 2 + 4, y > cy ? 56 : 6);
      const t = clamp((y - y1) / h, 0, 1);
      let d = I(yz, (Math.abs(x) - mix(55, 47, t * t)) * 0.99, 16);
      d = I(d, y1 - 6 - y, 2);
      const ph = (top - 12 - y1) / 2;
      const panel = I(I(yz - 2.6, S.sdTrapezoid2(x, y - (y1 + ph), 31, 21, ph), 2.5), 30 - Math.abs(z), 1);
      d = U(d, panel, 1.6);
      const neck = S.sdCylY(x, y - (nt + top - 24) / 2, z, 33.5 + 3 * smoothstep(top, top - 24, y), (nt - top + 24) / 2, 3);
      return U(d, neck, 12);
    };
  }
  // fundig6: montículo bajo y ancho entre los seis tetones (q-02, q-04), nervio central en las caras Z (q-01)
  // y cuello cilíndrico alto.
  return (x, y, z) => {
    const t = clamp((y - y1) / (top - y1), 0, 1), e = t * t;
    const hx = mix(54, 40, e), hz = mix(66, 44, e);
    let d = I(S.sdRoundRect2(x, z, hx, hz, 26) * 0.95, y - top, 22);
    d = I(d, y1 - 6 - y, 2);
    for (const s of [-1, 1]) d = U(d, S.sdRoundCone(x, y, z, 0, y1 + 2, s * 64, 0, top - 6, s * 30, 8, 6), 8);
    const neck = S.sdCylY(x, y - (nt + top - 26) / 2, z, 37.5 + 3.5 * smoothstep(top, top - 26, y), (nt - top + 26) / 2, 2);
    return U(d, neck, 24);
  };
}

function bonnetSdf(c, F) {
  const y0 = SEAM + GASKET, y1 = Y_BONNET, top = c.neckTop, dome = domeFor(c), capped = c.bonnet !== 'hitaly';
  return (x, y, z) => {
    const box = S.sdBox(x, y - (y0 + top) / 2, z, 75, (top - y0) / 2 + 2, 96);
    if (box > 4) return box;
    const domeD = dome(x, y, z);
    let d = U(extrude(plateOutline(c, x, z), y - (y0 + y1) / 2, (y1 - y0) / 2, 1.6), domeD, 9);
    for (const [bx, bz] of c.bolts) d = U(d, S.sdCylY(x - bx, y - (y0 + c.bossTop) / 2, z - bz, 12, (c.bossTop - y0) / 2, 2.6), 5);
    // Pernos embutidos con tapón blanco (FUNDIGSAC).
    if (capped) for (const [bx, bz] of c.bolts) d = D(d, S.sdCylY(x - bx, y - c.bossTop, z - bz, 8.6, 3.2, 0.4), 0.6);
    // Marcado en la brida de la tapa (q-02): DN100 / QT450 en la franja delantera, a la izquierda.
    if (F.bonnet && z > 66 && z < 89 && Math.abs(x + 24) < 18 && y > y1 - 2 && y < y1 + 4) d = U(d, relief(F.bonnet, x + 24, 79.5 - z, y - y1, 0.8), 0.25);
    // Paso del vástago y cámara interior (pared de 7 mm, abierta hacia el cuerpo).
    d = D(d, S.sdCylY(x, y - top, z, 15, 60), 0.8);
    const shell = I(domeD + 7, y - (top - 40), 4);
    const opening = I(S.sdRoundRect2(z, y - y0, 62, 14, 4), Math.abs(x) - 20, 2);
    return D(d, Math.min(shell, opening), 1.5);
  };
}

// ---------- volante ----------
function handwheelSdf(c, F) {
  const { y: wy, R, h: rimH } = c.wheel, Ri = R - 30, rimMid = wy + rimH / 2;
  const hubR = 30, hubY0 = wy - 9, hubY1 = wy + rimH - 4;
  const spoke = buildSpoke(R, Ri, hubR, rimMid - 3);
  return (x, y, z) => {
    const r = Math.hypot(x, z);
    const box = S.sdCylinderAxis(r, y - rimMid, R + 1, rimH / 2 + 12);
    if (box > 4) return box;
    // Aro de sección redondeada; ondas de agarre en la mitad inferior del borde exterior (v-01, f-07).
    const ang = Math.atan2(z, x);
    let rim = S.sdRoundRect2(r - (R + Ri) / 2, y - rimMid, (R - Ri) / 2, rimH / 2, 7.5);
    const lower = smoothstep(rimMid + 3, rimMid - 11, y), wave = 0.5 + 0.5 * Math.cos(ang * 18);
    rim = I(rim, r - (R - 5.2 * wave * lower), 3);
    // Ocho paneles enmarcados en la cara superior del aro (v-03, f-03) y OPEN / CLOSE.
    const topW = y - (rimMid + rimH / 2);
    if (topW > -3 && r > Ri - 1 && r < R + 1) {
      const seg = Math.PI / 4, a = ((ang % seg) + seg) % seg - seg / 2, rm = (R + Ri) / 2, u = a * rm, v = r - rm;
      const panel = S.sdRoundRect2(u, v, seg * rm / 2 - 4.5, (R - Ri) / 2 - 4, 3);
      rim = U(rim, extrude(Math.abs(panel) - 1.3, topW - 0.6, 1.3, 0.55), 0.6);
      for (const [field, at] of [[F.open, c.wheelText.openAt], [F.close, c.wheelText.closeAt]]) {
        let da = ang - at; da = Math.atan2(Math.sin(da), Math.cos(da));
        if (Math.abs(da) < seg / 2) rim = U(rim, relief(field, da * rm, r - rm, topW, 1.0), 0.25);
      }
    }
    let d = U(rim, spoke(x, y, z), 9);
    d = U(d, S.sdCylinderAxis(r, y - (hubY0 + hubY1) / 2, hubR, (hubY1 - hubY0) / 2, 5), 7);
    return D(d, S.sdCylY(x, y - wy, z, 11.5, 60), 0.6);
  };
}

/** Tres rayos curvos con canal central (v-03, f-03), barridos por tramos sobre una curva en el plano XZ. */
function buildSpoke(R, Ri, hubR, yMid) {
  const N = 14, paths = [];
  for (let s = 0; s < 3; s++) {
    const a0 = s * Math.PI * 2 / 3 + 0.35, pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, rr = mix(hubR - 6, Ri + 7, t), a = a0 + 0.78 * Math.pow(t, 1.35);
      pts.push([rr * Math.cos(a), yMid + 2.5 * t, rr * Math.sin(a), t]);
    }
    paths.push(pts);
  }
  return (x, y, z) => {
    let best = Infinity;
    for (const pts of paths) for (let i = 0; i < N; i++) {
      const [ax, ay, az, ta] = pts[i], [bx, by, bz, tb] = pts[i + 1];
      const ex = bx - ax, ez = bz - az, el = Math.hypot(ex, ez);
      const hu = ((x - ax) * ex + (z - az) * ez) / (el * el), h = clamp(hu, 0, 1);
      const qx = ax + ex * h, qz = az + ez * h, qy = ay + (by - ay) * h, t = ta + (tb - ta) * h;
      const lat = (-(x - qx) * ez + (z - qz) * ex) / el;
      const slab = Math.max(-hu * el, (hu - 1) * el) - 1.5;
      const hw = 13 + 5 * t * t + 4 * (1 - t) * (1 - t), hh = 8.5;
      let cs = S.sdRoundRect2(lat, y - qy, hw, hh, 5.5);
      cs = D(cs, Math.hypot(lat, y - qy - hh - 1.2) - 3.4, 1.2);
      const d = Math.hypot(Math.max(cs, 0), Math.max(slab, 0)) + Math.min(Math.max(cs, slab), 0);
      if (d < best) best = d;
    }
    return best;
  };
}

// ---------- cuadrante de maniobra (garantía extendida) ----------
// Medidas de q-01/q-03 con el cuello (Ø75) como referencia: dado de □84 y 69 de alto con boca Ø67 y escalón Ø59
// hasta el inserto metálico del fondo (q-05). La aleta es una pestaña de 6 mm alrededor del dado con dos orejas a
// los costados, a lo largo del tubo (fotos de taller del 2026-10-22): arco abierto de R47 que cubre toda la cara
// del dado y sobresale 26 mm, con la cara superior en caída curva hacia el borde; una lleva ▲ OPEN y la otra un
// nervio en arco.
const CAP_HALF = 42, CAP_BORE = 33.5, CAP_STEP = 29.5, CAP_FLOOR = 288;
const EAR = { cx: 21, r: 47, rise: 7 };
const capFlangeOutline = (x, z) => {
  const ledge = S.sdRoundRect2(x, z, CAP_HALF, CAP_HALF, 8) - 6;
  const ear = Math.hypot(Math.abs(x) - EAR.cx, z) - EAR.r;
  return S.smin(ledge, ear, 4);
};
function capSdf(c, F) {
  const { y0, yF, yT } = c.cap, xOut = EAR.cx + EAR.r;
  return (x, y, z) => {
    const box = S.sdBox(x, y - (y0 + yT) / 2, z, xOut + 3, (yT - y0) / 2 + 2, 53);
    if (box > 4) return box;
    const ax = Math.abs(x), r = Math.hypot(x, z);
    // Cara superior de las orejas: alta junto al dado y cayendo en curva hasta el borde.
    const t = clamp((ax - CAP_HALF) / (xOut - 3 - CAP_HALF), 0, 1), yTop = yF + EAR.rise * (1 - t * t);
    let flange = extrude(capFlangeOutline(x, z), y - (y0 + yF + EAR.rise) / 2, (yF + EAR.rise - y0) / 2, 2.8);
    flange = I(flange, (y - yTop) * 0.99, 3);
    const socket = extrude(S.sdRoundRect2(x, z, CAP_HALF, CAP_HALF, 8), y - (yF + yT) / 2 + 1, (yT - yF) / 2 + 1, 2.6);
    let d = U(flange, socket, 6);
    // Boca, escalón y fondo donde asoma el inserto (q-05).
    d = D(d, S.sdCylinderAxis(r, y - (yT + 300) / 2 - 2, CAP_BORE, (yT - 300) / 2 + 2), 1.6);
    d = D(d, S.sdCylinderAxis(r, y - (CAP_FLOOR + 302) / 2, CAP_STEP, (302 - CAP_FLOOR) / 2), 1);
    // Alojamiento del vástago por debajo.
    d = D(d, S.sdCylY(x, y - y0, z, 17.5, 12), 0.6);
    // Marcas fundidas sobre las orejas: ▲ OPEN (+X, se lee desde fuera) y un nervio en arco (−X).
    if (ax > CAP_HALF + 2 && y > yTop - 3 && y < yTop + 2.5) {
      const w = (y - yTop) * 0.99;
      if (x > 0 && F.capOpen) d = U(d, relief(F.capOpen, -z, (CAP_HALF + xOut) / 2 + 1 - x, w, 1.0), 0.25);
      if (x < 0) {
        const rib = I(Math.abs(Math.hypot(ax - EAR.cx, z) - (EAR.r - 12)) - 1, CAP_HALF + 4 - ax, 1.5);
        d = U(d, extrude(rib, w - 0.35, 0.8, 0.4), 0.3);
      }
    }
    return d;
  };
}

/** Tornillo Allen inoxidable que fija el dado al vástago (fotos de taller): cabeza cilíndrica con hexágono hueco. */
function capScrewSdf() {
  return (x, y, z) => {
    const r = Math.hypot(x, z), base = CAP_FLOOR + 3;
    const head = S.sdCylinderAxis(r, y - (base + 3.2), 10.5, 3.2, 1);
    const hex = extrude(S.sdHexagon2(x, z, 3.7), y - (base + 6.4), 4, 0.25);
    return D(head, hex, 0.5);
  };
}

/** Inserto de hierro sin pintar en el fondo del dado (disco gris mate de q-05). */
function capInsertSdf() {
  return (x, y, z) => D(S.sdCylY(x, y - (CAP_FLOOR + 1.5), z, 21, 3.5, 1.2), S.sdCylY(x, y - (CAP_FLOOR + 5), z, 12.6, 2), 0.3);
}

// ---------- cuña elastomérica (EPDM) ----------
/** Cuña con espina central, caras en cuña, cabeza estrechada y canto inferior en U; lift = apertura. */
function wedgeSdf(lift = 36) {
  return (x, y, z) => {
    const yy = y - lift;
    const box = S.sdBox(x, yy - 10, z, 30, 80, 68);
    if (box > 4) return box;
    const yLow = -56 + 0.18 * Math.abs(z) * smoothstep(0, 40, Math.abs(z)) + 0.0072 * z * z;
    const zMax = mix(60, 34, smoothstep(26, 72, yy));
    const outline = Math.max(Math.abs(z) - zMax, yLow - yy, yy - 72);
    const half = mix(11, 17.5, smoothstep(-56, 72, yy));
    let d = I(outline * 0.85, Math.abs(x) - half, 7);
    d = U(d, S.sdRoundCone(x, yy, z, 0, -44, 0, 0, 76, 0, 15, 19), 8);
    for (const s of [-1, 1]) d = U(d, S.sdBox(x, yy - 4, z - s * 61, 8, 30, 5, 3), 3);
    return d;
  };
}

// ---------- herrajes ----------
function steelSdf(c) {
  const parts = [];
  if (c.bonnet === 'hitaly') for (const [bx, bz] of c.bolts) {
    parts.push((x, y, z) => S.sdCylY(x - bx, y - (c.bossTop + 1), z - bz, 11, 1, 0.4));
    parts.push((x, y, z) => I(extrude(S.sdHexagon2(x - bx, z - bz, 8.5), y - (c.bossTop + 6), 4, 0.6), S.sdSphere(x - bx, y - (c.bossTop), z - bz, 14.5), 1.2));
  }
  const top = c.neckTop;
  if (c.operator === 'handwheel') {
    const { y: wy, h } = c.wheel, hubTop = wy + h - 4;
    parts.push((x, y, z) => S.sdCylY(x, y - (top + hubTop + 4) / 2, z, 11, (hubTop + 4 - top) / 2, 1));
    parts.push((x, y, z) => S.sdCylY(x, y - (hubTop + 0.9), z, 13, 0.9, 0.3));
    parts.push((x, y, z) => I(extrude(S.sdHexagon2(x, z, 9.5), y - (hubTop + 6), 4.2, 0.6), S.sdSphere(x, y - hubTop, z, 16), 1.2));
  } else {
    // Vástago inoxidable Ø33 con base acampanada sobre el guardapolvo y una ranura (q-01, q-02, q-04).
    const yR = top + 28, yS = c.cap.y0 + 10;
    parts.push((x, y, z) => {
      const r = Math.hypot(x, z), flare = 2.6 * smoothstep(yR + 5, yR, y);
      const stem = S.sdCylinderAxis(r, y - (top + yS) / 2, 16.5 + flare, (yS - top) / 2, 1);
      return D(stem, Math.hypot(r - 16.9, y - (yR + 9)) - 0.9, 0.3);
    });
  }
  return (x, y, z) => { let d = Infinity; for (const p of parts) d = Math.min(d, p(x, y, z)); return d; };
}

function brassSdf(c) {
  const top = c.neckTop;
  // Prensaestopas: aro redondo sobre el cuello y tuerca hexagonal bajo el guardapolvo (q-02, q-03).
  if (c.operator === 'cap') return (x, y, z) => {
    const r = Math.hypot(x, z);
    const ring = S.sdCylinderAxis(r, y - (top + 2.3), 38.2, 2.3, 0.7);
    const hex = I(extrude(S.sdHexagon2(x, z, 32), y - (top + 5.6), 2.6, 0.6), r - 36.6, 1);
    return D(U(ring, hex, 0.5), r - 16.8, 0.4);
  };
  if (c.bonnet === 'hitaly') return (x, y, z) => {
    // Collarín y hexágono solapados (sin plano de contacto de espesor cero).
    const collar = S.sdCylY(x, y - (top + 2.5), z, 27, 2.5, 0.8);
    const hex = I(extrude(S.sdHexagon2(x, z, 22.5), y - (top + 11.5), 7.5, 0.8), S.sdSphere(x, y - (top + 3), z, 32), 1.5);
    return D(U(collar, hex, 0.6), S.sdCylY(x, y - top, z, 11.6, 40), 0.4);
  };
  return (x, y, z) => {
    const hex = I(extrude(S.sdHexagon2(x, z, 21), y - (top + 6.5), 6.5, 0.8), S.sdSphere(x, y - (top + 2), z, 29), 1.5);
    return D(hex, S.sdCylY(x, y - top, z, 11.6, 40), 0.4);
  };
}

function rubberSdf(c) {
  const gasket = (x, y, z) => extrude(plateOutline(c, x, z) + 1.2, y - (SEAM + GASKET / 2), GASKET / 2 + 0.2, 0.2);
  if (c.operator !== 'cap') return gasket;
  const y0 = c.neckTop + 8, y1 = y0 + 16, y2 = y1 + 4;
  return (x, y, z) => {
    const r = Math.hypot(x, z);
    // Guardapolvo de caucho (q-01 a q-04): anillo grueso de perfil redondo, con el borde superior en media caña,
    // el canto algo abombado y un collarín interior, también redondeado, que abraza el vástago.
    const outer = 37 + 0.8 * Math.sin(Math.PI * clamp((y - y0) / (y1 - y0), 0, 1)), half = (outer - 17) / 2;
    const disc = S.sdRoundRect2(r - (17 + half), y - (y0 + y1) / 2, half, (y1 - y0) / 2, y > (y0 + y1) / 2 ? 7.8 : 3.5);
    const ring = S.sdCylinderAxis(r, y - (y1 + y2) / 2 + 1, 21.5, (y2 - y1) / 2 + 1, 2.6);
    return Math.min(gasket(x, y, z), D(U(disc, ring, 1.5), r - 17, 0.5));
  };
}

function capsWhiteSdf(c) {
  return (x, y, z) => {
    let d = Infinity;
    for (const [bx, bz] of c.bolts) d = Math.min(d, I(S.sdCylY(x - bx, y - (c.bossTop - 1.3), z - bz, 8.3, 2.6, 0.8), S.sdSphere(x - bx, y - (c.bossTop - 13), z - bz, 15.3), 1));
    return d;
  };
}

// ---------- ensamblado ----------
export function buildParts(assets) {
  const c = CONFIG[assets.variant], F = assets.fields;
  const parts = {
    cuerpo: { sdf: bodySdf(c, F), bounds: [[-97, -114, -114], [97, 114, 114]], voxel: 0.42, material: 'epoxi', error: 0.16, ratio: 0.005, normalWeight: 0.2 },
    bonete: { sdf: bonnetSdf(c, F), bounds: [[-76, SEAM + GASKET - 2, -98], [76, c.neckTop + 3, 98]], voxel: 0.42, material: 'epoxi', error: 0.16, ratio: 0.005, normalWeight: 0.2 },
    cuna: { sdf: wedgeSdf(), bounds: [[-32, -26, -70], [32, 152, 70]], voxel: 0.5, material: 'epdm', error: 0.12, ratio: 0.005 },
    acero: { sdf: steelSdf(c), bounds: c.operator === 'cap' ? [[-22, c.neckTop - 2, -22], [22, c.cap.y0 + 12, 22]] : [[-72, Y_BONNET - 2, -88], [72, c.wheel.y + c.wheel.h + 10, 88]], voxel: 0.3, material: 'acero', error: 0.08, ratio: 0.005, aoWeight: 0.1 },
    laton: { sdf: brassSdf(c), bounds: [[-42, c.neckTop - 2, -42], [42, c.neckTop + 22, 42]], voxel: 0.3, material: 'laton', error: 0.1, ratio: 0.005, aoWeight: 0.08 },
    caucho: { sdf: rubberSdf(c), bounds: [[-74, SEAM - 2, -98], [74, c.operator === 'cap' ? c.neckTop + 30 : SEAM + 4, 98]], voxel: 0.35, material: 'caucho', error: 0.1, ratio: 0.005 },
  };
  if (c.operator === 'handwheel') parts.volante = { sdf: handwheelSdf(c, F), bounds: [[-128, c.wheel.y - 14, -128], [128, c.wheel.y + c.wheel.h + 4, 128]], voxel: 0.36, material: 'epoxi', error: 0.2, ratio: 0.005, normalWeight: 0.1, aoWeight: 0.12 };
  else {
    parts.cuadrante = { sdf: capSdf(c, F), bounds: [[-EAR.cx - EAR.r - 3, c.cap.y0 - 2, -53], [EAR.cx + EAR.r + 3, c.cap.yT + 2, 53]], voxel: 0.32, material: 'epoxi-dado', error: 0.07, ratio: 0.005, normalWeight: 0.2 };
    parts.inserto = { sdf: capInsertSdf(), bounds: [[-23, CAP_FLOOR - 4, -23], [23, CAP_FLOOR + 7, 23]], voxel: 0.2, material: 'hierro', error: 0.03, ratio: 0.005 };
    parts.tornillo = { sdf: capScrewSdf(), bounds: [[-13, CAP_FLOOR + 1, -13], [13, CAP_FLOOR + 11, 13]], voxel: 0.1, material: 'acero', error: 0.015, ratio: 0.005 };
  }
  if (c.bonnet !== 'hitaly') parts.tapones = { sdf: capsWhiteSdf(c), bounds: [[-72, c.bossTop - 6, -88], [72, c.bossTop + 2, 88]], voxel: 0.25, material: 'blanco', error: 0.06, ratio: 0.005 };
  const all = Object.values(parts).map((p) => p.sdf);
  parts.escena = { sdf: (x, y, z) => { let d = Infinity; for (const f of all) d = Math.min(d, f(x, y, z)); return d; }, bounds: null };
  return parts;
}

export async function prepareAssets(variant, { textBlockField, logoField }) {
  const c = CONFIG[variant], fields = {};
  fields.front = await textBlockField(c.textFront.lines, { gap: c.textFront.gap ?? 2.5 });
  fields.back = await textBlockField(c.textBack.lines, { gap: c.textBack.gap ?? 2.5 });
  if (c.textFront.logo) fields.logo = await logoField(fileURLToPath(new URL('../../public/brand/fundigsac-icon.svg', import.meta.url)), c.textFront.logo, { widthScale: c.textFront.logoWide ?? 1 });
  if (c.wheelText) {
    const narrow = { fontfile: 'C:/Windows/Fonts/ARIALNB.TTF', font: 'Arial Narrow Bold', tracking: 0.06, height: 11 };
    fields.open = await textBlockField([{ ...narrow, text: `◀${c.wheelText.open}` }]);
    fields.close = await textBlockField([{ ...narrow, text: `${c.wheelText.close}▶` }]);
  }
  if (c.bonnetText) fields.bonnet = await textBlockField(c.bonnetText.map((t) => ({ text: t, height: 4.2 })), { gap: 1.4 });
  // q-05: flecha ▲ sobre OPEN en la brida del cuadrante.
  if (c.operator === 'cap') fields.capOpen = await textBlockField([{ text: '▲', height: 3.2 }, { text: 'OPEN', height: 7 }], { gap: 1.2 });
  return { variant, fields };
}
