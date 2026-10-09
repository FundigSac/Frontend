"use client";

import { useActionState } from "react";
import { type ProfileState, updateProfileAction } from "./actions";
import { Alert } from "./ui/alert";
import { TextField } from "./ui/fields";
import { SubmitButton } from "./ui/submit-button";

const INITIAL: ProfileState = { status: "idle" };

export function ProfileForm({ defaults }: { defaults: { name: string; company: string; ruc: string; phone: string } }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, INITIAL);
  const errors = state.errors ?? {};
  return (
    <form action={formAction} noValidate aria-busy={pending} className="flex flex-col gap-4">
      {state.status === "success" ? <Alert tone="success">{state.message}</Alert> : null}
      {state.status === "error" ? <Alert>{state.message}</Alert> : null}
      <TextField name="name" label="Nombre completo" type="text" autoComplete="name" required defaultValue={defaults.name} error={errors.name} disabled={pending} />
      <TextField name="company" label="Empresa" type="text" autoComplete="organization" optional defaultValue={defaults.company} error={errors.company} disabled={pending} />
      <TextField name="ruc" label="RUC" type="text" inputMode="numeric" autoComplete="off" optional maxLength={13} defaultValue={defaults.ruc} hint="11 dígitos. Sólo si facturas a una empresa." error={errors.ruc} disabled={pending} />
      <TextField name="phone" label="Teléfono" type="tel" inputMode="tel" autoComplete="tel" optional defaultValue={defaults.phone} hint="Ejemplo: +51 987 654 321" error={errors.phone} disabled={pending} />
      <div className="sm:max-w-[220px]">
        <SubmitButton pending={pending} pendingLabel="Guardando…">
          Guardar cambios
        </SubmitButton>
      </div>
    </form>
  );
}
