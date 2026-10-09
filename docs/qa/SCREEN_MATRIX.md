# Matriz de pantallas FUNDIGSAC

24 pantallas Stitch conservadas en código. Se restauraron 21 fuentes del respaldo Claude anterior a la sobrescritura; Inicio y Soluciones mantienen sus versiones completas, y Confirmación mantiene consulta de folio. No se ha repetido comparación visual píxel a píxel. Copy y datos técnicos siguen pendientes de validación comercial; fotos Stitch son referencias, no activos corporativos.

| ID | Pantalla | Ruta | Interacción principal | Estado y pendiente |
|---|---|---|---|---|
| W01 | Inicio | / | Acceso a familias y cotización | Composición completa recuperada; copy neutral; imágenes referenciales |
| W02 | Catálogo general | /productos | Búsqueda, filtros, orden y páginas | Composición recuperada; contenido y controles requieren validación con catálogo oficial |
| W03 | Categoría: válvulas | /productos/valvulas | Navegación de familia y fichas | Composición recuperada; datos técnicos e imágenes por validar |
| W04 | Categoría: tuberías | /productos/tuberias | Navegación de familia y fichas | Composición recuperada; datos técnicos e imágenes por validar |
| W05 | Categoría: marcos y tapas | /productos/marcos-y-tapas | Navegación de familia y fichas | Composición recuperada; datos técnicos e imágenes por validar |
| W06 | Ficha: válvula compuerta | /productos/valvulas/valvula-compuerta | Galería, variantes y pestañas | Composición recuperada; ficha, fotos y PDF oficiales pendientes |
| W07 | Ficha: válvula mariposa | /productos/valvulas/valvula-mariposa | Galería, variantes y accionamiento | Composición recuperada; ficha, fotos y PDF oficiales pendientes |
| W08 | Ficha: tubería Tyton | /productos/tuberias/tuberia-tyton | Galería y opciones de conexión | Composición recuperada; ficha, fotos y PDF oficiales pendientes |
| W09 | Ficha: marco/tapa | /productos/marcos-y-tapas/marco-tapa-d400 | Galería, variantes y formulario | Composición recuperada; ficha, fotos y PDF oficiales pendientes |
| W10 | Soluciones | /soluciones | Acceso a familias relacionadas y cotización | Composición completa recuperada; aplicaciones por validar |
| W11 | Redes matrices | /soluciones/redes-matrices | Enlaces a productos y consulta | Contenido técnico por validar |
| W12 | Nosotros | /nosotros | Navegación institucional | Composición recuperada; historia, capacidades y fotos oficiales pendientes |
| W13 | Recursos técnicos | /recursos | Exploración y filtros | Composición recuperada; archivos oficiales no disponibles |
| W14 | Detalle de recurso | /recursos/detalle-tecnico | Compartir recurso | Composición recuperada; archivo, versión y contenido pendientes |
| W15 | Contacto | /contacto | LeadForm conectado al flujo local | Canales de atención externa pendientes de validar |
| W16 | Solicitar cotización | /cotizar | LeadForm conectado al flujo local | Atención comercial externa pendiente de validar |
| W17 | Cotización precargada | /cotizar?producto=valvula-compuerta | Slug del producto conservado; LeadForm conectado al flujo local | Atención externa pendiente |
| W18 | Libro de reclamaciones | /reclamaciones | Validación local de formulario | No registra reclamos; revisión Legal y backend pendientes |
| W19 | Privacidad | /privacidad | Tabla de contenidos | Texto provisional; revisión Legal pendiente |
| W20 | Cookies | /cookies | Preferencias locales | Consentimiento no conectado a servicios externos |
| W21 | Error 404 | /pagina-inexistente | Regreso a rutas principales | Ruta intencionalmente inexistente |
| W22 | Resultados de búsqueda | /buscar?q=valvula | Búsqueda, filtros y paginación | Composición recuperada; contenido y controles requieren validación con catálogo oficial |
| W23 | Visor de producto | /productos/valvulas/valvula-compuerta/visor-3d | Controles del visor | Sin modelo GLB oficial; confirmar alcance del visor |
| W24 | Confirmación | /cotizar/confirmacion | Acciones posteriores al formulario | Folio real consultado; vista de error cuando folio falta o no se encuentra |

## Verificación

- Tras cerrar tres instancias duplicadas de Next que compartían `.next`, `GET /`, `/productos` y `/productos/valvulas` devolvieron 200 en `http://127.0.0.1:3101/`.
- El puerto 3100 sirve un build previo.
- No se generaron capturas ni se ejecutó E2E; comparación píxel a píxel pendiente.
- Rutas de autenticación existen fuera del mapeo Stitch. La API de sesión y los formularios auth quedan pendientes de smoke test tras finalizar compilación local.
