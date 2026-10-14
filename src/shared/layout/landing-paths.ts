/** Rutas que usan la cabecera y el pie "landing" (cabecera translúcida sobre un hero a sangre). */
const LANDING_PATHS = new Set(["/", "/industrias/agricultura", "/industrias/saneamiento", "/industrias/mineria"]);

/** Páginas legales y de atención: mismo chrome landing con la cabecera transparente sobre su hero. */
const LEGAL_PATHS = new Set(["/terminos", "/privacidad", "/cookies", "/reclamaciones", "/mapa-del-sitio"]);

/** Segmento que Next asigna a la página 404 global (app/not-found.tsx). */
const NOT_FOUND_SEGMENT = "/_not-found";

export const isLegalPath = (pathname: string) => LEGAL_PATHS.has(pathname);

export function isLandingChrome(pathname: string, segment: string | null): boolean {
  return LANDING_PATHS.has(pathname) || LEGAL_PATHS.has(pathname) || segment === NOT_FOUND_SEGMENT;
}

/** Cabecera sin fondo mientras se está sobre el hero (todas salvo la portada). */
export function isHeroOverlayHeader(pathname: string, segment: string | null): boolean {
  return pathname === "/industrias/saneamiento" || LEGAL_PATHS.has(pathname) || segment === NOT_FOUND_SEGMENT;
}
