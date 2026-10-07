# Revisión de contenido a partir de tarifarios

## Alcance y criterio

Se contrastaron las fichas públicas del mirror local con `PRECIO MARZO2026.pdf`, `PRECIOS HDPE TERMO.pdf` y `PRECIO Y STOCK REAL - IMPORTACION 1511.pdf`. Los tarifarios sirven para comprobar nombres comerciales, códigos, medidas y algunas clases nominales; no equivalen a fichas técnicas ni respaldan por sí solos afirmaciones de materiales, sellos, presión de apertura, recubrimientos, certificaciones, rendimiento o garantía.

El tarifario de válvulas corresponde a marzo de 2026. El inventario declara stock de noviembre de 2025 y precios del 15/11/2025; es interno y anterior. El tarifario HDPE indica IGV incluido, pero no muestra una fecha de vigencia en las páginas revisadas. Ninguno de esos importes o existencias se incorpora al sitio. Los importes vacíos o `0.00` no se interpretan como precio ni disponibilidad.

## Cambios editoriales en el mirror

Se reescribieron las descripciones y metadescripciones de diez productos con una explicación propia de cada tipo de válvula, los datos comerciales comprobables y las preguntas necesarias para seleccionar una variante. El texto visible evita prometer stock, entrega inmediata, certificaciones o materiales que las tablas no demuestran. Las medidas de marzo de 2026 son referencias históricas; precio y existencia se confirman al cotizar.

| Página | Dato contrastado | Precaución editorial |
|---|---|---|
| Check Flex | VCFLEX, ISO PN16, DN50–DN300; también fila DN200 PN10 | El sitio decía hasta 24 pulgadas; la lista llega a DN300. |
| Check Swing | VCSW, DN50–DN300; tabla PN16 y fila DN200 PN10 | Confirmar la clase de la variante cotizada. |
| Compuerta acerrojada | VACER para HDPE, ISO PN16, DN50–DN300, tubo OD 63–315 mm | Algunos tamaños tienen precio sin consignar. |
| Compuerta bridada | La tabla tiene una familia bridada ISO PN16 DN50–DN600 | No se pudo confirmar que sea el mismo modelo de esta ficha. |
| Alivio bridada | VDA/VDAINOX, DN50–DN300 | La tabla no prueba materiales, presión de apertura ni mecanismo. |
| Embone Luflex | VEMBO, ISO PN16, DN50–DN300 | El sitio indicaba DN80–DN400; el rango documental es distinto. |
| Flotadora bridada | VFLOT y VFLOTINOX, DN50–DN300 | DN350/DN400 aparecen sin precio; mecanismo/material no detallados. |
| Guillotina | La lista contiene una válvula tipo cuchilla VTCU | No se equipara automáticamente VTCU con el producto web ni se publican sus especificaciones como hechos. |
| Mariposa excéntrica | La lista contiene válvulas mariposa de otros tipos | No se extrapolan medidas ni materiales a la versión excéntrica. |
| Reductora de presión | VRDP hasta DN350 y VRDPINOX hasta DN400 | No se informa rango de regulación ni presión de entrada/salida. |

## Pendientes antes de publicar especificaciones definitivas

- Obtener fichas técnicas vigentes por código/modelo para validar materiales, elastómeros, presión de trabajo y prueba, normas de conexión, recubrimientos, montaje, accionamiento y aplicaciones.
- Confirmar con ventas qué tarifa está vigente, moneda, IGV, condiciones de cotización y existencias actuales. No usar el inventario fechado en noviembre de 2025 como stock vigente.
- Confirmar si la familia bridada VBBH/VBBL corresponde a la ficha publicada como compuerta bridada y qué variantes se comercializan.
- Identificar formalmente si el modelo de mariposa excéntrica o guillotina aparece en otra ficha/lista.
- Revisar el catálogo de accesorios HDPE antes de presentar precios o compatibilidades: sus tablas contienen celdas vacías y valores `0.00`, y no indican vigencia.

## Revisión del contenido general

| Sección | Problema del texto anterior | Cambio en el mirror |
|---|---|---|
| Inicio | Afirmaciones repetidas de «stock permanente», «entrega inmediata», «calidad certificada» y dos cifras distintas de antigüedad (12 y 15 años). | Descripciones concretas de las familias y los datos necesarios para cotizar; se eliminó el segundo dato de antigüedad contradictorio. |
| Promoción | Contador de tiempo para una oferta sin condiciones verificables. | Se presenta como selección de productos destacados y se oculta el contador de la copia visible. |
| Métricas | El mirror mostraba `0` porque la animación de WordPress no completaba el contador. | Se preservan los valores de origen `2,500`, `96`, `120`, `75` y `12` como texto estático. Estos valores proceden del sitio legacy, no de los PDF, y requieren validación del propietario. |
| Nosotros | Párrafos duplicados de Inicio, promesas de inventario y entrega, y texto de misión genérico. | Se distingue la presentación de la empresa, la consulta por piezas especiales y la confirmación de existencias y plazos. |
| Productos | «Shop» en el título, tarjetas de tubería y marcos que llevaban al listado de válvulas y ninguna mención de accesorios HDPE. | Título en español, textos de las tres familias y consulta por Contacto cuando aún no hay ficha individual. Se informa que las listas también incluyen accesorios HDPE. |
| Contacto | «Ponerse en contacto es fácil» y una promesa vaga de respuesta. | Se enumeran los datos útiles para cotizar: producto, medida, presión, cantidad y ciudad. |
| Pie de página | Descripción corporativa genérica y enlaces en inglés. | Resumen más preciso y etiquetas principales en español. |
| Contenido de plantilla | Entrada «Hola, mundo» de WordPress y tarjetas de equipo con nombres/rostros de plantilla. | Se conservan en la copia archivada y se ocultan en la vista pública local hasta contar con contenido auténtico. |

## Cobertura y huecos del catálogo

- `PRECIO MARZO2026.pdf`: además de las diez fichas publicadas, enumera acoples, adaptadores, uniones, bridas, codos, tees, tubería de hierro dúctil, marcos y tapas, medidores y otras familias de válvulas. El sitio actual no tiene fichas individuales para muchas de esas referencias.
- `PRECIOS HDPE TERMO.pdf`: contiene codos de 22,5°, 45° y 90°, tees, tees reducidas, cruces, yees, reducciones, tapones y bridas tipo backing ring. El nuevo texto de Productos permite consultar estas familias sin presentar precios o inventario como vigentes.
- `PRECIO Y STOCK REAL - IMPORTACION 1511.pdf`: registra máquinas de termofusión y electrofusión de PE con especificaciones básicas y cantidades fechadas en noviembre de 2025. No se añadieron productos públicos ni existencias actuales a partir de este documento interno; primero hay que confirmar modelos y oferta vigente.

## Integridad del contenido

La revisión no modifica el sitio público. Se conserva el WordPress como referencia local y los cambios se limitan a la copia del mirror. No se modifican los PDF originales. Los testimonios, métricas, años de operación y textos legales proceden del legacy y no quedan verificados por los tarifarios; requieren confirmación independiente antes de su publicación definitiva.
