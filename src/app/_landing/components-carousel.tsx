"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useHome } from "@/shared/layout/home-copy";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BLUR } from "@/shared/media/blur";

const ITEMS = [
  { href: "/productos/valvulas", image: "/media/home-v2/card-valvulas-hd.webp" },
  { href: "/productos/marcos-y-tapas", image: "/media/home-v3/card-marcos.webp" },
  { href: "/productos?q=grifo", image: "/media/home-v3/card-grifos.webp" },
  { href: "/productos?q=acople", image: "/media/home-v3/card-acoples.webp" },
  { href: "/productos/tuberias", image: "/media/home-v3/card-tuberias.webp" },
] as const;

const INTERVAL = 2800;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function ComponentsCarousel() {
  const t = useHome().components;
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
          <p className="lp-eyebrow">{t.eyebrow}</p>
          <h2 id="lp-components-title">{t.title}</h2>
        </div>
        <div className="lp-arrows" role="group" aria-label={t.group}>
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
        className="lp-components__track"
        ref={track}
        onScroll={sync}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onTouchStart={() => setUserPlaying(false)}
      >
        {ITEMS.map((item, i) => (
          <li key={item.href}>
            <Link href={item.href} className="lp-card">
              <span className="lp-card__media">
                <Image src={item.image} alt={t.items[i].alt} width={1000} height={617} loading={i < 4 ? "eager" : "lazy"} fetchPriority="low" quality={70} placeholder="blur" blurDataURL={BLUR[item.image]} sizes="(max-width: 640px) 78vw, 340px" />
              </span>
              <span className="lp-card__label">
                {t.items[i].title}
                <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
