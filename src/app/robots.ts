import type { MetadataRoute } from "next";
import { SITE } from "@/shared/config/site";
import { SITE_INDEXABLE } from "@/shared/config/env";

const PRIVATE = ["/cotizar/confirmacion", "/buscar"];

export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: PRIVATE }, sitemap: `${SITE.url}/sitemap.xml` };
}
