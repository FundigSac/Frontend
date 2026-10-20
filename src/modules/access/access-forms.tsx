"use client";

import { ArrowLeft, ArrowRight, Building2, KeyRound, Loader2, Lock, LogOut, Mail, MailCheck, Phone, ShoppingCart, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { setSignedIn, signOut, useAuth, type AuthUser } from "@/modules/auth/use-auth";
import { useLang } from "@/shared/layout/landing-prefs";
import { ACCESS_COPY, type AccessCopy } from "./access-copy";
import { Divider, Field, isEmail, Notice, PasswordField, SocialButtons, StrengthMeter, passwordChecks, useQueryParam } from "./access-fields";
import { SecureNote } from "./access-frame";
import { accountApi, accountError, signupSource, useHashToken, type AccountResult } from "./account-api";

type Status = "idle" | "loading" | "done";

/** Simula el envío (vista de diseño, sin Backend): breve espera con indicador de carga y luego el estado final. */
function useFakeSubmit() {
  const [status, setStatus] = useState<Status>("idle");
  const run = () => {
    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 900);
  };
  return { status, run, reset: () => setStatus("idle") };
}

/** Envío real a la API: estado de carga y el error ya traducido para mostrar. */
function useApiSubmit(t: AccessCopy) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  async function run<T>(call: () => Promise<AccountResult<T>>): Promise<AccountResult<T>> {
    setStatus("loading");
    setError(null);
    const result = await call();
    if (result.ok) setStatus("done");
    else {
      setStatus("idle");
      setError(accountError(t, result));
    }
    return result;
  }
  return { status, error, setError, run };
}

/** Destino interno tras ingresar (solo rutas del sitio, nunca otra web ni la API). */
function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.startsWith("/api/")) return null;
  return value.slice(0, 300);
}

function Submit({ status, label, t, disabled = false }: { status: Status; label: string; t: AccessCopy; disabled?: boolean }) {
  return (
    <button type="submit" className="ac-submit" disabled={disabled || status === "loading"} aria-busy={status === "loading"}>
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

/** Reenvío del enlace de activación (cuentas que aún no confirmaron su correo). */
function ResendVerification({ t, email }: { t: AccessCopy; email: string }) {
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  if (state === "sent") return <Notice tone="success">{t.api.resent}</Notice>;
  return (
    <button
      type="button"
      className="ac-ghost"
      disabled={state === "loading"}
      onClick={async () => {
        setState("loading");
        await accountApi.resendVerification(email);
        setState("sent");
      }}
    >
      <MailCheck aria-hidden="true" size={16} />
      {t.api.resend}
    </button>
  );
}

// ───────── Iniciar sesión ─────────
export function LoginScreen() {
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [unverified, setUnverified] = useState(false);
  const fake = useFakeSubmit();
  const api = useApiSubmit(t);
  const { user, accounts } = useAuth();
  const authError = useAuthError();
  const next = safeNext(useQueryParam("next"));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fields = {
      email: !email.trim() ? t.errors.email : !isEmail(email) ? t.errors.emailFormat : undefined,
      password: !password ? t.errors.password : undefined,
    };
    setErrors(fields);
    if (fields.email || fields.password) return;
    if (!accounts) return fake.run();
    setUnverified(false);
    const result = await api.run(() => accountApi.login(email.trim(), password, remember));
    if (result.ok) {
      setSignedIn(result.data.user);
      if (next) router.push(next);
    } else if (result.code === "EMAIL_NOT_VERIFIED") setUnverified(true);
  };

  if (user) return <SignedIn t={t} user={user} />;
  const status = accounts ? api.status : fake.status;
  return (
    <>
      <CardHead title={t.login.title} lead={t.login.lead} />
      <AuthError t={t} code={authError} />
      <form className="ac-form" onSubmit={onSubmit} noValidate>
        <Field label={t.email} icon={Mail} type="email" autoComplete="email" placeholder={t.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <PasswordField t={t} label={t.password} icon={Lock} autoComplete="current-password" placeholder={t.passwordPh} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <div className="ac-row">
          <label className="ac-check">
            <input type="checkbox" name="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span aria-hidden="true" />
            {t.remember}
          </label>
          <Link href="/recuperar" className="ac-link">
            {t.forgot}
          </Link>
        </div>
        {api.error && <Notice tone="error">{api.error}</Notice>}
        {unverified && <ResendVerification t={t} email={email.trim()} />}
        <Submit status={status} label={t.login.submit} t={t} />
        {!accounts && fake.status === "done" && <SoonNotice t={t} />}
      </form>
      <Divider>{t.or}</Divider>
      <SocialButtons labels={{ google: t.google, connecting: t.auth.connecting }} from="login" lang={lang} />
      <p className="ac-switch">
        {t.noAccount} <Link href={next ? `/registro?next=${encodeURIComponent(next)}` : "/registro"}>{t.signupHere}</Link>
      </p>
      <SecureNote />
    </>
  );
}

// ───────── Crear cuenta ─────────
type RegisterErrors = Partial<Record<"name" | "email" | "phone" | "password" | "confirm" | "terms", string>>;

/** Campo de la API (DTO del Backend) → campo del formulario. */
const REGISTER_FIELDS: Record<string, keyof RegisterErrors> = { email: "email", password: "password", fullName: "name", phone: "phone", acceptPrivacyNotice: "terms" };

export function RegisterScreen() {
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", password: "", confirm: "", terms: false, news: false });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const fake = useFakeSubmit();
  const api = useApiSubmit(t);
  const { user, accounts } = useAuth();
  const authError = useAuthError();
  const next = useQueryParam("next");
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const c = passwordChecks(form.password);
    const fields: RegisterErrors = {
      name: form.name.trim().length < 3 ? t.errors.name : undefined,
      email: !form.email.trim() ? t.errors.email : !isEmail(form.email) ? t.errors.emailFormat : undefined,
      password: !c.length || !(c.number && /[a-z]/i.test(form.password)) ? t.errors.passwordWeak : undefined,
      confirm: form.confirm !== form.password || !form.confirm ? t.errors.confirm : undefined,
      terms: !form.terms ? t.errors.terms : undefined,
    };
    setErrors(fields);
    if (!Object.values(fields).every((v) => !v)) return;
    if (!accounts) return fake.run();
    const result = await api.run(() =>
      accountApi.register({
        email: form.email.trim(),
        password: form.password,
        fullName: form.name.trim(),
        companyName: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
        newsletter: form.news,
        acceptPrivacyNotice: form.terms,
        source: signupSource(next),
      }),
    );
    // Un error de un campo concreto se muestra junto a ese campo, no arriba.
    if (!result.ok && result.field && REGISTER_FIELDS[result.field]) {
      setErrors({ [REGISTER_FIELDS[result.field]]: accountError(t, result) });
      api.setError(null);
    }
  };

  const terms = t.terms("§a", "§b");
  if (user) return <SignedIn t={t} user={user} />;
  if (accounts && api.status === "done") {
    return (
      <>
        <CardHead title={t.api.registerDoneTitle} lead={t.api.registerDoneText(form.email.trim())} icon={<MailCheck aria-hidden="true" size={26} strokeWidth={1.8} />} />
        <ResendVerification t={t} email={form.email.trim()} />
        <Link href="/login" className="ac-back">
          <ArrowLeft aria-hidden="true" size={16} />
          {t.back}
        </Link>
      </>
    );
  }
  const status = accounts ? api.status : fake.status;
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
          <Field label={t.phone} optional={t.optional} icon={Phone} type="tel" autoComplete="tel" placeholder={t.phonePh} value={form.phone} onChange={set("phone")} error={errors.phone} />
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
          <input type="checkbox" checked={form.news} onChange={set("news")} />
          <span aria-hidden="true" />
          <span>{t.news}</span>
        </label>
        {api.error && <Notice tone="error">{api.error}</Notice>}
        <Submit status={status} label={t.register.submit} t={t} />
        {!accounts && fake.status === "done" && <SoonNotice t={t} />}
      </form>
      <p className="ac-switch">
        {t.haveAccount} <Link href="/login">{t.loginHere}</Link>
      </p>
    </>
  );
}

/** Cuenta regresiva para volver a pedir un enlace (la API limita los envíos por correo). */
function useCountdown(seconds: number) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const id = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left]);
  return { left, start: () => setLeft(seconds) };
}

// ───────── Recuperar contraseña ─────────
export function ForgotScreen() {
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];
  const s = t.forgotScreen;
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const fake = useFakeSubmit();
  const api = useApiSubmit(t);
  const { accounts } = useAuth();
  const countdown = useCountdown(60);

  const send = async () => {
    const result = await api.run(() => accountApi.forgotPassword(email.trim()));
    if (result.ok) countdown.start();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = !email.trim() ? t.errors.email : !isEmail(email) ? t.errors.emailFormat : undefined;
    setError(err);
    if (err) return;
    if (!accounts) return fake.run();
    void send();
  };

  if (accounts && api.status === "done") {
    return (
      <>
        <CardHead title={s.doneTitle} lead={s.doneText(email.trim())} icon={<MailCheck aria-hidden="true" size={26} strokeWidth={1.8} />} />
        <button type="button" className="ac-ghost" disabled={countdown.left > 0} onClick={() => void send()}>
          <Mail aria-hidden="true" size={16} />
          {countdown.left > 0 ? s.resendIn(countdown.left) : s.resend}
        </button>
        <Link href="/login" className="ac-back">
          <ArrowLeft aria-hidden="true" size={16} />
          {t.back}
        </Link>
      </>
    );
  }
  const status = accounts ? api.status : fake.status;
  return (
    <>
      <CardHead title={s.title} lead={s.lead} icon={<KeyRound aria-hidden="true" size={26} strokeWidth={1.8} />} />
      <form className="ac-form" onSubmit={onSubmit} noValidate>
        <Field label={t.email} icon={Mail} type="email" autoComplete="email" placeholder={t.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        {api.error && <Notice tone="error">{api.error}</Notice>}
        <Submit status={status} label={s.submit} t={t} />
        {!accounts && fake.status === "done" && <SoonNotice t={t} />}
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
  // El token llega en el fragmento del enlace del correo: solo existe en el navegador.
  const token = useHashToken();
  const fake = useFakeSubmit();
  const api = useApiSubmit(t);
  const { accounts } = useAuth();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const c = passwordChecks(password);
    const fields = {
      password: !c.length || !c.number || !c.upper ? t.errors.passwordWeak : undefined,
      confirm: !confirm || confirm !== password ? t.errors.confirm : undefined,
    };
    setErrors(fields);
    if (fields.password || fields.confirm) return;
    if (!accounts) return fake.run();
    if (!token) return;
    const result = await api.run(() => accountApi.resetPassword(token, password));
    // El enlace ya se usó: se quita el token de la barra de direcciones y del historial.
    if (result.ok) window.history.replaceState(null, "", window.location.pathname);
    if (!result.ok && result.field === "password") {
      setErrors({ password: accountError(t, result) });
      api.setError(null);
    }
  };

  if (accounts && api.status === "done") {
    return (
      <>
        <CardHead title={s.doneTitle} lead={s.doneText} icon={<Lock aria-hidden="true" size={26} strokeWidth={1.8} />} />
        <Link href="/login" className="ac-submit">
          {s.goLogin}
          <ArrowRight aria-hidden="true" size={18} strokeWidth={2.2} />
        </Link>
      </>
    );
  }
  const status = accounts ? api.status : fake.status;
  const missing = accounts && token === null;
  return (
    <>
      <CardHead title={s.title} lead={s.lead} icon={<Lock aria-hidden="true" size={26} strokeWidth={1.8} />} />
      {missing && (
        <Notice tone="error">
          <p>{t.api.resetMissing}</p>
          <Link href="/recuperar" className="ac-notice__link">
            {t.api.requestNew}
          </Link>
        </Notice>
      )}
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
        {api.error && (
          <Notice tone="error">
            <p>{api.error}</p>
            <Link href="/recuperar" className="ac-notice__link">
              {t.api.requestNew}
            </Link>
          </Notice>
        )}
        <Submit status={status} label={s.submit} t={t} disabled={missing} />
        {!accounts && fake.status === "done" && <SoonNotice t={t} />}
      </form>
      <Link href="/login" className="ac-back">
        <ArrowLeft aria-hidden="true" size={16} />
        {t.back}
      </Link>
    </>
  );
}

// ───────── Activar la cuenta (enlace del correo de registro) ─────────
export function VerifyScreen() {
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];
  const v = t.api.verify;
  const token = useHashToken();
  const [state, setState] = useState<"checking" | "done" | "failed">("checking");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [resent, setResent] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !token) return;
    started.current = true;
    void accountApi.verifyEmail(token).then((result) => {
      setState(result.ok ? "done" : "failed");
      // El token ya no sirve: se quita del historial para que no quede en la barra de direcciones.
      window.history.replaceState(null, "", window.location.pathname);
    });
  }, [token]);

  const resend = async (e: FormEvent) => {
    e.preventDefault();
    const err = !email.trim() ? t.errors.email : !isEmail(email) ? t.errors.emailFormat : undefined;
    setEmailError(err);
    if (err) return;
    await accountApi.resendVerification(email.trim());
    setResent(true);
  };

  if (state === "checking" && token !== null) {
    return (
      <div className="ac-signed" role="status" aria-live="polite">
        <Loader2 className="ac-spin" aria-hidden="true" size={28} />
        <p>{v.checking}</p>
      </div>
    );
  }
  if (state === "done") {
    return (
      <>
        <CardHead title={v.doneTitle} lead={v.doneText} icon={<MailCheck aria-hidden="true" size={26} strokeWidth={1.8} />} />
        <Link href="/login" className="ac-submit">
          {t.login.submit}
          <ArrowRight aria-hidden="true" size={18} strokeWidth={2.2} />
        </Link>
      </>
    );
  }
  return (
    <>
      <CardHead title={state === "failed" ? v.failTitle : v.title} lead={state === "failed" ? v.failText : v.missing} icon={<Mail aria-hidden="true" size={26} strokeWidth={1.8} />} />
      {resent ? (
        <Notice tone="success">{t.api.resent}</Notice>
      ) : (
        <form className="ac-form" onSubmit={resend} noValidate>
          <Field label={t.email} icon={Mail} type="email" autoComplete="email" placeholder={t.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} />
          <button type="submit" className="ac-submit">
            {t.api.resend}
            <ArrowRight aria-hidden="true" size={18} strokeWidth={2.2} />
          </button>
        </form>
      )}
      <Link href="/login" className="ac-back">
        <ArrowLeft aria-hidden="true" size={16} />
        {t.back}
      </Link>
    </>
  );
}
