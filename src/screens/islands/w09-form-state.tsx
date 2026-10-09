"use client";

import { useLeadState } from "@/modules/leads/lead-form";

/** Oculta los campos del formulario cuando el envío fue exitoso (el diseño reemplaza el formulario por un panel de éxito). */
export function W09HideOnSuccess({ className, children }: { className: string; children: React.ReactNode }) {
  const { status } = useLeadState();
  if (status === "success") return null;
  return <div className={className}>{children}</div>;
}
