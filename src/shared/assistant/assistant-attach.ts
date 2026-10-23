/** Adjuntos del chat: se preparan en el navegador (imagen reducida, PDF en base64, texto recortado) antes de enviarse. */

export type PendingAttachment =
  | { kind: "image"; name: string; data: string; thumb: string }
  | { kind: "pdf"; name: string; data: string }
  | { kind: "text"; name: string; text: string };

/** Lo que se guarda en la conversación: sin los datos del archivo, para no llenar el almacenamiento de la pestaña. */
export type AttachmentInfo = { kind: PendingAttachment["kind"]; name: string; thumb?: string };

export type AttachError = "unsupported" | "too_big" | "read";

export const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf,text/plain,text/csv,text/markdown,application/json,.txt,.csv,.md,.json,.pdf";

const MAX_PDF_BYTES = 2_500_000;
const MAX_TEXT_BYTES = 400_000;
const MAX_TEXT_CHARS = 12_000;
const MAX_IMAGE_SIDE = 1280;
const MAX_IMAGE_CHARS = 1_500_000;

export const infoOf = (a: PendingAttachment): AttachmentInfo => ({ kind: a.kind, name: a.name, thumb: a.kind === "image" ? a.thumb : undefined });

/** Nombres que pone la cámara o el sistema (IMG_2026…, image.jpg, un UUID): no dicen nada a la persona, se muestran como «Foto». */
export function isGeneratedName(name: string): boolean {
  const stem = name.replace(/\.[^.]+$/, "").trim();
  return !stem || /^(image|img|photo|foto|dsc|pxl|mvimg|screenshot|captura|whatsapp|camera|cam|capture|snap|blob|download)/i.test(stem) || /\d{6,}/.test(stem) || /^[0-9a-f-]{16,}$/i.test(stem);
}

const toBase64 = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

async function shrinkImage(file: File): Promise<{ data: string; thumb: string }> {
  const bitmap = await createImageBitmap(file);
  const draw = (side: number, quality: number) => {
    const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  };
  let data = draw(MAX_IMAGE_SIDE, 0.82);
  if (data.length > MAX_IMAGE_CHARS) data = draw(900, 0.7);
  const thumb = draw(96, 0.7);
  bitmap.close();
  if (data.length > MAX_IMAGE_CHARS) throw new Error("too_big");
  return { data, thumb };
}

export async function prepareAttachment(file: File): Promise<{ ok: true; attachment: PendingAttachment } | { ok: false; error: AttachError }> {
  const name = file.name.slice(0, 120) || "archivo";
  const lower = name.toLowerCase();
  try {
    if (/^image\/(jpeg|png|webp)$/.test(file.type)) {
      const { data, thumb } = await shrinkImage(file);
      return { ok: true, attachment: { kind: "image", name, data, thumb } };
    }
    if (file.type === "application/pdf" || lower.endsWith(".pdf")) {
      if (file.size > MAX_PDF_BYTES) return { ok: false, error: "too_big" };
      return { ok: true, attachment: { kind: "pdf", name, data: await toBase64(file) } };
    }
    if (/^(text\/(plain|csv|markdown)|application\/json)$/.test(file.type) || /\.(txt|csv|md|json)$/.test(lower)) {
      if (file.size > MAX_TEXT_BYTES) return { ok: false, error: "too_big" };
      return { ok: true, attachment: { kind: "text", name, text: (await file.text()).slice(0, MAX_TEXT_CHARS) } };
    }
    return { ok: false, error: "unsupported" };
  } catch (error) {
    return { ok: false, error: error instanceof Error && error.message === "too_big" ? "too_big" : "read" };
  }
}

/** Vista previa (primera página) de cada documento del sitio, en su variante de 384 px. */
const DOC_PREVIEWS: Record<string, string> = {
  "/docs/ficha-tecnica-valvula-compuerta-bridada.pdf": "/media/valvula-ficha/ficha-p1-w384.webp",
  "/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf": "/media/valvula-ficha/ft-fundigsac-p1-w384.webp",
  "/docs/ficha-tecnica-valvula-compuerta-fundigsac-garantia-extendida.pdf": "/media/valvula-ficha/ficha-garantia-extendida-r4-p1-w384.webp",
  "/docs/flyer-valvula-compuerta-fundigsac-volante.pdf": "/media/valvula-ficha/flyer-volante-r5-w384.webp",
  "/docs/flyer-valvula-compuerta-fundigsac-dado.pdf": "/media/valvula-ficha/flyer-dado-r5-w384.webp",
};

/** Número de WhatsApp o enlace wa.me dentro de una respuesta: se muestra además como botón. */
export function whatsappMention(body: string): boolean {
  return /wa\.me\/|\+?51\s?9\d{2}\s?\d{3}\s?\d{3}/.test(body);
}

/** Enlaces a PDF del sitio dentro de una respuesta ([texto](/docs/archivo.pdf)): se muestran además como tarjetas de descarga. */
export function docLinks(body: string, extra: { href: string; title: string }[] = []): { href: string; title: string; preview?: string }[] {
  const out = new Map<string, string>();
  for (const d of extra) if (!out.has(d.href)) out.set(d.href, d.title);
  for (const m of body.matchAll(/\[([^\]]{1,120})\]\((\/docs\/[A-Za-z0-9._\-/]+\.pdf)\)/g)) if (!out.has(m[2])) out.set(m[2], m[1]);
  return [...out].map(([href, title]) => ({ href, title, preview: DOC_PREVIEWS[href] }));
}
