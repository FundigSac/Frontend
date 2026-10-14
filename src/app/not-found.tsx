import type { Metadata } from "next";
import { NotFoundView } from "./_legal/not-found-view";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false, follow: false } };

export default function NotFound() {
  return <NotFoundView />;
}
