import { ViewTransition, type ReactNode } from "react";

/**
 * Transición entre páginas con la View Transitions API (vía React): la página que sale se desvanece y la nueva entra
 * con un leve ascenso. Va en los `template.tsx` (se vuelven a montar en cada navegación); la cabecera y el pie viven en
 * el layout y no se mueven. `default="none"`: nada más dentro de la página dispara esta animación (filtros, Suspense…).
 * Sin soporte del navegador el cambio es instantáneo, como antes. Estilos en globals.css (`.page-enter`, `.page-exit`).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
