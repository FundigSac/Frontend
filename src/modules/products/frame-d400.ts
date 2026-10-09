/** Variantes de cierre del marco y tapa D400 (W09), tomadas del diseño de Stitch. */
export type FrameVariant = { id: "estandar-sedapal" | "antivandalico-p5"; title: string; description: string };

export const FRAME_VARIANTS: readonly FrameVariant[] = [
  { id: "estandar-sedapal", title: "Estándar Sedapal", description: "Cierre elástico por barra deformable. Sin perno exterior." },
  { id: "antivandalico-p5", title: "Antivandálico P5", description: "Perno pentagonal cautivo AISI 304 con llave de dotación." },
];

export const DEFAULT_FRAME_VARIANT: FrameVariant["id"] = "estandar-sedapal";

export const findFrameVariant = (id: string): FrameVariant => FRAME_VARIANTS.find((v) => v.id === id) ?? FRAME_VARIANTS[0];
