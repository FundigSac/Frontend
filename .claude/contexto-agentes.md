# Contexto común para los agentes FUNDIGSAC

Referencia compartida que cada agente debe leer primero.

## Proyecto
- Web corporativa B2B de FUNDIGSAC (hierro dúctil: válvulas, tuberías, marcos y tapas). Catálogo orientado a **cotización**, no tienda.
- Stack: Next.js 16.4 (App Router, `src/app`), React 19.3, TypeScript strict, Tailwind v4 + CSS propio por página
  (`landing.css`, `home.css`, `*.module.css`), Playwright + axe, Vitest, Lighthouse 13.
- **Next 16 tiene cambios incompatibles**: antes de tocar APIs de Next, leer `node_modules/next/dist/docs/` (ver `AGENTS.md`).
- Producción de referencia: https://fundigsac-web.vercel.app (proyecto Vercel `fundigsac-web`). Dominio canónico declarado en
  `src/shared/config/site.ts` → `https://fundigsac.com` (el WordPress antiguo vive aún ahí).
- Indexación: **todo `noindex` a propósito** (ADR-001) mientras `SITE_INDEXABLE !== "true"` (`src/shared/config/env.ts`).
  No cambiar esa decisión: solo dejar el sitio listo para activarla.

## Convenciones
- Tema oscuro: `html[data-lp-theme="dark"]`. Idioma ES/EN en cliente con `useLang()` (`src/shared/layout/landing-prefs.ts`);
  la URL no cambia con el idioma → no hay hreflang posible.
- Cabecera/pie globales: `src/shared/layout/landing-chrome.tsx`. Páginas legales reutilizan `lg-*` (`src/app/_legal/legal.css`).
- Pantallas convertidas de Stitch: `src/screens/wNN.tsx` + `src/screens/islands/*` (componentes cliente).
- Imágenes: loader propio con variantes WebP pregeneradas (`src/shared/media/image-loader.ts`, `scripts/build-image-variants.mjs`).
- Identidad: azul petróleo/celeste corporativo, blanco, gris; logo oficial `public/brand/`; fotos reales de producto.
  Prohibido: estética genérica de IA, gradientes decorativos, efectos recargados, datos comerciales inventados.

## Comandos (disco USB: todo es lento, usar timeouts amplios)
- Tipos: `node_modules/.bin/tsc --noEmit` · Lint: `node_modules/.bin/eslint .` · Unit: `node_modules/.bin/vitest run`
- Dev: `node_modules/.bin/next dev --hostname 127.0.0.1 --port 3101` (varios a la vez: `NEXT_DIST_DIR=.next-x`)
- Build: `node_modules/.bin/next build` · e2e: `PW_BASE_URL=http://127.0.0.1:3101 node_modules/.bin/playwright test`
- Lighthouse: `node scripts/perf/lighthouse.mjs [--base URL] [--routes /,/productos] [--only mobile]` → `.perf/<fecha>/`
- `pnpm` no está en PATH: `npx pnpm@10 …`.

## Coordinación
- El agente principal es el **único** que integra cambios. Los agentes de auditoría son de solo lectura: entregan hallazgos
  con `archivo:línea`, causa y parche propuesto (diff mínimo). No editar archivos del repo salvo que el encargo lo pida.
- Respetar trabajo ajeno sin commit (`git status`). Nunca `git push --force`, nunca desplegar a producción.
- Evidencias (capturas, JSON de Lighthouse) en el scratchpad o en `.perf/` / `test-results/` (ignorados), nunca sueltas en el repo.

## Formato de hallazgo (todos los agentes)
| ID | Prioridad (P0/P1/P2) | Tipo (visual/funcional/perf/SEO/a11y/deuda/inexistente) | Ruta(s) | Archivo:línea | Problema | Causa | Corrección propuesta | Evidencia |
P0 = roto/crítico · P1 = visual/responsive/perf importante · P2 = refinamiento.
