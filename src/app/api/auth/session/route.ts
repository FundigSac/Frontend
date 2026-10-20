import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, noStore, readSession } from "@/modules/auth/server";
import { backendEnabled } from "@/modules/backend/server";
import { apiAccessToken, withApiCookies } from "@/modules/backend/session";

export const runtime = "nodejs";

/**
 * Usuario de la sesión actual (o null) y si las cuentas con correo están activas (`accounts`: hay Backend conectado).
 * Lo lee el cliente: así las páginas siguen siendo estáticas. Una sesión abierta en la API que ya no se puede renovar
 * (contraseña cambiada, cuenta desactivada) se cierra aquí también en el sitio.
 */
export async function GET(request: NextRequest) {
  const user = await readSession(request);
  const accounts = backendEnabled();
  if (user?.api && accounts) {
    const api = await apiAccessToken(request);
    if (!api?.token && api?.cookies?.clear) {
      const response = NextResponse.json({ user: null, accounts }, { headers: noStore });
      response.cookies.delete({ name: SESSION_COOKIE, path: "/" });
      return withApiCookies(response, api.cookies, request);
    }
    const response = NextResponse.json({ user: publicUser(user), accounts }, { headers: noStore });
    return withApiCookies(response, api?.cookies, request);
  }
  return NextResponse.json({ user: user ? publicUser(user) : null, accounts }, { headers: noStore });
}

const publicUser = (user: { name: string; email: string; picture?: string }) => ({ name: user.name, email: user.email, ...(user.picture ? { picture: user.picture } : {}) });
