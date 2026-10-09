import type { Metadata } from "next";
import { ScreenW10 } from "@/screens/w10";

export const metadata: Metadata = {
  title: "Soluciones y aplicaciones",
  description: "Soluciones en hierro dúctil para redes de agua potable, saneamiento y minería.",
  alternates: { canonical: "/soluciones" },
};

export default function SolutionsPage() {
  return <ScreenW10 />;
}
