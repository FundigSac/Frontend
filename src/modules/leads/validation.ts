import { LEAD_FORMS, type LeadFormId } from "./forms";

const MAX_FIELD_LENGTH = 4000;
const MAX_FIELDS = 60;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+\d][\d\s().-]{6,19}$/;
const RUC = /^\d{11}$/;

const stripControl = (v: string) => v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

/** Valida y normaliza los campos; sólo texto, nunca archivos. */
export function validateLead(formId: LeadFormId, data: FormData): { fields: Record<string, string> } | { fieldErrors: Record<string, string> } {
  const spec = LEAD_FORMS[formId];
  const fields: Record<string, string> = {};
  const attachments: string[] = [];
  for (const [key, value] of data.entries()) {
    if (key.startsWith("_") || key === "website" || key.startsWith("$ACTION")) continue;
    if (typeof value !== "string") {
      if (value.size > 0) attachments.push(`${value.name} (${Math.round(value.size / 1024)} KB)`);
      continue;
    }
    const clean = stripControl(value).slice(0, MAX_FIELD_LENGTH);
    fields[key] = key in fields ? `${fields[key]}, ${clean}` : clean; // checkboxes múltiples
    if (Object.keys(fields).length > MAX_FIELDS) return { fieldErrors: { _form: "Formulario inválido." } };
  }
  if (attachments.length) fields["_adjuntosNoAlmacenados"] = attachments.join("; ");

  const fieldErrors: Record<string, string> = {};
  for (const name of spec.required) {
    if (!fields[name]) fieldErrors[name] = "Este campo es obligatorio.";
  }
  for (const [name, value] of Object.entries(fields)) {
    if (!value || fieldErrors[name]) continue;
    if (/mail|correo/i.test(name) && !EMAIL.test(value)) fieldErrors[name] = "Ingrese un correo electrónico válido.";
    else if (/^(ruc|company-ruc)$|ruc(Empresa|Number)?$/i.test(name) && !RUC.test(value.replace(/\s/g, ""))) fieldErrors[name] = "El RUC debe tener 11 dígitos.";
    else if ((/(phone|telefono|celular|whatsapp|mobile)/i.test(name) || name === "tel") && !PHONE.test(value)) fieldErrors[name] = "Ingrese un teléfono válido.";
  }
  return Object.keys(fieldErrors).length ? { fieldErrors } : { fields };
}

