/**
 * Control del desplazamiento compartido por los botones flotantes. La portada registra aquí su desplazamiento suave
 * (Lenis, en `smooth-scroll.tsx`); el resto del sitio usa el nativo. Separado para que las páginas que solo muestran
 * los botones flotantes no carguen Lenis.
 */
type SmoothScroller = { scrollTo: (target: number, options?: { duration?: number }) => void };

let smooth: SmoothScroller | null = null;

export function setSmoothScroller(scroller: SmoothScroller | null) {
  smooth = scroller;
}

/** Sube al inicio: con el desplazamiento suave de la portada si está activo, si no con el del navegador. */
export function scrollToTop() {
  if (smooth) {
    smooth.scrollTo(0, { duration: 1.1 });
    return;
  }
  window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
