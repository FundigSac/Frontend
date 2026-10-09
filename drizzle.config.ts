import { defineConfig } from "drizzle-kit";

// Migraciones versionadas en ./drizzle. En producción: DATABASE_URL (PostgreSQL).
// En desarrollo sin DATABASE_URL se usa PGlite (Postgres embebido) en ./.data/pglite.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  ...(process.env.DATABASE_URL ? { dbCredentials: { url: process.env.DATABASE_URL } } : {}),
});
