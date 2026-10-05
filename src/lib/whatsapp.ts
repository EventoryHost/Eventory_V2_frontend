// Single source of truth for every "Chat/Book/Contact on WhatsApp" button
// across the customer site — PM-supplied number 2026-10-05. Country code
// prepended once here rather than at each call site.
export const WHATSAPP_NUMBER = "919818030600";

export function buildWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
