// Regenera la plantilla de la ficha técnica de la válvula compuerta FUNDIGSAC (garantía extendida) a partir del PDF original:
//  - borra del contenido (no tapa) código/versión/fechas de la cabecera, el QR anterior y "Última actualización";
//  - dibuja el QR vectorial que apunta a la ficha web del producto;
//  - reescribe el párrafo de descripción de la página 2: el original traía guiones suaves (U+00AD) dentro de las palabras
//    ("com·puerta", "elás·tico"…) que varios visores dibujan como huecos o letras montadas. Mismo texto, tipografía y
//    color, justificado y sin cortar palabras con guion.
// El código y la fecha de descarga de hoy se estampan en cada descarga (src/modules/datasheets/stamp.ts).
// No es dependencia del proyecto: ejecutar con  npm i --no-save mupdf qrcode  y
//   node scripts/datasheets/build-template.mjs <original.pdf> [salida.pdf]
import * as mupdf from "mupdf";
import fs from "fs";
import QR from "qrcode";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";

const URL_FICHA = "https://fundigsac-web.vercel.app/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida";
const doc = mupdf.Document.openDocument(fs.readFileSync(process.argv[2]), "application/pdf");

// 1) Borrado real (no tapado) del contenido que ya no va: bloque de metadatos, QR viejo y "Última actualización".
const REMOVE = [
  [296, 27, 480, 75],   // Código / Versión / Fecha de emisión / Fecha de descarga
  [503, 22, 560, 79],   // QR anterior (apuntaba a www.fundigsac.com)
  [24, 795.2, 160, 802.8], // "Última actualización: 14/04/2026"
];
// Párrafo "Descripción general" (página 2): se borra para reescribirlo sin guiones suaves.
const DESCRIPTION_BOX = [24, 162, 322, 277];
for (let i = 0; i < doc.countPages(); i++) {
  const page = doc.loadPage(i);
  for (const r of i === 1 ? [...REMOVE, DESCRIPTION_BOX] : REMOVE) { const a = page.createAnnotation("Redact"); a.setRect(r); }
  page.applyRedactions(false, mupdf.PDFPage.REDACT_IMAGE_REMOVE, mupdf.PDFPage.REDACT_LINE_ART_REMOVE_IF_COVERED, mupdf.PDFPage.REDACT_TEXT_REMOVE);
}
const pdf = await PDFDocument.load(doc.saveToBuffer("garbage=compact,compress").asUint8Array());

// 2) QR vectorial nuevo en las dos páginas.
const qr = QR.create(URL_FICHA, { errorCorrectionLevel: "M" });
const n = qr.modules.size, quiet = 2, box = 52, x0 = 504, yTop = 25; // pt (origen arriba-izquierda)
const m = box / (n + quiet * 2);
for (const page of pdf.getPages()) {
  const H = page.getHeight();
  page.drawRectangle({ x: x0, y: H - yTop - box, width: box, height: box, color: rgb(1, 1, 1) });
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (!qr.modules.get(r, c)) { c++; continue; }
      let e = c; while (e < n && qr.modules.get(r, e)) e++;       // une módulos contiguos de la fila en un solo rectángulo
      page.drawRectangle({ x: x0 + (quiet + c) * m, y: H - yTop - (quiet + r + 1) * m, width: (e - c) * m + 0.02, height: m + 0.02, color: rgb(0.043, 0.145, 0.27), borderWidth: 0 });
      c = e;
    }
  }
}
// 3) Párrafo de descripción (página 2), reflujo propio con la tipografía del documento.
pdf.registerFontkit(fontkit);
const font = await pdf.embedFont(fs.readFileSync("src/modules/datasheets/fonts/OpenSans-Regular.ttf"), { subset: true });
// Mismos renglones que el original (el único corte con guion es el de la línea 1), sin los guiones suaves.
const LINES = [
  "Válvula de compuerta de cierre elástico con extremos bri-",
  "dados para redes de agua. Diseñada para servicio confiable",
  "en líneas primarias y secundarias, con cuerpo en GJS500-7",
  "y revestimiento epóxico apto para agua potable. Ofrece un",
  "cierre elástico de alta confiabilidad, baja pérdida de carga y",
  "larga vida útil, garantizando un funcionamiento seguro y",
  "eficiente en sistemas de distribución de agua potable.",
];
const PARA = { x: 25.5, width: 293.2, size: 10.6, firstBaseline: 174.75, leading: 15.75, color: rgb(0.169, 0.208, 0.314) };
const widthOf = (t) => font.widthOfTextAtSize(t, PARA.size);
const lines = LINES.map((l) => l.split(" "));
for (const l of LINES) if (widthOf(l) > PARA.width + 0.5) throw new Error(`La línea no cabe: ${l}`);
const page2 = pdf.getPages()[1];
lines.forEach((words, i) => {
  const y = page2.getHeight() - (PARA.firstBaseline + i * PARA.leading);
  const isLast = i === lines.length - 1 || words.length === 1;
  const gap = isLast ? widthOf(" ") : (PARA.width - words.reduce((sum, w) => sum + widthOf(w), 0)) / (words.length - 1);
  let x = PARA.x;
  for (const w of words) {
    page2.drawText(w, { x, y, size: PARA.size, font, color: PARA.color });
    x += widthOf(w) + gap;
  }
});
console.log("Párrafo:", lines.length, "líneas");

pdf.setTitle("Ficha técnica · Válvula compuerta bridada FUNDIGSAC");
pdf.setSubject("FT-HD-002-2024");
pdf.setAuthor("FUNDIGSAC S.A.C.");
pdf.setCreator("FUNDIGSAC");
pdf.setProducer("FUNDIGSAC");
fs.writeFileSync(process.argv[3] ?? "src/modules/datasheets/templates/ficha-tecnica-valvula-compuerta-fundigsac-garantia-extendida.pdf", await pdf.save({ useObjectStreams: false }));
console.log("QR", n, "módulos; módulo =", m.toFixed(3), "pt");
