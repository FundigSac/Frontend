"use client";

import { ArrowLeft, ArrowRight, Building2, KeyRound, Loader2, Lock, LogOut, Mail, Phone, ShoppingCart, UserRound } from "lucide-react";
import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { signOut, useAuth, type AuthUser } from "@/modules/auth/use-auth";
import { useLang } from "@/shared/layout/landing-prefs";
import { ACCESS_COPY, type AccessCopy } from "./access-copy";
import { Divider, Field, isEmail, Notice, PasswordField, SocialButtons, StrengthMeter, passwordChecks, useQueryParam } from "./access-fields";
import { SecureNote } from "./access-frame";

type Status = "idle" | "loading" | "done";

/** Simula el envío (vista de diseño): breve espera con indicador de carga y luego el estado final. */
function useFakeSubmit() {
  const [status, setStatus] = useState<Status>("idle");
  const run = () => {
    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 900);
  };
  return { status, run, reset: () => setStatus("idle") };
}

function Submit({ status, label, t }: { status: Status; label: string; t: AccessCopy }) {
  return (
    <button type="submit" className="ac-submit" disabled={status === "loading"} aria-busy={status === "loading"}>
      {status === "loading" ? (
        <>
          <Loader2 className="ac-spin" aria-hidden="true" size={18} />
          {t.loading}
        </>
      ) : (
        <>
          {label}
          <ArrowRight aria-hidden="true" size={18} strokeWidth={2.2} />
        </>
      )}
    </button>
  );
}

/** Código de error que deja el callback de Google en `?error=`. */
const useAuthError = () => useQueryParam("error");

function AuthError({ t, code }: { t: AccessCopy; code: string | null }) {
  if (!code) return null;
  const known = t.auth.errors as Record<string, string>;
  return <Notice tone="error">{known[code] ?? t.auth.errors.unknown}</Notice>;
}

/** Con la sesión abierta, login y registro muestran quién está conectado en lugar del formulario. */
function SignedIn({ t, user }: { t: AccessCopy; user: AuthUser }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="ac-signed" role="status">
      {user.picture && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="ac-signed__avatar" src={user.picture} alt="" width={72} height={72} referrerPolicy="no-referrer" onError={() => setBroken(true)} />
      ) : (
        <span className="ac-signed__avatar" aria-hidden="true">
          {(user.name.trim()[0] ?? "?").toUpperCase()}
        </span>
      )}
      <h2>{t.auth.signedTitle}</h2>
      <p>
        <strong>{user.name}</strong>
        <br />
        {t.auth.signedText(user.email)}
      </p>
      <Link href="/" className="ac-submit">
        {t.auth.home}
        <ArrowRight aria-hidden="true" size={18} strokeWidth={2.2} />
      </Link>
      <button type="button" className="ac-ghost" onClick={() => void signOut()}>
        <LogOut aria-hidden="true" size={16} />
        {t.auth.logout}
      </button>
    </div>
  );
}

function SoonNotice({ t }: { t: AccessCopy }) {
  return (
    <Notice title={t.soon.title}>
      <p>{t.soon.text}</p>
      <Link href="/carrito" className="ac-notice__link">
        <ShoppingCart aria-hidden="true" size={15} />
        {t.soon.quote}
      </Link>
    </Notice>
  );
}

function CardHead({ title, lead, icon }: { title: string; lead: string; icon?: ReactNode }) {
  return (
    <header className="ac-head">
      {icon && <span className="ac-head__icon">{icon}</span>}
      <h2>{title}</h2>
      <p>{lead}</p>
    </header>
  );
}

// ───────── Iniciar sesión ─────────
export function LoginScreen() {
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { status, run } = useFakeSubmit();
  const { user } = useAuth();
  const authError = useAuthError();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      email: !email.trim() ? t.errors.email : !isEmail(email) ? t.errors.emailFormat : undefined,
      password: !password ? t.errors.password : undefined,
    };
    setErrors(next);
    if (!next.email && !next.password) run();
  };

  if (user) return <SignedIn t={t} user={user} />;
  return (
    <>
      <CardHead title={t.login.title} lead={t.login.lead} />
      <AuthError t={t} code={authError} />
      <form className="ac-form" onSubmit={onSubmit} noValidate>
        <Field label={t.email} icon={Mail} type="email" autoComplete="email" placeholder={t.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <PasswordField t={t} label={t.password} icon={Lock} autoComplete="current-password" placeholder={t.passwordPh} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <div className="ac-row">
          <label className="ac-check">
            <input type="checkbox" name="remember" />
            <span aria-hidden="true" />
            {t.remember}
          </label>
          <Link href="/recuperar" className="ac-link">
            {t.forgot}
          </Link>
        </div>
        <Submit status={status} label={t.login.submit} t={t} />
        {status === "done" && <SoonNotice t={t} />}
      </form>
      <Divider>{t.or}</Divider>
      <SocialButtons labels={{ google: t.google, connecting: t.auth.connecting }} from="login" lang={lang} />
      <p className="ac-switch">
        {t.noAccount} <Link href="/registro">{t.signupHere}</Link>
      </p>
      <SecureNote />
    </>
  );
}

// ───────── Crear cuenta ─────────
export function RegisterScreen() {
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", password: "", confirm: "", terms: false });
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "password" | "confirm" | "terms", string>>>({});
  const { status, run } = useFakeSubmit();
  const { user } = useAuth();
  const authError = useAuthError();
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const c = passwordChecks(form.password);
    const next = {
      name: form.name.trim().length < 3 ? t.errors.name : undefined,
      email: !form.email.trim() ? t.errors.email : !isEmail(form.email) ? t.errors.emailFormat : undefined,
      password: !c.length || !(c.number && /[a-z]/i.test(form.password)) ? t.errors.passwordWeak : undefined,
      confirm: form.confirm !== form.password || !form.confirm ? t.errors.confirm : undefined,
      terms: !form.terms ? t.errors.terms : undefined,
    };
    setErrors(next);
    if (Object.values(next).every((v) => !v)) run();
  };

  const terms = t.terms("§a", "§b");
  if (user) return <SignedIn t={t} user={user} />;
  return (
    <>
      <CardHead title={t.register.title} lead={t.register.lead} />
      <AuthError t={t} code={authError} />
      <SocialButtons labels={{ google: t.googleSignup, connecting: t.auth.connecting }} from="registro" lang={lang} />
      <Divider>{t.orEmail}</Divider>
      <form className="ac-form" onSubmit={onSubmit} noValidate>
        <div className="ac-grid">
          <Field label={t.name} icon={UserRound} autoComplete="name" placeholder={t.namePh} value={form.name} onChange={set("name")} error={errors.name} />
          <Field label={t.company} optional={t.optional} icon={Building2} autoComplete="organization" placeholder={t.companyPh} value={form.company} onChange={set("company")} />
          <Field label={t.email} icon={Mail} type="email" autoComplete="email" placeholder={t.emailPh} value={form.email} onChange={set("email")} error={errors.email} />
          <Field label={t.phone} optional={t.optional} icon={Phone} type="tel" autoComplete="tel" placeholder={t.phonePh} value={form.phone} onChange={set("phone")} />
        </div>
        <PasswordField
          t={t}
          label={t.password}
          icon={Lock}
          autoComplete="new-password"
          placeholder={t.newPasswordPh}
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint={<StrengthMeter value={form.password} t={t} />}
        />
        <PasswordField t={t} label={t.confirmPassword} icon={KeyRound} autoComplete="new-password" placeholder={t.confirmPh} value={form.confirm} onChange={set("confirm")} error={errors.confirm} />
        <label className={`ac-check ac-check--block${errors.terms ? " has-error" : ""}`}>
          <input type="checkbox" checked={form.terms} onChange={set("terms")} aria-invalid={errors.terms ? true : undefined} />
          <span aria-hidden="true" />
          <span>
            {terms.map((part, i) =>
              part === "§a" ? (
                <Link key={i} href="/terminos" className="ac-link">
                  {t.termsLink}
                </Link>
              ) : part === "§b" ? (
                <Link key={i} href="/privacidad" className="ac-link">
                  {t.privacyLink}
                </Link>
              ) : (
                part
              ),
            )}
          </span>
        </label>
        {errors.terms && (
          <p className="ac-error" role="alert">
            {errors.terms}
          </p>
        )}
        <label className="ac-check ac-check--block">
          <input type="checkbox" />
          <span aria-hidden="true" />
          <span>{t.news}</span>
        </label>
        <Submit status={status} label={t.register.submit} t={t} />
        {status === "done" && <SoonNotice t={t} />}
      </form>
      <p className="ac-switch">
        {t.haveAccount} <Link href="/login">{t.loginHere}</Link>
      </p>
    </>
  );
}

// ───────── Recuperar contraseña ─────────
export function ForgotScreen() {
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];
  const s = t.forgotScreen;
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const { status, run } = useFakeSubmit();

  // Solo existe el acceso con Google: no se envía ningún correo, así que no se finge un "revisa tu bandeja".
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = !email.trim() ? t.errors.email : !isEmail(email) ? t.errors.emailFormat : undefined;
    setError(err);
    if (!err) run();
  };

  return (
    <>
      <CardHead title={s.title} lead={s.lead} icon={<KeyRound aria-hidden="true" size={26} strokeWidth={1.8} />} />
      <form className="ac-form" onSubmit={onSubmit} noValidate>
        <Field label={t.email} icon={Mail} type="email" autoComplete="email" placeholder={t.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        <Submit status={status} label={s.submit} t={t} />
        {status === "done" && <SoonNotice t={t} />}
      </form>
      <Link href="/login" className="ac-back">
        <ArrowLeft aria-hidden="true" size={16} />
        {t.back}
      </Link>
      <SecureNote />
    </>
  );
}

// ───────── Actualizar contraseña ─────────
export function ResetScreen() {
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];
  const s = t.resetScreen;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const { status, run } = useFakeSubmit();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const c = passwordChecks(password);
    const next = {
      password: !c.length || !c.number || !c.upper ? t.errors.passwordWeak : undefined,
      confirm: !confirm || confirm !== password ? t.errors.confirm : undefined,
    };
    setErrors(next);
    if (!next.password && !next.confirm) run();
  };

  return (
    <>
      <CardHead title={s.title} lead={s.lead} icon={<Lock aria-hidden="true" size={26} strokeWidth={1.8} />} />
      <form className="ac-form" onSubmit={onSubmit} noValidate>
        <PasswordField
          t={t}
          label={t.newPassword}
          icon={Lock}
          autoComplete="new-password"
          placeholder={t.newPasswordPh}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint={<StrengthMeter value={password} t={t} rules />}
        />
        <PasswordField t={t} label={t.confirmPassword} icon={KeyRound} autoComplete="new-password" placeholder={t.confirmPh} value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <Submit status={status} label={s.submit} t={t} />
        {status === "done" && <SoonNotice t={t} />}
      </form>
      <Link href="/login" className="ac-back">
        <ArrowLeft aria-hidden="true" size={16} />
        {t.back}
      </Link>
    </>
  );
}
