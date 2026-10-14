"use client";

import { createElement, useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster: string;
  alt: string;
  className?: string;
  /** Se llama si el visor no puede cargarse (sin WebGL o error de red). */
  onFail?: () => void;
};

/**
 * Visor 3D de producto. `@google/model-viewer` se importa solo cuando este
 * componente se monta, es decir, cuando la persona pide "Ver en 3D".
 */
export default function Product3DViewer({ src, poster, alt, className, onFail }: Props) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let alive = true;
    const canvas = document.createElement("canvas");
    const hasGl = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    if (!hasGl) {
      queueMicrotask(() => {
        if (alive) { setFailed(true); onFail?.(); }
      });
      return () => { alive = false; };
    }
    import("@google/model-viewer")
      .then(() => alive && setReady(true))
      .catch(() => {
        if (!alive) return;
        setFailed(true);
        onFail?.();
      });
    return () => {
      alive = false;
    };
  }, [onFail]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onError = () => {
      setFailed(true);
      onFail?.();
    };
    // El GLB referencia sus mapas PBR mediante URLs relativas del mismo origen.
    // El visor los carga una sola vez, incluidos etiqueta y relieve del barniz.
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("error", onError);
    };
  }, [ready, onFail]);

  if (failed) return null;

  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const valveStudio = src.includes("valvula-compuerta.glb");

  return ready
    // React forwards this callback to the custom element; it never reads the ref during render.
    // eslint-disable-next-line react-hooks/refs
    ? createElement("model-viewer", {
        ref: (element: HTMLElement | null) => { ref.current = element; },
        class: className,
        src: `${src}?v=photo-match-41`,
        poster,
        alt,
        "camera-controls": "",
        "touch-action": "pan-y",
        "shadow-intensity": valveStudio ? "0.8" : "0.65",
        "shadow-softness": valveStudio ? "0.85" : "1",
        exposure: valveStudio ? "1" : "0.95",
        ...(valveStudio ? { "tone-mapping": "neutral" } : {}),
        "camera-orbit": valveStudio ? "-90deg 85deg auto" : "55deg 78deg auto",
        "field-of-view": "30deg",
        "environment-image": valveStudio ? "/models/estudio-polyhaven-1k.hdr" : "neutral",
        "interaction-prompt": "none",
        ...(reduce ? {} : { "auto-rotate": "", "auto-rotate-delay": "6000", "rotation-per-second": "12deg" }),
        style: { width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent" },
      })
    : createElement("div", { className, role: "status", "aria-live": "polite", style: { display: "grid", placeItems: "center", color: "#6f797e", fontSize: 14 } }, "Cargando modelo 3D…");
}
