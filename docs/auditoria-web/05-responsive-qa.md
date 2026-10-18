# 05 · Responsive y QA

## Matriz responsive (navegador real, Playwright + Chrome 155)
38 rutas × 9 anchos (320, 375, 390, 430, 768, 1024, 1280, 1440, 1920) en español, más inglés a 320/390 y tema oscuro a 390,
y horizontal 844×390 y 1024×768. Medido en producción (= versión original) por el agente responsive.

| Modo | Combinaciones | Antes ✔ / ✘ | Fallos |
|---|---|---|---|
| ES, 38 × 9 | 342 | 339 / 3 | `/nosotros`@320, `/carrito`@320, `/productos/valvulas/valvula-mariposa`@320 |
| EN, 38 × 2 | 76 | 74 / 2 | `/carrito`@320, mariposa@320 |
| Oscuro, 3 rutas @390 | 3 | 3 / 0 | — |

Los tres desbordes se corrigieron: `/nosotros` y `/carrito` (`03edcd1`, columnas `minmax(0, 1fr)` y tarjetas sugeridas que
bajan de renglón) y mariposa (`1b5b123`, el texto «SHOW_CHART» de un icono sin glifo empujaba 40 px). La prueba e2e de
desbordes (`layout.spec.ts`, 320–1440 px) pasa en todas las rutas que cubre.

Corregido además en interacción: menú móvil con fondo bloqueado e inerte, foco que vuelve al botón con Escape y enlaces de
44 px (`aed4b09`); contador del carrusel en una línea a 320 px; separadores del pie; campos de 16 px en pantallas táctiles para
evitar el zoom de iOS (`d01d2b0`); cajón del carrito con foco correcto (`bd9d749`).

Sin cambios (ver `06-pendientes.md`): hero de inicio en horizontal 844×390, botones flotantes que tapan contenido durante el
desplazamiento en ≤ 430 px, pista visual en tablas con desplazamiento horizontal.

## Pruebas ejecutadas (versión final, build de producción local)

| Comando | Resultado |
|---|---|
| `tsc --noEmit` | ✔ sin errores |
| `eslint .` | ✔ 0 errores, 0 avisos (antes: 182 errores y 2787 avisos por carpetas ajenas al código; la CI no pasaba de `pnpm lint`) |
| `vitest run` | ✔ 12 archivos, 108/108 |
| `next build` | ✔ 51 páginas (estáticas salvo `/productos`, `/contacto`, `/cotizar`, `/buscar` y la API) |
| Playwright e2e completa (escritorio + móvil, 458 casos) contra `next start` | ✔ 446 pasan · 12 omitidas (requieren credenciales de Google en `.env.local`) · 0 fallan |

Antes de este trabajo la suite tenía fallos conocidos (W13, W16 y «consola limpia» en `/`): en la versión final pasan.
La única prueba que fallaba al final («cancelar en Google…») dependía de credenciales locales; ahora se omite sin ellas,
igual que las demás del mismo archivo (`fde99ec`).

### Pruebas e2e modificadas (comportamiento cambiado a propósito)
- Cotización: ya no navega a una confirmación vacía; se comprueba el panel «lista para enviar», que el foco llegue a él,
  que el formulario conserve los datos, el contenido del `mailto` y que la trampa anti-bots no viaje en el mensaje.
- Recuperar/restablecer contraseña: se comprueba el aviso «llega muy pronto» y que **no** aparezca el éxito simulado.
- Tarjetas sin ficha: se comprueba «Solicitar ficha» con el enlace prellenado.
- Miniaturas de la ficha: se seleccionan por su grupo accesible (`group` «Fotos de la válvula») en vez de un rol inválido.

## Flujos comprobados a mano en navegador (build de producción local)
- Visor 3D «Ver en 3D» en la ficha FUNDIGSAC: el modelo carga (`load`), sin errores de CSP en consola.
- Cotización general completa con datos ficticios (`qa@example.test`, RUC 20000000001): panel con foco, `mailto` a
  `cotizaciones@fundigsac.com` con todos los campos, URL sin cambiar.
- Cabeceras: CSP con `'wasm-unsafe-eval'`, `X-Robots-Tag: noindex` fuera del dominio canónico.
- Redirecciones 308 del WordPress y del visor 3D.
- Metadatos `og:image`/Twitter, canonical y `noindex, follow` en fichas de referencia.

## Accesibilidad (axe + teclado)
Línea base: 26 de 38 rutas sin violaciones de axe en claro; fallos reales de foco (cajón, diálogos, menús), contraste de
insignias, `lang` e i18n de ARIA. Corregidos en `bd9d749`, `b052f63`, `1384f18`, `913e21f`, `3227afd`, `d028014`
(detalle en `02-mejoras-implementadas.md`). Pendientes P2 en `06-pendientes.md`.

## Regresión visual
Método: 111 capturas de página completa por versión (38 rutas a 1440/390 claro; 11 rutas clave a 1440 oscuro, 768 y 1920) de
la versión original (`09a8d7c`, `:3201`) y la nueva (`:3200`), mismo script determinista (pintado por software, animaciones
congeladas, consentimiento fijado). Ruido entre dos capturas idénticas: 0,0000 %. Diferencia por píxel con sharp.

| Diferencia | Rutas | Clasificación |
|---|---|---|
| 76 % | `…/visor-3d` | Intencional: ahora redirige a la ficha (`2033203`) |
| 53 % (−370 px) | `/terminos-b2b` 1440 | Intencional: sin banda vacía antes del pie (`e732c24`) |
| 8–24 % | ficha mariposa | Intencional: el icono «SHOW_CHART» en texto pasó a icono (`1b5b123`) |
| 5–9 % | `/buscar` | Intencional: fotos de válvula completas (`e732c24`) |
| 7 % | `/productos` (hero) | Intencional: foto sin la marca mal escrita (`b4279ec`) |
| 4–5 % | `/recursos/detalle-tecnico` | Intencional: portada oficial del catálogo (`b4279ec`) |
| 5 % | `/` oscuro (documentación) | Intencional: folleto visible (`1df8c3d`) |
| 5 % | `/carrito` 390 | Intencional: sin desborde (`03edcd1`) |
| 2 % | `/eliminar-cuenta`, `/industrias` oscuro | Intencional: banda navy sólida, nota y tarjeta oscura (`ef84fa9`, `55c901d`) |
| 0,2–1,8 % (−18 px a 390, +4 px a 768) | todas en móvil y tableta | Intencional: pie legal sin separadores huérfanos (`aed4b09`) |
| < 0,5 % | fichas de compuerta, `/nosotros`, cookies, reclamaciones, 404 | Intencional: miniaturas de 256 px, foto más nítida, sin franjas laterales, cifras del 404 sólidas |
| 0 % | `/terminos`, `/privacidad` 1440 y resto de rutas a 1440 claro | Sin cambios |

**Regresiones accidentales: ninguna.** La única diferencia no declarada (botón «Explorar productos» más oscuro en una captura de
la versión original) es el estado `:hover` capturado, no un cambio de estilo. Cabecera, pie, carrusel del hero, paleta,
tipografías, fotos de producto y plantillas legales y de sector siguen idénticos: el sitio sigue siendo reconocible como
FUNDIGSAC.

Evidencias (antes a la izquierda, después a la derecha) en [`capturas/`](capturas/):
`01-productos-hero-marca`, `02-inicio-folleto-oscuro`, `03-recurso-portada-oficial`, `04-mariposa-iconos`,
`05-buscar-fotos-completas`, `06-eliminar-cuenta-banda`, `07-industrias-oscuro`, `08-pie-movil`, `09-carrito-390`.
