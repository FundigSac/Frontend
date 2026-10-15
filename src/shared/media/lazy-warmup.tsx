"use client";

import { useEffect } from "react";

/**
 * Calienta las imágenes diferidas: cuando la página ya cargó y el navegador está libre, convierte `loading="lazy"`
 * en `eager` de una en una (las más cercanas a la pantalla primero). Así no aparecen en blanco al hacer scroll,
 * sin competir con el LCP. No actúa con ahorro de datos ni en conexiones 2G/3G lentas.
 */
export function LazyWarmup() {
  useEffect(() => {
    const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || /^(slow-2g|2g)$/.test(conn?.effectiveType ?? "")) return;

    let stopped = false;
    const timers: number[] = [];
    const idle = (cb: () => void, timeout: number) => {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      return ric ? ric(cb, { timeout }) : window.setTimeout(cb, 400);
    };

    const run = () => {
      if (stopped) return;
      const pending = [...document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')]
        // Las secciones con `content-visibility: auto` aún sin pintar miden 0: forzar su carga solo provoca el aviso
        // "fill y altura 0" de next/image; el navegador las carga solo al acercarse (y llevan placeholder borroso).
        .filter((img) => !img.complete && img.getBoundingClientRect().height > 0)
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      pending.forEach((img, i) => {
        timers.push(window.setTimeout(() => { if (!stopped) img.loading = "eager"; }, i * 90));
      });
    };

    const start = () => idle(run, 3000);
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      stopped = true;
      window.removeEventListener("load", start);
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return null;
}
