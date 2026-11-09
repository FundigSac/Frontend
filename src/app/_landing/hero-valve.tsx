"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { COPY, useLang } from "@/shared/layout/landing-prefs";
import { PAGE } from "./copy";
import { IntentLink } from "./intent-link";

// Ambas variantes comparten lienzo (578×1030): el cuerpo queda alineado al píxel y solo cambia el accionamiento superior.
// Etiqueta y texto alternativo de cada variante: COPY[lang].hero.variants (mismo orden).
const VARIANTS = [
  { id: "sin-timon", src: "/media/home-v2/compuerta-sin-timon-v4.webp" },
  { id: "con-timon", src: "/media/home-v2/compuerta-con-timon-v4.webp" },
] as const;

const FOCAL_MS = 660;
const REDUCED = "(prefers-reduced-motion: reduce)";

/** Isla del héroe: la válvula, su eje y el selector de accionamiento. Es el único estado de la portada. */
export function HeroValve() {
  const [lang] = useLang();
  const h = COPY[lang].hero;
  const t = PAGE[lang].valve;
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  // Alterna entre dos nombres de animación: así un clic nuevo reinicia la anterior sin volver a montar las imágenes.
  const [run, setRun] = useState<"a" | "b" | null>(null);
  const [mounted, setMounted] = useState(false);
  const loaded = useRef<boolean[]>([true, false]);
  const pending = useRef<number | null>(null);
  const clearPrev = useRef(0);

  // La segunda válvula no compite con el LCP: se monta tras el evento load o a la primera intención sobre el selector.
  useEffect(() => {
    const mount = () => window.setTimeout(() => setMounted(true), 0);
    if (document.readyState === "complete") {
      const id = mount();
      return () => window.clearTimeout(id);
    }
    window.addEventListener("load", mount, { once: true });
    return () => window.removeEventListener("load", mount);
  }, []);

  useEffect(() => () => window.clearTimeout(clearPrev.current), []);

  const select = (next: number) => {
    if (next === index) return;
    setMounted(true);
    // Sin la foto descargada no hay nada que mostrar: la elección se aplica en cuanto llega.
    if (!loaded.current[next]) {
      pending.current = next;
      return;
    }
    pending.current = null;
    window.clearTimeout(clearPrev.current);
    if (window.matchMedia(REDUCED).matches) {
      setPrev(null);
      setRun(null);
    } else {
      setPrev(index);
      setRun((r) => (r === "a" ? "b" : "a"));
      clearPrev.current = window.setTimeout(() => setPrev(null), FOCAL_MS);
    }
    setIndex(next);
  };

  const onLoaded = (i: number) => {
    loaded.current[i] = true;
    if (pending.current === i) select(i);
  };

  return (
    <div className="ho-stage">
      <div className="ho-stage__area">
        <div className="ho-valve" data-run={run ?? undefined}>
          <svg className="ho-valve__axis" aria-hidden="true" focusable="false" width="1" height="100%">
            <line x1="0.5" y1="0" x2="0.5" y2="100%" stroke="currentColor" strokeDasharray="18 5 3 5" />
          </svg>
          <span className="ho-valve__leader" aria-hidden="true" />
          {VARIANTS.map((v, i) => (i === 0 || mounted) && (
            <span key={v.id} className={`ho-valve__layer${i === index ? " is-active" : ""}${i === prev ? " is-prev" : ""}`} data-lcp={i === 0 ? "" : undefined}>
              <Image
                className={`lp-hero__valve${i === index ? " is-active" : ""}`}
                src={v.src}
                alt={h.variants[i].alt}
                aria-hidden={i !== index}
                width={578}
                height={1030}
                loading="eager"
                fetchPriority={i === 0 ? "high" : "low"}
                onLoad={() => onLoaded(i)}
                draggable={false}
                sizes="(max-width: 1023px) 216px, 22vw"
              />
            </span>
          ))}
        </div>
      </div>

      <div
        className="ho-selector"
        role="group"
        aria-label={t.group}
        onPointerEnter={() => setMounted(true)}
        onFocus={() => setMounted(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") select((index + 1) % VARIANTS.length);
        }}
      >
        <span className="ho-selector__label">{t.actuation}</span>
        {VARIANTS.map((v, i) => (
          <button key={v.id} type="button" className="lp-hero__ctrl" aria-pressed={i === index} onClick={() => select(i)}>
            {h.variants[i].label}
          </button>
        ))}
      </div>

      <IntentLink className="ho-stage__caption" href="/productos/valvulas/valvula-compuerta-fundigsac">
        <span>{t.caption}</span> <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
      </IntentLink>
    </div>
  );
}
