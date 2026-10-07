# FUNDIGSAC Engineering Rules

FUNDIGSAC es un catálogo industrial B2B.

El WordPress actual es solo una fuente legacy.

Nunca copiar:
- CSS legacy
- HTML de Elementor como código de la nueva aplicación
- PHP
- WooCommerce templates
- shortcodes

Sí conservar como información:
- productos
- contenido empresarial
- fotografías
- documentos
- URLs
- metadata SEO
- información técnica válida

La nueva aplicación debe:
- ser mobile-first
- utilizar TypeScript estricto
- priorizar accesibilidad
- priorizar SEO
- utilizar componentes reutilizables
- evitar dependencias innecesarias
- evitar sobrearquitectura

No inventar especificaciones técnicas ni productos.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
