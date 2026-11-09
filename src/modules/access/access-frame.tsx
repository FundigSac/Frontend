"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useLang } from "@/shared/layout/landing-prefs";
import { ACCESS_COPY, type AccessKind } from "./access-copy";
import "./access.css";

export function kindFor(pathname: string): AccessKind {
  if (pathname.startsWith("/registro")) return "register";
  if (pathname.startsWith("/recuperar")) return "forgot";
  if (pathname.startsWith("/restablecer")) return "reset";
  return "login";
}

const AccountsContext = createContext(false);
/** Si el ingreso con correo está activo (hay Backend). Se conoce desde el servidor: no cambia tras cargar. */
export const useAccountsEnabled = () => useContext(AccountsContext);

/** Panel plano con el logotipo sobre placa blanca, la frase y la salida para quien solo quiere cotizar. Solo desde 1024 px. */
function AccessPanel({ kind }: { kind: AccessKind }) {
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];
  const panel = t.panels[kind];
  return (
    <aside className="ac-panel on-dark" aria-label={t.panelLabel}>
      <span className="ac-panel__placa">
        <Image src="/brand/fundigsac.svg" width={708} height={159} alt="FUNDIGSAC" />
      </span>
      <div className="ac-panel__cuerpo">
        <div className="ac-panel__frase">{t.panelPhrase}</div>
        <div className="ac-panel__filas">
          <div className="ac-panel__fila">
            <strong>{t.noAccountTitle}</strong>
            <p>{t.noAccountText}</p>
            <Link href="/cotizar" className="lp-btn lp-btn--outline">
              {t.noAccountCta}
            </Link>
          </div>
          <div className="ac-panel__fila">
            <strong>{panel.title}</strong>
            <p>{panel.text}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Marco común de las pantallas de acceso: se monta una vez en el layout y solo cambia el formulario. */
export function AccessFrame({ accounts, children }: { accounts: boolean; children: ReactNode }) {
  const kind = kindFor(usePathname() || "/login");
  const [lang] = useLang();
  const t = ACCESS_COPY[lang];

  // Al recargar o volver, estas pantallas empiezan siempre desde arriba (el navegador no restaura el desplazamiento).
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  return (
    <AccountsContext.Provider value={accounts}>
      <main className={`ac ac--${kind}`} data-accounts={accounts ? "on" : "off"}>
        <section className="ac-side">
          <div className="ac-card" key={`card-${kind}`}>
            {children}
            <div className="ac-quote">
              <strong>{t.noAccountTitle}</strong>
              <p>{t.noAccountText}</p>
              <Link href="/cotizar" className="ac-link">
                {t.noAccountCta}
              </Link>
            </div>
          </div>
        </section>
        <AccessPanel kind={kind} />
      </main>
    </AccountsContext.Provider>
  );
}
