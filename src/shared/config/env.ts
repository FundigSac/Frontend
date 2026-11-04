/**
 * Interruptor de indexación. El ADR-001 mantiene todo `noindex` hasta aprobar contenido real
 * (fotografías, normas, cifras). Activar en producción con SITE_INDEXABLE=true tras la aprobación. Las vistas previas de
 * Vercel nunca se indexan, aunque hereden la variable.
 */
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true" && process.env.VERCEL_ENV !== "preview";

/**
 * URL pública canónica del sitio (sin barra final). Mientras fundigsac.com siga en el WordPress anterior, el lanzamiento
 * provisional usa fundigsac-web.vercel.app. Al conectar el dominio propio en Vercel basta definir
 * NEXT_PUBLIC_SITE_URL=https://fundigsac.com y redirigir el dominio vercel.app al nuevo (ver SEO-GOOGLE-LAUNCH.md).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://fundigsac-web.vercel.app").replace(/\/+$/, "");

/** Host canónico como expresión regular. Cualquier otro host (URLs de despliegue de Vercel) se sirve con `X-Robots-Tag: noindex`. */
export const CANONICAL_HOST_PATTERN = new URL(SITE_URL).host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
