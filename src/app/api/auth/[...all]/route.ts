import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/server/auth/auth";

// El handler de Better Auth (sign-in, sign-up, callbacks OAuth, verify-email, reset-password…).
// Rate limit, validación de Origin/CSRF y cookies se configuran en src/server/auth/auth.ts.
export const dynamic = "force-dynamic";

const handlers = toNextJsHandler({ handler: async (request: Request) => (await getAuth()).handler(request) });
export const { GET, POST } = handlers;
