import { describe, expect, it } from "vitest";
import { buildDeletionMessage, deletionReference } from "@/app/_legal/deletion-message";

const now = new Date(2026, 9, 16, 10, 30);

describe("solicitud de eliminación de cuenta", () => {
  it("genera un código con la fecha y 4 caracteres sin ambigüedades", () => {
    expect(deletionReference(now, () => new Uint8Array([0, 1, 30, 31]))).toBe("ELIM-20261016-23Z2");
    for (let i = 0; i < 50; i++) expect(deletionReference(now)).toMatch(/^ELIM-20261016-[2-9A-HJKMNP-Z]{4}$/);
  });

  it("incluye los requisitos del art. 64 del Reglamento y la petición concreta", () => {
    const { subject, body } = buildDeletionMessage(
      { name: "  Ana   Torres ", email: "ana@empresa.pe", method: "google", scope: "all", details: "Cotización 1234\r\nOtro correo: ana@gmail.com" },
      "ELIM-20261016-ABCD",
      now,
    );
    expect(subject).toBe("Eliminación de cuenta y datos · ELIM-20261016-ABCD · Ana Torres");
    expect(body).toContain("Fecha de la solicitud: 16/10/2026");
    expect(body).toContain("RUC 20601839281");
    expect(body).toContain("Nombres y apellidos: Ana Torres");
    expect(body).toContain("Correo para notificaciones: ana@empresa.pe");
    expect(body).toContain("Documento de identidad: No indicado (escribo desde el correo asociado a mi cuenta)");
    expect(body).toContain("Acceso a FUNDIGSAC: Inicio de sesión con Google");
    expect(body).toContain("Solicito la eliminación de mi cuenta y de todos mis datos personales");
    expect(body).toContain("3. INFORMACIÓN ADICIONAL\nCotización 1234\nOtro correo: ana@gmail.com");
    expect(body).toContain("D.S. N.° 016-2024-JUS");
    expect(body.endsWith("Firma: Ana Torres")).toBe(true);
  });

  it("omite la información adicional vacía y respeta el alcance elegido", () => {
    const { body } = buildDeletionMessage({ name: "Luis Rojas", email: "l@r.pe", method: "none", scope: "marketing", doc: "DNI 12345678" }, "ELIM-20261016-WXYZ", now);
    expect(body).not.toContain("INFORMACIÓN ADICIONAL");
    expect(body).toContain("Documento de identidad: DNI 12345678");
    expect(body).toContain("No tengo cuenta (solo mis datos de contacto)");
    expect(body).toContain("dejar de recibir comunicaciones comerciales");
  });
});
