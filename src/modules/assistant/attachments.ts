import "server-only";

import { extractText, getDocumentProxy } from "unpdf";
import type { Attachment } from "./limits";

/** Texto de un adjunto que se manda al modelo: se recorta para cuidar los tokens del plan gratuito. */
export const ATTACHMENT_TEXT_CHARS = 6000;

export type ReadAttachment =
  | { ok: true; kind: "image"; name: string; dataUrl: string }
  | { ok: true; kind: "text"; name: string; text: string; truncated: boolean }
  | { ok: false; error: "unreadable_pdf" | "empty_file" };

const clean = (name: string) => name.replace(/[^\p{L}\p{N} ._()\-]/gu, "").slice(0, 80) || "archivo";

/** Convierte el adjunto validado en algo que el modelo pueda usar: imagen tal cual, PDF y texto como texto. */
export async function readAttachment(att: Attachment): Promise<ReadAttachment> {
  const name = clean(att.name);
  if (att.kind === "image") return { ok: true, kind: "image", name, dataUrl: att.data };
  let text: string;
  if (att.kind === "pdf") {
    try {
      const bytes = Uint8Array.from(Buffer.from(att.data, "base64"));
      if (String.fromCharCode(...bytes.slice(0, 4)) !== "%PDF") return { ok: false, error: "unreadable_pdf" };
      const pdf = await getDocumentProxy(bytes);
      text = (await extractText(pdf, { mergePages: true })).text;
    } catch {
      return { ok: false, error: "unreadable_pdf" };
    }
  } else {
    text = att.text;
  }
  text = text.replace(/\s+\n/g, "\n").replace(/[ \t]{2,}/g, " ").trim();
  if (!text) return { ok: false, error: "empty_file" };
  return { ok: true, kind: "text", name, text: text.slice(0, ATTACHMENT_TEXT_CHARS), truncated: text.length > ATTACHMENT_TEXT_CHARS };
}
