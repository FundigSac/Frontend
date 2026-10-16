import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, noStore, sameOrigin } from "@/modules/auth/server";

export const runtime = "nodejs";

/** Cierra la sesión (solo POST y mismo origen, para que otra web no pueda cerrarla). */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden" }, { status: 403, headers: noStore });
  const response = NextResponse.json({ ok: true }, { headers: noStore });
  response.cookies.delete({ name: SESSION_COOKIE, path: "/" });
  return response;
}
