"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Cada pantalla nueva empieza desde arriba. El router deja la página donde estaba (o la alinea con el primer
 * bloque, que queda tapado por la cabecera fija); aquí se fuerza el inicio al cambiar de ruta. «Atrás» y «Adelante»
 * conservan su posición y los enlaces con ancla (#) siguen yendo a su sección.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const first = useRef(true);
  const history = useRef(false);

  useEffect(() => {
    let reset: ReturnType<typeof setTimeout> | undefined;
    const onPop = () => {
      history.current = true;
      clearTimeout(reset);
      reset = setTimeout(() => (history.current = false), 800);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      clearTimeout(reset);
    };
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (history.current || window.location.hash) return;
    const top = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    top();
    // El router puede volver a alinear el bloque tras montar la pantalla: se repite una vez cuando ya pintó.
    const frame = requestAnimationFrame(top);
    const late = setTimeout(top, 150);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(late);
    };
  }, [pathname]);

  return null;
}
