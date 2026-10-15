/** Ubicación de FUNDIGSAC en Lima: mapa de Google (inicio y contacto) y enlace de cómo llegar. */
export const MAP_QUERY = "Jirón Acomayo 199, Cercado de Lima, Lima, Perú";
export const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=16&hl=es&output=embed`;
export const MAP_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAP_QUERY)}`;
export const MAP_VIEW = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;
