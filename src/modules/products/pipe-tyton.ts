/**
 * Matriz técnica de la tubería de hierro dúctil con junta Tyton C40 (W08), tomada del script del diseño de Stitch.
 * NO son datos validados por ingeniería: ver docs/content/ASSETS_PENDING.md.
 */
export type TytonDn = {
  dn: number;
  /** Espesor de pared nominal (mm), texto para conservar el decimal. */
  thickness: string;
  /** Deflexión angular admisible (grados). */
  deflection: string;
  /** Peso total por tubo de 6 m (kg). */
  weight: number;
  /** Radio de curvatura natural de zanja (m). */
  radius: number;
};

export const TYTON_DNS: readonly TytonDn[] = [
  { dn: 80, thickness: "4.8", deflection: "5.0", weight: 75, radius: 68.7 },
  { dn: 100, thickness: "5.0", deflection: "5.0", weight: 95, radius: 68.7 },
  { dn: 150, thickness: "5.6", deflection: "5.0", weight: 148, radius: 68.7 },
  { dn: 200, thickness: "6.3", deflection: "5.0", weight: 204, radius: 68.7 },
  { dn: 250, thickness: "6.8", deflection: "5.0", weight: 271, radius: 68.7 },
  { dn: 300, thickness: "7.4", deflection: "5.0", weight: 342, radius: 68.7 },
  { dn: 400, thickness: "8.5", deflection: "4.0", weight: 503, radius: 85.9 },
  { dn: 500, thickness: "9.6", deflection: "3.5", weight: 688, radius: 98.2 },
  { dn: 600, thickness: "10.7", deflection: "3.5", weight: 896, radius: 98.2 },
  { dn: 800, thickness: "12.9", deflection: "3.0", weight: 1385, radius: 114.6 },
  { dn: 1000, thickness: "15.1", deflection: "2.5", weight: 1990, radius: 137.5 },
];

export const TYTON_DEFAULT_DN = 200;

/** Pulgadas por DN, sólo para las opciones del formulario (`DN 80 mm (3")`). */
export const TYTON_INCHES: Record<number, number> = { 80: 3, 100: 4, 150: 6, 200: 8, 250: 10, 300: 12, 400: 16, 500: 20, 600: 24, 800: 32, 1000: 40 };

export const findTytonDn = (dn: number): TytonDn => TYTON_DNS.find((d) => d.dn === dn) ?? TYTON_DNS[0];

/** Separador de miles con coma (como `toLocaleString('en-US')` del diseño), sin depender de ICU. */
export const formatThousands = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const tytonSummary = (d: TytonDn) => ({
  selected: `Seleccionado: DN ${d.dn} mm`,
  thickness: d.thickness,
  deflection: d.deflection,
  weight: formatThousands(d.weight),
  radius: `${d.radius} m`,
});

/** Valor de la opción del formulario para un DN (`DN 200`) y viceversa; `Varios` no corresponde a ningún DN. */
export const tytonFormValue = (dn: number) => `DN ${dn}`;
export const tytonDnFromFormValue = (value: string): number | null => {
  const m = /^DN (\d+)$/.exec(value);
  return m ? Number(m[1]) : null;
};
