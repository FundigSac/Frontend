# Visual Regression Guardian: LÍNEA BASE (2026-10-17)

Sitio: https://fundigsac-web.vercel.app (≡ HEAD). Chrome del sistema + Playwright 1.64. Solo lectura sobre el repo.

## Scripts
- `capture.cjs`: `node capture.cjs <BASE_URL> <OUT_DIR> [--preset baseline|noise] [--routes /a,/b --widths 1440,390 --themes light,dark] [--only txt] [--concurrency N]`
  - Nombres: `<ruta-slug>__<ancho>__<tema>.png` (`/` → `home`, `/` → `-`, `?q=` → `-q-`). Escribe también `manifest.json` (status HTTP, alto, `data-lp-theme`).
  - Después: `node capture.cjs http://127.0.0.1:<puerto> after --concurrency 4`
- `compare.cjs`: `node compare.cjs before after --out diff --json diff.json [--tolerance 24]`
  - Diff por píxel con sharp (no hay pixelmatch suelto en node_modules; solo va empaquetado en playwright-core). Da el % con tolerancia (máx. Δ canal > 24), el % estricto (Δ > 0), el Δalto y las bandas verticales afectadas. Genera `*.diff.png` en magenta.
- `sheet.cjs`: hojas de miniaturas para revisar a ojo (`node sheet.cjs before __1440__light.png sheets/x 7 260`).

## Línea base: `before/`, 111 capturas, 0 errores
- 38 rutas × {1440, 390} claro = 76
- 11 rutas clave × {1440 oscuro, 768 claro, 1920 claro} = 33
- `home-hero2__{1440,390}__light.png`: segunda variante del carrusel del hero (componente protegido) = 2
- Todas devuelven 200, salvo `/ruta-que-no-existe`, que devuelve 404 como se espera. En las capturas oscuras, `data-lp-theme="dark"` está confirmado.

## Ruido entre ejecuciones idénticas (before-a/ y before-b/, 1440 claro)
| Ruta | Tolerancia 24 | Estricto |
|---|---|---|
| / | 0,0000 % | 0,0000 % |
| /productos | 0,0000 % | 0,0000 % |
| /productos/valvulas/valvula-compuerta-fundigsac | 0,0000 % | 0,0000 % |
| /industrias/agricultura | 0,0000 % | 0,0000 % |
| /contacto | 0,0000 % | 0,0000 % |
| home-hero2 (1440 y 390) | 0,0000 % | 0,0000 % |

Primera iteración, sin flags: 0,0000–0,0003 % con tolerancia, pero en modo estricto salía 0,7–11,5 %. Eran variaciones de ±1–2 en fotos, desenfoques y degradados, causadas por el rasterizado GPU multihilo de Chrome.

## Elementos dinámicos estabilizados
1. Rasterizado no determinista: `--disable-gpu --disable-gpu-rasterization --num-raster-threads=1 --disable-partial-raster --disable-skia-runtime-opts --force-color-profile=srgb --font-render-hinting=none --disable-lcd-text`. Con esto el ruido estricto baja a 0 %.
2. `content-visibility:auto` en `.lp-backing`, `.lp-docs` y `.lp-location`: en una captura fullPage, Chrome no pinta lo que queda fuera del viewport, y en inicio salía un hueco blanco de unos 900 px. Durante la captura se inyecta `content-visibility:visible!important`.
3. Aviso del asistente (`.ai-teaser`): aparece a los 9 s y desaparece a los 14 s. Se fija `sessionStorage['fundigsac-assistant-teaser']='1'`.
4. Carrusel del hero: con `reducedMotion:'reduce'` no avanza solo. Además se pulsa «Pausar carrusel» si aparece.
5. Vídeo del hero de agricultura: con reduced motion no se monta. Aun así, los `<video>` se pausan con `currentTime=0`.
6. Animaciones por scroll (`animation-timeline: view()`): se anulan con reduced motion, y la captura usa `animations:'disabled'` y `caret:'hide'`.
7. Banner de cookies: oculto con la cookie `fundigsac-consent` (v2, política 2026-10). Tema e idioma se fijan en localStorage.
8. Botones flotantes (WhatsApp `.lp-float__wa` y asistente `.ai-launch`): **no se ocultan**, porque no cambiaban entre capturas.

## Componentes protegidos (selectores verificados en producción)
| Componente | Selector |
|---|---|
| Cabecera | `header.lp-header` (variantes `--sector`, `--catalog`, `.is-solid`) |
| Logo | `.lp-header__brand img` (src `/brand/fundigsac.svg`), `.lp-footer__brand` |
| Carrusel del hero | `section.lp-hero`, `.lp-hero__stage`, `.lp-hero__valve` (×2, `.is-active`), `.lp-hero__controls` |
| Fotos reales de producto | `.lp-hero__photo`, `.lp-components`, `.lp-sectors`, `.lp-backing__media`, `.lp-docs__media img` |
| Paleta | pie `rgb(11,26,46)`; CTA naranja `.lp-btn--solid` `rgb(201,79,10)` (acento existente); azul petróleo/celeste |
| Tipografías | h1 «Plus Jakarta Sans», body «Inter» |
| Pie corporativo | `footer.lp-footer` |
| Banner de cookies | `section.ck` (+ diálogo `.ck-dialog`); referencia: `cookie-banner__1440__light.png` |
| WhatsApp | `.lp-float__wa` (dentro de `.lp-float`) |
| Asistente | `.ai-launch` (+ `.ai-teaser`) |

## Anomalías visuales en la línea base (estado actual)
| ID | Prio | Captura | Hallazgo | Causa |
|---|---|---|---|---|
| V1 | P1 | `home__1440__dark.png` (y≈2360–2810) | En oscuro, el folleto de «Documentación técnica» casi no se ve | `src/app/landing.css:1036` `mix-blend-mode: multiply` sobre fondo `#0a1424` (`landing.css:1848`). La regla oscura `:1868` no lo neutraliza. Propuesta: `mix-blend-mode: normal` en el oscuro |
| V2 | P1 | `productos-valvulas-valvula-mariposa__*` (y≈1736) | Aparece el texto «SHOW_CHART» en lugar del icono | `src/screens/w07.tsx:24`: el glifo falta en el subset `public/fonts/material-symbols-v3.woff2` |
| V3 | P1 | `cotizar-confirmacion__*` (y≈1357) | Aparece «print» como texto | El glifo `print` tampoco está en el subset |
| V4 | P1 | 17 rutas (las pantallas Stitch: /productos*, /industrias, /soluciones*, /recursos*, /cotizar*, /buscar, /terminos-b2b, visor-3d) | El h1 usa Inter en vez de Plus Jakarta Sans, lo que rompe la consistencia de la identidad | Tokens `font-headline-*` de las pantallas `src/screens/wNN.tsx` |
| V5 | P2 | `contacto__390`, `cotizar__390`, `home__390` | En móvil, los flotantes WhatsApp y asistente tapan contenido: la tarjeta WhatsApp en contacto, campos del formulario en cotizar y la válvula del hero | `.lp-float` / `.ai-launch` fijos, sin reservar espacio |
| V6 | P2 | `productos__390__light.png` | El placeholder del buscador sale truncado («…o apl») | Texto largo para 390 px |

No se detectan imágenes rotas ni scroll horizontal en ninguna de las 38 rutas, ni a 1440 ni a 390.
