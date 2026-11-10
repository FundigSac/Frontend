import type { ComponentType } from "react";
import { ScreenW23 } from "@/screens/w23";
import { CATALOG_ROUTES, FAMILIES, type FamilySlug } from "./public-catalog";
import { VALVE_SHEETS } from "./valve-sheets";

export type CategorySlug = FamilySlug;

/**
 * Solo datos (y pantallas de servidor sin CSS propio). Las pantallas del catálogo con CSS module las importa cada ruta:
 * si estuvieran aquí, todas las páginas que usan el registro cargarían ese CSS.
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
  /** false: ficha con datos pendientes de validación; nunca se indexa ni entra al sitemap. */
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

export const CATEGORIES: readonly CategoryEntry[] = FAMILIES.map((f) => ({ slug: f.slug, name: f.name.es, title: f.metaTitle, description: f.metaDescription }));

export const PRODUCTS: readonly ProductEntry[] = [
  { category: "valvulas", slug: "valvula-compuerta", name: "Válvula de compuerta bridada", title: "Válvula de compuerta bridada DN40 a DN600 | FUNDIGSAC", description: "Válvula de compuerta de cierre elástico con extremos bridados, DN40 a DN600 y PN10/PN16. Revisa la ficha técnica y cotiza con FUNDIGSAC en Lima.", Viewer3D: ScreenW23, image: "/media/valvula-hd/v-01.webp", brand: "H-ITALY" },
  { category: "valvulas", slug: "valvula-compuerta-fundigsac", name: "Válvula de compuerta bridada FUNDIGSAC", title: "Válvula de compuerta FUNDIGSAC DN50 a DN600 PN10/PN16", description: "Válvula de compuerta bridada FUNDIGSAC de asiento resiliente, DN50 a DN600 y PN10/PN16, en hierro dúctil GGG50 para redes de agua. Cotiza desde Lima.", image: "/media/valvula-fundigsac/f-02.webp", brand: "FUNDIGSAC" },
  { category: "valvulas", slug: "valvula-compuerta-fundigsac-garantia-extendida", name: "Válvula de compuerta bridada FUNDIGSAC", title: "Válvula de compuerta FUNDIGSAC con garantía extendida", description: "Válvula de compuerta FUNDIGSAC con garantía extendida: cierre elástico, extremos bridados, DN40 a DN600 y PN10/PN16 en hierro dúctil. Cotiza desde Lima.", image: "/media/valvula-fundigsac-cuadrante/g-01.webp", brand: "FUNDIGSAC" },
  // Fichas con datos de la lista de precios y de fundigsac.com (src/modules/catalog/valve-sheets.ts).
  ...VALVE_SHEETS.map((s): ProductEntry => ({ category: "valvulas", slug: s.slug, name: s.es.name, title: `${s.title} | FUNDIGSAC`, description: s.description, image: s.image, sku: s.code })),
  // Lista de precios y productos con la ficha por confirmar (src/modules/catalog/public-catalog.ts).
  ...CATALOG_ROUTES.map((r): ProductEntry => ({
    category: r.family,
    slug: r.slug,
    name: r.name,
    description: r.description,
    image: r.image,
    ...(r.sku ? { sku: r.sku } : {}),
    ...(r.indexable === false ? { indexable: false as const } : {}),
  })),
];

export const findCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const findProduct = (category: string, slug: string) => PRODUCTS.find((p) => p.category === category && p.slug === slug);
export const findProductBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
