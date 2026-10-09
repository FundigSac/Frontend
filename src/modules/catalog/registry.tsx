import type { ComponentType } from "react";
import { W03Valvulas } from "@/screens/islands/w03-valvulas";
import { W04Tuberias } from "@/screens/islands/w04-tuberias";
import { W05Marcos } from "@/screens/islands/w05-marcos";
import { ScreenW06 } from "@/screens/w06";
import { ScreenW07 } from "@/screens/w07";
import { ScreenW08 } from "@/screens/w08";
import { ScreenW09 } from "@/screens/w09";
import { ScreenW11 } from "@/screens/w11";
import { ScreenW14 } from "@/screens/w14";
import { ScreenW23 } from "@/screens/w23";

export type CategorySlug = "valvulas" | "tuberias" | "marcos-y-tapas";

export type CategoryEntry = { slug: CategorySlug; name: string; description: string; Screen: ComponentType };
export type ProductEntry = {
  category: CategorySlug;
  slug: string;
  name: string;
  description: string;
  Screen: ComponentType;
  /** W23: visor 3D del producto (solo existe diseño para la válvula de compuerta). */
  Viewer3D?: ComponentType;
};

export const CATEGORIES: readonly CategoryEntry[] = [
  { slug: "valvulas", name: "Válvulas", description: "Familia de referencia visual; variantes y datos técnicos pendientes de validación en el catálogo oficial.", Screen: W03Valvulas },
  { slug: "tuberias", name: "Tuberías", description: "Familia de referencia visual; variantes y datos técnicos pendientes de validación en el catálogo oficial.", Screen: W04Tuberias },
  { slug: "marcos-y-tapas", name: "Marcos y tapas", description: "Familia de referencia visual; variantes y datos técnicos pendientes de validación en el catálogo oficial.", Screen: W05Marcos },
];

export const PRODUCTS: readonly ProductEntry[] = [
  { category: "valvulas", slug: "valvula-compuerta", name: "Referencia visual de válvula", description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación.", Screen: ScreenW06, Viewer3D: ScreenW23 },
  { category: "valvulas", slug: "valvula-mariposa", name: "Referencia visual de válvula", description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación.", Screen: ScreenW07 },
  { category: "tuberias", slug: "tuberia-tyton", name: "Referencia visual de tubería", description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación.", Screen: ScreenW08 },
  { category: "marcos-y-tapas", slug: "marco-tapa-d400", name: "Referencia visual de marco y tapa", description: "Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación.", Screen: ScreenW09 },
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
