import { W06Ficha } from "./w06-ficha";

/** Ficha de la válvula de compuerta bridada FUNDIGSAC con 1 año de garantía (misma plantilla que la ficha base). */
export function W06FichaGarantia1() {
  return <W06Ficha warranty={1} />;
}

/** Ficha de la válvula de compuerta bridada FUNDIGSAC con 5 años de garantía (misma plantilla que la ficha base). */
export function W06FichaGarantia5() {
  return <W06Ficha warranty={5} />;
}
