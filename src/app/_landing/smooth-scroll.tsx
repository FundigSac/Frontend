"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
// Solo rueda y trackpad: en pantallas táctiles el desplazamiento nativo ya tiene inercia y suavizarlo lo empeora.
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

let lenis: Lenis | null = null;

/** Sube al inicio con el mismo desplazamiento suave de la portada (instantáneo con "reducir movimiento"). */
export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.1 });
    return;
  }
  window.scrollTo({ top: 0, behavior: window.matchMedia(REDUCED).matches ? "auto" : "smooth" });
}

/**
 * Desplazamiento con peso (Lenis) solo en la portada. Envuelve el scroll nativo: `position: sticky`, las anclas, el
 * teclado y los lectores de pantalla siguen igual. Las listas con scroll propio (chat, carrito, diálogos, carruseles)
 * se desplazan de forma nativa, y con la página bloqueada (menú móvil abierto) Lenis se detiene solo.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia(FINE_POINTER).matches || window.matchMedia(REDUCED).matches) return;
    const instance = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      autoRaf: true,
      autoToggle: true,
      allowNestedScroll: true,
      prevent: (node) => node.tagName === "DIALOG" || node.classList.contains("cd"),
    });
    lenis = instance;
    return () => {
      instance.destroy();
      if (lenis === instance) lenis = null;
    };
  }, []);

  return null;
}
