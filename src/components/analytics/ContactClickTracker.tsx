"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPhoneClick, trackWhatsAppClick } from "@/lib/analytics";

const WHATSAPP_PATTERN = /wa\.me\/|api\.whatsapp\.com|whatsapp\.com\/send/i;

// One capture-phase listener for every <a href> on the site: tel: links are
// phone clicks, WhatsApp chat links are whatsapp clicks. Never blocks the click.
export default function ContactClickTracker() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  useEffect(() => {
    if (isDashboard) return;

    const handler = (event: MouseEvent) => {
      try {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const anchor = target.closest("a[href]");
        if (!anchor) return;
        const href = anchor.getAttribute("href") ?? "";
        const linkLocation =
          anchor.closest("[data-track-location]")?.getAttribute("data-track-location") ?? window.location.pathname;

        if (href.toLowerCase().startsWith("tel:")) {
          trackPhoneClick({ linkLocation, linkUrl: href });
        } else if (WHATSAPP_PATTERN.test(href)) {
          // "wa.me/?text=" has no phone number: that is the package "share" feature, not a contact.
          if (/wa\.me\/\?/i.test(href)) return;
          trackWhatsAppClick({ linkLocation, linkUrl: href });
        }
      } catch {
        // Tracking must never break the click.
      }
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [isDashboard]);

  return null;
}
