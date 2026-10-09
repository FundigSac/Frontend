"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AccountLink } from "@/modules/auth/account-link";
import { MAIN_NAV, isActivePath } from "@/shared/config/site";

const NAV_ACTIVE = "transition-colors flex items-center h-full pt-0.5 text-primary font-semibold border-b-2 border-primary";
const NAV_IDLE = "font-button-text text-button-text text-on-surface-variant hover:text-primary transition-colors flex items-center h-full pt-0.5";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpenedOn, setMenuOpenedOn] = useState<string | null>(null);
  const menuOpen = menuOpenedOn === pathname;
  const menuId = useId();

  // El menú pertenece a la ruta desde la que se abrió; queda cerrado al cambiar de ruta.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpenedOn(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-[76px] flex items-center justify-between gap-2 lg:gap-6">
        <div className="flex items-center shrink-0">
          <Link className="flex flex-col" href="/" aria-label="FUNDIGSAC, ir al inicio">
            <span className="text-primary font-headline-card text-headline-card tracking-tight font-bold">FUNDIGSAC</span>
            <span className="max-[360px]:hidden font-ui-label text-ui-label tracking-widest text-text-muted uppercase font-bold leading-3">HIERRO DÚCTIL · PERÚ</span>
          </Link>
        </div>
        <nav aria-label="Principal" className="hidden xl:flex items-center gap-8 h-full">
          {MAIN_NAV.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={active ? NAV_ACTIVE : NAV_IDLE}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link className="hidden xl:inline-flex items-center justify-center h-11 px-5 rounded-lg bg-primary-container text-brand-on font-button-text text-button-text hover:bg-primary transition-colors shadow-sm" href="/cotizar">
            Solicitar cotización
          </Link>
          <AccountLink />
          <button
            type="button"
            className="xl:hidden w-11 h-11 -mr-2 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container transition-colors"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuOpenedOn(menuOpen ? null : pathname)}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[24px]">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div id={menuId} className="xl:hidden border-t border-border bg-surface-container-lowest max-h-[calc(100dvh-76px)] overflow-y-auto">
          <nav aria-label="Principal móvil" className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col">
            {MAIN_NAV.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpenedOn(null)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center h-12 border-b border-border font-button-text text-button-text ${active ? "text-primary font-semibold" : "text-on-surface-variant"}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/cotizar" onClick={() => setMenuOpenedOn(null)} className="mt-4 inline-flex items-center justify-center h-12 px-5 rounded-lg bg-primary-container text-brand-on font-button-text text-button-text hover:bg-primary transition-colors shadow-sm">
              Solicitar cotización
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
