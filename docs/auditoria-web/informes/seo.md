# Auditoría SEO técnica — FUNDIGSAC (frontend Next 16.4.2)

Fecha: 17-oct-2026 · Rol: Technical SEO Engineer (solo lectura) · Producción auditada: https://fundigsac-web.vercel.app (≈ HEAD `09a8d7c`)
Canónico declarado: `https://fundigsac.com` (hoy WordPress). Indexación: `noindex` global intencional (ADR-001) — **no se propone activarla**, solo dejarla lista.

## Método y evidencias
- Números de línea referidos a HEAD `09a8d7c`. Durante la auditoría otros agentes tenían cambios sin commit en `w06-ficha.tsx`, `w0{6,7,8,9}-gallery.tsx`, `w23-viewer.tsx`, `not-found-view.tsx`, `vitest.config.ts` (no tocados por esta auditoría).
- Inventario de código: `src/app/**/page.tsx`, `generateStaticParams`, `src/modules/catalog/registry.tsx`, `sitemap.ts`, `robots.ts`, `layout.tsx`, `next.config.ts`.
- API de metadatos verificada en `node_modules/next/dist/docs/` (generate-metadata.md §Merging/Inheriting, robots.md, sitemap.md, opengraph-image.md, next-config `headers.md` `has/missing` tipo `host`) y en el código de Next (`metadata-resolution-primitives.js`: `openGraph` de un segmento hijo **reemplaza** al del padre, incluidas las imágenes de `opengraph-image`; `title/description` se heredan a OG/Twitter; `twitter:card` pasa a `summary_large_image` solo si hay imagen). Matching de `host` = regex anclada `^…$` (`prepare-destination.js`).
- HTML servido con `curl` (UA Chrome y Googlebot; los metadatos quedan en `<head>` en ambos casos, incluso en rutas dinámicas). Sin navegador MCP; no hizo falta Playwright (todo el contenido relevante está en el SSR).
- Google Search Central (consultado): noindex no funciona si robots.txt bloquea la URL; Product snippets exigen `offers`, `review` o `aggregateRating` (y `offers` exige precio); el *sitelinks search box* se retiró el 21-nov-2024 (el marcado sobrante no da error). Vercel: previews `*.vercel.app` reciben `X-Robots-Tag: noindex` automático; **la URL `.vercel.app` de producción no**.
- Scripts y datos: `scratchpad/seo/fetch.sh`, `analyze.py`, `report.py`, `text.py`, `analysis.json`, `report.txt`, `html/` (HTML descargado), `wp-urls.txt` (sitemap del WordPress actual).

---

## 1. Inventario de rutas

| Ruta | Tipo / origen | Robots hoy (servido) | En `sitemap.ts` (si SITE_INDEXABLE) | Recomendación |
|---|---|---|---|---|
| `/` | estática (`src/app/page.tsx`, sin `metadata` propia) | noindex,nofollow (global) | sí | indexable; añadir canonical |
| `/industrias`, `/industrias/{saneamiento,agricultura,mineria}` | estáticas | global | sí | indexables |
| `/productos` | dinámica (searchParams `q`, `familia`) | global | sí | indexable (canonical fijo ✓) |
| `/productos/{valvulas,tuberias,marcos-y-tapas}` | estáticas (`categoryMetadata`) | global | sí (CATEGORIES) | indexables tras corregir description |
| `/productos/valvulas/valvula-compuerta` | `[categoria]/[producto]` + `generateStaticParams(PRODUCTS)`, `dynamicParams=false` | global | sí | indexable |
| `/productos/valvulas/valvula-compuerta-fundigsac` | idem | global | sí | indexable (título/H1 únicos) |
| `/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida` | idem | global | sí | indexable (título/H1 únicos) |
| `/productos/valvulas/valvula-mariposa` | idem («Referencia visual», todo «pendiente de validación») | global | sí | **noindex hasta validar** |
| `/productos/tuberias/tuberia-tyton` | idem (placeholder) | global | sí | **noindex hasta validar** |
| `/productos/marcos-y-tapas/marco-tapa-d400` | idem (placeholder) | global | sí | **noindex hasta validar** |
| `/productos/valvulas/valvula-compuerta/visor-3d` | `generateStaticParams` (solo productos con `Viewer3D`) | noindex,follow | no | noindex siempre ✓ |
| `/soluciones`, `/soluciones/redes-matrices` | estática + `[slug]` (`SOLUTIONS`) | global | sí | **noindex hasta aprobar contenido** (3 de 4 aplicaciones «pendientes de confirmación») |
| `/recursos` | estática (W13) | global | sí | noindex hasta publicar documentos **o** enlazar las 3 fichas PDF reales |
| `/recursos/detalle-tecnico` | `[slug]` (`RESOURCE_PAGES`) — H1 «Documento no publicado» | global | sí | **noindex** (soft-404) y fuera del sitemap |
| `/contacto` | dinámica (searchParams) | global | sí | indexable |
| `/cotizar` (+ `?producto=`) | dinámica, `generateMetadata` | global (¡indexable al activar!) | **sí** | **noindex,follow siempre**, fuera del sitemap |
| `/cotizar/confirmacion` | dinámica | noindex,nofollow | no (y Disallow) | noindex siempre ✓ |
| `/reclamaciones`, `/terminos`, `/privacidad`, `/cookies`, `/mapa-del-sitio` | estáticas | global | sí | indexables |
| `/eliminar-cuenta` | estática | global | sí | opcional noindex,follow (página procedimental) |
| `/terminos-b2b` | estática («Documento en preparación») | noindex,follow | no | noindex mientras esté en preparación ✓ |
| `/buscar` | dinámica | noindex,follow | no (y Disallow) | noindex siempre ✓ |
| `/carrito` | estática | noindex,follow | no | noindex siempre ✓ |
| `/login`, `/registro`, `/recuperar`, `/restablecer` | `(acceso)` | noindex,nofollow | no | noindex siempre ✓ |
| `/libro-de-reclamos` | `permanentRedirect` | 308 → `/reclamaciones` | no | OK (legado WP) |
| `/productos/valvulas/valvula-compuerta-fundigsac-5-anos` | `next.config` redirect | 308 → garantía extendida | no | OK |
| 404 (`not-found.tsx`) | — | 404 real + noindex ✓ | — | OK |
| `/api/*` | route handlers | — | no | `Disallow: /api/` |

404 reales verificados (estado 404): `/no-existe-xyz`, `/productos/no-existe-xyz`, `/productos/valvulas/no-existe-xyz`, `/soluciones/no-existe-xyz`, `/recursos/no-existe-xyz`, `/productos/valvulas/valvula-mariposa/visor-3d`.

## 2. Tabla por ruta (HTML servido en producción)

Todas: `<html lang="es-PE">` ✓, exactamente **un `<h1>`** ✓, **0 imágenes sin `alt`** (354 `<img>`, 104 con `alt=""` decorativo), **sin `og:image`/`twitter:image`** (no existe `opengraph-image`), `og:url = https://fundigsac.com` en todas, `twitter:card = summary`, sin hreflang (correcto: EN solo cliente, la URL no cambia y el idioma por defecto sin `localStorage` es ES).

| Ruta | `<title>` (car.) | meta description (car.) | H1 (único en todas) | canonical | og:image | estado |
|---|---|---|---|---|---|---|
| `/` | FUNDIGSAC \| Hierro dúctil · Saneamiento e Infraestructura (57) | Válvulas, tuberías, marcos y tapas de hierro dúctil para redes de agua potable, saneamiento y minería en el Perú. (113) ⚠ | Ingeniería confiable para redes que no se detienen. | — | — | 200 · noindex,nofollow · en sitemap* |
| `/industrias` | Industrias \| FUNDIGSAC (22) | Componentes FUNDIGSAC para saneamiento, minería, agricultura e industria: válvulas, hierro dúctil, tubería HDPE, acoples y medición. (132) | Componentes para cada tipo de red | /industrias | — | 200 · noindex,nofollow · en sitemap* |
| `/industrias/agricultura` | Agricultura \| FUNDIGSAC (23) | Válvulas de compuerta, ventosas, filtros Y, tubería HDPE y válvulas de retención FUNDIGSAC para sistemas de riego agrícola. (123) | Soluciones para riego que trabajan con precisión. | /industrias/agricultura | — | 200 · noindex,nofollow · en sitemap* |
| `/industrias/saneamiento` | Saneamiento \| FUNDIGSAC (23) | Válvulas de compuerta, marcos y tapas, tuberías y acoples FUNDIGSAC de hierro dúctil para redes de agua potable, alcantarillado sanitario y plantas de tratamiento. (163) ⚠ | Soluciones para agua y saneamiento que sostienen ciudades. | /industrias/saneamiento | — | 200 · noindex,nofollow · en sitemap* |
| `/industrias/mineria` | Minería \| FUNDIGSAC (19) | Válvulas de compuerta, tuberías HDPE, acoples y bridas FUNDIGSAC de hierro dúctil para agua de proceso, pulpas, relaves y control de procesos mineros. (150) | Soluciones para minería que resisten operaciones exigentes. | /industrias/mineria | — | 200 · noindex,nofollow · en sitemap* |
| `/productos` | Catálogo general de productos \| FUNDIGSAC (41) | Catálogo de válvulas, tuberías, marcos y tapas de hierro dúctil FUNDIGSAC. (74) ⚠ | Catálogo general | /productos | — | 200 · noindex,nofollow · en sitemap* |
| `/productos/valvulas` | Válvulas \| FUNDIGSAC (20) | Familia de referencia visual; variantes y datos técnicos pendientes de validación en el catálogo oficial. (105) ⚠ **duplicada ×3** | Válvulas | /productos/valvulas | — | 200 · noindex,nofollow · en sitemap* |
| `/productos/tuberias` | Tuberías \| FUNDIGSAC (20) | (misma placeholder) (105) ⚠ | Tuberías de hierro dúctil | /productos/tuberias | — | 200 · noindex,nofollow · en sitemap* |
| `/productos/marcos-y-tapas` | Marcos y tapas \| FUNDIGSAC (26) | (misma placeholder) (105) ⚠ | Marcos y tapas | /productos/marcos-y-tapas | — | 200 · noindex,nofollow · en sitemap* |
| `/productos/valvulas/valvula-compuerta` | Válvula de compuerta bridada \| FUNDIGSAC (40) | Válvula de compuerta de cierre elástico con extremos bridados, DN40 a DN600, PN10/PN16, según EN1074-2. (103) ⚠ | Válvula de compuerta bridada | /productos/valvulas/valvula-compuerta | — | 200 · noindex,nofollow · en sitemap* |
| `/productos/valvulas/valvula-compuerta-fundigsac` | Válvula de compuerta bridada FUNDIGSAC \| FUNDIGSAC (50) **duplicado** | Válvula compuerta bridada de asiento resiliente, DN50 a DN600, PN10/PN16, diseño DIN 3352 F4, en hierro dúctil GGG50. Marca FUNDIGSAC. (134) | Válvula de compuerta bridada FUNDIGSAC **(duplicado)** | propia ✓ | — | 200 · noindex,nofollow · en sitemap* |
| `/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida` | Válvula de compuerta bridada FUNDIGSAC \| FUNDIGSAC (50) **duplicado** | Válvula de compuerta de cierre elástico con extremos bridados, DN40 a DN600, PN10/PN16, según EN1074-2. Marca FUNDIGSAC con garantía extendida. (143) | Válvula de compuerta bridada FUNDIGSAC **(duplicado)** | propia ✓ | — | 200 · noindex,nofollow · en sitemap* |
| `/productos/valvulas/valvula-mariposa` | Referencia visual de válvula \| FUNDIGSAC (40) | Pantalla de referencia. La denominación comercial, variantes y especificaciones están pendientes de validación. (111) ⚠ **duplicada ×3** | Válvula mariposa | propia | — | 200 · noindex,nofollow · en sitemap* |
| `/productos/tuberias/tuberia-tyton` | Referencia visual de tubería \| FUNDIGSAC (40) | (misma placeholder) (111) ⚠ | Tubería de hierro dúctil | propia | — | 200 · noindex,nofollow · en sitemap* |
| `/productos/marcos-y-tapas/marco-tapa-d400` | Referencia visual de marco y tapa \| FUNDIGSAC (45) | (misma placeholder) (111) ⚠ | Marco y tapa | propia | — | 200 · noindex,nofollow · en sitemap* |
| `/productos/valvulas/valvula-compuerta/visor-3d` | Visor 3D · Válvula de compuerta bridada \| FUNDIGSAC (51) | Visualización 3D de Válvula de compuerta bridada. (49) | Válvula de compuerta | — | — | 200 · noindex,follow · fuera |
| `/soluciones` | Soluciones y aplicaciones \| FUNDIGSAC (37) | Soluciones en hierro dúctil para redes de agua potable, saneamiento y minería. (78) ⚠ | Soluciones para redes y conducción | /soluciones | — | 200 · noindex,nofollow · en sitemap* |
| `/soluciones/redes-matrices` | Redes matrices de agua potable \| FUNDIGSAC (42) | Soluciones en hierro dúctil para líneas de conducción y redes matrices. (71) ⚠ | Redes matrices de agua | propia | — | 200 · noindex,nofollow · en sitemap* |
| `/nosotros` | Nosotros \| FUNDIGSAC (20) | Conoce a FUNDIGSAC: empresa peruana especializada en soluciones en hierro dúctil para agua, alcantarillado e infraestructura urbana. (132) | Quiénes somos | /nosotros | — | 200 · noindex,nofollow · en sitemap* |
| `/recursos` | Recursos técnicos \| FUNDIGSAC (29) | Fichas técnicas, catálogos y documentación de productos de hierro dúctil FUNDIGSAC. (83) ⚠ | Recursos técnicos y documentación | /recursos | — | 200 · noindex,nofollow · en sitemap* |
| `/recursos/detalle-tecnico` | Detalle de recurso técnico \| FUNDIGSAC (38) | Estado y disponibilidad de los documentos técnicos oficiales; publicación pendiente de aprobación. (98) ⚠ | Documento no publicado | propia | — | 200 · noindex,nofollow · en sitemap* · **huérfana** |
| `/contacto` | Contacto \| FUNDIGSAC (20) | Contacta al equipo técnico-comercial de FUNDIGSAC: llamadas, correo, WhatsApp y formulario de contacto. (103) ⚠ | Contáctanos | /contacto | — | 200 · noindex,nofollow · en sitemap* |
| `/cotizar` | Solicitar cotización \| FUNDIGSAC (32) | Solicita una cotización técnica de productos de hierro dúctil FUNDIGSAC. (72) ⚠ | Solicitar una cotización | /cotizar | — | 200 · noindex,nofollow (global) · **en sitemap*** |
| `/cotizar/confirmacion` | Confirmación de cotización \| FUNDIGSAC (38) | (heredada del layout) (113) | No hay una solicitud registrada | — | — | 200 · noindex,nofollow · fuera |
| `/reclamaciones` | Libro de reclamaciones \| FUNDIGSAC (34) | Registra tu reclamo o queja ante FUNDIGSAC de forma rápida, segura y transparente… (155) | Libro de Reclamaciones | /reclamaciones | — | 200 · noindex,nofollow · en sitemap* |
| `/libro-de-reclamos` | — | — | — | — | — | 308 → `/reclamaciones` |
| `/terminos` | Términos y condiciones \| FUNDIGSAC (34) | Términos y condiciones de uso del sitio web de FUNDIGSAC… (132) | Términos y condiciones | /terminos | — | 200 · noindex,nofollow · en sitemap* |
| `/terminos-b2b` | Términos y Condiciones Comerciales B2B \| FUNDIGSAC (50) | Términos y condiciones comerciales para clientes corporativos de FUNDIGSAC. (75) | Términos y Condiciones Comerciales B2B | — | — | 200 · noindex,follow · fuera |
| `/mapa-del-sitio` | Mapa del sitio \| FUNDIGSAC (26) | Encuentra rápidamente cada sección de FUNDIGSAC… (119) ⚠ | Mapa del sitio | /mapa-del-sitio | — | 200 · noindex,nofollow · en sitemap* · **huérfana** |
| `/privacidad` | Política de privacidad \| FUNDIGSAC (34) | Cómo FUNDIGSAC recopila, usa, protege y conserva tus datos personales… (149) | Política de privacidad | /privacidad | — | 200 · noindex,nofollow · en sitemap* |
| `/cookies` | Política de cookies \| FUNDIGSAC (31) | Qué cookies utiliza el sitio web de FUNDIGSAC, para qué sirven y cómo gestionar tus preferencias. (97) ⚠ | Política de cookies | /cookies | — | 200 · noindex,nofollow · en sitemap* |
| `/eliminar-cuenta` | Eliminar cuenta y datos personales \| FUNDIGSAC (46) | Cómo solicitar la eliminación de tu cuenta de FUNDIGSAC… (Ley N.° 29733). (177) ⚠ | Eliminar tu cuenta y tus datos | /eliminar-cuenta | — | 200 · noindex,nofollow · en sitemap* |
| `/buscar` | Resultados de búsqueda \| FUNDIGSAC (34) | (heredada del layout) (113) | Familias del catálogo (precedido de h2/h3) | — | — | 200 · noindex,follow · fuera |
| `/carrito` | Carrito de cotización \| FUNDIGSAC (33) | Revisa los productos de tu cotización… (100) | Tu carrito de cotización | — | — | 200 · noindex,follow · fuera |
| `/login` · `/registro` · `/recuperar` · `/restablecer` | Iniciar sesión (26) · Crear cuenta (24) · Recuperar contraseña (32) · Actualizar contraseña (33) | 75 · 83 · 75 · 63 | 1 H1 c/u | — | — | 200 · noindex,nofollow · fuera |
| 404 | Página no encontrada \| FUNDIGSAC (32) | (heredada del layout) | Error 404. Ups, esta página no se encuentra. | — | — | **404** · noindex ✓ |

\* «en sitemap» = incluida por `src/app/sitemap.ts` cuando `SITE_INDEXABLE=true` (hoy `/sitemap.xml` servido está vacío y `robots.txt` = `Disallow: /`). ⚠ = fuera de 120–160 car.

Duplicados detectados: títulos ×2 (fichas FUNDIGSAC); descriptions: ×3 categorías (placeholder), ×3 fichas placeholder, ×9 heredada del layout (`/`, `/cotizar/confirmacion`, `/buscar`, 404 — solo `/` la «posee»).
Saltos de encabezado: ninguno h1→h3. Única anomalía de orden: `/buscar` (h2 «Filtros técnicos» + h3 antes del h1). Pie con 4 `h2` en todas las páginas (aceptable).

---

## 3. Hallazgos

Formato común: P0 = roto/crítico (aquí: **bloqueante de lanzamiento**), P1 = importante, P2 = refinamiento.

| ID | P | Tipo | Ruta(s) | Archivo:línea | Problema | Causa | Corrección propuesta | Evidencia |
|---|---|---|---|---|---|---|---|---|
| SEO-01 | P0 | SEO | todas, host `fundigsac-web.vercel.app` | `src/shared/config/env.ts:5`, `next.config.ts:65` | Al activar `SITE_INDEXABLE=true` en Production, el alias `fundigsac-web.vercel.app` (misma build de producción) servirá `index,follow`, `robots.txt Allow` y sitemap → host duplicado indexable. Vercel solo pone `X-Robots-Tag: noindex` a previews, no al `.vercel.app` de producción. | Interruptor solo por variable, sin condición de host/entorno. | (1) `export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true" && process.env.VERCEL_ENV !== "preview";` (2) en `headers()` añadir primero `{ source: "/:path*", missing: [{ type: "host", value: "fundigsac\\.com" }], headers: [{ key: "X-Robots-Tag", value: "noindex" }] }` (regex anclada por Next; cubre `*.vercel.app`, `www`, dominios de rama). (3) Tras el lanzamiento, opcional 308 de `fundigsac-web.vercel.app` → `https://fundigsac.com/:path*`. | KB Vercel «preview deployments indexed»; `prepare-destination.js:84-101` |
| SEO-02 | P0 | SEO | 3 fichas placeholder, `/recursos/detalle-tecnico`, `/soluciones`, `/soluciones/redes-matrices`, `/recursos`, `/cotizar` | `src/app/sitemap.ts:6,13-15`; `src/modules/catalog/registry.tsx:32-34,37-43`; `src/app/cotizar/page.tsx:12-16` | Al activar, se indexarían y se enviarían en el sitemap páginas «pendiente de validación» (soft-404: H1 «Documento no publicado»; fichas con todos los campos «Pendiente») y el formulario `/cotizar`. | El sitemap mapea todo el registro; las páginas no declaran `robots`. | Añadir `indexable: boolean` a `ProductEntry` (true solo en `valvula-compuerta`, `-fundigsac`, `-garantia-extendida`) y a SOLUTIONS/RESOURCES (false); en `generateMetadata` → `...(item.indexable ? {} : { robots: { index: false, follow: true } })`; sitemap → `PRODUCTS.filter((p) => p.indexable)`; quitar `/cotizar`, `/soluciones`, `/recursos` de `STATIC` hasta aprobar; `/cotizar`: `robots: { index: false, follow: true }` y sin canonical. | `report.txt`, `text.py` de cada ruta |
| SEO-03 | P0 | SEO | `/productos/valvulas`, `/tuberias`, `/marcos-y-tapas` | `src/modules/catalog/registry.tsx:23-25` (vía `category-page.tsx:16`) | Meta description = nota interna «Familia de referencia visual; variantes y datos técnicos pendientes de validación en el catálogo oficial.» (105), idéntica ×3; también en og/twitter. Saldría tal cual en Google. | Texto de trabajo usado como `description`. | Válvulas (150): «Válvulas de compuerta, mariposa, check swing, check flex, reductoras de presión y de aire para redes de agua, alcantarillado e infraestructura urbana.» · Tuberías (155): «Tuberías con unión junta, unión mecánica, bridas o revestimiento de mortero de cemento y tubería HDPE para redes de agua, alcantarillado e infraestructura.» · Marcos (148): «Marcos y tapas de hierro dúctil para redes de agua y alcantarillado: tapas circulares, marcos rectangulares, rejillas pluviales y tapas de registro.» (todo tomado de las tarjetas/lead de cada página). | `html/productos__*.html` |
| SEO-04 | P0 | SEO | URLs del WordPress | `next.config.ts:62-64` | Tras mover `fundigsac.com` a Vercel, las URLs publicadas por `wp-sitemap.xml` darán 404 (tras 308 de barra final): `/contactanos/`, `/shop/`, `/product-category/valvulas-hierro-ductil/`, 10 × `/product/valvula-*/`, `/cart/`, `/checkout/`, `/my-account/`. Solo `/nosotros/` y `/libro-de-reclamos/` sobreviven. | No hay mapa de redirecciones del sitio anterior. | Añadir a `redirects()` (permanent): `/contactanos`→`/contacto`; `/shop`→`/productos`; `/product-category/valvulas-hierro-ductil`→`/productos/valvulas`; `/product/valvula-compuerta-bridada`→`/productos/valvulas/valvula-compuerta` (confirmar equivalencia); `/product/:slug`→`/productos/valvulas` (los 10 son válvulas); `/cart`→`/carrito`; `/checkout`→`/cotizar`; `/my-account`→`/login`; `/wp-sitemap.xml`→`/sitemap.xml`. Dejar 404 `/hola-mundo`, `/pagina-ejemplo`, `/category/*`, `/author/*`, `/feed`. | `wp-urls.txt`; curl de cada URL (308→404) |
| SEO-05 | P1 | SEO | todas salvo `/` | `src/app/layout.tsx:24` | `og:url = https://fundigsac.com` en todas las páginas. Facebook/LinkedIn usan `og:url` como objeto canónico: al compartir cualquier página se mostraría la ficha de la home. | `openGraph.url` en el layout raíz se hereda (merge superficial). | Quitar `url` del layout y fijarlo por página con un helper: `pageMetadata({ path, title, description })` → `{ title, description, alternates: { canonical: path }, openGraph: { ...OG_BASE, url: path } }` donde `OG_BASE` incluye `type/locale/siteName/images` (un `openGraph` hijo reemplaza entero al del padre). | docs generate-metadata §Merging; `metadata-resolution-primitives.js` |
| SEO-06 | P1 | SEO | todas | `src/app/` (no existe `opengraph-image.*`) | Sin `og:image`/`twitter:image` en ninguna ruta; `twitter:card=summary`. | No hay imagen social. | Componer 1200×630 JPG a partir de una foto real ya publicada (p. ej. hero de planta o válvula FUNDIGSAC) + logo oficial; publicarla como `public/og/fundigsac-1200x630.jpg` e incluirla en `OG_BASE.images` (con `alt`). Next pondrá `summary_large_image` solo. Nota: con `metadataBase` = fundigsac.com la URL absoluta solo resolverá tras el cambio de dominio. | `analysis.json` (0 páginas con og:image) |
| SEO-07 | P1 | SEO | `/` | `src/app/page.tsx:8` | Home sin `<link rel="canonical">`. | `page.tsx` no exporta `metadata`. | `export const metadata: Metadata = { alternates: { canonical: "/" } };` | `report.txt` |
| SEO-08 | P1 | SEO | dos fichas FUNDIGSAC | `registry.tsx:30-31`; H1 `src/screens/islands/w06-ficha.tsx:90-91` (renderizado en :261 en HEAD) | Mismo `<title>` («Válvula de compuerta bridada FUNDIGSAC \| FUNDIGSAC», con marca duplicada) y mismo H1 en dos URLs. | `name` repetido y plantilla `%s \| FUNDIGSAC`. | Títulos con `title: { absolute: … }`: «Válvula de compuerta FUNDIGSAC DIN 3352 F4, DN50–DN600» (54) y «Válvula de compuerta FUNDIGSAC con garantía extendida» (53); H1 de la segunda: «Válvula de compuerta bridada FUNDIGSAC con garantía extendida» (la página ya muestra «Garantía extendida respaldada por FUNDIGSAC»). Descriptions: (153) «Válvula compuerta bridada FUNDIGSAC de asiento resiliente, diseño DIN 3352 F4, DN50 a DN600, PN10/PN16, en hierro dúctil GGG50 para agua potable y riego.» · (148) «Válvula de compuerta FUNDIGSAC con garantía extendida: cierre elástico, extremos bridados, DN40 a DN600, PN10/PN16, EN 1074-2, hierro dúctil GGG-50.» | `report.txt` |
| SEO-09 | P1 | SEO/veracidad | todas | `src/app/layout.tsx:41` | `Organization.legalName = "FUNDIGSAC S.A.C."`, pero la razón social publicada en `/reclamaciones` y `/eliminar-cuenta` es «Fundición y Desarrollo de Ingeniería y Gestión S.A.C.» (RUC 20601839281). | Se usa `SITE.legalName` en vez de `SITE.registeredName`. | `legalName: SITE.registeredName, taxID: SITE.ruc`, y añadir datos ya publicados: `telephone: site.phone`, `address: { "@type": "PostalAddress", streetAddress: "Jirón Pacasmayo Mz. E Lt. 12", addressLocality: "Cercado de Lima", addressRegion: "Lima", addressCountry: "PE" }`, `"@id": \`${SITE.url}/#organization\``. Sin `sameAs` (Instagram no se enlaza en el sitio), sin `foundingDate` (cronología «desde 2005» sin validar). | `grep` en `html/reclamaciones.html` |
| SEO-10 | P1 | SEO/UX | `/productos/{valvulas,tuberias,marcos-y-tapas}` | `w03-valvulas.tsx:32-35`, `w04-tuberias.tsx:22-26`, `w05-marcos.tsx:24-28` | 14 tarjetas con anchor «Ver ficha» (`aria-label="Ver ficha de …"`) llevan a `/contacto`. | `href: "/contacto"` como relleno. | Texto «Solicitar ficha» y `href` con el prefill existente: `/contacto?motivo=documentacion&documento=<nombre del producto>` (canonical de /contacto ya cubre la variante). | `analysis.json` (enlaces) |
| SEO-11 | P1 | SEO/UX | todas (cabecera, menú móvil, pie) + home | `landing-chrome.tsx:22,32`; `landing-prefs.ts:56,58`; `components-carousel.tsx:13`; `home-sections.tsx:54` | «Grifos» → `/cotizar` (×131; `/productos?q=grifo` = «No encontramos productos»); submenú Recursos: «Fichas técnicas», «Documentación», «Catálogo digital», «Campañas y sobrestock» → todos `/recursos` (×129 c/u; W13 no lee parámetros); «Campañas y sobrestock» no tiene contenido. | Arrays de enlaces provisionales. | Quitar «Grifos» y «Campañas y sobrestock» hasta que exista destino; reducir Recursos a un enlace «Recursos técnicos» (o implementar `?categoria=` en W13 con canonical `/recursos`). | idem |
| SEO-12 | P1 | SEO/veracidad | `/industrias/{saneamiento,mineria,agricultura}` | `src/app/industrias/_sector/sector-page.tsx:129,132`; `agricultura/sections.tsx:103,106` | El bloque «Válvula de compuerta FUNDIGSAC» enlaza «Ver producto» a la ficha **H-ITALY** (`/valvula-compuerta`) y «Ver ficha técnica» al PDF FT-HI-100 de H-ITALY. Las fichas FUNDIGSAC reciben solo 2 enlaces internos. | Enlace fijo a la primera ficha. | Apuntar a `/productos/valvulas/valvula-compuerta-fundigsac` y `/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf` (FUNDIGSAC debe confirmar cuál de sus dos fichas corresponde). | `analysis.json` |
| SEO-13 | P1 | SEO | `/industrias/agricultura` | `agricultura/sections.tsx:20,72` | `/productos?categoria=hdpe` y `?categoria=valvulas`: el catálogo solo lee `q` y `familia` → muestra todo sin filtrar. | Parámetro inexistente. | `"/productos/tuberias"` (Tuberías HDPE) y `"/productos/valvulas"` (Explorar productos). | `src/app/productos/page.tsx:25-26`; HTML idéntico al catálogo sin filtro |
| SEO-14 | P1 | SEO | `/mapa-del-sitio`, `/recursos/detalle-tecnico`, `/soluciones*` | `landing-chrome.tsx:27-34,371-378` | `/mapa-del-sitio` y `/recursos/detalle-tecnico` con 0 enlaces internos (huérfanas en el sitemap); `/soluciones` solo 3 (no está en menú ni pie) y `/soluciones/redes-matrices` 1. | Navegación sin esas rutas. | Añadir «Mapa del sitio» a los enlaces legales del pie; `/recursos/detalle-tecnico` fuera del sitemap (SEO-02); decidir si «Soluciones» entra al menú cuando su contenido se apruebe. | conteo de enlaces entrantes |
| SEO-15 | P1 | SEO | sectores, categorías, nosotros, contacto, home | `industrias/*/page.tsx`, `nosotros/page.tsx:5`, `contacto/page.tsx:7`, `layout.tsx:21`, `category-page.tsx:16` | Títulos de 19–26 car. sin término de búsqueda («Minería \| FUNDIGSAC», «Válvulas \| FUNDIGSAC»…). | Título = nombre de sección. | Ver §7 (textos exactos ≤ 60 car. derivados del contenido visible). | — |
| SEO-16 | P1 | SEO | 13 rutas | ver §7 | Descriptions fuera de 120–160: `/productos` 74, `/soluciones` 78, `/redes-matrices` 71, `/recursos` 83, `/contacto` 103, `/valvula-compuerta` 103, `/cookies` 97, `/` 113, `/saneamiento` 163, `/eliminar-cuenta` 177… | — | Textos en §7. | — |
| SEO-17 | P1 | SEO | 3 fichas placeholder | `registry.tsx:32-34`; `[producto]/page.tsx:46-47` | Title «Referencia visual de …» ≠ H1 («Válvula mariposa», «Tubería de hierro dúctil», «Marco y tapa») ≠ anchor que llega («Tubería HDPE», «Tapa circular dúctil» → slug `marco-tapa-d400`); la miga JSON-LD no coincide con la visible («Ficha de producto»). | Nombres de trabajo en el registro. | Con SEO-02 quedan noindex; además alinear `name` con el H1 visible y el anchor de las tarjetas con el producto real de destino. | `text.py` |
| SEO-18 | P2 | SEO | sitio indexable | `src/app/robots.ts:5,9` | Con indexación activa se haría `Disallow` de `/buscar` y `/cotizar/confirmacion`, que ya llevan `noindex`: Google no puede ver el noindex y puede indexar la URL sin contenido. | Doble mecanismo. | `const PRIVATE = ["/api/"];` (dejar el noindex de las páginas). | Google «Block indexing» |
| SEO-19 | P2 | SEO | todas | `src/app/layout.tsx:42` | `WebSite.potentialAction SearchAction` → `/buscar` (noindex y bloqueada). Google retiró el sitelinks search box el 21-nov-2024 (sin errores, pero inútil). | — | Quitar `potentialAction`; añadir `"@id": \`${SITE.url}/#website\`` y `publisher: { "@id": \`${SITE.url}/#organization\` }` (WebSite sigue sirviendo para el nombre del sitio). | blog Google 2024-10 |
| SEO-20 | P2 | SEO | `/productos`, `/industrias/*`, `/nosotros`, `/contacto`, `/soluciones*`, `/recursos` | `src/shared/seo/json-ld.tsx:7` (helper sin uso ahí) | `BreadcrumbList` solo en categorías y fichas; estas páginas muestran migas visibles sin datos estructurados. La miga visible de sectores («Inicio / Saneamiento») omite «Sectores». | — | Usar `breadcrumbList()` replicando la miga visible; corregir la visible a «Inicio / Sectores / Saneamiento» (`/industrias`). | `text.py` |
| SEO-21 | P2 | SEO | fichas | `[producto]/page.tsx:50-51` | `Product` sin `offers` es schema.org válido pero **no** es elegible para fragmentos de producto (Google exige `offers`/`review`/`aggregateRating`, y `offers` exige precio) y Search Console lo marcaría inválido. | — | Mantener `WebPage` (correcto hoy). Si se quiere señal de entidad: `Product` solo en las 3 fichas reales con `name`, `description`, `image`, `brand` (H-ITALY / FUNDIGSAC), `material`, sin precio/stock/rating; nunca en las placeholder. | Google Product snippet |
| SEO-22 | P2 | SEO/a11y | `/buscar` | `src/screens/w22.tsx:28-30` | h2 «Filtros técnicos» y h3 «Familias» antes del h1. | Aside antes del bloque de resultados. | Mover el h1 por encima del aside (o rebajar el aside a `<p>`/`aria-label`). | `report.txt` |
| SEO-23 | P2 | SEO | `/recursos`, `/recursos/detalle-tecnico`, `/soluciones*`, fichas placeholder, `/terminos-b2b` | spans `material-symbols-outlined` | Las ligaduras de iconos son texto del DOM («description», «engineering», «tune»…) y contaminan anchors («homeInicio», «policyPolítica de Privacidad», «menu_bookLibro…»). | Fuente de iconos por ligadura. | Sustituir por `lucide-react` (ya usado) o SVG. | `grep material-symbols` |
| SEO-24 | P2 | SEO | fichas | `src/screens/islands/w06-gallery.tsx:62` (HEAD) | Miniaturas con `alt=""` y la descripción solo en `aria-label` del botón: 4 fotos reales por ficha sin texto alternativo para Google Imágenes. | — | Poner el texto del `aria-label` también como `alt` de la imagen (el nombre accesible del botón no cambia). | `analysis.json` imgs |
| SEO-25 | P2 | SEO | `/valvula-compuerta` vs `/garantia-extendida` | `w06-ficha*.tsx` / copy | Similitud 0,39 (shingles de 5 palabras): mismo lead y mismo párrafo «Descripción». | Copy compartido. | Diferenciar el lead de la ficha con garantía (garantía, WRAS, FT-HD N° 002-2024 — ya en la página). | script de similitud |
| SEO-26 | P2 | SEO | PDFs `/docs/*.pdf` | `next.config.ts:65` | Al lanzar se indexarán los PDF (uno es la ficha del proveedor H-ITALY FT-HI-100) y pueden competir con la ficha HTML. | Sin cabecera. | Decidir: `X-Robots-Tag: noindex` para `/docs/:file*` o `Link: <https://fundigsac.com/productos/…>; rel="canonical"` por PDF. | curl 200 application/pdf |
| SEO-27 | P2 | SEO | `/libro-de-reclamos/` | `src/app/libro-de-reclamos/page.tsx:5` | Cadena de 2 saltos (barra final → sin barra → `/reclamaciones`). | Redirect en página. | Moverlo a `redirects()` junto al mapa WP. | curl |
| SEO-28 | P2 | operación | — | `env.ts:5`, `robots.ts`, `sitemap.ts` | `SITE_INDEXABLE` se fija en build (robots/sitemap/metadata estáticos): cambiar la variable exige redeploy, y un *Instant Rollback* a una build anterior volvería a `Disallow: /` + noindex. | Prerender. | Checklist de lanzamiento (§6). | docs robots/sitemap («cached by default») |
| SEO-29 | P2 | SEO | `/`, `/industrias` | `src/app/_landing/hero-carousel.tsx:77`, `src/app/industrias/page.tsx:45` | H1 sin términos clave («Ingeniería confiable para redes que no se detienen.», «Componentes para cada tipo de red»). | Copy de campaña. | Opcional: H1 home «Componentes en hierro dúctil para agua, riego e industria» (hoy es el subtítulo) con el eslogan como antetítulo; H1 `/industrias`: «Componentes para saneamiento, minería, agricultura e industria». | — |
| SEO-30 | P2 | SEO | `/cotizar/confirmacion`, `/buscar`, 404 | sus `page.tsx` | Description heredada del layout (duplicado ×9). Son noindex. | Sin `description` propia. | Opcional: descripción propia o ninguna. | `report.txt` |

---

## 4. Enlaces internos

- 45 hrefs internos únicos en 43 páginas; **todos responden 200** (incl. PDFs y variantes con query). Ningún enlace interno apunta a una redirección. `/api/auth/google?...` (en login/registro, nofollow) no se comprobó para no iniciar OAuth.
- Mismo destino para anchors distintos: `/recursos` (585 enlaces: «Fichas técnicas», «Documentación», «Catálogo digital», «Campañas y sobrestock», «Recursos»); `/cotizar` (266: «Grifos» ×131, «Solicitar cotización» ×112…); `/contacto` con anchors «Ver ficha de …» (14 tarjetas).
- Anchor ≠ destino: «Ver ficha de Tubería HDPE» → ficha con H1 «Tubería de hierro dúctil»; «Ver ficha de Tapa circular dúctil» → `marco-tapa-d400` (H1 «Marco y tapa»); en `/productos`, «Ver ficha» de «Tubería HDPE PE100», «Válvula de aire», «Codo/Tee/Reducción HDPE», «Unión flexible/Adaptador brida HDPE» → categorías o filtros; en sectores, «Ver soluciones» → categorías de producto.
- Enlaces con query como navegación principal: «Acoples» → `/productos?q=acople` (×133). Correcto gracias al canonical fijo de `/productos`, pero «Acoples / accesorios» no tiene URL indexable propia.
- Enlaces entrantes por URL del sitemap: 36 páginas enlazan a cada sección del menú; fichas: `valvula-compuerta` 7, `-fundigsac` 2, `-garantia-extendida` 2, `valvula-mariposa` 5, `tuberia-tyton` 1, `marco-tapa-d400` 2; `/soluciones` 3; `/soluciones/redes-matrices` 1; `/mapa-del-sitio` 0; `/recursos/detalle-tecnico` 0.
- Redirecciones existentes: `/libro-de-reclamos` 308 → `/reclamaciones`; `/productos/valvulas/valvula-compuerta-fundigsac-5-anos` 308 → garantía extendida; barra final 308 → sin barra; `http` → `https` 308.
- Código muerto con datos de contacto distintos (`src/components/site-footer.tsx`: Jirón Acomayo N.° 199, ventas@…, `/libro-de-reclamos`, `?categoria=`): no se renderiza hoy; conviene borrarlo para que no se reutilice (NAP inconsistente).

## 5. JSON-LD

- Presente: `Organization` + `WebSite` (todas las páginas, en `<body>`, válido); `BreadcrumbList` en 3 categorías y 6 fichas; `WebPage` en fichas.
- Veracidad: `legalName` incorrecto (SEO-09). `logo` `https://fundigsac.com/brand/fundigsac.svg` hoy 404 en WordPress — resolverá tras el cambio de dominio (SVG admitido por Google Imágenes). `email` coincide con el visible.
- `SearchAction`: funcional (`/buscar?q=` lee `q`), pero obsoleto para Google y contradictorio con noindex/Disallow (SEO-19).
- `BreadcrumbList`: correcto en categorías y fichas reales; desalineado con la miga visible en fichas placeholder; falta en páginas con miga visible (SEO-20).
- `Product`: no aplicar sin oferta real si el objetivo es un resultado enriquecido; `WebPage` es la opción honesta hoy (SEO-21). Nada de precios, stock, reseñas, ratings ni certificaciones (WRAS/«Auditado SEDAPAL»/INACAL aparecen en el código de recursos marcados como no verificados: no llevar a datos estructurados).

## 6. Preparación para indexar (si mañana `SITE_INDEXABLE=true` en fundigsac.com)

Fallaría / quedaría mal:
1. `fundigsac-web.vercel.app` indexable en paralelo (SEO-01).
2. Sitemap con 28 URLs, de ellas 7 placeholder/soft-404 + `/cotizar` (SEO-02).
3. Snippets con texto interno («Familia de referencia visual…», «Pantalla de referencia…») (SEO-03/17).
4. Pérdida del tráfico/enlaces de las URLs WordPress (SEO-04).
5. Compartidos en redes con la ficha de la home y sin imagen (SEO-05/06); home sin canonical (SEO-07); títulos duplicados (SEO-08); `legalName` falso (SEO-09).
6. `robots.txt` bloquearía páginas noindex (SEO-18).

Previews y hosts no canónicos:
- `VERCEL_ENV !== "preview"` en `SITE_INDEXABLE` (las previews nunca indexables aunque alguien ponga la variable en «All Environments»).
- Cabecera `X-Robots-Tag: noindex` para todo host distinto de `fundigsac.com` (`missing` de tipo `host`), que cubre el `.vercel.app` de producción, `www` y dominios de rama (Vercel no les pone noindex).
- En hosts no canónicos conviene que Google pueda leer ese noindex: con `SITE_INDEXABLE=false` hoy `robots.txt` hace `Disallow: /` (aceptable antes del lanzamiento; si se detectan URLs `vercel.app` indexadas «sin contenido», permitir el rastreo y dejar actuar al `X-Robots-Tag`).

Checklist de lanzamiento (operación):
- `SITE_INDEXABLE=true` solo en el entorno **Production** de Vercel y **redeploy** (la variable se fija en build).
- No hacer *Instant Rollback* a builds anteriores al cambio (servirían `Disallow: /`).
- Configurar `www.fundigsac.com` → 308 a `fundigsac.com` en Vercel (hoy lo hace WordPress con 301).
- Verificar la propiedad de dominio en Search Console (DNS TXT), enviar `https://fundigsac.com/sitemap.xml` y revisar «Páginas» a los 7–14 días.
- Opcional: `robots: { index: true, follow: true, googleBot: { "max-image-preview": "large" } }` en el layout cuando sea indexable.

## 7. Palabras clave (sin keyword stuffing)

Cobertura en contenido principal (apariciones): «hierro dúctil» fuerte en home (7), /industrias (5), sectores y /nosotros; **0 en /productos/valvulas** y 1 en /productos/tuberias. «agua potable» solo en home, /industrias y saneamiento. «Perú»/«Lima» solo en home, /nosotros y /contacto (y no en sus títulos). «accesorios hidráulicos» **no aparece en ninguna página** (se habla de «accesorios HDPE», «acoples», «conexiones y fittings»): no se puede proponer sin contenido nuevo aprobado.

Propuestas (≤ 60 car. incluyendo « | FUNDIGSAC»; descriptions 120–160; solo con texto ya presente en cada página):

| Ruta | title propuesto (car.) | description propuesta (car.) |
|---|---|---|
| `/` (`title.default`) | Válvulas, tuberías y tapas de hierro dúctil \| FUNDIGSAC (55) | Válvulas, tuberías, marcos y tapas de hierro dúctil para redes de agua potable, saneamiento, minería y riego en el Perú. Atención comercial en Lima. (148) |
| `/productos` | Catálogo de válvulas, tuberías, marcos y tapas \| FUNDIGSAC (58) | Catálogo FUNDIGSAC de válvulas, tuberías, marcos y tapas de hierro dúctil, accesorios HDPE y conexiones para redes de agua, alcantarillado e infraestructura. (157) |
| `/productos/valvulas` | Válvulas para redes de agua y alcantarillado \| FUNDIGSAC (56) | (SEO-03) (150) |
| `/productos/tuberias` | Tuberías de hierro dúctil y HDPE \| FUNDIGSAC (44) | (SEO-03) (155) |
| `/productos/marcos-y-tapas` | Marcos y tapas de hierro dúctil \| FUNDIGSAC (43) | (SEO-03) (148) |
| `/productos/valvulas/valvula-compuerta` | Válvula de compuerta bridada H-ITALY DN40–DN600 \| FUNDIGSAC (59) | Válvula de compuerta de cierre elástico H-ITALY con extremos bridados, DN40 a DN600, PN10/PN16, según EN 1074-2, con cuerpo de hierro dúctil GGG-50. (148) |
| `…-fundigsac` / `…-garantia-extendida` | ver SEO-08 (54 / 53, `absolute`) | ver SEO-08 (153 / 148) |
| `/industrias` | Saneamiento, minería, agricultura e industria \| FUNDIGSAC (57) | (actual, 132) |
| `/industrias/saneamiento` | Hierro dúctil para agua potable y saneamiento \| FUNDIGSAC (57) | Válvulas de compuerta, marcos y tapas, tuberías y acoples de hierro dúctil para redes de agua potable, alcantarillado sanitario y plantas de tratamiento. (153) |
| `/industrias/mineria` | Componentes de hierro dúctil para minería \| FUNDIGSAC (53) | (actual, 150) |
| `/industrias/agricultura` | Válvulas y tuberías HDPE para riego agrícola \| FUNDIGSAC (56) | (actual, 123) |
| `/nosotros` | Quiénes somos: empresa peruana de hierro dúctil \| FUNDIGSAC (59) | (actual, 132) |
| `/contacto` | Contacto y cotizaciones en Lima \| FUNDIGSAC (43) | Contacta al equipo técnico-comercial de FUNDIGSAC en el Cercado de Lima: teléfono y WhatsApp +51 908 849 664, correo cotizaciones@fundigsac.com y formulario. (157) |
| `/soluciones` (cuando sea indexable) | (actual, 37) | Soluciones en hierro dúctil para redes matrices de agua, alcantarillado y drenaje pluvial, infraestructura vial y conducción en minería e industria pesada. (155) |
| `/recursos` (cuando sea indexable) | (actual, 29) | Catálogo general, fichas técnicas de válvulas, manuales de instalación y planos FUNDIGSAC: consulta su estado de publicación y solicita la documentación. (153) |
| `/cookies` | (actual) | Qué cookies y almacenamiento local usa el sitio de FUNDIGSAC, para qué sirven, cuánto duran y cómo aceptar, rechazar o retirar tu consentimiento. (145) |
| `/eliminar-cuenta` | (actual) | Cómo solicitar la eliminación de tu cuenta FUNDIGSAC y de tus datos personales: qué se borra, qué se conserva por ley y plazos de respuesta (Ley N.° 29733). (156) |

## 8. Rutas que deben ser `noindex` siempre (aunque `SITE_INDEXABLE=true`)

- `/login`, `/registro`, `/recuperar`, `/restablecer` — ya noindex,nofollow ✓
- `/carrito`, `/buscar` (y `?q=`) — ya noindex,follow ✓
- `/cotizar/confirmacion` — ya noindex,nofollow ✓
- `/productos/*/*/visor-3d` — ya noindex,follow ✓
- **`/cotizar` y `/cotizar?producto=*` — hoy NO: añadir noindex,follow y sacar del sitemap**
- 404 / `not-found` — ya ✓
- `/terminos-b2b` mientras diga «Documento en preparación» — ya ✓
- Cualquier host ≠ `fundigsac.com` (`*.vercel.app` de producción y previews, `www`, dominios de rama) — **vía `X-Robots-Tag`**
- `/api/*` — `Disallow: /api/` en robots
- Hasta validar contenido (condicional, no permanente): `/productos/valvulas/valvula-mariposa`, `/productos/tuberias/tuberia-tyton`, `/productos/marcos-y-tapas/marco-tapa-d400`, `/recursos/detalle-tecnico`, `/soluciones`, `/soluciones/redes-matrices`, `/recursos` (o enlazar en él las 3 fichas PDF ya publicadas). Opcional: `/eliminar-cuenta` (procedimental).

## 9. Parches propuestos (mínimos)

```ts
// src/shared/config/env.ts
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true" && process.env.VERCEL_ENV !== "preview";
```

```ts
// next.config.ts — headers(): primera entrada
{ source: "/:path*", missing: [{ type: "host", value: "fundigsac\\.com" }], headers: [{ key: "X-Robots-Tag", value: "noindex" }] },

// next.config.ts — redirects(): añadir al existente
{ source: "/contactanos", destination: "/contacto", permanent: true },
{ source: "/shop", destination: "/productos", permanent: true },
{ source: "/product-category/valvulas-hierro-ductil", destination: "/productos/valvulas", permanent: true },
{ source: "/product/valvula-compuerta-bridada", destination: "/productos/valvulas/valvula-compuerta", permanent: true },
{ source: "/product/:slug", destination: "/productos/valvulas", permanent: true },
{ source: "/cart", destination: "/carrito", permanent: true },
{ source: "/checkout", destination: "/cotizar", permanent: true },
{ source: "/my-account", destination: "/login", permanent: true },
{ source: "/libro-de-reclamos", destination: "/reclamaciones", permanent: true }, // y borrar src/app/libro-de-reclamos
{ source: "/wp-sitemap.xml", destination: "/sitemap.xml", permanent: true },
```

```ts
// src/shared/seo/metadata.ts (nuevo helper)
import type { Metadata } from "next";
import { SITE } from "@/shared/config/site";

const OG_BASE = {
  type: "website",
  locale: "es_PE",
  siteName: SITE.name,
  images: [{ url: "/og/fundigsac-1200x630.jpg", width: 1200, height: 630, alt: "FUNDIGSAC — componentes de hierro dúctil" }],
} satisfies NonNullable<Metadata["openGraph"]>;

export function pageMetadata(o: { path: string; title: Metadata["title"]; description: string; index?: boolean }): Metadata {
  return {
    title: o.title,
    description: o.description,
    alternates: { canonical: o.path },
    openGraph: { ...OG_BASE, url: o.path },
    ...(o.index === false ? { robots: { index: false, follow: true } } : {}),
  };
}
// layout.tsx:24 → openGraph: OG_BASE (sin url)
```

```ts
// src/app/page.tsx
export const metadata: Metadata = { alternates: { canonical: "/" } };
```

```ts
// src/app/robots.ts
const PRIVATE = ["/api/"];
```

```ts
// src/modules/catalog/registry.tsx — ProductEntry
indexable: boolean; // solo fichas con datos validados
seoTitle?: Metadata["title"]; // p. ej. { absolute: "Válvula de compuerta FUNDIGSAC con garantía extendida" }
// sitemap.ts
...PRODUCTS.filter((p) => p.indexable).map((p) => `/productos/${p.category}/${p.slug}`),
// [producto]/page.tsx generateMetadata
return { title: product.seoTitle ?? product.name, description: product.description, alternates: { canonical: path },
  ...(product.indexable ? {} : { robots: { index: false, follow: true } }) };
```

```ts
// src/app/layout.tsx:41-42 (JSON-LD)
{ "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE.url}/#organization`, name: SITE.name,
  legalName: SITE.registeredName, taxID: SITE.ruc, url: SITE.url, logo: `${SITE.url}/brand/fundigsac.svg`, email: SITE.email,
  telephone: site.phone, address: { "@type": "PostalAddress", streetAddress: "Jirón Pacasmayo Mz. E Lt. 12",
  addressLocality: "Cercado de Lima", addressRegion: "Lima", addressCountry: "PE" } },
{ "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE.url}/#website`, name: SITE.name, url: SITE.url,
  inLanguage: "es-PE", publisher: { "@id": `${SITE.url}/#organization` } },
```
