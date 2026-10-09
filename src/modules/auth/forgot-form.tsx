"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { authClient } from "./auth-client";
import { apiErrorMessage, GENERIC_ERROR } from "./errors";
import { fieldErrors, forgotSchema } from "./schemas";
import { Alert } from "./ui/alert";
import { TextField } from "./ui/fields";
import { LINK } from "./ui/styles";
import { SubmitButton } from "./ui/submit-button";
import { focusFirstInvalid, useGuardedSubmit } from "./use-guarded-submit";

export function ForgotForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { pending, run } = useGuardedSubmit();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    void run(async () => {
      setFormError(null);
      const parsed = forgotSchema.safeParse(Object.fromEntries(new FormData(form)));
      if (!parsed.success) {
        setErrors(fieldErrors(parsed.error));
        focusFirstInvalid(form);
        return;
      }
      setErrors({});
      try {
        const { error } = await authClient.requestPasswordReset({ email: parsed.data.email, redirectTo: "/restablecer" });
        if (error) {
          setFormError(apiErrorMessage(error));
          return;
        }
        setSent(true); // mismo mensaje exista o no la cuenta
      } catch {
        setFormError(GENERIC_ERROR);
      }
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="success">
          Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña. Revisa tu bandeja de entrada y la carpeta de spam. El enlace vence en 30 minutos.
        </Alert>
        <p className="text-center font-body-compact text-body-compact text-text-secondary">
          ¿No llegó?{" "}
          <button type="button" className={LINK} onClick={() => setSent(false)}>
            Intentar de nuevo
          </button>
        </p>
        <Link href="/login" className={`${LINK} text-center`}>
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={pending} className="flex flex-col gap-4">
      {formError ? <Alert>{formError}</Alert> : null}
      <TextField name="email" label="Correo electrónico" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} required error={errors.email} disabled={pending} />
      <SubmitButton pending={pending} pendingLabel="Enviando…">
        Enviar enlace
      </SubmitButton>
    </form>
  );
}
