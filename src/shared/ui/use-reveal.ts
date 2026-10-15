"use client";

import { useEffect, type RefObject } from "react";

/**
 * Revela con una entrada suave los elementos `[data-reveal]` de un contenedor cuando pasan por la pantalla.
 * Sin JavaScript o con "reducir movimiento" todo queda visible; lo que ya está en pantalla al montar no parpadea.
 * El CSS oculta solo `[data-armed] [data-reveal]:not([data-in])` y anima `[data-in="late"]` con transform y opacidad;
 * `data-in="now"` marca lo que ya estaba en pantalla y no se anima para evitar parpadeos.
 */
export function useReveal(ref: RefObject<HTMLElement | null>, deps: readonly unknown[] = []) {
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])"));
    const below = nodes.filter((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.96) {
        el.dataset.in = "now";
        return false;
      }
      return true;
    });
    root.dataset.armed = "";
    if (!below.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "late";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    below.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
