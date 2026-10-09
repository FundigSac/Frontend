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
      setFailed(true);
      onFail?.();
      return;
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
      model?: { materials: { name: string; normalTexture?: { setTexture(t: unknown): void }; pbrMetallicRoughness: { baseColorTexture: { setTexture(t: unknown): void }; setBaseColorFactor(c: number[]): void; setRoughnessFactor(r: number): void } }[] };
      createTexture?: (uri: string) => Promise<unknown>;
    }) | null;
    if (!el) return;
    const onError = () => {
      setFailed(true);
      onFail?.();
    };
    // El logotipo grabado es una imagen aparte: se aplica al terminar de cargar el modelo.
    const onLoad = async () => {
      try {
        if (!el.createTexture) return;
        const decals: Record<string, string> = { etiqueta: "/models/etiqueta-real.png", marcado: "/models/marcado-cuerpo.png", logo: "/models/logo-fundigsac.png" };
        const relief = await el.createTexture("/models/relieve-fundicion.png");
        for (const m of el.model?.materials ?? []) {
          if (m.name === "epoxi-azul") { m.normalTexture?.setTexture(relief); m.pbrMetallicRoughness.setRoughnessFactor(0.46); }
          const src = decals[m.name];
          if (!src) continue;
          const tex = await el.createTexture(src);
          m.pbrMetallicRoughness.baseColorTexture.setTexture(tex);
          m.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
        }
      } catch {
        /* sin logotipo: el modelo sigue siendo válido */
      }
    };
    el.addEventListener("error", onError);
    el.addEventListener("load", onLoad);
    if ((el as unknown as { loaded?: boolean }).loaded) void onLoad();
    return () => {
      el.removeEventListener("error", onError);
      el.removeEventListener("load", onLoad);
    };
  }, [ready, onFail]);

  if (failed) return null;

  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return ready
    ? createElement("model-viewer", {
        ref,
        class: className,
        src,
        poster,
        alt,
        "camera-controls": "",
        "touch-action": "pan-y",
        "shadow-intensity": "1.3",
        "shadow-softness": "1",
        exposure: "1.15",
        "environment-image": "/models/estudio.hdr",
        "interaction-prompt": "auto",
        ...(reduce ? {} : { "auto-rotate": "", "auto-rotate-delay": "1500" }),
        style: { width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent" },
      })
    : createElement("div", { className, role: "status", "aria-live": "polite", style: { display: "grid", placeItems: "center", color: "#6f797e", fontSize: 14 } }, "Cargando modelo 3D…");
}
