"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { setSmoothScroller } from "./scroll-control";

const REDUCED = "(prefers-reduced-motion: reduce)";
// Solo rueda y trackpad: en pantallas táctiles el desplazamiento nativo ya tiene inercia y suavizarlo lo empeora.
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/**
 * Lenis solo en la portada, y solo para las anclas y el desplazamiento programático. La rueda y el trackpad usan el
 * desplazamiento nativo del navegador: con el suavizado de la rueda (lerp 0,12) el scroll se sentía lento y arrastrado.
 * Envuelve el scroll nativo: `position: sticky`, las anclas, el teclado y los lectores de pantalla siguen igual. Las listas con scroll propio (chat, carrito, diálogos, carruseles)
 * se desplazan de forma nativa, y con la página bloqueada (menú móvil abierto) Lenis se detiene solo.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia(FINE_POINTER).matches || window.matchMedia(REDUCED).matches) return;
    const lenis = new Lenis({
      smoothWheel: false,
      syncTouch: false,
      anchors: true,
      autoRaf: true,
      autoToggle: true,
      allowNestedScroll: true,
      prevent: (node) => node.tagName === "DIALOG" || node.classList.contains("cd"),
    });
    setSmoothScroller(lenis);
    return () => {
      setSmoothScroller(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
