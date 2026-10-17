import type { MetadataRoute } from "next";
import { SITE } from "@/shared/config/site";
import { SITE_INDEXABLE } from "@/shared/config/env";

// Las páginas privadas (búsqueda, confirmación, acceso, carrito) llevan su propio noindex: Google tiene que poder
// rastrearlas para verlo. Bloquearlas aquí lo impediría y podrían indexarse sin contenido. Solo se cierra la API.
const PRIVATE = ["/api/"];

export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: PRIVATE }, sitemap: `${SITE.url}/sitemap.xml` };
}
