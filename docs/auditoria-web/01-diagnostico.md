# 01 · Diagnóstico inicial (2026-10-17)

Línea base: `main` en `09a8d7c` (igual a la producción de https://fundigsac-web.vercel.app, verificado en Vercel). Auditoría
hecha por el agente principal y 7 agentes especializados de solo lectura (definidos en `.claude/agents/`). Informes completos
de cada agente: ver «Evidencias» al final.

## Stack real

| Área | Detalle |
|---|---|
| Framework | Next.js 16.4.2 (App Router, Turbopack), React 19.3.1, TypeScript 5.9 strict |
| Estilos | Tailwind v4 (pantallas convertidas de Stitch) + CSS propio por página (`landing.css`, `*.module.css`) |
| Fuentes | `next/font`: Plus Jakarta Sans (titulares) e Inter (texto), variables, precargadas |
| Imágenes | `next/image` con loader propio y variantes WebP pregeneradas en `prebuild` |
| Datos | Sin base de datos: catálogo en código; formularios sin backend (arman mensaje para correo/WhatsApp) |
| Integraciones | Google OAuth (PKCE + cookie firmada), asistente FundigIA (Claude, con guía local si no hay clave), Google Maps tras consentimiento, visor 3D (`@google/model-viewer`) |
| Calidad | Vitest (108 pruebas), Playwright + axe (131 pruebas × escritorio/móvil), Lighthouse 13 por script |
| Despliegue | Vercel, proyecto `fundigsac-web`; `git push` no despliega. Todo `noindex` hasta `SITE_INDEXABLE=true` (ADR-001) |

## Estado por funcionalidad

| Página / función | Ruta | Estado inicial | Tipo de problema principal |
|---|---|---|---|
| Inicio | `/` | IMPLEMENTADA | Folleto invisible en oscuro; ARIA en español con interfaz EN; LCP móvil 3,46 s |
| Catálogo general | `/productos` | IMPLEMENTADA | Sin traducir al inglés; `sizes` sobredimensionados |
| Válvulas / Tuberías / Marcos y tapas | `/productos/{familia}` | IMPLEMENTADA | Meta description = nota interna; «Ver ficha» que abría Contacto |
| Fichas compuerta (H-ITALY, FUNDIGSAC ×2) | `/productos/valvulas/…` | IMPLEMENTADA | Foto LCP con prioridad baja (3,55 s); visor 3D roto en producción (CSP) |
| Fichas de referencia (mariposa, Tyton, D400) | `/productos/…` | PARCIAL | Datos pendientes de validación; iconos que salían como texto («SHOW_CHART») |
| Visor 3D aparte | `/…/visor-3d` | PARCIAL | Página huérfana «no disponible» (el visor real está en la ficha) |
| Industrias + 3 sectores | `/industrias/*` | IMPLEMENTADA | Bloque «Válvula FUNDIGSAC» enlazaba a la ficha y PDF de H-ITALY; filtro `?categoria=` inexistente |
| Soluciones / Redes matrices | `/soluciones/*` | PARCIAL | Base Stitch, sin traducir |
| Recursos / Detalle técnico | `/recursos/*` | PARCIAL / PENDIENTE | Documentos en preparación; detalle muestra «Documento no publicado» |
| Nosotros | `/nosotros` | IMPLEMENTADA | Desborde horizontal a 320 px |
| Contacto | `/contacto` | IMPLEMENTADA | Sin backend (arma mensaje): correcto y declarado |
| Cotizar | `/cotizar` | **DEFECTUOSA** | Validaba y **descartaba** la solicitud; borraba el formulario |
| Confirmación | `/cotizar/confirmacion` | **DEFECTUOSA** | Cualquier `?ref=` mostraba «Solicitud registrada» |
| Carrito de cotización | `/carrito` | IMPLEMENTADA | Desborde a 320 px; foco del cajón no entraba (P0 a11y) |
| Buscar | `/buscar` | PARCIAL | Iconos rotos; h2/h3 antes del h1 |
| Libro de reclamaciones | `/reclamaciones` | PARCIAL | Sin backend (arma mensaje); descripción prometía «código de registro» |
| Términos, privacidad, cookies, mapa del sitio, 404 | varias | IMPLEMENTADA | Menores |
| Términos B2B | `/terminos-b2b` | PARCIAL | «En preparación» |
| Eliminar cuenta | `/eliminar-cuenta` | IMPLEMENTADA | Textos mencionan Facebook/contraseña, que no existen (pendiente) |
| Login / Registro | `/login`, `/registro` | PARCIAL | Google real; correo y contraseña «próximamente» (declarado) |
| Recuperar / Restablecer | `/recuperar`, `/restablecer` | **DEFECTUOSA** | Simulaban «Revisa tu correo» / «¡Contraseña actualizada!» |
| Selector de idioma | global | PARCIAL | 16 pantallas siguen en español con interfaz EN |
| Asistente FundigIA | global | IMPLEMENTADA | Requiere `ANTHROPIC_API_KEY`; sin ella responde la guía local |
| Proyectos / Documentación técnica separada | — | INEXISTENTE | No se crearon (no hay contenido real aprobado) |

## Defectos priorizados

### P0 — críticos
1. `/cotizar`: el embudo principal tiraba los datos del cliente (sin backend) y vaciaba el formulario. *Funcional.*
2. Visor 3D roto en producción: la CSP bloqueaba el WebAssembly del decodificador meshopt. *Funcional.*
3. Cajón del carrito: el foco nunca entraba; Tab recorría la página tapada. *Accesibilidad.*
4. ESLint fallaba siempre (carpetas `legacy/`, skills): la CI nunca llegaba a pruebas ni build. *Deuda técnica.*
5. SEO de lanzamiento: al activar la indexación, `*.vercel.app` también sería indexable; notas internas como descripciones; URLs del WordPress sin redirección. *SEO.*

### P1 — importantes
- Confirmación falsa con cualquier folio; recuperar/restablecer con éxito simulado. *Funcional/honestidad.*
- Enlaces de producto equivocados (FUNDIGSAC → H-ITALY) y filtros inexistentes. *Funcional.*
- Ocho iconos sin glifo en la fuente reducida, mostrados como texto. *Visual.*
- LCP móvil 3,46–3,55 s: imágenes LCP con prioridad baja (cambio de `priority` en Next 16), miniaturas y 2.ª diapositiva compitiendo. *Rendimiento.*
- Desbordes a 320 px (`/nosotros`, `/carrito`), menú móvil sin bloqueo de scroll ni gestión de foco, campos < 16 px (zoom iOS). *Responsive.*
- Contraste < 4,5:1 en insignias naranjas y textos atenuados; ARIA en español con interfaz EN; `lang` incorrecto en pantallas sin traducir; diálogos de la ficha sin gestión de foco. *Accesibilidad.*
- Folleto de documentación casi invisible en tema oscuro. *Visual.*
- `og:url` de todas las páginas apuntaba a la home; sin `og:image`; títulos duplicados y sin términos de búsqueda. *SEO.*

### P2 — refinamientos
Separadores huérfanos del pie, contador del carrusel partido a 320 px, pulsos infinitos, prefetch innecesario de `/login` `/registro` `/cookies`, roles ARIA inválidos en selector de idioma y miniaturas, `Φ` que forzaba la fuente griega, `sizes` sobredimensionados, aviso de Vitest, etc.

## Medición inicial (laboratorio, Lighthouse 13, producción)

| Ruta | Perf móvil | LCP móvil | Perf escritorio | A11y | BP | SEO* |
|---|---|---|---|---|---|---|
| `/` | 91 | 3463 ms | 100 | 100 | 100 | 66 |
| `/productos` | 96 | 2648 ms | 100 | 100 | 100 | 69 |
| `/productos/valvulas` | 99 | 2125 ms | 100 | 97 (escritorio) | 100 | 69 |
| Ficha FUNDIGSAC | 90 | 3554 ms | 100 | 100 | 100 | 69 |
| `/industrias` | 99 | 1752 ms | 100 | 100 | 100 | 69 |
| `/industrias/agricultura` | 96 | 2806 ms | 99 | 100 | 100 | 69 |
| `/nosotros` | 98 | 2276 ms | 100 | 100 | 100 | 69 |
| `/contacto` | 98 | 2275 ms | 100 | 100 | 100 | 69 |
| `/cotizar` | 97 | 2571 ms | 100 | 100 | 100 | 69 |

CLS 0,000 y TBT ≤ 9 ms en todas. *SEO bajo por el `noindex` intencional (ADR-001), no por defectos.
No hay datos de campo (CrUX/RUM): todo es laboratorio.

## Evidencias
Informes completos de cada agente en [`informes/`](informes/) (arquitectura y seguridad, SEO, diseño, responsive,
accesibilidad, rendimiento, regresión visual) y scripts/datos del A/B de rendimiento en `informes/perf-ab/`.
Capturas antes/después en [`capturas/`](capturas/). Los JSON de Lighthouse de la línea base quedan en `.perf/` (ignorado por git).
