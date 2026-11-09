"use client";

import { ChevronRight, Mail, MessageCircle, Phone } from "lucide-react";
import { LibroReclamacionesIcon } from "@/shared/ui/libro-reclamaciones-icon";
import { FloatingActions } from "../_landing/floating-actions";
import { ClaimForm } from "./claim-form";
import { CLAIMS, COMMON } from "./copy";
import { SheetHead } from "./sheet";
import { SHEET_UI } from "./sheet-copy";
import { useCopy } from "./use-copy";

export function ClaimsView({ email, phoneHref, whatsappNumber }: { email: string; phoneHref: string; whatsappNumber: string }) {
  const t = useCopy(CLAIMS);
  const ui = useCopy(SHEET_UI).claims;
  const home = useCopy(COMMON.home);
  const s = t.side;
  const whatsapp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(s.help.whatsappMsg)}`;
  const help = [
    { icon: Phone, title: s.help.call[0], text: s.help.call[1], href: phoneHref, external: false },
    { icon: Mail, title: s.help.write, text: email, href: `mailto:${email}`, external: false },
    { icon: MessageCircle, title: s.help.whatsapp[0], text: s.help.whatsapp[1], href: whatsapp, external: true },
  ];

  return (
    <main className="lp lg ls">
      <SheetHead home={home} crumb={t.crumb} title={t.title} lead={t.lead} mark={<LibroReclamacionesIcon size={112} />} />

      <div className="lp-shell ls-page">
        <ClaimForm
          email={email}
          whatsappNumber={whatsappNumber}
          summary={({ kind, medium }) => (
            <aside className="ls-summary" aria-label={s.aria}>
              <h2>{ui.summary}</h2>
              <dl>
                <div><dt>{ui.type}</dt><dd>{kind === "RECLAMO" ? t.kinds.reclamo.title : t.kinds.queja.title}</dd></div>
                <div><dt>{ui.deadline}</dt><dd>{ui.deadlineValue}</dd></div>
                <div><dt>{ui.medium}</dt><dd>{t.fields.mediums.find((m) => m.value === medium)?.label}</dd></div>
              </dl>

              <h3>{s.how.title}</h3>
              <ol className="ls-how">
                {s.how.items.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ol>

              <h3>{s.help.title}</h3>
              <ul className="ls-help">
                {help.map(({ icon: Icon, title, text, href, external }) => (
                  <li key={title}>
                    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      <Icon aria-hidden="true" size={20} strokeWidth={1.75} />
                      <span><strong>{title}</strong><small>{text}</small></span>
                      <ChevronRight aria-hidden="true" size={18} strokeWidth={2} />
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        />

        <section className="ls-section ls-important" aria-labelledby="ls-important-title">
          <h2 id="ls-important-title">{s.important.title}</h2>
          <ul className="ls-bullets">
            {s.important.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </div>
      <FloatingActions />
    </main>
  );
}
