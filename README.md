# FUNDIGSAC 2.0

Aplicación pública B2B en Next.js para explorar productos y preparar consultas comerciales. El mirror WordPress se conserva como referencia histórica separada.

## Estado

- Home con cinco accesos visuales a familias y soluciones, sectores y guía de cotización; catálogo con seis familias y 69 fichas, páginas corporativas, contacto y cotizador local.
- Las fichas iniciales del sitio legacy se complementaron con referencias extraídas de los tres PDF. Los nombres, códigos y medidas del catálogo ampliado requieren revisión comercial antes de presentarse como especificaciones definitivas.
- Los precios y el stock de los PDF no se presentan como disponibilidad actual.
- La cotización prepara un mensaje de WhatsApp. El cliente debe enviarlo manualmente.
- Hay un modelo Prisma validado para productos, variantes, cotizaciones y reclamos; no hay todavía conexión a PostgreSQL, identidad, panel administrativo ni registro digital de reclamos.
- La home y las fichas siguen la dirección visual aprobada. El hero y la sección de termofusión usan ilustraciones conceptuales, documentadas en `docs/MEDIA_REVIEW.md`; no se presentan como fotos de un SKU.

## Requisitos

- Node.js 24 LTS
- pnpm 11
- Git

## Instalar y ejecutar

```powershell
cd "C:\Users\Productora Zamar\Downloads\Diego Software\FUNDIGSAC"
pnpm install
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000). El mirror histórico se abre por separado:

```powershell
pnpm legacy:serve
```

Abrir [http://localhost:4173](http://localhost:4173).

## Verificar

```powershell
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:a11y
pnpm build
pnpm exec e2e run --target desktop-chromium,mobile-chromium,tablet-chromium
pnpm db:validate
pnpm db:generate
```

La suite completa incluye Firefox y WebKit. En este Windows faltan dependencias de esos motores; ver [auditoría](docs/REDESIGN_AUDIT.md).

## Referencias y fuentes

- `legacy/mirror/`: copia navegable histórica de WordPress.
- `legacy/html/`, `legacy/screenshots/`, `reports/`: artefactos del crawl.
- `public/media/`: fotografías históricas, recortes de los PDF e ilustraciones identificadas como referencia temporal.
- `src/lib/catalog.ts` y `src/lib/catalog-pdf.ts`: catálogo con fuente por producto.
- `docs/MEDIA_REVIEW.md`: material que requiere reemplazo.
- `scripts/capture-local.ts`: capturas de desktop/mobile que cargan y comprueban todas las imágenes antes de guardarse.
- `docs/BACKUP_PRE_REDESIGN.md`: copia completa previa a los cambios.
- `prisma/schema.prisma`: modelo de datos preparado para la etapa de backend.
- `sources/catalogs/`: destino de los PDF fuente. Los originales recibidos se encuentran en el directorio padre `Diego Software` y no se han modificado.

## Scripts heredados

```powershell
pnpm site:crawl
pnpm site:capture
pnpm site:audit
pnpm legacy:verify
```

No versionar `node_modules`, `.next`, archivos `.env`, secretos ni cachés. El rediseño no utiliza el HTML, CSS ni JavaScript de WordPress en la app nueva.

## Siguiente fase

Validar las variantes y precios con el responsable comercial; obtener imágenes limpias y fichas técnicas; configurar PostgreSQL y desarrollar persistencia, recepción de cotizaciones y reclamos, identidad y administración sobre el modelo preparado. No se deben simular esas funciones con estado local.
