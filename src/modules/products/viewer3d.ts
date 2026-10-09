/**
 * Datos y lógica pura del visor 3D ilustrativo de la válvula de compuerta (W23).
 * Los valores provienen del script del diseño de Stitch (`dnData`) y NO están validados por ingeniería.
 * El visor es una simulación (transformaciones CSS sobre una imagen); no existe aún un modelo GLB oficial.
 */
import { boltThread, findGateValveDn } from "./valve-gate";

export type ViewerDn = {
  dn: number;
  inch: string;
  /** Altura total H (mm). */
  h: number;
  /** Longitud entre bridas L (mm). */
  l: number;
  /** Diámetro de brida Ø D (mm). */
  d: number;
  weight: string;
  torque: string;
  turns: string;
  /** Diámetro del círculo de pernos (mm). */
  pcd: number;
};

export const VIEWER_DNS: readonly ViewerDn[] = [
  { dn: 50, inch: '2" NPS', h: 250, l: 150, d: 165, weight: "11.2 kg", torque: "35 N·m", turns: "12.5 vueltas", pcd: 125 },
  { dn: 80, inch: '3" NPS', h: 310, l: 180, d: 200, weight: "17.5 kg", torque: "55 N·m", turns: "17.0 vueltas", pcd: 160 },
  { dn: 100, inch: '4" NPS', h: 350, l: 190, d: 220, weight: "22.8 kg", torque: "70 N·m", turns: "20.0 vueltas", pcd: 180 },
  { dn: 150, inch: '6" NPS', h: 440, l: 210, d: 285, weight: "37.5 kg", torque: "95 N·m", turns: "27.5 vueltas", pcd: 240 },
  { dn: 200, inch: '8" NPS', h: 540, l: 230, d: 340, weight: "59.0 kg", torque: "140 N·m", turns: "32.0 vueltas", pcd: 295 },
  { dn: 300, inch: '12" NPS', h: 740, l: 270, d: 460, weight: "118.0 kg", torque: "220 N·m", turns: "44.0 vueltas", pcd: 410 },
];

export const VIEWER_DEFAULT_DN = 150;

export const findViewerDn = (dn: number): ViewerDn => VIEWER_DNS.find((d) => d.dn === dn) ?? VIEWER_DNS[0];

/** Taladrado de brida, derivado de la tabla de la ficha de la válvula (W06) y de la regla de pernos M16/M20/M24 → Ø19/Ø23/Ø28. */
export function flangeDrilling(dn: number): { holes: number; hole: number } {
  const thread = boltThread(dn);
  return { holes: findGateValveDn(dn).holes, hole: thread === "M24" ? 28 : thread === "M20" ? 23 : 19 };
}

export const ACTUATORS = [
  { value: "wheel", name: "Volante Manual", title: "Volante Manual de Fundición", note: "Estándar sobre superficie (Ø 315 mm)" },
  { value: "square", name: "Dado de Maniobra 30x30 mm", title: "Dado / Cuadrante para Zanja", note: "Para llave T telescópica subterránea" },
  { value: "iso5210", name: "Brida ISO 5210 F10/F14", title: "Adaptador Brida ISO 5210", note: "Para actuador eléctrico Auma / Rotork" },
] as const;
export type ActuatorValue = (typeof ACTUATORS)[number]["value"];

export const COMPONENT_DETAILS = {
  bonete: {
    label: "Bonete Fundición Nodular GGG-50",
    text: "Bonete desmontable en hierro dúctil GGG-50. Junta tórica de estanqueidad entre cuerpo y bonete alojada en ranura maquinada con tornillería empotrada y protegida con cera anticorrosiva.",
  },
  cuna: {
    label: "Cuña Vulc. EPDM Grado Agua Potable",
    text: "Cuña enteramente recubierta en elastómero EPDM grado agua potable certificada para contacto sanitario sin deformación plástica bajo 16 bar continuos.",
  },
  brida: {
    label: "Brida Taladrada ISO 7005-2 PN16",
    text: "Bridas integrales de cara plana según EN 1092-2 (ISO 7005-2) taladradas estándar PN 10/16 con acabado fonográfico concéntrico para junta plana elastomérica.",
  },
} as const;
export type ComponentKey = keyof typeof COMPONENT_DETAILS;

/* ---------- Cámara ---------- */
export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 1.6;
export const ZOOM_STEP = 0.15;
/** Velocidad de auto-rotación del diseño: 2° cada 30 ms. */
export const ROTATION_DEG_PER_SECOND = 2 / 0.03;

/** `filter: null` = el estilo por defecto de la imagen (clase `drop-shadow-md` del diseño). */
export type Camera = { zoom: number; angle: number; filter: string | null };
export const DEFAULT_CAMERA: Camera = { zoom: 1, angle: 0, filter: null };
export const isDefaultCamera = (c: Camera) => c.zoom === 1 && c.angle === 0 && c.filter === null;

const round2 = (n: number) => Math.round(n * 100) / 100;
export const clampZoom = (zoom: number) => round2(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom)));
/** Acerca (dir > 0) o aleja (dir < 0) un paso, siempre dentro de [ZOOM_MIN, ZOOM_MAX]. */
export const zoomBy = (zoom: number, dir: number) => clampZoom(zoom + (dir > 0 ? ZOOM_STEP : -ZOOM_STEP));
export const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;

export type PresetView = "flange" | "section" | "wireframe";
export const PRESET_VIEWS: Record<PresetView, Camera> = {
  flange: { angle: 90, zoom: 1.25, filter: null },
  section: { angle: 45, zoom: 1.15, filter: "drop-shadow(0 0 10px rgba(0, 66, 87, 0.4)) contrast(1.1)" },
  wireframe: { angle: 30, zoom: 1, filter: "grayscale(1) invert(0.85) contrast(1.4)" },
};

export const cameraTransform = (zoom: number, angle: number) => `scale(${zoom}) rotateY(${angle}deg)`;
