# FUNDIGSAC · Web corporativa B2B (Next.js 16)

Sitio corporativo industrial B2B de FUNDIGSAC (hierro dúctil: válvulas, tuberías, marcos y tapas).
Implementa fielmente las 24 pantallas aprobadas en Google Stitch (W01–W24) más el módulo de autenticación de clientes.

- Arquitectura y decisiones: `../FUNDIGSAC_ADR-001_Arquitectura_Web.md` · Sistema de diseño: `../DESIGN.md`
- Fuente visual: `../stitch_design_system_studio/` (`code.html` + `screen.png` por pantalla). **No se modifica ni se borra.**

## Requisitos
Node.js 24 LTS (probado con 24.14) · pnpm 11 (`corepack enable` o `corepack pnpm …`) · Google Chrome (para QA visual).

> El proyecto vive en un disco externo USB: los primeros arranques, instalaciones y compilaciones son lentos.

## Comandos
```bash
corepack pnpm install --frozen-lockfile     # dependencias (versiones exactas)
node_modules/.bin/next dev --hostname 127.0.0.1 --port 3101   # desarrollo
node_modules/.bin/next build && node_modules/.bin/next start   # producción local
node_modules/.bin/tsc --noEmit              # tipos (strict)
node_modules/.bin/eslint .                  # lint
node_modules/.bin/vitest run                # unitarias
PW_BASE_URL=http://127.0.0.1:3101 node_modules/.bin/playwright test   # e2e (sin PW_BASE_URL construye y arranca :3100)
```
Varios `next dev` a la vez: `NEXT_DIST_DIR=.next-otro node_modules/.bin/next dev --port 31xx`.

## Variables de entorno
Ver `.env.example` y `docs/auth/AUTH_SETUP.md`. Sin `DATABASE_URL` en desarrollo se usa PGlite (Postgres embebido en `.data/pglite`);
en producción `DATABASE_URL` (PostgreSQL), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` y `LEAD_HASH_SECRET` son obligatorios.
`SITE_INDEXABLE=true` habilita indexación (por defecto todo es `noindex`, ADR-001, hasta aprobar contenido real).

## Estructura
```
src/app/               rutas (App Router), metadata, robots, sitemap
src/screens/wNN.tsx    pantallas Stitch convertidas (mantenidas a mano; ver src/screens/README.md)
src/screens/islands/   componentes cliente con las interacciones de cada pantalla
src/modules/*          dominio por módulo (catalog, leads, products, resources, consent, auth)
src/server/*           acceso a datos (Drizzle + PostgreSQL/PGlite), auth
src/shared/*           layout (header/footer/tema), UI compartida (toast, doc-link), SEO
scripts/stitch/        conversor Stitch→JSX, subset de iconos, compat Tailwind v3→v4
scripts/qa/            captura/diferencia visual contra Stitch, comparadores de estilo
docs/                  auditoría Stitch, QA, seguridad, rendimiento, contenido pendiente, auth
```

## Fidelidad a Stitch
El export de Stitch usa Tailwind v3 (CDN) y Material Symbols; el proyecto usa Tailwind v4 (ADR-001). Los tokens se portan 1:1
(`src/app/globals.css`) y se compensan las diferencias v3→v4 (radios, sombras, borde por defecto, `space-*`, orden de utilidades de
tamaño de texto). La paridad se mide con `scripts/qa/capture.mjs` + `scripts/qa/diff.py` (resultados en `docs/qa/results/`).

## Datos y contenido
- Las imágenes de `public/images/stitch/` son las **generadas por Stitch** (referencias visuales). Pendiente: fotografía oficial/licenciada (`docs/content/MISSING_ASSETS.md`).
- No hay precios, stock en tiempo real, pagos ni documentos PDF reales: las descargas se ofrecen "bajo solicitud" hacia el formulario de contacto.
- Formularios públicos → servidor (validación, rate limit, folio) → tabla `lead_submissions`. No hay envío de correo hasta configurar proveedor.
