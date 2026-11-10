import type { ComponentType } from "react";
import { ScreenW23 } from "@/screens/w23";
import { VALVE_SHEETS } from "./valve-sheets";

export type CategorySlug = "valvulas" | "tuberias" | "marcos-y-tapas";

/**
 * Solo datos (y pantallas de servidor sin CSS propio). Las pantallas del catálogo con CSS module (válvulas, tuberías,
 * marcos, fichas) las importa cada ruta: si estuvieran aquí, todas las páginas que usan el registro cargarían ese CSS.
 */
/** `title`: título para buscadores (si falta se usa `name`); `description`: meta description, solo con datos de la página. */
export type CategoryEntry = { slug: CategorySlug; name: string; title?: string; description: string };
export type ProductEntry = {
  category: CategorySlug;
  slug: string;
  name: string;
  /** Título completo para buscadores (sin la plantilla "| FUNDIGSAC"), cuando `name` se repite en otra ficha. */
  title?: string;
  description: string;
  /** false: pantalla de referencia con datos pendientes de validación; nunca se indexa ni entra al sitemap. */
  indexable?: false;
  /** W23: visor 3D del producto (solo existe diseño para la válvula de compuerta). */
  Viewer3D?: ComponentType;
  /** Foto principal (datos estructurados Product). */
  image?: string;
  /** Marca impresa en la ficha técnica; se omite si no está confirmada. */
  brand?: string;
  /** Código de la lista de precios (sku en los datos estructurados). */
  sku?: string;
};

export const CATEGORIES: readonly CategoryEntry[] = [
  { slug: "valvulas", name: "Válvulas", title: "Válvulas de hierro dúctil en Perú", description: "Válvulas de compuerta, check, reductoras, de alivio y flotadoras de hierro dúctil. Consulta DN, PN y materiales en cada ficha y solicita tu cotización." },
  { slug: "tuberias", name: "Tuberías", title: "Tuberías de hierro dúctil C40, K9 y K7", description: "Tubería de hierro dúctil clases C40, K9 y K7 para redes de agua potable y alcantarillado. Consulta diámetros disponibles y solicita tu cotización." },
  { slug: "marcos-y-tapas", name: "Marcos y tapas", title: "Marcos y tapas de buzón D400 en Perú", description: "Marcos y tapas de buzón clase D400 de 600 mm con uno o dos seguros, para vías y redes de alcantarillado. Compara modelos y solicita tu cotización." },
];

export const PRODUCTS: readonly ProductEntry[] = [
  { category: "valvulas", slug: "valvula-compuerta", name: "Válvula de compuerta bridada", title: "Válvula de compuerta bridada DN40 a DN600 | FUNDIGSAC", description: "Válvula de compuerta de cierre elástico con extremos bridados, DN40 a DN600 y PN10/PN16. Revisa la ficha técnica y cotiza con FUNDIGSAC en Lima.", Viewer3D: ScreenW23, image: "/media/valvula-hd/v-01.webp", brand: "H-ITALY" },
  { category: "valvulas", slug: "valvula-compuerta-fundigsac", name: "Válvula de compuerta bridada FUNDIGSAC", title: "Válvula de compuerta FUNDIGSAC DN50 a DN600 PN10/PN16", description: "Válvula de compuerta bridada FUNDIGSAC de asiento resiliente, DN50 a DN600 y PN10/PN16, en hierro dúctil GGG50 para redes de agua. Cotiza desde Lima.", image: "/media/valvula-fundigsac/f-02.webp", brand: "FUNDIGSAC" },
  { category: "valvulas", slug: "valvula-compuerta-fundigsac-garantia-extendida", name: "Válvula de compuerta bridada FUNDIGSAC", title: "Válvula de compuerta FUNDIGSAC con garantía extendida", description: "Válvula de compuerta FUNDIGSAC con garantía extendida: cierre elástico, extremos bridados, DN40 a DN600 y PN10/PN16 en hierro dúctil. Cotiza desde Lima.", image: "/media/valvula-fundigsac-cuadrante/g-01.webp", brand: "FUNDIGSAC" },
  // Fichas con datos de la lista de precios y de fundigsac.com (src/modules/catalog/valve-sheets.ts).
  ...VALVE_SHEETS.map((s): ProductEntry => ({ category: "valvulas", slug: s.slug, name: s.es.name, title: `${s.title} | FUNDIGSAC`, description: s.description, image: s.image, sku: s.code })),
  { category: "valvulas", slug: "valvula-mariposa", name: "Referencia visual de válvula", indexable: false, description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación." },
  { category: "tuberias", slug: "tuberia-tyton", name: "Referencia visual de tubería", indexable: false, description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación." },
  { category: "marcos-y-tapas", slug: "marco-tapa-d400", name: "Referencia visual de marco y tapa", indexable: false, description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación." },
];

export const findCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const findProduct = (category: string, slug: string) => PRODUCTS.find((p) => p.category === category && p.slug === slug);
export const findProductBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
