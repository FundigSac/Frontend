import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const LEAD_KINDS = ["contact", "quote", "procurement", "claim"] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];

/** Solicitudes recibidas desde formularios públicos (contacto, cotización, requerimiento, reclamo). */
export const leadSubmissions = pgTable(
  "lead_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Folio público legible, p. ej. COT-2026-000123. */
    reference: text("reference").notNull().unique(),
    kind: text("kind", { enum: LEAD_KINDS }).notNull(),
    payload: jsonb("payload").$type<Record<string, string>>().notNull(),
    /** Si el visitante tenía sesión, se vincula por propietario. */
    userId: text("user_id"),
    /** Hash (no la IP) para control de abuso. */
    clientHash: text("client_hash"),
    status: text("status", { enum: ["received", "in_review", "answered", "closed"] }).notNull().default("received"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("lead_submissions_kind_created_idx").on(t.kind, t.createdAt), index("lead_submissions_user_idx").on(t.userId)],
);

export type LeadSubmission = typeof leadSubmissions.$inferSelect;
