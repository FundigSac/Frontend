/**
 * Hoja del Libro de Reclamaciones del sitio → ComplaintRequest del Backend (POST /api/v1/complaints). La API asigna el
 * número correlativo (REC-AAAA-NNNNNN) y la fecha límite de respuesta en días hábiles (Ley 29571, mod. Ley 31435).
 */
export type ComplaintBody = Record<string, string | number | boolean | undefined>;

const DOCS: Record<string, string> = { DNI: "DNI", RUC: "RUC", CE: "CE", PASAPORTE: "PASSPORT" };
const CHANNELS: Record<string, string> = { "Correo electrónico": "EMAIL", "Carta al domicilio": "POSTAL_ADDRESS" };

export function complaintBody(data: FormData, privacyNoticeVersion: string): ComplaintBody {
  const text = (name: string) => String(data.get(name) ?? "").trim();
  const isClaim = text("tipoReclamacion") !== "QUEJA";
  const minor = Boolean(data.get("esMenorDeEdad"));
  const guardianDoc = text("representanteDocumento");
  const rawAmount = text("montoReclamado").replace(",", ".");
  const amount = isClaim && rawAmount ? Number.parseFloat(rawAmount) : Number.NaN;
  const hasAmount = Number.isFinite(amount) && amount >= 0;
  return {
    kind: isClaim ? "CLAIM" : "GRIEVANCE",
    consumerName: text("nombresYApellidosRazon").slice(0, 160),
    documentType: DOCS[text("tipoDeDocumento")] ?? text("tipoDeDocumento"),
    documentNumber: text("numeroDeDocumento").toUpperCase().slice(0, 12),
    email: text("correoElectronico"),
    phone: text("telefonoDeContacto").slice(0, 24),
    address: text("domicilioLegalOHabitual").slice(0, 300),
    minor,
    guardianName: minor ? text("representanteNombre").slice(0, 160) : undefined,
    // El formulario pide un solo número para el representante: 8 dígitos es DNI; cualquier otro, carné de extranjería.
    guardianDocumentType: minor && guardianDoc ? (/^\d{8}$/.test(guardianDoc) ? "DNI" : "CE") : undefined,
    guardianDocumentNumber: minor ? guardianDoc.toUpperCase().slice(0, 12) || undefined : undefined,
    goodType: isClaim ? (text("tipoDeBien") === "SERVICIO" ? "SERVICE" : "PRODUCT") : undefined,
    goodDescription: (isClaim ? `Producto o servicio: ${text("descripcionDelProductoO")}` : `Atención: ${text("lugarDeAtencion")}`).slice(0, 1000),
    claimedAmount: hasAmount ? Math.round(amount * 100) / 100 : undefined,
    currency: hasAmount ? text("moneda") || "PEN" : undefined,
    serviceLocation: isClaim ? undefined : text("lugarDeAtencion").slice(0, 200) || undefined,
    incidentDate: text("fechaDelSuceso"),
    relatedReference: text("nDeCotizacionO").slice(0, 60) || undefined,
    facts: text("detalleDeLosHechos").slice(0, 4000),
    consumerRequest: text("pedidoConcretoOPretension").slice(0, 2000),
    responseChannel: CHANNELS[text("medioDeRespuesta")] ?? "EMAIL",
    privacyNoticeVersion,
    acceptPrivacyNotice: Boolean(data.get("consentimientoLeyN29733")),
  };
}

/** Fecha límite de la API (AAAA-MM-DD) en palabras: "4 de noviembre de 2026". */
export function formatDueDate(isoDate: string, lang: "es" | "en"): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-PE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(y, m - 1, d));
}
