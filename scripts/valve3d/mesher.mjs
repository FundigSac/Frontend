// Mallado de SDF: muestreo disperso por bloques en hilos, surface nets, proyección a la
// superficie, normales exactas del gradiente y simplificación con meshoptimizer.
import { Worker } from 'node:worker_threads';
import os from 'node:os';
import { MeshoptSimplifier } from 'meshoptimizer';

export class Pool {
  constructor(modelUrl, assets, size = Math.max(2, os.cpus().length - 2)) {
    this.workers = []; this.queue = []; this.pending = new Map(); this.next = 1;
    this.ready = Promise.all(Array.from({ length: size }, () => new Promise((resolve, reject) => {
      const w = new Worker(new URL('./worker.mjs', import.meta.url), { workerData: { modelUrl, assets } });
      w.busy = false;
      w.on('message', (m) => {
        if (m.ready) { this.workers.push(w); resolve(); this.pump(); return; }
        const job = this.pending.get(m.id); this.pending.delete(m.id); w.busy = false; job.resolve(m.out); this.pump();
      });
      w.on('error', (e) => { reject(e); for (const job of this.pending.values()) job.reject(e); });
    })));
  }
  run(task) {
    return new Promise((resolve, reject) => { task.id = this.next++; this.queue.push({ task, resolve, reject }); this.pump(); });
  }
  pump() {
    for (const w of this.workers) {
      if (w.busy || !this.queue.length) continue;
      const job = this.queue.shift(); w.busy = true; this.pending.set(job.task.id, job); w.postMessage(job.task);
    }
  }
  async close() { await Promise.all(this.workers.map((w) => w.terminate())); }
}

async function evalPoints(pool, part, points, h) {
  const chunk = 20000, jobs = [];
  for (let s = 0; s < points.length / 3; s += chunk) {
    const slice = points.slice(s * 3, Math.min(points.length, (s + chunk) * 3));
    jobs.push(pool.run({ type: 'points', part, points: slice, h }));
  }
  const parts = await Promise.all(jobs), out = new Float32Array((points.length / 3) * 4);
  let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

/**
 * Malla de una pieza SDF.
 * @param {Pool} pool
 * @param {{name:string,bounds:number[][],voxel:number,error?:number,ratio?:number}} spec
 */
export async function meshPart(pool, spec) {
  // spec.ao(positions, normals) → Float32Array por vértice (opcional).
  const t0 = Date.now();
  const { name, voxel: v } = spec, B = 8;
  const [[x0, y0, z0], [x1, y1, z1]] = spec.bounds;
  // Margen de 2 vóxeles: la superficie nunca toca el borde de la grilla.
  const ox = x0 - 2 * v, oy = y0 - 2 * v, oz = z0 - 2 * v;
  const bx = Math.ceil((x1 - x0 + 4 * v) / v / B), by = Math.ceil((y1 - y0 + 4 * v) / v / B), bz = Math.ceil((z1 - z0 + 4 * v) / v / B);
  const nx = bx * B + 1, ny = by * B + 1, nz = bz * B + 1;
  // 1) Centros de bloque: descarta bloques lejos de la superficie.
  const centers = new Float32Array(bx * by * bz * 3);
  let c = 0;
  for (let k = 0; k < bz; k++) for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++) {
    centers[c++] = ox + (i + 0.5) * B * v; centers[c++] = oy + (j + 0.5) * B * v; centers[c++] = oz + (k + 0.5) * B * v;
  }
  const cd = await evalPoints(pool, name, centers, v * 0.5);
  const half = Math.sqrt(3) * 0.5 * B * v, grid = new Float32Array(nx * ny * nz);
  const active = [];
  for (let b = 0; b < bx * by * bz; b++) {
    const d = cd[b * 4];
    const i = b % bx, j = ((b / bx) | 0) % by, k = (b / (bx * by)) | 0;
    if (Math.abs(d) > half * 1.6 + v) {
      // Bloque sin superficie: todo el bloque comparte el signo del centro.
      const val = d > 0 ? 1e3 : -1e3;
      for (let kk = k * B; kk <= k * B + B; kk++) for (let jj = j * B; jj <= j * B + B; jj++) {
        const row = (kk * ny + jj) * nx;
        for (let ii = i * B; ii <= i * B + B; ii++) if (grid[row + ii] === 0) grid[row + ii] = val;
      }
    } else active.push(i, j, k);
  }
  // 2) Muestreo completo de los bloques activos.
  const perJob = 24, jobs = [];
  for (let s = 0; s < active.length; s += perJob * 3) {
    const blocks = Int32Array.from(active.slice(s, s + perJob * 3));
    jobs.push(pool.run({ type: 'blocks', part: name, blocks, B, ox, oy, oz, v }).then((out) => {
      let o = 0; const n = B + 1;
      for (let b = 0; b < blocks.length; b += 3) {
        const i0 = blocks[b] * B, j0 = blocks[b + 1] * B, k0 = blocks[b + 2] * B;
        for (let kk = 0; kk < n; kk++) for (let jj = 0; jj < n; jj++) {
          const row = ((k0 + kk) * ny + j0 + jj) * nx + i0;
          for (let ii = 0; ii < n; ii++) grid[row + ii] = out[o++];
        }
      }
    }));
  }
  await Promise.all(jobs);
  // 3) Surface nets: un vértice por celda con cambio de signo.
  const at = (i, j, k) => grid[(k * ny + j) * nx + i];
  const cellVertex = new Map(), verts = [];
  const corner = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const vals = new Float32Array(8);
  for (let a = 0; a < active.length; a += 3) {
    const bi = active[a] * B, bj = active[a + 1] * B, bk = active[a + 2] * B;
    for (let k = bk; k < bk + B; k++) for (let j = bj; j < bj + B; j++) for (let i = bi; i < bi + B; i++) {
      let mask = 0;
      for (let q = 0; q < 8; q++) { vals[q] = at(i + corner[q][0], j + corner[q][1], k + corner[q][2]); if (vals[q] < 0) mask |= 1 << q; }
      if (mask === 0 || mask === 255) continue;
      let sx = 0, sy = 0, sz = 0, cnt = 0;
      for (const [e0, e1] of edges) {
        const va = vals[e0], vb = vals[e1];
        if ((va < 0) === (vb < 0)) continue;
        const t = va / (va - vb), ca = corner[e0], cb = corner[e1];
        sx += ca[0] + (cb[0] - ca[0]) * t; sy += ca[1] + (cb[1] - ca[1]) * t; sz += ca[2] + (cb[2] - ca[2]) * t; cnt++;
      }
      cellVertex.set((k * ny + j) * nx + i, verts.length / 3);
      verts.push(ox + (i + sx / cnt) * v, oy + (j + sy / cnt) * v, oz + (k + sz / cnt) * v);
    }
  }
  // 4) Caras: un cuadrilátero por arista de la grilla con cambio de signo.
  const quads = [];
  const cv = (i, j, k) => cellVertex.get((k * ny + j) * nx + i);
  for (const [key, vi] of cellVertex) {
    const i = key % nx, j = ((key / nx) | 0) % ny, k = (key / (nx * ny)) | 0, s0 = at(i, j, k) < 0;
    if (j > 0 && k > 0 && s0 !== (at(i + 1, j, k) < 0)) {
      const q = [cv(i, j - 1, k - 1), cv(i, j, k - 1), vi, cv(i, j - 1, k)];
      if (!q.includes(undefined)) quads.push(...(s0 ? q : q.reverse()));
    }
    if (i > 0 && k > 0 && s0 !== (at(i, j + 1, k) < 0)) {
      const q = [cv(i - 1, j, k - 1), cv(i - 1, j, k), vi, cv(i, j, k - 1)];
      if (!q.includes(undefined)) quads.push(...(s0 ? q : q.reverse()));
    }
    if (i > 0 && j > 0 && s0 !== (at(i, j, k + 1) < 0)) {
      const q = [cv(i - 1, j - 1, k), cv(i, j - 1, k), vi, cv(i - 1, j, k)];
      if (!q.includes(undefined)) quads.push(...(s0 ? q : q.reverse()));
    }
  }
  // 5) Proyección de cada vértice sobre la superficie (dos pasos de Newton, acotados).
  let positions = Float32Array.from(verts);
  for (let it = 0; it < 2; it++) {
    const g = await evalPoints(pool, name, positions, v * 0.25);
    for (let p = 0; p < positions.length / 3; p++) {
      const d = g[p * 4], gx = g[p * 4 + 1], gy = g[p * 4 + 2], gz = g[p * 4 + 3], l2 = gx * gx + gy * gy + gz * gz;
      if (l2 < 1e-8) continue;
      let s = d / l2; const step = Math.abs(s) * Math.sqrt(l2), lim = 0.6 * v;
      if (step > lim) s *= lim / step;
      positions[p * 3] -= gx * s; positions[p * 3 + 1] -= gy * s; positions[p * 3 + 2] -= gz * s;
    }
  }
  const g = await evalPoints(pool, name, positions, v * 0.2);
  const normals = new Float32Array(positions.length);
  for (let p = 0; p < positions.length / 3; p++) {
    const gx = g[p * 4 + 1], gy = g[p * 4 + 2], gz = g[p * 4 + 3], l = Math.hypot(gx, gy, gz) || 1;
    normals[p * 3] = gx / l; normals[p * 3 + 1] = gy / l; normals[p * 3 + 2] = gz / l;
  }
  // Triangulación por la diagonal más corta; orientación verificada con el gradiente.
  const tris = [];
  const P = (i) => [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];
  const d2 = (a, b) => { const A = P(a), Bv = P(b); return (A[0] - Bv[0]) ** 2 + (A[1] - Bv[1]) ** 2 + (A[2] - Bv[2]) ** 2; };
  const pushTri = (a, b, cc) => {
    if (a === b || b === cc || a === cc) return;
    const A = P(a), Bv = P(b), C = P(cc);
    const ux = Bv[0] - A[0], uy = Bv[1] - A[1], uz = Bv[2] - A[2], wx = C[0] - A[0], wy = C[1] - A[1], wz = C[2] - A[2];
    const fx = uy * wz - uz * wy, fy = uz * wx - ux * wz, fz = ux * wy - uy * wx;
    const nx_ = normals[a * 3] + normals[b * 3] + normals[cc * 3], ny_ = normals[a * 3 + 1] + normals[b * 3 + 1] + normals[cc * 3 + 1], nz_ = normals[a * 3 + 2] + normals[b * 3 + 2] + normals[cc * 3 + 2];
    if (fx * nx_ + fy * ny_ + fz * nz_ < 0) tris.push(a, cc, b); else tris.push(a, b, cc);
  };
  for (let q = 0; q < quads.length; q += 4) {
    const [a, b, cc, d] = [quads[q], quads[q + 1], quads[q + 2], quads[q + 3]];
    if (d2(a, cc) <= d2(b, d)) { pushTri(a, b, cc); pushTri(a, cc, d); } else { pushTri(a, b, d); pushTri(b, cc, d); }
  }
  let indices = Uint32Array.from(tris);
  const before = indices.length / 3;
  // 6) Simplificación: los vértices conservados siguen sobre la superficie exacta.
  await MeshoptSimplifier.ready;
  const target = Math.floor((indices.length * (spec.ratio ?? 0.08)) / 3) * 3;
  // Oclusión ambiental sobre la malla completa (se conserva en la simplificación como atributo).
  const ao = spec.ao ? await spec.ao(positions, normals) : new Float32Array(positions.length / 3).fill(1);
  const nv = positions.length / 3, attrs = new Float32Array(nv * 4), nw = spec.normalWeight ?? 0.04;
  for (let i = 0; i < nv; i++) { attrs[i * 4] = normals[i * 3]; attrs[i * 4 + 1] = normals[i * 3 + 1]; attrs[i * 4 + 2] = normals[i * 3 + 2]; attrs[i * 4 + 3] = ao[i]; }
  const [simplified] = MeshoptSimplifier.simplifyWithAttributes(indices, positions, 3, attrs, 4, [nw, nw, nw, spec.aoWeight ?? 0.35], null,
    target, spec.error ?? 0.04, ['ErrorAbsolute']);
  indices = simplified;
  // Compactación de vértices.
  const remap = new Int32Array(positions.length / 3).fill(-1), outP = [], outN = [], outA = [];
  for (let i = 0; i < indices.length; i++) {
    const o = indices[i];
    if (remap[o] < 0) { remap[o] = outP.length / 3; outP.push(positions[o * 3], positions[o * 3 + 1], positions[o * 3 + 2]); outN.push(normals[o * 3], normals[o * 3 + 1], normals[o * 3 + 2]); outA.push(ao[o]); }
    indices[i] = remap[o];
  }
  console.log(`  ${name}: ${active.length / 3} bloques, ${before} → ${indices.length / 3} triángulos, ${outP.length / 3} vértices (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  return { positions: Float32Array.from(outP), normals: Float32Array.from(outN), ao: Float32Array.from(outA), indices: Uint32Array.from(indices) };
}
