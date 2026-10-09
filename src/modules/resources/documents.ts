/**
 * Registro de documentos descargables. Sólo los documentos con `file` (PDF autorizado, en /public/docs)
 * se descargan; el resto se ofrece "bajo solicitud" (no se simulan descargas inexistentes).
 * Pendiente: FUNDIGSAC debe aportar y autorizar los archivos oficiales (ver docs/content/MISSING_ASSETS.md).
 */
export type DocumentEntry = { id: string; title: string; file?: string };

export const DOCUMENTS: Record<string, DocumentEntry> = {};

export const requestDocumentHref = (title: string) =>
  `/contacto?motivo=documentacion&documento=${encodeURIComponent(title.slice(0, 120))}`;

export function documentHref(title: string): { href: string; download: boolean } {
  const entry = Object.values(DOCUMENTS).find((d) => d.title === title);
  return entry?.file ? { href: entry.file, download: true } : { href: requestDocumentHref(title), download: false };
}
