"use client";

import { createAuthClient } from "better-auth/react";

/** Cliente de Better Auth (mismo origen: /api/auth). Las cookies de sesión son httpOnly: el JS nunca las lee. */
export const authClient = createAuthClient({ basePath: "/api/auth" });
