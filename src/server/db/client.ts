import "server-only";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import * as schema from "./schema";

/**
 * Acceso a datos aislado (ADR-001: PostgreSQL estándar, proveedor pendiente).
 *  - Producción / staging: DATABASE_URL → node-postgres.
 *  - Desarrollo sin DATABASE_URL: PGlite (Postgres embebido) persistido en .data/pglite.
 * El resto de la aplicación sólo importa `getDb()`.
 */
type Db = ReturnType<typeof import("drizzle-orm/node-postgres").drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as { __fundigsacDb?: Promise<Db> };

async function create(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    return drizzle(new Pool({ connectionString: url, max: 10 }), { schema });
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL es obligatorio en producción.");
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dataDir = process.env.PGLITE_DATA_DIR?.trim() || path.join(process.cwd(), ".data", "pglite");
  await mkdir(path.dirname(dataDir), { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  // PGlite y node-postgres comparten la API de consultas de drizzle; se tipa con la segunda.
  return db as unknown as Db;
}

export function getDb(): Promise<Db> {
  return (globalForDb.__fundigsacDb ??= create());
}

export { schema };
