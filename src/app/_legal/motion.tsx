"use client";

import { useEffect } from "react";

/**
 * Revelado suave al hacer scroll para las páginas legales: solo `opacity` y `transform` (sin layout),
 * y únicamente para lo que queda bajo el primer pantallazo, así no hay parpadeo ni se retrasa el LCP.
 * Con movimiento reducido (o sin IntersectionObserver) no hace nada y todo queda visible.
 */
export function LegalMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("main.lg");
    if (!root || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // El margen superior enorme cuenta como visto lo que quedó arriba: un salto (tecla Fin, ancla, scroll rápido) que
    // pasa por encima de un bloque sin cruzarlo no lo deja invisible para siempre.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "100000px 0px -8% 0px", threshold: 0 },
    );

    const fold = window.innerHeight * 0.92;
    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
      if (node.getBoundingClientRect().top <= fold) return;
      node.classList.add("lg-reveal");
      io.observe(node);
    });

    return () => io.disconnect();
  }, []);

  return null;
}
