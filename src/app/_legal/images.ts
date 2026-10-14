import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Fotos de las páginas legales. Si existen en /public/media/legal se usan; si no, cae a la foto de planta
 * del sitio para que nunca haya una imagen rota. Se evalúa en el servidor (build o petición).
 */
const FALLBACK = "/media/home-v3/hero-planta.webp";

function pick(file: string): string {
  return existsSync(path.join(process.cwd(), "public", "media", "legal", file)) ? `/media/legal/${file}` : FALLBACK;
}

/** Puente con farolas (hero de las páginas legales). */
export const legalHeroImage = () => pick("hero-terminos.webp");

/** Estanque con tanque circular (banda de cierre). */
export const legalClosingImage = () => pick("cierre-terminos.webp");
