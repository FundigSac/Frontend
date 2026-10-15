import type { Metadata } from "next";
import { CartPage } from "@/shared/cart/cart-page";

export const metadata: Metadata = {
  title: "Carrito de cotización",
  description: "Revisa los productos de tu cotización, ajusta medidas y cantidades y envía tu solicitud a FUNDIGSAC.",
  robots: { index: false, follow: true },
};

export default function CarritoPage() {
  return <CartPage />;
}
