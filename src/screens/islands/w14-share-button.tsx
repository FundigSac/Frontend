"use client";

import { copyText } from "@/shared/ui/content-clipboard";
import { useToast } from "@/shared/ui/toast";

/** Botón "Compartir enlace técnico" (W14): copia la URL de la página y avisa con el toast global. */
export function W14ShareButton() {
  const toast = useToast();
  const share = async () => {
    const url = window.location.href;
    if (await copyText(url)) toast.show("Enlace técnico copiado al portapapeles.");
    else toast.show(`No se pudo copiar automáticamente. Copie la URL: ${url}`, { icon: "info", durationMs: 8000 });
  };
  return (
    <button
      className="h-12 px-5 rounded-lg bg-surface-container-high text-on-surface font-button-text text-button-text flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
      id="btn-share"
      type="button"
      onClick={share}
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
        share
      </span>
      <span>
        Compartir enlace técnico
      </span>
    </button>
  );
}
