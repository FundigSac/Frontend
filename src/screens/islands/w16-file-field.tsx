"use client";

import { useId, useState } from "react";

const MAX_BYTES = 25 * 1024 * 1024;

/**
 * Selector de adjuntos del formulario de cotización (W16). Mismo aspecto que el diseño; el input real
 * es accesible por teclado (sr-only) y la zona punteada es su <label>. Los archivos NO se almacenan:
 * sólo se registran nombre y tamaño, de modo que el equipo comercial coordina el envío por correo.
 */
export function W16FileField() {
  const labelId = useId();
  const helpId = useId();
  const [names, setNames] = useState<string[]>([]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    const tooBig = files.find((f) => f.size > MAX_BYTES);
    input.setCustomValidity(tooBig ? `"${tooBig.name}" supera el máximo de 25 MB.` : "");
    if (tooBig) input.reportValidity();
    setNames(files.map((f) => f.name));
  };

  return (
    <div className="space-y-1.5">
      <span className="block font-ui-label text-ui-label text-on-surface-variant font-semibold" id={labelId}>
        Planilla de Metrado, EETT o Plano (Opcional)
      </span>
      <label
        htmlFor="fileUpload"
        className="block p-5 rounded-xl bg-surface-container-low text-center space-y-2 cursor-pointer hover:bg-surface-container transition-colors focus-within:ring-2 focus-within:ring-focus"
      >
        <input
          className="sr-only"
          id="fileUpload"
          multiple
          type="file"
          name="fileUpload"
          accept=".pdf,.xls,.xlsx,.dwg,.zip"
          aria-labelledby={labelId}
          aria-describedby={helpId}
          onChange={onChange}
        />
        <div className="w-10 h-10 rounded-full bg-surface-container-highest text-primary mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            cloud_upload
          </span>
        </div>
        <div className="space-y-1">
          <p className="font-button-text text-button-text text-primary" id="fileNameLabel" aria-live="polite">
            {names.length === 0 ? "Cargar archivo de metrados o planos" : names.length === 1 ? names[0] : `${names.length} archivos: ${names.join(", ")}`}
          </p>
          <p className="font-ui-label text-ui-label text-text-muted" id={helpId}>
            Formatos admitidos: PDF, XLS, XLSX, DWG, ZIP (Hasta 25MB)
          </p>
          <p className="font-ui-label text-ui-label text-text-muted">
            Los adjuntos se coordinan por correo con el equipo comercial.
          </p>
        </div>
      </label>
    </div>
  );
}
