"use client";

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { OPEN_CART_EVENT } from "@/modules/cart/cart-store";
import "./cart.css";

// El panel se descarga la primera vez que alguien abre el carrito.
const CartDrawer = lazy(() => import("./cart-drawer"));

export function CartHost() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = () => {
      setMounted(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_CART_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CART_EVENT, onOpen);
  }, []);

  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <CartDrawer open={open} onClose={close} />
    </Suspense>
  );
}
