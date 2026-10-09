import type { ReactNode } from "react";

/** Contenedor de sección de cuenta (título + contenido). */
export function Panel({ title, description, children, id }: { title: string; description?: ReactNode; children: ReactNode; id?: string }) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className="rounded-xl border border-border bg-surface-container-lowest p-5 sm:p-6">
      <h2 id={headingId} className="font-headline-card text-headline-card text-on-surface">
        {title}
      </h2>
      {description ? <div className="mt-1 font-body-compact text-body-compact text-text-secondary">{description}</div> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
