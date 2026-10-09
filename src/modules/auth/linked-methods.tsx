"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "./auth-client";
import { apiErrorMessage, GENERIC_ERROR } from "./errors";
import { Alert } from "./ui/alert";
import { FacebookLogo, GoogleLogo } from "./ui/brand-icons";

type Provider = "google" | "facebook";
type LinkedAccount = { id: string; providerId: string };

const SMALL_BTN =
  "inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-container-lowest px-4 font-button-text text-button-text text-on-surface hover:bg-surface-container transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

/** Métodos de acceso vinculados: correo/contraseña, Google y Facebook. */
export function LinkedMethods({
  accounts,
  enabled,
  email,
}: {
  accounts: LinkedAccount[];
  enabled: Record<Provider, boolean>;
  email: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const hasPassword = accounts.some((a) => a.providerId === "credential");
  const socialLinked = accounts.filter((a) => a.providerId !== "credential");
  const totalMethods = (hasPassword ? 1 : 0) + socialLinked.length;

  async function link(provider: Provider) {
    if (busy) return;
    setBusy(provider);
    setMessage(null);
    try {
      const { error } = await authClient.linkSocial({ provider, callbackURL: "/cuenta/seguridad", errorCallbackURL: "/auth/error" });
      if (error) {
        setMessage({ tone: "error", text: apiErrorMessage(error) });
        setBusy(null);
      }
    } catch {
      setMessage({ tone: "error", text: GENERIC_ERROR });
      setBusy(null);
    }
  }

  async function unlink(account: LinkedAccount) {
    if (busy) return;
    setBusy(account.id);
    setMessage(null);
    try {
      const { error } = await authClient.unlinkAccount({ accountId: account.id });
      if (error) setMessage({ tone: "error", text: apiErrorMessage(error) });
      else {
        setMessage({ tone: "success", text: "Método desvinculado." });
        router.refresh();
      }
    } catch {
      setMessage({ tone: "error", text: GENERIC_ERROR });
    }
    setBusy(null);
  }

  async function createPassword() {
    if (busy) return;
    setBusy("password");
    setMessage(null);
    try {
      const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/restablecer" });
      setMessage(error ? { tone: "error", text: apiErrorMessage(error) } : { tone: "success", text: "Te enviamos un enlace para crear tu contraseña. Vence en 30 minutos." });
    } catch {
      setMessage({ tone: "error", text: GENERIC_ERROR });
    }
    setBusy(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {message ? <Alert tone={message.tone}>{message.text}</Alert> : null}
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        <li className="flex flex-wrap items-center gap-3 p-4">
          <span aria-hidden="true" className="material-symbols-outlined text-[22px] text-primary">
            mail
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-ui-label text-ui-label text-on-surface">Correo y contraseña</p>
            <p className="font-body-compact text-body-compact text-text-secondary">{hasPassword ? "Activo" : "Sin contraseña definida"}</p>
          </div>
          {hasPassword ? null : (
            <button type="button" onClick={createPassword} disabled={busy !== null} className={SMALL_BTN}>
              Crear contraseña
            </button>
          )}
        </li>
        {(["google", "facebook"] as const).map((provider) => {
          const account = socialLinked.find((a) => a.providerId === provider);
          const name = provider === "google" ? "Google" : "Facebook";
          return (
            <li key={provider} className="flex flex-wrap items-center gap-3 p-4">
              {provider === "google" ? <GoogleLogo size={22} /> : <FacebookLogo size={22} />}
              <div className="min-w-0 flex-1">
                <p className="font-ui-label text-ui-label text-on-surface">{name}</p>
                <p className="font-body-compact text-body-compact text-text-secondary">
                  {account ? "Vinculado" : enabled[provider] ? "No vinculado" : "Pendiente de configuración"}
                </p>
              </div>
              {account ? (
                <button type="button" onClick={() => unlink(account)} disabled={busy !== null || totalMethods < 2} title={totalMethods < 2 ? "Es tu único método de acceso" : undefined} className={SMALL_BTN}>
                  Desvincular
                </button>
              ) : (
                <button type="button" onClick={() => link(provider)} disabled={!enabled[provider] || busy !== null} className={SMALL_BTN}>
                  Vincular
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="font-body-compact text-body-compact text-text-secondary">
        Sólo se vincula un proveedor cuyo correo coincide con el de tu cuenta. Siempre debe quedar al menos un método de acceso.
      </p>
    </div>
  );
}

