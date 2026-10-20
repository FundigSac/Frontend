import type { Metadata } from "next";
import { VerifyScreen } from "@/modules/access/access-forms";

export const metadata: Metadata = {
  title: "Activar cuenta",
  description: "Confirma tu correo para activar tu cuenta de FUNDIGSAC.",
  robots: { index: false, follow: false },
};

export default function VerificarCorreoPage() {
  return <VerifyScreen />;
}
