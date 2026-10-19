import type { ComponentType } from "react";
import { ScreenW14 } from "@/screens/w14";
import { ScreenW23 } from "@/screens/w23";

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
};

export const CATEGORIES: readonly CategoryEntry[] = [
  { slug: "valvulas", name: "Válvulas", title: "Válvulas para redes de agua y alcantarillado", description: "Válvulas de compuerta, mariposa, check swing, check flex, reductoras de presión y de aire para redes de agua, alcantarillado e infraestructura urbana." },
  { slug: "tuberias", name: "Tuberías", title: "Tuberías de hierro dúctil y HDPE", description: "Tuberías con unión junta, unión mecánica, bridas o revestimiento de mortero de cemento y tubería HDPE para redes de agua, alcantarillado e infraestructura." },
  { slug: "marcos-y-tapas", name: "Marcos y tapas", title: "Marcos y tapas de hierro dúctil", description: "Marcos y tapas de hierro dúctil para redes de agua y alcantarillado: tapas circulares, marcos rectangulares, rejillas pluviales y tapas de registro." },
];

export const PRODUCTS: readonly ProductEntry[] = [
  { category: "valvulas", slug: "valvula-compuerta", name: "Válvula de compuerta bridada", description: "Válvula de compuerta de cierre elástico con extremos bridados, DN40 a DN600, PN10/PN16, según EN1074-2.", Viewer3D: ScreenW23 },
  { category: "valvulas", slug: "valvula-compuerta-fundigsac", name: "Válvula de compuerta bridada FUNDIGSAC", title: "Válvula de compuerta FUNDIGSAC DIN 3352 F4, DN50–DN600", description: "Válvula compuerta bridada FUNDIGSAC de asiento resiliente, diseño DIN 3352 F4, DN50 a DN600, PN10/PN16, en hierro dúctil GGG50 para redes de agua." },
  { category: "valvulas", slug: "valvula-compuerta-fundigsac-garantia-extendida", name: "Válvula de compuerta bridada FUNDIGSAC", title: "Válvula de compuerta FUNDIGSAC con garantía extendida", description: "Válvula de compuerta FUNDIGSAC con garantía extendida: cierre elástico, extremos bridados, DN40 a DN600, PN10/PN16, EN 1074-2, hierro dúctil." },
  { category: "valvulas", slug: "valvula-mariposa", name: "Referencia visual de válvula", indexable: false, description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación." },
  { category: "tuberias", slug: "tuberia-tyton", name: "Referencia visual de tubería", indexable: false, description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación." },
  { category: "marcos-y-tapas", slug: "marco-tapa-d400", name: "Referencia visual de marco y tapa", indexable: false, description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación." },
];

export const RESOURCES = [
  { slug: "detalle-tecnico", name: "Estado de recurso técnico", description: "Estado y disponibilidad de documentos técnicos oficiales; publicación pendiente de aprobación.", Screen: ScreenW14 },
] as const;

export const findCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const findProduct = (category: string, slug: string) => PRODUCTS.find((p) => p.category === category && p.slug === slug);
export const findProductBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
