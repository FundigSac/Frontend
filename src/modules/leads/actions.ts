"use server";

import { headers } from "next/headers";
import { isLeadFormId } from "./forms";
import { hashClient, recordLead, type LeadResult } from "./service";
import { validateLead } from "./validation";

/** Acción de servidor única para los formularios públicos (Next verifica Origin/Host: protección CSRF). */
export async function submitLead(formId: string, data: FormData): Promise<LeadResult> {
  if (!isLeadFormId(formId)) return { ok: false, message: "Formulario no reconocido." };
  if (typeof data.get("website") === "string" && data.get("website")) {
    // Honeypot: responde como éxito sin persistir para no dar señal a bots.
    return { ok: true, reference: "REC-0000-000000" };
  }
  const validated = validateLead(formId, data);
  if ("fieldErrors" in validated) {
    return { ok: false, message: "Revise los campos marcados.", fieldErrors: validated.fieldErrors };
  }
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  try {
    return await recordLead({ formId, fields: validated.fields, clientHash: hashClient(ip, h.get("user-agent") ?? "") });
  } catch (error) {
    console.error("[leads] no se pudo registrar la solicitud", error instanceof Error ? error.message : "error");
    return { ok: false, message: "No pudimos registrar su solicitud en este momento. Inténtelo nuevamente en unos minutos." };
  }
}
