# 04 · SEO técnico

Base: Google Search Central y la API de metadatos de Next 16 (`node_modules/next/dist/docs/`).
El sitio sigue **`noindex` a propósito** (ADR-001) hasta que se active `SITE_INDEXABLE=true`. Este trabajo deja todo listo para
ese momento sin cambiar la decisión.

## Dominio canónico e indexabilidad

- Canónico: `https://fundigsac.com` (`src/shared/config/site.ts`). Hoy ese dominio aún sirve el WordPress antiguo.
- `fundigsac-web.vercel.app` y las URLs de despliegue **nunca** se indexan: cabecera `X-Robots-Tag: noindex` en todo host que
  no sea `fundigsac.com` o `www.fundigsac.com` (`next.config.ts`), y `SITE_INDEXABLE` es siempre falso en vistas previas de
  Vercel (`VERCEL_ENV=preview`, `src/shared/config/env.ts`).
- `robots.txt`: con indexación activa solo bloquea `/api/`. Las páginas privadas (buscar, confirmación, carrito, acceso)
  llevan su propio `noindex`; bloquearlas en robots impediría que Google lo vea.
- `sitemap.xml`: excluye las pantallas de referencia sin validar y `/recursos/detalle-tecnico`.

### Siempre `noindex` (aunque se active la indexación)
`/login`, `/registro`, `/recuperar`, `/restablecer`, `/carrito`, `/buscar`, `/cotizar/confirmacion`, la 404,
`/terminos-b2b` (en preparación), las fichas de referencia `valvula-mariposa`, `tuberia-tyton`, `marco-tapa-d400`
(`indexable: false` en `src/modules/catalog/registry.tsx`) y `/recursos/detalle-tecnico`.

## Cambios de metadatos

| Ruta | Antes | Después |
|---|---|---|
| `/` (por defecto) | «FUNDIGSAC \| Hierro dúctil · Saneamiento e Infraestructura», descripción 113 car., sin canonical | «Válvulas, tuberías y tapas de hierro dúctil \| FUNDIGSAC» (55), descripción 148 car., canonical `/` |
| `/productos` | «Catálogo general de productos», desc. 74 | «Catálogo de válvulas, tuberías, marcos y tapas», desc. 157 |
| `/productos/valvulas` · `tuberias` · `marcos-y-tapas` | Descripción = nota interna «Familia de referencia visual…» (×3) | Títulos con el tipo de producto y descripciones tomadas de las tarjetas de cada página |
| Fichas FUNDIGSAC (×2) | Mismo título y descripción con marca duplicada | Títulos propios (`absolute`): «…DIN 3352 F4, DN50–DN600» y «…con garantía extendida» |
| Sectores | «Saneamiento», «Minería», «Agricultura» | «Hierro dúctil para agua potable y saneamiento», «Componentes de hierro dúctil para minería», «Válvulas y tuberías HDPE para riego agrícola» |
| `/contacto` | «Contacto», desc. 103 | «Contacto y cotizaciones en Lima», desc. con teléfono y correo reales |
| `/cotizar`, `/cookies`, `/eliminar-cuenta`, `/reclamaciones` | Descripciones fuera de 120–160 car. o con promesas inexistentes | Ajustadas (la de reclamaciones prometía un «código de registro» que no existe) |

Todos los textos salen del contenido ya publicado en cada página (verificado por grep); no se inventaron datos ni palabras clave.
«Accesorios hidráulicos» no aparece en el sitio: no se usó.

## Redes sociales
- `src/app/opengraph-image.jpg` y `twitter-image.jpg` (1200×630) compuestas con la foto oficial del hero, la válvula FUNDIGSAC y el
  logo (`scripts/build-og-image.mjs`), con texto alternativo. Tarjeta `summary_large_image`.
- `og:url` ya no se hereda: antes todas las páginas declaraban la URL de inicio.

## Datos estructurados
- `Organization` con razón social real (`legalName`: Fundición y Desarrollo de Ingeniería y Gestión S.A.C.), RUC, teléfono,
  dirección y `@id`. `WebSite` sin `SearchAction` (apuntaba a `/buscar`, `noindex`; Google retiró ese cuadro en 2024).
- `BreadcrumbList` existente en categorías y fichas; las fichas siguen como `WebPage` (sin `Product`: no hay precio ni stock y
  Google lo exige para resultados enriquecidos). Sin datos ficticios.

## Redirecciones permanentes (308)
WordPress actual → sitio nuevo, para conservar tráfico al migrar el dominio:
`/contactanos`→`/contacto`, `/shop`→`/productos`, `/product-category/valvulas-hierro-ductil`→`/productos/valvulas`,
`/product/valvula-compuerta-bridada`→`/productos/valvulas/valvula-compuerta`, `/product/*`→`/productos/valvulas`,
`/cart`→`/carrito`, `/checkout`→`/cotizar`, `/my-account`→`/login`, `/libro-de-reclamos`→`/reclamaciones` (ahora en un salto).
Además `/productos/*/*/visor-3d` → su ficha (el visor 3D real vive en la ficha).

## Enlaces internos
- Bloques «Válvula de compuerta FUNDIGSAC» de los tres sectores: ahora llevan a la ficha y PDF FUNDIGSAC (antes H-ITALY).
- Agricultura: `?categoria=` no existía; ahora enlaza a `/productos/tuberias` y `/productos/valvulas`.
- Tarjetas sin ficha publicada: «Solicitar ficha» → `/contacto?motivo=documentacion&documento=<producto>` (antes «Ver ficha» a Contacto).
- Los 45 enlaces internos únicos responden 200 (rastreo del agente SEO).

## hreflang
No aplica: el inglés se elige en el navegador sin cambiar la URL. Se documenta para cuando existan rutas `/en/…`.

## Verificación (build de producción local)
`curl` sobre `next start`: `X-Robots-Tag: noindex` en 127.0.0.1, `og:image` 1200×630 con `alt`, `twitter:card`
`summary_large_image`, canonical de la home, fichas de referencia con `noindex, follow`, redirecciones 308 correctas.
Lighthouse SEO sigue en 66–69 por el `noindex` intencional; al activar la indexación en `fundigsac.com` debería subir a ≥ 95
(no medible antes).

## Al activar la indexación (checklist)
1. Apuntar `fundigsac.com` (y `www` → apex) al proyecto de Vercel.
2. `SITE_INDEXABLE=true` solo en Production y redeploy (la variable se lee en build: un rollback a una build anterior vuelve a `noindex`).
3. Verificar Search Console por DNS y enviar `https://fundigsac.com/sitemap.xml`.
4. Decidir si los PDF de `/docs` deben indexarse (hoy no llevan `X-Robots-Tag`).
