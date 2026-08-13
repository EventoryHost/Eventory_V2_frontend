// Anonymous cart identity — the backend has no session/cookie for a guest
// cart (see Eventory_V2_backend customerCartRoutes.js), the client owns an
// opaque `guestCartId` string instead, sent back as the X-Guest-Cart-Id
// header on every cart request. Persisted the same way customerSession.ts
// persists the logged-in session (localStorage, guarded for SSR).

const STORAGE_KEY = "eventory_guest_cart_id";

export function getGuestCartId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setGuestCartId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
}

export function clearGuestCartId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
