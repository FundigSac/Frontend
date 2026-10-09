"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/cuenta", label: "Resumen", icon: "account_circle" },
  { href: "/cuenta/perfil", label: "Perfil", icon: "manage_accounts" },
  { href: "/cuenta/seguridad", label: "Seguridad", icon: "shield" },
] as const;

export function AccountNav({ staff }: { staff: boolean }) {
  const pathname = usePathname();
  const items = staff ? [...ITEMS, { href: "/cuenta/equipo", label: "Equipo", icon: "shield_person" } as const] : ITEMS;
  return (
    <nav aria-label="Cuenta" className="-mx-1 flex gap-1 overflow-x-auto border-b border-border">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-11 shrink-0 items-center gap-1.5 border-b-2 px-3 font-button-text text-button-text transition-colors ${
              active ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
