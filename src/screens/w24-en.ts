import type { Lang } from "@/shared/layout/landing-prefs";

/**
 * Pantalla de confirmación de cotización: los textos están en español en el código y este diccionario da su
 * versión en inglés (clave = el texto en español). Lo que no figura se muestra tal cual.
 */
const EN: Record<string, string> = {
  "Migas de pan": "Breadcrumb",
  Inicio: "Home",
  Cotización: "Quote",
  Confirmación: "Confirmation",
  "Estado de la solicitud": "Request status",
  "Consulta no disponible": "Lookup unavailable",
  "Código de seguimiento": "Tracking code",
  "Pendiente de consulta": "Pending lookup",
  "Estado de atención": "Service status",
  "Sin datos disponibles": "No data available",
  "Nueva solicitud": "New request",
  "Volver al catálogo": "Back to the catalog",
  "Estado del registro": "Record status",
  Tipo: "Type",
  "Fecha de registro": "Registration date",
  "Resumen de la solicitud": "Request summary",
  "Detalles pendientes": "Details pending",
  "Información comercial por confirmar": "Commercial information to be confirmed",
  "Esta consulta muestra el folio, tipo y fecha disponibles. No presenta especificaciones, cantidades ni plazos hasta que esos datos se validen para este registro.":
    "This lookup shows the available reference, type and date. It does not show specifications, quantities or lead times until that data is validated for this record.",
  "Productos o servicios": "Products or services",
  "Detalle asociado al registro pendiente de consulta.": "Detail associated with the record pending lookup.",
  "Cantidades y condiciones": "Quantities and conditions",
  "Por confirmar. No se muestran valores no disponibles.": "To be confirmed. Unavailable values are not shown.",
  "Requisitos técnicos": "Technical requirements",
  "Pendientes de revisión para esta solicitud.": "Pending review for this request.",
  "Documentos adjuntos": "Attached documents",
  "No hay documentos de confirmación disponibles para descargar.": "There are no confirmation documents available to download.",
  "Titular de la solicitud": "Requester",
  "La información del titular no forma parte de los datos disponibles para esta consulta.": "The requester’s information is not part of the data available for this lookup.",
  "Punto de entrega": "Delivery point",
  "Ubicación, transporte y condiciones de entrega por confirmar.": "Location, transport and delivery conditions to be confirmed.",
  "Archivos y comprobantes": "Files and receipts",
  "No disponible para descarga": "Not available for download",
  "Imprimir confirmación": "Print confirmation",
  "Validación de datos": "Data validation",
  "Etapa no disponible": "Stage not available",
  "Revisión técnica y comercial": "Technical and commercial review",
  "Estado pendiente de conexión": "Status pending connection",
  "Respuesta al solicitante": "Reply to the requester",
  "Canal y plazo por confirmar": "Channel and deadline to be confirmed",
  "Siguiente paso": "Next step",
  "Conserva el código de seguimiento. Los canales de atención se mostrarán cuando estén confirmados.": "Keep the tracking code. Service channels will be shown once they are confirmed.",
  "Ir al inicio": "Go to home",
  Comprobante: "Receipt",
  "La confirmación puede imprimirse desde esta página. No hay un PDF separado disponible.": "The confirmation can be printed from this page. There is no separate PDF available.",
  "Canal de seguimiento": "Follow-up channel",
  "Información de contacto pendiente": "Contact information pending",
  "No se muestra correo, teléfono ni persona de atención hasta que FUNDIGSAC confirme esos datos.": "No email, phone or contact person is shown until FUNDIGSAC confirms that information.",
  "No se pudo consultar la solicitud": "The request could not be looked up",
  "No hay una solicitud registrada": "There is no registered request",
  "El servicio de consulta no respondió. Inténtalo de nuevo más tarde.": "The lookup service did not respond. Please try again later.",
  "El folio no está disponible en este enlace. Revisa la dirección o inicia una solicitud.": "The reference is not available on this link. Check the address or start a request.",
  "Pendiente de conexión": "Pending connection",
  "Solicitud registrada": "Request registered",
  "Solicitud no guardada": "Request not saved",
  "Registro confirmado": "Registration confirmed",
  "Solicitud pendiente de conexión": "Request pending connection",
  "Recibimos el formulario, pero el sistema de atención aún no está conectado: ninguna solicitud se guardó. Vuelve a enviarla cuando el servicio esté disponible.":
    "We received the form, but the service system is not connected yet: no request was saved. Please send it again when the service is available.",
  "El sistema asignó este folio al guardar la solicitud. Los detalles del requerimiento y la atención comercial se confirmarán cuando el servicio esté conectado.":
    "The system assigned this reference when saving the request. The requirement details and the sales follow-up will be confirmed once the service is connected.",
  "Sin folio": "No reference",
  "No se generó un folio para seguimiento.": "No reference was generated for follow-up.",
  "Guarda el folio para identificar el registro.": "Keep the reference to identify the record.",
  "Inicia una solicitud para obtener un código de seguimiento.": "Start a request to get a tracking code.",
  "Resumen de partidas": "Summary of items",
  "Documentación técnica": "Technical documentation",
  "La solicitud no se registró en el sistema. La revisión y la atención comercial empezarán cuando el servicio esté conectado.":
    "The request was not registered in the system. Review and sales follow-up will start once the service is connected.",
  "El folio confirma el registro. La revisión, atención comercial y plazos aún no están disponibles en el sistema.":
    "The reference confirms the registration. Review, sales follow-up and lead times are not yet available in the system.",
  "La consulta no contiene un folio registrado. Las etapas de atención se mostrarán cuando haya datos disponibles.":
    "The lookup does not contain a registered reference. Service stages will be shown when data is available.",
  "Consulta de solicitud": "Request lookup",
  "Folio asignado por el sistema": "Reference assigned by the system",
  "Sin folio disponible": "No reference available",
  // Tipos de solicitud (leadKindLabel)
  "Solicitud de cotización": "Quote request",
  "Consulta de contacto": "Contact inquiry",
  "Requerimiento de compra": "Purchase requirement",
  Reclamación: "Complaint",
  Solicitud: "Request",
};

const MONTHS_EN: Record<string, string> = {
  enero: "January", febrero: "February", marzo: "March", abril: "April", mayo: "May", junio: "June",
  julio: "July", agosto: "August", septiembre: "September", setiembre: "September", octubre: "October", noviembre: "November", diciembre: "December",
};

/** "15 de enero de 2026 · 10:45 hrs (PET)" → "January 15, 2026 · 10:45 (PET)". */
function translateDate(es: string): string {
  const m = es.match(/^(\d{1,2}) de (\p{L}+) de (\d{4}) · (\d{2}:\d{2}) hrs \(PET\)$/u);
  if (!m) return es;
  const month = MONTHS_EN[m[2].toLowerCase()];
  return month ? `${month} ${Number(m[1])}, ${m[3]} · ${m[4]} (PET)` : es;
}

export const translate = (lang: Lang, es: string): string => (lang === "en" ? EN[es] ?? translateDate(es) : es);
