/**
 * Help & Support configuration. Everything a non-developer might need to
 * change for launch lives here.
 */

/** Eventory business WhatsApp (confirmed by Amit, 2 Oct 2026). wa.me wants country code, no "+". */
export const SUPPORT_WHATSAPP_NUMBER = "919818030600";

/**
 * Number offered once a ticket goes unassigned past the escalation window.
 * TODO confirm: placeholder until the support line is finalised.
 */
export const SUPPORT_CALL_NUMBER = "+918800725840";
export const SUPPORT_CALL_LABEL = "+91 88007 25840";

const DEFAULT_ESCALATION_MS = 5 * 60 * 1000;

/**
 * How long a ticket waits for an EM/admin before the customer is offered a
 * call. 5 minutes in production; NEXT_PUBLIC_SUPPORT_ESCALATION_MS shortens
 * it for demos (e.g. 20000).
 */
export const SUPPORT_ESCALATION_MS = (() => {
  const raw = Number(process.env.NEXT_PUBLIC_SUPPORT_ESCALATION_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_ESCALATION_MS;
})();

/** Dev-only affordances (e.g. "Simulate EM assign") are hidden in production builds. */
export const SUPPORT_DEV_TOOLS = process.env.NODE_ENV !== "production";

/** Checkout steps show inline support entries instead of the floating launcher. */
export const LAUNCHER_HIDDEN_PREFIXES = ["/booking-summary", "/contact", "/payment"];
