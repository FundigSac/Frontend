"use client";

import { useState } from "react";

type State = { key: string; filtered: boolean; current: ReadonlySet<string>; fresh: ReadonlySet<string> };

/**
 * Qué celdas llegan al cambiar un filtro: solo esas se animan (brief §4.4). Desde el primer filtro las celdas dejan
 * de esperar al revelado por desplazamiento. Se ajusta durante el render para que nada se pinte oculto un fotograma.
 */
export function useNewCells(slugs: readonly string[]) {
  const key = slugs.join("|");
  const [state, setState] = useState<State>(() => ({ key, filtered: false, current: new Set(slugs), fresh: new Set() }));
  if (state.key !== key) {
    setState({ key, filtered: true, current: new Set(slugs), fresh: new Set(slugs.filter((slug) => !state.current.has(slug))) });
  }
  return state;
}
