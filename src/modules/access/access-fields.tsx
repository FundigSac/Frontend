"use client";

import { AlertCircle, Check, Eye, EyeOff, Info, type LucideIcon } from "lucide-react";
import { useEffect, useId, useState, useSyncExternalStore, type InputHTMLAttributes, type ReactNode } from "react";
import type { AccessCopy } from "./access-copy";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  icon: LucideIcon;
  error?: string;
  hint?: ReactNode;
  optional?: string;
  trailing?: ReactNode;
};

export function Field({ label, icon: Icon, error, hint, optional, trailing, ...input }: FieldProps) {
  const id = useId();
  const msg = `${id}-msg`;
  return (
    <div className={`ac-field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="ac-optional"> ({optional})</span>}
      </label>
      <div className="ac-control">
        <Icon className="ac-control__icon" aria-hidden="true" size={18} strokeWidth={1.8} />
        <input id={id} aria-invalid={error ? true : undefined} aria-describedby={error || hint ? msg : undefined} {...input} />
        {trailing}
      </div>
      {error ? (
        <p className="ac-error" id={msg} role="alert">
          <AlertCircle aria-hidden="true" size={14} />
          {error}
        </p>
      ) : (
        hint && (
          <div className="ac-hint" id={msg}>
            {hint}
          </div>
        )
      )}
    </div>
  );
}

export function PasswordField(props: Omit<FieldProps, "type" | "trailing"> & { t: AccessCopy }) {
  const { t, ...rest } = props;
  const [visible, setVisible] = useState(false);
  return (
    <Field
      {...rest}
      type={visible ? "text" : "password"}
      trailing={
        <button type="button" className="ac-eye" onClick={() => setVisible((v) => !v)} aria-label={visible ? t.hide : t.show} aria-pressed={visible}>
          {visible ? <EyeOff aria-hidden="true" size={18} strokeWidth={1.8} /> : <Eye aria-hidden="true" size={18} strokeWidth={1.8} />}
        </button>
      }
    />
  );
}

/** Criterios de contraseña segura y puntaje de 0 a 4. */
export function passwordChecks(value: string) {
  return {
    length: value.length >= 8,
    upper: /[a-z]/.test(value) && /[A-Z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };
}

export function passwordScore(value: string): number {
  if (!value) return 0;
  const c = passwordChecks(value);
  let score = [c.length, c.upper, c.number, c.symbol].filter(Boolean).length;
  if (value.length >= 12 && score >= 3) score = 4;
  if (!c.length) score = Math.min(score, 1);
  return score;
}

export function StrengthMeter({ value, t, rules = false }: { value: string; t: AccessCopy; rules?: boolean }) {
  const score = passwordScore(value);
  const checks = passwordChecks(value);
  return (
    <div className="ac-strength" data-score={value ? score : undefined}>
      <div className="ac-strength__bar" role="meter" aria-label={t.strengthLabel} aria-valuemin={0} aria-valuemax={4} aria-valuenow={score} aria-valuetext={value ? t.strength[score] : undefined}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={value && i < Math.max(score, 1) ? "is-on" : undefined} />
        ))}
      </div>
      {value && <span className="ac-strength__label">{t.strength[score]}</span>}
      {rules && (
        <ul className="ac-rules">
          {(Object.keys(t.rules) as (keyof typeof t.rules)[]).map((k) => (
            <li key={k} className={checks[k] ? "is-ok" : undefined}>
              <span aria-hidden="true">{checks[k] ? <Check size={11} strokeWidth={3} /> : null}</span>
              {t.rules[k]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" width="20" height="20">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

export function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path fill="#fff" d="M16.67 15.47 17.2 12h-3.33V9.75c0-.95.47-1.88 1.95-1.88h1.51V4.92s-1.37-.23-2.68-.23c-2.74 0-4.53 1.66-4.53 4.66V12H7.08v3.47h3.04v8.39a12.1 12.1 0 0 0 3.75 0v-8.39h2.8Z" />
    </svg>
  );
}

/** Parámetro de la URL actual (null en el servidor y durante la hidratación; luego el valor real). */
export function useQueryParam(name: string): string | null {
  return useSyncExternalStore(
    (notify) => {
      window.addEventListener("popstate", notify);
      return () => window.removeEventListener("popstate", notify);
    },
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}

/** Inicio de sesión real con Google: es un enlace (navegación completa a /api/auth/google, que redirige a accounts.google.com). */
function GoogleLink({ label, busyLabel, from, lang }: { label: string; busyLabel: string; from: "login" | "registro"; lang: string }) {
  const next = useQueryParam("next") ?? "";
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    // Al volver con «Atrás» la página puede restaurarse desde caché con el botón aún ocupado.
    const reset = () => setBusy(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);
  const qs = new URLSearchParams({ from, hl: lang, ...(next ? { next } : {}) });
  return (
    <a href={`/api/auth/google?${qs}`} className="ac-social__btn" aria-busy={busy || undefined} onClick={() => setBusy(true)}>
      <GoogleIcon />
      <span>{busy ? busyLabel : label}</span>
    </a>
  );
}

export function SocialButtons({
  labels,
  onPick,
  from,
  lang,
}: {
  labels: { google: string; facebook: string; connecting: string };
  onPick: (provider: "Facebook") => void;
  from: "login" | "registro";
  lang: string;
}) {
  return (
    <div className="ac-social">
      <GoogleLink label={labels.google} busyLabel={labels.connecting} from={from} lang={lang} />
      <button type="button" className="ac-social__btn" onClick={() => onPick("Facebook")}>
        <FacebookIcon />
        <span>{labels.facebook}</span>
      </button>
    </div>
  );
}

export function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="ac-divider" role="separator">
      <span>{children}</span>
    </div>
  );
}

export function Notice({ title, children, tone = "info" }: { title?: string; children: ReactNode; tone?: "info" | "success" | "error" }) {
  return (
    <div className={`ac-notice ac-notice--${tone}`} role={tone === "error" ? "alert" : "status"}>
      {tone === "error" ? <AlertCircle aria-hidden="true" size={18} /> : <Info aria-hidden="true" size={18} />}
      <div>
        {title && <strong>{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
