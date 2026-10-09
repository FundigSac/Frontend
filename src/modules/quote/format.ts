/** Fecha y hora de un registro en hora de Lima, p. ej. "15 de enero de 2026 · 10:45 hrs (PET)". */
export function formatLimaDateTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")} de ${get("month")} de ${get("year")} · ${get("hour")}:${get("minute")} hrs (PET)`;
}

const KIND_LABELS: Record<string, string> = {
  quote: "Solicitud de cotización",
  contact: "Consulta de contacto",
  procurement: "Requerimiento de compra",
  claim: "Reclamación",
};
export const leadKindLabel = (kind: string): string => KIND_LABELS[kind] ?? "Solicitud";

/** Folio con forma válida (PPP-YYYY-NNNNNN). No implica que exista. */
export const isLeadReference = (value: unknown): value is string => typeof value === "string" && /^[A-Z]{3}-\d{4}-\d{6}$/.test(value);
