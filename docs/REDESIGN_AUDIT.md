# Auditoría y alcance del rediseño FUNDIGSAC 2.0

## Estado inicial comprobado

- La aplicación Next.js mostraba únicamente una pantalla interna de migración en `/`.
- El sitio visual visitable en `localhost:4173` era un mirror de WordPress, conservado como fuente histórica. No se ha modificado el sitio público.
- Había 10 fichas de válvulas en el mirror y tres PDF de referencia en el directorio padre. Los PDF contienen precios y stock fechados; no equivalen a disponibilidad actual.
- El proyecto ya tenía Git, Next.js, React, TypeScript, Tailwind, Playwright y scripts de crawling.

## Decisiones de esta entrega

- El rediseño vive en la aplicación Next.js (`localhost:3000`). El mirror continúa en `localhost:4173`.
- Una familia HDPE tiene variantes en una sola ficha. Las diez fichas históricas de válvulas se conservan como productos individuales porque aún no hay una matriz fiable de variantes.
- Se publican precios del PDF HDPE solo como referencia histórica y siempre con aviso de confirmación. El acople AGR y la máquina HDL requieren revisión comercial o técnica antes de mostrar un precio.
- Las fotografías originales de válvulas incluyen marca, teléfono y URL impresos en el archivo. Se recortan visualmente en las fichas; los originales quedan intactos y marcados para sustitución.
- La cotización usa una lista local en el navegador y prepara un mensaje contextual para WhatsApp. La persona debe enviarlo manualmente.
- El libro de reclamaciones muestra un canal de contacto real hasta que exista recepción segura y acuse verificable. No se presenta un formulario que simule registrar reclamos.
- La home y la ficha de producto se ajustaron contra los bocetos aprobados: composición del hero, filas compactas, jerarquía técnica, llamada a cotización y galería con la única vista real disponible.
- El esquema Prisma para catálogo, variantes, precios, inventario, cotizaciones, reclamos y auditoría se validó y generó, sin fingir una conexión a base de datos.

## Verificación de esta iteración

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test:unit` y `pnpm db:validate`: correctos.
- E2E Chromium desktop, tablet y mobile: 24 pruebas aprobadas. Incluyen las 23 rutas públicas, imágenes, navegación, búsqueda, cotización y overflow.
- Axe en siete rutas representativas a 390 × 844: cero violaciones tras corregir el contraste del bloque de termofusión.
- Chrome DevTools: la revisión de la consola de `/productos` no mostró errores ni advertencias; las 32 solicitudes observadas respondieron 200 o 304.

## Pendiente para la siguiente etapa

- Importar y validar exhaustivamente todas las familias, variantes, precios y códigos de los tres PDF con revisión humana.
- Fotografía limpia y documentación técnica autorizada para cada producto.
- Backend persistente, PostgreSQL, identidad y panel administrativo. Prisma tiene esquema, pero faltan servidor de base de datos, políticas, secretos y despliegue; no deben simularse con estado local.
- Envío de cotizaciones con número de seguimiento y recepción de reclamos con acuse.
- Medición formal de Core Web Vitals y Lighthouse en entorno de producción o preview representativo.
- Validación Firefox/WebKit en este dispositivo: Playwright reportó DLL de sistema ausentes (`jpeg62.dll`, `brotlidec.dll`) y `spawn UNKNOWN`.
