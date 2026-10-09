import type { LeadKind } from "@/server/db/schema/leads";

/**
 * Registro de formularios públicos. `required` replica los atributos `required` del diseño de Stitch;
 * el servidor valida de nuevo (el cliente nunca es de confianza).
 */
export type LeadFormId =
  | "contact" | "quote-general" | "quote-product" | "quote-valve-gate" | "quote-valve-butterfly"
  | "quote-pipe" | "quote-frame" | "procurement" | "claim";

export type LeadFormSpec = {
  kind: LeadKind;
  prefix: string;
  required: readonly string[];
  /** Ruta de confirmación (W24) cuando aplica. */
  confirmation?: string;
};

export const LEAD_FORMS: Record<LeadFormId, LeadFormSpec> = {
  contact: { kind: "contact", prefix: "CON", required: ["fullName", "companyName", "rucNumber", "corporateEmail", "phoneMobile", "contactReason", "technicalMessage", "privacyConsent"] },
  "quote-general": { kind: "quote", prefix: "COT", confirmation: "/cotizar/confirmacion", required: ["razonSocial", "rucEmpresa", "tipoProyecto", "departamentoDestino", "nombreSolicitante", "cargoSolicitante", "correoCorporativo", "celularContacto", "familiaPrincipal", "diametrosNominales", "cantidadMetrado", "consentimiento"] },
  "quote-product": { kind: "quote", prefix: "COT", confirmation: "/cotizar/confirmacion", required: ["input-qty", "ruc", "razon-social", "contact-name", "email", "phone", "delivery-place", "delivery-date"] },
  "quote-valve-gate": { kind: "quote", prefix: "COT", confirmation: "/cotizar/confirmacion", required: ["cantidadRequerida", "razonSocialEmpresaContratista", "ruc", "correoElectronicoCorporativo", "telefonoWhatsappDeContacto"] },
  "quote-valve-butterfly": { kind: "quote", prefix: "COT", confirmation: "/cotizar/confirmacion", required: ["razonSocialConsorcio", "ruc", "correoCorporativoDeCompras", "cantidadUnidades"] },
  "quote-pipe": { kind: "quote", prefix: "COT", confirmation: "/cotizar/confirmacion", required: ["company-name", "company-ruc", "contact-name", "contact-email", "form-metrado", "form-location"] },
  "quote-frame": { kind: "quote", prefix: "COT", confirmation: "/cotizar/confirmacion", required: ["empresa", "nombre", "email", "telefono", "cantidad", "destino", "terminos"] },
  procurement: { kind: "procurement", prefix: "REQ", required: ["contact-name", "company-ruc", "contact-email", "contact-phone", "lot-quantity"] },
  claim: { kind: "claim", prefix: "REC", required: ["tipoDeDocumento", "numeroDeDocumento", "telefonoDeContacto", "nombresYApellidosRazon", "correoElectronico", "domicilioLegalOHabitual", "descripcionDelProductoO", "detalleDeLosHechos", "pedidoConcretoOPretension", "declaracionJuradaDeVeracidad", "consentimientoLeyN29733"] },
};

export const isLeadFormId = (v: unknown): v is LeadFormId => typeof v === "string" && Object.hasOwn(LEAD_FORMS, v);
