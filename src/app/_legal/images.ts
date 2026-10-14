import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Fotos de las páginas legales. Si existen en /public/media/legal se usan; si no, caen a una foto del sitio
 * para que nunca haya una imagen rota. Se evalúa en el servidor (build o petición).
 */
const FALLBACK = "/media/home-v3/hero-planta.webp";

function pick(file: string, fallback: string = FALLBACK): string {
  return existsSync(path.join(process.cwd(), "public", "media", "legal", file)) ? `/media/legal/${file}` : fallback;
}

/** Puente con farolas (hero de Términos, Cookies y Libro de reclamaciones). */
export const legalHeroImage = () => pick("hero-terminos.webp");

/** Estanque con tanque circular (banda de cierre de Términos y Libro de reclamaciones). */
export const legalClosingImage = () => pick("cierre-terminos.webp");

/** Oficina con ventanal y laptop (hero de Privacidad). */
export const privacyHeroImage = () => pick("hero-privacidad.webp", legalHeroImage());

/** Manos sobre una laptop (tarjeta lateral de Privacidad). */
export const privacyAsideImage = () => pick("aside-privacidad.webp", "/media/home-v3/respaldo-ingeniero.webp");

/** Sala de control con monitores y operario (hero de Cookies). */
export const cookiesHeroImage = () => pick("hero-cookies.webp", legalHeroImage());

/** Tres tarjetas informativas de Cookies: tanque circular, acople bridado y cascada de planta. */
export const cookiesInfoImages = (): [string, string, string] => [
  pick("cookies-que-son.webp", "/media/home-v3/hero-planta.webp"),
  pick("cookies-como-usamos.webp", "/media/mineria/acople-bridado.webp"),
  pick("cookies-duracion.webp", "/media/saneamiento/hero.webp"),
];

/** Planta de agua al atardecer con farolas (banda de cierre de Privacidad). */
export const privacyClosingImage = () => pick("cierre-privacidad.webp", "/media/saneamiento/cierre.webp");
