export type SheetSector = "saneamiento" | "agricultura" | "mineria";

/**
 * Productos que presenta la página de cada sector. Se mantiene igual que esas páginas (`industrias/<sector>`): una ficha
 * solo enlaza a un sector que la muestre, para no afirmar usos sin respaldo.
 */
const SECTOR_SHEETS: Record<SheetSector, readonly string[]> = {
  saneamiento: [
    "valvula-compuerta-fundigsac",
    "valvula-reductora-de-presion",
    "valvula-flotadora-bridada",
    "valvula-embone-tipo-luflex",
    "valvula-check-swing",
    "valvula-check-flex",
    "tuberia-hierro-ductil-c40-k9-k7-thd",
    "marco-y-tapa-pesada-2seg",
    "marco-y-tapa-liviana-1seg",
    "medidor-electromagnetico-melec",
  ],
  agricultura: [
    "filtro-tipo-y-bridado-fyb",
    "valvula-compuerta-acerrojada",
    "valvula-reductora-de-presion",
    "valvula-de-aire-3-funciones-premium-vdap",
    "valvula-check-swing",
  ],
  mineria: [
    "tee-hdpe-termofusion-sdr11",
    "maquina-termofusion-serie-hdc",
    "acople-gran-rango-agr",
    "valvula-compuerta-acerrojada",
  ],
};

export function sectorsOfSheet(slug: string): SheetSector[] {
  return (Object.keys(SECTOR_SHEETS) as SheetSector[]).filter((sector) => SECTOR_SHEETS[sector].includes(slug));
}
