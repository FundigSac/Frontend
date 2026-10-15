/**
 * Arma el texto de la consulta de contacto para enviarlo por correo o WhatsApp (no hay registro en línea:
 * nunca se inventa un folio). El texto va siempre en español: es lo que lee el equipo de FUNDIGSAC.
 */
export type ContactFields = {
  name?: string;
  company?: string;
  position?: string;
  email?: string;
  phone?: string;
  message?: string;
  /** Motivo ya traducido al español (p. ej. "Solicitud de documentación"). */
  reason?: string;
};

const clean = (v: string | undefined) => (v ?? "").replace(/\s+/g, " ").trim();
const multiline = (v: string | undefined) => (v ?? "").replace(/\r\n/g, "\n").trim();

export function buildContactMessage(f: ContactFields, now: Date = new Date()): { subject: string; body: string } {
  const date = now.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const who = clean(f.name);
  const lines = [
    "CONSULTA DE CONTACTO: FUNDIGSAC",
    `Fecha: ${date}`,
    ...(clean(f.reason) ? [`Motivo: ${clean(f.reason)}`] : []),
    "",
    "DATOS DE CONTACTO",
    `Nombre completo: ${who}`,
    `Empresa: ${clean(f.company)}`,
    ...(clean(f.position) ? [`Cargo: ${clean(f.position)}`] : []),
    `Correo electrónico: ${clean(f.email)}`,
    `Teléfono: ${clean(f.phone)}`,
    "",
    "MENSAJE",
    multiline(f.message),
    "",
    "Acepto que mis datos se traten para responder esta consulta, de acuerdo con la Política de privacidad de FUNDIGSAC.",
  ];
  return { subject: `Consulta de contacto FUNDIGSAC${who ? `: ${who}` : ""}`, body: lines.join("\n") };
}
