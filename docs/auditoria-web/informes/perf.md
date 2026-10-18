# Informe de rendimiento móvil — FUNDIGSAC (2026-10-17)

Agente: performance-engineer (solo lectura; no se tocó el repo). Rol: `.claude/agents/performance-engineer.md` + `.claude/contexto-agentes.md`.

## Fuentes de datos y método

- **Línea base (laboratorio):** Lighthouse 13.5, `.perf/2026-10-17-22-23/`, producción = HEAD. Una sola pasada por ruta (sin mediana). Móvil con
  throttling **simulado** (Lantern): RTT 150 ms, 1,6 Mbps, CPU 4x, 412×823 @1,75x.
- **Build local analizado (no regenerado):** `.next` BUILD_ID `EyiW50KvtX4jPN5AmXGI3` (17-oct 15:28, posterior al último commit).
  Los hashes no coinciden con producción, pero los tamaños sí (p. ej. `0t-g9adn1u413.js` = 163 943 B = prod `26rgmgy9gz4gw.js`).
- **Medición propia, puntual y sin Lighthouse:** A/B en Chrome 155 headless (Playwright, canal `chrome` del sistema), contra producción, **solo
  en la ficha y en la portada**. Variantes intercaladas, n=3 por variante, throttling DevTools (CPU 4x, 1,6 Mbps, RTT 150 ms). Total: 51 cargas.
  Load average ≈ 4 por otros agentes: los valores absolutos tienen ruido, pero las diferencias se repiten en las 3 tandas.
  Scripts: `perf/scripts/lcp-ab*.mjs`. Salidas: `perf/ab/*.txt`.
- **Todo esto es laboratorio.** No hay datos de campo: no está instalado Speed Insights ni se reportan Web Vitals, y el sitio es noindex (sin CrUX).
- La documentación de Next 16 se contrastó en `node_modules/next/dist/docs/` y en Context7 (`/vercel/next.js/v16.2.9`): ambas dicen lo mismo.

## 0. Clave para priorizar: qué mueve el LCP simulado

- Lantern calcula el LCP como 50 % grafo optimista + 50 % pesimista. Los dos grafos se recortan en el **LCP observado** (traza sin throttling) e
  incluyen toda petición que terminó antes de ese instante.
- Lantern reparte el ancho de banda **a partes iguales** entre las peticiones en vuelo e ignora la prioridad. En el grafo optimista y en el
  cálculo final excluye las imágenes Low/VeryLow.
- Resultado práctico: LCP simulado ≈ (KB terminados antes del LCP observado) / ~200 KB/s + latencias.
- Verificado en el Lighthouse instalado: `node_modules/.pnpm/@paulirish+trace_engine@0.0.65/.../lantern/metrics/LargestContentfulPaint.js`
  (`isNotLowPriorityImageNode`, coeficientes 0,5/0,5) y `simulation/Simulator.js:216-223` (`throughput / inFlight`).

| Ruta | KB terminados ≤ LCP obs. | LCP simulado |
|---|---|---|
| / | 811 | 3463 ms |
| ficha (+ cadena de fuente griega) | 537 | 3554 ms |
| /industrias/agricultura | 347 | 2806 ms |
| /productos | 354 | 2648 ms |
| /cotizar | 321 | 2571 ms |
| /nosotros, /contacto | 263 | ~2275 ms |
| /productos/valvulas | 239 | 2125 ms |
| /industrias (LCP de texto) | 127 | 1752 ms |

- **Piso común:** fuentes 75 KB + CSS 30–45 KB + JS de framework (84–186 KB, según termine antes o después del LCP).
- Por encima del piso, lo que sube el LCP son **imágenes no-LCP pedidas en la ventana crítica**.
- El throttling DevTools (más parecido al campo) da lo mismo: la imagen LCP de la ficha tarda ~2,9 s en descargar 52 KB porque comparte 1,6 Mbps
  con todo lo demás. Por eso `fetchPriority` ayuda poco en laboratorio: tanto Lantern como DevTools reparten por igual. En una red real con
  prioridades HTTP/2 debería ayudar más, pero eso no se ha medido.

## 1. Tabla por ruta (móvil)

Subpartes = TTFB / retraso de carga / duración de carga / retraso de render, en ms, medidas sobre la traza observada.

| Ruta | Perf | LCP sim. (obs.) | Elemento LCP | Subpartes (obs.) | Principal culpable |
|---|---|---|---|---|---|
| /productos/valvulas/valvula-compuerta-fundigsac | 90 | 3554 (1139) | `img` del escenario, `f-07-w768.webp` 52 KB. Precarga **Low** sin fetchpriority. | 84 / 437 / 211 / 408 | 5 miniaturas `w384` (139 KB) en **High** para 64–66 px. La precarga Low esperó 107 ms en cola. Fuente Inter **griega** (19 KB, VeryHigh) por «Φd»: cadena crítica de 1097 ms. |
| / | 91 | 3463 (780) | `img.lp-hero__photo`, `hero-planta-w768` 62 KB, precarga High | 279 / 16 / 338 / 146 | 2.ª diapositiva eager (92 KB). 4 tarjetas eager (107 KB). Sectores dentro del umbral lazy (163 KB). Válvula 1 precargada en **High** (73 KB) compitiendo con la foto LCP. |
| /industrias/agricultura | 96 | 2806 (772) | `img.ag-hero__photo`, `hero-poster-v2-w768` 63,5 KB, High | 88 / 367 / 281 / 36 | Piso de JS 158 + fuentes 74 + CSS 33 KB. Además, 4 tarjetas eager con `sizes` 90vw (`w768`, 144 KB para 179 px). |
| /productos | 96 | 2648 (893) | `section` hero (fondo CSS `productos1-1200.webp` 62 KB, preload high) | 85 / 433 / 335 / 39 | 5 categorías con `sizes` 85vw (`w640`, 191 KB; 2 suben a High). Fondos decorativos `w1200` (138 KB). Ruta dinámica (ƒ). |
| /cotizar | 97 | 2571 (901) | `img` Stitch `915091dd8b-limpia-w768` 24 KB, `preload` sin fetchpriority | 86 / 276 / 519 / 19 | La imagen termina después de todo el JS, así que Lantern cuenta 171 KB de JS. Ruta dinámica. |
| /nosotros | 98 | 2276 (411) | `img.lg-hero__photo` `hero-w768` | 89 / 18 / 263 / 42 | Piso base |
| /contacto | 98 | 2275 (572) | `img.lg-hero__photo` `sede-w768` | 86 / 177 / 280 / 29 | Piso base (ruta dinámica) |
| /productos/valvulas | 99 | 2125 (698) | `img.vVOFvq_heroPhoto` `hero-valvula-w768` | 86 / 329 / 258 / 25 | Piso base |
| /industrias | 99 | 1752 (630) | `p.x-hero-lead` (texto) | 85 / – / – / 545 | CSS + fuentes |

### Auditorías comunes a todas las rutas

- **render-blocking-insight:** 3 CSS globales (≈23 KB br: `@font-face` 4,7 + chrome `landing.css` 7,8 + Tailwind 10,2) más 1 CSS de página
  (0,8–7,3 KB). Ahorro estimado por LH: 220–270 ms de FCP.
- **network-dependency-tree:** cadena más larga documento → CSS (390–630 ms), salvo la ficha: documento → CSS → woff2 griego = 1097 ms.
- **unused-javascript:** el chunk de react-dom (~26 KB «sin usar», normal) y `0a_e6799pdvtc.js` (22 KB, 99,7 % sin usar). Este segundo es el
  JS de `/cookies`, descargado por el prefetch del enlace del banner de cookies y del pie.
- **legacy-javascript:** 14 KB estimados en el chunk de react-dom. Son los polyfills integrados de Next (`at`, `flat`, `flatMap`,
  `fromEntries`, `hasOwn`, `trimStart`/`trimEnd`). No es accionable.
- **Resto:** CLS 0 y TBT ≤ 9 ms en todas las rutas. La caché de estáticos es correcta.
- **Ojo con la medición:** la pasada móvil fue la primera petición de cada ruta. El documento tardó en completarse 400–520 ms en móvil frente a
  90–100 ms en escritorio (efecto de caché fría del CDN), y eso infla el LCP observado. Para verificar cambios: petición de calentamiento por ruta
  más 3 pasadas y mediana.

## 2. Qué compite con el LCP en la ventana crítica

- **Fuentes:** 2 woff2 precargados en High (Inter latin 47,6 KB y Plus Jakarta Sans latin 26,9 KB), pedidos a la vez que el CSS.
  En la ficha se suma Inter griega (19 KB, VeryHigh, sin precarga y descubierta desde el CSS).
- **CSS por página:** 4 hojas bloqueantes. El 46 % de `landing.css` (global, ~3,5–4 KB br) son reglas de la portada (`lp-hero`,
  `lp-components`, `lp-sectors`, `lp-backing`, `lp-docs`…) que se cargan en todas las rutas.
- **Imágenes no-LCP en High:**
  - Portada: válvula 1 precargada en High (73 KB).
  - Ficha: miniaturas, que el navegador sube a High por estar en el viewport (139 KB).
  - /productos: `productos2`/`productos3` (49 KB).
- **2.ª diapositiva del hero:** `compuerta-con-timon-v4` (92 KB) en `loading="eager"`, pedida durante el parseo aunque no se ve hasta 4,2 s después.
- **Eager bajo el pliegue:**
  - Portada: tarjetas del carrusel con índice < 4 (107 KB).
  - Agricultura: 4 tarjetas de línea (144 KB `w768`).
- **Lazy dentro del umbral:** el umbral es 1250 px en 4G y 2500 px en redes lentas, así que estas imágenes se piden igual en el primer layout:
  - Sectores de la portada (163 KB).
  - `home-ref-infrastructure` en la ficha (54 KB).
  - Categorías de /productos (191 KB).
  - Plano, catálogo y CTA de agricultura (115 KB).
- **Fondos CSS:** /productos usa `home-ref-blueprint-w1200` (67,5 KB) y `productos7-1600-w1200` (70,7 KB) en móvil. Se piden en cuanto se
  calcula el estilo, no en modo lazy.
- **Prefetch de enlaces visibles** (`/`, `/login`, `/registro`, `/productos`, `/cookies`, `/soluciones`…): RSC ×2 por ruta (~20 KB), su JS
  (~70 KB) y sus CSS como **preload VeryHigh** (~23 KB). En todas las pasadas de LH empezó después del LCP (en la hidratación); en campo,
  con LCP tardío, se solapa.
- **`/api/auth/session`:** fetch High en cada vista; es una invocación de función. Terminó después del LCP en laboratorio.

## 3. Fuentes

- **Se precargan 2 woff2.** Ambos se usan en el primer pantallazo de todas las rutas:
  - Jakarta: `--lp-font` en `.lp`, cabecera y pie, más los títulos de la ficha.
  - Inter: los tokens Tailwind `--font-body-default: Inter…` y el cuerpo de la ficha, `home.css`, `contact.css` y `legal.css`.
  - Hay que mantener las dos precargas.
- **Los «3 pesos + 5 pesos» no generan archivos extra.** Las dos familias son variables. next/font genera **11 woff2** (Inter 7 subconjuntos,
  Jakarta 4) y **41 reglas `@font-face`** (7×3 + 4×5) que apuntan al mismo archivo por subconjunto. Solo se precarga `latin`.
- **Uso real de pesos (grep en `src/**/*.css` y clases en TSX):**
  - `font-weight`: 700 ×121, 600 ×104, 800 ×49, 500 ×36, 400 ×6, 300 ×2.
  - Valores intermedios 620/640/650/660/680: ×18.
  - Shorthand `font:`: 800 ×11, 700 ×24, 600 ×13, 500 ×2, 400 ×2.
  - Tailwind: `font-semibold` ×417, `font-bold` ×177, `font-medium` ×20.
  - **Conclusión:** se usan los 5 pesos de Jakarta, así que no se propone recorte. Además no ahorraría bytes de fuente (mismo woff2); solo unos
    ~1,4 KB de CSS por peso.
  - Nota de fidelidad, no de rendimiento: 620–680 y 300 no tienen cara declarada, así que se pintan con la más cercana (600, 700 o 400).
    `weight: "variable"` en Jakarta los mostraría tal cual con el mismo woff2, pero cambia el aspecto visual. Es decisión de diseño.
- **CLS en campo (P2):** los tokens Tailwind usan `Inter, sans-serif` y no `var(--font-inter)`. Eso salta el fallback métrico que genera
  next/font («Inter Fallback», `size-adjust` 107,12 %). En laboratorio el CLS es 0 porque la fuente llega antes de pintar.

## 4. JS de cliente (primer load)

- **Portada, producción:** 184 KB transferidos en 13 chunks.
  - Framework ≈ 148 KB: react-dom + polyfills 72,2; router 45,9; react 9,3; next/image + link 9,8; runtime 4,3 + 2,3 + 3,9.
  - Layout de la app: `416hzhii73f3j.js`, 20,3 KB (local `152q7guf5wh_b.js`).
  - error/not-found: 3,3 KB.
  - Página de inicio: 12,7 KB.
- **Composición del chunk del layout** (60 975 B en bruto / 16,9 KB br):

  | Módulo | Tamaño en bruto | Comentario |
  |---|---|---|
  | `assistant-copy` | 16,3 KB (~5 KB br) | Incluye `SUGGESTIONS` por ruta y textos del panel. El panel ya es lazy; el lanzador solo usa 5 textos. |
  | `landing-chrome` + iconos | ~14 KB | |
  | `cookie-banner` + consentimiento | 7,9 + 2 KB | |
  | `home-copy` | 5,8 KB | Textos de la portada arrastrados por el chrome |
  | `landing-prefs` | 3,2 KB | |
  | Lanzador del asistente | 2,5 KB | |
  | `cart-store` | 2 KB | |
  | Toast | 1,2 KB | |
  | `LazyWarmup` | 0,7 KB | |
  | `SourceGuard` | 0,6 KB | |
  | Sesión (auth) | 0,6 KB | |

- **Componentes globales del layout:**
  - `AssistantLauncher`: el panel ya va en `lazy()` con precarga al hover/focus. Sobra la copia completa (dividirla).
  - `CartHost`: el cajón ya es lazy. Correcto.
  - `CookieBanner`: solo se muestra tras hidratar + rAF y sin consentimiento previo. Se puede montar su UI con `lazy()` detrás de un gate
    mínimo (−~3 KB br de JS y ~1,5 KB br de CSS bloqueante).
  - `LazyWarmup`, `SourceGuard` y `ToastProvider`: diminutos. `next/dynamic` añadiría una petición sin ganancia.
  - `LandingHeader`/`LandingFooter`: necesarios en SSR.
- **Ficha:** su JS de página es 22,7 KB br, porque la ruta `[categoria]/[producto]` importa estáticamente las 6 pantallas (`SCREENS`), el
  catálogo `cart-products` (19 KB en bruto) y las 3 fichas técnicas (12,6 KB en bruto).
- **Agricultura:** `HeroMotion` (WebGL) va en el primer load.
- **Ahorro realista en el layout:** −9 a −10 KB br en todas las rutas, que equivale a unos −45/−50 ms de LCP en Lantern (el JS entra en ambos grafos).

## 5. Build (`.next`, sin regenerar)

- 66 chunks JS.
- El mayor es `2vu9-4a5ponr-.js`: 1 091 519 B en bruto / 305 KB gz / 249 KB br, con three + GLTFLoader + DRACOLoader + model-viewer.
  **No aparece en `entryJSFiles` de ninguna ruta** (comprobado en /, ruta de ficha, visor-3d, /productos, /cotizar, agricultura y válvulas)
  y no se pidió en ninguna pasada de LH. Solo se carga con `next/dynamic` (`ssr:false`) al pulsar «Ver en 3D». ✔
- `0cz1d0mv5g_q7.js` (112 KB) es el polyfill `nomodule`: los navegadores modernos no lo descargan.
- Primer load local (br):

  | Parte | KB br |
  |---|---|
  | Raíz framework | 112,9 |
  | Layout | 30,9 |
  | Página: portada | 10,8 |
  | Página: ficha | 22,7 |
  | Página: /productos | 5,8 |
  | Página: agricultura | 13,8 |
  | Página: /cotizar | 1,8 |
  | Página: válvulas | 11,5 |

- Producción sirve el JS con tamaños de nivel gzip (72,2 KB frente a 61,5 KB en br-11). Lo comprime el CDN; no se controla desde la app.

## 6. Imágenes y `sizes` (5 rutas peores)

Columnas: bucket servido (DPR 1,75), tamaño pintado, `sizes` actual, `sizes` propuesto y efecto.

### Ficha

- **Escenario LCP, `f-07`:**
  - Se sirve `w768` (51,8 KB). Se pinta a 256×320 (`contain` + padding 6/12/9 % dentro de una caja de 376).
  - `sizes` actual: `(min-width: 1024px) 640px, 100vw`.
  - Propuesto: `(min-width: 1025px) 400px, 64vw`.
  - Efecto: `w640` (42,1 KB, −10 KB). En iPhone DPR3 baja de `w1200` a `w768` (−19 KB). En escritorio no cambia.
- **Miniaturas ×5:**
  - Se sirve `w384` (23–35 KB c/u, 139 KB). Se pintan a 64–66 px en móvil y 78 px en escritorio.
  - `sizes` actual: `96px`. Propuesto: `(max-width: 760px) 66px, 78px` + **bucket nuevo 256**.
  - Efecto: `w256`, unos 64–77 KB en total (−60 a −75 KB). Un bucket de 192 solo ayudaría con DPR < 2.
- **Foto de descripción:** `w768` (54 KB) a 376 px. El `sizes` es correcto; es lazy pero cae dentro del umbral.

### Portada

- **Hero:** `w768`, `100vw` full-bleed con `cover` sobre 421×1144. Correcto (incluso queda corto); no tocar.
- **Válvulas:** `w640` (archivo de 578 px, 73/92 KB) a 282 px con `sizes` 78vw. No hay bucket intermedio, así que cambiar `sizes` no ahorra nada.
- **Tarjetas:** `w640` a 320 px con `min(78vw,320px)`. Correcto.
- **Sectores:** `w640` a 330 px con `sizes` 80vw. Correcto.

### Agricultura

- **Tarjetas de línea ×4:**
  - Se sirve `w768` (144 KB). Se pintan a 179 px en 2 columnas (`agricultura.css` → `@media (max-width:560px)`).
  - `sizes` actual: `(max-width: 640px) 90vw, (max-width: 1100px) 45vw, 280px`.
  - Propuesto: `(max-width: 340px) 90vw, (max-width: 1100px) 45vw, 280px`.
  - Efecto: `w384` (59 KB, **−85 KB**). En DPR3 baja de `w1200` a `w640`.
- **Hero, destacada y CTA:** `100vw` en elementos de ancho completo. Correcto.
- **Plano y catálogo:** `70vw` frente a ~58vw pintado. Con DPR 1,75 no cambia el bucket.

### /productos

- **Hero:** fondo CSS con el original de 1200 px. Con `cover` en 412×782 escala por altura, así que **no reducir**.
- **Categorías ×5:**
  - Se sirve `w640` (191 KB) a 182 px.
  - `sizes` actual: `(min-width: 1200px) 18vw, (min-width: 680px) 34vw, 85vw`.
  - Propuesto: `(min-width: 1181px) 18vw, (min-width: 641px) 32vw, 46vw`.
  - Efecto: `w384` (85 KB, **−106 KB**). En DPR3 baja de `w1200` a `w640`.
- **Sprites de producto:** `46vw`. Correcto.
- **Fondos decorativos `w1200` en móvil:**
  - `.resourcesBackdrop` (opacidad .33 + velo) y `.supportInner` (franja de 84 px con velo del 78–97 %).
  - Propuesto: `@media (max-width: 860px)` con `-w640` (28,8 / 29,6 KB). Efecto: **−80 KB**.

### /cotizar

- `w768` (24 KB) a 378×212. Correcto; `calc(100vw - 34px)` daría el mismo bucket.

## 7. `priority` / `preload` / `fetchPriority` / `loading` en Next 16

### Qué dicen el código y la documentación

- `get-img-props.js:236`: `isLazy = !priority && !preload && loading ∈ {lazy, undefined}`.
- `get-img-props.js:480`: `meta.preload = preload || priority`.
- `get-img-props.js:306–313`: errores con `priority`+`lazy`, `preload`+`lazy` y `preload`+`priority`.
- `image-component.js:217–233`: `ImagePreload` llama a `ReactDOM.preload(src, {as:'image', imageSrcSet, imageSizes, fetchPriority})`, es decir,
  **reenvía `fetchPriority`** a la precarga.
- `image.md:266–295`:
  - `priority` está obsoleto en favor de `preload`.
  - «When not to use [preload]: … when the `loading` or `fetchPriority` property is used. In most cases, you should use `loading="eager"`
    or `fetchPriority="high"` instead of `preload`».
  - Para carruseles: no precargar todas las imágenes.
- Comprobado en la línea base: la precarga sin `fetchpriority` sale **Low** y espera en el modo restringido de Chrome.
  - Ficha: descubierta a 521 ms, pedida a 628 ms; `lcp-discovery-insight` marca `priorityHinted=false`.
  - /cotizar: igual con `preload` sin `fetchPriority`.

### Combinación recomendada por caso

**a) Imagen LCP presente en el HTML SSR**

- Aplica a: escenario W06, galerías w07/w08/w09, imagen del visor w23, 404, escena activa del login, `/cotizar`, y los heroes de la portada,
  agricultura, legal (contacto/nosotros) y válvulas.
- Usar **`loading="eager"` + `fetchPriority="high"` y quitar `priority`/`preload`**.
- El diff en curso (`priority` + `fetchPriority="high"`) es correcto en red: produce `<link rel=preload fetchpriority=high>` y
  `<img fetchpriority=high>`. Pero usa la prop obsoleta y va contra la guía de la documentación.
- Si se quiere conservar la precarga: `preload` (no `priority`) + `fetchPriority="high"`.

**b) LCP en un fondo CSS (hero de /productos)**

- El `<link rel="preload" as="image" media=… fetchPriority="high">` manual es lo correcto. ✔

**c) Imagen visible en el primer pantallazo pero que no es LCP**

- Logo de la cabecera (`landing-chrome.tsx:120`) y logo del login (`access-frame.tsx:154`): `loading="eager"` sin precarga.
- Miniaturas de la ficha: lazy por defecto + `fetchPriority="low"`. ✔ diff: evita que suban a High.
- Válvula 1 de la portada: quitar `priority` y `fetchPriority="high"`, porque compite con la foto LCP. Ganancia no medible con
  throttling simulado; aplicar con verificación visual.

**d) Diapositivas o escenas ocultas**

- Aplica a: 2.ª diapositiva de la portada y escena inactiva del login.
- No montar el `<Image>` hasta `load` o hasta que se vaya a mostrar. `lazy` no sirve porque están dentro del viewport.

**e) Imágenes de modales que se abren a demanda**

- Ficha `:564` (página del documento): `loading="eager"` en vez de `priority`.

## 8. Hallazgos

Formato común: ID | Prioridad | Tipo | Ruta(s) | Archivo:línea | Problema | Causa | Corrección propuesta | Evidencia / ganancia / verificación.

| ID | P | Tipo | Ruta | Archivo:línea | Problema medido | Corrección propuesta | Ganancia esperada | Cómo verificar |
|---|---|---|---|---|---|---|---|---|
| PF-01 | P1 | perf | ficha | `w06-ficha.tsx:252`; `image-loader.ts:3`; `build-image-variants.mjs:16,18` | 5 miniaturas `w384` (139 KB) para 66/78 px; en HEAD suben a High por estar en el viewport. A/B DevTools: bloquearlas baja el LCP de 3252 a **2572 ms (−680 ms)**. | `sizes="(max-width: 760px) 66px, 78px"` + mantener `fetchPriority="low"`. Añadir **256** a `BUCKETS` en el loader **y** en el script, y actualizar la regex `VARIANT` a `/-w(256\|384\|640\|768\|1200\|1920)\.webp$/` (si no, los `-w256` se tratarían como originales). Opcional: montar las miniaturas tras `onLoad` del escenario. | −60/−75 KB ≈ −0,3 s LCP con throttling; hasta −0,68 s si se difieren. Lantern: ≈ −0,3 s (salen del grafo optimista). | LH ficha ×3 (mediana): miniaturas `-w256`, prioridad Low. `perf/scripts/lcp-ab-compete.mjs`. |
| PF-02 | P1 | perf | ficha | `w06-ficha.tsx:197-208,237` | Precarga LCP en Low, en cola 107 ms; `priorityHinted=false`. A/B: −60 ms con `fetchpriority` alto en el LCP y bajo en miniaturas. | En `photo()`: `loading={lcp?"eager":undefined}` + `fetchPriority={lcp?"high":undefined}`, sin `priority`. `sizes` del escenario: `"(min-width: 1025px) 400px, 64vw"`. | −60 ms en laboratorio (mayor en red con prioridades HTTP/2); −10 KB en LH; −19 KB en DPR3. | `lcp-discovery-insight` en verde; petición `f-07-w640` en High. |
| PF-03 | P1 | perf | ficha (+ mariposa) | `w06-ficha-data.ts:193-194`; `w07-configurator.tsx:65` | «Φd» (U+03A6) dispara la descarga de Inter griega (19 KB, VeryHigh); cadena crítica de 1097 ms. A/B: −72 ms. | `"n × Φd"` → `"n × Ød"` (U+00D8, dentro de `latin`). En mariposa, `ΔP` → «presión diferencial» o «P dif.». | −19 KB y −1 eslabón crítico; ≈ −70 ms. | Sin `5476f68d60460930-*.woff2` en la red; `network-dependency-tree` ≤ 640 ms. |
| PF-04 | P1 | perf | / | `hero-carousel.tsx:101-116`; `components-carousel.tsx:107` | 2.ª diapositiva eager (92 KB) + 4 tarjetas eager (107 KB) pedidas durante el parseo. A/B DevTools: **LCP 3820 → 3292 ms (−528)** y FCP −216 ms. Cota con tarjetas y sectores fuera: −1220 ms. | Montar `VARIANTS[1]` solo cuando `armed` (tras `window.load`) o `index===1`, y rotar solo si ya cargó (`onLoad`). Quitar `loading={i<4?"eager":"lazy"}` (dejar lazy; `LazyWarmup` los calienta). | −0,5 s con throttling; Lantern ≈ −0,3 s. | LH portada ×3; `perf/scripts/lcp-ab-home2.mjs`. |
| PF-05 | P1 | perf | agricultura | `sections.tsx:133` | 4 tarjetas eager con `sizes` 90vw → `w768` (144 KB) para 179 px. | Quitar `loading="eager"` y usar `sizes="(max-width: 340px) 90vw, (max-width: 1100px) 45vw, 280px"`. | −85 KB (`w384`) y salen del parseo. En LH ≈0 (terminaron tras el LCP); en campo, similar a PF-04. | `image-delivery-insight` sin estas tarjetas. |
| PF-06 | P1 | perf | /productos | `w02-catalog.tsx:77` | Categorías con `sizes` 85vw → `w640` (191 KB, 2 en High) para 182 px. | `sizes="(min-width: 1181px) 18vw, (min-width: 641px) 32vw, 46vw"`. | −106 KB. | `image-delivery-insight`: ahorro de 214 KB → <100 KB. |
| PF-07 | P2 | perf | /productos (+w03/w04/w05) | `w02-catalog.module.css:628,781` (oscuro `:1432,1454`) | Fondos `w1200` (138 KB) bajo velos del 33–97 % en móvil. | `@media (max-width:860px)` con `-w640` en `.resourcesBackdrop` y `.supportInner`. | −80 KB. | Red móvil. |
| PF-08 | P2 | perf | /cotizar | `w16.tsx:38` | LCP con `preload` sin `fetchPriority`. | `loading="eager" fetchPriority="high"` (sin `preload`). | 0–0,4 s en Lantern (carrera con el JS). | `priorityHinted=true`. |
| PF-09 | P2 | perf | / | `hero-carousel.tsx:110-112` | Dos precargas High (foto 62 KB + válvula 73 KB). | Válvula 1: sin `priority` y sin `fetchPriority="high"`. | No medible con throttling simulado; en campo libera ancho de banda para la foto LCP. | LH + revisión visual. |
| PF-10 | P2 | perf | todas | `assistant-launcher.tsx:6`; `assistant-copy.ts`; `cookie-banner.tsx`; `home-copy.ts` | Chunk del layout de 16,9 KB br con 16 KB en bruto de copy del asistente, UI de cookies y copy de la portada. | Mover los textos del lanzador a `assistant-launcher-copy.ts`; banner con `lazy()` tras un gate (como `CartHost`); separar textos del chrome y de la portada. | −9/−10 KB br de JS + ~1,5 KB br de CSS ≈ −50 ms Lantern en todas. | Tamaño de `entryJSFiles` del layout. |
| PF-11 | P2 | perf | todas | `landing-chrome.tsx:263,266,336,339,396`; `cookie-banner.tsx:141,182` | Prefetch de `/login`, `/registro` y `/cookies`: RSC + JS (22 KB al 99,7 % sin usar) + CSS en preload VeryHigh en cada primera visita. | `prefetch={false}` en esos `<Link>`. | −~100 KB tras la carga; sin cambio de LCP en laboratorio. | Red: sin `?_rsc` de esas rutas. |
| PF-12 | P2 | perf/coste | todas | `use-auth.ts:22-37` | `/api/auth/session` en High en cada vista (función serverless). | Lanzar `load()` en `requestIdleCallback`, o solo si existe una cookie indicador no-httpOnly. | Menos invocaciones; libera la ventana crítica en campo. | Red. |
| PF-13 | P2 | perf | ficha | `w06-ficha.module.css:861-862` | Entrada desde opacidad 0 en `.stage` e `img`. A/B sin throttling: LCP−fin de imagen 132 ms frente a 32 ms sin animación. El truco `.01` **no** lo corrige (122 ms); con throttling da ≈0. | Quitar la animación de `.stage img` (dejar solo `transform` en `.stage`), o aceptarlo. | −70/−100 ms solo en redes rápidas; adelanta el corte de Lantern. | `perf/scripts/lcp-ab.mjs`. |
| PF-14 | P2 | CLS | todas | `globals.css:207-215` | Tokens `Inter, sans-serif` sin fallback métrico. | `var(--font-inter), sans-serif`. | Robustez de CLS en campo (laboratorio = 0). | Captura con fuentes bloqueadas. |
| PF-15 | P2 | perf | 8 rutas no-home | `landing.css` (global vía `landing-chrome.tsx:15`) | ~46 % del CSS global es de la portada. | Mover las reglas exclusivas de la portada a `home.css`. | −3,5/−4 KB br de CSS bloqueante (~−20 ms). | Tamaño de `entryCSSFiles`. |
| PF-16 | P2 | perf | /productos, /cotizar, /contacto | `page.tsx` de las tres rutas (`searchParams`) | Rutas ƒ: documento en 238–518 ms frente a ~92–105 ms de las estáticas (escritorio, caché caliente). | Leer los filtros en cliente (`useSearchParams` + `Suspense`) o PPR; medir CLS. | −150/−400 ms de TTFB en campo y menos funciones. | `x-vercel-cache` / LH. |
| PF-17 | P2 | perf | agricultura | `sections.tsx:9,60` | `HeroMotion` (WebGL) en el primer load; chunk de página de 13,8 KB br. | `next/dynamic(..., { ssr:false })` en un wrapper cliente. | ≈ −6/−8 KB br (estimado). | `entryJSFiles`. |
| PF-18 | P2 | perf | fichas | `productos/[categoria]/[producto]/page.tsx:4-9,16-23` | Cada ficha carga las islas de las 6 pantallas + catálogo + 3 fichas técnicas (22,7 KB br). | `import()` por slug dentro del componente servidor; medir antes. | −5/−8 KB br (estimado). | `entryJSFiles`. |
| PF-19 | P2 | medición | — | `scripts/perf/lighthouse.mjs` | Una pasada por ruta, con la primera petición en frío (documento en 400–520 ms en móvil). | Calentamiento + 3 pasadas + mediana; añadir RUM (Speed Insights o `useReportWebVitals`) para tener campo. | Fiabilidad. | — |

## 9. Lo que NO conviene tocar

- **Fuentes:** no recortar pesos (se usan los 5 de Jakarta y el woff2 es el mismo). Mantener las 2 precargas, `display: swap` y las dos familias.
- **`experimental.inlineCss`:** la propia documentación indica que duplica el CSS (en `<style>` y en el payload RSC) y pierde la caché entre
  páginas; con ~25–30 KB br por página no compensa.
- **JS de framework y polyfills de Next:** react-dom + router suman ~113 KB br; `legacy-javascript` no es accionable.
- **three/model-viewer:** ya están fuera del primer load.
- **`sizes="100vw"` en heroes de ancho completo** (portada, agricultura, legal, válvulas): correcto. El hero de /productos ya escala por altura; no reducirlo.
- **Calidad de las fotos LCP:** LH sugiere recomprimir entre 44 y 52 KB, pero no se recomienda; solo se pueden aligerar decorativos con velo (PF-07).
- **`LazyWarmup`:** correcto (actúa tras `load` + idle y respeta `saveData`/2g). No convertir más imágenes a eager.
- **`content-visibility` para diferir imágenes:** probado en `.lp-sectors` (A/B): no evitó sus descargas. No usarlo con ese fin.
- **El truco de opacidad `.01` en el LCP de la ficha:** no mejoró nada en el A/B.
- **`CartHost` y el panel del asistente:** ya son lazy. `ToastProvider`, `SourceGuard` y `LazyWarmup` son demasiado pequeños para dividirlos.
- **TBT/INP y CLS:** sin problemas en laboratorio (TBT ≤ 9 ms, CLS 0).

## 10. Verificación

1. Calentar cada ruta con una petición previa.
2. Ejecutar `node scripts/perf/lighthouse.mjs --routes <ruta> --only mobile` ×3 cuando no haya otros agentes, y tomar la mediana.
3. Comprobar en el JSON:
   - `lcp-discovery-insight.priorityHinted`.
   - `network-requests`: prioridad y bucket de miniaturas, tarjetas y categorías; ausencia del woff2 griego y de `con-timon` antes del LCP.
   - `image-delivery-insight`.
4. Repetir los A/B de `perf/scripts/` contra la preview (`lcp-ab.mjs` acepta la URL como argumento; los demás la tienen fija y hay que editarla).
5. En campo: instalar RUM y vigilar el p75 de LCP por ruta.

## Anexo A — A/B (medianas, n=3)

Throttling DevTools: CPU 4x, 1,6 Mbps, RTT 150 ms. Ruta: ficha salvo que se indique portada.

| Escenario | FCP | LCP | Fin de la imagen LCP |
|---|---|---|---|
| Ficha base (HTML de producción) | 1568 | 3280 | 3243 |
| Ficha + fetchpriority (LCP alto / miniaturas bajo) | 1504 | 3220 | 3182 |
| Ficha + fetchpriority + sin fuente griega | 1504 | 3148 | 3110 |
| Ficha fp (otra tanda) | 1568 | 3252 | 3212 |
| Ficha fp + sin miniaturas | 1580 | 2572 | 2527 |
| Ficha fp + sin miniaturas ni otras imágenes no-LCP | 1508 | 2416 | 2374 |
| Portada base | 1908 | 3844 | — |
| Portada sin 2.ª diapositiva | 1680 | 3596 | — |
| Portada sin 2.ª diapositiva, tarjetas ni sectores (cota) | 1480 | 2624 | — |
| Portada base (HTML interceptado) | 1704 | 3820 | — |
| Portada propuesta (2.ª diapositiva diferida + tarjetas lazy + `c-v:auto` en sectores, que no difirió nada) | 1488 | 3292 | — |

### Ficha sin throttling

| Variante | LCP | LCP − fin de imagen |
|---|---|---|
| Con animación | 592 | 132 |
| `prefers-reduced-motion` | 520 | 32 |
| Animación desde opacidad .01 | 632 | 122 |

### Ficha con throttling, efecto de la animación de entrada

| Variante | LCP − fin de imagen |
|---|---|
| Con animación | 43 |
| Sin animación en `.stage` | 39 |
| `prefers-reduced-motion` | 11 |

## Anexo B — Estado del repo al cerrar el informe (HEAD 2026-10-17 18:10)

- Ya en HEAD: `fetchPriority="high"` junto a `priority` en `w06-ficha.tsx:204-205` (escenario), w07/w08/w09-gallery y 404 (`not-found-view.tsx:90`),
  y `fetchPriority="low"` en las miniaturas (`w06-ficha.tsx:252`). Es correcto en red; la recomendación (§7a) es cambiar `priority` por
  `loading="eager"`, por alineación con la documentación y porque `priority` está obsoleto.
- Siguen con `priority` sin `fetchPriority`:
  - `w23-viewer.tsx:382` (visor 3D de `valvula-compuerta`): pasar a `loading="eager" fetchPriority="high"` si su imagen es el LCP.
  - `w06-gallery.tsx:41`: código muerto (`ScreenW06` no se importa en ningún sitio).
  - `access-frame.tsx:154` y `landing-chrome.tsx:120` (logos): `loading="eager"`.
  - `w06-ficha.tsx:564` (modal del documento): `loading="eager"`.
- Los números de línea de este informe corresponden a ese HEAD. Otros agentes estaban editando en paralelo, así que pueden desplazarse.
