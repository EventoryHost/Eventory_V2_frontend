// Single module for every tracking call in the app. It only pushes events to
// window.dataLayer; Google Tag Manager (configured by a human in the GTM UI)
// decides which tags fire. Never push to dataLayer anywhere else.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function push(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  } catch {
    // Tracking must never break the UI.
  }
}

export function normalizeEmail(email?: string | null): string | undefined {
  const value = (email ?? "").trim().toLowerCase();
  return value && value.includes("@") ? value : undefined;
}

export function normalizePhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const hasPlus = phone.trim().startsWith("+");
  const digits = phone.replace(/\D/g, "");
  if (hasPlus) return digits.length >= 11 && digits.length <= 15 ? `+${digits}` : undefined;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return undefined;
}

export function buildUserData(params: {
  email?: string | null;
  phone?: string | null;
}): { email?: string; phone_number?: string } | undefined {
  const email = normalizeEmail(params.email);
  const phone_number = normalizePhone(params.phone);
  if (!email && !phone_number) return undefined;
  return { ...(email && { email }), ...(phone_number && { phone_number }) };
}

const FBCLID_KEY = "ev_fbclid";

/** Remembers ?fbclid=... for the session so checkout can build the _fbc value later. */
export function captureFbclid(): void {
  if (typeof window === "undefined") return;
  try {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) window.sessionStorage.setItem(FBCLID_KEY, fbclid);
  } catch {
    // Storage unavailable: skip.
  }
}

function readCookie(name: string): string | undefined {
  try {
    const match = document.cookie.split("; ").find((part) => part.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) || undefined : undefined;
  } catch {
    return undefined;
  }
}

/** Meta browser identifiers for the server-side Conversions API; empty values are omitted. */
export function getMetaBrowserIds(): { fbp?: string; fbc?: string } {
  if (typeof window === "undefined") return {};
  const fbp = readCookie("_fbp");
  let fbc = readCookie("_fbc");
  if (!fbc) {
    let fbclid: string | null = null;
    try {
      fbclid = new URLSearchParams(window.location.search).get("fbclid") || window.sessionStorage.getItem(FBCLID_KEY);
    } catch {
      // Storage unavailable: skip.
    }
    if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
  }
  return { ...(fbp && { fbp }), ...(fbc && { fbc }) };
}

export function trackEvent(event: string, params: Record<string, unknown> = {}): void {
  push({ event, ...params });
}

export function trackVirtualPageView(): void {
  if (typeof window === "undefined") return;
  push({
    event: "virtual_page_view",
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackLead(params: {
  leadType: string;
  formLocation: string;
  email?: string | null;
  phone?: string | null;
}): void {
  push({
    event: "generate_lead",
    lead_type: params.leadType,
    form_location: params.formLocation,
    user_data: buildUserData(params),
  });
}

export function trackWhatsAppClick(params: { linkLocation: string; linkUrl: string }): void {
  push({ event: "whatsapp_click", link_location: params.linkLocation, link_url: params.linkUrl });
}

export function trackPhoneClick(params: { linkLocation: string; linkUrl: string }): void {
  push({ event: "phone_click", link_location: params.linkLocation, link_url: params.linkUrl });
}

export interface FunnelItem {
  id: string;
  name: string;
  category?: string;
  price: number;
}

function pushEcommerce(event: string, value: number, items: FunnelItem[]): void {
  if (typeof window === "undefined" || items.length === 0) return;
  push({ ecommerce: null });
  push({
    event,
    ecommerce: {
      currency: "INR",
      value,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: 1,
      })),
    },
  });
}

/** A package detail page was viewed. Callers must guard against repeats. */
export function trackViewItem(params: { value: number; item: FunnelItem }): void {
  pushEcommerce("view_item", params.value, [params.item]);
}

/** A package was successfully added to the cart. */
export function trackAddToCart(params: { value: number; item: FunnelItem }): void {
  pushEcommerce("add_to_cart", params.value, [params.item]);
}

/** Checkout started from the cart with the selected items. */
export function trackBeginCheckout(params: { value: number; items: FunnelItem[] }): void {
  pushEcommerce("begin_checkout", params.value, params.items);
}

export function trackPurchase(params: {
  bookingIds: string[];
  value: number;
  items: { id: string; name: string; category?: string; price: number }[];
  email?: string | null;
  phone?: string | null;
}): void {
  if (typeof window === "undefined") return;
  // Must stay identical to the backend's Meta CAPI event_id so Meta de-duplicates the pair.
  const eventId = `purchase_${[...params.bookingIds].sort().join("_")}`;
  const storageKey = `ev_tracked_${eventId}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // Storage unavailable: still track.
  }
  push({ ecommerce: null });
  push({
    event: "purchase",
    event_id: eventId,
    ecommerce: {
      transaction_id: eventId,
      value: params.value,
      currency: "INR",
      items: params.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: 1,
      })),
    },
    user_data: buildUserData(params),
  });
}
