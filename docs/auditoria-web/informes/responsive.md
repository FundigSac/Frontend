# Auditoría responsive FUNDIGSAC — 2026-10-17

Sitio: https://fundigsac-web.vercel.app (igual a HEAD). Playwright 1.64 con Chrome del sistema, consentimiento de cookies fijado por cookie.
En móvil (≤430 px) se usaron `isMobile`, `hasTouch`, DPR 2 y alto 844; en el resto, alto 900. Antes de medir se recorre la página para cargar imágenes diferidas y disparar los `lg-reveal`. Después se fijan los estados finales (`animation/transition: none`, `content-visibility: visible`). Sin ese paso, las secciones con `animation-timeline: view()` quedan con opacidad 0 y no se miden.

Scripts: `lib.cjs`, `run-matrix.cjs`, `interact.cjs`, `extra.cjs`, `verify.cjs`, `fixcheck.cjs`. Datos en bruto: `raw-*.jsonl`. Matriz consolidada: `matriz.json`.

## 1. Resumen de la matriz

| Modo | Combinaciones | ✔ | ✘ (layout) |
|---|---|---|---|
| ES · 38 rutas × 9 anchos | 342 | 339 | 3 (`/nosotros`@320, `/carrito`@320, `/productos/valvulas/valvula-mariposa`@320) |
| EN · 38 × {320, 390} | 76 | 74 | 2 (`/carrito`@320 y mariposa@320; `/nosotros` pasa en EN) |
| Oscuro · 3 rutas @390 | 3 | 3 | 0 |

- No hay imágenes rotas (`naturalWidth 0`) ni errores de JS en ninguna combinación.
- Desde 375 px y en todos los anchos de escritorio, `scrollWidth === clientWidth` en las 38 rutas.
- Hubo 57 detecciones automáticas de solapes de texto. Todas resultaron **falsos positivos** al revisarlas una por una en capturas:
  - el `h1` partido en `span` de las páginas de acceso: interlineado ajustado, pero legible;
  - los numerales decorativos «01/02» y «2005» de `/nosotros`;
  - textos truncados con `line-clamp` en `/productos` y en las miniaturas de mariposa;
  - acordeones cerrados de `/cookies` y `/eliminar-cuenta`, que solo aparecían al forzar `content-visibility`.
- Táctil (≤430 px): 5 selectores por debajo de 24 px (fallo WCAG 2.5.8) y 146 selectores entre 24 y 43 px (aviso).
- Inputs con fuente menor de 16 px en móvil: 9 componentes (provocan zoom en iOS).

## 2. Hallazgos

| ID | Prior. | Ruta(s) | Ancho(s) | Selector | Archivo:línea | Problema | Corrección propuesta (verificada inyectando el CSS cuando se indica ✓) | Captura |
|---|---|---|---|---|---|---|---|---|
| F1 | P1 | /nosotros (ES) | 320 | `.ab-history__grid` → `.ab-history__intro`, `ol.ab-timeline` (20→328) | src/app/nosotros/about.css:325-328 | En móvil la columna `1fr` (= `minmax(auto,1fr)`) crece hasta 308 px y `.lp` (`overflow-x: clip`) **recorta** el texto, el CTA «Conoce nuestra historia» y la línea de tiempo. | `grid-template-columns: minmax(0, 1fr);` ✓ (no queda desborde) | nosotros_320.png |
| F2 | P1 | /carrito (ES y EN) | 320 | `.cp-grid` → `.cp-empty`, `ul.cp-trust` (16→374) | src/shared/cart/cart.css:1136-1138 y 252 | Hay scroll horizontal de 54 px. Las tarjetas sugeridas (`.ct-suggest li`: miniatura + texto + «Agregar» sin salto) fijan el min-content. | `.cp-grid{grid-template-columns:minmax(0,1fr)}`; `@media (max-width:480px){.ct-suggest li{flex-wrap:wrap}.ct-suggest li>div{flex:1 1 120px}.ct-suggest .ct-add{margin-left:auto}}` ✓ (scroll 374→320, sin solapes) | carrito_320.png |
| F3 | P1 | /productos/valvulas/valvula-mariposa | 320 (y a la vista en todos los anchos) | `span.material-symbols-outlined` «show_chart» (220 px) | src/screens/w07.tsx:24 · src/app/globals.css:253-258 | La fuente recortada `material-symbols-v3.woff2` no incluye el glifo `show_chart`: se ve el texto literal «SHOW_CHART». Eso ensancha la tarjeta «Curva de caudal» y genera scroll horizontal de 40 px. | Volver a generar el subconjunto con `show_chart` (o cambiarlo por un SVG lucide). Como protección: `.material-symbols-outlined{width:1em;overflow:hidden}` ✓ (scroll 360→320) | productos-valvulas-valvula-mariposa_320.png |
| F4 | P1 | todas (menú móvil) | 390, 768 | `.lp-mobile.is-open` | src/app/landing.css:1139-1145 | No se bloquea el scroll de fondo: html/body siguen en `visible` y la rueda sobre el menú, al llegar al final, desplaza la página 600 px (`overscroll-behavior: auto`). | `.lp-mobile.is-open{overscroll-behavior:contain}` + `html:has(.lp-mobile.is-open){overflow:hidden}`, o reutilizar la clase `cd-lock` del carrito | productos-menu_390.png |
| F5 | P1 | todas | 390, 768 | `button.lp-header__toggle` | src/shared/layout/landing-chrome.tsx:70-79 | Escape cierra el menú, pero si el foco estaba dentro del menú se pierde y vuelve a `<body>`. | Guardar una ref del toggle: en `onKey`, `if (mobileOpen) toggleRef.current?.focus()` antes de `setMobileOpen(false)` | — |
| F6 | P1 | todas (cajón del carrito) | 390, 768 | `.cd-panel[role=dialog][aria-modal]` | src/shared/cart/cart-drawer.tsx:29-32 | `closeRef.focus()` se ejecuta cuando `.cd` aún está `visibility:hidden` (el estado `visible` llega un rAF después). Por eso el foco se queda en el disparador y Tab recorre la página que está detrás (25/25 tabulaciones fuera del panel). | Enfocar cuando `open && visible`: mover `closeRef.current?.focus()` a un efecto con dependencias `[open, visible]` | — |
| F7 | P1 | /productos, /productos/valvulas, /tuberias, /marcos-y-tapas, fichas compuerta, /recursos, /buscar, /reclamaciones, /eliminar-cuenta; /contacto y acceso solo a 768 | ≤430 (y 768 táctil) | inputs/selects de 12–15 px | w02-catalog.module.css:1002-1004 (12px) y 158 · w03-valvulas.module.css:243, 254 · w04-tuberias.module.css:257, 268 · w05-marcos.module.css:258, 269 · w06-ficha.module.css:317 (15px) · w13.tsx:152 (14px) · w22-search.tsx:347-359 (12px) · _legal/legal.css:1103 (15px) · contacto/contact.css:658-661 (16px solo ≤640) · modules/access/access.css:370 (15px) | iOS amplía la página al enfocar cualquier campo de menos de 16 px. | Una regla en globals.css (después de la línea 279): `@media (pointer:coarse){input:not([type=checkbox]):not([type=radio]),select,textarea{font-size:max(16px,1em)}}`, o subir cada valor a 16px | — |
| F8 | P2 | / | 320 | `.lp-hero__count` | src/app/landing.css:598 y 1267 | El contador «02 / 02» se parte en dos líneas: la píldora de controles mide 70 px de alto y pisa 6 px de la base de la válvula. Las flechas se encogen a 37×40. | `.lp-hero__count{white-space:nowrap;min-width:0}` y `@media (max-width:350px){.lp-hero__controls{gap:6px}.lp-hero__bars{display:none}}` | inicio_320.png |
| F9 | P2 | / (horizontal) | 844×390 | `.lp-hero` apilado (≤860) | src/app/landing.css:1190-1270 | En horizontal el hero mide 1228 px (3,1 pantallas): el texto llena el viewport, el CTA queda en y = 375 (fuera) y la válvula entre 502 y 1144. | `@media (max-width:860px) and (orientation:landscape) and (max-height:500px){.lp-hero__grid{grid-template-columns:minmax(0,1fr) minmax(0,.6fr)}.lp-hero__stage{width:auto;height:calc(100svh - 120px);margin-bottom:64px}.lp-hero h1{font-size:clamp(28px,4.6vw,38px)}}` (sin verificar) | inicio_844x390.png |
| F10 | P2 | todas | ≤430 | `.lp-float__top` (izq.), `.lp-float__wa`, `.ai-launch` | src/app/landing.css:2190-2205 · src/shared/assistant/assistant.css:440-445 | Durante el scroll, los flotantes tapan un 30–98 % de controles: enlaces del pie, «Sector siguiente», tallas DN de la ficha y la flecha ← de «Componentes» a 320. Al final de la página nada queda tapado. | Reservar espacio en el pie: `@media (max-width:860px){.lp-footer{padding-bottom:calc(88px + env(safe-area-inset-bottom))}}`. Ocultar `.lp-float__top` mientras el pie esté visible es opcional | productos-tuberias-tuberia-tyton_390.png, productos_320.png |
| F11 | P2 | todas | ≤860 | `.lp-footer__legal .lp-footer__linkbtn::before` | src/app/landing.css:2649-2654 (frente a 1394) | Quedan separadores «\|» huérfanos al principio de línea, antes de «Preferencias de cookies» y «Libro de reclamaciones». | Dentro del bloque ≤860, añadir `.lp-footer__legal a + .lp-footer__linkbtn::before,.lp-footer__legal .lp-footer__linkbtn + a::before{display:none}` | productos_390.png |
| F12 | P2 | catálogo y fichas | 320 | `a.lp-header__brand` (100×22) | src/app/landing.css:2891-2894 | El área táctil queda por debajo de 24 px (WCAG 2.5.8). | `.lp-header__brand{min-height:44px;align-items:center}` | — |
| F13 | P2 | mariposa (15 px); /industrias (21 px); /buscar | 320–430 | migas `ol.flex > li > a`, `.x-crumbs a` | src/screens/w07.tsx:11 · src/styles/pages.css:90 | Las migas miden menos de 24 px de alto y están a menos de 24 px entre sí. | `li>a{display:inline-flex;min-height:24px;align-items:center}` (con `py-1` en Tailwind) | — |
| F14 | P2 | todas (menú) | 390, 768 | `.lp-mobile__group > a` (26 px), hijos (38 px), `.lp-mobile__prefs button` (40 px) | src/app/landing.css:1152-1159 | Están por debajo de la meta de 44 px. Además, el foco no queda atrapado: después de 25 tabulaciones sale a la página tapada. | `padding-block:9px` en los enlaces de grupo y `min-height:44px` en los hijos y en las preferencias. Atrapar el foco o poner `inert` en `main`/`footer` mientras el menú está abierto | — |

Avisos de 24 a 43 px que se repiten en las 38 rutas: buscar y carrito 40×40 (38×40 a 320), toggle 38×44 a 320, cuenta 40×40, enlaces legales del pie 30 px, «Preferencias de cookies» 26 px, correo del pie 39 px, ojo de contraseña 38×38, tallas DN 36 px, PN 38 px, «Agregar» 36 px, cerrar FundigIA 36×36 y enviar 38×38.

Fuera de alcance, pero visto: en EN, los nombres de producto, las miniaturas y las fichas siguen en español.

## 3. Pruebas interactivas (390 y 768)

- **Menú móvil.** Visible a 390 y 768; la navegación de escritorio aparece desde 1280 (a 1024 también hay menú hamburguesa). Abre bien, sin desborde horizontal; `max-height: 100dvh − 72px` con scroll interno. Escape lo cierra y `aria-expanded` vuelve a `false`, pero el foco se pierde (F5). El scroll del fondo no se bloquea (F4) y el foco no queda atrapado (F14). Al abrirlo se ocultan los flotantes y el aviso de cookies.
- **Submenús de escritorio** (1280). Productos, Sectores y Recursos se despliegan dentro del viewport, y Escape los cierra.
- **Carrusel del hero.**
  - Las dos diapositivas («sin timón» y «con timón») cargan; a 390, 768 y 320×568 no hay recortes arriba, abajo ni a los lados.
  - Las flechas ← y → funcionan; el swipe táctil (CDP) y el arrastre con puntero cambian de diapositiva; `touch-action: pan-y` es correcto.
  - A 390 la válvula ocupa y = 535–1009, así que su base queda bajo el pliegue: es el diseño apilado.
  - A 320 los controles se aprietan (F8). Los botones miden 40×40 (aviso).
- **Cajón del carrito.** Ocupa toda la pantalla a 390 y mide 440 px a 768, sin desborde. Bloquea el scroll (`cd-lock`), Escape lo cierra y el foco vuelve al botón. El foco inicial y la trampa de foco no funcionan (F6). Los flotantes quedan debajo.
- **Asistente FundigIA.** A 390 ocupa toda la pantalla, con bloqueo de scroll, foco en el panel, input de 16 px y el lanzador oculto; Escape lo cierra. A 768 es un panel de 410×680 dentro del viewport, con input de 14,5 px (zoom en iPad, F7).
- **Flotantes.** Ver F10. Con el menú o el carrito abiertos no se superponen.
- **Tablas técnicas.**
  - Fichas de compuerta: 354 px dentro de 390 y 704 px a 768, sin scroll.
  - Mariposa (620 px) y marco D400 (720 px): scroll horizontal dentro de `div.overflow-x-auto` con `role=region`, `aria-label` y `tabindex=0`, sin scroll de página.
  - `/cookies`: la tabla encaja.
  - Falta una pista visual de que la tabla se desplaza (P2: sombra en el borde).
- **Formularios.**
  - `/contacto`: 16 px en móvil y 15 px a 768.
  - `/cotizar`: correcto; el honeypot está fuera de pantalla a propósito.
  - `/reclamaciones`: 21 campos de 15 px (F7). Radios «medio de respuesta» con área de 26 px.
  - `/login` y `/registro`: 16 px en móvil, 15 px a 768; casilla «Recordarme» de 26 px; casillas de registro de 21 px a 768 (aviso).
  - Ninguno desborda. Todos tienen etiqueta visible y `autocomplete` adecuado. No se envió ningún formulario.
- **Horizontal 1024×768.** En `/`, H1 y CTA quedan visibles y la válvula está completa (85–629). En la ficha, el H1 queda en y = 926 porque la galería va primero. `/contacto` está bien.
- **Horizontal 844×390.** Ver F9. La cabecera ocupa 73 px (19 %) y los flotantes un 1 %.
