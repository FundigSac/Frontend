import type { CartItem } from "@/modules/cart/cart-store";

/**
 * Arma el cuerpo de POST /api/v1/quotes (SubmitQuoteRequest del Backend) a partir de los formularios de /cotizar. El
 * texto que lee Ventas va en español, sin importar el idioma de la pantalla.
 */
export type QuoteLine = { productSlug?: string; productName?: string; variantLabel?: string; quantity: number; unit: string; notes?: string };
export type QuoteBody = {
  origin: "GENERAL_FORM" | "PRODUCT_FORM";
  contact: { companyName: string; ruc: string; contactName: string; position?: string; email: string; phone: string };
  project: { projectType?: string; deliveryDepartment?: string; deliveryPlace?: string; requestedDeliveryDate?: string; message?: string };
  items: QuoteLine[];
  privacyNoticeVersion: string;
  acceptPrivacyNotice: boolean;
};

const PROJECT_TYPES: Record<string, string> = { saneamiento: "Agua y saneamiento", matrices: "Redes y matrices", alcantarillado: "Alcantarillado y drenaje", otro: "Otro" };
const FAMILIES: Record<string, string> = { valvulas: "Válvulas", tuberias: "Tuberías", marcos_tapas: "Marcos y tapas", mixto: "Varias familias u otro producto" };

const get = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
const cut = (value: string, max: number) => (value.length > max ? value.slice(0, max) : value);
const optional = (value: string, max: number) => (value ? cut(value, max) : undefined);
const quantity = (raw: string) => {
  const n = Number.parseFloat(raw.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n * 1000) / 1000, 1_000_000) : 1;
};

export function cartLines(cart: CartItem[]): QuoteLine[] {
  return cart.slice(0, 50).map((item) => ({
    productSlug: item.slug,
    productName: cut(item.name, 200),
    variantLabel: item.variant ? cut(item.variant, 120) : undefined,
    quantity: item.quantity,
    unit: "und",
    notes: item.note ? cut(item.note, 1000) : undefined,
  }));
}

/** Cotización general (W16): datos de la empresa y del proyecto; los productos salen del carrito o del texto libre. */
export function generalQuote(data: FormData, cart: CartItem[], privacyNoticeVersion: string): QuoteBody {
  const family = FAMILIES[get(data, "familiaPrincipal")] ?? get(data, "familiaPrincipal");
  const sizes = get(data, "diametrosNominales");
  const amount = get(data, "cantidadMetrado");
  const summary = `Familia principal: ${family}. Diámetros nominales: ${sizes}. Cantidad o metrado: ${amount}.`;
  const lines = cart.length
    ? cartLines(cart)
    : [{ productName: cut(family || "Producto por definir", 200), variantLabel: optional(sizes, 120), quantity: quantity(amount), unit: "und", notes: optional(`Cantidad o metrado indicado: ${amount}`, 1000) }];
  return {
    origin: "GENERAL_FORM",
    contact: {
      companyName: cut(get(data, "razonSocial"), 160),
      ruc: get(data, "rucEmpresa").replace(/\s/g, ""),
      contactName: cut(get(data, "nombreSolicitante"), 120),
      position: optional(get(data, "cargoSolicitante"), 120),
      email: get(data, "correoCorporativo"),
      phone: cut(get(data, "celularContacto"), 24),
    },
    project: {
      projectType: PROJECT_TYPES[get(data, "tipoProyecto")] ?? optional(get(data, "tipoProyecto"), 120),
      deliveryDepartment: optional(get(data, "departamentoDestino"), 60),
      message: cut(summary, 4000),
    },
    items: lines,
    privacyNoticeVersion,
    acceptPrivacyNotice: Boolean(data.get("consentimiento")),
  };
}

/** Cotización de un producto (W17): una línea con la cantidad, el lugar y la fecha de entrega. */
export function productQuote(data: FormData, privacyNoticeVersion: string): QuoteBody {
  const date = get(data, "delivery-date");
  return {
    origin: "PRODUCT_FORM",
    contact: {
      companyName: cut(get(data, "razon-social"), 160),
      ruc: get(data, "ruc").replace(/\s/g, ""),
      contactName: cut(get(data, "contact-name"), 120),
      email: get(data, "email"),
      phone: cut(get(data, "phone"), 24),
    },
    project: {
      deliveryPlace: optional(get(data, "delivery-place"), 200),
      requestedDeliveryDate: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
      message: optional(get(data, "notes"), 4000),
    },
    items: [{ productSlug: optional(get(data, "producto"), 120), productName: optional(get(data, "productoNombre"), 200), quantity: quantity(get(data, "input-qty")), unit: "und", notes: optional(get(data, "notes"), 1000) }],
    privacyNoticeVersion,
    acceptPrivacyNotice: Boolean(data.get("declaroQueLaInformacion")),
  };
}

/**
 * El catálogo del sitio y el de la API pueden no coincidir en un producto o medida. Si la API no reconoce el slug, la
 * solicitud se reenvía con las mismas líneas como texto libre: Ventas la recibe igual, con el nombre y la medida.
 */
export function withoutCatalogLinks(body: QuoteBody): QuoteBody {
  return { ...body, items: body.items.map(({ productSlug, ...line }) => ({ ...line, productName: line.productName ?? productSlug ?? "Producto" })) };
}
