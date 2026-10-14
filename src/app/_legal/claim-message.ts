/**
 * Arma el texto del reclamo/queja para enviarlo por correo o WhatsApp cuando el registro en línea (base de datos)
 * no está disponible. El texto va siempre en español: es lo que lee el equipo de FUNDIGSAC.
 */
export type ClaimFields = {
  tipoReclamacion?: string;
  nombresYApellidosRazon?: string;
  tipoDeDocumento?: string;
  numeroDeDocumento?: string;
  correoElectronico?: string;
  telefonoDeContacto?: string;
  domicilioLegalOHabitual?: string;
  descripcionDelProductoO?: string;
  fechaDelSuceso?: string;
  nDeCotizacionO?: string;
  detalleDeLosHechos?: string;
  pedidoConcretoOPretension?: string;
  canalesDeRespuesta?: readonly string[];
};

const clean = (v: string | undefined) => (v ?? "").replace(/\s+/g, " ").trim();
const multiline = (v: string | undefined) => (v ?? "").replace(/\r\n/g, "\n").trim();

/** 2026-10-10 → 10/10/2026 (si no es una fecha ISO, se deja tal cual). */
export function formatClaimDate(value: string | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : clean(value);
}

export function buildClaimMessage(f: ClaimFields, now: Date = new Date()): { subject: string; body: string } {
  const kind = f.tipoReclamacion === "QUEJA" ? "Queja" : "Reclamo";
  const registered = now.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const doc = [clean(f.tipoDeDocumento), clean(f.numeroDeDocumento)].filter(Boolean).join(" ");
  const lines = [
    "LIBRO DE RECLAMACIONES – FUNDIGSAC",
    `Tipo de solicitud: ${kind}`,
    `Fecha de registro: ${registered}`,
    "",
    "DATOS DEL CONSUMIDOR",
    `Nombres y apellidos / razón social: ${clean(f.nombresYApellidosRazon)}`,
    `Documento: ${doc}`,
    `Correo electrónico: ${clean(f.correoElectronico)}`,
    `Teléfono de contacto: ${clean(f.telefonoDeContacto)}`,
    `Dirección: ${clean(f.domicilioLegalOHabitual)}`,
    "",
    "IDENTIFICACIÓN DEL BIEN O SERVICIO",
    `Producto o servicio relacionado: ${clean(f.descripcionDelProductoO)}`,
    `Fecha del suceso: ${formatClaimDate(f.fechaDelSuceso)}`,
    ...(clean(f.nDeCotizacionO) ? [`N° de orden de compra, factura u otro: ${clean(f.nDeCotizacionO)}`] : []),
    "",
    kind === "Queja" ? "DETALLE DE LA QUEJA" : "DETALLE DEL RECLAMO",
    multiline(f.detalleDeLosHechos),
    "",
    "PEDIDO DEL CONSUMIDOR",
    multiline(f.pedidoConcretoOPretension),
    "",
    `CANALES DE RESPUESTA: ${(f.canalesDeRespuesta ?? []).join(", ") || "Correo electrónico"}`,
    "",
    "El consumidor declara que la información registrada es veraz y acepta que sea tratada para la gestión de su solicitud, de acuerdo con la Política de privacidad.",
  ];
  const who = clean(f.nombresYApellidosRazon);
  return { subject: `${kind} FUNDIGSAC${who ? ` – ${who}` : ""}`, body: lines.join("\n") };
}

export const mailtoUrl = (email: string, subject: string, body: string) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const whatsappUrl = (number: string, text: string) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
