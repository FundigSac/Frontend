import type { MetadataRoute } from "next";
import { SITE } from "@/shared/config/site";
import { SITE_INDEXABLE } from "@/shared/config/env";

const PRIVATE = ["/api/", "/cuenta", "/login", "/registro", "/recuperar", "/restablecer", "/verificar-correo", "/correo-verificado", "/enlace-expirado", "/auth/", "/acceso-denegado", "/cuenta-restringida", "/cotizar/confirmacion", "/buscar"];

export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: PRIVATE }, sitemap: `${SITE.url}/sitemap.xml` };
}
