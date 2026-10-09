"use client";

import { useEffect, useRef } from "react";

/**
 * Barra de progreso de lectura (políticas legales). Actualiza el ancho directamente en el DOM desde un
 * handler de scroll con rAF (sin re-renderizar). Es decorativa para tecnologías de apoyo (aria-hidden).
 * `minPercent` replica el mínimo visible del diseño de cookies (5 %) una vez que el usuario hace scroll.
 */
export function ContentScrollProgress({ id, className, minPercent = 0, initialWidth, updateOnMount = true }: { id: string; className: string; minPercent?: number; initialWidth?: string; updateOnMount?: boolean }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = bar.current;
      if (!el) return;
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total <= 0) return;
      const pct = (doc.scrollTop / total) * 100;
      el.style.width = `${Math.min(Math.max(pct, minPercent), 100)}%`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    if (updateOnMount) onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [minPercent, updateOnMount]);

  return <div ref={bar} id={id} className={className} style={initialWidth ? { width: initialWidth } : undefined} aria-hidden="true" />;
}
