"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type HeaderUser = { name: string; email: string };

function initials(user: HeaderUser): string {
  const source = (user.name || user.email).trim();
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : source.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Enlace de cuenta de la cabecera, consciente de la sesión.
 * Se resuelve en el cliente con GET /api/auth/get-session (cookie httpOnly, la respuesta no contiene tokens):
 * así el layout raíz NO lee cookies y las páginas públicas siguen siendo estáticas/cacheables (ADR-001).
 * Sin sesión → /login; con sesión → /cuenta con las iniciales.
 */
export function AccountLink() {
  const pathname = usePathname();
  const [user, setUser] = useState<HeaderUser | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/get-session", { credentials: "same-origin", cache: "no-store", headers: { accept: "application/json" }, signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { user?: { name?: string; email?: string } } | null) => {
        setUser(data?.user?.email ? { name: data.user.name ?? "", email: data.user.email } : null);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [pathname]);

  return (
    <Link
      href={user ? "/cuenta" : "/login"}
      aria-label={user ? `Mi cuenta (${user.name || user.email})` : "Mi cuenta"}
      className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0 transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      {user ? (
        <span aria-hidden="true" className="text-on-primary font-ui-label text-ui-label">
          {initials(user)}
        </span>
      ) : (
        <span aria-hidden="true" className="material-symbols-outlined text-on-primary text-[18px]">
          person
        </span>
      )}
    </Link>
  );
}
