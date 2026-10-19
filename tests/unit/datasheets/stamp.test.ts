import { describe, expect, it, vi } from "vitest";
import { PDFDocument } from "pdf-lib";

// "server-only" lanza fuera del entorno de React Server; en pruebas se neutraliza.
vi.mock("server-only", () => ({}));

const { DATASHEETS, limaDate, stampDatasheet } = await import("@/modules/datasheets/stamp");

describe("fecha de descarga de la ficha técnica", () => {
  it("usa la fecha de Lima (UTC-5), no la del servidor", () => {
    expect(limaDate(new Date("2026-10-19T15:00:00Z"))).toBe("19/10/2026");
    // 03:30 UTC del día 20 todavía es la noche del 19 en Lima.
    expect(limaDate(new Date("2026-10-20T03:30:00Z"))).toBe("19/10/2026");
    expect(limaDate(new Date("2026-10-20T05:00:00Z"))).toBe("20/10/2026");
    expect(limaDate(new Date("2027-01-01T04:59:00Z"))).toBe("31/12/2026");
  });

  it("estampa la plantilla de 2 páginas y el resultado cambia con el día", async () => {
    const sheet = DATASHEETS["garantia-extendida"];
    const a = await stampDatasheet(sheet, new Date("2026-10-19T15:00:00Z"));
    const b = await stampDatasheet(sheet, new Date("2026-10-20T15:00:00Z"));
    const doc = await PDFDocument.load(a);
    expect(doc.getPageCount()).toBe(2);
    expect(new TextDecoder("latin1").decode(a.slice(0, 5))).toBe("%PDF-");
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false);
  });
});
