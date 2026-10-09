import type { ReactNode } from "react";

/** Tarjeta centrada (~400 px) para las pantallas de acceso: wordmark, título, contenido y pie. */
export function AuthCard({
  title,
  description,
  icon,
  tone = "neutral",
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  icon?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const iconTone = {
    neutral: "bg-surface-container text-primary",
    success: "bg-surface-container text-success",
    warning: "bg-surface-container text-warning",
    danger: "bg-error-container text-on-error-container",
  }[tone];
  return (
    <section className="w-full max-w-[400px] rounded-xl border border-border bg-surface-container-lowest p-6 sm:p-8 shadow-sm" aria-labelledby="auth-title">
      <p className="mb-5 text-primary font-headline-card text-headline-card tracking-tight font-bold" aria-hidden="true">
        FUNDIGSAC
      </p>
      {icon ? (
        <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${iconTone}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-[26px]">
            {icon}
          </span>
        </span>
      ) : null}
      <h1 id="auth-title" className="font-headline-card text-headline-card text-on-surface">
        {title}
      </h1>
      {description ? <div className="mt-2 font-body-compact text-body-compact text-text-secondary">{description}</div> : null}
      {children ? <div className="mt-6">{children}</div> : null}
      {footer ? <div className="mt-6 border-t border-border pt-5 text-center font-body-compact text-body-compact text-text-secondary">{footer}</div> : null}
    </section>
  );
}
