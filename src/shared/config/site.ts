export const SITE = {
  name: "FUNDIGSAC",
  legalName: "FUNDIGSAC S.A.C.",
  ruc: "20601839281",
  url: "https://fundigsac.com",
  locale: "es-PE",
  email: "cotizaciones@fundigsac.com",
} as const;

export const MAIN_NAV = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/soluciones", label: "Soluciones" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/recursos", label: "Recursos" },
  { href: "/contacto", label: "Contacto" },
] as const;

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
