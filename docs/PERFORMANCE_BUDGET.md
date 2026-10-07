# Presupuesto de rendimiento

Objetivos orientativos: LCP ≤ 2.5 s, INP ≤ 200 ms y CLS ≤ 0.1 en datos de campo. Esta entrega **no afirma** cumplirlos sin medición.

- Una sola fuente, Inter Variable, servida por `next/font`.
- Imagen principal con prioridad; demás imágenes optimizadas por `next/image`.
- Sin sliders, vídeos automáticos, 3D descargado ni scripts externos para renderizar la home.
- Componentes de servidor por defecto. Menú, variantes y cotización son componentes cliente.
- Revisar el peso de JS de cliente y tamaño de imágenes en cada cambio de catálogo.
- Medir Lighthouse mobile y desktop sobre build de producción con red representativa antes de publicar.
