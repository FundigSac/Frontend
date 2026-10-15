import { describe, expect, it } from "vitest";
import { buildContactMessage } from "@/app/contacto/contact-message";

const FIELDS = {
  name: "  Ing.   Prueba ",
  company: "Consorcio  Prueba S.A.C.",
  position: "",
  email: "compras@prueba.com.pe",
  phone: "+51 987 654 321",
  message: "Necesito cotizar válvulas DN150.\r\nEntrega en Lima.",
};

describe("mensaje de contacto", () => {
  it("arma el asunto y el cuerpo con los datos, normalizando espacios y saltos de línea", () => {
    const { subject, body } = buildContactMessage(FIELDS, new Date("2026-10-14T12:00:00"));
    expect(subject).toBe("Consulta de contacto FUNDIGSAC: Ing. Prueba");
    expect(body).toContain("Fecha: 14/10/2026");
    expect(body).toContain("Nombre completo: Ing. Prueba");
    expect(body).toContain("Empresa: Consorcio Prueba S.A.C.");
    expect(body).toContain("Teléfono: +51 987 654 321");
    expect(body).toContain("Necesito cotizar válvulas DN150.\nEntrega en Lima.");
    expect(body).not.toContain("Cargo:");
    expect(body).not.toContain("Motivo:");
    expect(body).not.toContain("—");
  });

  it("incluye el cargo y el motivo solo cuando existen", () => {
    const { body } = buildContactMessage({ ...FIELDS, position: "Jefe de Compras", reason: "Solicitud de documentación" });
    expect(body).toContain("Cargo: Jefe de Compras");
    expect(body).toContain("Motivo: Solicitud de documentación");
  });

  it("no deja el asunto colgando si falta el nombre", () => {
    expect(buildContactMessage({ ...FIELDS, name: " " }).subject).toBe("Consulta de contacto FUNDIGSAC");
  });
});
