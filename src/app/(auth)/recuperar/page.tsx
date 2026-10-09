import Link from "next/link";
import { ForgotForm } from "@/modules/auth/forgot-form";
import { authMetadata } from "@/modules/auth/metadata";
import { AuthCard } from "@/modules/auth/ui/auth-card";
import { LINK } from "@/modules/auth/ui/styles";

export const metadata = authMetadata("Recuperar contraseña");

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Recuperar contraseña"
      description="Ingresa el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña."
      footer={
        <Link href="/login" className={LINK}>
          Volver a iniciar sesión
        </Link>
      }
    >
      <ForgotForm />
    </AuthCard>
  );
}
