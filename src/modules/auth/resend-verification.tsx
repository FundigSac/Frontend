"use client";

import { useEffect, useRef, useState } from "react";
import { authClient } from "./auth-client";
import { apiErrorMessage, GENERIC_ERROR } from "./errors";
import { maskEmail, readPendingEmail } from "./pending-email";
import { emailSchema } from "./schemas";
import { Alert } from "./ui/alert";
import { TextField } from "./ui/fields";
import { BTN_SECONDARY } from "./ui/styles";
import { SubmitButton } from "./ui/submit-button";
import { useGuardedSubmit } from "./use-guarded-submit";

const COOLDOWN_SECONDS = 60;

/** Reenvío del correo de verificación (respuesta genérica; enfriamiento de 60 s en la interfaz). */
export function ResendVerification({ knownEmail }: { knownEmail?: string }) {
  const { pending, run } = useGuardedSubmit();
  const [email, setEmail] = useState<string | null>(knownEmail ?? null);
  const [ready, setReady] = useState(Boolean(knownEmail));
  const [emailError, setEmailError] = useState<string | undefined>();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (knownEmail) return;
    const pendingEmail = readPendingEmail();
    // Lectura única de sessionStorage tras montar (no existe en el servidor).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pendingEmail) setEmail(pendingEmail);
    setReady(true);
  }, [knownEmail]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    void run(async () => {
      setMessage(null);
      const candidate = email ?? String(new FormData(form).get("email") ?? "");
      const parsed = emailSchema.safeParse(candidate);
      if (!parsed.success) {
        setEmailError(parsed.error.issues[0]?.message);
        return;
      }
      setEmailError(undefined);
      try {
        const { error } = await authClient.sendVerificationEmail({ email: parsed.data, callbackURL: "/correo-verificado?estado=ok" });
        if (error) {
          setMessage({ tone: "error", text: apiErrorMessage(error) });
          return;
        }
        setEmail(parsed.data);
        setCooldown(COOLDOWN_SECONDS);
        setMessage({ tone: "success", text: "Si el correo está pendiente de confirmación, enviamos un nuevo enlace. Revisa también la carpeta de spam." });
      } catch {
        setMessage({ tone: "error", text: GENERIC_ERROR });
      }
    });
  }

  if (!ready) return <div aria-hidden="true" className="h-12" />;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={pending} className="flex flex-col gap-4">
      {message ? <Alert tone={message.tone}>{message.text}</Alert> : null}
      {email ? (
        <p className="font-body-compact text-body-compact text-text-secondary">
          Enviaremos el enlace a <strong className="text-on-surface">{maskEmail(email)}</strong>.
        </p>
      ) : (
        <TextField name="email" label="Correo electrónico" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} required error={emailError} disabled={pending} />
      )}
      <SubmitButton pending={pending} pendingLabel="Enviando…" disabled={cooldown > 0} disabledLabel={`Reenviar en ${cooldown} s`} className={BTN_SECONDARY}>
        Reenviar correo de verificación
      </SubmitButton>
    </form>
  );
}
