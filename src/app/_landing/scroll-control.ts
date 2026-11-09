/** Sube al inicio con el desplazamiento nativo del navegador; con movimiento reducido el salto es inmediato. */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
