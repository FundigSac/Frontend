"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Vista giratoria: arrastra, desliza o usa las flechas para cambiar entre fotos reales del producto. */
export default function Product360Viewer({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [hint, setHint] = useState(true);
  const start = useRef<{ x: number; i: number } | null>(null);
  const n = images.length;

  useEffect(() => {
    images.forEach((src) => { const im = new Image(); im.src = src; });
  }, [images]);

  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  return (
    <div
      role="group"
      tabIndex={0}
      aria-roledescription="visor 360"
      aria-label={`${alt}. Arrastra o usa las flechas izquierda y derecha para girar.`}
      style={{ position: "relative", width: "100%", height: "100%", background: "#fff", cursor: "grab", touchAction: "pan-y", userSelect: "none" }}
      onPointerDown={(e) => { start.current = { x: e.clientX, i }; setHint(false); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => {
        if (!start.current) return;
        const step = Math.round((e.clientX - start.current.x) / 60);
        setI((((start.current.i - step) % n) + n) % n);
      }}
      onPointerUp={() => { start.current = null; }}
      onPointerCancel={() => { start.current = null; }}
      onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); setHint(false); }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[i]} alt={alt} draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      <div style={{ position: "absolute", left: "50%", bottom: 16, display: "flex", gap: 6, transform: "translateX(-50%)" }} aria-hidden="true">
        {images.map((_, k) => <span key={k} style={{ width: k === i ? 18 : 6, height: 6, borderRadius: 3, background: k === i ? "#0f4c6b" : "#c9d2d8", transition: "width .2s" }} />)}
      </div>
      {hint && <span style={{ position: "absolute", top: 14, left: 14, padding: "7px 12px", borderRadius: 999, background: "rgba(17,28,33,.78)", color: "#fff", fontSize: 12, pointerEvents: "none" }}>Arrastra para girar</span>}
    </div>
  );
}
