# 02 · Mejoras implementadas

35 commits sobre `09a8d7c` (incluido el de esta documentación), en `main` y sin publicar. Cada commit es pequeño y
reversible por separado (`git revert <hash>`). Nada se desplegó a producción.

## Agentes especializados
`d3c61a4` — 8 subagentes en `.claude/agents/` (design-director, responsive-specialist, performance-engineer,
technical-seo-engineer, accessibility-specialist, qa-automation-engineer, architecture-security-reviewer,
visual-regression-guardian) con frontmatter válido para Claude Code 2.1 (`model`, `effort`, `disallowedTools`, `color`) y
contexto común en `.claude/contexto-agentes.md`. Los de auditoría son de solo lectura; QA solo escribe en `tests/`.
Se cargan al abrir Claude Code dentro de `frontend/`.

## Funcional (P0/P1)

| Commit | Problema | Cambio | Archivos |
|---|---|---|---|
| `1d6455c` | `/cotizar` validaba y **descartaba** la solicitud y vaciaba el formulario (no hay backend) | El formulario conserva los datos y muestra «Tu solicitud está lista para enviar» con correo, WhatsApp y copiar, incluidos los productos del carrito; el foco va al panel. La confirmación ya no muestra «registrada» para cualquier `?ref=` | `modules/leads/lead-form.tsx`, `lead-message.ts` (nuevo), `screens/w17.tsx`, `cotizar/confirmacion/page.tsx` |
| `458bb97` | Si la acción del servidor fallaba (red, despliegue nuevo), el error subía a la página de error y se perdía lo escrito | Aviso en el formulario sin perder los datos | `modules/leads/lead-form.tsx` |
| `70c93d3` | «Ver en 3D» roto en producción: CSP bloqueaba el WASM del decodificador meshopt | `'wasm-unsafe-eval'` en `script-src` (solo WebAssembly, no `eval`) y comentarios corregidos | `next.config.ts` |
| `325b71c` | Recuperar/restablecer contraseña fingían enviar correo / actualizar | Aviso «La zona de clientes llega muy pronto», como login y registro | `modules/access/access-forms.tsx` |
| `049a758` | 14 tarjetas «Ver ficha» abrían Contacto | «Solicitar ficha» → Contacto con el producto ya indicado | `w03-valvulas*`, `w04-tuberias`, `w05-marcos` |
| `9508754` | «Válvula de compuerta FUNDIGSAC» enlazaba a la ficha y PDF de H-ITALY; filtro `?categoria=` inexistente | Ficha y PDF FUNDIGSAC; enlaces a `/productos/tuberias` y `/productos/valvulas` | `industrias/_sector/sector-page.tsx`, `agricultura/sections.tsx` |
| `1b5b123` | 8 iconos sin glifo en la fuente reducida se veían como texto («SHOW_CHART», «print») | Iconos de `lucide-react` (ya instalado) | `screens/w07, w08, w22, w23, w24` |
| `b834d07` | `pnpm lint` fallaba siempre: la CI nunca llegaba a pruebas ni build | ESLint ignora `legacy/`, skills y builds paralelas; Vitest sin aviso de `__dirname` | `eslint.config.mjs`, `vitest.config.ts` |
| `b4279ec` | Foto del hero de `/productos` con la marca mal escrita («FUNDISAC») y logo no oficial; portada de recurso con otra razón social y sellos ISO no verificados | Foto de planta sin texto de marca; portada oficial del catálogo | `w02-catalog.module.css`, `productos/page.tsx`, `screens/w14.tsx` |
| `ded65cd` | La descripción del libro de reclamaciones prometía un «código de registro» inexistente | Descripción con datos reales (Ley 29571, 15 días hábiles) | `reclamaciones/page.tsx` |

## Seguridad y privacidad
| Commit | Cambio |
|---|---|
| `70c93d3` | CSP mínima para WebAssembly (ver arriba) |
| `91d289e` | El mapa de Google recibe solo el origen como referrer (antes la URL completa) |
| `ff32a46`, `d028014` | El bloqueo de clic derecho/atajos (pedido por el dueño, commit `d033f87`) se mantiene, pero deja el menú contextual en campos de formulario y no bloquea Ctrl+Shift+U («Leer en voz alta» de Edge) |
| `2033203` | `X-Robots-Tag: noindex` en cualquier host distinto de `fundigsac.com` |

## SEO (`2033203`) — detalle en `04-seo.md`
Metadatos reales por página, títulos sin duplicados, `og:image`/Twitter, `og:url` corregido, JSON-LD veraz, sitemap y robots
coherentes con `noindex` por página, redirecciones del WordPress, indexación solo en el dominio canónico.

## Rendimiento — detalle en `03-performance.md`
| Commit | Cambio |
|---|---|
| `c7f3724`, `5875fbe` | Imágenes LCP con `loading="eager"` + `fetchPriority="high"` (en Next 16 `priority` ya no sube la prioridad); miniaturas con variante nueva de 256 px y prioridad baja; `sizes` reales en la ficha (a 1024 px se servía una foto de 640 px para una caja de 960) |
| `5875fbe` | `n × Ød` en vez de `n × Φd`: la «Φ» griega obligaba a descargar otro archivo de fuente |
| `56d936c` | La 2.ª válvula del carrusel (92 KB) se monta tras `load`; tarjetas de componentes sin `eager` |
| `f2793ff` | `sizes` acordes al ancho real de tarjetas en agricultura y catálogo |
| `c43831a` | Sin prefetch de `/login`, `/registro`, `/cookies` (~100 KB tras cada carga) |
| `e732c24` | Fotos recortadas piden el ancho al que se pintan (se veían ampliadas ×1,5–1,8) |

## Responsive — detalle en `05-responsive-qa.md`
`aed4b09` menú móvil (bloqueo de scroll, `inert` en el fondo, Escape devuelve el foco, enlaces de 44 px), contador del carrusel
sin salto de línea, separadores del pie; `03edcd1` sin scroll horizontal en `/nosotros` y `/carrito` a 320 px; `d01d2b0`
campos de 16 px en pantallas táctiles (sin zoom de iOS).

## Accesibilidad (WCAG 2.2 AA)
| Commit | Cambio |
|---|---|
| `bd9d749` | El foco entra al cajón del carrito (antes Tab recorría la página tapada) |
| `b052f63` | «Saltar al contenido», logo, navegación y carrusel en ES/EN; Escape devuelve el foco a cada menú; submenús se cierran al salir con Tab; selector de idioma con botones `aria-pressed` (no un listbox inválido); el carrusel se pausa con puntero o foco; pulso de WhatsApp finito |
| `1384f18` | `<main lang="es">` en 14 pantallas sin traducir (WCAG 3.1.2) |
| `913e21f` | Foto ampliada y vista del PDF de la ficha: foco dentro, atrapado y devuelto (`shared/ui/use-dialog-focus.ts`); miniaturas como botones `aria-pressed` en un grupo |
| `3227afd` | Insignias naranjas a `#c94f0a` (4,56:1), texto atenuado de fichas a 5,2:1, contador oscuro AA; `scroll-padding-top` para que el foco no quede bajo la cabecera fija |
| `d028014` | Botón de animación de agricultura con un solo estado; halo del asistente finito |

## Diseño (identidad conservada)
| Commit | Cambio |
|---|---|
| `1df8c3d` | Folleto de documentación visible en tema oscuro (antes `multiply` lo apagaba) |
| `55c901d` | Desplegables de cabecera legibles (vidrio con más relleno); título de nota invisible en `/industrias` oscuro; tarjeta destacada con variante oscura |
| `ef84fa9` | Fuera efectos genéricos señalados por el detector y confirmados por el Design Director: texto con degradado del 404, franjas laterales en cajas legales, halos y retícula animada en eliminar cuenta, brillo del rótulo «pensando», curvas con rebote |
| `e732c24` | `/buscar` sin válvulas recortadas, `/terminos-b2b` sin banda vacía, aviso del asistente sin tapar los controles del carrusel |

## Pruebas
- Unitarias: 108/108 (sin cambios de comportamiento cubiertos por ellas).
- e2e actualizadas porque cambió el comportamiento a propósito (nunca para debilitarlas): cotización (`content.spec.ts`,
  `catalog.spec.ts`), acceso (`access-cart.spec.ts`), tarjetas «Solicitar ficha» y miniaturas por rol de grupo
  (`catalog.spec.ts`, `valvulas-estructura.spec.ts`). Cada prueba nueva comprueba algo más estricto que antes (datos
  conservados, foco en el panel, contenido del `mailto`, ausencia de la trampa anti-bots en el mensaje).
- `f763a02`: miniaturas seleccionadas por su grupo accesible. `fde99ec`: la prueba «cancelar en Google» se omite sin
  credenciales OAuth locales, igual que el resto de su archivo (sin ellas el servidor responde `not_configured`).
