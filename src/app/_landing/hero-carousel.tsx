"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { COPY, useLang } from "@/shared/layout/landing-prefs";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Ambas variantes comparten lienzo (578×1030): el cuerpo de la válvula queda alineado al píxel
// y solo cambia el accionamiento superior.
const VARIANTS = [
  { id: "sin-timon", label: "Sin timón", src: "/media/home-v2/compuerta-sin-timon-v4.webp", alt: "Válvula compuerta FUNDIGSAC de hierro dúctil sin timón, con dado de maniobra" },
  { id: "con-timon", label: "Con timón", src: "/media/home-v2/compuerta-con-timon-v4.webp", alt: "Válvula compuerta FUNDIGSAC de hierro dúctil con timón de maniobra" },
] as const;

const INTERVAL = 7000;
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
  // null = comportamiento por defecto (autoplay salvo movimiento reducido); boolean = elección del usuario.
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => false);
  const playing = userPlaying ?? !reducedMotion;
  const swipeStart = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % VARIANTS.length), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [playing, index]);

  // Interacción manual: cambia de inmediato y detiene la reproducción automática.
  const go = (dir: 1 | -1) => {
    setUserPlaying(false);
    setIndex((i) => (i + dir + VARIANTS.length) % VARIANTS.length);
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

  const current = VARIANTS[index];

  return (
    <section
      className="lp-hero"
      aria-labelledby="lp-hero-title"
      aria-roledescription="carrusel"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <Image className="lp-hero__photo" src="/media/home-v3/hero-planta.webp" alt="" fill priority sizes="100vw" />
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
            <Link href="/soluciones" className="lp-link">
              <span>{h.solutions}</span> <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
            </Link>
          </div>
        </div>

        <div
          className="lp-hero__stage"
          role="group"
          aria-roledescription="diapositiva"
          aria-label={`${index + 1} de ${VARIANTS.length}: válvula compuerta ${current.label.toLowerCase()}`}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipeStart.current = null)}
        >
          <span className="lp-hero__shadow" aria-hidden="true" />
          {VARIANTS.map((v, i) => (
            <Image
              key={v.id}
              className={`lp-hero__valve${i === index ? " is-active" : ""}`}
              src={v.src}
              alt={v.alt}
              aria-hidden={i !== index}
              width={578}
              height={1030}
              priority={i === 0}
              draggable={false}
              sizes="(max-width: 860px) 78vw, 40vw"
            />
          ))}
        </div>
      </div>

      <div className="lp-shell lp-hero__controls-row">
        <div className="lp-hero__controls" role="group" aria-label="Controles del carrusel">
          <button type="button" className="lp-hero__ctrl" onClick={() => go(-1)} aria-label="Variante anterior">
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
          <button type="button" className="lp-hero__ctrl" onClick={() => go(1)} aria-label="Variante siguiente">
            <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="lp-hero__ctrl lp-hero__ctrl--ghost"
            onClick={() => setUserPlaying(!playing)}
            aria-label={playing ? "Pausar carrusel" : "Reproducir carrusel"}
          >
            {playing ? <Pause aria-hidden="true" size={15} strokeWidth={2.2} /> : <Play aria-hidden="true" size={15} strokeWidth={2.2} />}
          </button>
        </div>
      </div>
    </section>
  );
}
