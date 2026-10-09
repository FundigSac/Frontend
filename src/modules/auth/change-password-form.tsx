"use client";

import { useRef, useState } from "react";
import { authClient } from "./auth-client";
import { apiErrorMessage, GENERIC_ERROR } from "./errors";
import { changePasswordSchema, fieldErrors, PASSWORD_MIN } from "./schemas";
import { Alert } from "./ui/alert";
import { PasswordField } from "./ui/fields";
import { SubmitButton } from "./ui/submit-button";
import { focusFirstInvalid, useGuardedSubmit } from "./use-guarded-submit";

/** Cambio de contraseña vía /api/auth/change-password (con rate limit). Cierra las demás sesiones. */
export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { pending, run } = useGuardedSubmit();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    void run(async () => {
      setMessage(null);
      const parsed = changePasswordSchema.safeParse(Object.fromEntries(new FormData(form)));
      if (!parsed.success) {
        setErrors(fieldErrors(parsed.error));
        focusFirstInvalid(form);
        return;
      }
      setErrors({});
      try {
        const { error } = await authClient.changePassword({
          currentPassword: parsed.data.currentPassword,
          newPassword: parsed.data.newPassword,
          revokeOtherSessions: true,
        });
        if (error) {
          setMessage({ tone: "error", text: apiErrorMessage(error) });
          return;
        }
        form.reset();
        setMessage({ tone: "success", text: "Contraseña actualizada. Cerramos tus otras sesiones activas." });
      } catch {
        setMessage({ tone: "error", text: GENERIC_ERROR });
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={pending} className="flex flex-col gap-4">
      {message ? <Alert tone={message.tone}>{message.text}</Alert> : null}
      <PasswordField name="currentPassword" label="Contraseña actual" autoComplete="current-password" required error={errors.currentPassword} disabled={pending} />
      <PasswordField name="newPassword" label="Nueva contraseña" autoComplete="new-password" required minLength={PASSWORD_MIN} hint={`Mínimo ${PASSWORD_MIN} caracteres.`} error={errors.newPassword} disabled={pending} />
      <PasswordField name="confirm" label="Repite la nueva contraseña" autoComplete="new-password" required error={errors.confirm} disabled={pending} />
      <div className="sm:max-w-[240px]">
        <SubmitButton pending={pending} pendingLabel="Guardando…">
          Cambiar contraseña
        </SubmitButton>
      </div>
    </form>
  );
}
