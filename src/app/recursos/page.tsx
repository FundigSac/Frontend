import type { Metadata } from "next";
import { ScreenW13 } from "@/screens/w13";

export const metadata: Metadata = {
  title: "Recursos técnicos",
  description: "Fichas técnicas, catálogos y documentación de productos de hierro dúctil FUNDIGSAC.",
  alternates: { canonical: "/recursos" },
};

export default function ResourcesPage() {
  return <ScreenW13 />;
}
