import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loginUrl } from "@/server/auth/redirects";

/**
 * Optimización, NO barrera de seguridad:
 *  - /cuenta/**: si ni siquiera hay cookie de sesión, redirige a /login sin renderizar. Que exista la cookie no
 *    prueba nada: la validación real (firma, expiración, revocación, bloqueo, rol) ocurre en el servidor
 *    en el layout, en cada página y en cada acción (src/server/auth/session.ts).
 *  - Páginas de autenticación y cuenta: Cache-Control: no-store (nada de estas rutas debe cachearse).
 */
const SESSION_COOKIES = ["fundigsac.session_token", "__Secure-fundigsac.session_token"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const protectedArea = pathname === "/cuenta" || pathname.startsWith("/cuenta/");
  if (protectedArea && !SESSION_COOKIES.some((name) => request.cookies.has(name))) {
    const response = NextResponse.redirect(new URL(loginUrl(`${pathname}${search}`), request.url));
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: [
    "/cuenta/:path*",
    "/login",
    "/registro",
    "/verificar-correo",
    "/correo-verificado",
    "/recuperar",
    "/restablecer",
    "/enlace-expirado",
    "/auth/error",
    "/acceso-denegado",
    "/cuenta-restringida",
  ],
};
