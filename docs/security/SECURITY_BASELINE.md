# Baseline de seguridad local

- `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY` y `Permissions-Policy` de mínimo privilegio se configuran en `next.config.ts`.
- No se cargan analítica, cookies opcionales, SDK de mapas, formularios remotos ni modelos 3D.
- Los formularios no transmiten ni guardan valores. No piden datos reales durante QA.
- Ningún secreto se incluye en código, variables `NEXT_PUBLIC_*` o contenido frontend.
- `/cotizar`, `/reclamaciones` y `/privacidad` llevan `noindex`; todas las rutas están `noindex` en esta versión de prototipo.
- HSTS espera a la revisión del dominio/DNS HTTPS y subdominios D-11. La política CSP necesita prueba con hidratación Next y adopción de nonce/hash antes de producción; todavía no se declara configurada.
- `pnpm audit --prod` ejecutado: sin vulnerabilidades conocidas. Versiones fijadas en `package.json` y `pnpm-lock.yaml`; CI queda configurado para typecheck, lint, unit, build y E2E.
- No hay endpoints backend que probar. Validación de headers efectivos, CSP/HSTS, dominio y recepción real siguen pendientes antes de producción.
