import { describe, expect, it } from "vitest";
import { buildClaimMessage, formatClaimDate, mailtoUrl, whatsappUrl } from "@/app/_legal/claim-message";

const FIELDS = {
  tipoReclamacion: "RECLAMO",
  nombresYApellidosRazon: "  María   Pérez Rojas ",
  tipoDeDocumento: "DNI",
  numeroDeDocumento: "12345678",
  correoElectronico: "maria@correo.pe",
  telefonoDeContacto: "+51 987 654 321",
  domicilioLegalOHabitual: "Av. Los Pinos 123, Lima",
  descripcionDelProductoO: "Válvulas",
  fechaDelSuceso: "2026-10-10",
  nDeCotizacionO: "",
  detalleDeLosHechos: "La válvula llegó con la brida dañada.\r\nSe adjuntan fotos por correo.",
  pedidoConcretoOPretension: "Reposición del producto.",
  canalesDeRespuesta: ["Correo electrónico", "WhatsApp"],
};

describe("mensaje del libro de reclamaciones", () => {
  it("arma el asunto y el cuerpo con todos los datos, normalizando espacios", () => {
    const { subject, body } = buildClaimMessage(FIELDS, new Date("2026-10-14T12:00:00"));
    expect(subject).toBe("Reclamo FUNDIGSAC – María Pérez Rojas");
    expect(body).toContain("Tipo de solicitud: Reclamo");
    expect(body).toContain("Fecha de registro: 14/10/2026");
    expect(body).toContain("Documento: DNI 12345678");
    expect(body).toContain("Fecha del suceso: 10/10/2026");
    expect(body).toContain("DETALLE DEL RECLAMO");
    expect(body).toContain("La válvula llegó con la brida dañada.\nSe adjuntan fotos por correo.");
    expect(body).toContain("CANALES DE RESPUESTA: Correo electrónico, WhatsApp");
    expect(body).not.toContain("N° de orden de compra");
  });

  it("distingue la queja y omite el campo opcional solo si está vacío", () => {
    const { subject, body } = buildClaimMessage({ ...FIELDS, tipoReclamacion: "QUEJA", nDeCotizacionO: "F001-000123" });
    expect(subject.startsWith("Queja FUNDIGSAC")).toBe(true);
    expect(body).toContain("DETALLE DE LA QUEJA");
    expect(body).toContain("N° de orden de compra, factura u otro: F001-000123");
  });

  it("formatea fechas y construye enlaces con codificación segura", () => {
    expect(formatClaimDate("2026-01-05")).toBe("05/01/2026");
    expect(formatClaimDate("ayer")).toBe("ayer");
    const url = mailtoUrl("cotizaciones@fundigsac.com", "Reclamo & queja", "línea 1\nlínea 2");
    expect(url).toBe("mailto:cotizaciones@fundigsac.com?subject=Reclamo%20%26%20queja&body=l%C3%ADnea%201%0Al%C3%ADnea%202");
    expect(whatsappUrl("51908849664", "Hola mundo")).toBe("https://wa.me/51908849664?text=Hola%20mundo");
  });
});
