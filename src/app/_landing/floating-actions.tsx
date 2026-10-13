"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useFloat } from "@/shared/layout/home-copy";

const WHATSAPP_NUMBER = "51908849664";

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.36A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.09.81.83-3.01-.2-.31a8.2 8.2 0 1 1 6.94 3.83Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.47c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.17 1.75 2.67 4.24 3.75.59.25 1.05.4 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}

export function FloatingActions() {
  const t = useFloat();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lp-float">
      <button
        type="button"
        className={`lp-float__top${showTop ? " is-visible" : ""}`}
        aria-label={t.top}
        title={t.top}
        tabIndex={showTop ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      >
        <ArrowUp aria-hidden="true" size={20} strokeWidth={2.2} />
      </button>
      <a
        className="lp-float__wa"
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.message)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.whatsapp}
        title={t.whatsapp}
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
}
