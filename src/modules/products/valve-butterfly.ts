/**
 * Datos del selector de DN de la válvula mariposa excéntrica (W07), tomados de los atributos data-* del diseño de Stitch.
 * NO son datos validados por ingeniería: ver docs/content/ASSETS_PENDING.md.
 */
export type ButterflyDn = {
  dn: number;
  /** Diámetro en pulgadas (NPS), sin comillas. */
  inch: number;
  /** Coeficiente de caudal Kv (m³/h). */
  kv: number;
  /** Torque de cierre (N·m) a ΔP = 16 bar. */
  torque: number;
  /** Vueltas del reductor manual. */
  turns: number;
  /** Masa en seco (kg). */
  weight: number;
};

export const BUTTERFLY_DNS: readonly ButterflyDn[] = [
  { dn: 100, inch: 4, kv: 680, torque: 140, turns: 11, weight: 28 },
  { dn: 150, inch: 6, kv: 1620, torque: 260, turns: 11, weight: 42 },
  { dn: 200, inch: 8, kv: 3100, torque: 420, turns: 13, weight: 65 },
  { dn: 250, inch: 10, kv: 4800, torque: 680, turns: 13, weight: 89 },
  { dn: 300, inch: 12, kv: 7200, torque: 950, turns: 17, weight: 122 },
  { dn: 400, inch: 16, kv: 13500, torque: 1850, turns: 17, weight: 210 },
  { dn: 500, inch: 20, kv: 21000, torque: 3100, turns: 24, weight: 345 },
  { dn: 600, inch: 24, kv: 32000, torque: 4800, turns: 24, weight: 490 },
  { dn: 800, inch: 32, kv: 58000, torque: 8900, turns: 32, weight: 920 },
  { dn: 1000, inch: 40, kv: 94000, torque: 15200, turns: 45, weight: 1680 },
];

export const BUTTERFLY_DEFAULT_DN = 200;

export const findButterflyDn = (dn: number): ButterflyDn => BUTTERFLY_DNS.find((d) => d.dn === dn) ?? BUTTERFLY_DNS[0];

export const butterflySummary = (d: ButterflyDn) => ({
  sku: `SKU: VMA-EX-DN${d.dn}`,
  inch: `Diámetro: ${d.inch}" NPS`,
  torque: `${d.torque} N·m`,
  turns: `${d.turns} vueltas`,
  weight: `${d.weight} kg`,
});

/** Texto de la opción del selector del formulario, p. ej. `DN 200 mm (8")`. */
export const butterflyOptionLabel = (d: ButterflyDn) => `DN ${d.dn} mm (${d.inch}")`;
