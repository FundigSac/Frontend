import type { Metadata } from "next";
import { ScreenW21 } from "@/screens/w21";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false, follow: false } };

export default function NotFound() {
  return <ScreenW21 />;
}
