import { describe, expect, it } from "vitest";
import { docLinks, whatsappMention } from "@/shared/assistant/assistant-attach";
import { parseReply } from "@/shared/assistant/use-assistant-chat";

describe("adjuntos y tarjetas del chat", () => {
  it("detecta los PDF del sitio y les asigna vista previa", () => {
    const docs = docLinks("Aquí: [Ficha técnica FUNDIGSAC](/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf) y [otra](/docs/otra.pdf) y [repetida](/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf)");
    expect(docs).toHaveLength(2);
    expect(docs[0]).toMatchObject({ href: "/docs/ficha-tecnica-valvula-compuerta-fundigsac.pdf", title: "Ficha técnica FUNDIGSAC" });
    expect(docs[0].preview).toContain("ft-fundigsac-p1");
    expect(docs[1].preview).toBeUndefined();
  });

  it("no toma enlaces que no sean PDF de /docs", () => {
    expect(docLinks("[web](https://x.com/docs/a.pdf) [cot](/cotizar)")).toEqual([]);
  });

  it("reconoce el número o el enlace de WhatsApp", () => {
    expect(whatsappMention("Escríbenos al +51 908 849 664")).toBe(true);
    expect(whatsappMention("Mira https://wa.me/51908849664")).toBe(true);
    expect(whatsappMention("Sin contacto")).toBe(false);
  });

  it("acepta preguntas sugeridas sin corchetes en la última línea", () => {
    const { body, suggestions } = parseReply("Hola.\n¿Cotizamos?|¿Ficha técnica?|¿Otro diámetro?");
    expect(body).toBe("Hola.");
    expect(suggestions).toEqual(["¿Cotizamos?", "¿Ficha técnica?", "¿Otro diámetro?"]);
    expect(parseReply("Una sola línea con | barra").suggestions).toEqual([]);
  });
});
