import { W06Ficha } from "./w06-ficha";

/** Ficha de la válvula de compuerta bridada FUNDIGSAC con galería propia y sin garantía indicada (misma plantilla que la ficha base). */
export function W06FichaFundigsac() {
  return <W06Ficha variant="fundigsac" />;
}

/** Ficha de la válvula de compuerta bridada FUNDIGSAC con 5 años de garantía (misma plantilla que la ficha base). */
export function W06FichaGarantia5() {
  return <W06Ficha variant={5} />;
}
