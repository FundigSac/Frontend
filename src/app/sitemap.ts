import type { MetadataRoute } from "next";
import { CATEGORIES, PRODUCTS, RESOURCES, SOLUTIONS } from "@/modules/catalog/registry";
import { SITE } from "@/shared/config/site";
import { SITE_INDEXABLE } from "@/shared/config/env";

const STATIC = ["/", "/productos", "/soluciones", "/nosotros", "/recursos", "/contacto", "/cotizar", "/reclamaciones", "/privacidad", "/cookies"];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_INDEXABLE) return [];
  const paths = [
    ...STATIC,
    ...CATEGORIES.map((c) => `/productos/${c.slug}`),
    ...PRODUCTS.map((p) => `/productos/${p.category}/${p.slug}`),
    ...SOLUTIONS.map((s) => `/soluciones/${s.slug}`),
    ...RESOURCES.map((r) => `/recursos/${r.slug}`),
  ];
  return paths.map((path) => ({ url: `${SITE.url}${path}` }));
}
