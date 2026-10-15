import { describe, expect, it } from "vitest";
import { suggestionsFor, whatsappHref } from "@/shared/assistant/assistant-copy";
import { safeHref } from "@/shared/assistant/assistant-markdown";
import { historyFor, parseReply, type ChatMessage } from "@/shared/assistant/use-assistant-chat";

describe("enlaces de las respuestas", () => {
  it("acepta rutas internas, WhatsApp, correo y teléfono", () => {
    expect(safeHref("/cotizar?producto=valvula-compuerta")).toEqual({ kind: "internal", href: "/cotizar?producto=valvula-compuerta" });
    expect(safeHref("https://wa.me/51908849664")).toEqual({ kind: "external", href: "https://wa.me/51908849664" });
    expect(safeHref("mailto:ventas@fundigsac.com")?.kind).toBe("app");
    expect(safeHref("tel:+51908849664")?.kind).toBe("app");
    expect(safeHref("https://fundigsac.com/productos")).toEqual({ kind: "internal", href: "/productos" });
  });

  it("abre los archivos del sitio (PDF) como archivo, no como página", () => {
    expect(safeHref("/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf")).toEqual({ kind: "file", href: "/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf" });
    expect(safeHref("https://fundigsac.com/docs/ficha.pdf")?.kind).toBe("file");
    expect(safeHref("/productos/valvulas/valvula-compuerta-fundigsac")?.kind).toBe("internal");
    expect(safeHref("/cotizar?producto=valvula-compuerta")?.kind).toBe("internal");
  });

  it("rechaza dominios ajenos, protocolos peligrosos y rutas de otro host", () => {
    expect(safeHref("https://ejemplo.invalid/login")).toBeNull();
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("//otro.sitio/x")).toBeNull();
    expect(safeHref("http://wa.me/51908849664")).toBeNull();
  });
});

describe("sugerencias de seguimiento", () => {
  it("separa el texto de las preguntas sugeridas", () => {
    expect(parseReply("Hola.\n[[¿Qué es DN?|¿Cómo cotizo?]]")).toEqual({ body: "Hola.", suggestions: ["¿Qué es DN?", "¿Cómo cotizo?"] });
  });

  it("oculta un bloque de sugerencias a medio llegar", () => {
    expect(parseReply("Respuesta en curso\n[[¿Qué es")).toEqual({ body: "Respuesta en curso", suggestions: [] });
    expect(parseReply("Sin sugerencias")).toEqual({ body: "Sin sugerencias", suggestions: [] });
  });
});

describe("historial enviado a la API", () => {
  const msg = (role: ChatMessage["role"], content: string, status: ChatMessage["status"] = "done"): ChatMessage => ({ id: `${role}-${content}`, role, content, status });

  it("omite respuestas fallidas o vacías y empieza por el usuario", () => {
    const history = historyFor([msg("assistant", "hola"), msg("user", "a"), msg("assistant", "", "error"), msg("user", "b"), msg("assistant", "c"), msg("user", "d")]);
    expect(history).toEqual([
      { role: "user", content: "a" },
      { role: "user", content: "b" },
      { role: "assistant", content: "c" },
      { role: "user", content: "d" },
    ]);
  });

  it("no reenvía las sugerencias al modelo", () => {
    const history = historyFor([msg("user", "a"), msg("assistant", "respuesta\n[[x|y]]"), msg("user", "b")]);
    expect(history[1]).toEqual({ role: "assistant", content: "respuesta" });
  });

  it("limita la cantidad de mensajes", () => {
    const many = Array.from({ length: 40 }, (_, i) => msg(i % 2 ? "assistant" : "user", `m${i}`));
    const history = historyFor([...many, msg("user", "final")]);
    expect(history.length).toBeLessThanOrEqual(16);
    expect(history[0].role).toBe("user");
    expect(history.at(-1)?.content).toBe("final");
  });
});

describe("textos del asistente", () => {
  it("sugiere preguntas según la página", () => {
    expect(suggestionsFor("/productos/valvulas/valvula-compuerta-fundigsac-garantia-extendida", "es")[1]).toContain("cuadrante");
    expect(suggestionsFor("/productos/valvulas/valvula-compuerta", "es")[0]).toContain("H-ITALY");
    expect(suggestionsFor("/una-ruta-cualquiera", "en")).toHaveLength(3);
  });

  it("pasa la consulta a WhatsApp", () => {
    const href = whatsappHref("es", "¿Tienen DN300?");
    expect(href.startsWith("https://wa.me/51908849664?text=")).toBe(true);
    expect(decodeURIComponent(href.split("text=")[1])).toContain("¿Tienen DN300?");
  });
});
