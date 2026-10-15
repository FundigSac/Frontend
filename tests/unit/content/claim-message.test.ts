import { describe, expect, it } from "vitest";
import { buildClaimMessage, formatClaimAmount, formatClaimDate, mailtoUrl, whatsappUrl } from "@/app/_legal/claim-message";

const FIELDS = {
  tipoReclamacion: "RECLAMO",
  nombresYApellidosRazon: "  María   Pérez Rojas ",
  tipoDeDocumento: "DNI",
  numeroDeDocumento: "12345678",
  correoElectronico: "maria@correo.pe",
  telefonoDeContacto: "+51 987 654 321",
  domicilioLegalOHabitual: "Av. Los Pinos 123, Lima",
  tipoDeBien: "PRODUCTO",
  descripcionDelProductoO: "Válvulas",
  montoReclamado: "",
  moneda: "PEN",
  fechaDelSuceso: "2026-10-10",
  nDeCotizacionO: "",
  detalleDeLosHechos: "La válvula llegó con la brida dañada.\r\nSe adjuntan fotos por correo.",
  pedidoConcretoOPretension: "Reposición del producto.",
  medioDeRespuesta: "Correo electrónico",
};

describe("mensaje del libro de reclamaciones", () => {
  it("sigue la estructura de la hoja de reclamación: proveedor, consumidor, bien contratado, detalle y pedido", () => {
    const { subject, body } = buildClaimMessage(FIELDS, new Date("2026-10-14T12:00:00"));
    expect(subject).toBe("Reclamo FUNDIGSAC – María Pérez Rojas");
    expect(body).toContain("HOJA DE RECLAMACIÓN");
    expect(body).toContain("Fecha de registro: 14/10/2026");
    expect(body).toContain("RUC: 20601839281");
    expect(body).toContain("Fundición y Desarrollo de Ingeniería y Gestión S.A.C.");
    expect(body).toContain("1. IDENTIFICACIÓN DEL CONSUMIDOR RECLAMANTE");
    expect(body).toContain("Documento: DNI 12345678");
    expect(body).toContain("2. IDENTIFICACIÓN DEL BIEN CONTRATADO");
    expect(body).toContain("Tipo de bien: Producto");
    expect(body).toContain("Fecha del suceso: 10/10/2026");
    expect(body).toContain("3. DETALLE DE LA RECLAMACIÓN Y PEDIDO DEL CONSUMIDOR");
    expect(body).toContain("Tipo: RECLAMO (disconformidad relacionada con los productos o servicios)");
    expect(body).toContain("DETALLE DEL RECLAMO");
    expect(body).toContain("La válvula llegó con la brida dañada.\nSe adjuntan fotos por correo.");
    expect(body).toContain("MEDIO DE RESPUESTA: Correo electrónico");
    expect(body).toContain("quince (15) días hábiles");
    expect(body).not.toContain("Monto reclamado");
    expect(body).not.toContain("Menor de edad");
    expect(body).not.toContain("N° de orden de compra");
  });

  it("incluye el monto reclamado y el tipo de bien solo en los reclamos", () => {
    const { body } = buildClaimMessage({ ...FIELDS, tipoDeBien: "SERVICIO", montoReclamado: "1500", moneda: "USD" });
    expect(body).toContain("Tipo de bien: Servicio");
    expect(body).toContain("Monto reclamado: US$ 1,500.00");
  });

  it("distingue la queja: atención recibida, sin bien ni monto, y omite el campo opcional solo si está vacío", () => {
    const { subject, body } = buildClaimMessage({
      ...FIELDS,
      tipoReclamacion: "QUEJA",
      lugarDeAtencion: "Atención telefónica",
      montoReclamado: "999",
      nDeCotizacionO: "F001-000123",
    });
    expect(subject.startsWith("Queja FUNDIGSAC")).toBe(true);
    expect(body).toContain("2. ATENCIÓN RECIBIDA");
    expect(body).toContain("Lugar o canal de atención: Atención telefónica");
    expect(body).toContain("Tipo: QUEJA (malestar o descontento respecto a la atención al público)");
    expect(body).toContain("DETALLE DE LA QUEJA");
    expect(body).not.toContain("Tipo de bien");
    expect(body).not.toContain("Monto reclamado");
    expect(body).toContain("N° de orden de compra, factura u otro: F001-000123");
  });

  it("agrega los datos del padre, madre o representante cuando el consumidor es menor de edad", () => {
    const { body } = buildClaimMessage({ ...FIELDS, esMenorDeEdad: "Sí", representanteNombre: " Luis  Pérez Soto ", representanteDocumento: "87654321" });
    expect(body).toContain("Menor de edad: Sí");
    expect(body).toContain("Padre, madre o representante: Luis Pérez Soto");
    expect(body).toContain("Documento del padre, madre o representante: 87654321");
  });

  it("formatea fechas y montos, y construye enlaces con codificación segura", () => {
    expect(formatClaimDate("2026-01-05")).toBe("05/01/2026");
    expect(formatClaimDate("ayer")).toBe("ayer");
    expect(formatClaimAmount("1 500,5", "PEN")).toBe("S/ 1,500.50");
    expect(formatClaimAmount("", "PEN")).toBe("");
    expect(formatClaimAmount("abc", "USD")).toBe("US$ abc");
    const url = mailtoUrl("cotizaciones@fundigsac.com", "Reclamo & queja", "línea 1\nlínea 2");
    expect(url).toBe("mailto:cotizaciones@fundigsac.com?subject=Reclamo%20%26%20queja&body=l%C3%ADnea%201%0Al%C3%ADnea%202");
    expect(whatsappUrl("51908849664", "Hola mundo")).toBe("https://wa.me/51908849664?text=Hola%20mundo");
  });
});
