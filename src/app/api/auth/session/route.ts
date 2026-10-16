import type { NextRequest } from "next/server";
import { noStore, readSession } from "@/modules/auth/server";

export const runtime = "nodejs";

/** Usuario de la sesión actual (o null). Lo lee el cliente: así las páginas siguen siendo estáticas. */
export async function GET(request: NextRequest) {
  return Response.json({ user: await readSession(request) }, { headers: noStore });
}
