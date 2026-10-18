# Revisión de arquitectura y seguridad · FUNDIGSAC frontend

Fecha: 2026-10-17 · Repo: `/Volumes/Programas/FundigSac/frontend` (HEAD `09a8d7c`, Next 16.4.2, React 19.3.1) · Producción: https://fundigsac-web.vercel.app
Modo: solo lectura (ningún archivo del repo editado; `tsc` actualizó `tsconfig.tsbuildinfo`, que está en `.gitignore`).
Evidencias y scripts: `scratchpad/arch/` (`import-graph.mjs` + `graph.json`, `deps-usage.mjs` + `deps.txt`, `css-usage.mjs`, `deadcode.txt`, `tsc.out`, `eslint.out`, `eslint-fixed.out`).

---

## 1. Comprobaciones pedidas

### `node_modules/.bin/tsc --noEmit`
- **exit 0, 0 errores** (29 s). Sin diagnósticos.

### `node_modules/.bin/eslint .`
- **exit 1 · `✖ 2969 problems (182 errors, 2787 warnings)`** (59 s).
- Reparto: `legacy/mirror` 182 errores (175 `@typescript-eslint/no-this-alias`, 7 `no-require-imports`) + 2564 avisos (JS minificado del WordPress espejo, versionado: 365 archivos);
  `.agents/skills` 111 avisos; `.claude/skills` 111 avisos; `tests/e2e/content.spec.ts:20:7` 1 aviso (`'cards'` sin usar).
- **`src/`: 0 problemas.**
- Consecuencia: `.github/workflows/verify.yml:20` ejecuta `pnpm lint` → el job de CI falla siempre en lint y nunca llega a unit/build/e2e.
- Durante la revisión apareció `.next-audit/` (build de otro proceso con `NEXT_DIST_DIR`); `.gitignore` lo excluye pero la config plana de ESLint no lee `.gitignore`, así que una segunda pasada dio `✖ 9691 problems (770 errors, 8921 warnings)` casi todos en `.next-audit/build/**` (`eslint-fixed.out`).
- **Con los ignores propuestos** (`--ignore-pattern 'legacy/**' --ignore-pattern '.agents/**' --ignore-pattern '.claude/**' --ignore-pattern '.next-*/**'`, sin tocar la config): `✖ 1 problem (0 errors, 1 warning)` → **exit 0** (`eslint-fixed2.out`).

---

## 2. Hallazgos — Seguridad

| ID | Prioridad | Tipo | Archivo:línea | Problema | Corrección propuesta (diff mínimo) |
|---|---|---|---|---|---|
| S1 | P1 | abuso / coste | `src/app/api/chat/route.ts:20,58` · `src/modules/assistant/limits.ts:55-69` · `src/shared/security/request-guard.ts:16-19` | El único freno del chat público es un limitador **en memoria por instancia** (8/min, 40/10 min por IP). `isSameOriginRequest` deja pasar peticiones sin `Origin` ni `Sec-Fetch-Site` (curl). Con `claude-opus-5-5` ($4/$20 por MTok), una petición al máximo (40 000 caracteres ≈ 10-13 k tokens de entrada + 4 096 de salida) cuesta ≈ $0,13; 240 pet./h por IP **y por instancia**; con varias IP o instancias no hay techo. | Sin código: regla de *Rate Limiting* del Vercel Firewall sobre `POST /api/chat` (global, p. ej. 20/10 min por IP) y **tope de gasto** del workspace/clave en la Console de Anthropic. Opcional: `LIMITS.perTenMinutes: 20`, `maxMessages: 30`. (La elección de modelo es decisión de negocio.) |
| S2 | P1 | suplantación de contenido / dato falso | `src/app/cotizar/confirmacion/page.tsx:16-18` (+ textos `src/screens/w24.tsx`) | Sin BD, cualquier folio con forma válida se presenta como real. **Verificado en producción**: `/cotizar/confirmacion?ref=COT-2026-123456` muestra «Registro confirmado», «Solicitud registrada» y «El sistema asignó este folio al guardar la solicitud». Permite enlaces engañosos bajo el dominio y contradice la regla de no inventar datos. | `import { PENDING_QUOTE_REFERENCE } …` y `const lead = ref === PENDING_QUOTE_REFERENCE ? { … } : null;` (cualquier otro folio → «No hay una solicitud registrada»). Volver a `isLeadReference` cuando exista BD. |
| S3 | P1 | CSP incoherente con lo que se carga | `next.config.ts:13` (comentarios `:6-8`, `:20`) | `@google/model-viewer` importa el `MeshoptDecoder` de three, que compila WASM al evaluarse. **Verificado en producción** al pulsar «Ver en 3D» en `/productos/valvulas/valvula-compuerta`: `Uncaught (in promise) CompileError: WebAssembly.instantiate(): … violates … "script-src 'self' 'unsafe-inline'"` (chunk `1y9cy00vwulrk.js:414`). Hoy el modelo se ve porque los GLB no usan `EXT_meshopt_compression`, pero en dev no se nota (`'unsafe-eval'`) y en prod fallaría en cuanto se compriman los GLB (el repo ya usa meshoptimizer en `scripts/valve3d/build.mjs`). Además el comentario dice que draco/basis se sirven desde el sitio (no existen en `public/`; model-viewer apunta a gstatic) y menciona un «script anti-flash» que ya no existe y `docs/qa/SECURITY_REVIEW.md` (no existe). | `` `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}` `` (solo permite compilar WASM, no `eval`). Corregir comentarios; si algún día se usan Draco/KTX2, autoalojar decodificadores y fijar `dracoDecoderLocation`/`ktx2TranscoderLocation`. |
| S4 | P2 | canal de sistema con dato del cliente | `src/modules/assistant/limits.ts:49-53` · `src/modules/assistant/prompt.ts:41-44` · `route.ts:100` | `page` (del cuerpo) se inserta en un mensaje `role: "system"`. Filtrado a `[A-Za-z0-9/_\-?=&.%]` y 160 caracteres: no hay espacios, pero cabe texto tipo `/IGNORE_RULES_…`. Riesgo bajo (prompt y conocimiento son públicos). | Opcional: quitar `%` del conjunto y validar el *pathname* contra rutas conocidas; el test `tests/unit/assistant/assistant.test.ts:73-75` sigue pasando si se conserva la query. |
| S5 | P2 | endurecimiento de sesión | `src/modules/auth/server.ts:11-12,58-75,115-117` | Misma clave HMAC para la cookie de flujo y la de sesión, sin campo de tipo (hoy no hay confusión explotable porque `readSession` exige `name/email` y el callback exige `state`, pero depende de esa casualidad). Cookie sin prefijo `__Host-`. Sesión de 30 días sin revocación (logout solo borra la cookie del navegador). | `sign(secret, { ...data, typ: "session" | "flow" }, …)` y comprobar `typ` en `verify`/`readSession`; nombre `__Host-fundigsac-session` cuando `secure`; valorar `SESSION_MAX_AGE` de 7 días. |
| S6 | P2 | privacidad | `src/shared/consent/map-embed.tsx:42` | `referrerPolicy="no-referrer-when-downgrade"` en el iframe de Google Maps envía la URL completa a Google (la política del sitio es `strict-origin-when-cross-origin`). | Quitar el atributo. |
| S7 | P2 | despliegue | `next.config.ts:80` | HSTS `includeSubDomains` es correcto en `*.vercel.app`, pero al servir el sitio en `fundigsac.com` se aplicará a todos sus subdominios (correo/cPanel del WordPress actual). | Revisar subdominios HTTP antes de migrar el dominio (o quitar `includeSubDomains` hasta entonces). |

### Verificado correcto (sin hallazgo)
- OAuth Google: código + PKCE S256 + `state` + `nonce`; en prod el 303 lleva `code_challenge_method=S256` y `redirect_uri=https://fundigsac-web.vercel.app/api/auth/callback/google`; cookie de flujo `Secure; HttpOnly; SameSite=lax; Path=/api/auth; Max-Age=600`; callback sin cookie → `/login?error=state` y borra la cookie. id_token: `iss`, `aud`, `exp`, `nonce`, `email_verified` comprobados; foto limitada a `*.googleusercontent.com`; `safeNext` bloquea `//`, `\`, controles y `/api/`.
- `X-Forwarded-Host: evil.example` ignorado en prod; `POST /api/auth/logout` con `Sec-Fetch-Site: cross-site` u `Origin` ajeno → 403; `GET` → 405.
- `/api/chat`: `GET` 405, `text/plain` 415, `Sec-Fetch-Site: cross-site` 403, `Origin` ajeno 403, cuerpo inválido 400; límite de 256 KB leyendo el flujo; zod; errores al cliente solo como códigos; logs sin trazas.
- Parámetros de la API de Claude válidos para SDK 0.129.0 (tipos y skill): `role: "system"` al final de `messages` tras un `user` (mensaje de sistema a mitad de conversación, sin beta), `fallbacks: "default"` + `server-side-fallback-2026-07-01`, `thinking: {type:"adaptive"}`, `output_config.effort`. El prompt fijo va con `cache_control` y el contexto variable al final (bien para caché). No se reenvían bloques `thinking`, así que la comprobación de *preserved thinking* no puede dar 400. En un rechazo a mitad de flujo con fallback, el texto continúa en el mismo stream (no se invalida), así que reenviar `text` es correcto.
- Cabeceras en prod idénticas a `next.config.ts` (CSP, HSTS, XFO DENY, nosniff, COOP/CORP same-origin, Permissions-Policy, Referrer-Policy); `poweredByHeader: false`.
- JSON-LD escapa `<`; único `dangerouslySetInnerHTML`. Markdown del asistente sin HTML y con lista blanca de enlaces (https + hosts concretos, rutas internas, mailto/tel). Todos los `target="_blank"` llevan `rel`.
- Sin `NEXT_PUBLIC_*`; variables de servidor usadas: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `AUTH_URL`, `ANTHROPIC_API_KEY`, `CHAT_MODEL`, `CHAT_EFFORT`, `SITE_INDEXABLE`, `NEXT_DIST_DIR`. `git grep`/`git log -S` sin patrones de claves (`sk-ant-`, `GOCSPX-`, `AIza…`, claves privadas).

---

## 3. Hallazgos — Arquitectura / funcional

| ID | Prioridad | Tipo | Archivo:línea | Problema | Corrección propuesta |
|---|---|---|---|---|---|
| A1 | P0 | funcional (embudo roto) | `src/modules/leads/actions.ts:8-15` · `src/modules/leads/lead-form.tsx:36-43` · `src/screens/w16.tsx:50` · `src/screens/w17.tsx:75` | `/cotizar` es el destino del carrito («Solicitar cotización»), de las fichas y del asistente. La server action valida y **descarta**; el cliente hace `form.reset()` y navega a una confirmación que dice «Solicitud no guardada… Vuelve a enviarla cuando el servicio esté disponible». La pantalla no ofrece reenviar por correo/WhatsApp (dice «No se muestra correo, teléfono ni persona de atención»; solo el pie global tiene el correo), los datos ya se borraron y no hubo aviso previo («Enviar solicitud» → «Enviando solicitud…»). El carrito no pasa sus productos al formulario. | En `LeadForm`, si `result.ok && result.reference === PENDING_QUOTE_REFERENCE`: no resetear ni navegar; construir el texto desde el `FormData` (excluyendo `website`, `_*`, `$ACTION*`) y mostrar el mismo panel «listo para enviar» de contacto (mailto `SITE.email` / WhatsApp `site.whatsappNumber` / copiar, con `mailtoUrl`/`whatsappUrl` de `_legal/claim-message.ts`). Añadir una línea de aviso junto al botón en W16/W17. |
| A2 | P1 | CI | `eslint.config.mjs:8` · `.github/workflows/verify.yml:20` | `pnpm lint` falla (182 errores en `legacy/mirror`, versionado) → la CI no ejecuta unit/build/e2e. | `globalIgnores([".next/**", ".next-*/**", "node_modules/**", ".node_modules_failed_install/**", "docs/**", "legacy/**", ".agents/**", ".claude/**"])`. Verificado con `--ignore-pattern`: 0 errores, 1 aviso, exit 0. |
| A3 | P1 | UI engañosa | `src/modules/access/access-forms.tsx:16-23,279-299,346-360` · `src/modules/access/access-copy.ts:32,135-136,146-147` | `/recuperar` y `/restablecer` simulan el envío (`useFakeSubmit`) y muestran «Revisa tu correo… recibirás un enlace» y «¡Contraseña actualizada!», con solo una nota pequeña de «Vista previa». El panel promete «Enlace seguro: válido por 30 minutos y de un solo uso». Solo existe acceso con Google. | Sustituir los bloques `status === "done"` por `<SoonNotice t={t} />` (como en login/registro) o retirar esas dos rutas y el enlace «¿Olvidaste tu contraseña?»; quitar la promesa del enlace de 30 min. |
| A4 | P1 | cumplimiento / honestidad | `src/app/_legal/claim-form.tsx:366-369` · `src/app/_legal/copy.ts:394,444` · `src/app/reclamaciones/page.tsx:9` · `src/app/libro-de-reclamos/page.tsx:3` | El Libro de reclamaciones solo prepara un correo/WhatsApp (la UI lo dice tras enviar), pero la página promete «Recibirás una copia de tu hoja de reclamación en el correo que indiques» y la meta description «Recibirás un código de registro». Sin número correlativo ni constancia automática; a validar con asesoría legal (Libro de Reclamaciones virtual). | Ya: corregir los dos textos y el comentario «formulario real con folio». Antes del lanzamiento: backend mínimo (correo transaccional al consumidor y a FUNDIGSAC + correlativo). |
| A5 | P1 | UX / a11y | `src/app/layout.tsx:11,37` · `src/shared/security/source-guard.tsx:14-32` | `SourceGuard` bloquea en todo el sitio el menú contextual (también en campos: pegar, corrector), el arrastre y Ctrl/Cmd+S/U/F12…; su propio comentario admite que no es seguridad. | Borrar el import, `<SourceGuard />` y el archivo. |
| A6 | P2 | deuda (código muerto) | ver §4 | 49 archivos (≈357 KB) sin importadores alcanzables, incluido `src/app/home.css` (31,7 KB). | Borrar; con ellos `tests/unit/catalog/search.test.ts` y `tests/unit/content/library.test.ts`. |
| A7 | P2 | deuda (dependencias) | `package.json` · `next.config.ts:55` · `pnpm-workspace.yaml` | `react-hook-form` y `@hookform/resolvers`: solo en `src/components/quote-form.tsx` (muerto). `@electric-sql/pglite`: 0 imports (solo `serverExternalPackages`). `drizzle-orm@0.45.4` sigue en `minimumReleaseAgeExclude`. `three@0.186.1` está en devDependencies pero se empaqueta en cliente vía model-viewer, cuya peer es `three ^0.183.0` (también en 4.4.0); en prod aparece «RGBELoader has been deprecated». model-viewer 4.3.1 deja `console.log` de depuración («[$updateSource] … BAILING OUT EARLY!»). `zod` sí se usa (`limits.ts`); `@google/model-viewer` sí (`product-3d-viewer.tsx`). | Quitar las tres deps y `serverExternalPackages`; quitar `drizzle-orm` del exclude; mover `three` a `dependencies` fijado a `0.183.x` (probar visor y `scripts/valvula-studio.mjs`). |
| A8 | P2 | documentación | `README.md:4,27-28,37,50,52` · `docs/security/SECURITY_BASELINE.md` · `next.config.ts:6-8,20,56-57` · `.env.example` | README desactualizado: PGlite/Drizzle, `DATABASE_URL`, `BETTER_AUTH_*`, `LEAD_HASH_SECRET`, `src/server/*`, «rate limit, folio → tabla lead_submissions», «24 pantallas» (9 ya no se usan); enlaces rotos `docs/auth/AUTH_SETUP.md` y `docs/content/MISSING_ASSETS.md` (existe `ASSETS_PENDING.md`). `src/server/` solo contiene `.DS_Store`. `SECURITY_BASELINE.md` afirma que no hay CSP/HSTS, endpoints, mapas ni modelos 3D. `outputFileTracingIncludes` de `/reclamaciones` sobra (prerenderizada en el build local). `.env.example` no lista `CHAT_MODEL`, `CHAT_EFFORT`, `SITE_INDEXABLE`. | Reescribir «Variables de entorno», «Estructura» y «Datos y contenido» con lo real (cookie HMAC + Google, sin BD, formularios por correo/WhatsApp, `/cotizar` sin persistencia); actualizar el baseline; borrar la línea 57 de `next.config.ts`; completar `.env.example`. |
| A9 | P2 | manejo de errores | `src/app/error.tsx:7,25` | Usa `reset` (Next 16.3+: `retry` es el estable y vuelve a pedir el segmento; `reset` re-renderiza sin re-fetch, así que un error de servidor se repite). No hay `global-error.tsx` (errores del layout raíz → pantalla genérica). | `({ error, retry }: { error: unknown; retry: () => void })`, `onClick={() => retry()}`, leer `digest` tras `instanceof Error`; añadir `app/global-error.tsx` mínimo con `<html><body>`. |
| A10 | P2 | robustez | `src/modules/leads/lead-form.tsx:35-57` | Si la server action falla (red, *version skew* tras un despliegue), la excepción sube al error boundary y se pierde lo escrito. | `try { … } catch { setState({ status: "error", message: "No se pudo enviar. Revisa tu conexión e inténtalo de nuevo." }); }`. |
| A11 | P2 | ruta huérfana | `src/app/productos/[categoria]/[producto]/visor-3d/page.tsx` · `src/modules/catalog/registry.tsx:29` | `/productos/valvulas/valvula-compuerta/visor-3d` responde 200 con «Visor 3D no disponible / Modelo 3D pendiente», sin enlaces entrantes, y contradice el visor real de la ficha. | `permanentRedirect` a la ficha, o borrar la ruta + `Viewer3D: ScreenW23` + `src/screens/w23.tsx`. |
| A12 | P2 | duplicación barata | `src/app/_landing/floating-actions.tsx:7` · `src/shared/assistant/assistant-copy.ts:10,82,145` · `src/app/_legal/deletion-copy.ts:249,408` | Número de WhatsApp/teléfono repetido fuera de `site` (`src/lib/site-info.ts`). `clean`/`multiline` copiados en `contact-message.ts`, `claim-message.ts`, `deletion-message.ts`; panel «listo para enviar» casi idéntico en `contact-form.tsx:99`, `claim-form.tsx:334`, `deletion-interactive.tsx:398`. `RESOURCE_PAGES` (`recursos/[slug]/page.tsx:10-16`) no coincide con `RESOURCES` (`registry.tsx:41-43`). | Importar `site.whatsappNumber`/`site.phoneHref`; exportar los helpers desde un módulo; (opcional) extraer `<OfflineSendPanel>`. |
| A13 | P2 | restos | `src/app/_legal/claim-form.tsx:45,65-77,255` · `tests/{catalog.test.ts,pages.e2e.ts,responsive.e2e.ts,routes.e2e.ts,smoke.e2e.ts}` · `e2e.config.ts` · `e2e.mirror.config.ts` · `public/fonts/material-symbols-{subset,v2}.woff2` | `Fields` usa `useLeadState()` fuera de `LeadForm` (las ramas success/error nunca se activan). Tests y configs que importan paquetes no instalados (`e2e`, `@e2e-dev/web`) y que ni Vitest (`tests/unit/**`) ni Playwright (`tests/e2e`) ejecutan. Dos fuentes sin referencias (47 KB). | Borrar ramas y archivos. |
| A14 | P2 | contenido | `src/app/_legal/deletion-copy.ts:147-149,236` · `deletion-message.ts:21-26,42-45` · `deletion-interactive.tsx:247-251` · `src/app/contacto/copy.ts:65,75` | Eliminar cuenta ofrece «Inicio de sesión con Facebook» y «Correo y contraseña», y explica cómo quitar la app «FUNDIGSAC» de Facebook: no existen. Llama «código de seguimiento» a una referencia que genera el navegador (no hay seguimiento). Contacto dice «Enviar mensaje / nos comunicaremos contigo» aunque solo prepara un correo/WhatsApp (tras enviar sí lo aclara). | Dejar solo Google y «No tengo cuenta»; «referencia de tu solicitud»; botón «Preparar mensaje». |

Observado de paso (fuera de alcance): avisos de CSS precargado y no usado en `/` y en la ficha; `/contacto` y `/cotizar` son dinámicas solo por `searchParams`.

---

## 4. Código muerto confirmado

Método: `import-graph.mjs` recorre los imports reales (`import`/`export from`, `import()` dinámico incluido `next/dynamic`, `require`, `@import`/`composes` en CSS, alias `@/`) desde todas las entradas del App Router (`page`, `layout`, `route`, `error`, `not-found`, `robots`, `sitemap`) más el `loaderFile` de `next.config.ts`. Después, comprobación manual con `grep -rn` en `src scripts tests` y en los configs.

Sin ningún importador (`grep` de nombre de archivo y de módulo → 0 resultados fuera del propio archivo):
- `src/components/`: `site-header.tsx`, `site-footer.tsx`, `product-card.tsx`, `product-selection.tsx`, `quote-form.tsx`, `ui/contact-form.tsx`. La cabecera y el pie reales son `src/shared/layout/landing-chrome.tsx`.
- `src/screens/index.ts` (nadie importa `@/screens"`). Las rutas importan `@/screens/wNN` directamente.
- Islas: `w06-configurator`, `w07-actuation`, `w07-configurator`, `w08-attachment`, `w08-configurator`, `w09-form-state`, `w09-variants`, `w13-explorer`, `w16-file-field`, `w17-fields`, `w22-search`, `w23-viewer`.
- `src/shared/ui/products-field.tsx`, `src/modules/resources/library.ts` (solo lo usa `tests/unit/content/library.test.ts`).
- `src/app/home.css` (31,7 KB, 1 352 líneas; `grep "home.css"` → 0).
- `src/screens/islands/06-ficha.module.css` (0 bytes, sin versionar: trabajo ajeno → confirmar antes de borrar).

Solo importados por código muerto:
- `src/screens/w01, w03, w04, w05, w06, w12, w18, w19, w21` (solo desde `screens/index.ts`).
- `islands/w03-line` (w03), `w06-gallery` y `w06-tabs` (w06), `w18-fields` (w18), `w19-toc` (w19).
- `src/modules/products/{frame-d400, pipe-tyton, valve-butterfly, valve-gate, viewer3d}.ts` (configuradores y visor muertos).
- `src/modules/catalog/search.ts` (w22-search y catalog-* muertos; también `tests/unit/catalog/search.test.ts`).
- `src/shared/ui/{catalog-highlight, catalog-url-state, content-scroll-progress, content-scrollspy, doc-link, products-keys}`.

Total: 49 archivos, ≈357 KB. Exports sin uso en archivos vivos: `findCategory` y `findProductBySlug` (`registry.tsx`), `categoryList` y `whatsappLink` (`site-info.ts`), `formatPrice` (solo `product-selection` muerto), `getProduct` (solo un test huérfano).

Sí se usan (respuesta a la pregunta):
- `src/lib/catalog.ts` + `catalog-pdf.ts`: `modules/assistant/knowledge.ts:3` y `components/ui/catalog-card.tsx:5`.
- `src/lib/site-info.ts`: 8 importadores (contacto, eliminar-cuenta, reclamaciones, industrias, carrito, asistente).
- `src/components/ui/{catalog-card, page-hero, reveal, count-up}`: `app/industrias/page.tsx:5-7`.
- `src/components/product-3d-viewer.tsx`: `next/dynamic` en `w06-ficha.tsx:37`.
- `src/styles/pages.css`: lo importan los `components/ui/*` vivos, pero solo 48 de sus 122 clases aparecen en código vivo (69 sin uso, 5 solo en código muerto).
- `src/server/`: vacío (solo `.DS_Store`, sin versionar).

---

## 5. Formularios públicos — qué hacen al enviar

| Formulario | Validación cliente | Validación servidor | Qué hace al enviar | ¿Lo comunica? |
|---|---|---|---|---|
| Contacto (`app/contacto/contact-form.tsx`) | HTML5 (required, email, pattern tel, maxLength 1000) | — (no hay envío) | Arma el texto y ofrece mailto (`SITE.email`), WhatsApp y copiar | Sí, tras enviar («Tu mensaje está listo para enviar… queda registrada cuando recibimos el mensaje»). Antes: «Enviar mensaje / nos comunicaremos contigo» (A14) |
| Cotizar W16/W17 (`LeadForm` → `submitLead`) | HTML5 | `validateLead` (obligatorios, email, RUC 11 dígitos, teléfono, 60 campos, 4000 caracteres, sin archivos) | **Descarta**; `form.reset()`; confirmación «Solicitud no guardada» sin alternativa | Solo después de perder los datos (A1, P0) |
| Confirmación `/cotizar/confirmacion` | — | regex de folio | Cualquier folio válido ≠ marcador → «Registro confirmado» | Falso (S2) |
| Reclamaciones (`_legal/claim-form.tsx`, modo offline) | HTML5 + reglas por tipo de documento | — | mailto/WhatsApp/copiar con la hoja (Anexo I) | Sí tras enviar; promesas falsas en la página (A4) |
| Eliminar cuenta (`_legal/deletion-interactive.tsx`) | HTML5 (minLength, email, confirmación) | — | mailto/WhatsApp con referencia `ELIM-AAAAMMDD-XXXX` generada en el navegador | Sí; ofrece métodos inexistentes (A14) |
| Login / Registro (`modules/access`) | Propia (email, fuerza de contraseña) | — | Simula 900 ms → «La zona de clientes llega muy pronto» | Sí |
| Recuperar / Restablecer | Propia | — | Simula éxito: «Revisa tu correo», «¡Contraseña actualizada!» | No (A3) |
| Google | — | OAuth completo | Inicio de sesión real (cookie firmada) | Sí |

---

## 6. CSP frente a lo que carga el sitio

| Recurso | Directiva | Estado |
|---|---|---|
| Iframe de Google Maps (`https://www.google.com/maps/embed?pb=…`, solo con consentimiento) | `frame-src https://www.google.com` | OK |
| Foto de perfil de Google (`lh*.googleusercontent.com`) | `img-src https://*.googleusercontent.com` | OK |
| Fuentes (`next/font` autoalojadas + `/fonts/material-symbols-v3.woff2`) | `font-src 'self' data:` | OK |
| GLB/HDR/PNG del visor (mismo origen, texturas por URI relativa) | `connect-src 'self'`, `img-src 'self' blob:` | OK (si un GLB llevara texturas embebidas, three usaría `fetch(blob:)` y haría falta `connect-src blob:`) |
| WASM de MeshoptDecoder (model-viewer → three) | `script-src` sin `'wasm-unsafe-eval'` | **Bloqueado en prod** (S3) |
| Decodificadores Draco/KTX2 (por defecto, gstatic) | — | No se usan con los GLB actuales; el comentario de la CSP es incorrecto |
| `/api/chat` (SSE) y `/api/auth/*` | `connect-src 'self'` | OK |
| Google OAuth | enlace `<a href="/api/auth/google">` → 303 (no es form) | OK con `form-action 'self'` |
| Scripts inline de Next / JSON-LD | `'unsafe-inline'` | Aceptado y documentado; nonces exigirían render dinámico |

---

## 7. error.tsx / not-found / rutas dinámicas
- `productos/[categoria]/[producto]`, `…/visor-3d`, `recursos/[slug]`, `soluciones/[slug]`: `dynamicParams = false`, `generateStaticParams` y `notFound()` correctos. En prod: ficha inexistente 404, recurso inexistente 404, visor de otro producto 404.
- `not-found.tsx`: `noindex` y vista diferida (no carga `legal.css` en todo el sitio).
- `error.tsx`: no muestra detalles técnicos (solo `digest`), pero usa `reset` y falta `global-error.tsx` (A9).

---

## 8. Resultado del lint con los ignores propuestos
```
$ eslint . --ignore-pattern 'legacy/**' --ignore-pattern '.agents/**' --ignore-pattern '.claude/**' --ignore-pattern '.next-*/**'
/Volumes/Programas/FundigSac/frontend/tests/e2e/content.spec.ts
  20:7  warning  'cards' is assigned a value but never used  @typescript-eslint/no-unused-vars
✖ 1 problem (0 errors, 1 warning)
exit=0
```

## 9. Comandos y peticiones a producción (todas inocuas)
- `curl -I /`; `GET/POST /api/chat` con 405/415/403/400 (sin cuerpo válido, sin llamar a la IA); `GET /api/auth/session`; `POST /api/auth/logout` cross-site (403); `GET /api/auth/google` (303, valores sensibles redactados) incluido `X-Forwarded-Host` falso; `GET /api/auth/callback/google` sin cookie; `GET /cotizar/confirmacion?ref=…`; estados de rutas dinámicas.
- Navegador: ficha `/productos/valvulas/valvula-compuerta` + clic en «Ver en 3D» (consola con el error WASM); `/` y `/contacto` en pestaña limpia (sin errores; un aviso de CSS precargado en `/`). No se tocó el banner de cookies.
- Descargado para inspección: el chunk público `1y9cy00vwulrk.js` (1 MB) en este scratchpad.
