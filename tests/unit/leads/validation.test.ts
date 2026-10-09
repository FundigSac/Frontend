import { describe, expect, it } from "vitest";
import { LEAD_FORMS, isLeadFormId } from "@/modules/leads/forms";
import { validateLead } from "@/modules/leads/validation";

const fd = (entries: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
};

const validContact = {
  fullName: "Ana Quispe", companyName: "Consorcio Sur", rucNumber: "20601839281", corporateEmail: "ana@consorcio.pe",
  phoneMobile: "+51 987 654 321", contactReason: "cotizacion", technicalMessage: "Requiero DN 200 PN 16", privacyConsent: "on",
};

describe("validateLead", () => {
  it("acepta un contacto completo y normaliza espacios", () => {
    const r = validateLead("contact", fd({ ...validContact, fullName: "  Ana Quispe  " }));
    expect("fields" in r && r.fields.fullName).toBe("Ana Quispe");
  });

  it("exige todos los campos obligatorios del diseño", () => {
    const r = validateLead("contact", fd({}));
    expect("fieldErrors" in r).toBe(true);
    if ("fieldErrors" in r) expect(Object.keys(r.fieldErrors).sort()).toEqual([...LEAD_FORMS.contact.required].sort());
  });

  it("rechaza correo, RUC y teléfono inválidos con mensajes por campo", () => {
    const r = validateLead("contact", fd({ ...validContact, corporateEmail: "no-es-correo", rucNumber: "123", phoneMobile: "abc" }));
    expect("fieldErrors" in r).toBe(true);
    if ("fieldErrors" in r) {
      expect(r.fieldErrors.corporateEmail).toMatch(/correo/i);
      expect(r.fieldErrors.rucNumber).toMatch(/11 dígitos/);
      expect(r.fieldErrors.phoneMobile).toMatch(/teléfono/i);
    }
  });

  it("descarta campos internos, honeypot y caracteres de control; trunca campos largos", () => {
    const r = validateLead("contact", fd({ ...validContact, _form: "x", website: "bot", technicalMessage: `hola\u0000${"a".repeat(5000)}` }));
    expect("fields" in r).toBe(true);
    if ("fields" in r) {
      expect(r.fields).not.toHaveProperty("website");
      expect(r.fields).not.toHaveProperty("_form");
      expect(r.fields.technicalMessage.length).toBe(4000);
      expect(r.fields.technicalMessage.includes("\u0000")).toBe(false);
    }
  });

  it("registra metadatos de adjuntos sin almacenar el archivo", () => {
    const form = fd({ ...validContact });
    form.append("fileUpload", new File(["contenido"], "plano.pdf", { type: "application/pdf" }));
    const r = validateLead("contact", form);
    expect("fields" in r && r.fields._adjuntosNoAlmacenados).toMatch(/plano\.pdf/);
  });

  it("valida que cada formulario registrado tenga prefijo de folio de 3 letras", () => {
    for (const spec of Object.values(LEAD_FORMS)) expect(spec.prefix).toMatch(/^[A-Z]{3}$/);
  });

  it("isLeadFormId sólo acepta ids registrados", () => {
    expect(isLeadFormId("contact")).toBe(true);
    expect(isLeadFormId("__proto__")).toBe(false);
    expect(isLeadFormId(undefined)).toBe(false);
  });
});
