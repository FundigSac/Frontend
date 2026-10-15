import type { Metadata } from "next";
import { RegisterScreen } from "@/modules/access/access-forms";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta de FUNDIGSAC para gestionar cotizaciones, fichas técnicas y pedidos.",
  robots: { index: false, follow: false },
};

export default function RegistroPage() {
  return <RegisterScreen />;
}
