"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { authClient } from "./auth-client";
import { apiErrorMessage, GENERIC_ERROR } from "./errors";
import { rememberPendingEmail } from "./pending-email";
import { fieldErrors, PASSWORD_MIN, registerSchema } from "./schemas";
import { Alert } from "./ui/alert";
import { PasswordField, TextField } from "./ui/fields";
import { LINK } from "./ui/styles";
import { SubmitButton } from "./ui/submit-button";
import { focusFirstInvalid, useGuardedSubmit } from "./use-guarded-submit";

export function RegisterForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { pending, run } = useGuardedSubmit();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    void run(async () => {
      setFormError(null);
      const parsed = registerSchema.safeParse(Object.fromEntries(new FormData(form)));
      if (!parsed.success) {
        setErrors(fieldErrors(parsed.error));
        focusFirstInvalid(form);
        return;
      }
      setErrors({});
      try {
        const { error } = await authClient.signUp.email({ name: parsed.data.name, email: parsed.data.email, password: parsed.data.password, callbackURL: "/correo-verificado?estado=ok" });
        if (error) {
          setFormError(apiErrorMessage(error));
          return;
        }
        // Respuesta idéntica para correos nuevos y ya registrados (sin enumeración de usuarios).
        rememberPendingEmail(parsed.data.email);
        router.push("/verificar-correo");
      } catch {
        setFormError(GENERIC_ERROR);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={pending} className="flex flex-col gap-4">
      {formError ? <Alert>{formError}</Alert> : null}
      <TextField name="name" label="Nombre completo" type="text" autoComplete="name" required error={errors.name} disabled={pending} />
      <TextField name="email" label="Correo electrónico" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} required error={errors.email} disabled={pending} />
      <PasswordField name="password" label="Contraseña" autoComplete="new-password" required minLength={PASSWORD_MIN} hint={`Mínimo ${PASSWORD_MIN} caracteres. Una frase larga es más segura.`} error={errors.password} disabled={pending} />
      <SubmitButton pending={pending} pendingLabel="Creando cuenta…">
        Crear cuenta
      </SubmitButton>
      <p className="text-center font-body-compact text-body-compact text-text-secondary">
        Al crear tu cuenta reconoces la{" "}
        <Link href="/privacidad" className={LINK}>
          Política de Privacidad
        </Link>{" "}
        y los{" "}
        <Link href="/terminos-b2b" className={LINK}>
          Términos B2B
        </Link>
        .
      </p>
    </form>
  );
}
