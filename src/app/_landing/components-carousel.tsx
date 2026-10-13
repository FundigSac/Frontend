"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

type Item = { title: string; href: string; image: string; alt: string; width: number; height: number };

const INTERVAL = 4500;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function ComponentsCarousel({ items }: { items: Item[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => false);
  const playing = userPlaying ?? !reducedMotion;

  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
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

  // Avance automático; se detiene mientras el usuario está sobre el carrusel o lo recorre con teclado.
  useEffect(() => {
    if (!playing || hovered) return;
    const timer = window.setInterval(() => step(1, true), INTERVAL);
    return () => window.clearInterval(timer);
  }, [playing, hovered, step]);

  const manual = (dir: 1 | -1) => {
    setUserPlaying(false);
    step(dir);
  };

  return (
    <>
      <div className="lp-shell lp-components__head">
        <div>
          <p className="lp-eyebrow">Componentes y accesorios</p>
          <h2 id="lp-components-title">Todo para la continuidad de tu proyecto.</h2>
        </div>
        <div className="lp-arrows" role="group" aria-label="Desplazar componentes">
          <button type="button" className="lp-arrow" onClick={() => manual(-1)} disabled={edges.start} aria-label="Anterior">
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2} />
          </button>
          <button type="button" className="lp-arrow" onClick={() => manual(1)} disabled={edges.end} aria-label="Siguiente">
            <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="lp-arrow lp-arrow--quiet"
            onClick={() => setUserPlaying(!playing)}
            aria-label={playing ? "Pausar desplazamiento automático" : "Reanudar desplazamiento automático"}
          >
            {playing ? <Pause aria-hidden="true" size={14} strokeWidth={2.2} /> : <Play aria-hidden="true" size={14} strokeWidth={2.2} />}
          </button>
        </div>
      </div>
      <ul
        className="lp-components__track"
        ref={track}
        onScroll={sync}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onTouchStart={() => setUserPlaying(false)}
      >
        {items.map((item) => (
          <li key={item.title}>
            <Link href={item.href} className="lp-card">
              <span className="lp-card__media">
                <Image src={item.image} alt={item.alt} width={item.width} height={item.height} sizes="(max-width: 640px) 78vw, 340px" />
              </span>
              <span className="lp-card__label">
                {item.title}
                <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
