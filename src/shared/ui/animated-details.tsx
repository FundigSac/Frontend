"use client";

import { useRef, type ComponentPropsWithoutRef, type MouseEvent } from "react";

const OPEN_MS = 340;
const CLOSE_MS = 260;
const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

/** Altura del `<details>` cerrado: el resumen más el relleno y el borde del propio elemento. */
function collapsedHeight(el: HTMLDetailsElement, summary: HTMLElement) {
  const cs = getComputedStyle(el);
  const px = (v: string) => parseFloat(v) || 0;
  return summary.offsetHeight + px(cs.paddingTop) + px(cs.paddingBottom) + px(cs.borderTopWidth) + px(cs.borderBottomWidth);
}

/**
 * `<details>` con apertura y cierre animados (altura con Web Animations API).
 * Conserva la semántica nativa —teclado, lector de pantalla, funcionamiento sin JavaScript— y,
 * con `prefers-reduced-motion: reduce`, abre y cierra al instante. Un clic a mitad de animación
 * invierte el movimiento desde la altura actual, sin saltos.
 */
export function AnimatedDetails({ children, ...props }: ComponentPropsWithoutRef<"details">) {
  const ref = useRef<HTMLDetailsElement>(null);
  const running = useRef<Animation | null>(null);

  const onClick = (event: MouseEvent<HTMLDetailsElement>) => {
    const el = ref.current;
    const summary = el?.querySelector(":scope > summary") as HTMLElement | null;
    if (!el || !summary || !summary.contains(event.target as Node)) return;
    if (typeof el.animate !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // comportamiento nativo
    event.preventDefault();

    const wasClosing = el.dataset.state === "closing";
    const startHeight = el.getBoundingClientRect().height;
    running.current?.cancel();

    const opening = !el.open || wasClosing;
    let endHeight: number;
    if (opening) {
      el.open = true;
      endHeight = el.getBoundingClientRect().height; // altura natural ya abierto
    } else {
      endHeight = collapsedHeight(el, summary);
    }

    el.dataset.state = opening ? "opening" : "closing";
    el.style.overflow = "hidden";
    el.style.boxSizing = "border-box";
    const anim = el.animate({ height: [`${startHeight}px`, `${endHeight}px`] }, { duration: opening ? OPEN_MS : CLOSE_MS, easing: EASE });
    running.current = anim;

    const cleanup = () => {
      if (running.current === anim) running.current = null;
      el.style.overflow = "";
      el.style.boxSizing = "";
    };
    anim.onfinish = () => {
      if (running.current !== anim) return;
      if (!opening) el.open = false;
      delete el.dataset.state;
      cleanup();
    };
    anim.oncancel = () => {
      if (running.current === anim) cleanup();
    };
  };

  return (
    <details ref={ref} {...props} onClick={onClick}>
      {children}
    </details>
  );
}
