import { SITE } from "@/shared/config/site";

/**
 * Arma el texto de la hoja de reclamación para enviarlo por correo o WhatsApp cuando el registro en línea
 * (base de datos) no está disponible. Sigue la estructura del Anexo I del D.S. N.° 101-2022-PCM
 * (proveedor, identificación del consumidor, bien contratado, detalle y pedido).
 * El texto va siempre en español: es lo que lee el equipo de FUNDIGSAC.
 */
export type ClaimFields = {
  tipoReclamacion?: string;
  nombresYApellidosRazon?: string;
  tipoDeDocumento?: string;
  numeroDeDocumento?: string;
  correoElectronico?: string;
  telefonoDeContacto?: string;
  domicilioLegalOHabitual?: string;
  /** "Sí" cuando quien reclama es menor de edad y actúa con su padre, madre o representante. */
  esMenorDeEdad?: string;
  representanteNombre?: string;
  representanteDocumento?: string;
  /** PRODUCTO o SERVICIO (solo reclamos). */
  tipoDeBien?: string;
  descripcionDelProductoO?: string;
  montoReclamado?: string;
  moneda?: string;
  /** Lugar o canal de atención (solo quejas). */
  lugarDeAtencion?: string;
  fechaDelSuceso?: string;
  nDeCotizacionO?: string;
  detalleDeLosHechos?: string;
  pedidoConcretoOPretension?: string;
  medioDeRespuesta?: string;
};

const clean = (v: string | undefined) => (v ?? "").replace(/\s+/g, " ").trim();
const multiline = (v: string | undefined) => (v ?? "").replace(/\r\n/g, "\n").trim();

/** 2026-10-10 → 10/10/2026 (si no es una fecha ISO, se deja tal cual). */
export function formatClaimDate(value: string | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : clean(value);
}

/** "1500" o "1 500,5" → "1,500.00" (si no es un número válido, se deja tal cual). */
export function formatClaimAmount(value: string | undefined, currency: string | undefined): string {
  const raw = clean(value);
  if (!raw) return "";
  const n = Number(raw.replace(/\s/g, "").replace(",", "."));
  const symbol = currency === "USD" ? "US$" : "S/";
  if (!Number.isFinite(n) || n < 0) return `${symbol} ${raw}`;
  return `${symbol} ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function buildClaimMessage(f: ClaimFields, now: Date = new Date()): { subject: string; body: string } {
  const isComplaint = f.tipoReclamacion === "QUEJA";
  const kind = isComplaint ? "Queja" : "Reclamo";
  const registered = now.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const doc = [clean(f.tipoDeDocumento), clean(f.numeroDeDocumento)].filter(Boolean).join(" ");
  const minor = f.esMenorDeEdad === "Sí";
  const amount = formatClaimAmount(f.montoReclamado, f.moneda);

  const lines = [
    "LIBRO DE RECLAMACIONES: HOJA DE RECLAMACIÓN",
    "N.° de hoja: se asigna al registrar la solicitud",
    `Fecha de registro: ${registered}`,
    "",
    "PROVEEDOR",
    `Razón social: ${SITE.registeredName} (${SITE.name})`,
    `RUC: ${SITE.ruc}`,
    `Domicilio: ${SITE.address}`,
    "",
    "1. IDENTIFICACIÓN DEL CONSUMIDOR RECLAMANTE",
    `Nombres y apellidos / razón social: ${clean(f.nombresYApellidosRazon)}`,
    `Documento: ${doc}`,
    `Domicilio: ${clean(f.domicilioLegalOHabitual)}`,
    `Teléfono de contacto: ${clean(f.telefonoDeContacto)}`,
    `Correo electrónico: ${clean(f.correoElectronico)}`,
    ...(minor
      ? [
          "Menor de edad: Sí",
          `Padre, madre o representante: ${clean(f.representanteNombre)}`,
          `Documento del padre, madre o representante: ${clean(f.representanteDocumento)}`,
        ]
      : []),
    "",
    isComplaint ? "2. ATENCIÓN RECIBIDA" : "2. IDENTIFICACIÓN DEL BIEN CONTRATADO",
    ...(isComplaint
      ? [`Lugar o canal de atención: ${clean(f.lugarDeAtencion)}`]
      : [
          `Tipo de bien: ${f.tipoDeBien === "SERVICIO" ? "Servicio" : "Producto"}`,
          `Descripción: ${clean(f.descripcionDelProductoO)}`,
          ...(amount ? [`Monto reclamado: ${amount}`] : []),
        ]),
    `Fecha del suceso: ${formatClaimDate(f.fechaDelSuceso)}`,
    ...(clean(f.nDeCotizacionO) ? [`N° de orden de compra, factura u otro: ${clean(f.nDeCotizacionO)}`] : []),
    "",
    "3. DETALLE DE LA RECLAMACIÓN Y PEDIDO DEL CONSUMIDOR",
    `Tipo: ${kind.toUpperCase()}${isComplaint ? " (malestar o descontento respecto a la atención al público)" : " (disconformidad relacionada con los productos o servicios)"}`,
    "",
    isComplaint ? "DETALLE DE LA QUEJA" : "DETALLE DEL RECLAMO",
    multiline(f.detalleDeLosHechos),
    "",
    "PEDIDO DEL CONSUMIDOR",
    multiline(f.pedidoConcretoOPretension),
    "",
    `MEDIO DE RESPUESTA: ${clean(f.medioDeRespuesta) || "Correo electrónico"}`,
    "",
    "El consumidor declara que la información registrada es veraz y acepta que sea tratada para la gestión de su solicitud, de acuerdo con la Política de privacidad (Ley N.° 29733).",
    "La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI. El proveedor responde por escrito en un plazo no mayor a quince (15) días hábiles, improrrogables.",
  ];
  const who = clean(f.nombresYApellidosRazon);
  return { subject: `${kind} FUNDIGSAC${who ? `: ${who}` : ""}`, body: lines.join("\n") };
}

export const mailtoUrl = (email: string, subject: string, body: string) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const whatsappUrl = (number: string, text: string) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
