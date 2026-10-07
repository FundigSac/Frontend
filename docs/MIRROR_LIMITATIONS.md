# Limitaciones del mirror legacy

Verificado: 2026-10-07T18:54:31.847Z.

HTTrack y GNU wget no estaban disponibles. El mirror conserva HTML público del WordPress y recursos estáticos del mismo dominio, reescribe rutas al servidor local y verifica páginas con Playwright. Incluye solo URLs públicas alcanzables desde la portada dentro del límite del crawler; no es una copia del servidor ni de su base de datos.
Hay 17 snapshot(s) HTML estático(s) en el mirror local.

La verificación usa una muestra representativa de las rutas descubiertas. Consulta `reports/mirror/verification.json` para páginas, status y dependencias observadas.

- Servidor local disponible durante la verificación: sí.
- Páginas muestreadas: 9; cargadas: 9.
- Archivos en legacy/mirror/: 364; snapshots HTML: 17.
- Recursos 404/fallidos: 0; imágenes rotas: 0; CSS ausente: 0; JS ausente: 0.
- Dependencias que aún cargan desde fundigsac.com: 0; recursos de terceros: 0.

PHP, sesiones, formularios, búsquedas y flujos WooCommerce dinámicos no se reproducen. Los formularios del HTML local tienen el envío interceptado. Algunas funciones dependen de recursos externos, detallados en el JSON. La navegación y apariencia de las páginas capturadas funcionan en `http://localhost:4173`.