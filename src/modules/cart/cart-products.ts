import { CATALOG_PRODUCTS } from "@/modules/catalog/data";
import { DATASHEETS } from "@/screens/islands/w06-ficha-data";

/** Productos que se pueden agregar al carrito con medida (DN) y presión (PN) a elegir. */
export type CartProduct = {
  slug: string;
  name: { es: string; en: string };
  tag: { es: string; en: string };
  image: string;
  href: string;
  sizes: readonly string[];
  pressures: readonly string[];
};

export const FEATURED_PRODUCTS: readonly CartProduct[] = [
  {
    slug: "valvula-compuerta-fundigsac",
    name: { es: "Válvula de compuerta FUNDIGSAC", en: "FUNDIGSAC gate valve" },
    tag: { es: "Garantía de 1 año · volante", en: "1-year warranty · handwheel" },
    image: "/media/valvula-fundigsac/f-02.webp",
    href: "/productos/valvulas/valvula-compuerta-fundigsac",
    sizes: DATASHEETS.fundigsac.sizes,
    pressures: ["PN10", "PN16"],
  },
  {
    slug: "valvula-compuerta-fundigsac-garantia-extendida",
    name: { es: "Válvula de compuerta FUNDIGSAC con garantía extendida", en: "FUNDIGSAC gate valve, extended warranty" },
    tag: { es: "Cuadrante de maniobra", en: "Operating cap" },
    image: "/media/valvula-fundigsac-cuadrante/g-01.webp",
    href: "/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida",
    sizes: DATASHEETS.extendida.sizes,
    pressures: ["PN10", "PN16"],
  },
  {
    slug: "valvula-compuerta",
    name: { es: "Válvula de compuerta bridada H-ITALY", en: "H-ITALY flanged gate valve" },
    tag: { es: "EN 1074-2 · volante", en: "EN 1074-2 · handwheel" },
    image: "/media/valvula-hd/v-01.webp",
    href: "/productos/valvulas/valvula-compuerta",
    sizes: DATASHEETS.base.sizes,
    pressures: ["PN10", "PN16"],
  },
];

export const featuredBySlug = (slug: string) => FEATURED_PRODUCTS.find((p) => p.slug === slug);

/** Imagen y enlace para mostrar un producto del carrito aunque se haya agregado desde otra parte del sitio. */
export function productVisual(slug: string): { image?: string; href?: string } {
  const featured = featuredBySlug(slug);
  if (featured) return { image: featured.image, href: featured.href };
  const catalog = CATALOG_PRODUCTS.find((p) => p.id === slug || p.href.endsWith(`/${slug}`));
  return catalog ? { image: catalog.image, href: catalog.href } : {};
}

export const variantLabel = (dn?: string, pn?: string) => [dn, pn].filter(Boolean).join(" · ") || undefined;

export function parseVariant(variant?: string): { dn?: string; pn?: string } {
  const parts = (variant ?? "").split("·").map((s) => s.trim());
  return { dn: parts.find((p) => /^DN/i.test(p)), pn: parts.find((p) => /^PN/i.test(p)) };
}
