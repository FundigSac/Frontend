"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useHome } from "@/shared/layout/home-copy";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BLUR } from "@/shared/media/blur";
import { Words } from "./words";

const ITEMS = [
  { href: "/productos/valvulas", image: "/media/home-v2/card-valvulas-hd.webp" },
  { href: "/productos/marcos-y-tapas", image: "/media/home-v3/card-marcos.webp" },
  { href: "/cotizar", image: "/media/home-v3/card-grifos.webp" },
  { href: "/productos?q=acople", image: "/media/home-v3/card-acoples.webp" },
  { href: "/productos/tuberias", image: "/media/home-v3/card-tuberias.webp" },
] as const;

const INTERVAL = 2800;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
// En pantallas táctiles el carrusel se recorre con el dedo: el avance automático solo agregaba movimiento y trabajo
// mientras se hace scroll vertical, y peleaba con el gesto.
const TOUCH_ONLY = "(hover: none)";
// Arrastre con ratón: a partir de este recorrido es un arrastre y el clic que sigue no abre la tarjeta.
const DRAG_THRESHOLD = 6;

function subscribeMotion(onChange: () => void) {
  const queries = [window.matchMedia(REDUCED_MOTION), window.matchMedia(TOUCH_ONLY)];
  queries.forEach((mq) => mq.addEventListener("change", onChange));
  return () => queries.forEach((mq) => mq.removeEventListener("change", onChange));
}

const noAutoplay = () => window.matchMedia(REDUCED_MOTION).matches || window.matchMedia(TOUCH_ONLY).matches;

export function ComponentsCarousel() {
  const t = useHome().components;
  const track = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, noAutoplay, () => false);
  const playing = userPlaying ?? !reducedMotion;

  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 });
    // Barra de avance: su largo es la parte visible del carrusel y se desliza con él.
    if (bar.current && el.scrollWidth > 0) {
      const size = el.clientWidth / el.scrollWidth;
      const at = max > 0 ? el.scrollLeft / max : 0;
      bar.current.style.setProperty("--size", size.toFixed(4));
      bar.current.style.setProperty("--at", at.toFixed(4));
    }
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  const step = useCallback((dir: 1 | -1, wrap = false) => {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (wrap && dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 16), behavior: "smooth" });
  }, []);

  // Avance automático; se detiene mientras el usuario está sobre el carrusel, lo arrastra o lo recorre con teclado.
  useEffect(() => {
    if (!playing || hovered) return;
    const timer = window.setInterval(() => step(1, true), INTERVAL);
    return () => window.clearInterval(timer);
  }, [playing, hovered, step]);

  const manual = (dir: 1 | -1) => {
    setUserPlaying(false);
    step(dir);
  };

  // En pantallas táctiles el carrusel ya se arrastra con el dedo; con ratón se agarra y se suelta igual.
  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      d.moved = true;
      setDragging(true);
      setUserPlaying(false);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (d.moved) e.currentTarget.scrollLeft = d.left - dx;
  };
  const endDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!drag.current) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    // El clic que cierra un arrastre no abre la tarjeta (onClickCapture); justo después se olvida.
    window.setTimeout(() => (drag.current = null), 0);
  };

  return (
    <>
      <div className="lp-shell lp-components__head">
        <div data-reveal="stagger">
          <p className="lp-eyebrow">{t.eyebrow}</p>
          <h2 id="lp-components-title" className="lp-words"><Words text={t.title} /></h2>
        </div>
        <div className="lp-arrows" role="group" aria-label={t.group} data-reveal="fade">
          <button type="button" className="lp-arrow" onClick={() => manual(-1)} disabled={edges.start} aria-label={t.prev}>
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2} />
          </button>
          <button type="button" className="lp-arrow" onClick={() => manual(1)} disabled={edges.end} aria-label={t.next}>
            <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="lp-arrow lp-arrow--quiet"
            onClick={() => setUserPlaying(!playing)}
            aria-label={playing ? t.pause : t.resume}
          >
            {playing ? <Pause aria-hidden="true" size={14} strokeWidth={2.2} /> : <Play aria-hidden="true" size={14} strokeWidth={2.2} />}
          </button>
        </div>
      </div>
      <ul
        className={`lp-components__track${dragging ? " is-dragging" : ""}`}
        data-reveal="stagger"
        ref={track}
        onScroll={sync}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onTouchStart={() => setUserPlaying(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (drag.current?.moved) e.preventDefault();
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {ITEMS.map((item, i) => (
          <li key={item.href}>
            <Link href={item.href} className="lp-card">
              <span className="lp-card__media">
                <Image src={item.image} alt={t.items[i].alt} width={1000} height={617} loading="eager" fetchPriority="low" quality={70} placeholder="blur" blurDataURL={BLUR[item.image]} sizes="(max-width: 640px) 78vw, 340px" />
              </span>
              <span className="lp-card__label">
                {t.items[i].title}
                <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="lp-shell lp-components__progress" aria-hidden="true">
        <span ref={bar} />
      </div>
    </>
  );
}
