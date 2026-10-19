import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";

/**
 * Ficha técnica descargable con la fecha de descarga del día.
 *
 * La plantilla del PDF (generada a partir de la ficha original) ya no trae versión ni "última actualización",
 * y su QR apunta a la ficha web del producto. En cada descarga solo se dibuja el bloque de cabecera: código,
 * fecha de emisión (fija: cuándo se hizo la plantilla) y fecha de descarga de hoy (hora de Lima), con la misma
 * tipografía y color que el resto del documento.
 */

export type Datasheet = {
  /** Archivo del PDF base dentro de `templates/`. */
  template: string;
  /** Código del documento que se imprime en la cabecera. */
  code: string;
  /** Fecha de emisión (DD/MM/AAAA): la de la plantilla; no cambia entre descargas. */
  issued: string;
  /** Nombre con el que se guarda el archivo descargado. */
  filename: string;
};

export const DATASHEETS: Record<"garantia-extendida", Datasheet> = {
  "garantia-extendida": {
    template: "ficha-tecnica-valvula-compuerta-fundigsac-garantia-extendida.pdf",
    code: "FT-HD-002-2024",
    issued: "14/04/2026",
    filename: "Ficha_Tecnica_Valvula_Compuerta_Bridada_FUNDIGSAC.pdf",
  },
};

/** Cabecera medida sobre la ficha original (puntos PDF, desde el borde superior de la hoja). */
const HEADER = { labelX: 300.5, colonX: 388.3, baselines: [43.5, 54, 64.5], size: 8.2, color: rgb(0.184, 0.435, 0.682) } as const;

const TEMPLATES = path.join(process.cwd(), "src/modules/datasheets/templates");
const FONT = path.join(process.cwd(), "src/modules/datasheets/fonts/OpenSans-Regular.ttf");

/** Fecha de hoy en Lima como DD/MM/AAAA, sin depender de la zona horaria del servidor (Vercel corre en UTC). */
export function limaDate(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Lima", day: "2-digit", month: "2-digit", year: "numeric" }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")}`;
}

export async function stampDatasheet(sheet: Datasheet, now: Date = new Date()): Promise<Uint8Array> {
  const [template, fontBytes] = await Promise.all([readFile(path.join(TEMPLATES, sheet.template)), readFile(FONT)]);
  const pdf = await PDFDocument.load(template);
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const date = limaDate(now);

  for (const page of pdf.getPages()) {
    const height = page.getHeight();
    const line = (label: string, value: string, baseline: number) => {
      const y = height - baseline;
      page.drawText(label, { x: HEADER.labelX, y, size: HEADER.size, font, color: HEADER.color });
      page.drawText(`:  ${value}`, { x: HEADER.colonX, y, size: HEADER.size, font, color: HEADER.color });
    };
    line("Código", sheet.code, HEADER.baselines[0]);
    line("Fecha de emisión", sheet.issued, HEADER.baselines[1]);
    line("Fecha de descarga", date, HEADER.baselines[2]);
  }

  pdf.setCreationDate(now);
  pdf.setModificationDate(now);
  return pdf.save();
}
