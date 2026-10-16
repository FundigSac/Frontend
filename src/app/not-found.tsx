import type { Metadata } from "next";
import { NotFoundView } from "./_legal/not-found-lazy";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false, follow: false } };

export default function NotFound() {
  return <NotFoundView />;
}
