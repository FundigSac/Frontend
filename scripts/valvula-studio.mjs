import fs from 'node:fs';
import * as T from 'three';

// Small, deterministic HDR studio. Lighting only: no product pixels or geometry.
// Neutral white softboxes preserve the blue epoxy's existing PBR base colour.
export function writeValveStudio(file, width = 512, height = 256) {
  const panels = [
    { direction: [-.72, .48, .5], horizontal: .55, vertical: .35, radiance: 7.5 },
    { direction: [.72, .48, -.5], horizontal: .55, vertical: .35, radiance: 7.5 },
    { direction: [-.65, .22, -.72], horizontal: .32, vertical: .57, radiance: 1.3 },
    { direction: [.65, .22, .72], horizontal: .32, vertical: .57, radiance: 1.3 },
    { direction: [0, 1, .01], horizontal: .72, vertical: .45, radiance: 4.5 },
  ].map(panel => {
    const direction = new T.Vector3(...panel.direction).normalize();
    const right = new T.Vector3(0, 1, 0).cross(direction).normalize();
    return { ...panel, direction, right, up: direction.clone().cross(right).normalize() };
  });
  const chunks = [Buffer.from(`#?RADIANCE\n# FUNDIGSAC neutral product studio\nFORMAT=32-bit_rle_rgbe\n\n-Y ${height} +X ${width}\n`)];
  let peak = 0;
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(width * 4);
    const latitude = (y + .5) / height * Math.PI;
    for (let x = 0; x < width; x++) {
      const longitude = ((x + .5) / width - .5) * Math.PI * 2;
      const direction = new T.Vector3(Math.cos(longitude) * Math.sin(latitude), Math.cos(latitude), Math.sin(longitude) * Math.sin(latitude));
      let radiance = .10 + .08 * T.MathUtils.smoothstep(direction.y, -.7, .5);
      for (const panel of panels) {
        const facing = direction.dot(panel.direction);
        if (facing <= 0) continue;
        const horizontal = Math.abs(Math.atan2(direction.dot(panel.right), facing));
        const vertical = Math.abs(Math.atan2(direction.dot(panel.up), facing));
        radiance += panel.radiance * (1 - T.MathUtils.smoothstep(horizontal, panel.horizontal * .72, panel.horizontal))
          * (1 - T.MathUtils.smoothstep(vertical, panel.vertical * .72, panel.vertical));
      }
      peak = Math.max(peak, radiance);
      const exponent = Math.ceil(Math.log2(radiance)), scale = 256 / (2 ** exponent);
      const i = x * 4;
      row[i] = row[i + 1] = row[i + 2] = Math.min(255, Math.floor(radiance * scale));
      row[i + 3] = exponent + 128;
    }
    chunks.push(Buffer.from([2, 2, width >> 8, width & 255]));
    for (let channel = 0; channel < 4; channel++) {
      // Radiance scanlines encode each RGBE channel independently.
      const bytes = Array.from({ length: width }, (_, x) => row[x * 4 + channel]);
      for (let start = 0; start < width;) {
        let run = 1;
        while (run < 127 && start + run < width && bytes[start + run] === bytes[start]) run++;
        if (run >= 4) { chunks.push(Buffer.from([128 + run, bytes[start]])); start += run; continue; }
        const literal = [bytes[start++]];
        while (literal.length < 128 && start < width) {
          if (start + 3 < width && bytes.slice(start, start + 4).every(v => v === bytes[start])) break;
          literal.push(bytes[start++]);
        }
        chunks.push(Buffer.from([literal.length, ...literal]));
      }
    }
  }
  fs.writeFileSync(file, Buffer.concat(chunks));
  return { width, height, peakRadiance: peak, bytes: fs.statSync(file).size };
}
