"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { LeadForm } from "@/modules/leads/lead-form";
import { QUOTE_PRODUCTS, type QuoteProductSlug } from "@/modules/quote/products";
import { Cajetin, ErrorSummary, ErrorsProvider, FormSteps, MissingNote, QCheck, QInput, QTextarea, QuoteError, QuoteSubmit, useFormErrors } from "@/modules/quote/quote-ui";
import { useLang } from "@/shared/layout/landing-prefs";
import { CATEGORY_NAMES, PRODUCT_LABELS, QUOTE_PRODUCT_UI } from "./w17-copy";
import "@/modules/quote/hoja.css";

const FORM_ID = "cotizacionProducto";
const ORDER = ["input-qty", "delivery-date", "delivery-place"];
const WHO = ["ruc", "razon-social", "contact-name", "email", "phone"];

export function ScreenW17({ slug = "valvula-compuerta", online = false }: { slug?: QuoteProductSlug; online?: boolean }) {
  const product = QUOTE_PRODUCTS[slug];
  const [lang] = useLang();
  const t = QUOTE_PRODUCT_UI[lang];
  const productName = PRODUCT_LABELS[lang][slug];
  const { errors, summary, summaryRef, form } = useFormErrors(t.rules);

  const steps = useMemo(
    () => [
      { id: "paso-pedido", label: t.steps[0], names: ORDER },
      { id: "paso-datos", label: t.steps[1], names: WHO },
    ],
    [t],
  );
  const required = useMemo(() => [...ORDER, ...WHO, "declaroQueLaInformacion"], []);
  const missingLabels = { missing: t.missing, ready: t.ready };

  return (
    <main lang={lang} className="hj">
      <div className="hj-shell">
        <nav aria-label={t.crumbsLabel} className="hj-migas">
          <ol>
            <li>
              <Link href="/">{t.home}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={product.category.href}>{CATEGORY_NAMES[lang][product.category.href] ?? product.category.name}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t.current}</li>
          </ol>
        </nav>

        <div className="hj-head">
          <h1 id="quote-title">{t.title(productName)}</h1>
          <p className="hj-lead">{online ? t.leadOnline : t.leadOffline}</p>
        </div>

        <FormSteps formId={FORM_ID} steps={steps} label={t.stepsLabel} version={lang} />

        <div className="hj-grid">
          <ErrorsProvider value={errors}>
            <LeadForm formId="quote-product" id={FORM_ID} key={product.slug} className="hj-form" aria-label={t.formRegion} {...form}>
              <input type="hidden" name="producto" value={product.slug} />
              <input type="hidden" name="productoNombre" value={PRODUCT_LABELS.es[slug]} />
              <ErrorSummary items={summary} title={t.reviewTitle} innerRef={summaryRef} />

              <section id="paso-pedido" aria-labelledby="paso-pedido-t" className="hj-seccion" data-reveal>
                <div className="cota">
                  <h2 id="paso-pedido-t">{t.productQty}</h2>
                </div>
                <div className="hj-producto">
                  <span className="hj-producto__foto">
                    <Image src={product.image.src} alt={t.imgAlt(productName)} width={176} height={132} sizes="88px" loading="lazy" />
                  </span>
                  <span>
                    <strong>{productName}</strong>
                    <small>{t.imgCaption}</small>
                  </span>
                </div>
                <div className="hj-campos">
                  <QInput id="input-qty" name="input-qty" label={t.qty} type="number" inputMode="numeric" min={1} step={1} required />
                  <QInput id="delivery-date" name="delivery-date" label={t.date} type="date" required />
                  <QInput full id="delivery-place" name="delivery-place" label={t.place} type="text" autoComplete="address-level2" required />
                  <QTextarea full id="notes" name="notes" label={t.notes} optional={t.optional} rows={3} />
                </div>
              </section>

              <section id="paso-datos" aria-labelledby="paso-datos-t" className="hj-seccion" data-reveal>
                <div className="cota">
                  <h2 id="paso-datos-t">{t.contact}</h2>
                </div>
                <div className="hj-campos">
                  <QInput name="ruc" label={t.ruc} type="text" inputMode="numeric" pattern="[0-9]{11}" maxLength={11} autoComplete="off" required hint={t.rucHelp} />
                  <QInput id="razon-social" name="razon-social" label={t.company} type="text" autoComplete="organization" required />
                  <QInput id="contact-name" name="contact-name" label={t.name} type="text" autoComplete="name" required />
                  <QInput name="email" label={t.email} type="email" autoComplete="email" required />
                  <QInput full name="phone" label={t.phone} type="tel" autoComplete="tel" required />
                </div>
              </section>

              <div className="hj-envio">
                <QCheck name="declaroQueLaInformacion" required>
                  {t.consent}{" "}
                  <Link href="/privacidad" target="_blank" rel="noreferrer">
                    {t.privacy}
                  </Link>
                  .
                </QCheck>
                <div className="hj-nota">{t.allRequired}</div>
                <MissingNote formId={FORM_ID} names={required} version={lang} labels={missingLabels} className="hj-falta--pie" />
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
              version={lang}
              emptyLabel={t.summaryEmpty}
              labels={missingLabels}
              rows={[
                { label: t.summaryProduct, value: productName, full: true },
                { label: t.qty, name: "input-qty" },
                { label: t.date, name: "delivery-date" },
                { label: t.place, name: "delivery-place", full: true },
                { label: t.company, name: "razon-social", full: true },
                { label: t.name, name: "contact-name" },
                { label: t.ruc, name: "ruc" },
              ]}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
