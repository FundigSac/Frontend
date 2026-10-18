# Auditoría web integral · FUNDIGSAC (2026-10-17)

Auditoría y mejora del sitio sobre el código existente (sin reconstruir páginas), con 8 agentes especializados
(`.claude/agents/`) coordinados por el agente principal, que fue el único que integró cambios.

| Documento | Contenido |
|---|---|
| [01-diagnostico.md](01-diagnostico.md) | Stack real, estado de cada página (IMPLEMENTADA / PARCIAL / DEFECTUOSA / PENDIENTE), defectos P0/P1/P2, medición inicial |
| [02-mejoras-implementadas.md](02-mejoras-implementadas.md) | Cada cambio con su commit, problema, solución y archivos |
| [03-performance.md](03-performance.md) | Método y resultados antes/después (carga real con throttling y Lighthouse) |
| [04-seo.md](04-seo.md) | Indexabilidad, metadatos, Open Graph, datos estructurados, redirecciones, checklist para activar la indexación |
| [05-responsive-qa.md](05-responsive-qa.md) | Matriz responsive, pruebas ejecutadas, flujos verificados, regresión visual |
| [06-pendientes.md](06-pendientes.md) | Decisiones que dependen del dueño, deuda técnica, limitaciones reales de la verificación |
| [informes/](informes/) | Informes completos de cada agente y scripts/datos del A/B de rendimiento |

**Estado:** cambios en commits locales de `main`, sin `git push` ni despliegue (requieren autorización).
Los informes de `informes/` citan rutas de evidencias (capturas, JSON) de la carpeta temporal de la sesión, que no se
versiona; las conclusiones y cifras relevantes están copiadas en los documentos 01–06.
