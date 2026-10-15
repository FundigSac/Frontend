# Estado de pantallas FUNDIGSAC

Última actualización: 2026-10-15. Fuente: historial de commits (198 commits no-merge, 2026-10-07 a 2026-10-15) y revisión de los archivos de cada pantalla.

Para ver el historial de una pantalla: `git log --oneline -- <ruta del archivo>`.

## Terminadas (diseño, contenido y cambios propios)

| Pantalla | Ruta | Commits clave | Notas |
|---|---|---|---|
| Inicio | `/` | 50b5e32, d70eaf5, b14de3a, f1f7c0b, 29d081c, 1eceb00 | Landing con carrusel, sectores, respaldo, documentación, ubicación, banner de cookies, WhatsApp y modo oscuro/EN. `noindex` intencional (ADR-001). |
| Catálogo general | `/productos` | b42d203, 1dd1887, 23d7161 | Filtros por familia y búsqueda con `?familia=` y `?q=`. |
| Ficha FUNDIGSAC 1 año | `/productos/valvulas/valvula-compuerta-fundigsac` | 32d0d18, e91948a, 1282e5c | Galería propia, datos técnicos y botón "Ver en 3D" (GLB `valvula-fundigsac.glb`, verificado). |
| Ficha FUNDIGSAC garantía extendida | `/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida` | afb6121 | La URL `-5-anos` redirige aquí. |
| Ficha compuerta H-ITALY | `/productos/valvulas/valvula-compuerta` | 7c760be, 2c3b075, 33ee76f | Datos oficiales FT-HI-100 Rev. 13 y modelo 3D (GLB `valvula-hitaly.glb`). |
| Industrias | `/industrias` | 058202a, e7d85b9, 0ed2d7a | Hub de sectores. |
| Saneamiento | `/industrias/saneamiento` | 5f4b1d8, b5f05ca | Sector con documentación compacta. |
| Agricultura | `/industrias/agricultura` | 0d26c9e, 549cf6a, fe40a47 | Hero con video en bucle. |
| Minería | `/industrias/mineria` | 9ed1bed, 3845a20, cb38ebb | Imágenes responsivas por componente compartido. |
| Nosotros | `/nosotros` | a80ca9e, 1055035, c133d63, 5b68e98 | Historia, misión, valores y línea de tiempo. |
| Contacto | `/contacto` | 32b236d, 5a60bc2, dab8c6c, 207d2d2 | Solo arma un texto para copiar. No envía nada (sin backend). |
| Libro de reclamaciones | `/reclamaciones` | 058eac7, 5e5b4b5, ea1a113 | Conforme a Ley 29571, Ley 31435 y D.S. 101-2022-PCM. No registra ni da acuse (sin backend). `/libro-de-reclamos` redirige aquí (308). |
| Cotizar | `/cotizar` | 83eea00, 0926977 | Valida el formulario y no guarda nada (sin backend). |
| Confirmación de cotización | `/cotizar/confirmacion` | 5d21f03, fdc5423 | Muestra "Solicitud pendiente de conexión" con el folio marcador. |
| Términos y condiciones | `/terminos` | 0aed2b0, 31e184f, f1faea7 | ES/EN. |
| Términos B2B | `/terminos-b2b` | 2e6e8f3 | Ajuste de padding. |
| Privacidad | `/privacidad` | 1ecd1ac, 91faf74 | ES/EN. |
| Cookies | `/cookies` | 6dd5b7c, 7eb7611, 397f943 | Preferencias de consentimiento en vivo. |
| Mapa del sitio | `/mapa-del-sitio` | 734056b | Página HTML real. |
| 404 | cualquier ruta inexistente | 87a5007, f345de0 | ES/EN. |
| Buscar | `/buscar` | 458c6a5 | Base w22 con e2e. |
| Layout global | header y footer | 48c5c33, a22490e, 4fa268c | Header de inicio en todas las páginas, modo oscuro en pantallas internas. |

## Base del diseño o pendientes

| Pantalla | Ruta | Estado |
|---|---|---|
| Válvulas | `/productos/valvulas` | Base w03. Traducida al inglés en af6f213. |
| Tuberías | `/productos/tuberias` | Base w04, casi sin cambios propios. |
| Marcos y tapas | `/productos/marcos-y-tapas` | Base w05, casi sin cambios propios. |
| Válvula mariposa | `/productos/valvulas/valvula-mariposa` | Referencia visual, "pendiente de validación" (w07). |
| Tubería Tyton | `/productos/tuberias/tuberia-tyton` | Referencia visual, "pendiente de validación" (w08). |
| Marco y tapa D400 | `/productos/marcos-y-tapas/marco-tapa-d400` | Referencia visual, "pendiente de validación" (w09). |
| Soluciones | `/soluciones` | Base w10, en inglés desde c9e6926. |
| Redes matrices | `/soluciones/redes-matrices` | Base w11, sin cambios propios. |
| Recursos técnicos | `/recursos` | Base w13, en inglés desde 5a25101. Banda en modo oscuro (cd70c2f). |
| Detalle de recurso | `/recursos/detalle-tecnico` | Muestra "Documento no publicado" (w14). |
| Visor 3D genérico | `/productos/valvulas/valvula-compuerta/visor-3d` | Placeholder (w23), sin modelo ni controles activos. |

## Pendientes transversales

- Backend para contacto, reclamaciones y cotizaciones: hoy ninguna solicitud se guarda.
- Commits sin hacer: `package.json`, `next.config.ts` y `.gitignore` tienen cambios sin commit.
- `next.config.ts` no define `images.qualities`, y las imágenes usan calidades 60, 70, 72 y 85. Genera advertencias en consola.
