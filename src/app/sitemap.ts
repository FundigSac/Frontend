import type { MetadataRoute } from "next";
import { products } from "@/lib/catalog";
export default function sitemap():MetadataRoute.Sitemap{const base="https://fundigsac.com";return ["/","/productos","/soluciones","/industrias","/nosotros","/recursos","/contacto","/cotizar","/libro-de-reclamos",...products.map(p=>`/productos/${p.slug}`)].map(path=>({url:base+path,changeFrequency:"monthly",priority:path==="/"?1:path.startsWith("/productos/")?.7:.6}))}
