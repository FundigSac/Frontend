/**
 * Interruptor de indexación. El ADR-001 mantiene todo `noindex` hasta aprobar contenido real
 * (fotografías, normas, cifras). Activar en producción con SITE_INDEXABLE=true tras la aprobación.
 */
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";
