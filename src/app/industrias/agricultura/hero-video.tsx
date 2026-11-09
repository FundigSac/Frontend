"use client";

import { Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/shared/layout/landing-prefs";

const SRC = "/media/agricultura/hero-1080.mp4";
const PAUSE = { es: "Pausar la animación del fondo", en: "Pause the background animation" } as const;

type SaveData = { connection?: { saveData?: boolean } };

/**
 * El póster del héroe es el elemento LCP: el vídeo se monta tras `load`, solo desde 1024 px, sin ahorro de datos y sin
 * movimiento reducido. Un solo <video>, sin bucle: se reproduce una vez y se queda en el último fotograma.
 */
export function HeroVideo() {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [lang] = useLang();
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if ((navigator as Navigator & SaveData).connection?.saveData) return;

    let id = 0;
    const start = () => { id = window.setTimeout(() => setMounted(true), 400); };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (mounted) video.current?.play().catch(() => undefined);
  }, [mounted]);

  if (!mounted) return null;
  return (
    <>
      <video
        ref={video}
        className="in-hero__video"
        data-ready={ready ? "" : undefined}
        src={SRC}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => { setReady(true); setPlaying(true); }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {/* Dura 10 s: al superar 5 s debe poder detenerse (WCAG 2.2.2). */}
      {playing && (
        <button type="button" className="in-hero__pausa" aria-label={PAUSE[lang]} onClick={() => video.current?.pause()}>
          <Pause aria-hidden="true" size={18} strokeWidth={2} />
        </button>
      )}
    </>
  );
}
