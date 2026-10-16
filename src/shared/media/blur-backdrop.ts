import type { CSSProperties } from "react";

/**
 * Fondo difuminado persistente para fotos hero: la miniatura (20 px) queda como fondo del propio <img> y la foto se
 * pinta encima. Con `placeholder="blur"` de next/image el difuminado se retira un fotograma antes de que la foto esté
 * pintada y, al llegar desde otra página, se veía un destello blanco; este fondo no se retira nunca.
 */
export function blurBackdrop(dataUrl: string | undefined, position = "center"): CSSProperties | undefined {
  if (!dataUrl) return undefined;
  return { backgroundImage: `url("${dataUrl}")`, backgroundSize: "cover", backgroundPosition: position, backgroundRepeat: "no-repeat" };
}
