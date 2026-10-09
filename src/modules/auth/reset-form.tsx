"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { authClient } from "./auth-client";
import { apiErrorMessage, classifyApiError, GENERIC_ERROR } from "./errors";
import { fieldErrors, PASSWORD_MIN, resetSchema } from "./schemas";
import { Alert } from "./ui/alert";
import { PasswordField } from "./ui/fields";
import { SubmitButton } from "./ui/submit-button";
import { focusFirstInvalid, useGuardedSubmit } from "./use-guarded-submit";

export function ResetForm({ token }: { token: string }) {
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
      const parsed = resetSchema.safeParse(Object.fromEntries(new FormData(form)));
      if (!parsed.success) {
        setErrors(fieldErrors(parsed.error));
        focusFirstInvalid(form);
        return;
      }
      setErrors({});
      try {
        const { error } = await authClient.resetPassword({ newPassword: parsed.data.newPassword, token });
        if (error) {
          if (classifyApiError(error) === "invalid_token") {
            router.replace("/enlace-expirado?tipo=restablecer");
            return;
          }
          setFormError(apiErrorMessage(error));
          return;
        }
        router.replace("/login?estado=restablecida");
      } catch {
        setFormError(GENERIC_ERROR);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={pending} className="flex flex-col gap-4">
      {formError ? <Alert>{formError}</Alert> : null}
      <PasswordField name="newPassword" label="Nueva contraseña" autoComplete="new-password" required minLength={PASSWORD_MIN} hint={`Mínimo ${PASSWORD_MIN} caracteres.`} error={errors.newPassword} disabled={pending} />
      <PasswordField name="confirm" label="Repite la nueva contraseña" autoComplete="new-password" required error={errors.confirm} disabled={pending} />
      <SubmitButton pending={pending} pendingLabel="Guardando…">
        Guardar contraseña
      </SubmitButton>
    </form>
  );
}
