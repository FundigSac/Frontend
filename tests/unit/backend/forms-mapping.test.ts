import { describe, expect, it } from "vitest";
import { complaintBody, formatDueDate } from "@/app/_legal/claim-request";
import { signupSource } from "@/modules/access/account-api";
import { generalQuote, productQuote, withoutCatalogLinks } from "@/modules/quote/quote-request";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
};

describe("cotización general → SubmitQuoteRequest", () => {
  const fields: Record<string, string> = {
    razonSocial: "Constructora Andina SAC",
    rucEmpresa: "2013 1312 955",
    tipoProyecto: "saneamiento",
    departamentoDestino: "Arequipa",
    nombreSolicitante: "Luis Torres",
    cargoSolicitante: "Compras",
    correoCorporativo: "compras@andina.pe",
    celularContacto: "+51 987 654 321",
    familiaPrincipal: "valvulas",
    diametrosNominales: "DN150",
    cantidadMetrado: "12,5",
    consentimiento: "on",
  };

  it("usa los productos del carrito cuando los hay", () => {
    const body = generalQuote(form(fields), [{ slug: "acople-gran-rango-agr", name: "Acople", variant: "DN100", quantity: 3, note: "Urgente" }], "2026-10");
    expect(body.origin).toBe("GENERAL_FORM");
    expect(body.contact).toMatchObject({ companyName: "Constructora Andina SAC", ruc: "20131312955", position: "Compras" });
    expect(body.project).toMatchObject({ projectType: "Agua y saneamiento", deliveryDepartment: "Arequipa" });
    expect(body.items).toEqual([{ productSlug: "acople-gran-rango-agr", productName: "Acople", variantLabel: "DN100", quantity: 3, unit: "und", notes: "Urgente" }]);
    expect(body.acceptPrivacyNotice).toBe(true);
  });

  it("sin carrito arma una línea de texto libre con la familia, la medida y la cantidad", () => {
    const body = generalQuote(form(fields), [], "2026-10");
    expect(body.items).toEqual([{ productName: "Válvulas", variantLabel: "DN150", quantity: 12.5, unit: "und", notes: "Cantidad o metrado indicado: 12,5" }]);
    expect(body.project.message).toContain("Familia principal: Válvulas");
  });

  it("sin consentimiento no se marca la aceptación", () => {
    const rest = { ...fields };
    delete rest.consentimiento;
    expect(generalQuote(form(rest), [], "2026-10").acceptPrivacyNotice).toBe(false);
  });
});

describe("cotización por producto", () => {
  it("lleva la fecha solo si es válida y quita los slugs al reenviar como texto libre", () => {
    const base = {
      producto: "valvula-compuerta",
      productoNombre: "Válvula compuerta F4",
      "input-qty": "6",
      ruc: "20131312955",
      "razon-social": "Agua Limpia SAC",
      "contact-name": "María",
      email: "m@a.pe",
      phone: "987654321",
      "delivery-place": "Ate",
      notes: "Obra",
    };
    const body = productQuote(form({ ...base, "delivery-date": "2026-12-15", declaroQueLaInformacion: "on" }), "2026-10");
    expect(body.project.requestedDeliveryDate).toBe("2026-12-15");
    expect(body.items[0]).toMatchObject({ productSlug: "valvula-compuerta", quantity: 6 });
    expect(productQuote(form({ ...base, "delivery-date": "15/12/2026" }), "2026-10").project.requestedDeliveryDate).toBeUndefined();
    const free = withoutCatalogLinks(body).items[0];
    expect(free.productSlug).toBeUndefined();
    expect(free.productName).toBe("Válvula compuerta F4");
  });
});

describe("hoja de reclamación → ComplaintRequest", () => {
  const claim = {
    tipoReclamacion: "RECLAMO",
    nombresYApellidosRazon: "Ana Pérez",
    tipoDeDocumento: "PASAPORTE",
    numeroDeDocumento: "ab12345",
    correoElectronico: "ana@correo.pe",
    telefonoDeContacto: "987654321",
    domicilioLegalOHabitual: "Av. Los Próceres 456",
    tipoDeBien: "SERVICIO",
    descripcionDelProductoO: "Otro",
    fechaDelSuceso: "2026-10-14",
    montoReclamado: "1500,5",
    moneda: "USD",
    detalleDeLosHechos: "La válvula llegó con la brida dañada.",
    pedidoConcretoOPretension: "Cambio",
    medioDeRespuesta: "Carta al domicilio",
    consentimientoLeyN29733: "Sí",
  };

  it("traduce tipos, documentos, monto y medio de respuesta a los valores de la API", () => {
    const body = complaintBody(form(claim), "2026-10");
    expect(body).toMatchObject({
      kind: "CLAIM",
      documentType: "PASSPORT",
      documentNumber: "AB12345",
      goodType: "SERVICE",
      goodDescription: "Producto o servicio: Otro",
      claimedAmount: 1500.5,
      currency: "USD",
      responseChannel: "POSTAL_ADDRESS",
      minor: false,
      acceptPrivacyNotice: true,
    });
    expect(body.guardianName).toBeUndefined();
  });

  it("una queja no lleva bien ni monto, y el representante de un menor se identifica por su documento", () => {
    const body = complaintBody(
      form({ ...claim, tipoReclamacion: "QUEJA", lugarDeAtencion: "WhatsApp", esMenorDeEdad: "Sí", representanteNombre: "Rosa Pérez", representanteDocumento: "12345678" }),
      "2026-10",
    );
    expect(body).toMatchObject({ kind: "GRIEVANCE", goodType: undefined, claimedAmount: undefined, serviceLocation: "WhatsApp", goodDescription: "Atención: WhatsApp" });
    expect(body).toMatchObject({ minor: true, guardianName: "Rosa Pérez", guardianDocumentType: "DNI", guardianDocumentNumber: "12345678" });
  });

  it("escribe la fecha límite en palabras", () => {
    expect(formatDueDate("2026-11-10", "es")).toBe("10 de noviembre de 2026");
    expect(formatDueDate("2026-11-10", "en")).toBe("November 10, 2026");
  });
});

describe("origen del registro", () => {
  it("sale del destino al que volvía la persona", () => {
    expect(signupSource("/carrito")).toBe("carrito");
    expect(signupSource("/cotizar?producto=x")).toBe("cotizar");
    expect(signupSource(null)).toBe("registro");
  });
});
