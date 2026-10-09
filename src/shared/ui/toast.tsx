"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type ToastApi = { show: (message: string, options?: { icon?: string; durationMs?: number }) => void };
const ToastContext = createContext<ToastApi>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

/** Toast único para la app (mismo aspecto que el toast del diseño W14). Región aria-live polite. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; icon: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<ToastApi["show"]>((message, options) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, icon: options?.icon ?? "check_circle" });
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), options?.durationMs ?? 3200);
  }, []);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed bottom-6 right-6 left-6 sm:left-auto z-[60] flex justify-end">
        <div
          className={`bg-inverse-surface text-brand-on px-4 py-3 rounded-lg shadow-lg font-body-compact text-body-compact flex items-center gap-2 transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
        >
          {toast && (
            <>
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-primary-fixed">{toast.icon}</span>
              <span>{toast.message}</span>
            </>
          )}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
