"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { COPY, useLang } from "@/shared/layout/landing-prefs";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BLUR } from "@/shared/media/blur";

// Ambas variantes comparten lienzo (578×1030): el cuerpo de la válvula queda alineado al píxel
// y solo cambia el accionamiento superior.
// Etiqueta y texto alternativo de cada variante: COPY[lang].hero.variants (mismo orden).
const VARIANTS = [
  { id: "sin-timon", src: "/media/home-v2/compuerta-sin-timon-v4.webp" },
  { id: "con-timon", src: "/media/home-v2/compuerta-con-timon-v4.webp" },
] as const;

const INTERVAL = 4200;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function HeroCarousel() {
  const [lang] = useLang();
  const h = COPY[lang].hero;
  const [index, setIndex] = useState(0);
  // Variante que sale: se oculta con el mismo barrido con el que entra la nueva (null hasta el primer cambio).
  const [leaving, setLeaving] = useState<number | null>(null);
  // null = comportamiento por defecto (autoplay salvo movimiento reducido); boolean = elección del usuario.
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => false);
  // Pausa mientras el puntero está sobre la válvula o los controles, o el foco está en los controles (WCAG 2.2.2).
  const [held, setHeld] = useState(false);
  // Fuera de pantalla o con la pestaña oculta no se rota ni se anima el fondo (ahorra batería en móvil).
  const [idle, setIdle] = useState(false);
  const autoplay = userPlaying ?? !reducedMotion;
  const playing = autoplay && !held && !idle;
  const section = useRef<HTMLElement>(null);
  const swipeStart = useRef<number | null>(null);
  const hold = { onMouseEnter: () => setHeld(true), onMouseLeave: () => setHeld(false) };

  // La segunda válvula (92 KB) no compite con el LCP: se monta cuando la página terminó de cargar y el carrusel solo
  // rota cuando ya está descargada (medido: −0,5 s de LCP en móvil con 4G simulado).
  const [allMounted, setAllMounted] = useState(false);
  const [restLoaded, setRestLoaded] = useState(false);
  useEffect(() => {
    const mount = () => window.setTimeout(() => setAllMounted(true), 0);
    if (document.readyState === "complete") {
      const id = mount();
      return () => window.clearTimeout(id);
    }
    window.addEventListener("load", mount, { once: true });
    return () => window.removeEventListener("load", mount);
  }, []);

  useEffect(() => {
    const el = section.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let onScreen = true;
    const sync = () => setIdle(!onScreen || document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const show = (next: number) => {
    setLeaving(index);
    setIndex(next);
  };

  useEffect(() => {
    if (!playing || !restLoaded) return;
    const timer = window.setTimeout(() => show((index + 1) % VARIANTS.length), INTERVAL);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, restLoaded, index]);

  // Interacción manual: cambia de inmediato y detiene la reproducción automática.
  const go = (dir: 1 | -1) => {
    setAllMounted(true);
    setUserPlaying(false);
    show((index + dir + VARIANTS.length) % VARIANTS.length);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    swipeStart.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  const currentLabel = h.variants[index].label;

  return (
    <section
      ref={section}
      className="lp-hero"
      data-idle={idle ? "" : undefined}
      aria-labelledby="lp-hero-title"
      aria-roledescription={h.carousel}
    >
      <Image className="lp-hero__photo" src="/media/home-v3/hero-planta.webp" alt="" fill priority fetchPriority="high" quality={70} placeholder="blur" blurDataURL={BLUR["/media/home-v3/hero-planta.webp"]} sizes="100vw" />
      <div className="lp-hero__veil" aria-hidden="true" />

      <div className="lp-shell lp-hero__grid">
        <div className="lp-hero__copy">
          <p className="lp-eyebrow">{h.eyebrow[0]}<br />{h.eyebrow[1]}</p>
          <span className="lp-hero__rule" aria-hidden="true" />
          <h1 id="lp-hero-title">{h.title}</h1>
          <p className="lp-hero__lead">{h.lead}</p>
          <div className="lp-hero__actions">
            <Link href="/productos" className="lp-btn lp-btn--solid">
              {h.explore} <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
            <Link href="/industrias" className="lp-link">
              <span>{h.solutions}</span> <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
            </Link>
          </div>
        </div>

        <div
          className="lp-hero__stage"
          role="group"
          aria-roledescription={h.slide}
          aria-label={h.slideLabel(index + 1, VARIANTS.length, currentLabel)}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipeStart.current = null)}
          data-swapped={leaving === null ? undefined : ""}
          {...hold}
        >
          <span className="lp-hero__shadow" aria-hidden="true" />
          {VARIANTS.map((v, i) => (i === 0 || allMounted) && (
            <Image
              key={v.id}
              className={`lp-hero__valve${i === index ? " is-active" : i === leaving ? " is-leaving" : ""}`}
              src={v.src}
              alt={h.variants[i].alt}
              aria-hidden={i !== index}
              width={578}
              height={1030}
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
              fetchPriority={i === 0 ? "high" : "low"}
              onLoad={i === 0 ? undefined : () => setRestLoaded(true)}
              draggable={false}
              sizes="(max-width: 860px) 78vw, 40vw"
            />
          ))}
        </div>
      </div>

      <div className="lp-shell lp-hero__controls-row">
        {/* Las flechas del teclado cambian de variante solo desde los controles (no desde los enlaces del hero). */}
        <div
          className="lp-hero__controls"
          role="group"
          aria-label={h.controls}
          {...hold}
          onFocus={() => setHeld(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
        >
          <button type="button" className="lp-hero__ctrl" onClick={() => go(-1)} aria-label={h.prev}>
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2} />
          </button>
          <span className="lp-hero__count" aria-hidden="true">
            {String(index + 1).padStart(2, "0")} / {String(VARIANTS.length).padStart(2, "0")}
          </span>
          <span className="lp-hero__bars" aria-hidden="true">
            {VARIANTS.map((v, i) => (
              <i key={v.id} className={i === index ? "is-active" : ""}>
                {i === index && <b key={`${index}-${playing}`} className={playing ? "is-running" : ""} />}
              </i>
            ))}
          </span>
          <button type="button" className="lp-hero__ctrl" onClick={() => go(1)} aria-label={h.next}>
            <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="lp-hero__ctrl lp-hero__ctrl--ghost"
            onClick={() => setUserPlaying(!autoplay)}
            aria-label={autoplay ? h.pause : h.play}
          >
            {autoplay ? <Pause aria-hidden="true" size={15} strokeWidth={2.2} /> : <Play aria-hidden="true" size={15} strokeWidth={2.2} />}
          </button>
        </div>
      </div>
    </section>
  );
}
