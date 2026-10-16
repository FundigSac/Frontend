import type { ComponentType } from "react";
import { ScreenW11 } from "@/screens/w11";
import { ScreenW14 } from "@/screens/w14";
import { ScreenW23 } from "@/screens/w23";

export type CategorySlug = "valvulas" | "tuberias" | "marcos-y-tapas";

/**
 * Solo datos (y pantallas de servidor sin CSS propio). Las pantallas del catálogo con CSS module (válvulas, tuberías,
 * marcos, fichas) las importa cada ruta: si estuvieran aquí, todas las páginas que usan el registro cargarían ese CSS.
 */
export type CategoryEntry = { slug: CategorySlug; name: string; description: string };
export type ProductEntry = {
  category: CategorySlug;
  slug: string;
  name: string;
  description: string;
  /** W23: visor 3D del producto (solo existe diseño para la válvula de compuerta). */
  Viewer3D?: ComponentType;
};

export const CATEGORIES: readonly CategoryEntry[] = [
  { slug: "valvulas", name: "Válvulas", description: "Familia de referencia visual; variantes y datos técnicos pendientes de validación en el catálogo oficial." },
  { slug: "tuberias", name: "Tuberías", description: "Familia de referencia visual; variantes y datos técnicos pendientes de validación en el catálogo oficial." },
  { slug: "marcos-y-tapas", name: "Marcos y tapas", description: "Familia de referencia visual; variantes y datos técnicos pendientes de validación en el catálogo oficial." },
];

export const PRODUCTS: readonly ProductEntry[] = [
  { category: "valvulas", slug: "valvula-compuerta", name: "Válvula de compuerta bridada", description: "Válvula de compuerta de cierre elástico con extremos bridados, DN40 a DN600, PN10/PN16, según EN1074-2.", Viewer3D: ScreenW23 },
  { category: "valvulas", slug: "valvula-compuerta-fundigsac", name: "Válvula de compuerta bridada FUNDIGSAC", description: "Válvula compuerta bridada de asiento resiliente, DN50 a DN600, PN10/PN16, diseño DIN 3352 F4, en hierro dúctil GGG50. Marca FUNDIGSAC." },
  { category: "valvulas", slug: "valvula-compuerta-fundigsac-garantia-extendida", name: "Válvula de compuerta bridada FUNDIGSAC", description: "Válvula de compuerta de cierre elástico con extremos bridados, DN40 a DN600, PN10/PN16, según EN1074-2. Marca FUNDIGSAC con garantía extendida." },
  { category: "valvulas", slug: "valvula-mariposa", name: "Referencia visual de válvula", description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación." },
  { category: "tuberias", slug: "tuberia-tyton", name: "Referencia visual de tubería", description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación." },
  { category: "marcos-y-tapas", slug: "marco-tapa-d400", name: "Referencia visual de marco y tapa", description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación." },
];

export const SOLUTIONS = [
  { slug: "redes-matrices", name: "Redes matrices de agua potable", description: "Soluciones en hierro dúctil para líneas de conducción y redes matrices.", Screen: ScreenW11 },
] as const;

export const RESOURCES = [
  { slug: "detalle-tecnico", name: "Estado de recurso técnico", description: "Estado y disponibilidad de documentos técnicos oficiales; publicación pendiente de aprobación.", Screen: ScreenW14 },
] as const;

export const findCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const findProduct = (category: string, slug: string) => PRODUCTS.find((p) => p.category === category && p.slug === slug);
export const findProductBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
