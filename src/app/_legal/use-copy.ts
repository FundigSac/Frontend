"use client";

import { useLang } from "@/shared/layout/landing-prefs";
import type { Pair } from "./copy";

/** Devuelve el texto del idioma elegido en el selector del sitio (español por defecto hasta hidratar). */
export function useCopy<T>(pair: Pair<T>): T {
  const [lang] = useLang();
  return pair[lang];
}
