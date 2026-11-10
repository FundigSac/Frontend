/**
 * Medidas de una ficha (X1-4, X5-4, B10-2): las variantes de la lista de precios ("DN50 · 2\"", "355 mm · SDR17",
 * "HDL 160-2M · 40–160 mm · 42,5 kg") se separan en columnas sin agregar ningún dato que la etiqueta no tenga.
 */

export type VariantColumn = "model" | "dn" | "inch" | "size" | "detail" | "weight" | "sdr";

export type VariantRow = { key: string; label: string; cells: Partial<Record<VariantColumn, string>> };

export type VariantTableData = { columns: VariantColumn[]; rows: VariantRow[] };

const ORDER: readonly VariantColumn[] = ["model", "dn", "inch", "size", "detail", "weight", "sdr"];

export const VARIANT_HEADERS: Record<"es" | "en", Record<VariantColumn, string>> = {
  es: { model: "Modelo", dn: "DN", inch: "Pulgadas", size: "Medida", detail: "Detalle", weight: "Peso", sdr: "Serie SDR" },
  en: { model: "Model", dn: "DN", inch: "Inches", size: "Size", detail: "Detail", weight: "Weight", sdr: "SDR series" },
};

/** Qué es cada trozo de la etiqueta. El primero sin número reconocible es el modelo; los demás, un detalle. */
export function classifyPart(part: string, index: number): VariantColumn {
  if (/^DN\s?\d+$/i.test(part)) return "dn";
  if (/^\d[\d\s/]*"$/.test(part)) return "inch";
  if (/^SDR\s?\d+/i.test(part)) return "sdr";
  if (/\d\s?kg$/i.test(part)) return "weight";
  if (/\d\s?mm\b/i.test(part) || /×/.test(part)) return "size";
  return index === 0 ? "model" : "detail";
}

/** Clave estable y legible para la dirección (?medida=dn150-6): sin tildes, comillas ni espacios. */
export function variantKey(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Tabla de variantes. `keyLabels` son las etiquetas en español (dan la clave de la dirección, la misma en los dos
 * idiomas); `labels`, las del idioma que se muestra. Devuelve null si hay menos de dos medidas: no hay nada que comparar.
 */
export function variantTable(labels: readonly string[], keyLabels: readonly string[] = labels): VariantTableData | null {
  if (labels.length < 2) return null;
  const used = new Set<VariantColumn>();
  const rows = labels.map((label, i) => {
    const cells: Partial<Record<VariantColumn, string>> = {};
    label.split(" · ").map((p) => p.trim()).filter(Boolean).forEach((part, index) => {
      const column = classifyPart(part, index);
      cells[column] = cells[column] ? `${cells[column]} · ${part}` : part;
      used.add(column);
    });
    return { key: variantKey(keyLabels[i] ?? label), label, cells };
  });
  return { columns: ORDER.filter((c) => used.has(c)), rows };
}

/**
 * Presión nominal publicada en la ficha ("ISO PN16" → "PN16"). Solo la clase principal: lo que va entre paréntesis
 * ("DN200 también PN10") depende de la medida y se queda en la tabla técnica.
 */
export function pressureOf(specs: readonly (readonly [string, string])[]): string | undefined {
  for (const [label, value] of specs) {
    if (!/^(clase|clase de brida|presi[oó]n|class|flange class|pressure)$/i.test(label.trim())) continue;
    const main = value.replace(/\([^)]*\)/g, "");
    const match = /PN\s?(\d+)/i.exec(main);
    if (match) return `PN${match[1]}`;
  }
  return undefined;
}

/** Texto de la variante que llega al carrito: la medida y, si la ficha la publica, la presión. */
export function cartVariant(label: string | undefined, pressure: string | undefined): string | undefined {
  if (!pressure) return label;
  if (!label) return pressure;
  return /\bPN\s?\d+/i.test(label) ? label : `${label} · ${pressure}`;
}
