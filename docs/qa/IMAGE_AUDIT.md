# Auditoría de imágenes

Revisión local de referencias en archivos TypeScript y TSX bajo src/.

- 24 rutas únicas referenciadas por las pantallas restauradas; las 24 existen bajo public/.
- Carpeta public/images/stitch: 97 JPEG, aproximadamente 17 MB en total.
- Muestras inspeccionadas: 1408×768 y 1376×768; entre 112 KB y 400 KB por archivo.
- Las imágenes provienen del export de Stitch y son referencias visuales generadas. No representan fotografías oficiales, inventario, planta ni proyectos verificados.
- Inicio y Soluciones muestran etiqueta visible «Imagen referencial». Las imágenes en el resto de pantallas aún requieren revisión editorial y reemplazo por activos autorizados antes de publicación.
- Se conservaron archivos y nombres originales. No se regeneraron ni descargaron activos fuera del proyecto.
- El componente Next Image conserva optimización de entrega; no se ejecutó auditoría visual de resolución en navegador durante esta sesión.
