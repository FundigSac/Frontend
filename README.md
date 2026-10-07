# FUNDIGSAC 2.0 — baseline de migración

Proyecto para congelar e inventariar el sitio público actual de FUNDIGSAC y preparar una aplicación moderna independiente de WordPress. Esta fase no rediseña el sitio ni implementa catálogo, autenticación, administración o base de datos.

## Requisitos

- Node.js 20.9 o posterior (recomendado: Node 24 LTS).
- pnpm 9 o posterior.
- Git.
- Chromium de Playwright (se instala con el comando de abajo).

## Instalación

```powershell
pnpm install
pnpm exec playwright install chromium
```

## Aplicación nueva

```powershell
pnpm dev
```

Abre <http://localhost:3000>. Verificaciones:

```powershell
pnpm lint
pnpm build
```

## Capturar el sitio legacy (lecturas HTTP públicas)

```powershell
pnpm site:crawl
pnpm site:patch
pnpm site:capture
pnpm site:audit
```

El crawler está limitado al dominio `fundigsac.com`, con máximo de páginas, pausas entre navegaciones y sin enviar formularios ni ejecutar acciones de compra. Ajusta `CRAWL_MAX_PAGES` o `CRAWL_DELAY_MS` solo si necesitas cambiar esos límites.

## Servir y verificar el mirror

```powershell
pnpm legacy:serve
```

Abre <http://localhost:4173>. En otra terminal:

```powershell
pnpm legacy:verify
```

El mirror de Playwright es estático y best-effort. No ejecuta PHP ni reproduce funciones dinámicas de WordPress/WooCommerce. Consulta [docs/MIRROR_LIMITATIONS.md](docs/MIRROR_LIMITATIONS.md).

## Catálogos PDF para una fase posterior

Los tres PDF esperados ya existen en `C:\Users\Productora Zamar\Downloads\Diego Software\`; sus originales no se modificaron ni copiaron. Cuando se inicie esa fase, trabaja con copias en `sources/catalogs/`. La extracción queda pendiente.

## Artefactos

- `legacy/html/`: HTML renderizado de cada página.
- `legacy/mirror/`: páginas y recursos estáticos disponibles localmente.
- `legacy/screenshots/{desktop,tablet,mobile}/`: capturas full-page.
- `legacy/assets/`: inventario de imágenes descargables/observadas.
- `reports/crawl/`: páginas, URLs, imágenes y enlaces detectados.
- `reports/seo/`: CSV SEO actual.
- `reports/network/`: recursos externos/fallos observados.
- `reports/mirror/`: verificación del mirror y logs.
- `docs/`: auditoría y limitaciones.

## Versionado

No versionar `node_modules`, `.next`, `.env*`, caches, temporales, logs grandes ni secretos. Se pueden versionar código, documentos, inventarios pequeños y capturas de referencia razonables. Los artefactos obtenidos del sitio deben revisarse antes del commit por tamaño y contenido.

## Limitaciones conocidas

HTTrack y GNU wget no estaban disponibles en el entorno. El mirror lo genera Playwright a partir de páginas renderizadas y recursos que cargue el navegador. Esto no permite afirmar que se clonó toda la lógica server-side; los límites se documentarán con la verificación.

## Próxima fase recomendada

Revisar inventario, contenido, URLs y capturas con el propietario; confirmar qué rutas deben conservarse y aportar los PDF originales antes de modelar el catálogo nuevo.
