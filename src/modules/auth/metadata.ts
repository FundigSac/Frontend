import type { Metadata } from "next";

/** Todas las páginas de autenticación y cuenta: título único y sin indexación. */
export function authMetadata(title: string, extra: Metadata = {}): Metadata {
  return { title, robots: { index: false, follow: false, nocache: true }, ...extra };
}
