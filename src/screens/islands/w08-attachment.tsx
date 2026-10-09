"use client";

import { useState } from "react";

/**
 * Zona de adjunto del formulario. El archivo NO se sube ni se almacena: el input no tiene `name`
 * (no viaja en la solicitud) y sólo se envía su nombre y tamaño como referencia para que el equipo comercial lo solicite por correo.
 */
export function W08Attachment({ idleText }: { idleText: string }) {
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const label = file ? `Archivo adjuntado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)` : idleText;
  return (
    <div className="relative flex items-center justify-center p-4 bg-surface rounded-lg cursor-pointer hover:bg-surface-container transition-colors focus-within:ring-2 focus-within:ring-focus">
      <input
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        id="file-upload"
        type="file"
        accept=".xlsx,.xls,.pdf,.dwg"
        aria-describedby="file-label-text file-helper-text"
        onChange={(event) => {
          const picked = event.target.files?.[0];
          setFile(picked ? { name: picked.name, size: picked.size } : null);
        }}
      />
      {file && <input type="hidden" name="adjuntoReferencia" value={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`} />}
      <div className="flex items-center gap-3 text-center pointer-events-none">
        <span className="material-symbols-outlined text-primary text-[24px]" aria-hidden="true">
          upload_file
        </span>
        <span className={`font-body-compact text-body-compact ${file ? "text-primary font-semibold" : "text-text-muted"}`} id="file-label-text" aria-live="polite">
          {label}
        </span>
      </div>
    </div>
  );
}
