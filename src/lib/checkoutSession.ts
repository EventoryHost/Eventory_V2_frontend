// Client-owned identity for the active checkout session (see
// customerCheckoutApi.ts) — there's no cookie/URL-based session handoff
// between /booking-summary and /contact today, so the sessionId is
// persisted the same way guestCart.ts persists anonymous cart identity.

const STORAGE_KEY = "eventory_checkout_session_id";

export function getCheckoutSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setCheckoutSessionId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
}

export function clearCheckoutSessionId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
