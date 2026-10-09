"use client";

import Image from "next/image";
import { Fragment, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ACTUATORS,
  COMPONENT_DETAILS,
  DEFAULT_CAMERA,
  PRESET_VIEWS,
  ROTATION_DEG_PER_SECOND,
  VIEWER_DEFAULT_DN,
  VIEWER_DNS,
  cameraTransform,
  findViewerDn,
  flangeDrilling,
  isDefaultCamera,
  normalizeAngle,
  zoomBy,
  type ActuatorValue,
  type Camera,
  type ComponentKey,
  type PresetView,
} from "@/modules/products/viewer3d";
import { prefersReducedMotion, rovingKeyIndex } from "@/shared/ui/products-keys";

/* ------------------------------------------------------------------ estado compartido */
type Ctx = {
  dn: number;
  selectDn: (dn: number) => void;
  actuation: { value: ActuatorValue; touched: boolean };
  setActuation: (value: ActuatorValue) => void;
  camera: Camera;
  pulse: boolean;
  rotating: boolean;
  view: PresetView | null;
  toggleRotate: () => void;
  stopRotation: () => void;
  zoom: (dir: number) => void;
  rotateBy: (deg: number) => void;
  preset: (view: PresetView) => void;
  reset: () => void;
  detail: ComponentKey | null;
  showDetail: (key: ComponentKey | null) => void;
};
const ViewerContext = createContext<Ctx | null>(null);
function useViewer(): Ctx {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error("W23Provider requerido");
  return ctx;
}

export function W23Provider({ children }: { children: React.ReactNode }) {
  const [dn, setDn] = useState<number>(VIEWER_DEFAULT_DN);
  const [actuation, setActuationState] = useState<{ value: ActuatorValue; touched: boolean }>({ value: "wheel", touched: false });
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const [pulse, setPulse] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [view, setView] = useState<PresetView | null>(null);
  const [detail, setDetail] = useState<ComponentKey | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // La auto-rotación NUNCA arranca sola: sólo con un clic explícito. Se detiene al ocultar la pestaña y se limpia al desmontar.
  useEffect(() => {
    if (!rotating) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      setCamera((c) => ({ ...c, angle: normalizeAngle(c.angle + (ROTATION_DEG_PER_SECOND * dt) / 1000) }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onVisibility = () => {
      if (document.hidden) setRotating(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [rotating]);

  useEffect(
    () => () => {
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    },
    [],
  );

  const rotateBy = useCallback((deg: number) => setCamera((c) => ({ ...c, angle: normalizeAngle(c.angle + deg) })), []);
  const value = useMemo<Ctx>(
    () => ({
      dn,
      selectDn: (next) => {
        setDn(next);
        if (prefersReducedMotion()) return;
        setPulse(true); // pequeño "pulso" de escala como retroalimentación visual (150 ms), como en el diseño
        if (pulseTimer.current) clearTimeout(pulseTimer.current);
        pulseTimer.current = setTimeout(() => setPulse(false), 150);
      },
      actuation,
      setActuation: (v) => setActuationState({ value: v, touched: true }),
      camera,
      pulse,
      rotating,
      view,
      // Con "reducir movimiento" no hay animación continua: cada clic avanza 45° de forma discreta.
      toggleRotate: () => (prefersReducedMotion() ? rotateBy(45) : setRotating((r) => !r)),
      stopRotation: () => setRotating(false),
      zoom: (dir) => setCamera((c) => ({ ...c, zoom: zoomBy(c.zoom, dir) })),
      rotateBy,
      preset: (v) => {
        setRotating(false);
        setCamera(PRESET_VIEWS[v]);
        setView(v);
      },
      reset: () => {
        setRotating(false);
        setCamera(DEFAULT_CAMERA);
        setView(null);
      },
      detail,
      showDetail: setDetail,
    }),
    [dn, actuation, camera, pulse, rotating, view, detail, rotateBy],
  );
  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

/** Número de DN para el título (se actualiza con el selector). */
export function W23DnText() {
  return <>{useViewer().dn}</>;
}

/* ------------------------------------------------------------------ visor */
type ToolDef = { label: string; icon?: string; text?: string; onClick: () => void; pressed?: boolean; id?: string; extraClass?: string };
const TOOLS_COUNT = 8;
const TOOL_BASE = "hover:bg-surface-container-highest/20 transition-colors";
const ICON = "material-symbols-outlined text-[20px] text-brand-on";
const SR_NOTE = "Vista previa ilustrativa: la rotación y el zoom son una simulación sobre una imagen. El modelo 3D oficial (GLB) se publicará cuando esté disponible.";

export function W23Viewport() {
  const v = useViewer();
  const { camera, rotating, view, detail } = v;
  const data = findViewerDn(v.dn);
  const drilling = flangeDrilling(v.dn);
  const [frameElement, setFrameElement] = useState<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [toolIndex, setToolIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const zoomRef = useRef(v.zoom);
  useEffect(() => {
    zoomRef.current = v.zoom;
  });

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [frameElement]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // La rueda sólo hace zoom con Ctrl/⌘ (gesto de pellizco) o con el escenario enfocado, para no secuestrar el scroll de la página.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey || document.activeElement === stage)) return;
      event.preventDefault();
      zoomRef.current(event.deltaY < 0 ? 1 : -1);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, []);

  const toggleFullscreen = () => {
    const frame = frameElement;
    if (!frame) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    if (!frame.requestFullscreen) {
      setNotice("Pantalla completa no disponible en este navegador.");
      return;
    }
    frame.requestFullscreen().catch(() => setNotice("No se pudo activar la pantalla completa."));
  };

  const onToolKey = (event: React.KeyboardEvent, index: number) => {
    const next = rovingKeyIndex(event.key, index, TOOLS_COUNT);
    if (next === null) return;
    event.preventDefault();
    setToolIndex(next);
    const toolbar = event.currentTarget.closest<HTMLElement>('[role="toolbar"]');
    toolbar?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  const onStageKey = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowLeft":
        v.stopRotation();
        v.rotateBy(-10);
        break;
      case "ArrowRight":
        v.stopRotation();
        v.rotateBy(10);
        break;
      case "ArrowUp":
      case "+":
      case "=":
        v.zoom(1);
        break;
      case "ArrowDown":
      case "-":
        v.zoom(-1);
        break;
      case "0":
        v.reset();
        break;
      case "Escape":
        if (!detail) return;
        v.showDetail(null);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if ((event.target as HTMLElement).closest("button") || event.button !== 0) return;
    v.stopRotation();
    drag.current = { x: event.clientX, id: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    v.rotateBy((event.clientX - d.x) * 0.5);
    d.x = event.clientX;
  };
  const endDrag = (event: React.PointerEvent) => {
    if (drag.current?.id === event.pointerId) drag.current = null;
  };

  const tools: ToolDef[] = [
    { label: rotating ? "Detener rotación" : "Rotar modelo 360°", icon: "360", onClick: v.toggleRotate, pressed: rotating, id: "btn-rotate", extraClass: rotating ? " bg-primary" : "" },
    { label: "Acercar (+)", icon: "zoom_in", onClick: () => v.zoom(1) },
    { label: "Alejar (-)", icon: "zoom_out", onClick: () => v.zoom(-1) },
    { label: "Vista de brida", text: "VISTA BRIDA", onClick: () => v.preset("flange"), pressed: view === "flange" },
    { label: "Corte transversal", text: "CORTE TRANSVERSAL", onClick: () => v.preset("section"), pressed: view === "section" },
    { label: "Estructura alámbrica (wireframe)", text: "WIREFRAME", onClick: () => v.preset("wireframe"), pressed: view === "wireframe" },
    { label: "Restablecer cámara", icon: "restart_alt", onClick: v.reset },
    { label: fullscreen ? "Salir de pantalla completa" : "Pantalla completa", icon: "fullscreen", onClick: toggleFullscreen, pressed: fullscreen },
  ];
  // Separadores del diseño tras el índice 0 (rotar), 2 (zoom) y 5 (vistas).
  const SEPARATORS = new Set([0, 2, 5]);

  const transform = isDefaultCamera(camera) && !v.pulse ? undefined : cameraTransform(camera.zoom * (v.pulse ? 0.96 : 1), camera.angle);
  const detailInfo = detail ? COMPONENT_DETAILS[detail] : null;
  const hotspots: { key: ComponentKey; n: number; pos: string }[] = [
    { key: "bonete", n: 1, pos: "top-[28%] left-[51%]" },
    { key: "cuna", n: 2, pos: "top-[68%] left-[50%]" },
    { key: "brida", n: 3, pos: "top-[80%] left-[28%]" },
  ];

  return (
    <div
      className="relative bg-surface rounded-xl overflow-hidden shadow-sm flex flex-col h-[640px] select-none [&:fullscreen]:h-screen"
      id="viewport-frame"
      ref={setFrameElement}
      role="region"
      aria-label="Visor 3D ilustrativo del producto"
      aria-describedby="viewer-illustrative-note"
    >
      <p id="viewer-illustrative-note" className="sr-only">
        {SR_NOTE}
      </p>
      {/* Metrological Millimeter Technical Grid Overlay Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundSize: "24px 24px", backgroundImage: "linear-gradient(to right, rgba(0, 66, 87, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 66, 87, 0.08) 1px, transparent 1px)" }} />
      {/* Secondary Concentric Polar Overlay for Metrology */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <div className="w-[480px] h-[480px] rounded-full border border-dashed border-primary" />
        <div className="w-[280px] h-[280px] rounded-full border border-primary absolute" />
        <div className="w-full h-px bg-primary/20 absolute" />
        <div className="h-full w-px bg-primary/20 absolute" />
      </div>
      {/* Top HUD Data Overlay */}
      <div className="relative z-10 p-4 flex items-center justify-between text-xs text-text-secondary bg-surface-elevated/85 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-primary font-bold font-ui-label" title="Vista previa ilustrativa: simulación sobre imagen, pendiente del modelo GLB oficial">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse motion-reduce:animate-none" />
            MOTOR METROLÓGICO WEBGL 2.0
          </span>
          <span className="text-outline-variant">|</span>
          <span className="font-ui-label">CÁMARA: ISOMÉTRICA ORTOGONAL</span>
          <span className="text-outline-variant">|</span>
          <span className="font-ui-label font-bold text-on-surface" id="current-dn-badge" aria-live="polite">
            {`DN ${v.dn} PN 16`}
            {v.actuation.touched ? ` • [${ACTUATORS.find((a) => a.value === v.actuation.value)?.name}]` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 font-ui-label text-text-muted">
          <span>TOLERANCIA ISO 8062-3 CT9</span>
          <span className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[11px] text-on-surface">60 FPS</span>
        </div>
      </div>
      {/* Central 3D Interactive Stage */}
      <div
        className="relative flex-1 flex items-center justify-center p-8 overflow-hidden cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:-outline-offset-2"
        id="model-stage"
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-label="Escenario del modelo. Flechas izquierda y derecha: rotar. Flechas arriba y abajo, más y menos: zoom. Cero: restablecer."
        style={{ touchAction: "pan-y" }}
        onKeyDown={onStageKey}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Height H Indicator */}
        <div className="absolute left-10 top-20 bottom-24 flex items-center pointer-events-none z-10 transition-all duration-300" id="cota-h-container">
          <div className="h-full flex flex-col items-center justify-between">
            <div className="w-3 h-0.5 bg-primary" />
            <div className="h-full w-0.5 bg-primary relative flex items-center justify-center">
              <div className="px-2 py-0.5 rounded bg-on-surface text-brand-on font-ui-label text-[11px] tracking-wider font-bold whitespace-nowrap shadow-sm [writing-mode:vertical-rl] rotate-180">
                ALTURA H = <span id="val-cota-h">{data.h}</span> mm
              </div>
            </div>
            <div className="w-3 h-0.5 bg-primary" />
          </div>
        </div>
        {/* Length L Indicator */}
        <div className="absolute bottom-12 left-28 right-28 flex flex-col items-center pointer-events-none z-10 transition-all duration-300" id="cota-l-container">
          <div className="w-full flex items-center justify-between">
            <div className="w-0.5 h-3 bg-primary" />
            <div className="w-full h-0.5 bg-primary relative flex items-center justify-center">
              <div className="px-2 py-0.5 rounded bg-on-surface text-brand-on font-ui-label text-[11px] tracking-wider font-bold whitespace-nowrap shadow-sm">
                LONGITUD ENTRE BRIDAS L = <span id="val-cota-l">{data.l}</span> mm
              </div>
            </div>
            <div className="w-0.5 h-3 bg-primary" />
          </div>
        </div>
        {/* Flange Diameter Indicator Top Right */}
        <div className="absolute right-8 top-28 pointer-events-none z-10 transition-all duration-300" id="cota-d-container">
          <div className="flex items-center gap-2 bg-surface-elevated/95 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
              trip_origin
            </span>
            <div className="flex flex-col">
              <span className="font-ui-label text-[10px] text-text-muted leading-tight">{`Ø BRIDA TALADRADA (${drilling.holes}×Ø${drilling.hole})`}</span>
              <span className="font-ui-label text-[13px] font-bold text-on-surface leading-tight">
                Ø D = <span id="val-cota-d">{data.d}</span> mm (PCD {data.pcd})
              </span>
            </div>
          </div>
        </div>
        {/* Core Render Representation: High Precision Ductile Iron Valve Assembly */}
        <div
          className={`relative w-full h-full max-w-[500px] max-h-[460px] flex items-center justify-center ${rotating ? "" : "transition-transform duration-500 motion-reduce:transition-none"}`}
          id="valve-graphics-container"
          style={transform ? { transform } : undefined}
        >
          <Image
            src="/images/stitch/2633b42224.jpg"
            alt="Render ilustrativo de una válvula de compuerta bridada de hierro dúctil con volante y recubrimiento epoxi azul RAL 5005"
            width={1408}
            height={768}
            sizes="500px"
            priority
            className="w-full h-full object-contain filter drop-shadow-md transition-all duration-500 motion-reduce:transition-none select-none pointer-events-none"
            style={camera.filter ? { filter: camera.filter } : undefined}
            id="valve-render-image"
          />
          {/* Exploded / Cross-section Interactive Hotspot Pins */}
          {hotspots.map((spot) => (
            <button
              key={spot.key}
              type="button"
              aria-label={`Componente ${spot.n}: ${COMPONENT_DETAILS[spot.key].label}`}
              aria-expanded={detail === spot.key}
              onClick={() => v.showDetail(detail === spot.key ? null : spot.key)}
              className={`group absolute ${spot.pos} transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5`}
            >
              <span className="w-4 h-4 rounded-full bg-primary text-brand-on font-ui-label text-[9px] font-bold flex items-center justify-center ring-4 ring-primary/20 shadow-md">{spot.n}</span>
              <span className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity bg-on-surface text-brand-on font-ui-label text-[11px] px-2 py-0.5 rounded whitespace-nowrap shadow-md pointer-events-none">
                {COMPONENT_DETAILS[spot.key].label}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Detalle del componente seleccionado (sustituye al alert() del diseño original) */}
      {detailInfo && (
        <div role="region" aria-label="Detalle del componente" aria-live="polite" className="absolute left-4 right-4 sm:right-auto sm:max-w-sm top-20 z-40 bg-surface-elevated rounded-lg shadow-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="font-ui-label text-ui-label font-bold text-on-surface">{detailInfo.label}</p>
            <button type="button" onClick={() => v.showDetail(null)} aria-label="Cerrar detalle" className="p-1 -m-1 rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[18px] text-text-muted" aria-hidden="true">
                close
              </span>
            </button>
          </div>
          <p className="font-body-compact text-[13px] text-text-secondary mt-1.5">{detailInfo.text}</p>
        </div>
      )}
      {/* Floating 3D Navigation Toolbar */}
      <div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-on-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 text-surface-container-lowest shadow-lg"
        role="toolbar"
        aria-label="Controles del visor 3D"
      >
        {tools.map((tool, index) => (
          <Fragment key={tool.label}>
            <button
              id={tool.id}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              aria-pressed={tool.pressed}
              tabIndex={toolIndex === index ? 0 : -1}
              onFocus={() => setToolIndex(index)}
              onKeyDown={(event) => onToolKey(event, index)}
              onClick={tool.onClick}
              className={
                tool.text
                  ? `px-2.5 py-1 ${TOOL_BASE} rounded font-ui-label text-[11px] font-bold text-brand-on${tool.pressed ? " bg-surface-container-highest/20" : ""}`
                  : `p-2 ${TOOL_BASE} rounded-full${tool.extraClass ?? ""}`
              }
            >
              {tool.text ? (
                tool.text
              ) : (
                <span className={ICON} aria-hidden="true">
                  {tool.icon}
                </span>
              )}
            </button>
            {SEPARATORS.has(index) && <span className="w-px h-4 bg-outline-variant/30" />}
          </Fragment>
        ))}
      </div>
      {/* Bottom Status Strip */}
      <div className="relative z-10 px-4 py-2 bg-surface-container/60 flex items-center justify-between text-xs text-text-secondary font-ui-label">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-primary" aria-hidden="true">
              mouse
            </span>
            Clic izquierdo + arrastrar: Rotar orbital
          </span>
          <span className="flex items-center gap-1 hidden sm:flex">
            <span className="material-symbols-outlined text-[15px] text-primary" aria-hidden="true">
              pinch
            </span>
            Rueda: Zoom progresivo
          </span>
        </div>
        <div className="flex items-center gap-2 text-text-muted" aria-live="polite">
          <span>{notice ?? "Geometría validada por Laboratorio FUNDIGSAC Lurín"}</span>
        </div>
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ tarjetas metrológicas */
export function W23Cards() {
  const data = findViewerDn(useViewer().dn);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-live="polite">
      <div className="bg-surface-elevated p-4 rounded-xl shadow-sm flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[24px] mt-0.5" aria-hidden="true">
          straighten
        </span>
        <div className="flex flex-col">
          <span className="font-ui-label text-[11px] text-text-muted uppercase">Distancia Entre Caras</span>
          <span className="font-headline-card text-headline-card text-on-surface font-bold" id="card-dimension-l">
            {data.l} mm
          </span>
          <span className="font-ui-label text-[11px] text-text-secondary">Norma EN 558 Serie 14 (DIN F4)</span>
        </div>
      </div>
      <div className="bg-surface-elevated p-4 rounded-xl shadow-sm flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[24px] mt-0.5" aria-hidden="true">
          fitness_center
        </span>
        <div className="flex flex-col">
          <span className="font-ui-label text-[11px] text-text-muted uppercase">Masa Total Estimada</span>
          <span className="font-headline-card text-headline-card text-on-surface font-bold" id="card-weight">
            {data.weight}
          </span>
          <span className="font-ui-label text-[11px] text-text-secondary">Incluye volante y tornillería A2</span>
        </div>
      </div>
      <div className="bg-surface-elevated p-4 rounded-xl shadow-sm flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[24px] mt-0.5" aria-hidden="true">
          speed
        </span>
        <div className="flex flex-col">
          <span className="font-ui-label text-[11px] text-text-muted uppercase">Presión de Ensayo Hidráulico</span>
          <span className="font-headline-card text-headline-card text-on-surface font-bold">24.0 bar</span>
          <span className="font-ui-label text-[11px] text-text-secondary">Cuerpo (Asiento: 17.6 bar) EN 12266</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ barra lateral */
export function W23DnSelector() {
  const { dn, selectDn } = useViewer();
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span id="w23-dn-label" className="font-ui-label text-ui-label font-bold text-on-surface">
          Diámetro Nominal (DN)
        </span>
        <span className="font-ui-label text-[11px] text-text-muted">Paso Total Hidráulico</span>
      </div>
      <div className="grid grid-cols-3 gap-2" id="dn-selector-group" role="group" aria-labelledby="w23-dn-label">
        {VIEWER_DNS.map((item) => {
          const active = item.dn === dn;
          return (
            <button
              key={item.dn}
              type="button"
              aria-pressed={active}
              onClick={() => selectDn(item.dn)}
              className={`dn-btn py-2 px-3 rounded-lg font-ui-label text-[13px] ${active ? "font-bold bg-primary text-brand-on shadow-sm" : "font-semibold bg-surface hover:bg-surface-container text-on-surface"} transition-all flex flex-col items-center`}
            >
              <span>DN {item.dn}</span>
              <span className={`text-[10px] font-normal ${active ? "opacity-80" : "text-text-muted"}`}>{item.inch}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function W23Actuation() {
  const { actuation, setActuation } = useViewer();
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span id="w23-actuation-label" className="font-ui-label text-ui-label font-bold text-on-surface">
          Tipo de Accionamiento
        </span>
        <span className="font-ui-label text-[11px] text-text-muted">Operación de Cierre</span>
      </div>
      <div className="space-y-2" id="actuation-group" role="radiogroup" aria-labelledby="w23-actuation-label">
        {ACTUATORS.map((item, index) => {
          const checked = actuation.value === item.value;
          return (
            <Fragment key={item.value}>
              {index > 0 && " "}
              <label className={`flex items-center gap-3 p-2.5 rounded-lg ${checked ? "bg-surface-container" : "bg-surface"} cursor-pointer hover:bg-surface-container-high transition-colors`}>
                <input className="w-4 h-4 text-primary focus:ring-primary" name="actuation" type="radio" value={item.value} checked={checked} onChange={() => setActuation(item.value)} />
                <div className="flex flex-col">
                  <span className={`font-ui-label text-[13px] ${checked ? "font-bold" : "font-semibold"} text-on-surface`}>{item.title}</span>
                  <span className="text-[11px] text-text-muted">{item.note}</span>
                </div>
              </label>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function W23ParamTable() {
  const data = findViewerDn(useViewer().dn);
  return (
    <div className="bg-surface rounded-lg p-3 space-y-2">
      <span className="font-ui-label text-[10px] text-text-muted uppercase font-bold tracking-wider">Cotas Parametrizadas Actuales</span>
      <div className="grid grid-cols-2 gap-y-1.5 font-body-compact text-[12px]" aria-live="polite">
        <span className="text-text-secondary">Eje de Husillo:</span>
        <span className="text-right font-bold text-on-surface">Acero Inox AISI 420 Rolado</span>
        <span className="text-text-secondary">Pernos de Bonete:</span>
        <span className="text-right font-bold text-on-surface">Acero Inox A2 Embebidos</span>
        <span className="text-text-secondary">Torque de Cierre:</span>
        <span className="text-right font-bold text-on-surface" id="spec-torque">
          {data.torque}
        </span>
        <span className="text-text-secondary">Vueltas de Cierre:</span>
        <span className="text-right font-bold text-on-surface" id="spec-turns">
          {data.turns}
        </span>
      </div>
    </div>
  );
}
