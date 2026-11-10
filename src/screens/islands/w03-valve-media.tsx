"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type AnimationEvent, type PointerEvent, type ReactNode } from "react";
import styles from "./w03-valvulas.module.css";

/** Inclina la válvula hacia el cursor; solo con ratón (en táctil queda la flotación). */
function tilt(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse") return;
  const el = event.currentTarget;
  const box = el.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width;
  const y = (event.clientY - box.top) / box.height;
  el.style.setProperty("--ry", ((x - 0.5) * 16).toFixed(2) + "deg");
  el.style.setProperty("--rx", ((0.5 - y) * 12).toFixed(2) + "deg");
}

function untilt(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  for (const name of ["--rx", "--ry"]) el.style.removeProperty(name);
}

type Props = {
  href: string;
  label: string;
  images: readonly string[];
  /** Fotos con fondo blanco (sin recorte): no flotan, solo derivan en zoom. */
  flat: boolean;
  /** Posición en la cuadrícula: desfasa la duración para que los carruseles no avancen a la vez. */
  index: number;
  sizes: string;
  dotLabel: (position: number, total: number) => string;
  /** Textos de las flechas: anterior y siguiente. */
  arrowLabels: readonly [string, string];
  children?: ReactNode;
};

/**
 * Foto de tarjeta. Con varias fotos pasa de una a otra sola: la barra de progreso del punto activo
 * marca el tiempo (su fin avanza), se detiene con el cursor encima o fuera de pantalla y, con
 * movimiento reducido, no avanza sola pero los puntos siguen sirviendo.
 */
export function CardMedia({ href, label, images, flat, index, sizes, dotLabel, arrowLabels, children }: Props) {
  const total = images.length;
  const [current, setCurrent] = useState(0);
  const [visited, setVisited] = useState<readonly number[]>(total > 1 ? [0, 1] : [0]);
  const [onScreen, setOnScreen] = useState(true);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || total < 2 || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [total]);

  const go = (next: number) => {
    setCurrent(next);
    setVisited((seen) => [...new Set([...seen, next, (next + 1) % total])]);
  };

  const position = (i: number) => {
    const offset = (i - current + total) % total;
    return offset === 0 ? "active" : offset === total - 1 ? "prev" : "next";
  };

  return (
    <div ref={root} className={styles.cardMedia + (onScreen ? "" : " " + styles.mediaOff)} style={{ ["--dur" as string]: (1.5 + (index % 3) * 0.3).toFixed(2) + "s" }}>
      <Link href={href} className={styles.cardImage + (flat ? " " + styles.cardFlat : "")} onPointerMove={tilt} onPointerLeave={untilt} aria-label={label}>
        <span className={styles.cardMotion} aria-hidden="true">
          {images.map((src, i) =>
            visited.includes(i) ? (
              <span key={src} className={styles.slide} data-pos={position(i)}>
                <Image src={src} alt="" fill sizes={sizes} />
              </span>
            ) : null,
          )}
        </span>
        {children}
      </Link>
      {total > 1 && (
        <>
          <button type="button" className={styles.arrow + " " + styles.arrowPrev} aria-label={arrowLabels[0]} onClick={() => go((current - 1 + total) % total)}>
            <ChevronLeft size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>
          <button type="button" className={styles.arrow + " " + styles.arrowNext} aria-label={arrowLabels[1]} onClick={() => go((current + 1) % total)}>
            <ChevronRight size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </>
      )}
      {total > 1 && (
        <div className={styles.dots} role="group">
          {images.map((src, i) => (
            <button key={src} type="button" className={styles.dot} aria-label={dotLabel(i + 1, total)} aria-current={i === current ? "true" : undefined} onClick={() => go(i)}>
              <span className={styles.dotTrack}>
                {i === current && (
                  <span
                    key={current}
                    className={styles.dotFill}
                    onAnimationEnd={(event: AnimationEvent<HTMLSpanElement>) => {
                      if (event.target === event.currentTarget) go((current + 1) % total);
                    }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
