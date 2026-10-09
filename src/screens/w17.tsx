import Image from "next/image";
import Link from "next/link";
import { LeadError, LeadForm, LeadSubmit } from "@/modules/leads/lead-form";
import { QUOTE_PRODUCTS, type QuoteProductSlug } from "@/modules/quote/products";

const PRODUCT_LABELS: Record<QuoteProductSlug, string> = {
  "valvula-compuerta": "Válvula de compuerta",
  "valvula-mariposa": "Válvula mariposa",
  "tuberia-tyton": "Tubería de hierro dúctil",
  "marco-tapa-d400": "Marco y tapa",
};

const INPUT = "min-h-11 w-full rounded-lg border border-border bg-surface px-3.5 font-body-compact text-body-compact text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus";
const LABEL = "block font-ui-label text-ui-label font-semibold text-on-surface";

export function ScreenW17({ slug = "valvula-compuerta" }: { slug?: QuoteProductSlug }) {
  const product = QUOTE_PRODUCTS[slug];
  const productName = PRODUCT_LABELS[slug];

  return (
    <main className="min-h-screen w-full bg-background pt-[76px]">
      <section aria-labelledby="quote-title" className="bg-surface-container-low">
        <div className="mx-auto max-w-[1200px] px-6 py-8 sm:py-11">
          <nav aria-label="Migas de pan" className="mb-6 font-ui-label text-ui-label text-text-muted">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/">Inicio</Link></li>
              <li aria-hidden="true" className="text-outline-variant">/</li>
              <li><Link className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href={product.category.href}>{product.category.name}</Link></li>
              <li aria-hidden="true" className="text-outline-variant">/</li>
              <li aria-current="page" className="font-semibold text-on-surface">Cotización</li>
            </ol>
          </nav>

          <div className="grid items-start gap-7 lg:grid-cols-[.78fr_1.22fr] lg:gap-12">
            <div className="lg:sticky lg:top-24">
              <p className="font-ui-label text-ui-label font-bold uppercase tracking-[.16em] text-primary">Solicitud de cotización</p>
              <h1 id="quote-title" className="mt-2 font-headline-hero text-headline-hero font-semibold leading-[1.05] tracking-tight text-on-surface">
                {productName}
              </h1>
              <p className="mt-4 max-w-md font-body-default text-body-default leading-relaxed text-text-secondary">
                Completa los datos de tu requerimiento para solicitar una cotización.
              </p>

              <figure className="mt-6 overflow-hidden rounded-xl border border-border bg-surface-container-lowest p-2 shadow-sm">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-container">
                  <Image
                    src={product.image.src}
                    alt={`Imagen referencial de ${productName.toLowerCase()}.`}
                    width={1408}
                    height={768}
                    sizes="(min-width: 1024px) 36vw, 100vw"
                    preload
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="px-3 pb-2 pt-3 font-ui-label text-ui-label text-text-muted">
                  Imagen referencial
                </figcaption>
              </figure>

              <p className="mt-5 flex items-start gap-3 rounded-lg border border-border bg-surface-container-lowest px-4 py-3.5 font-body-compact text-body-compact leading-relaxed text-text-secondary">
                <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-[18px] text-primary">info</span>
                <span>Datos técnicos pendientes de confirmación.</span>
              </p>
              <section aria-labelledby="product-details-pending" className="mt-6 rounded-xl border border-border bg-surface-container-lowest p-4 sm:p-5">
                <h2 id="product-details-pending" className="font-headline-card text-headline-card font-semibold text-on-surface">Información por confirmar</h2>
                <ul className="mt-3 list-none space-y-2 p-0">{["Especificaciones y variantes", "Normas y certificados", "Documentación técnica", "Condiciones de suministro"].map((item) => <li key={item} className="flex items-center justify-between gap-3 border-t border-border py-2.5"><span className="font-body-compact text-body-compact text-text-secondary">{item}</span><span className="shrink-0 font-ui-label text-ui-label text-text-muted">Pendiente</span></li>)}</ul>
              </section>
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface-container-lowest">
                <div className="border-b border-border px-4 py-3"><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.12em] text-primary">Ficha del producto</p><p className="mt-1 font-body-compact text-body-compact text-text-muted">Datos sujetos a confirmación</p></div>
                <dl className="divide-y divide-border px-4">{["Código de producto", "Material", "Medidas y conexiones", "Normativa aplicable", "Documentos vigentes"].map((item) => <div key={item} className="flex items-center justify-between gap-4 py-3"><dt className="font-body-compact text-body-compact text-text-secondary">{item}</dt><dd className="m-0 text-right font-ui-label text-ui-label font-medium text-text-muted">Pendiente de validación</dd></div>)}</dl>
              </div>
            </div>

            <LeadForm formId="quote-product" key={product.slug} className="rounded-xl border border-border bg-surface-container-lowest p-5 shadow-sm sm:p-7 lg:p-8">
              <input type="hidden" name="producto" value={product.slug} />
              <input type="hidden" name="productoNombre" value={productName} />
              <div className="space-y-7">
                <div>
                  <p className="font-ui-label text-ui-label font-bold uppercase tracking-[.14em] text-primary">Datos del requerimiento</p>
                  <h2 className="mt-1 font-headline-section text-headline-section font-semibold tracking-tight text-on-surface">Cuéntanos qué necesitas</h2>
                  <p className="mt-2 font-body-compact text-body-compact text-text-secondary">Los detalles técnicos se revisan durante la atención de la solicitud.</p>
                </div>

                <fieldset className="space-y-4">
                  <legend className="font-headline-card text-headline-card font-semibold text-on-surface">Producto y cantidad</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className={LABEL} htmlFor="input-qty">Cantidad solicitada <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="input-qty" name="input-qty" min={1} step={1} inputMode="numeric" required type="number" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={LABEL} htmlFor="delivery-date">Fecha deseada <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="delivery-date" name="delivery-date" required type="date" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={LABEL} htmlFor="delivery-place">Destino o referencia de entrega <span aria-hidden="true" className="text-danger">*</span></label>
                    <input className={INPUT} id="delivery-place" name="delivery-place" autoComplete="address-level2" required type="text" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={LABEL} htmlFor="notes">Detalle adicional <span className="font-normal text-text-muted">(opcional)</span></label>
                    <textarea className={`${INPUT} min-h-24 resize-y py-3`} id="notes" name="notes" rows={3} />
                  </div>
                </fieldset>

                <fieldset className="space-y-4">
                  <legend className="font-headline-card text-headline-card font-semibold text-on-surface">Datos de contacto</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className={LABEL} htmlFor="ruc">RUC <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="ruc" name="ruc" autoComplete="off" inputMode="numeric" maxLength={11} pattern="[0-9]{11}" placeholder="11 dígitos" required type="text" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={LABEL} htmlFor="razon-social">Empresa o entidad <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="razon-social" name="razon-social" autoComplete="organization" required type="text" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={LABEL} htmlFor="contact-name">Nombre de contacto <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="contact-name" name="contact-name" autoComplete="name" required type="text" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={LABEL} htmlFor="email">Correo electrónico <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="email" name="email" autoComplete="email" required type="email" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className={LABEL} htmlFor="phone">Teléfono de contacto <span aria-hidden="true" className="text-danger">*</span></label>
                      <input className={INPUT} id="phone" name="phone" autoComplete="tel" required type="tel" />
                    </div>
                  </div>
                </fieldset>

                <label className="flex cursor-pointer items-start gap-3">
                  <input className="mt-1 size-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" name="declaroQueLaInformacion" required type="checkbox" />
                  <span className="font-body-compact text-body-compact leading-relaxed text-text-secondary">
                    Confirmo que la información ingresada corresponde a mi requerimiento y acepto el tratamiento de mis datos conforme a la{" "}
                    <Link href="/privacidad" target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">política de privacidad</Link>.
                  </span>
                </label>

                <div className="space-y-3 border-t border-border pt-5">
                  <LeadError />
                  <LeadSubmit
                    className="w-full min-h-12 rounded-lg bg-primary px-6 font-button-text text-button-text text-on-primary shadow-sm transition-colors hover:bg-primary-container hover:text-brand-on focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none"
                    idle="Enviar solicitud de cotización"
                    pending="Enviando solicitud…"
                  />
                  <p className="font-ui-label text-ui-label leading-relaxed text-text-muted">
                    La confirmación aparecerá cuando la solicitud se registre correctamente.
                  </p>
                </div>
              </div>
            </LeadForm>
          </div>
        </div>
      </section>
      <section aria-labelledby="other-families-title" className="bg-background">
        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-ui-label text-ui-label font-semibold uppercase tracking-[.14em] text-primary">Más productos</p><h2 id="other-families-title" className="mt-2 font-headline-section text-headline-section font-semibold text-on-surface">Explora otras familias</h2></div><p className="max-w-xl font-body-compact text-body-compact text-text-secondary">La ficha y los datos técnicos de cada familia están sujetos a validación.</p></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[
            { title: "Válvulas", href: "/productos/valvulas", image: "/images/stitch/21934d3fa9.jpg", alt: "Válvula industrial, imagen referencial." },
            { title: "Tuberías", href: "/productos/tuberias", image: "/images/stitch/60efb938f5.jpg", alt: "Tuberías industriales, imagen referencial." },
            { title: "Marcos y tapas", href: "/productos/marcos-y-tapas", image: "/images/stitch/b2bccfdcb3.jpg", alt: "Marco y tapa, imagen referencial." },
          ].map((family) => <Link key={family.href} href={family.href} className="group overflow-hidden rounded-xl border border-border bg-surface-elevated transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"><div className="relative aspect-[16/9] overflow-hidden bg-surface"><Image src={family.image} alt={family.alt} width={1408} height={768} sizes="(min-width: 1024px) 360px, 90vw" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"/><span className="absolute bottom-3 left-3 rounded-md border border-border bg-surface-elevated/95 px-2.5 py-1 font-ui-label text-ui-label text-text-secondary">Imagen referencial</span></div><div className="flex items-center justify-between px-4 py-4"><h3 className="font-headline-card text-headline-card font-semibold text-on-surface">{family.title}</h3><span aria-hidden="true" className="text-primary">→</span></div></Link>)}</div>
        </div>
      </section>
    </main>
  );
}
