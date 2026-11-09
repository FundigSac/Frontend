import type { Metadata } from "next";
import { SITE } from "@/shared/config/site";

/** Añade la marca al título salvo que ya la lleve, como en las fichas "Válvula de compuerta FUNDIGSAC…". */
export function withBrand(title: string) {
  return title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
}

const SHARE_IMAGE = { url: "/opengraph-image.jpg", width: 1200, height: 630, alt: SITE.name };

/**
 * Título, descripción y URL canónica de una página pública. Open Graph repite los mismos datos porque definir `openGraph`
 * aquí reemplaza el bloque del layout, y por la misma razón la imagen se declara de nuevo.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const full = withBrand(title);
  return {
    title: { absolute: full },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "es_PE", siteName: SITE.name, title: full, description, url: path, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title: full, description, images: [SHARE_IMAGE.url] },
  };
}
