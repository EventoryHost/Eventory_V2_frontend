import { apiFetch } from "./apiClient";
import type {
  RawCartAddOn,
  RawCartAvailability,
  RawCartEventDetails,
  RawCartQuote,
  RawCartSelectedItem,
  RawCustomizeRequest,
} from "./customerCartApi";
import { clearCheckoutSessionId, getCheckoutSessionId } from "./checkoutSession";

// Re-exported so existing importers of RawCustomizeRequest from this module
// don't need to change — the type itself now lives in customerCartApi.ts
// since checkout/booking shapes reuse the cart's own raw types.
export type { RawCustomizeRequest };

// Raw shapes returned by /api/customer/checkout/session/* — see book-api.pdf
// ("Booking Flow — API Handoff"). session.lockedQuote and the line
// sub-shapes intentionally reuse the cart's own raw types since the backend
// documents them as identical to the cart/cart-quote payloads.

export interface RawCheckoutSessionLine {
  _id: string;
  customizeRequests?: RawCustomizeRequest[];
  /**
   * The CartItem._id this line was created from (source:"cart" sessions) —
   * distinct from this line's own _id, which is a fresh id the checkout
   * session generates for itself (confirmed against
   * Eventory_V2_backend/src/controllers/customerCheckoutController.js's
   * createCheckoutSession). "Edit Package" from booking summary needs THIS
   * id (the same one cart's own PDP editItemId link uses) — lineId is the
   * wrong id for that and silently produced a no-op prefill fetch.
   */
  sourceCartItemId?: string | null;
  vendorId: string;
  packageId: string;
  packageGroupId?: string;
  packageSnapshot: {
    name?: string;
    price?: number | null;
    billingUnit?: string | null;
    image?: string;
    vendorType?: string;
    variantType?: string;
  };
  eventDetails: RawCartEventDetails;
  selectedAddOns: RawCartAddOn[];
  selectedItems: RawCartSelectedItem[];
  specialRequest: string;
  /** Image URLs attached to this line's "Notes for vendor" — same field carried over from the CartItem this line was created from (CheckoutSessionLineSchema.noteAttachments). */
  noteAttachments?: string[];
  quantity: number;
}

export interface RawCheckoutSession {
  _id: string;
  status: "Active" | "Expired" | "Completed" | "Cancelled";
  expiresAt: string;
  contactDetails: { name?: string; phone?: string; email?: string };
  /**
   * "HH:MM" 24h, one value for the whole order (not per vendor line) — when
   * the event itself actually runs, as the customer tells the vendor.
   * Distinct from each line's own booked slot (eventDetails.timeSlot) —
   * a decorator's booked slot is when they work, not when the event runs,
   * so the two are allowed to differ and are never merged.
   */
  eventTiming?: { startTime?: string; endTime?: string };
  /** "Add Alternate Coordinator" — one set for the whole order, day-of backup contact. Both null until the customer fills this in on the Contact page. */
  alternateCoordinator?: { name?: string | null; phone?: string | null };
  /** "Add GSTIN details for tax invoice" — optional, one set for the whole order. `number` is stored/validated uppercase. */
  gstin?: { businessName?: string | null; number?: string | null };
  bookingNote: string;
  lines: RawCheckoutSessionLine[];
  lockedQuote: RawCartQuote | null;
  /**
   * Snapshotted from the cart at session-creation time (source:"cart" only),
   * same as bookingNote/contactDetails — never re-synced afterward, so this
   * won't reflect a coupon applied/removed on the cart after this session
   * was created. discountAmount is real but stays 0 until the backend's
   * Coupon/Offer model exists (2026-09-08 handoff) — code is real and
   * populated as soon as a customer applies one, independent of that.
   */
  coupon: { code: string; discountAmount: number } | null;
}

export interface RawCheckoutSessionAvailabilityEntry {
  lineId: string;
  packageStillAvailable: boolean;
  availability: RawCartAvailability | null;
}

export interface RawCheckoutSessionLineValidation {
  lineId: string;
  valid: boolean;
  errors: string[];
}

export interface RawCheckoutSessionValidation {
  contact: { valid: boolean; errors: string[]; phoneVerified: boolean };
  lines: { valid: boolean; perLine: RawCheckoutSessionLineValidation[] };
  canContinue: boolean;
}

export interface RawCheckoutSessionResponse {
  status: "SUCCESS";
  session: RawCheckoutSession;
  availability: RawCheckoutSessionAvailabilityEntry[];
  readyForPayment: boolean;
  validation: RawCheckoutSessionValidation;
}

export async function createCheckoutSession(body: { source: "cart" }) {
  return apiFetch<RawCheckoutSessionResponse>("/customer/checkout/session", {
    method: "POST",
    auth: true,
    body,
  });
}

export async function getCheckoutSession(sessionId: string) {
  return apiFetch<RawCheckoutSessionResponse>(`/customer/checkout/session/${sessionId}`, { auth: true });
}

export interface PatchCheckoutContactParams {
  name?: string;
  /** 10-digit Indian mobile, no +91 prefix. */
  phone?: string;
  email?: string;
}

/** At least one field is required — the backend 400s otherwise. */
export async function patchCheckoutSessionContact(sessionId: string, params: PatchCheckoutContactParams) {
  return apiFetch<RawCheckoutSessionResponse>(`/customer/checkout/session/${sessionId}/contact`, {
    method: "PATCH",
    auth: true,
    body: params,
  });
}

export interface PatchCheckoutEventTimingParams {
  /** "HH:MM" 24h. Send only the field that changed — this is a partial update, same as contact. */
  startTime?: string;
  endTime?: string;
}

/** 400s if the resulting end isn't after start (checked against whatever's already saved too, not just this request). */
export async function patchCheckoutSessionEventTiming(sessionId: string, params: PatchCheckoutEventTimingParams) {
  return apiFetch<RawCheckoutSessionResponse>(`/customer/checkout/session/${sessionId}/event-timing`, {
    method: "PATCH",
    auth: true,
    body: params,
  });
}

export interface PatchAlternateCoordinatorParams {
  /** Send only the field that changed — partial update, same as contact/event-timing. At least one of name/phone is required by the backend. */
  name?: string;
  /** 10-digit Indian mobile, no +91 prefix. */
  phone?: string;
}

/** One alternate coordinator for the whole order (not per line) — Booking.alternateCoordinator on every Booking this session produces. */
export async function patchCheckoutSessionAlternateCoordinator(
  sessionId: string,
  params: PatchAlternateCoordinatorParams
) {
  return apiFetch<RawCheckoutSessionResponse>(`/customer/checkout/session/${sessionId}/alternate-coordinator`, {
    method: "PATCH",
    auth: true,
    body: params,
  });
}

export interface PatchGstinParams {
  /** Send only the field that changed. At least one of businessName/number is required by the backend. */
  businessName?: string;
  /** 15-character GSTIN — 400s if it doesn't match the real GSTIN shape (2-digit state code, 10-char PAN, entity code, "Z", checksum). */
  number?: string;
}

/** Optional GSTIN for the tax invoice, one set for the whole order — Booking.gstin on every Booking this session produces. */
export async function patchCheckoutSessionGstin(sessionId: string, params: PatchGstinParams) {
  return apiFetch<RawCheckoutSessionResponse>(`/customer/checkout/session/${sessionId}/gstin`, {
    method: "PATCH",
    auth: true,
    body: params,
  });
}

/**
 * Session-scoped "Booking Notes" write (Contact page's BookingNotesSection.tsx)
 * — does NOT touch the cart, unlike customerCartApi.ts's setBookingNote,
 * which this component previously (wrongly) called. That cart endpoint
 * invalidates/cancels the customer's current checkout session as a side
 * effect (every cart-mutating endpoint does — an edit there can no longer
 * be reflected in an already-locked quote), which meant saving a note on
 * the Contact page was cancelling the very session that page was working
 * inside of — the real cause of "This checkout session is cancelled —
 * start a new one" showing up repeatedly during checkout (found 2026-09-25).
 */
export async function patchCheckoutSessionBookingNote(sessionId: string, bookingNote: string) {
  return apiFetch<RawCheckoutSessionResponse>(`/customer/checkout/session/${sessionId}/booking-note`, {
    method: "PATCH",
    auth: true,
    body: { bookingNote },
  });
}

export interface PatchCheckoutLineParams {
  specialRequest?: string;
  noteAttachments?: string[];
}

export async function patchCheckoutSessionLine(sessionId: string, lineId: string, params: PatchCheckoutLineParams) {
  return apiFetch<RawCheckoutSessionResponse>(`/customer/checkout/session/${sessionId}/lines/${lineId}`, {
    method: "PATCH",
    auth: true,
    body: params,
  });
}

export async function cancelCheckoutSession(sessionId: string) {
  return apiFetch<{ status: "SUCCESS"; message: string; session: RawCheckoutSession }>(
    `/customer/checkout/session/${sessionId}`,
    { method: "DELETE", auth: true }
  );
}

/**
 * Best-effort: cancels and forgets the current checkout session, if any, so
 * the next Review/Details/Payment load creates a fresh one. A session's
 * lockedQuote + lines are a snapshot of the cart's selected items taken at
 * creation time and never reflect edits made afterward — call this from
 * every cart-mutating endpoint (see customerCartApi.ts) so a stale session
 * can never linger and show removed/changed items after the fact.
 */
export interface ConfirmOfflineCheckoutResponse {
  status: "SUCCESS";
  message: string;
  paymentId: string;
  bookingIds: string[];
}

/**
 * Confirms a checkout session with payment handled entirely off this
 * platform — the in-app Cashfree payment step was removed (product
 * decision: payment isn't collected on-site for now), so this is the only
 * remaining way a session becomes real Booking(s). See
 * confirmOfflineCheckout in Eventory_V2_backend's customerPaymentController.js:
 * no real payment is verified, every line is recorded fully paid on trust
 * until real off-platform payment tracking is designed.
 */
export async function confirmCheckoutSessionOffline(sessionId: string) {
  return apiFetch<ConfirmOfflineCheckoutResponse>("/customer/payments/confirm-offline", {
    method: "POST",
    auth: true,
    body: { checkoutSessionId: sessionId },
  });
}

export async function invalidateCheckoutSession(): Promise<void> {
  const storedId = getCheckoutSessionId();
  if (!storedId) return;
  clearCheckoutSessionId();
  try {
    await cancelCheckoutSession(storedId);
  } catch {
    // Best-effort — an orphaned Active session just expires on its own after 30 minutes.
  }
}
