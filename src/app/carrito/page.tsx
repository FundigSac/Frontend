import type { Metadata } from "next";
import { CarritoView } from "./carrito-view";

export const metadata: Metadata = {
  title: "Carrito de cotización",
  description: "Revisa los productos de tu cotización, ajusta medidas y cantidades y envía tu solicitud a FUNDIGSAC.",
  robots: { index: false, follow: true },
};

export default function CarritoPage() {
  return <CarritoView />;
}
