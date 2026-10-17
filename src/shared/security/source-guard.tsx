"use client";

import { useEffect } from "react";

/**
 * Disuasión básica contra la inspección casual: bloquea clic derecho y los atajos de
 * "ver código fuente" / DevTools. No es seguridad real (el navegador siempre recibe el HTML/JS);
 * la protección de datos sensibles debe estar siempre en el servidor. Sólo activo en producción.
 */
export function SourceGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    // En campos editables el menú contextual sigue disponible: pegar, corregir ortografía o autocompletar no expone nada.
    const editable = (t: EventTarget | null) => t instanceof Element && !!t.closest("input, textarea, select, [contenteditable='true']");
    const block = (e: Event) => {
      if (!editable(e.target)) e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const devtools =
        key === "f12" ||
        (ctrl && e.shiftKey && ["i", "j", "c", "k"].includes(key)) ||
        (e.metaKey && e.altKey && ["i", "j", "c", "u"].includes(key));
      // Sin Shift: Ctrl+Shift+U es "Leer en voz alta" en Edge y entrada Unicode en Linux.
      const viewSource = ctrl && !e.shiftKey && ["u", "s"].includes(key);
      if (devtools || viewSource) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return null;
}
