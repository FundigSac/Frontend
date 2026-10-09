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
    const el = ref.current as (HTMLElement & {
      createTexture?: (uri: string) => Promise<unknown>;
      model?: { materials: { name: string; normalTexture?: { setTexture(texture: unknown): void }; pbrMetallicRoughness: { baseColorTexture: { setTexture(texture: unknown): void } } }[] };
    }) | null;
    if (!el) return;
    const onError = () => {
      setFailed(true);
      onFail?.();
    };
    // Los materiales pertenecen al GLB; las texturas usan URLs del mismo origen.
    el.addEventListener("error", onError);
    let active = true;
    const onLoad = async () => {
      if (!el.createTexture) return;
      try {
        const [texture, normal] = await Promise.all([
          el.createTexture("/models/etiqueta-real.png"),
          el.createTexture("/models/valvula-textura-1.png"),
        ]);
        if (!active) return;
        el.model?.materials.find(material => material.name === "etiqueta")?.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
        el.model?.materials.find(material => material.name === "epoxi-azul")?.normalTexture?.setTexture(normal);
      } catch { /* Keep the model usable if the image cannot be decoded. */ }
    };
    el.addEventListener("load", onLoad);
    return () => {
      el.removeEventListener("error", onError);
      active = false;
      el.removeEventListener("load", onLoad);
    };
  }, [ready, onFail]);

  if (failed) return null;

  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return ready
    // React forwards this callback to the custom element; it never reads the ref during render.
    // eslint-disable-next-line react-hooks/refs
    ? createElement("model-viewer", {
        ref: (element: HTMLElement | null) => { ref.current = element; },
        class: className,
        src: `${src}?v=photo-rebuild-hitaly-central-ribs-11`,
        poster,
        alt,
        "camera-controls": "",
        "touch-action": "pan-y",
        "shadow-intensity": "0.65",
        "shadow-softness": "1",
        exposure: "0.95",
        "camera-orbit": "55deg 78deg auto",
        "field-of-view": "30deg",
        "environment-image": "neutral",
        "interaction-prompt": "none",
        ...(reduce ? {} : { "auto-rotate": "", "auto-rotate-delay": "6000", "rotation-per-second": "12deg" }),
        style: { width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent" },
      })
    : createElement("div", { className, role: "status", "aria-live": "polite", style: { display: "grid", placeItems: "center", color: "#6f797e", fontSize: 14 } }, "Cargando modelo 3D…");
}






