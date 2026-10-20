import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, noStore, sameOrigin } from "@/modules/auth/server";
import { callBackend } from "@/modules/backend/server";
import { API_COOKIE, storedRefreshToken } from "@/modules/backend/session";

export const runtime = "nodejs";

/**
 * Cierra la sesión (solo POST y mismo origen, para que otra web no pueda cerrarla). Si había sesión en la API, también
 * se revoca allí el refresh token, así una cookie copiada deja de servir.
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden" }, { status: 403, headers: noStore });
  const refreshToken = await storedRefreshToken(request);
  if (refreshToken) await callBackend("/api/v1/auth/logout", { body: { refreshToken }, request });
  const response = NextResponse.json({ ok: true }, { headers: noStore });
  response.cookies.delete({ name: SESSION_COOKIE, path: "/" });
  response.cookies.delete({ name: API_COOKIE, path: "/api" });
  return response;
}
