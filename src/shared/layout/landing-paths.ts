/** Páginas legales y de atención: cabecera transparente sobre su hero. */
const LEGAL_PATHS = new Set(["/terminos", "/privacidad", "/cookies", "/reclamaciones", "/mapa-del-sitio", "/nosotros"]);

/** Catálogo completo: /productos, las familias y las fichas comparten la cabecera y el pie de inicio. */
export const isProductPath = (pathname: string) => pathname === "/productos" || pathname.startsWith("/productos/");

/** Segmento que Next asigna a la página 404 global (app/not-found.tsx). */
const NOT_FOUND_SEGMENT = "/_not-found";

export const isLegalPath = (pathname: string) => LEGAL_PATHS.has(pathname);

/** Cabecera sin fondo mientras se está sobre el hero (todas salvo la portada). */
export function isHeroOverlayHeader(pathname: string, segment: string | null): boolean {
  return pathname === "/industrias/saneamiento" || LEGAL_PATHS.has(pathname) || segment === NOT_FOUND_SEGMENT;
}
