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

    const block = (e: Event) => e.preventDefault();

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const devtools =
        key === "f12" ||
        (ctrl && e.shiftKey && ["i", "j", "c", "k"].includes(key)) ||
        (e.metaKey && e.altKey && ["i", "j", "c", "u"].includes(key));
      const viewSource = ctrl && ["u", "s"].includes(key);
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
