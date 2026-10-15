import type { Metadata } from "next";
import { LoginScreen } from "@/modules/access/access-forms";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de FUNDIGSAC: catálogos, fichas técnicas y cotizaciones.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginScreen />;
}
