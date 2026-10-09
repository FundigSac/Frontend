# Mapa Stitch → FUNDIGSAC

Proyecto Stitch `Design System Studio` (`7629466019686444093`). Las 24 exportaciones originales (HTML y captura PNG por pantalla) viven en `docs/stitch/stitch_design_system_studio_24/`. Se conservan allí como referencia; el sitio usa componentes nativos Next.js, contenido validado y activos locales.

| Pantalla | Ruta aplicada | Implementación |
|---|---|---|
| W01 Inicio | `/` | Inicio editorial y catálogo |
| W02 Catálogo general | `/productos` | Familias y productos publicados |
| W03 Válvulas | `/productos/valvulas` | Familia de producto |
| W04 Tuberías | `/productos/tuberias` | Familia de producto |
| W05 Marcos y tapas | `/productos/marcos-y-tapas` | Familia de producto |
| W06 Válvula compuerta | `/productos/valvulas/valvula-compuerta` | Ficha de producto |
| W07 Válvula mariposa | `/productos/valvulas/valvula-mariposa` | Ficha de producto |
| W08 Tubería Tyton | `/productos/tuberias/tuberia-tyton` | Ficha con esquema, datos técnicos pendientes |
| W09 Marco y tapa D400 | `/productos/marcos-y-tapas/marco-tapa-d400` | Ficha con esquema, datos técnicos pendientes |
| W10 Soluciones | `/soluciones` | Aplicaciones y familias relacionadas |
| W11 Redes y matrices | `/soluciones/redes-matrices` | Detalle editorial de aplicación |
| W12 Nosotros | `/nosotros` | Página institucional |
| W13 Recursos | `/recursos` | Biblioteca documental |
| W14 Catálogo general | `/recursos/catalogo-general` | Estado de descarga y consulta |
| W15 Contacto | `/contacto` | Formulario sin envío ni almacenamiento |
| W16 Cotización | `/cotizar` | Formulario de consulta, sin envío |
| W17 Cotización por producto | `/cotizar?producto=valvula-compuerta` | Mismo formulario con producto precargado |
| W18 Libro de Reclamaciones | `/reclamaciones` | Canal y campos deshabilitados |
| W19 Privacidad | `/privacidad` | Información pendiente de aprobación legal |
| W20 Cookies | `/cookies` | Estado de inventario y preferencias |
| W21 No encontrada | `not-found.tsx` | Página 404 |
| W22 Búsqueda | `/buscar?q=...` | Filtra catálogo publicado |
| W23 Vista 3D | `/productos/[categoria]/[producto]/modelo-3d` | Fallback explícito; no hay GLB aprobado |
| W24 Confirmación | `/cotizar/confirmacion` | Informa que no existe registro ni folio |

## Pantallas de acceso solicitadas

Se añadieron `/login`, `/registro`, `/olvide-contrasena` y `/actualizar-contrasena` como interfaz únicamente. No crean sesión, no envían credenciales y no guardan contraseñas. El ADR-001 deja cuentas fuera del MVP; autenticación real requiere decisión nueva, backend y controles de seguridad.

## Límites de contenido y activos

- ADR-001 y `DESIGN.md` mandan sobre los claims incluidos en la exportación Stitch. No se reproducen cifras, normas, certificaciones, stock, precios, clientes o especificaciones sin aprobar.
- Fotografías de válvulas locales usan las fotos disponibles en FUNDIGSAC. Familias sin foto aprobada muestran esquemas claramente rotulados, no imágenes generadas como producto real.
- Fichas, descargas, reclamaciones, privacidad, cookies y modelo 3D muestran sus dependencias pendientes. No se simulan envíos ni resultados exitosos.
- Radiadores fue referencia de composición, ritmo y acabado. No se copian su marca, paleta roja, tipografía o fotografías.
