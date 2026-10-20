# Informe de movimiento y UX — FUNDIGSAC (2026-10-20)

Pase de movimiento sobre el sitio publicado en <https://fundigsac-web.vercel.app/> (repo `FundigSac/Frontend`,
commits `41d235d` a `0b5a420` y el de este informe). Todo lo medido aquí se midió en local sobre builds de producción limpios; nada se
desplegó.

## 1. Resumen ejecutivo

El sitio no estaba "quieto": el inicio, Nosotros, Contacto, las fichas de compuerta, las páginas legales y el chatbot ya
tenían coreografías propias. El problema era otro: **siete implementaciones distintas** del revelado al hacer scroll
(con distancias de 18 a 44 px, curvas y umbrales diferentes), animaciones ligadas al scroll que en Firefox no existían y
en Chrome se "rebobinaban", y pantallas completas sin ningún movimiento (catálogo, tuberías, marcos y tapas, fichas de
referencia, cotizar).

Qué cambió de verdad:

- **Un solo sistema de movimiento** (`src/shared/motion/`): tokens, variantes de revelado por atributo `data-reveal`,
  entrada al pintar con `data-enter`, respuesta a filtros con `data-results`, un único IntersectionObserver para todo el
  documento y una línea de navegación entre páginas. Cuesta **≈ 1,3 KB de JS y 1,1 KB de CSS (gzip) por ruta**, sin
  dependencias nuevas.
- **Momento focal del hero**: el cambio entre válvula sin timón y con timón ya no es un fundido (que mostraba dos
  cuerpos translúcidos desalineados medio segundo); ahora una línea de borde suave baja por el vástago y el cuerpo,
  idéntico al píxel en ambas fotos, no se mueve. El hero deja de rotar y de animar su fondo fuera de pantalla.
- **Cabecera**: el menú móvil baja y sus grupos entran en cascada (antes aparecía de golpe), la X entra con un cuarto de
  vuelta y el subrayado activo crece en el compositor (antes animaba `left/right`).
- **Inicio**: las secciones entran una sola vez y en todos los navegadores; las franjas diagonales de sectores quedan
  fijas sobre sus líneas y solo su foto se asienta y su texto sube, de izquierda a derecha.
- **Catálogo**: entrada del hero, revelado de secciones y, al filtrar/buscar/ordenar, las tarjetas nuevas entran con
  una cascada corta (se nota que la lista respondió).
- **Bugs corregidos por el camino**: Agricultura ocultaba y volvía a mostrar lo que ya estaba en pantalla al cargar;
  un salto (tecla Fin, ancla) podía dejar bloques invisibles para siempre en las implementaciones antiguas, incluida
  `LegalMotion` de las páginas legales (corregido también allí).
- **Verificado** en Chromium, Firefox y WebKit (escritorio y móvil), 11 anchos de 320 a 2560 px, horizontal y
  laptop baja, y con "reducir movimiento"; suite e2e del proyecto sin fallos. Sin push ni despliegue.

## 2. Inventario de rutas

Rutas reales encontradas en `src/app` (31 páginas + 1 PDF dinámico + 5 API). Estado visual previo medido con
`scripts/qa/motion-audit.mjs` (animaciones vivas en el primer segundo, desktop 1440 px).

| Ruta | Estado previo | Movimiento previo | Deficiencias | Intervención | Prioridad |
|---|---|---|---|---|---|
| `/` | Cuidado | Entrada CSS del hero, scroll-driven duplicado | Fundido del hero con dos cuerpos; reveals rebobinables, ausentes en Firefox; bucles activos fuera de pantalla | Barrido del hero, reveals únicos, sectores, pausa fuera de pantalla | P0 |
| Cabecera / menú móvil (global) | Bien | Transiciones de color, dropdowns | Menú móvil sin transición; subrayado anima layout | Entrada/salida del menú, cascada, X, subrayado con `scaleX` | P0 |
| `/industrias` | Bien | Reveal cliente propio (`Reveal`) | Implementación aparte | `Reveal` pasa a componente de servidor del sistema común | P1 |
| `/industrias/saneamiento`, `/mineria` | Bien | Hook de reveal copiado | Copia duplicada, 44 px laterales | Sistema común (36 px, en móvil sube) | P1 |
| `/industrias/agricultura` | Bien | Vídeo + lienzo, hook copiado | Ocultaba lo ya visible al cargar | Sistema común; el hero animado ya se pausa fuera de pantalla, con pestaña oculta, ahorro de datos y RM (sin cambios) | P1 |
| `/productos` | Estático | Ninguno (2 animaciones del layout) | Sin entrada ni respuesta al filtrar | `data-enter`, reveals, `data-results` | P1 |
| `/productos/valvulas` | Bien | Scroll-driven en tarjetas + hook | Hook aparte | Sistema común (beneficios en cascada) | P1 |
| `/productos/tuberias`, `/marcos-y-tapas` | Estático | Ninguno | Sin entrada ni respuesta al filtrar | `data-enter`, pestañas en cascada, `data-results`, recursos | P1 |
| Fichas de compuerta (3) | Rico | Coreografías propias + hook | Hook aparte | Sistema común; coreografías intactas | P1 |
| Fichas de referencia (mariposa, Tyton, D400) | Estático | Ninguno | Sin entrada | `data-enter`, encabezados y grillas | P1 |
| `/nosotros`, `/contacto` | Rico | `LegalMotion` + coreografías (cortina, mapa, línea de tiempo) | — | Sin cambios (verificado) | — |
| `/cotizar`, `/cotizar?producto=` | Casi estático | 1 animación | Sin entrada | `data-enter`, pasos en cascada; campos sin animar | P1 |
| `/cotizar/confirmacion`, `/carrito` | Bien | Propias del carrito | — | Avisos (`role=status/alert`) con entrada corta | P2 |
| `/login`, `/registro`, `/recuperar`, `/restablecer` | Bien | `ac-rise`, `ac-pop`, spinner | — | Sin cambios de lógica ni de diseño | P2 |
| Legales: `/terminos`, `/privacidad`, `/cookies`, `/mapa-del-sitio`, `/reclamaciones`, `/eliminar-cuenta` | Bien | `LegalMotion` | — | Sin cambios; quedan fuera del sistema por diseño (se probó que no se rompen) | P2 |
| 404 | Bien | Foto que se asienta, entrada | — | Sin cambios | P2 |
| Chatbot (global) | Rico | 23 animaciones de la mascota y del panel | — | Sin cambios (no se tocó la lógica de IA) | P2 |
| `/docs/…garantia-extendida.pdf` | — | — | — | Excluido de la línea de navegación (es un archivo) | — |

## 3. Matriz de implementación

"Desktop" = 1024, 1280, 1440, 1920 y 2560 px; "Mobile" = 320, 360, 375, 390, 430 y 768 px; además 844×390 (móvil
horizontal) y 1366×600 (laptop baja) en las 10 rutas principales. ✔ = medido sin desborde horizontal, sin bloques
invisibles tras recorrer la página y sin errores de consola (`scripts/qa/motion-audit.mjs`, build de producción). La
columna "Anim." son las animaciones vivas en los primeros 250 ms a 1440 px, antes → después (no es una nota de calidad:
el inicio baja porque ya no corren decenas de animaciones ligadas al scroll a la vez).

| Ruta | Animaciones implementadas | Desktop | Mobile | Anim. | Rendimiento | Estado |
|---|---|---|---|---|---|---|
| `/` | Barrido del hero, pausa fuera de pantalla, reveals únicos, sectores, documentos, mapa | ✔ | ✔ | 75 → 48 | Ver §7 | Verificado |
| Cabecera (global) | Menú móvil con entrada/salida y cascada, X, subrayado `scaleX`, línea de navegación | ✔ | ✔ | — | +1,3 KB JS común | Verificado (e2e) |
| `/industrias` | Reveal común (servidor) | ✔ | ✔ | 39 → 5 | — | Verificado |
| `/industrias/agricultura` | Reveal común; ya no oculta lo visible al cargar | ✔ | ✔ | 27 → 15 | Ver §7 | Verificado |
| `/industrias/saneamiento` | Reveal común | ✔ | ✔ | 31 → 19 | Ver §7 | Verificado |
| `/industrias/mineria` | Reveal común | ✔ | ✔ | 26 → 10 | Ver §7 | Verificado |
| `/productos` | Entrada del hero, familias y beneficios en cascada, respuesta al filtrar | ✔ | ✔ | 2 → 6 | Ver §7 | Verificado (e2e) |
| `/productos/valvulas` | Beneficios en cascada (sistema común) | ✔ | ✔ | 25 → 25 | — | Verificado |
| `/productos/tuberias`, `/marcos-y-tapas` | Entrada, pestañas en cascada, respuesta al filtrar, recursos | ✔ | ✔ | 2 → 5 | Ver §7 | Verificado (e2e) |
| Fichas de compuerta (3) | Sistema común + coreografías propias intactas | ✔ | ✔ | 22–26 → 22–26 | Ver §7 | Verificado |
| Fichas de referencia (3) | Entrada, encabezados y grillas | ✔ | ✔ | 2 → 5 | — | Verificado |
| `/nosotros`, `/contacto` | Sin cambios (LegalMotion) | ✔ | ✔ | 16 / 7 | Ver §7 | Verificado sin regresión |
| `/cotizar` | Entrada del encabezado, pasos en cascada, avisos | ✔ | ✔ | 1 → 4 | Ver §7 | Verificado |
| `/cotizar/confirmacion`, `/carrito` | Avisos con entrada corta | ✔ | ✔ | 1 → 1 | — | Verificado |
| Acceso (4) | Sin cambios | ✔ | ✔ | 6 → 6 | Ver §7 | Verificado sin regresión |
| Legales (6) y 404 | Sin cambios (LegalMotion) | ✔ | ✔ | 6–38 | — | Verificado sin regresión |
| Chatbot | Sin cambios | — | — | — | — | Cubierto por su e2e |

## 4. Arquitectura

```
src/shared/motion/
  motion.css        tokens --mo-*, variantes data-reveal, data-enter, data-results, avisos, .mo-progress
  motion-root.tsx   MotionRoot (montado una vez en app/layout.tsx): motor de revelado + NavProgress
```

- **Tokens** (`:root`): `--mo-ease` = `cubic-bezier(0.2, 0.7, 0.2, 1)` (la curva que el sitio ya usaba en casi todas
  partes), `--mo-ease-out` (expo), `--mo-ease-in-out`; duraciones 160 / 240 / 320 / 720 / 950 ms; recorrido 26 px
  vertical y 36 px lateral; cascada de 70 ms con tope en el 7.º elemento.
- **`data-reveal`** (`""`/`up`, `left`, `right`, `media`, `fade`, `stagger`): el motor marca `data-in="now"` lo que ya se
  ve (no se anima, no parpadea) y `data-in="late"` lo que entra después. Las animaciones usan `backwards`: al terminar no
  queda ningún `transform` pegado. `media` descubre la foto con `clip-path` y un leve acercamiento. En móvil, `left/right`
  suben (evita desbordes laterales).
- **Motor**: un solo IntersectionObserver para todo el documento con margen superior enorme (lo que quedó arriba tras un
  salto cuenta como visto) y un MutationObserver agrupado por fotograma (detecta lo que React pinta después: cambio de
  ruta, resultados). Sin JavaScript, sin IntersectionObserver o con `prefers-reduced-motion`, no arma nada y todo se ve.
- **`data-enter`**: entrada al pintar, sin JavaScript; se repite al llegar desde otra página, que es la "transición
  entre páginas" sin fundir a blanco. El `h1` arranca en opacidad 0,01 para no retrasar el LCP.
- **`data-results` + `data-filtered`**: cascada corta de las tarjetas que aparecen tras filtrar; las que permanecen no
  se reaniman.
- **NavProgress**: línea naranja de 2 px arriba solo si la página siguiente tarda > 140 ms; `pointer-events: none`,
  nunca bloquea; ignora anclas, archivos, pestañas nuevas y cambios solo de filtros; se cierra sola a los 12 s si la red
  falla. No usa `useSearchParams` (evita forzar render en cliente de las páginas estáticas).
- **Por qué no `ViewTransition`**: se probó y se quitó el 2026-10-16 (commit `09a8d7c`) porque fundía la página a
  blanco y el usuario lo vio como parpadeo. Este pase no la reintroduce.
- **Convivencia**: `main.lg` (legales, Contacto, Nosotros) sigue con `LegalMotion` y sus coreografías; el CSS común y el
  motor lo excluyen explícitamente. La mascota del chatbot conserva su prefijo `m-`; el sistema usa `mo-`.

Componentes modificados: `app/layout.tsx`, `_landing/{hero-carousel,components-carousel,sectors-band,home-sections}`,
`landing.css` (hero, cabecera, inicio), `industrias/_sector/sector-page`, `industrias/agricultura/{sections,agricultura.css}`,
`components/ui/reveal` (ahora de servidor), `screens/islands/{w02,w03,w04,w05,w06}`, `screens/{w07,w08,w09,w16,w17}`.
Eliminado: `shared/ui/use-reveal.ts` y dos copias locales del mismo hook. Balance en `src/`: 28 archivos, +609 / −338
líneas (el sistema nuevo, con sus comentarios, son 337 de las añadidas).

## 5. Dependencias

**No se agregó ninguna.** Evaluación:

| Opción | Costo | Decisión |
|---|---|---|
| Motion for React | `motion` ≈ 34 KB; `m` + `LazyMotion` 4,6 KB inicial + funciones diferidas (docs oficiales motion.dev) | No: todo lo necesario (entrada, cascada, máscaras, `@starting-style`, `display` discreto) lo resuelve CSS en el compositor; el LCP móvil ya está limitado por ~210 KB de JS del framework |
| GSAP | ~25 KB núcleo | No: no hay timelines que CSS no cubra |
| Lenis | ~4 KB, reemplaza el scroll nativo | No: altera el desplazamiento táctil y de teclado sin beneficio medible |
| React Bits / Magic UI / Motion Primitives | Componentes copiables sobre Motion | No: arrastran Motion y su estética (brillos, partículas) no encaja con un B2B industrial |
| Sistema propio (`src/shared/motion`) | **+1,3 KB JS, +1,1 KB CSS gzip por ruta (medido)** | Sí |

MCP verificados en esta sesión: Chrome DevTools (conectado), navegador integrado (conectado, panel oculto: capturas
poco fiables, por eso se verificó con Playwright headless), Context7 (documentación de Motion). **No hay MCP de Magic UI
ni de Playwright conectados**; el de Figma requiere autorización y el proyecto no tiene archivo de Figma. Para usarlos:
`npx @magicuidesign/cli@latest install <cliente>` (Magic UI, según su repositorio oficial) y `claude mcp add playwright npx @playwright/mcp@latest`
(Playwright); no se instalaron porque no hacían falta y modifican la configuración global.

## 6. Evidencia visual

Capturas en `docs/qa/motion/` (Playwright headless, build de producción):

- `hero-antes.jpg` / `hero-despues.jpg`: cambio de variante a 0 / 250 / 500 / 800 / 1400 ms. Antes, a los 250 ms se ven
  dos cuerpos translúcidos desalineados; después, el timón baja por el vástago y el cuerpo no se mueve.
- `menu-movil.jpg`: menú móvil a 80 / 200 / 450 ms de abrir (390 px).
- `inicio-movil-recorrido.jpg`: inicio en 390 px, cada tramo a 140 ms y a 1 s de llegar.
- `hero-firefox-webkit.jpg`: el mismo cambio de variante en Firefox (arriba) y WebKit (abajo).

## 7. Rendimiento

**Metodología.** Dos builds de producción locales servidos a la vez con `next start`: línea base = `HEAD` previo
(`9674c3c`, puerto 3301) y nuevo = árbol con este pase (puerto 3302), ambos con las variantes de imagen generadas.
Lighthouse 13 (`scripts/perf/lighthouse.mjs`, perfil móvil por defecto = 4G lento simulado y CPU ×4; escritorio =
preset desktop), **alternando base/nuevo ruta por ruta** y sin otros procesos pesados. Una corrida previa de la base
hecha mientras compilaba otra copia se descartó por contaminada. Peso: JS y CSS de cada ruta descargados y comprimidos
con gzip.

**Peso por ruta (gzip)**

| Ruta | JS base | JS nuevo | Δ JS | CSS base | CSS nuevo | Δ CSS |
|---|---|---|---|---|---|---|
| `/` | 215,7 KB | 217,2 KB | +1,51 KB | 26,3 KB | 27,5 KB | +1,14 KB |
| `/productos` | 211,8 KB | 213,2 KB | +1,36 KB | 30,4 KB | 31,6 KB | +1,14 KB |
| `/productos/tuberias` | 209,9 KB | 211,2 KB | +1,38 KB | 28,9 KB | 30,0 KB | +1,14 KB |
| `/industrias/saneamiento` | 215,7 KB | 216,6 KB | +0,95 KB | 31,3 KB | 32,4 KB | +1,04 KB |
| `/nosotros` | 225,0 KB | 226,3 KB | +1,26 KB | 38,5 KB | 39,7 KB | +1,14 KB |
| `/contacto` | 230,0 KB | 231,3 KB | +1,26 KB | 38,5 KB | 39,6 KB | +1,14 KB |
| `/cotizar` | 225,5 KB | 226,8 KB | +1,29 KB | 25,4 KB | 26,6 KB | +1,14 KB |
| `/terminos` | 223,0 KB | 224,2 KB | +1,26 KB | 34,8 KB | 35,9 KB | +1,14 KB |

**Lighthouse (rendimiento · LCP simulado · TBT · CLS)**

| Ruta | Móvil base | Móvil nuevo | Escritorio base | Escritorio nuevo |
|---|---|---|---|---|
| `/` | 83–84 · 4,59–4,61 s · 11–15 ms · 0 | 83 · 4,69–4,71 s · 7–16 ms · 0 | 99 · 1,03 s · 0 · 0 | 98 · 1,05 s · 0 · 0 |
| `/productos` | 86 · 4,21 s · 19 ms · 0 | 86 · 4,21 s · 17 ms · 0 | 100 · 0,80 s | 100 · 0,80 s |
| `/productos/tuberias` | 88 · 3,91 s · 17 ms | 88 · 3,99 s · 19 ms | 100 · 0,75 s | 100 · 0,75 s |
| Ficha garantía extendida | 84 · 4,56 s · 10 ms | 84 · 4,52 s · 19 ms | 99 · 0,83 s | 100 · 0,81 s |
| `/industrias/agricultura` | 86 · 4,21 s · 12–14 ms | 85–86 · 4,21–4,29 s · 6–12 ms | 98 · 1,13 s | 98 · 1,13 s |
| `/industrias/saneamiento` | 85–86 · 4,25–4,32 s · 13–17 ms | 84–85 · 4,31–4,60 s · 10–16 ms | 99 · 0,99 s | 99 · 0,99 s |
| `/industrias/mineria` | 86 · 4,21 s · 13 ms | 85 · 4,28 s · 13 ms | 99 · 0,83 s | 99 · 0,83 s |
| `/nosotros` | 88 · 3,86 s · 14 ms | 88 · 3,85 s · 10 ms | 100 · 0,73 s | 100 · 0,73 s |
| `/contacto` | 89 · 3,76 s · 13 ms | 89 · 3,76 s · 13 ms | 100 · 0,73 s | 100 · 0,73 s |
| `/cotizar` | 91 · 3,46 s · 16 ms | 91 · 3,46 s · 14 ms | 100 · 0,65 s | 100 · 0,65 s |
| `/login` | 90 · 3,69 s · 20 ms | 90 · 3,68 s · 13 ms | 100 · 0,73 s | 100 · 0,73 s |

CLS es 0,000 en todas las rutas antes y después; TBT queda igual o menor; el sistema no añade reflujos forzados
(auditoría `forced-reflow-insight` vacía).

**Lectura honesta.** El rendimiento no se degrada de forma significativa, pero el inicio móvil pierde ~95–110 ms de LCP
simulado (4 corridas de cada lado) y 1 punto (84 → 83). Causa medida: el elemento LCP es la misma foto del hero en ambos
builds y su LCP observado sin limitar es igual (~190 ms, con las mismas fases); lo que cambia es el CSS que bloquea el
render, ~1,2 KB gzip más, y el simulador de Lighthouse lo cuantiza en un tramo de red adicional. En una red real ese
kilobyte son unos pocos milisegundos. Sectores varían entre 0 y +70 ms entre corridas (dentro del ruido del simulador).
La meta de móvil ≥ 90 no se alcanzaba antes de este pase en la mayoría de rutas y sigue igual: ver §9.

**Fluidez.** Todo lo que se anima es `transform`, `opacity`, `clip-path` o la máscara de una sola imagen; nada anima
propiedades de layout (el subrayado del menú dejó de animar `left/right`). No hay listeners de scroll nuevos: solo un
IntersectionObserver y un MutationObserver agrupado por fotograma. El hero deja de rotar, de animar su fondo (Ken Burns)
y de flotar cuando no se ve o la pestaña está oculta.

## 8. QA

Todo contra builds de producción limpios (`git archive`/copia del árbol + `pnpm install --frozen-lockfile` +
`pnpm build`), sin credenciales reales y sin enviar formularios a producción (los formularios del sitio preparan
correo/WhatsApp; no hay backend conectado).

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` | 0 errores |
| `eslint src` + script + prueba nuevos | 0 errores (1 aviso previo en `access-frame.tsx`, ajeno a este cambio) |
| `vitest run` | 99 / 99 |
| `next build` | OK, 45 páginas generadas |
| Playwright, suite completa (468 pruebas, escritorio + Pixel 7) | **456 pasan, 12 omitidas, 0 fallos**. Las 12 omitidas son las de inicio de sesión con Google: requieren secretos que la copia limpia no tiene (`test.skip` del propio proyecto) |
| Nueva `tests/e2e/motion.spec.ts`, Chromium escritorio + Pixel 7 (40 casos) | 40 / 40 |
| La misma en Firefox, Safari (WebKit) y iPhone 13 (WebKit móvil), repetida 2 veces | 120 / 120 |
| Re-ejecución tras el último cambio: movimiento + layout + contenido + eliminar cuenta (Chromium) | 132 / 132 |
| `motion-audit.mjs`, 31 rutas × 11 anchos (341 casos) | 0 bloques invisibles, 0 desbordes horizontales, 0 errores de consola nuevos |
| Ídem con `prefers-reduced-motion: reduce` (31 rutas × 4 anchos) | 0 animaciones que desplacen o escalen |
| Móvil horizontal 844×390 y laptop 1366×600 (10 rutas) | Sin observaciones |
| Soporte de CSS por motor (Playwright: Chromium 156, Firefox 157, WebKit 27.2) | `@property`, `@starting-style` y `transition-behavior: allow-discrete` en los tres; `animation-timeline` (lo que usaba el inicio antes) **no existe en Firefox 157** |
| Capturas temporales del hero y del menú (Playwright) | Ver §6; el barrido interpola en Chromium, Firefox y WebKit (WebKit muestreado cada ~110 ms: `--lp-wipe` pasa de 0 % a 115 % de forma continua) |

Únicos avisos de la auditoría, ambos presentes también en la línea base y correctos: el campo trampa anti-spam de
`/cotizar` (fuera de pantalla a propósito, `aria-hidden`) y el 404 de la propia página `/ruta-inexistente`.

Defectos encontrados durante el pase y corregidos antes de cerrar:

1. **Contenido legal oculto** (regresión propia): la regla global ocultaba los `[data-reveal]` de `main.lg`, que usan
   `LegalMotion`. La auditoría lo detectó en Términos, Privacidad, Cookies, Mapa y Eliminar cuenta; se excluyó `main.lg`
   del CSS común y la prueba e2e ahora recorre esas páginas sin excepciones.
2. **Franja translúcida en el barrido del hero**: con dos máscaras complementarias se colaba ~25 % del fondo en la banda
   suave; la imagen saliente ahora es opaca dentro de esa banda (verificado fotograma a fotograma).
3. **Animación que no reiniciaba**: entrada y salida compartían nombre de keyframes y el navegador no la volvía a
   empezar al cambiar de clase; ahora son `lp-valve-wipe-in` / `-out`.
4. **Bloques saltados**: un salto de scroll que pasa por encima de un bloque sin cruzarlo no disparaba el observador;
   el margen superior del observador lo marca como visto.
5. **Bloques legales que podían quedar invisibles** (bug previo, encontrado al probar en WebKit): `LegalMotion` tenía el
   mismo defecto que el punto 4; un bloque saltado nunca recibía `is-in` (se vio en /eliminar-cuenta). Se le aplicó la
   misma corrección del margen superior.
6. **Pruebas en WebKit local**: el CSP del sitio incluye `upgrade-insecure-requests` y WebKit lo aplica también a
   `http://127.0.0.1`, así que en local no cargaba ningún JS (en ninguno de los dos builds; en producción hay HTTPS y no
   aplica). La prueba quita solo esa directiva cuando corre en WebKit contra un servidor local sin TLS. Además Safari no
   enfoca un botón al pulsarlo, por lo que la prueba de teclado del hero enfoca el control como lo haría Tab.
7. **Línea base inválida al principio**: la primera copia base se compiló sin `prebuild` (sin variantes de imagen) y
   daba 404 en las fotos del hero; se regeneró y se repitieron las mediciones.

Pendiente de verificación visual humana: el panel del navegador integrado estuvo oculto durante la sesión (sus capturas
salen en blanco y no avanza animaciones), por eso toda la verificación visual se hizo con Playwright headless; no hay
grabación de vídeo de las animaciones, solo fotogramas.

## 9. Pendientes

| Pendiente | Causa | Siguiente acción |
|---|---|---|
| Subir a `origin/main` y desplegar en Vercel | El encargo pedía no desplegar a producción sin autorización | Con el visto bueno: `git push origin main` y deploy desde un clon limpio (ver memoria de deploy) |
| Lighthouse móvil ≥ 90 en todas las rutas | Ya estaba por debajo antes de este pase (83–91) y no cambia con él; el LCP simulado en 4G lento (3,5–4,7 s) lo limita el JS del framework (~210 KB gzip por ruta) y las fotos del hero | Proyecto aparte de rendimiento: dividir el JS del cliente (cabecera y chatbot más diferidos), revisar el peso de las fotos LCP; no es de animación |
| Prueba en dispositivos físicos (Android de gama baja, iPhone) | Solo se emuló (Chromium + Pixel 7, Firefox, WebKit e iPhone 13 vía Playwright, ver §8) | Revisar en un teléfono real el barrido del hero y el menú |
| Grabación en vídeo de las animaciones | El panel del navegador integrado estuvo oculto; se usaron fotogramas | Grabar con `page.video` de Playwright si se quiere material para el cliente |
| Unificar `LegalMotion` en el motor común | Sus coreografías (cortina de Contacto, línea de tiempo de Nosotros) dependen de sus clases `.lg-reveal/.is-in`; migrarlas no aporta a la persona y arriesga regresiones | Hacerlo solo si se rediseñan esas páginas |
| MCP de Magic UI / Playwright | No estaban conectados; no hicieron falta | Instalar solo si se van a usar (comandos en §5) |
