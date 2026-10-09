"use client";

import { useId, useState } from "react";
import { authClient } from "../auth-client";
import { GENERIC_ERROR } from "../errors";
import { Alert } from "./alert";
import { FacebookLogo, GoogleLogo } from "./brand-icons";
import { BTN_SECONDARY } from "./styles";

type ProviderId = "google" | "facebook";

const LABELS: Record<ProviderId, string> = { google: "Continuar con Google", facebook: "Continuar con Facebook" };

/**
 * Botones "Continuar con…". Un proveedor sólo está activo si el servidor tiene sus credenciales;
 * si no, el botón queda deshabilitado con la nota "Pendiente de configuración" (nunca se simula un acceso).
 */
export function SocialButtons({ enabled, next }: { enabled: Record<ProviderId, boolean>; next: string }) {
  const [busy, setBusy] = useState<ProviderId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const noteId = useId();

  async function start(provider: ProviderId) {
    if (busy) return;
    setError(null);
    setBusy(provider);
    try {
      const { error: apiError } = await authClient.signIn.social({ provider, callbackURL: next, errorCallbackURL: "/auth/error" });
      if (apiError) {
        setError(apiError.status === 429 ? "Demasiados intentos. Espera unos minutos." : GENERIC_ERROR);
        setBusy(null);
      }
      // En éxito el cliente redirige al proveedor; se mantiene "busy" para evitar dobles clics.
    } catch {
      setError(GENERIC_ERROR);
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {(["google", "facebook"] as const).map((provider) => {
        const available = enabled[provider];
        const loading = busy === provider;
        return (
          <div key={provider}>
            <button
              type="button"
              onClick={() => start(provider)}
              disabled={!available || busy !== null}
              aria-disabled={!available || busy !== null}
              aria-busy={loading}
              aria-describedby={available ? undefined : `${noteId}-${provider}`}
              className={`${BTN_SECONDARY} ${available ? "" : "cursor-not-allowed"}`}
            >
              {loading ? (
                <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[18px]">
                  progress_activity
                </span>
              ) : provider === "google" ? (
                <GoogleLogo />
              ) : (
                <FacebookLogo />
              )}
              <span>{LABELS[provider]}</span>
            </button>
            {available ? null : (
              <p id={`${noteId}-${provider}`} className="mt-1 text-center font-ui-label text-ui-label text-text-muted">
                Pendiente de configuración
              </p>
            )}
          </div>
        );
      })}
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3" role="separator" aria-label="o">
      <span className="h-px flex-1 bg-border" />
      <span aria-hidden="true" className="font-ui-label text-ui-label text-text-muted">
        o
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
