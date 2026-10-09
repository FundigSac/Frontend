"use client";

import { useEffect, useState } from "react";

/**
 * Scroll-spy: devuelve el id de la sección "actual" (la última cuyo borde superior ya pasó `offset` px desde
 * el borde de la ventana). Al llegar al final de la página activa la última sección. Usa rAF para no saturar.
 */
export function useActiveSection(ids: readonly string[], offset = 140): [string, (id: string) => void] {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      let current = ids[0] ?? "";
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
      if (atBottom && window.scrollY > 0) {
        current = ids[ids.length - 1];
      } else {
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top - offset <= 0) current = id;
        }
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids, offset]);

  return [active, setActive];
}
