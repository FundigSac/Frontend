"use client";

import Image from "next/image";
import Link from "next/link";
import { LeadError, LeadForm, LeadSubmit } from "@/modules/leads/lead-form";
import { QUOTE_PRODUCTS, type QuoteProductSlug } from "@/modules/quote/products";
import { useLang } from "@/shared/layout/landing-prefs";
import { CATEGORY_NAMES, PRODUCT_LABELS, QUOTE_PRODUCT_UI } from "./w17-copy";


const INPUT = "min-h-11 w-full rounded-lg border border-border bg-surface px-3.5 font-body-compact text-body-compact text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus";
const LABEL = "block font-ui-label text-ui-label font-semibold text-on-surface";

export function ScreenW17({ slug = "valvula-compuerta" }: { slug?: QuoteProductSlug }) {
  const product = QUOTE_PRODUCTS[slug];
  const [lang] = useLang();
  const t = QUOTE_PRODUCT_UI[lang];
  const productName = PRODUCT_LABELS[lang][slug];

  return (
    <main lang={lang} className="min-h-screen w-full bg-background">
      <section aria-labelledby="quote-title" className="bg-surface-container-low">
        <div className="mx-auto max-w-[1200px] px-6 py-8 sm:py-11">
          <nav aria-label={t.crumbsLabel} className="mb-6 font-ui-label text-ui-label text-text-muted">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/">{t.home}</Link></li>
              <li aria-hidden="true" className="text-outline-variant">/</li>
              <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href={product.category.href}>{CATEGORY_NAMES[lang][product.category.href] ?? product.category.name}</Link></li>
              <li aria-hidden="true" className="text-outline-variant">/</li>
              <li aria-current="page" className="font-semibold text-on-surface">{t.current}</li>
            </ol>
          </nav>

          <div className="grid items-start gap-7 lg:grid-cols-[.78fr_1.22fr] lg:gap-12">
            <div className="lg:sticky lg:top-24" data-enter>
              <p className="font-ui-label text-ui-label font-bold uppercase tracking-[.16em] text-primary">{t.eyebrow}</p>
              <h1 id="quote-title" className="mt-2 font-headline-hero text-headline-hero font-semibold leading-[1.05] tracking-tight text-on-surface">
                {productName}
              </h1>
              <p className="mt-4 max-w-md font-body-default text-body-default leading-relaxed text-text-secondary">
                {t.lead}
              </p>

              <figure className="mt-6 overflow-hidden rounded-xl border border-border bg-surface-container-lowest p-2 shadow-sm">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-container">
                  <Image
                    src={product.image.src}
                    alt={t.imgAlt(productName)}
                    width={1408}
                    height={768}
                    sizes="(min-width: 1024px) 36vw, 100vw"
                    preload
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="px-3 pb-2 pt-3 font-ui-label text-ui-label text-text-muted">
                  {t.imgCaption}
                </figcaption>
              </figure>

              <p className="mt-5 flex items-start gap-3 rounded-lg border border-border bg-surface-container-lowest px-4 py-3.5 font-body-compact text-body-compact leading-relaxed text-text-secondary">
                <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-[18px] text-primary">info</span>
                <span>{t.pendingNote}</span>
              </p>
              <section aria-labelledby="product-details-pending" className="mt-6 rounded-xl border border-border bg-surface-container-lowest p-4 sm:p-5">
                <h2 id="product-details-pending" className="font-headline-card text-headline-card font-semibold text-on-surface">{t.pendingTitle}</h2>
                <ul className="mt-3 list-none space-y-2 p-0">{t.pendingItems.map((item) => <li key={item} className="flex items-center justify-between gap-3 border-t border-border py-2.5"><span className="font-body-compact text-body-compact text-text-secondary">{item}</span><span className="shrink-0 font-ui-label text-ui-label text-text-muted">{t.pending}</span></li>)}</ul>
              </section>
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface-container-lowest">
                <div className="border-b border-border px-4 py-3"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.12em] text-primary">{t.sheetTitle}</p><p className="mt-1 font-body-compact text-body-compact text-text-muted">{t.sheetNote}</p></div>
                <dl className="divide-y divide-border px-4">{t.sheetItems.map((item) => <div key={item} className="flex items-center justify-between gap-4 py-3"><dt className="font-body-compact text-body-compact text-text-secondary">{item}</dt><dd className="m-0 text-right font-ui-label text-ui-label font-medium text-text-muted">{t.sheetPending}</dd></div>)}</dl>
              </div>
            </div>

            <LeadForm formId="quote-product" key={product.slug} className="rounded-xl border border-border bg-surface-container-lowest p-5 shadow-sm sm:p-7 lg:p-8">
              <input type="hidden" name="producto" value={product.slug} />
              <input type="hidden" name="productoNombre" value={PRODUCT_LABELS.es[slug]} />
              <div className="space-y-7">
                <div>
                  <p className="font-ui-label text-ui-label font-bold uppercase tracking-[.14em] text-primary">{t.formEyebrow}</p>
                  <h2 className="mt-1 font-headline-section text-headline-section font-semibold tracking-tight text-on-surface">{t.formTitle}</h2>
                  <p className="mt-2 font-body-compact text-body-compact text-text-secondary">{t.formNote}</p>
                </div>

                <fieldset className="space-y-4">
                  <legend className="font-headline-card text-headline-card font-semibold text-on-surface">{t.productQty}</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className={LABEL} htmlFor="input-qty">{t.qty} <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="input-qty" name="input-qty" min={1} step={1} inputMode="numeric" required type="number" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={LABEL} htmlFor="delivery-date">{t.date} <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="delivery-date" name="delivery-date" required type="date" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={LABEL} htmlFor="delivery-place">{t.place} <span aria-hidden="true" className="text-danger">*</span></label>
                    <input className={INPUT} id="delivery-place" name="delivery-place" autoComplete="address-level2" required type="text" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={LABEL} htmlFor="notes">{t.notes} <span className="font-normal text-text-muted">{t.optional}</span></label>
                    <textarea className={`${INPUT} min-h-24 resize-y py-3`} id="notes" name="notes" rows={3} />
                  </div>
                </fieldset>

                <fieldset className="space-y-4">
                  <legend className="font-headline-card text-headline-card font-semibold text-on-surface">{t.contact}</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className={LABEL} htmlFor="ruc">{t.ruc} <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="ruc" name="ruc" autoComplete="off" inputMode="numeric" maxLength={11} pattern="[0-9]{11}" placeholder={t.rucPh} required type="text" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={LABEL} htmlFor="razon-social">{t.company} <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="razon-social" name="razon-social" autoComplete="organization" required type="text" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={LABEL} htmlFor="contact-name">{t.name} <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="contact-name" name="contact-name" autoComplete="name" required type="text" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={LABEL} htmlFor="email">{t.email} <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="email" name="email" autoComplete="email" required type="email" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className={LABEL} htmlFor="phone">{t.phone} <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="phone" name="phone" autoComplete="tel" required type="tel" />
                    </div>
                  </div>
                </fieldset>

                <label className="flex cursor-pointer items-start gap-3">
                  <input className="mt-1 size-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" name="declaroQueLaInformacion" required type="checkbox" />
                  <span className="font-body-compact text-body-compact leading-relaxed text-text-secondary">
                    {t.consent}{" "}
                    <Link href="/privacidad" target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{t.privacy}</Link>.
                  </span>
                </label>

                <div className="space-y-3 border-t border-border pt-5">
                  <LeadError />
                  <LeadSubmit
                    className="w-full min-h-12 rounded-lg bg-primary px-6 font-button-text text-button-text text-on-primary shadow-sm transition-colors hover:bg-primary-container hover:text-brand-on focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none"
                    idle={t.submit}
                    pending={t.sending}
                  />
                  <p className="font-ui-label text-ui-label leading-relaxed text-text-muted">
                    {t.afterSubmit}
                  </p>
                </div>
              </div>
            </LeadForm>
          </div>
        </div>
      </section>
      <section aria-labelledby="other-families-title" className="bg-background">
        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">{t.moreEyebrow}</p><h2 id="other-families-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">{t.moreTitle}</h2></div><p className="max-w-xl font-body-compact text-body-compact text-text-secondary">{t.moreNote}</p></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[
            { title: "Válvulas", href: "/productos/valvulas", image: "/images/stitch/21934d3fa9.jpg", alt: "Válvula industrial, imagen referencial." },
            { title: "Tuberías", href: "/productos/tuberias", image: "/images/stitch/60efb938f5.jpg", alt: "Tuberías industriales, imagen referencial." },
            { title: "Marcos y tapas", href: "/productos/marcos-y-tapas", image: "/images/stitch/b2bccfdcb3-limpia.jpg", alt: "Marco y tapa, imagen referencial." },
          ].map((family, index) => <Link key={family.href} href={family.href} className="group overflow-hidden rounded-xl border border-border bg-surface-elevated transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"><div className="relative aspect-[16/9] overflow-hidden bg-surface"><Image src={family.image} alt={t.families[index].alt} width={1408} height={768} sizes="(min-width: 1024px) 360px, 90vw" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"/><span className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-2.5 py-1 font-ui-label text-ui-label text-text-secondary">{t.imgCaption}</span></div><div className="flex items-center justify-between px-4 py-4"><h3 className="font-headline-card text-headline-card font-semibold text-on-surface">{t.families[index].title}</h3><span aria-hidden="true" className="text-primary">→</span></div></Link>)}</div>
        </div>
      </section>
    </main>
  );
}
