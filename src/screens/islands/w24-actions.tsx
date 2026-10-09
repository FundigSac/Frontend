"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "@/shared/ui/content-clipboard";
import { useToast } from "@/shared/ui/toast";

/** Botón "Copiar" del folio (W24): copia el folio real, confirma con texto y toast. */
export function W24CopyButton({ value }: { value: string }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const copy = async () => {
    if (await copyText(value)) {
      setCopied(true);
      toast.show(`Código ${value} copiado al portapapeles.`);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } else {
      toast.show(`No se pudo copiar automáticamente. Código: ${value}`, { icon: "info", durationMs: 8000 });
    }
  };

  return (
    <button
      type="button"
      className="px-2.5 py-1 rounded bg-surface-container text-primary hover:bg-surface-container-highest transition-colors font-ui-label text-ui-label font-bold cursor-pointer"
      id="copy-btn"
      aria-label={`Copiar código de seguimiento ${value}`}
      onClick={copy}
    >
      <span aria-hidden="true">{copied ? "Copiado" : "Copiar"}</span>
    </button>
  );
}

/** Botón de impresión (W24). */
export function W24PrintButton({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.print()}>
      {children}
    </button>
  );
}
