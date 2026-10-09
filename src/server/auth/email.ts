import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { isProduction } from "./env";

/**
 * Abstracción de correo transaccional.
 *  - RESEND_API_KEY (+ EMAIL_FROM): envío real vía API HTTP de Resend (sin dependencias nuevas).
 *  - Sin configuración, en desarrollo/test: el mensaje se guarda en `.data/outbox/<ts>-<slug>.json`
 *    y se resume en consola, para poder probar verificación y recuperación localmente.
 *  - Sin configuración en producción: FALLA de forma explícita (nunca se finge un envío).
 * Jamás se envían contraseñas.
 */
export type OutgoingEmail = { to: string; subject: string; text: string; html: string };

export class EmailConfigError extends Error {
  constructor() {
    super("El envío de correo no está configurado en producción: define RESEND_API_KEY y EMAIL_FROM.");
    this.name = "EmailConfigError";
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

/** Debe llamarse al iniciar la autenticación: en producción exige un proveedor de correo. */
export function assertEmailReady(): void {
  if (isProduction() && !isEmailConfigured()) throw new EmailConfigError();
}

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "mensaje"
  );
}

export function outboxDir(): string {
  return process.env.AUTH_OUTBOX_DIR?.trim() || path.join(process.cwd(), ".data", "outbox");
}

async function writeToOutbox(message: OutgoingEmail): Promise<string> {
  const dir = outboxDir();
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${Date.now()}-${slugify(message.subject)}-${randomBytes(3).toString("hex")}.json`);
  await writeFile(file, JSON.stringify({ ...message, createdAt: new Date().toISOString() }, null, 2), { mode: 0o600 });
  return file;
}

export async function sendEmail(message: OutgoingEmail): Promise<void> {
  if (!message.to || !message.subject) throw new Error("sendEmail: destinatario y asunto son obligatorios.");
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (apiKey && from) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [message.to], subject: message.subject, text: message.text, html: message.html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      // No se registra el cuerpo (podría contener datos del destinatario) ni el contenido del mensaje.
      throw new Error(`Resend rechazó el envío (HTTP ${response.status}).`);
    }
    return;
  }
  if (isProduction()) throw new EmailConfigError();
  const file = await writeToOutbox(message);
  // Sólo desarrollo/test: el texto incluye el enlace, necesario para probar el flujo sin proveedor.
  console.info(`[auth][outbox] ${message.subject} → ${file}\n${message.text}`);
}
