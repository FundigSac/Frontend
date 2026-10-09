import "server-only";
import { createHmac, randomInt } from "node:crypto";
import { and, count, eq, gt } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { leadSubmissions } from "@/server/db/schema/leads";
import { LEAD_FORMS, type LeadFormId } from "./forms";

export type LeadResult =
  | { ok: true; reference: string; confirmation?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

export function hashClient(ip: string, userAgent: string): string {
  const secret = process.env.LEAD_HASH_SECRET ?? (process.env.NODE_ENV === "production" ? "" : "dev-only-secret");
  if (!secret) throw new Error("LEAD_HASH_SECRET es obligatorio en producción.");
  return createHmac("sha256", secret).update(`${ip}|${userAgent}`).digest("hex").slice(0, 32);
}

export async function recordLead(input: { formId: LeadFormId; fields: Record<string, string>; clientHash: string; userId?: string | null }): Promise<LeadResult> {
  const spec = LEAD_FORMS[input.formId];
  const db = await getDb();

  const since = new Date(Date.now() - RATE_LIMIT.windowMs);
  const [{ value: recent }] = await db
    .select({ value: count() })
    .from(leadSubmissions)
    .where(and(eq(leadSubmissions.clientHash, input.clientHash), gt(leadSubmissions.createdAt, since)));
  if (recent >= RATE_LIMIT.max) {
    return { ok: false, message: "Recibimos varias solicitudes desde su conexión. Espere unos minutos e inténtelo nuevamente." };
  }

  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = `${spec.prefix}-${year}-${String(randomInt(0, 1_000_000)).padStart(6, "0")}`;
    try {
      await db.insert(leadSubmissions).values({
        reference,
        kind: spec.kind,
        payload: { _form: input.formId, ...input.fields },
        clientHash: input.clientHash,
        userId: input.userId ?? null,
      });
      return { ok: true, reference, confirmation: spec.confirmation };
    } catch (error) {
      const code = (error as { code?: string; cause?: { code?: string } }).code ?? (error as { cause?: { code?: string } }).cause?.code;
      if (code !== "23505") throw error; // sólo reintenta colisión de folio
    }
  }
  return { ok: false, message: "No se pudo generar el folio de su solicitud. Inténtelo nuevamente." };
}

export async function findLeadSummary(reference: string) {
  if (!/^[A-Z]{3}-\d{4}-\d{6}$/.test(reference)) return null;
  const db = await getDb();
  const [row] = await db
    .select({ reference: leadSubmissions.reference, kind: leadSubmissions.kind, createdAt: leadSubmissions.createdAt })
    .from(leadSubmissions)
    .where(eq(leadSubmissions.reference, reference))
    .limit(1);
  return row ?? null;
}
