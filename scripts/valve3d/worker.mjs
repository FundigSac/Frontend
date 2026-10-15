// Hilo de evaluación: construye las piezas del modelo y evalúa sus SDF por bloques o por puntos.
import { parentPort, workerData } from 'node:worker_threads';

const model = await import(workerData.modelUrl);
const parts = model.buildParts(workerData.assets);

parentPort.on('message', (task) => {
  const sdf = parts[task.part].sdf;
  if (task.type === 'blocks') {
    // Cada bloque aporta (B+1)^3 muestras en orden x, y, z.
    const { blocks, B, ox, oy, oz, v } = task, n = B + 1, out = new Float32Array((blocks.length / 3) * n * n * n);
    let o = 0;
    for (let b = 0; b < blocks.length; b += 3) {
      const x0 = blocks[b] * B, y0 = blocks[b + 1] * B, z0 = blocks[b + 2] * B;
      for (let k = 0; k < n; k++) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++)
        out[o++] = sdf(ox + (x0 + i) * v, oy + (y0 + j) * v, oz + (z0 + k) * v);
    }
    parentPort.postMessage({ id: task.id, out }, [out.buffer]);
  } else if (task.type === 'points') {
    // Distancia y gradiente (tetraedro de 4 muestras) por punto.
    const { points, h } = task, count = points.length / 3, out = new Float32Array(count * 4);
    for (let p = 0; p < count; p++) {
      const x = points[p * 3], y = points[p * 3 + 1], z = points[p * 3 + 2];
      const a = sdf(x + h, y - h, z - h), b = sdf(x - h, y - h, z + h), c = sdf(x - h, y + h, z - h), d = sdf(x + h, y + h, z + h);
      out[p * 4] = (a + b + c + d) / 4;
      out[p * 4 + 1] = (a - b - c + d) / (4 * h);
      out[p * 4 + 2] = (-a - b + c + d) / (4 * h);
      out[p * 4 + 3] = (-a + b - c + d) / (4 * h);
    }
    parentPort.postMessage({ id: task.id, out }, [out.buffer]);
  }
});
parentPort.postMessage({ ready: true });
