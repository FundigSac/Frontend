import type { Metadata } from "next";
import { ForgotScreen } from "@/modules/access/access-forms";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: "Recibe un enlace para crear una contraseña nueva en tu cuenta de FUNDIGSAC.",
  robots: { index: false, follow: false },
};

export default function RecuperarPage() {
  return <ForgotScreen />;
}
