import { categories, products } from "./catalog";

export const site = {
  legalName: "Fundición y Desarrollo de Ingeniería y Gestión S.A.C.",
  phone: "+51 908 849 664",
  phoneHref: "tel:+51908849664",
  whatsappNumber: "51908849664",
  email: "ventas@fundigsac.com",
  address: "Jirón Acomayo N.° 199, Lote 18, Mz. E, Cercado de Lima, Lima",
  hours: "Todos los días, de 10:00 a 18:00",
  instagram: "https://www.instagram.com/fundigsac/",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Jirón Acomayo 199, Cercado de Lima, Lima, Perú"),
};

export const whatsappLink = (message: string) => `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const countByCategory = (slug: string) => products.filter(p => p.category === slug).length;
export const categoryList = categories.map(c => ({ ...c, count: countByCategory(c.slug) }));
export const productsBySlug = (...slugs: string[]) => slugs.map(s => products.find(p => p.slug === s)).filter((p): p is NonNullable<typeof p> => Boolean(p));
