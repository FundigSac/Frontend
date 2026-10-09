import type { Metadata } from "next";
import { ScreenW18 } from "@/screens/w18";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones",
  description: "Libro de Reclamaciones virtual de FUNDIGSAC S.A.C.",
  alternates: { canonical: "/reclamaciones" },
};

export default function ComplaintsPage() {
  return <ScreenW18 />;
}
