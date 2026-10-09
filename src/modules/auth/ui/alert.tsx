import type { ReactNode } from "react";

type Tone = "error" | "success" | "info" | "warning";

const TONES: Record<Tone, { box: string; icon: string }> = {
  error: { box: "bg-error-container text-on-error-container border-danger", icon: "error" },
  success: { box: "bg-surface-container text-on-surface border-success", icon: "check_circle" },
  info: { box: "bg-surface-container text-on-surface border-border", icon: "info" },
  warning: { box: "bg-surface-container text-on-surface border-warning", icon: "warning" },
};

/** Mensaje de formulario. Los errores usan role="alert" (anuncio inmediato); el resto role="status". */
export function Alert({ tone = "error", id, children }: { tone?: Tone; id?: string; children: ReactNode }) {
  const t = TONES[tone];
  return (
    <div id={id} role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-lg border-l-4 px-3 py-3 font-body-compact text-body-compact ${t.box}`}>
      <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-[18px] shrink-0">
        {t.icon}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
