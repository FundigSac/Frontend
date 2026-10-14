"use client";

import { ArrowRight, CheckCircle2, Mail, MessageCircle, MessageSquareWarning, Megaphone, Phone, RotateCcw } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { LeadForm, LeadSubmit, useLeadState } from "@/modules/leads/lead-form";

const PRODUCTS = ["Válvulas", "Tuberías", "Marcos y tapas", "Grifos", "Acoples", "Atención o servicio al cliente", "Entrega o despacho", "Otro"] as const;

function Field({ id, label, required, full, children, hint }: { id: string; label: string; required?: boolean; full?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className={`lg-field${full ? " lg-field--full" : ""}`}>
      <label htmlFor={id}>
        {label} {required && <em aria-hidden="true">*</em>}
      </label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}

function CountedArea({ id, name, label, placeholder, rows = 4 }: { id: string; name: string; label: string; placeholder: string; rows?: number }) {
  const [length, setLength] = useState(0);
  return (
    <Field id={id} label={label} required full>
      <textarea id={id} name={name} required maxLength={1000} rows={rows} placeholder={placeholder} onChange={(e) => setLength(e.target.value.length)} onReset={() => setLength(0)} />
      <span className="lg-count" aria-hidden="true">{length} / 1000</span>
    </Field>
  );
}

function Fields() {
  const { status, reference, message } = useLeadState();
  const uid = useId();
  const [kind, setKind] = useState<"RECLAMO" | "QUEJA">("RECLAMO");
  const [maxDate, setMaxDate] = useState<string | undefined>();
  const noun = kind === "RECLAMO" ? "reclamo" : "queja";

  // La fecha máxima es "hoy" en el equipo de la persona; se calcula tras hidratar para no desfasar servidor y cliente.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      const d = new Date();
      setMaxDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  if (status === "success") {
    return (
      <div className="lg-success" role="status">
        <CheckCircle2 aria-hidden="true" size={44} strokeWidth={1.6} />
        <h2>Recibimos tu {noun}</h2>
        <p className="lg-text">Guarda tu código de registro. Te contactaremos por el medio que elegiste para darte una respuesta.</p>
        {reference && <code>{reference}</code>}
        <button type="button" className="lp-btn lp-btn--outline" onClick={() => window.location.reload()}>
          Registrar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <>
      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">1</span> Tipo de solicitud</legend>
        <div className="lg-kind">
          <label>
            <input type="radio" name="tipoReclamacion" value="RECLAMO" checked={kind === "RECLAMO"} onChange={() => setKind("RECLAMO")} />
            <Megaphone className="lg-kind__icon" aria-hidden="true" size={36} strokeWidth={1.5} />
            <strong>Reclamo</strong>
            <small>Disconformidad relacionada con un bien o servicio que ha afectado tu experiencia.</small>
            <span className="lg-kind__dot" aria-hidden="true" />
          </label>
          <label>
            <input type="radio" name="tipoReclamacion" value="QUEJA" checked={kind === "QUEJA"} onChange={() => setKind("QUEJA")} />
            <MessageSquareWarning className="lg-kind__icon" aria-hidden="true" size={36} strokeWidth={1.5} />
            <strong>Queja</strong>
            <small>Manifestación de insatisfacción sin que exista una afectación directa en el servicio.</small>
            <span className="lg-kind__dot" aria-hidden="true" />
          </label>
        </div>
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">2</span> Datos del consumidor</legend>
        <div className="lg-grid2">
          <Field id={`${uid}-n`} label="Nombres y apellidos / razón social" required>
            <input id={`${uid}-n`} name="nombresYApellidosRazon" required autoComplete="name" placeholder="Ingresa tus nombres y apellidos" />
          </Field>
          <Field id={`${uid}-td`} label="Tipo de documento" required>
            <select id={`${uid}-td`} name="tipoDeDocumento" required defaultValue="">
              <option value="" disabled>Selecciona</option>
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
              <option value="CE">Carné de extranjería</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </Field>
          <Field id={`${uid}-nd`} label="Número de documento" required>
            <input id={`${uid}-nd`} name="numeroDeDocumento" required inputMode="numeric" autoComplete="off" placeholder="Ingresa tu número de documento" />
          </Field>
          <Field id={`${uid}-c`} label="Correo electrónico" required>
            <input id={`${uid}-c`} name="correoElectronico" type="email" required autoComplete="email" placeholder="ejemplo@correo.com" />
          </Field>
          <Field id={`${uid}-t`} label="Teléfono de contacto" required>
            <input id={`${uid}-t`} name="telefonoDeContacto" type="tel" required autoComplete="tel" placeholder="Ingresa tu número de teléfono" />
          </Field>
          <Field id={`${uid}-d`} label="Dirección" required>
            <input id={`${uid}-d`} name="domicilioLegalOHabitual" required autoComplete="street-address" placeholder="Ingresa tu dirección" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">3</span> Identificación del bien o servicio</legend>
        <div className="lg-grid2">
          <Field id={`${uid}-p`} label="Producto o servicio relacionado" required>
            <select id={`${uid}-p`} name="descripcionDelProductoO" required defaultValue="">
              <option value="" disabled>Selecciona una opción</option>
              {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field id={`${uid}-f`} label="Fecha del suceso" required>
            <input id={`${uid}-f`} name="fechaDelSuceso" type="date" required max={maxDate} />
          </Field>
          <Field id={`${uid}-o`} label="N° de orden de compra, factura u otro (opcional)" full>
            <input id={`${uid}-o`} name="nDeCotizacionO" autoComplete="off" placeholder="Ingresa el número de documento" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">4</span> Detalle del {noun}</legend>
        <CountedArea id={`${uid}-h`} name="detalleDeLosHechos" label="Describe lo ocurrido" placeholder={`Explica de manera clara y detallada tu ${noun}...`} />
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">5</span> Pedido del consumidor</legend>
        <CountedArea id={`${uid}-s`} name="pedidoConcretoOPretension" label="¿Qué solución solicitas?" placeholder="Indica de manera clara tu pedido o expectativa..." />
      </fieldset>

      <fieldset className="lg-fieldset">
        <legend><span aria-hidden="true">6</span> Canales de respuesta</legend>
        <p className="lg-text" style={{ fontSize: 14.5 }}>Selecciona el medio por el cual prefieres que nos comuniquemos contigo.</p>
        <div className="lg-channels">
          <label className="lg-check"><input type="checkbox" name="canalesDeRespuesta" value="Correo electrónico" defaultChecked /> Correo electrónico</label>
          <label className="lg-check"><input type="checkbox" name="canalesDeRespuesta" value="Teléfono" /> Teléfono</label>
          <label className="lg-check"><input type="checkbox" name="canalesDeRespuesta" value="WhatsApp" /> WhatsApp</label>
        </div>
      </fieldset>

      <label className="lg-consent">
        <input type="checkbox" name="consentimientoLeyN29733" value="Sí" required />
        <span>
          Declaro que la información registrada es veraz y acepto que sea tratada para la gestión de mi {noun}, de acuerdo con la{" "}
          <a className="lg-link-inline" href="/privacidad" target="_blank" rel="noopener noreferrer">Política de privacidad</a>.
        </span>
      </label>

      {status === "error" && <p className="lg-alert" role="alert">{message}</p>}

      <div className="lg-form-actions">
        <button type="reset" className="lp-btn lp-btn--outline" onClick={() => setKind("RECLAMO")}>
          Limpiar formulario <RotateCcw aria-hidden="true" size={16} strokeWidth={2} />
        </button>
        <LeadSubmit
          className="lp-btn lp-btn--solid lp-btn--lg"
          idle={<>Enviar {noun} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} /></>}
          pending="Enviando…"
        />
      </div>
    </>
  );
}

/** Formulario del libro de reclamaciones: valida en el cliente y en el servidor, y entrega un folio real. */
export function ClaimForm({ enabled = true, email, phone, whatsapp }: { enabled?: boolean; email: string; phone: string; whatsapp: string }) {
  if (!enabled) {
    return (
      <div className="lg-form-card">
        <h2>Registro en línea en preparación</h2>
        <p>Estamos habilitando el registro digital con código de seguimiento. Mientras tanto, puedes presentar tu reclamo o queja por estos canales y lo atenderemos.</p>
        <ul className="lg-help" style={{ marginTop: 22 }}>
          <li><a href={`mailto:${email}?subject=${encodeURIComponent("Reclamo o queja FUNDIGSAC")}`}><Mail aria-hidden="true" size={24} strokeWidth={1.6} /><div><strong>Por correo</strong><span>{email}</span></div><ArrowRight aria-hidden="true" size={18} /></a></li>
          <li><a href={`tel:${phone.replace(/s/g, "")}`}><Phone aria-hidden="true" size={24} strokeWidth={1.6} /><div><strong>Por teléfono</strong><span>{phone}</span></div><ArrowRight aria-hidden="true" size={18} /></a></li>
          <li><a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" size={24} strokeWidth={1.6} /><div><strong>Por WhatsApp</strong><span>Indica que se trata de un reclamo o queja.</span></div><ArrowRight aria-hidden="true" size={18} /></a></li>
        </ul>
      </div>
    );
  }
  return (
    <LeadForm formId="claim" className="lg-form-card" id="reclamaciones-form" aria-label="Formulario de reclamos y quejas">
      <h2>Formulario de reclamos y quejas</h2>
      <p>Completa la siguiente información. Todos los campos marcados con <em style={{ color: "var(--lp-orange-dark)", fontStyle: "normal" }}>*</em> son obligatorios.</p>
      <div style={{ marginTop: 22 }}>
        <Fields />
      </div>
    </LeadForm>
  );
}
