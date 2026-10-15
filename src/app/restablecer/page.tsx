import type { Metadata } from "next";
import { ResetScreen } from "@/modules/access/access-forms";

export const metadata: Metadata = {
  title: "Actualizar contraseña",
  description: "Crea una contraseña nueva y segura para tu cuenta de FUNDIGSAC.",
  robots: { index: false, follow: false },
};

export default function RestablecerPage() {
  return <ResetScreen />;
}
