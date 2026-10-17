import type { MetadataRoute } from "next";
import { CATEGORIES, PRODUCTS, SOLUTIONS } from "@/modules/catalog/registry";
import { SITE } from "@/shared/config/site";
import { SITE_INDEXABLE } from "@/shared/config/env";

const STATIC = ["/", "/industrias", "/industrias/agricultura", "/industrias/saneamiento", "/industrias/mineria", "/productos", "/soluciones", "/nosotros", "/recursos", "/contacto", "/cotizar", "/reclamaciones", "/terminos", "/mapa-del-sitio", "/privacidad", "/cookies", "/eliminar-cuenta"];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_INDEXABLE) return [];
  const paths = [
    ...STATIC,
    ...CATEGORIES.map((c) => `/productos/${c.slug}`),
    // Solo páginas indexables: las pantallas de referencia y /recursos/detalle-tecnico llevan noindex.
    ...PRODUCTS.filter((p) => p.indexable !== false).map((p) => `/productos/${p.category}/${p.slug}`),
    ...SOLUTIONS.map((s) => `/soluciones/${s.slug}`),
  ];
  return paths.map((path) => ({ url: `${SITE.url}${path}` }));
}
