import { describe, expect, it } from "vitest";
import { formatDueDate, formatFiledAt } from "@/app/_legal/claim-request";

describe("constancia del Libro de Reclamaciones (X11-2)", () => {
  it("la fecha de registro de la API se muestra en hora de Lima", () => {
    // 15:30 UTC = 10:30 en Lima (UTC−5, sin horario de verano).
    expect(formatFiledAt("2026-11-10T15:30:00Z", "es")).toMatch(/^10 de noviembre de 2026,? (a las )?10:30$/);
    expect(formatFiledAt("2026-11-10T15:30:00Z", "en")).toMatch(/^November 10, 2026,? (at )?10:30$/);
    // Pasada la medianoche UTC sigue siendo el día anterior en Lima.
    expect(formatFiledAt("2026-11-11T03:00:00Z", "es")).toMatch(/^10 de noviembre de 2026/);
  });

  it("sin fecha de registro, o con una no válida, no se muestra nada (no se inventa)", () => {
    expect(formatFiledAt(undefined, "es")).toBe("");
    expect(formatFiledAt("", "es")).toBe("");
    expect(formatFiledAt("no-es-fecha", "es")).toBe("");
  });

  it("el plazo legal es la fecha que devuelve la API, sin correrla por zona horaria", () => {
    expect(formatDueDate("2026-12-02", "es")).toBe("2 de diciembre de 2026");
    expect(formatDueDate("2026-12-02", "en")).toBe("December 2, 2026");
  });
});
