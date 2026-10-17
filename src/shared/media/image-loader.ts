// Loader global de next/image: cada foto se sirve como variante WebP pregenerada (scripts/build-image-variants.mjs).
// Así la primera visita no espera una transformación en el servidor. SVG y GIF pasan tal cual.
// 256: miniaturas de galería (64–78 px a DPR 2–3); antes bajaban la variante de 384 px.
const BUCKETS = [256, 384, 640, 768, 1200, 1920] as const;
const RASTER = /\.(jpe?g|png|webp)$/i;

export default function imageLoader({ src, width }: { src: string; width: number }): string {
  // SVG, GIF y remotas pasan tal cual; el ancho va como parámetro (inocuo) para que Next vea que el cargador lo usa.
  if (src.startsWith("http") || !RASTER.test(src)) return src.includes("?") ? src : `${src}?w=${width}`;
  const bucket = BUCKETS.find((b) => width <= b) ?? BUCKETS[BUCKETS.length - 1];
  return src.replace(RASTER, `-w${bucket}.webp`);
}
