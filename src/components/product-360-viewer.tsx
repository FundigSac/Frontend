"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Vista 360°: gira sola, y también con arrastre, flechas del teclado o botones. */
export default function Product360Viewer({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const start = useRef<{ x: number; i: number } | null>(null);
  const n = images.length;

  useEffect(() => {
    images.forEach((src) => { const im = new Image(); im.src = src; });
  }, [images]);

  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % n), 700);
    return () => window.clearInterval(id);
  }, [auto, n]);

  const go = useCallback((d: number) => { setAuto(false); setI((v) => (v + d + n) % n); }, [n]);

  const btn = { position: "absolute" as const, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, border: 0, borderRadius: "50%", background: "rgba(255,255,255,.92)", boxShadow: "0 2px 8px rgba(0,0,0,.16)", cursor: "pointer", fontSize: 22, lineHeight: 1, color: "#111c21" };

  return (
    <div
      role="group"
      tabIndex={0}
      aria-roledescription="visor 360"
      aria-label={`${alt}. Gira automáticamente; arrastra o usa las flechas para controlarlo.`}
      style={{ position: "relative", width: "100%", height: "100%", background: "#fff", cursor: "grab", touchAction: "pan-y", userSelect: "none" }}
      onPointerDown={(e) => { start.current = { x: e.clientX, i }; setAuto(false); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => {
        if (!start.current) return;
        const step = Math.round((e.clientX - start.current.x) / 45);
        setI((((start.current.i - step) % n) + n) % n);
      }}
      onPointerUp={() => { start.current = null; }}
      onPointerCancel={() => { start.current = null; }}
      onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[i]} alt={alt} draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      <button type="button" aria-label="Girar a la izquierda" onClick={() => go(-1)} style={{ ...btn, left: 12 }}>‹</button>
      <button type="button" aria-label="Girar a la derecha" onClick={() => go(1)} style={{ ...btn, right: 12 }}>›</button>
      <button type="button" onClick={() => setAuto((v) => !v)} aria-pressed={auto} style={{ position: "absolute", top: 14, left: 14, padding: "7px 12px", border: 0, borderRadius: 999, background: "rgba(17,28,33,.78)", color: "#fff", fontSize: 12, cursor: "pointer" }}>
        {auto ? "Pausar giro" : "Girar solo"} · arrastra para mover
      </button>
      <div style={{ position: "absolute", left: "50%", bottom: 16, display: "flex", gap: 6, transform: "translateX(-50%)" }} aria-hidden="true">
        {images.map((_, k) => <span key={k} style={{ width: k === i ? 18 : 6, height: 6, borderRadius: 3, background: k === i ? "#0f4c6b" : "#c9d2d8", transition: "width .2s" }} />)}
      </div>
    </div>
  );
}
