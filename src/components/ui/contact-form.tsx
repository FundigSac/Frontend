"use client";
import "@/styles/pages.css";
import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";

const WHATSAPP = "51908849664";

/** Formulario de consulta que prepara un mensaje de WhatsApp. No envía datos a ningún servidor. */
export function ContactForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const lines = [
      "Hola FUNDIGSAC. Quisiera hacer una consulta.",
      "",
      `Nombre: ${get("nombre")}`,
      get("empresa") && `Empresa: ${get("empresa")}`,
      get("telefono") && `Teléfono: ${get("telefono")}`,
      `Tema: ${get("tema")}`,
      "",
      get("mensaje"),
    ].filter((line): line is string => typeof line === "string");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
    setSent(true);
  }
  return <form className="x-form" onSubmit={submit}>
    <div><h2>Escríbenos</h2><p>Completa los datos y se abrirá WhatsApp con tu mensaje listo para enviar.</p></div>
    <div className="x-form-row">
      <label>Nombre *<input name="nombre" required minLength={2} autoComplete="name" /></label>
      <label>Empresa<input name="empresa" autoComplete="organization" /></label>
    </div>
    <div className="x-form-row">
      <label>Teléfono<input name="telefono" type="tel" autoComplete="tel" inputMode="tel" /></label>
      <label>Tema
        <select name="tema" defaultValue="Cotización">
          <option>Cotización</option><option>Consulta técnica</option><option>Ficha técnica</option><option>Pieza a medida</option><option>Otro</option>
        </select>
      </label>
    </div>
    <label>Mensaje *<textarea name="mensaje" required minLength={5} placeholder="Producto, medida, cantidad y lugar de entrega" /></label>
    <button className="button" type="submit"><MessageCircle size={18} aria-hidden="true" /> Continuar por WhatsApp</button>
    <p className="x-form-note">Revisa el mensaje antes de enviarlo. FUNDIGSAC no recibe tus datos hasta que lo envías.</p>
    {sent && <p className="x-ok" role="status">Se abrió WhatsApp en otra pestaña. Si no aparece, revisa el bloqueo de ventanas del navegador.</p>}
  </form>;
}
