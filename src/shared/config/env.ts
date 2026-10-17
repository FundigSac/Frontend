/**
 * Interruptor de indexación. El ADR-001 mantiene todo `noindex` hasta aprobar contenido real
 * (fotografías, normas, cifras). Activar en producción con SITE_INDEXABLE=true tras la aprobación. Las vistas previas de
 * Vercel nunca se indexan, aunque hereden la variable.
 */
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true" && process.env.VERCEL_ENV !== "preview";

/** Dominio público canónico (sin www). Cualquier otro host, como *.vercel.app, se sirve con `X-Robots-Tag: noindex`. */
export const CANONICAL_HOST_PATTERN = "(www\\.)?fundigsac\\.com";
