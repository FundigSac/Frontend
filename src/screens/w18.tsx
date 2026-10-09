
import Link from "next/link";
import { LeadError, LeadForm, LeadReference, LeadSubmit, LeadWhen } from "@/modules/leads/lead-form";
import { W18GuardianToggle } from "./islands/w18-fields";

export function ScreenW18() {
  return (
    <>
    <main className="w-full pt-[76px] bg-background min-h-screen">
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface-container-low py-8 px-6">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-5">
            <nav className="flex items-center gap-2 text-text-muted font-ui-label text-ui-label uppercase tracking-wider">
              <Link className="hover:text-primary transition-colors flex items-center gap-1" href="/">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  home
                </span>
                <span>
                  Inicio
                </span>
              </Link>
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                chevron_right
              </span>
              <span className="text-primary font-bold">
                Libro de Reclamaciones
              </span>
            </nav>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
              <div className="max-w-3xl space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-ui-label text-ui-label font-bold">
                  <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                    verified_user
                  </span>
                  <span>
                    Contenido y procedimiento pendientes de validación legal
                  </span>
                </div>
                <h1 className="font-headline-section text-headline-section text-primary tracking-tight">
                  Libro de reclamaciones
                </h1>
                <p className="font-body-compact text-body-compact text-on-surface-variant leading-relaxed">
                  Los datos del proveedor, los requisitos y el aviso legal deben validarse antes de habilitar el canal.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-surface-container p-4 rounded-xl shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary-container text-brand-on flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[26px]" aria-hidden="true">pending_actions</span></div>
                <div><span className="block font-ui-label text-ui-label text-on-surface-variant uppercase font-bold">Estado del canal</span><span className="font-headline-card text-headline-card text-primary font-bold">Pendiente de aprobación</span><span className="block font-ui-label text-ui-label text-text-muted">Revisión legal y operativa</span></div>
              </div>
            </div>
            <div className="bg-surface-elevated p-4 rounded-xl shadow-sm flex items-start gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-focus text-[22px] shrink-0 mt-0.5" aria-hidden="true">
                info
              </span>
              <div className="font-body-compact text-body-compact leading-normal">
                <span className="font-bold text-on-surface">
                  Aviso de revisión:
                </span>
                {" "}El contenido de este formulario, los datos del proveedor, el tratamiento de datos personales y la constancia de recepción están pendientes de validación. El servicio debe aprobarse antes de publicarse como canal oficial.
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1200px] w-full mx-auto px-6 py-10">
          <LeadForm formId="claim" className="flex flex-col gap-10" id="reclamacionesForm">
            <section className="bg-surface p-7 rounded-xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded bg-primary text-brand-on font-ui-label text-ui-label font-bold flex items-center justify-center">
                    01
                  </span>
                  <h2 className="font-headline-card text-headline-card text-on-surface">
                    Identificación del Consumidor Reclamante
                  </h2>
                </div>
                <span className="font-ui-label text-ui-label text-text-muted">
                  * Datos de carácter obligatorio
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold">
                    Tipo de Documento *
                  </label>
                  {" "}
                  <select aria-label="Tipo de documento" className="w-full h-11 px-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus" required name="tipoDeDocumento">
                    <option value="DNI">
                      D.N.I. (Documento Nacional de Identidad)
                    </option>
                    <option value="RUC">
                      R.U.C. (Persona Jurídica o Natural con Negocio)
                    </option>
                    <option value="CE">
                      C.E. (Carné de Extranjería)
                    </option>
                    <option value="PASAPORTE">
                      Pasaporte
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold">
                    Número de Documento *
                  </label>
                  {" "}
                  <input aria-label="Número de documento" className="w-full h-11 px-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus" placeholder="Número de documento" required type="text" name="numeroDeDocumento" />
                </div>
                <div>
                  <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold">
                    Teléfono de Contacto *
                  </label>
                  {" "}
                  <input aria-label="Teléfono de contacto" className="w-full h-11 px-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus" placeholder="Teléfono" required type="tel" name="telefonoDeContacto" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold">
                    Nombres y Apellidos / Razón Social *
                  </label>
                  {" "}
                  <input aria-label="Nombre o razón social" className="w-full h-11 px-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus" placeholder="Consignar nombre completo o denominación social registrada" required type="text" name="nombresYApellidosRazon" />
                </div>
                <div>
                  <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold">
                    Correo Electrónico * (Para remisión de hoja)
                  </label>
                  {" "}
                  <input aria-label="Correo electrónico" className="w-full h-11 px-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus" placeholder="Correo electrónico" required type="email" name="correoElectronico" />
                </div>
                <div className="md:col-span-3">
                  <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold">
                    Domicilio Legal o Habitual *
                  </label>
                  {" "}
                  <input aria-label="Domicilio" className="w-full h-11 px-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus" placeholder="Domicilio indicado por el reclamante" required type="text" name="domicilioLegalOHabitual" />
                </div>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg flex items-center justify-between text-on-surface-variant font-ui-label text-ui-label">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
                    child_care
                  </span>
                  En caso el reclamante sea menor de edad, consignar los datos del representante legal o apoderado.
                </span>
                <W18GuardianToggle />
              </div>
            </section>
            <section className="bg-surface p-7 rounded-xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded bg-primary text-brand-on font-ui-label text-ui-label font-bold flex items-center justify-center">
                    02
                  </span>
                  <h2 className="font-headline-card text-headline-card text-on-surface">
                    Identificación del Bien Contratado
                  </h2>
                </div>
                <span className="font-ui-label text-ui-label text-text-muted">
                  Detalle contractual por confirmar
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="block font-ui-label text-ui-label text-on-surface-variant font-bold">
                    Naturaleza del Bien *
                  </label>
                  <div className="grid grid-cols-2 gap-3 h-11">
                    <label className="flex items-center justify-center gap-2 rounded-lg bg-surface-elevated cursor-pointer px-3 text-body-compact font-body-compact text-on-surface hover:bg-surface-container transition-colors">
                      <input aria-label="Naturaleza del bien" defaultChecked className="text-primary focus:ring-focus" name="tipoBien" type="radio" defaultValue="producto" />
                      <span className="font-semibold">
                        Producto
                      </span>
                    </label>
                    <label className="flex items-center justify-center gap-2 rounded-lg bg-surface-elevated cursor-pointer px-3 text-body-compact font-body-compact text-on-surface hover:bg-surface-container transition-colors">
                      <input aria-label="Naturaleza del bien" className="text-primary focus:ring-focus" name="tipoBien" type="radio" defaultValue="servicio" />
                      <span className="font-semibold">
                        Servicio
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold">
                    Monto Reclamado (Opcional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 font-body-compact text-body-compact text-text-muted">
                      S/
                    </span>
                    {" "}
                    <input aria-label="Monto reclamado" className="w-full h-11 pl-9 pr-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus text-right" placeholder="0.00" step="0.01" type="number" name="montoReclamado" />
                  </div>
                </div>
                <div>
                  <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold">
                    N° de Cotización / O.C. / Guía (Opcional)
                  </label>
                  {" "}
                  <input aria-label="Referencia de cotización, orden o guía" className="w-full h-11 px-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus" placeholder="Referencia, si la conoces" type="text" name="nDeCotizacionO" />
                </div>
                <div className="md:col-span-3">
                  <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold">
                    Descripción del Producto o Servicio Contratado *
                  </label>
                  {" "}
                  <input aria-label="Descripción del producto o servicio" className="w-full h-11 px-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus" placeholder="Indica el producto o servicio relacionado" required type="text" name="descripcionDelProductoO" />
                </div>
              </div>
            </section>
            <section className="bg-surface p-7 rounded-xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded bg-primary text-brand-on font-ui-label text-ui-label font-bold flex items-center justify-center">
                    03
                  </span>
                  <h2 className="font-headline-card text-headline-card text-on-surface">
                    Detalle de la Reclamación
                  </h2>
                </div>
                <span className="font-ui-label text-ui-label text-text-muted">
                  Selección de categoría obligatoria
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-start gap-4 p-4 rounded-xl bg-surface-elevated cursor-pointer hover:bg-surface-container transition-colors">
                  <input aria-label="Tipo de reclamo" defaultChecked className="mt-1 text-primary focus:ring-focus" name="tipoReclamacion" type="radio" defaultValue="RECLAMO" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-button-text text-button-text text-primary uppercase font-bold">
                        Reclamo
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary-fixed text-on-secondary-fixed">
                        Categoría
                      </span>
                    </div>
                    <p className="font-body-compact text-body-compact text-on-surface-variant">
                      Explica el motivo de tu reclamo.
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-4 p-4 rounded-xl bg-surface-elevated cursor-pointer hover:bg-surface-container transition-colors">
                  <input aria-label="Tipo de reclamo" className="mt-1 text-primary focus:ring-focus" name="tipoReclamacion" type="radio" defaultValue="QUEJA" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-button-text text-button-text text-primary uppercase font-bold">
                        Queja
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-surface-container-high text-on-secondary-container">
                        Categoría
                      </span>
                    </div>
                    <p className="font-body-compact text-body-compact text-on-surface-variant">
                      Explica el motivo de tu queja.
                    </p>
                  </div>
                </label>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold">
                    Detalle de los Hechos * (Relato pormenorizado)
                  </label>
                  <textarea aria-label="Detalle de los hechos" className="w-full p-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus resize-none" placeholder="Describe los hechos relacionados con el producto o servicio." required rows={4} name="detalleDeLosHechos"></textarea>
                </div>
                <div>
                  <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold">
                    Pedido Concreto o Pretensión del Consumidor *
                  </label>
                  <textarea aria-label="Respuesta solicitada" className="w-full p-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus resize-none" placeholder="Indica qué respuesta solicitas." required rows={3} name="pedidoConcretoOPretension"></textarea>
                </div>
              </div>
            </section>
            <section className="bg-surface p-7 rounded-xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded bg-primary text-brand-on font-ui-label text-ui-label font-bold flex items-center justify-center">
                    04
                  </span>
                  <h2 className="font-headline-card text-headline-card text-on-surface">
                    Documentos de Sustento (Opcional)
                  </h2>
                </div>
                <span className="font-ui-label text-ui-label text-text-muted">
                  Recepción digital de archivos pendiente de implementación
                </span>
              </div>
              <div className="p-8 rounded-xl bg-surface-elevated flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-[40px] text-primary mb-2" aria-hidden="true">upload_file</span>
                <p className="font-button-text text-button-text text-on-surface font-semibold mb-1">Adjuntos aún no disponibles</p>
                <p className="font-ui-label text-ui-label text-text-muted">El sitio no transmite ni conserva archivos desde este formulario.</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input aria-label="Declaración de veracidad" className="mt-1 text-primary focus:ring-focus" required type="checkbox" name="declaracionJuradaDeVeracidad" />
                  <span className="font-body-compact text-body-compact text-on-surface leading-snug">
                    <strong className="font-bold">
                      Declaración Jurada de Veracidad:
                    </strong>
                    {" "}Texto de declaración pendiente de validación legal.
                  </span>
                </label>
                {" "}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input aria-label="Aceptación del aviso de privacidad" className="mt-1 text-primary focus:ring-focus" required type="checkbox" name="consentimientoLeyN29733" />
                  <span className="font-body-compact text-body-compact text-on-surface leading-snug">
                    <strong className="font-bold">
                      Aviso de privacidad:
                    </strong>
                    {" "}El texto que informa el tratamiento de estos datos está pendiente de validación legal. Revisa el aviso completo antes de habilitar el envío.
                  </span>
                </label>
              </div>
            </section>
            <LeadWhen status="success"><div className="bg-surface-container p-6 rounded-xl flex items-center gap-4 text-on-surface" id="successBanner" role="status"><span className="material-symbols-outlined text-success text-[32px] shrink-0" aria-hidden="true">check_circle</span><div className="space-y-1"><p className="font-button-text text-button-text font-bold text-success">Solicitud registrada · Folio <LeadReference /></p><p className="font-body-compact text-body-compact text-on-surface-variant">El canal y procedimiento de atención todavía requieren validación.</p></div></div></LeadWhen>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2 text-text-muted font-ui-label text-ui-label">
                <span className="material-symbols-outlined text-[16px] text-success" aria-hidden="true">
                  lock
                </span>
                <span>
                  Formulario técnico sujeto a aprobación legal y operativa
                </span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button className="w-full sm:w-auto h-12 px-6 rounded-lg bg-surface text-on-surface-variant font-button-text text-button-text hover:bg-surface-container-high transition-colors" type="reset">
                  Limpiar Formulario
                </button>
                <LeadSubmit baseClassName="w-full sm:w-auto h-12 px-8 rounded-lg bg-primary text-brand-on font-button-text text-button-text hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2" idle={<><span className="material-symbols-outlined text-[20px]" aria-hidden="true">assignment_turned_in</span><span>Registrar solicitud</span></>} pending="Registrando…" />
              </div>
            </div>
            <LeadError />
          </LeadForm>
          <div className="mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-text-muted font-ui-label text-ui-label text-center sm:text-left bg-surface-container-low p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-text-muted" aria-hidden="true">
                build_circle
              </span>
              <span className="font-bold tracking-wide">
                Aviso y procedimiento legal pendientes de validación antes de presentar esta página como canal oficial.
              </span>
            </div>
            <span className="font-semibold text-primary">
              Datos del proveedor pendientes de confirmación
            </span>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
