import "server-only";

import { categories, products } from "@/lib/catalog";
import { site } from "@/lib/site-info";
import { SITE } from "@/shared/config/site";
import { ABOUT } from "@/app/nosotros/copy";
import { CATALOG_PRODUCTS, FAMILY_LABEL, HOMOLOGATION_LABEL, JOINT_LABEL } from "@/modules/catalog/data";
import { DATASHEETS, type Datasheet } from "@/screens/islands/w06-ficha-data";

/**
 * Base de conocimiento del asistente, generada desde los mismos datos que muestra el sitio
 * (fichas técnicas, catálogo, empresa y contacto). Así el asistente no se desactualiza respecto de la web.
 * El texto es estable entre peticiones: va al inicio del prompt y se guarda en la caché de prompts.
 */

const cell = (v: string | number | null) => (v === null || v === undefined ? "-" : String(v));

function datasheetText(name: string, url: string, quoteUrl: string, d: Datasheet): string {
  const lines: string[] = [];
  lines.push(`### ${name}`);
  lines.push(`Página: ${url} · Cotizar: ${quoteUrl}`);
  lines.push(d.lead);
  if (d.description) lines.push(d.description);
  lines.push(`Datos clave: ${d.facts.map(([k, v]) => `${k} ${v}`).join("; ")}. Diámetros: ${d.sizes.join(", ")} (${d.sizeRange}).`);
  lines.push("Especificaciones:");
  for (const [k, v] of d.specs) lines.push(`- ${k}: ${v}`);
  lines.push(`Nota: ${d.specsNote}`);
  lines.push(`Dimensiones (${d.dims.note})`);
  lines.push(`| ${d.dims.head.join(" | ")} |`);
  for (const r of d.dims.rows) lines.push(`| ${r.dn} | ${r.cells.map(cell).join(" | ")} |`);
  lines.push(`${d.flange.title} por diámetro (${d.flange.note})`);
  lines.push(`| DN | ${d.flange.head.join(" | ")} |`);
  for (const dn of d.sizes) for (const r of d.flange.rows(dn)) lines.push(`| ${dn} | ${r.pn} | ${r.cells.map(cell).join(" | ")} |`);
  if (d.stem) {
    lines.push(`${d.stem.title} (${d.stem.note})`);
    lines.push(`| DN | ${d.stem.head.join(" | ")} |`);
    for (const dn of d.sizes) for (const r of d.stem.rows(dn)) lines.push(`| ${dn} | ${r.cells.map(cell).join(" | ")} |`);
  }
  lines.push(`Ventajas: ${d.features.map((f) => `${f.title}: ${f.text}`).join(" ")}`);
  lines.push(d.doc ? `Ficha técnica descargable: ${d.doc.title} (${d.doc.meta}) en ${d.doc.href}` : "Ficha técnica: se entrega bajo solicitud.");
  return lines.join("\n");
}

function catalogText(): string {
  const lines: string[] = [];
  for (const p of CATALOG_PRODUCTS) {
    const dn = p.dn ? `DN${p.dn[0]} a DN${p.dn[1]}` : "sin DN (se mide por luz libre o clase)";
    const pn = p.pn?.length ? `PN ${p.pn.join(" / ")}` : "";
    const homolog = p.homologation.map((h) => HOMOLOGATION_LABEL[h]).join(", ");
    lines.push(`- ${p.name} [${FAMILY_LABEL[p.family]}] ${p.summary} Normas: ${p.standards.join(", ")}. Rango: ${dn}${pn ? `, ${pn}` : ""}. Unión: ${JOINT_LABEL[p.joint]}. Material: ${p.material}.${homolog ? ` Referencias de homologación: ${homolog}.` : ""} Página: ${p.href}`);
  }
  return lines.join("\n");
}

/** Líneas comercializadas según las listas de la empresa. Los importes NO se incluyen: el precio se confirma al cotizar. */
function supplyText(): string {
  const byCategory = new Map(categories.map((c) => [c.slug, c.name]));
  return products
    .map((p) => {
      const sizes = p.variants?.length ? ` Medidas: ${p.variants.map((v) => (v.sdr ? `${v.label} (${v.sdr})` : v.label)).join(", ")}.` : "";
      const specs = p.specs?.length ? ` Datos: ${p.specs.map(([k, v]) => `${k} ${v}`).join("; ")}.` : "";
      return `- ${p.name} [${byCategory.get(p.category) ?? p.category}] ${p.summary}${sizes}${specs}`;
    })
    .join("\n");
}

const about = ABOUT.es;

export const KNOWLEDGE = `# Conocimiento de FUNDIGSAC (fuente: sitio web oficial)

## Empresa
- Nombre comercial: ${SITE.name}. Razón social: ${SITE.registeredName}. RUC ${SITE.ruc}.
- ${about.lead}
- ${about.history.text}
- Trayectoria: ${about.timeline.map((t) => `${t.year}: ${t.title}. ${t.text}`).join(" ")}
- Misión: ${about.mission.text}
- Visión: ${about.vision.text}
- Valores: ${about.values.items.join(", ")}.
- Lo que la distingue: ${about.highlights.map((h) => `${h.title} (${h.text})`).join("; ")}.
- Sectores que atiende: saneamiento (redes de agua potable, alcantarillado sanitario y plantas de tratamiento), agricultura (riego tecnificado, conducción y distribución de agua), minería (agua de proceso, pulpas, relaves, recirculación y servicios auxiliares en plantas concentradoras) e industria.

## Contacto y atención
- Teléfono y WhatsApp: ${site.phone} (WhatsApp: https://wa.me/${site.whatsappNumber}).
- Correo de ventas: ${site.email}. Cotizaciones: ${SITE.email}.
- Dirección: ${site.address}. Mapa: ${site.mapsUrl}
- Horario: ${site.hours}.
- Instagram: ${site.instagram}
- Formulario de cotización: /cotizar (con producto precargado: /cotizar?producto=valvula-compuerta, /cotizar?producto=valvula-mariposa, /cotizar?producto=tuberia-tyton, /cotizar?producto=marco-tapa-d400).
- Contacto general: /contacto. Libro de reclamaciones: /reclamaciones.

## Páginas del sitio
- Catálogo general: /productos (búsqueda: /buscar?q=texto). Familias: /productos/valvulas, /productos/tuberias, /productos/marcos-y-tapas.
- Fichas de producto: /productos/valvulas/valvula-compuerta (H-ITALY), /productos/valvulas/valvula-compuerta-fundigsac (FUNDIGSAC, 1 año), /productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida (FUNDIGSAC con garantía extendida y cuadrante), /productos/valvulas/valvula-mariposa, /productos/tuberias/tuberia-tyton, /productos/marcos-y-tapas/marco-tapa-d400.
- Sectores: /industrias/saneamiento, /industrias/agricultura, /industrias/mineria. Soluciones: /soluciones. Recursos técnicos: /recursos. Nosotros: /nosotros.
- Las tres fichas de válvula de compuerta tienen visor 3D ("Ver en 3D") con el modelo de cada válvula.

## Válvulas de compuerta con ficha técnica oficial (datos verificados)
${datasheetText("Válvula de compuerta bridada H-ITALY", "/productos/valvulas/valvula-compuerta", "/cotizar?producto=valvula-compuerta", DATASHEETS.base)}

${datasheetText("Válvula de compuerta bridada FUNDIGSAC (1 año, con volante)", "/productos/valvulas/valvula-compuerta-fundigsac", "/cotizar?producto=valvula-compuerta", DATASHEETS.fundigsac)}

${datasheetText("Válvula de compuerta bridada FUNDIGSAC con garantía extendida (cuadrante de maniobra)", "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", "/cotizar?producto=valvula-compuerta", DATASHEETS.extendida)}

## Otras líneas del catálogo (referencia del sitio, datos por confirmar con el equipo técnico)
${catalogText()}
- Tuberías y accesorios HDPE PE100: tubería HDPE (DN20 a DN1200), unión flexible HDPE (DN50 a DN600), codo 90° (DN20 a DN1200), tee (DN20 a DN1200), reducción (DN32 a DN630) y adaptador de brida (DN50 a DN630), para conducción de agua y alcantarillado.
- Válvula de aire (ventosa): DN50 a DN200, PN16; elimina y admite aire en redes de agua.
- Acoples, adaptadores, uniones, reducciones, codos, tees y tapones para unir redes.
- Marcos y tapas de hierro dúctil: tapa circular, marco y tapa clase D400, rejilla pluvial, tapa para válvula, marco rectangular y tapa de registro.
- Grifos: se cotizan a pedido en /cotizar (no tienen ficha en el catálogo web).

## Líneas comercializadas según las listas de la empresa (sin precios: se confirman al cotizar)
${supplyText()}
`;
