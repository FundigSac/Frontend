export const SITE = {
  name: "FUNDIGSAC",
  legalName: "FUNDIGSAC S.A.C.",
  ruc: "20601839281",
  /** Razón social completa y domicilio para documentos legales (misma fuente que src/lib/site-info.ts). */
  registeredName: "Fundición y Desarrollo de Ingeniería y Gestión S.A.C.",
  address: "Jirón Pacasmayo Mz. E Lt. 12, Cercado de Lima, Lima",
  url: "https://fundigsac.com",
  locale: "es-PE",
  email: "cotizaciones@fundigsac.com",
} as const;

export const MAIN_NAV = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
] as const;

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
