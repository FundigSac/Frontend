"use client";

import Link from "next/link";
import { useMemo } from "react";
import { LeadForm } from "@/modules/leads/lead-form";
import { cartCount, useCart, type CartItem } from "@/modules/cart/cart-store";
import { Cajetin, ErrorSummary, ErrorsProvider, FormSteps, MissingNote, QCheck, QInput, QSelect, QuoteError, QuoteSubmit, useFormErrors } from "@/modules/quote/quote-ui";
import { useLang } from "@/shared/layout/landing-prefs";
import { PERU_DEPARTMENTS, QUOTE_UI } from "./w16-copy";
import "@/modules/quote/hoja.css";

const FORM_ID = "cotizacionForm";
const WHAT = ["familiaPrincipal", "diametrosNominales", "cantidadMetrado"];
const WHERE = ["departamentoDestino", "tipoProyecto"];
const WHO = ["rucEmpresa", "razonSocial", "nombreSolicitante", "cargoSolicitante", "correoCorporativo", "celularContacto"];

/** Familia que Ventas lee en la solicitud cuando los productos vienen del carrito. */
function familyOf(items: CartItem[]): string {
  const families = new Set(items.map((item) => (item.href?.includes("/valvulas") || item.slug.startsWith("valvula") ? "valvulas" : item.href?.includes("/tuberias") || item.slug.startsWith("tuberia") ? "tuberias" : item.href?.includes("/marcos") || item.slug.startsWith("marco") ? "marcos_tapas" : "mixto")));
  return families.size === 1 ? [...families][0] : "mixto";
}

export function ScreenW16({ online = false }: { online?: boolean }) {
  const [lang] = useLang();
  const t = QUOTE_UI[lang];
  const cart = useCart();
  const hasCart = cart.length > 0;
  const units = cartCount(cart);
  const { errors, summary, summaryRef, form } = useFormErrors(t.rules);
  const version = `${lang}|${cart.length}`;

  const steps = useMemo(
    () => [
      { id: "paso-pedido", label: t.steps[0], names: WHAT },
      { id: "paso-entrega", label: t.steps[1], names: WHERE },
      { id: "paso-datos", label: t.steps[2], names: WHO },
    ],
    [t],
  );
  const required = useMemo(() => [...WHAT, ...WHERE, ...WHO, "consentimiento"], []);
  const missingLabels = { missing: t.missing, ready: t.ready };
  const familyLabel = hasCart ? `${cart.length} ${lang === "en" ? (cart.length === 1 ? "product" : "products") : cart.length === 1 ? "producto" : "productos"}` : undefined;

  return (
    <main lang={lang} className="hj">
      <div className="hj-shell">
        <nav aria-label={t.crumbsLabel} className="hj-migas">
          <ol>
            <li>
              <Link href="/">{t.home}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t.current}</li>
          </ol>
        </nav>

        <div className="hj-head">
          <h1 id="quote-title">{t.title}</h1>
          <p className="hj-lead">{online ? t.leadOnline : t.leadOffline}</p>
        </div>

        <FormSteps formId={FORM_ID} steps={steps} label={t.stepsLabel} version={version} />

        <div className="hj-grid">
          <ErrorsProvider value={errors}>
            <LeadForm formId="quote-general" id={FORM_ID} className="hj-form" aria-label={t.formRegion} {...form}>
              <ErrorSummary items={summary} title={t.reviewTitle} innerRef={summaryRef} />

              <section id="paso-pedido" aria-labelledby="paso-pedido-t" className="hj-seccion" data-reveal>
                <div className="cota">
                  <h2 id="paso-pedido-t">{hasCart ? t.cartTitle : t.whatTitle}</h2>
                </div>
                {hasCart ? (
                  <>
                    <ul className="hj-lista">
                      {cart.map((item) => (
                        <li key={`${item.slug}|${item.variant ?? ""}`}>
                          <span>
                            <strong>{item.name}</strong>
                            {item.variant && <small>{item.variant}</small>}
                          </span>
                          <span className="hj-lista__n">{t.cartQty(item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="hj-nota">
                      <Link href="/carrito" className="hj-enlace">
                        {t.cartEdit}
                      </Link>
                    </p>
                    {/* El servidor exige estos campos; con carrito, los productos ya los describen. */}
                    <input type="hidden" name="familiaPrincipal" value={familyOf(cart)} />
                    <input type="hidden" name="diametrosNominales" value={t.cartSizes} />
                    <input type="hidden" name="cantidadMetrado" value={t.cartUnits(units)} />
                  </>
                ) : (
                  <div className="hj-campos">
                    <QSelect full name="familiaPrincipal" label={t.family} defaultValue="" required hint={<><span>{t.whatHint} </span><Link href="/productos" className="hj-enlace">{t.whatHintLink}</Link></>}>
                      <option disabled value="">
                        {t.selectFamily}
                      </option>
                      {t.families.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </QSelect>
                    <QInput name="diametrosNominales" label={t.sizes} type="text" required hint={t.sizesHint} />
                    <QInput name="cantidadMetrado" label={t.quantity} type="text" required hint={t.quantityHint} />
                  </div>
                )}
              </section>

              <section id="paso-entrega" aria-labelledby="paso-entrega-t" className="hj-seccion" data-reveal>
                <div className="cota">
                  <h2 id="paso-entrega-t">{t.whereTitle}</h2>
                </div>
                <div className="hj-campos">
                  <QInput name="departamentoDestino" label={t.destination} type="text" autoComplete="address-level1" list="departamentos" required />
                  <datalist id="departamentos">
                    {PERU_DEPARTMENTS.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                  <QSelect name="tipoProyecto" label={t.projectType} defaultValue="" required>
                    <option disabled value="">
                      {t.selectOption}
                    </option>
                    {t.projectTypes.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </QSelect>
                </div>
              </section>

              <section id="paso-datos" aria-labelledby="paso-datos-t" className="hj-seccion" data-reveal>
                <div className="cota">
                  <h2 id="paso-datos-t">{t.whoTitle}</h2>
                </div>
                <div className="hj-campos">
                  <QInput name="rucEmpresa" label={t.ruc} type="text" inputMode="numeric" pattern="[0-9]{11}" maxLength={11} autoComplete="off" required hint={t.rucHelp} />
                  <QInput name="razonSocial" label={t.razonSocial} type="text" autoComplete="organization" required />
                  <QInput name="nombreSolicitante" label={t.contactName} type="text" autoComplete="name" required />
                  <QInput name="cargoSolicitante" label={t.jobTitle} type="text" autoComplete="organization-title" required />
                  <QInput name="correoCorporativo" label={t.email} type="email" autoComplete="email" required />
                  <QInput name="celularContacto" label={t.phone} type="tel" autoComplete="tel" required />
                </div>
              </section>

              <div className="hj-envio">
                <QCheck name="consentimiento" required>
                  {t.consentBefore}{" "}
                  <Link href="/privacidad">{t.privacy}</Link>.
                </QCheck>
                <div className="hj-nota">{t.allRequired}</div>
                <MissingNote formId={FORM_ID} names={required} version={version} labels={missingLabels} className="hj-falta--pie" />
                <QuoteError />
                <QuoteSubmit idle={t.submit} pending={t.sending} />
              </div>
            </LeadForm>
          </ErrorsProvider>

          <aside className="hj-aside hj-aside--form">
            <Cajetin
              formId={FORM_ID}
              title={t.summaryTitle}
              names={required}
              version={version}
              emptyLabel={t.summaryEmpty}
              labels={missingLabels}
              rows={[
                { label: t.summaryProduct, name: "familiaPrincipal", value: familyLabel, full: true },
                { label: t.sizes, name: "diametrosNominales", value: hasCart ? t.cartSizes : undefined },
                { label: t.quantity, name: "cantidadMetrado", value: hasCart ? t.cartUnits(units) : undefined },
                { label: t.destination, name: "departamentoDestino" },
                { label: t.projectType, name: "tipoProyecto" },
                { label: t.razonSocial, name: "razonSocial", full: true },
                { label: t.summaryContact, name: "nombreSolicitante" },
                { label: t.ruc, name: "rucEmpresa" },
              ]}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
