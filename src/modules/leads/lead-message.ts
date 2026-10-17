/**
 * Arma el texto de una solicitud a partir del propio formulario, para enviarla por correo o WhatsApp mientras no hay
 * registro en línea (nunca se inventa un folio). Usa las etiquetas visibles de cada campo, así el equipo de FUNDIGSAC
 * lee lo mismo que vio el cliente. El texto va en español.
 */
export type LeadMessage = { subject: string; body: string };

/** Campos que no son datos de la solicitud: trampa anti-bots y botones. */
const SKIP_NAMES = new Set(["website"]);
const SKIP_TYPES = new Set(["submit", "button", "reset", "image", "hidden", "password"]);

const clean = (v: string) => v.replace(/\s+/g, " ").trim();
const labelOf = (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
  const text = el.labels?.[0]?.textContent ?? el.getAttribute("aria-label") ?? el.name;
  // Quita el asterisco de obligatorio y los dos puntos finales.
  return clean(text.replace(/\*/g, "")).replace(/:$/, "");
};

/** Pares etiqueta-valor de los campos con datos, en el orden del formulario. */
export function formEntries(form: HTMLFormElement): [string, string][] {
  const out: [string, string][] = [];
  for (const el of Array.from(form.elements)) {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) continue;
    if (!el.name || SKIP_NAMES.has(el.name) || el.disabled || el.closest("[aria-hidden='true']")) continue;
    if (el instanceof HTMLInputElement) {
      if (SKIP_TYPES.has(el.type)) continue;
      if ((el.type === "checkbox" || el.type === "radio") && !el.checked) continue;
      if (el.type === "file") {
        const names = Array.from(el.files ?? []).map((f) => f.name);
        if (names.length) out.push([labelOf(el), `${names.join(", ")} (adjuntar al enviar)`]);
        continue;
      }
      if (el.type === "checkbox") {
        out.push([labelOf(el), "Sí"]);
        continue;
      }
      if (el.type === "radio") {
        out.push([clean(el.closest("fieldset")?.querySelector("legend")?.textContent ?? el.name), labelOf(el)]);
        continue;
      }
    }
    const value = el instanceof HTMLSelectElement ? (el.selectedOptions[0]?.textContent ?? el.value) : el.value;
    if (clean(value)) out.push([labelOf(el), el instanceof HTMLTextAreaElement ? value.replace(/\r\n/g, "\n").trim() : clean(value)]);
  }
  return out;
}

export function buildLeadMessage(title: string, entries: [string, string][], extra?: string, now: Date = new Date()): LeadMessage {
  const date = now.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const lines = [`${title.toUpperCase()}: FUNDIGSAC`, `Fecha: ${date}`, "", ...entries.map(([k, v]) => (v.includes("\n") ? `${k}:\n${v}` : `${k}: ${v}`))];
  if (extra) lines.push("", extra);
  const company = entries.find(([k]) => /raz[oó]n social|empresa/i.test(k))?.[1];
  return { subject: `${title} FUNDIGSAC${company ? `: ${company}` : ""}`, body: lines.join("\n") };
}
