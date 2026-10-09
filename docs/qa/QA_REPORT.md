# QA report — FUNDIGSAC frontend checkpoint

**Fecha:** 2026-10-09  
**Estado:** implementación local; fidelidad visual pendiente de cierre  
**Servidor:** `http://127.0.0.1:3101/`

## Evidencia ejecutada

| Control | Resultado |
|---|---|
| TypeScript | `node_modules/.bin/tsc --noEmit --pretty false` pasó. |
| ESLint | `node_modules/.bin/eslint src/screens src/shared/layout src/modules/catalog/registry.tsx 'src/app/productos/[categoria]/[producto]/page.tsx' 'src/app/recursos/[slug]/page.tsx'` pasó. |
| Captura comparativa | Las 24 rutas W01–W24 se capturaron contra HTML Stitch a 1440 px. W21 corresponde a la ruta 404 intencional. |
| Diferencia visual | `python3 scripts/qa/diff.py 1440` ejecutado en las 24 rutas. Diferencia de píxeles: 9.12–41.40%; delta de altura: −1139 a +49 px. Las pantallas aún no alcanzan la coincidencia visual requerida. |
| Chrome local / MCP | Inicio a 1440 px: `lang=es-PE`, ancho de documento 1440 px, 10 imágenes cargadas, 0 imágenes rotas y 0 errores de consola. Inspección CDP de Chrome también ejecutada. |
| Assets usados por pantallas | 19 imágenes locales verificadas: 1376–1408 × 768 px y 87–391 KiB cada una. |

## Pendiente

- Corregir las diferencias estructurales visibles frente a Stitch, en especial W10–W15 y revisar W01–W09/W16–W24 después de esos cambios.
- Ejecutar la matriz responsive en 375, 768, 1024 y 1440 px y el chequeo transversal de rutas, imágenes, overflow y accesibilidad.
- No se ejecutaron suite unitaria, E2E ni build de producción en este checkpoint.

## Contenido y publicación

- Especificaciones, cifras, certificaciones, datos de contacto y condiciones comerciales no confirmadas siguen sujetos a validación documental.
- No se desplegó ni se publicó este frontend.
