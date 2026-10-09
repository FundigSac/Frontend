"use client";

import { useId, useState } from "react";

/** Barra "Habilitar campo de apoderado" (W18): revela los datos del representante legal cuando el reclamante es menor de edad. */
export function W18GuardianToggle() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="bg-surface-container-low p-3 rounded-lg flex items-center justify-between text-on-surface-variant font-ui-label text-ui-label">
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
            child_care
          </span>
          En caso el reclamante sea menor de edad, consignar los datos del representante legal o apoderado.
        </span>
        <button className="text-primary font-bold hover:underline" type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)}>
          {open ? "Ocultar campo de apoderado" : "Habilitar campo de apoderado"}
        </button>
      </div>
      {open && (
        <div id={panelId} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold" htmlFor="apoderadoNombre">
              Nombres y Apellidos del Representante Legal o Apoderado *
            </label>
            <input id="apoderadoNombre" name="apoderadoNombre" required type="text" autoComplete="off" className="w-full h-11 px-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus" />
          </div>
          <div>
            <label className="block font-ui-label text-ui-label text-on-surface-variant mb-1 font-bold" htmlFor="apoderadoDocumento">
              N° de Documento del Representante *
            </label>
            <input id="apoderadoDocumento" name="apoderadoDocumento" required type="text" autoComplete="off" className="w-full h-11 px-3 bg-surface-elevated rounded-lg text-body-compact font-body-compact text-on-surface focus:outline-none focus:ring-2 focus:ring-focus" />
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Zona de adjuntos del reclamo (W18). Sólo se registran el nombre y el tamaño de los archivos: no se almacenan,
 * por lo que se indica que los comprobantes se coordinan por correo.
 */
export function W18FileField() {
  const helpId = useId();
  const [names, setNames] = useState<string[]>([]);
  const MAX = 10 * 1024 * 1024;
  return (
    <label
      htmlFor="adjuntosReclamo"
      className="p-8 rounded-xl bg-surface-elevated flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors focus-within:ring-2 focus-within:ring-focus"
    >
      <input
        id="adjuntosReclamo"
        name="adjuntosReclamo"
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        className="sr-only"
        aria-describedby={helpId}
        onChange={(e) => {
          const input = e.currentTarget;
          const files = Array.from(input.files ?? []);
          const big = files.find((f) => f.size > MAX);
          input.setCustomValidity(big ? `"${big.name}" supera el máximo de 10 MB.` : "");
          if (big) input.reportValidity();
          setNames(files.map((f) => f.name));
        }}
      />
      <span className="material-symbols-outlined text-[40px] text-primary mb-2" aria-hidden="true">
        upload_file
      </span>
      <span className="block font-button-text text-button-text text-on-surface font-semibold mb-1" aria-live="polite">
        {names.length ? `Seleccionado: ${names.join(", ")}` : "Haga clic para adjuntar comprobantes, órdenes de compra o fotografías"}
      </span>
      <span id={helpId} className="block font-ui-label text-ui-label text-text-muted">
        Los adjuntos se coordinan por correo con el equipo comercial.
      </span>
    </label>
  );
}
