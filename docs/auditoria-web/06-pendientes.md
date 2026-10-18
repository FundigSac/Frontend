# 06 · Pendientes y limitaciones

Lo que no se hizo, por qué y qué hace falta. Ordenado por impacto.

## Requieren decisión o datos del dueño

| # | Tema | Situación | Qué hace falta |
|---|---|---|---|
| 1 | **Backend de formularios** (cotizar, contacto, reclamaciones) | Ninguna solicitud se registra en línea. Ahora el sitio lo dice y prepara el mensaje para correo/WhatsApp, pero no hay folio real ni copia automática | Elegir proveedor de correo o base de datos. Para el Libro de reclamaciones (Ley 29571, D.S. 101-2022-PCM) se requiere numeración correlativa y copia al consumidor: validar con asesoría legal |
| 2 | **Unificar el botón primario** | 6 colores, 11 alturas (38–60 px) y radios de 4 a 14 px. Las pantallas Stitch usan azul petróleo `#004257` y el resto naranja `#c94f0a` | Elegir un solo primario (el Design Director propone naranja `#c94f0a`, 52 px, radio 4). Cambia el aspecto de unas 15 pantallas aprobadas |
| 3 | **Tipografía de títulos en pantallas Stitch** | 17 rutas (catálogo, familias, fichas de referencia, `/industrias`, `/soluciones`, `/recursos`, `/cotizar`…) usan Inter en los H1; la portada y los sectores usan Plus Jakarta Sans. H1 de 34 a 67,7 px con 4 pesos | Aprobar `--font-headline-*: var(--font-display)` y una escala única de H1/H2 |
| 4 | **Anchos de contenedor** | Siete bordes de contenido distintos a 1440 px; el catálogo sobresale 32 px respecto del logo | Aprobar un contenedor común `min(1560px, 100% − 2·gutter)` |
| 5 | **Minería frente a sus sectores hermanos** | Hero, H1, eyebrows y espaciados distintos de saneamiento y agricultura | Aprobar que herede la plantilla de sector |
| 6 | **Bloqueo de clic derecho y atajos** (`SourceGuard`) | Lo pidió el dueño. No protege nada (el código se ve con `view-source:`) y estorba: traducir, abrir en pestaña nueva, extensiones de apoyo | Recomendación técnica: eliminarlo. Ya se dejó el menú contextual en campos de formulario |
| 7 | **Traducción al inglés** | 14 pantallas siguen en español con la interfaz en inglés (marcadas con `lang="es"`); las fichas FUNDIGSAC están mezcladas; nombres de producto en español | Textos en inglés aprobados |
| 8 | **Texto justificado sin guiones** | En contacto, nosotros, fichas y legales hay espacios entre palabras de hasta 8× | El dueño pidió «justificado, sin cortar palabras». Alternativa: `hyphens: auto` o alinear a la izquierda |
| 9 | **Menú**: «Grifos» lleva a `/cotizar` y las 4 entradas de «Recursos» van a la misma página | No hay página de grifos ni secciones separadas en recursos | Confirmar si se mantienen o se reducen |
| 10 | **Fotos** | Restos de productos vecinos en los bordes de `featured-*.jpg` (/productos); hero de portada de 1254 px estirado a 1920; fichas de referencia (mariposa, Tyton, D400) con imágenes de Stitch pendientes de validación | Fotografía oficial o recortes aprobados |
| 11 | **Textos de Eliminar cuenta** | Mencionan acceso con Facebook y con contraseña, que no existen | Confirmar el texto legal |

## Técnicos (sin decisión de negocio, no hechos por alcance o riesgo)

### Seguridad
- **Rate limit de `/api/chat`**: el limitador es en memoria por instancia y las peticiones sin `Origin` pasan. Recomendado:
  regla en Vercel Firewall y tope de gasto en la consola de Anthropic.
- El campo `page` que envía el cliente al chat termina en un mensaje de sistema (filtrado a 160 caracteres): validar contra
  rutas conocidas.
- Cookies de sesión: añadir tipo al contenido firmado, prefijo `__Host-` y valorar 7 días en vez de 30.
- HSTS con `includeSubDomains`: revisar subdominios de `fundigsac.com` antes de migrar el dominio.

### Arquitectura y deuda
- **Código muerto**: 49 archivos (~357 KB) sin importadores (pantallas `w01`, `w03`–`w06`, `w12`, `w18`, `w19`, `w21`, varias
  islas, `components/site-header|footer|product-card|quote-form`, `app/home.css`…). No afecta al bundle; borrarlo simplifica
  el mantenimiento. Lista y evidencia en el informe de arquitectura. Se deja para aprobación.
- Dependencias sin uso: `react-hook-form`, `@hookform/resolvers`, `@electric-sql/pglite` (y su `serverExternalPackages`),
  `drizzle-orm` en `pnpm-workspace.yaml`. `three` está en devDependencies y en versión distinta a la que pide
  `@google/model-viewer` (aviso de RGBELoader en consola al abrir el 3D).
- README y `docs/security/SECURITY_BASELINE.md` describen Drizzle/PGlite/better-auth, que ya no existen. `.env.example`
  no lista `CHAT_MODEL`, `CHAT_EFFORT` ni `SITE_INDEXABLE`.
- `app/error.tsx`: en Next 16.3+ se recomienda `retry` (recarga el segmento) y añadir `global-error.tsx`.
- La página `…/visor-3d` quedó inalcanzable (redirección permanente a la ficha); puede borrarse.
- Imágenes en el repo con la marca mal escrita, ya sin uso: `productos1*`, `productos10.jpg`, `catalogo-general-cover.png`,
  `catalogo-general-book.jpg`.

### Rendimiento (P2)
- Separar del chunk del layout los textos del asistente, el banner de cookies y los de la portada (−9/−10 KB br en todas
  las rutas).
- `/api/auth/session` se pide en cada vista: lanzarlo en reposo o solo si hay cookie.
- `landing.css` es global y el 46 % solo lo usa la portada.
- `/productos`, `/contacto`, `/cotizar` y `/buscar` son dinámicas por `searchParams` (TTFB 240–520 ms frente a ~95 ms):
  leer los parámetros en cliente permitiría servirlas estáticas.
- Fondos decorativos de 1200 px en `/productos` móvil (−80 KB con la variante de 640).
- **Sin datos de campo**: activar Vercel Speed Insights o RUM para medir LCP/INP/CLS reales al p75.

### Accesibilidad (P2)
- Formularios de contacto, cotizar, reclamaciones y eliminar cuenta: solo validación nativa (mensajes en el idioma del
  navegador, sin `aria-invalid` persistente). Copiar el patrón de `modules/access/access-fields.tsx`.
- Login/registro: llevar el foco al primer campo con error; asociar el error de términos al checkbox.
- Banner de cookies al final del orden de tabulación; al cerrar «Configurar» el foco vuelve a `<body>`.
- Menú de cuenta con `role="menu"` sin navegación por flechas (la prueba e2e de Google depende de ese rol).
- Animaciones infinitas restantes (Ken Burns del hero, mascota del asistente, portada flotante): sin control de pausa
  (con «reducir movimiento» sí se detienen).
- `/buscar`: los filtros (h2) van antes del h1 en el DOM.

### Responsive (P2)
- `/` en horizontal 844×390: el hero mide 3,1 pantallas.
- Botones flotantes (WhatsApp + asistente) tapan contenido mientras se desplaza en ≤ 430 px (al final de la página no).
- Miniaturas de fichas de referencia con `object-cover` recortan el plano técnico (pantallas fieles a Stitch).
- Tablas técnicas con desplazamiento horizontal sin pista visual.

## Limitaciones de la verificación
- **Laboratorio, no campo**: Lighthouse y trazas simuladas en una sola máquina; no hay CrUX/RUM.
- **Google OAuth** no se probó de extremo a extremo: no hay `.env.local` con credenciales en este equipo. La prueba e2e
  «cancelar en Google» falla por eso (`not_configured` antes que `cancelled`).
- **Asistente con IA**: sin `ANTHROPIC_API_KEY` local responde la guía; no se probó el modo IA.
- Producción (`fundigsac-web.vercel.app`) se actualizó el 2026-10-17 con autorización del dueño. Las mejoras de rendimiento
  se midieron en local; falta confirmarlas con datos de campo.
