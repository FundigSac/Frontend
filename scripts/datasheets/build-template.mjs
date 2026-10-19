// Regenera la plantilla de la ficha técnica de la válvula compuerta FUNDIGSAC (garantía extendida) a partir del PDF original:
//  - borra del contenido (no tapa) código/versión/fechas de la cabecera, el QR anterior y "Última actualización";
//  - dibuja el QR vectorial que apunta a la ficha web del producto.
// El código y la fecha de descarga de hoy se estampan en cada descarga (src/modules/datasheets/stamp.ts).
// No es dependencia del proyecto: ejecutar con  npm i --no-save mupdf qrcode  y
//   node scripts/datasheets/build-template.mjs <original.pdf> [salida.pdf]
import * as mupdf from "mupdf";
import fs from "fs";
import QR from "qrcode";
import { PDFDocument, rgb } from "pdf-lib";

const URL_FICHA = "https://fundigsac-web.vercel.app/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida";
const doc = mupdf.Document.openDocument(fs.readFileSync(process.argv[2]), "application/pdf");

// 1) Borrado real (no tapado) del contenido que ya no va: bloque de metadatos, QR viejo y "Última actualización".
const REMOVE = [
  [296, 27, 480, 75],   // Código / Versión / Fecha de emisión / Fecha de descarga
  [503, 22, 560, 79],   // QR anterior (apuntaba a www.fundigsac.com)
  [24, 795.2, 160, 802.8], // "Última actualización: 14/04/2026"
];
for (let i = 0; i < doc.countPages(); i++) {
  const page = doc.loadPage(i);
  for (const r of REMOVE) { const a = page.createAnnotation("Redact"); a.setRect(r); }
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
pdf.setTitle("Ficha técnica · Válvula compuerta bridada FUNDIGSAC");
pdf.setSubject("FT-HD-002-2024");
pdf.setAuthor("FUNDIGSAC S.A.C.");
pdf.setCreator("FUNDIGSAC");
pdf.setProducer("FUNDIGSAC");
fs.writeFileSync(process.argv[3] ?? "src/modules/datasheets/templates/ficha-tecnica-valvula-compuerta-fundigsac-garantia-extendida.pdf", await pdf.save({ useObjectStreams: false }));
console.log("QR", n, "módulos; módulo =", m.toFixed(3), "pt");
