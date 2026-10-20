"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Motor del revelado al hacer scroll para todo el sitio (ver `motion.css`): un único IntersectionObserver
 * vigila los `[data-reveal]` de la página, también los que React pinta después (filtros, cambios de ruta).
 * Las páginas legales (`main.lg`) siguen con `LegalMotion`, que tiene coreografías propias.
 */
function useRevealEngine() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || window.matchMedia(REDUCED).matches) return;
    const root = document.documentElement;

    // El margen superior enorme cuenta como "visto" todo lo que quedó arriba: un salto (ancla, tecla Fin, scroll
    // rápido) que pasa por encima de un bloque sin cruzarlo no lo deja oculto para siempre.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = entry.boundingClientRect.bottom <= 0 ? "now" : "late";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "100000px 0px -8% 0px", threshold: 0 },
    );

    const scan = () => {
      const fold = window.innerHeight * 0.94;
      for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])")) {
        if (el.closest("main.lg")) continue;
        if (el.dataset.reveal === "stagger") {
          Array.from(el.children).forEach((child, i) => (child as HTMLElement).style.setProperty("--i", String(i)));
        }
        const r = el.getBoundingClientRect();
        // Lo que ya se ve (o quedó arriba) se muestra tal cual: animarlo sería un parpadeo.
        if (r.top < fold && r.bottom > -1) el.dataset.in = "now";
        else if (r.bottom <= 0) el.dataset.in = "now";
        else io.observe(el);
      }
    };

    scan();
    root.dataset.motion = "";

    // React pinta contenido nuevo (cambio de página, resultados filtrados…): se revisa una vez por fotograma.
    let frame = 0;
    const mo = new MutationObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(frame);
      delete root.dataset.motion;
    };
  }, []);
}

type ProgressState = "idle" | "loading" | "done";

/** Destino interno de un clic que cambia de página (no anclas, archivos, pestañas nuevas ni solo filtros). */
function navTarget(e: MouseEvent): string | null {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
  const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return null;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname === location.pathname) return null;
  if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) return null;
  return url.pathname;
}

/**
 * Continuidad entre páginas sin ocultar nada: una línea fina arriba si la página nueva tarda más de 140 ms.
 * (La transición con ViewTransition se descartó: fundía la página a blanco y el usuario lo vio como parpadeo.)
 */
function NavProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<ProgressState>("idle");
  const pending = useRef<string | null>(null);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = navTarget(e);
      if (!target) return;
      clear();
      pending.current = target;
      timers.current.push(
        window.setTimeout(() => pending.current && setState("loading"), 140),
        // Red caída o navegación cancelada: la línea no se queda colgada.
        window.setTimeout(() => { pending.current = null; setState("idle"); }, 12_000),
      );
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clear();
    };
  }, []);

  useEffect(() => {
    if (!pending.current) return;
    pending.current = null;
    clear();
    // Solo se completa si llegó a mostrarse; si la página llegó antes, no se ve nada.
    setState((s) => (s === "loading" ? "done" : "idle"));
    timers.current.push(window.setTimeout(() => setState("idle"), 620));
  }, [pathname]);

  return <div className="mo-progress" data-state={state} aria-hidden="true" />;
}

/** Se monta una vez en el layout raíz. */
export function MotionRoot() {
  useRevealEngine();
  return <NavProgress />;
}
