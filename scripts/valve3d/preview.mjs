// Servidor local de control visual: foto real junto al modelo 3D con la misma cámara.
// Uso: node scripts/valve3d/preview.mjs [puerto]  →  http://localhost:<puerto>/?v=hitaly
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const port = Number(process.argv[2] ?? process.env.PORT ?? 3191);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.webp': 'image/webp', '.png': 'image/png' };
const map = (url) => {
  if (url === '/' || url.startsWith('/?')) return path.join(root, 'scripts/valve3d/preview.html');
  if (url === '/mv.js') return path.join(root, 'node_modules/@google/model-viewer/dist/model-viewer.min.js');
  return path.join(root, 'public', decodeURIComponent(url.split('?')[0]));
};
http.createServer((req, res) => {
  const file = map(req.url);
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404); res.end('404'); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Vista de control en http://localhost:${port}/?v=hitaly`));
