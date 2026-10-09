/**
 * Datos del configurador de la válvula de compuerta bridada F4 (W06).
 * Valores tomados del diseño de Stitch (atributos data-* de los botones DN); NO son datos validados por ingeniería.
 */
export type GateValveDn = {
  dn: number;
  /** Etiqueta del botón, p. ej. `DN 50 (2")`. */
  label: string;
  /** Longitud entre caras F4 (mm). */
  f4: number;
  /** Cantidad de taladros de brida. */
  holes: number;
  sku: string;
  /** Peso neto estimado (kg), como texto para conservar el decimal (`21.0`). */
  weight: string;
};

export const GATE_VALVE_DNS: readonly GateValveDn[] = [
  { dn: 50, label: 'DN 50 (2")', f4: 150, holes: 4, sku: "VCP-F4-050", weight: "10.8" },
  { dn: 65, label: 'DN 65 (2½")', f4: 170, holes: 4, sku: "VCP-F4-065", weight: "13.2" },
  { dn: 80, label: 'DN 80 (3")', f4: 180, holes: 8, sku: "VCP-F4-080", weight: "16.5" },
  { dn: 100, label: 'DN 100 (4")', f4: 190, holes: 8, sku: "VCP-F4-100", weight: "21.0" },
  { dn: 150, label: 'DN 150 (6")', f4: 210, holes: 8, sku: "VCP-F4-150", weight: "38.5" },
  { dn: 200, label: 'DN 200 (8")', f4: 230, holes: 12, sku: "VCP-F4-200", weight: "58.0" },
  { dn: 250, label: 'DN 250 (10")', f4: 250, holes: 12, sku: "VCP-F4-250", weight: "92.0" },
  { dn: 300, label: 'DN 300 (12")', f4: 270, holes: 12, sku: "VCP-F4-300", weight: "128.0" },
];

export const GATE_VALVE_DEFAULT_DN = 150;

/** Métrica de los pernos de brida según el DN (regla del diseño original). */
export const boltThread = (dn: number): "M16" | "M20" | "M24" => (dn >= 250 ? "M24" : dn >= 150 ? "M20" : "M16");

export const findGateValveDn = (dn: number): GateValveDn => GATE_VALVE_DNS.find((d) => d.dn === dn) ?? GATE_VALVE_DNS[0];

export const gateValveSummary = (d: GateValveDn) => ({
  f4: `${d.f4} mm`,
  holes: `${d.holes} taladros ${boltThread(d.dn)}`,
  weight: `${d.weight} kg`,
  skuBadge: `SKU: ${d.sku}`,
  formSku: `${d.sku} · Válvula Compuerta F4 DN${d.dn} PN16`,
});

/** Añade un accesorio al texto de observaciones sin duplicarlo (comportamiento de `presetAcc`). */
export function appendAccessory(current: string, item: string): string {
  if (current.includes(item)) return current;
  return `${current ? `${current}, ` : ""}Incluir ${item}`;
}
