import { SITE } from "@/shared/config/site";

/**
 * Texto de la solicitud de supresión (eliminación de cuenta y datos) para enviarla por correo o WhatsApp.
 * Recoge los requisitos del art. 64 del Reglamento de la Ley N.° 29733 (D.S. N.° 016-2024-JUS): nombres y
 * apellidos, petición concreta, dirección electrónica para notificaciones, fecha y firma. Va siempre en español:
 * es lo que lee el equipo de FUNDIGSAC.
 */
export type DeletionMethod = "google" | "facebook" | "email" | "none";
export type DeletionScope = "all" | "account" | "marketing";

export type DeletionFields = {
  name: string;
  email: string;
  method: DeletionMethod;
  scope: DeletionScope;
  doc?: string;
  details?: string;
};

const METHOD: Record<DeletionMethod, string> = {
  google: "Inicio de sesión con Google",
  facebook: "Inicio de sesión con Facebook",
  email: "Correo y contraseña",
  none: "No tengo cuenta (solo mis datos de contacto)",
};

const PETITION: Record<DeletionScope, string> = {
  all: "Solicito la eliminación de mi cuenta y de todos mis datos personales: perfil de acceso, cotizaciones, mensajes de contacto y comunicaciones comerciales.",
  account: "Solicito la eliminación de mi cuenta (perfil de acceso y sesión). Pueden conservar mis cotizaciones y mensajes.",
  marketing: "Solicito dejar de recibir comunicaciones comerciales y que eliminen mi correo y teléfono de sus listas de publicidad y seguimiento comercial (art. 26.5 del Reglamento).",
};

const clean = (v: string | undefined) => (v ?? "").replace(/\s+/g, " ").trim();
const multiline = (v: string | undefined) => (v ?? "").replace(/\r\n/g, "\n").trim();
const pad = (n: number) => String(n).padStart(2, "0");

/** Sin 0/O ni 1/I/L para que el código se pueda dictar por teléfono sin confusiones. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** ELIM-AAAAMMDD-XXXX: fecha de la solicitud y 4 caracteres aleatorios. */
export function deletionReference(now: Date = new Date(), random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  const tail = Array.from(random(4), (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `ELIM-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${tail}`;
}

export function buildDeletionMessage(f: DeletionFields, reference: string, now: Date = new Date()): { subject: string; body: string } {
  const name = clean(f.name);
  const doc = clean(f.doc);
  const details = multiline(f.details);
  const lines = [
    "SOLICITUD DE SUPRESIÓN DE DATOS PERSONALES Y ELIMINACIÓN DE CUENTA",
    `Código de seguimiento: ${reference}`,
    `Fecha de la solicitud: ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`,
    "",
    "RESPONSABLE DEL TRATAMIENTO",
    `${SITE.registeredName} (${SITE.name}) · RUC ${SITE.ruc}`,
    SITE.address,
    "",
    "1. TITULAR DE LOS DATOS",
    `Nombres y apellidos: ${name}`,
    `Correo para notificaciones: ${clean(f.email)}`,
    `Documento de identidad: ${doc || "No indicado (escribo desde el correo asociado a mi cuenta)"}`,
    `Acceso a ${SITE.name}: ${METHOD[f.method]}`,
    "",
    "2. PETICIÓN CONCRETA",
    PETITION[f.scope],
    ...(details ? ["", "3. INFORMACIÓN ADICIONAL", details] : []),
    "",
    "Declaro que la información es veraz y que entiendo que la eliminación es definitiva. Presento esta solicitud al amparo del artículo 20 de la Ley N.° 29733, Ley de Protección de Datos Personales, y de los artículos 64, 69 y 82 a 85 de su Reglamento (D.S. N.° 016-2024-JUS), y solicito la constancia de supresión prevista en su artículo 83.",
    "",
    `Firma: ${name}`,
  ];
  return { subject: `Eliminación de cuenta y datos · ${reference}${name ? ` · ${name}` : ""}`, body: lines.join("\n") };
}
