# 03 · Rendimiento

Objetivos de referencia: LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1 (datos de campo, p75). **No hay datos de campo** (sin CrUX ni
RUM): todo lo de abajo es laboratorio y así debe leerse.

## Método
1. **Línea base en producción** (Lighthouse 13, `scripts/perf/lighthouse.mjs`, 1 pasada): ver `01-diagnostico.md`.
2. **A/B local en igualdad de condiciones**: la versión original (`09a8d7c`, worktree aparte con su propia instalación) en
   `:3201` y la nueva en `:3200`, ambas `next build` + `next start` en la misma máquina, ejecuciones intercaladas:
   - Lighthouse móvil ×3 (mediana) y escritorio ×1 por ruta (`ab.mjs`).
   - Cargas reales con throttling de DevTools (RTT 150 ms, 1,6 Mbps, CPU 4×, viewport 412×823 DPR 1,75), ×5 por ruta y versión,
     LCP del `PerformanceObserver` (`real.cjs`). Es la medida más fiable de las dos: Lighthouse móvil usa simulación (Lantern)
     y en estas rutas sus resultados salen bimodales (2,2 s / 3,7 s en la misma URL) y no reflejan prioridades de red.

## Resultados: carga real con throttling (mediana de 5)

| Ruta | LCP antes | LCP después | Δ | KB descargados antes del LCP | Elemento LCP |
|---|---|---|---|---|---|
| Ficha válvula FUNDIGSAC | 1916 ms | **1732 ms** | **−184 ms (−10 %)** | 247 → 189 | foto principal |
| `/cotizar` | 1232 ms | **1048 ms** | **−184 ms (−15 %)** | 99 → 91 | imagen del encabezado |
| `/` | 1856 ms | 1820 ms | −36 ms | 189 → 191 | foto del hero |
| `/industrias/agricultura` | 2136 ms | 2092 ms | −44 ms | 270 → 232 | póster del hero |
| `/productos/valvulas` | 1100 ms | 1116 ms | +16 ms (ruido) | 94 → 94 | foto del hero |
| `/productos` | 2060 ms | 2192 ms | +132 ms | 247 → 262 | fondo del hero |

`/productos` sube porque su foto de hero se cambió por otra **sin la marca mal escrita** («FUNDISAC», ver `02`); la nueva pesa
9 KB más. Se probó recomprimirla y solo ahorraba 7 KB a costa de una segunda compresión con pérdida: se dejó como está.

## Resultados: Lighthouse (laboratorio)

| Ruta | Perf móvil (mediana ×3) antes → después | Peso total móvil | Perf escritorio | A11y | BP | SEO* |
|---|---|---|---|---|---|---|
| `/` | 90 → 89 | 1097 → 1026 KB | 99 → 100 | 100 | 100 | 66 → 69 |
| `/productos` | 90 → 89 | 1067 → **903 KB** | 100 | 100 | 100 | 69 |
| `/productos/valvulas` | 98 → 90 (bimodal) | 988 → 887 KB | 99 → 100 | 100 | 100 | 69 |
| Ficha FUNDIGSAC | 87 → 84 | 950 → **775 KB** | 99 → 98 | 100 | 100 | 69 |
| `/industrias` | 93 → 92 | 706 → 635 KB | 100 | 100 | 100 | 69 |
| `/industrias/agricultura` | 90 → 88 | 826 → **695 KB** | 99 | 100 | 100 | 69 |
| `/nosotros` | 91 → 90 | 612 → 551 KB | 100 | 100 | 100 | 69 |
| `/contacto` | 91 → 91 | 525 → 465 KB | 100 → 99 | 100 | 100 | 69 |
| `/cotizar` | 92 → 92 | 452 → 390 KB | 100 | 100 | 100 | 69 |

CLS 0 y TBT ≤ 7 ms en todas las ejecuciones de ambas versiones. *SEO 66–69 por el `noindex` intencional (ADR-001).

**Lectura honesta:** el peso descargado baja en todas las rutas (−6 % a −18 %) y el LCP real con throttling baja donde se
actuó (ficha y cotizar −184 ms). El LCP **simulado** de Lighthouse no mejora en local: su modelo reparte el ancho de banda
sin tener en cuenta `fetchPriority` y cuenta como crítico todo lo descargado antes del LCP observado, que en un servidor
local sin CDN es casi instantáneo. Las cifras locales de Lighthouse (LCP 3,3–4,5 s) no son comparables con las de producción
(Vercel con CDN: 2,1–3,6 s en la línea base). La confirmación final debe hacerse en una vista previa de Vercel y,
sobre todo, con datos de campo.

## Cambios aplicados
| Commit | Cambio | Efecto medido |
|---|---|---|
| `c7f3724`, `5875fbe` | LCP con `loading="eager"` + `fetchPriority="high"` (en Next 16 `priority` está obsoleto y no sube la prioridad); ficha, galerías w07–w09, 404, `/cotizar` | Ficha −184 ms y `/cotizar` −184 ms (reales) |
| `5875fbe` | Variante de 256 px y `sizes` reales para miniaturas (64–78 px); prioridad baja | −58 KB antes del LCP en la ficha |
| `5875fbe` | `Ø` en lugar de `Φ` en la tabla de bridas: no se descarga la fuente griega (19 KB, prioridad máxima) | −19 KB |
| `5875fbe`, `e732c24` | `sizes` de la foto principal de la ficha y de fotos recortadas acordes al tamaño pintado | Más nitidez (a 1024 px se servía una foto de 640 px para 960 px) |
| `56d936c` | 2.ª válvula del carrusel tras `load`; tarjetas de componentes sin `eager` | −92 KB en la ventana crítica de la portada (A/B del agente: −0,5 s con throttling) |
| `f2793ff` | `sizes` de tarjetas en agricultura y catálogo | Agricultura −131 KB, catálogo −164 KB en total |
| `c43831a` | Sin prefetch de `/login`, `/registro`, `/cookies` | ~100 KB menos tras cada carga |

## Lo que no conviene tocar (análisis del agente de rendimiento)
Fuentes (las dos familias son variables y se usan en el primer pantallazo; recortar pesos no ahorra bytes), polyfills de
Next, `three`/`model-viewer` (ya fuera del primer load: solo con «Ver en 3D»), `sizes="100vw"` de heroes a ancho completo,
calidad de las fotos LCP, `LazyWarmup`, `content-visibility` para diferir imágenes (probado: no evita descargas).

## Siguientes pasos (P2, en `06-pendientes.md`)
Activar Vercel Speed Insights/RUM; separar textos del layout del primer chunk; `/api/auth/session` en reposo; servir
`/productos`, `/contacto`, `/cotizar` y `/buscar` estáticas leyendo los parámetros en cliente; quitar la animación de entrada
de la foto LCP de la ficha.

## Reproducir
```bash
node scripts/perf/lighthouse.mjs                       # producción
node scripts/perf/lighthouse.mjs --base http://127.0.0.1:3000 --routes /,/productos
```
Los scripts A/B (`ab.mjs`, `real.cjs`) y los JSON de resultados están en `informes/` (copia de la sesión).
