"use server";

import { PENDING_QUOTE_REFERENCE } from "@/modules/quote/format";
import { isLeadFormId } from "./forms";
import type { LeadResult } from "./types";
import { validateLead } from "./validation";

/** Etapa de diseño: valida el formulario pero no persiste nada (sin BD). */
export async function submitLead(formId: string, data: FormData): Promise<LeadResult> {
  if (!isLeadFormId(formId)) return { ok: false, message: "Formulario no reconocido." };
  const validated = validateLead(formId, data);
  if ("fieldErrors" in validated) {
    return { ok: false, message: "Revise los campos marcados.", fieldErrors: validated.fieldErrors };
  }
  return { ok: true, reference: PENDING_QUOTE_REFERENCE };
}
