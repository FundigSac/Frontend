import { W06Ficha } from "./w06-ficha";

/** Ficha de la válvula de compuerta bridada FUNDIGSAC con galería propia y sin garantía indicada (misma plantilla que la ficha base). */
export function W06FichaFundigsac() {
  return <W06Ficha variant="fundigsac" />;
}

/** Ficha de la válvula de compuerta bridada FUNDIGSAC con garantía extendida y galería propia con cuadrante de maniobra (misma plantilla que la ficha base). */
export function W06FichaGarantiaExtendida() {
  return <W06Ficha variant="extendida" />;
}
