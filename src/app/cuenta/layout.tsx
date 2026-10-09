import type { ReactNode } from "react";
import { authMetadata } from "@/modules/auth/metadata";
import { SignOutButton } from "@/modules/auth/sign-out-button";
import { AccountNav } from "@/modules/auth/ui/account-nav";
import { requireSession } from "@/server/auth/session";

// Todo /cuenta/** depende de la cookie de sesión: nunca se prerenderiza ni se cachea.
export const dynamic = "force-dynamic";
export const metadata = authMetadata("Mi cuenta");

/**
 * Barrera de servidor para /cuenta/**: sesión válida (y cuenta no bloqueada) antes de renderizar.
 * Cada página y acción vuelve a comprobarla; esta capa no sustituye esas comprobaciones.
 */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await requireSession("/cuenta");
  const staff = session.user.role !== "customer";
  return (
    <main className="w-full pt-[76px] bg-background">
      <div className="mx-auto min-h-[calc(100dvh-76px)] max-w-[880px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-ui-label text-ui-label text-text-muted">Mi cuenta</p>
            <p className="truncate font-headline-card text-headline-card text-on-surface">{session.user.name || session.user.email}</p>
          </div>
          <SignOutButton />
        </div>
        <AccountNav staff={staff} />
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
