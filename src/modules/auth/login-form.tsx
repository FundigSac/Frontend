"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { authClient } from "./auth-client";
import { apiErrorMessage, classifyApiError, GENERIC_ERROR } from "./errors";
import { rememberPendingEmail } from "./pending-email";
import { fieldErrors, loginSchema } from "./schemas";
import { Alert } from "./ui/alert";
import { PasswordField, TextField } from "./ui/fields";
import { LINK } from "./ui/styles";
import { SubmitButton } from "./ui/submit-button";
import { focusFirstInvalid, useGuardedSubmit } from "./use-guarded-submit";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { pending, run } = useGuardedSubmit();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    void run(async () => {
      setFormError(null);
      setUnverifiedEmail(null);
      const parsed = loginSchema.safeParse(Object.fromEntries(new FormData(form)));
      if (!parsed.success) {
        setErrors(fieldErrors(parsed.error));
        focusFirstInvalid(form);
        return;
      }
      setErrors({});
      try {
        const { error } = await authClient.signIn.email({ email: parsed.data.email, password: parsed.data.password, callbackURL: next });
        if (!error) return; // el cliente navega a `next` con una carga completa (la cabecera lee la sesión nueva)
        const kind = classifyApiError(error);
        if (kind === "banned") {
          router.push("/cuenta-restringida");
          return;
        }
        if (kind === "email_not_verified") {
          rememberPendingEmail(parsed.data.email);
          setUnverifiedEmail(parsed.data.email);
        }
        setFormError(apiErrorMessage(error));
      } catch {
        setFormError(GENERIC_ERROR);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={pending} className="flex flex-col gap-4">
      {formError ? (
        <Alert>
          <p>{formError}</p>
          {unverifiedEmail ? (
            <p className="mt-1">
              Te reenviamos el enlace de confirmación.{" "}
              <Link href="/verificar-correo" className={LINK}>
                Ver instrucciones
              </Link>
            </p>
          ) : null}
        </Alert>
      ) : null}
      <TextField name="email" label="Correo electrónico" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} required error={errors.email} disabled={pending} />
      <PasswordField
        name="password"
        label="Contraseña"
        autoComplete="current-password"
        required
        error={errors.password}
        disabled={pending}
        labelAside={
          <Link href="/recuperar" className={`${LINK} font-body-compact text-body-compact`}>
            ¿Olvidaste tu contraseña?
          </Link>
        }
      />
      <SubmitButton pending={pending} pendingLabel="Iniciando sesión…">
        Iniciar sesión
      </SubmitButton>
    </form>
  );
}
