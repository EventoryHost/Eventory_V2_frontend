import { apiFetch } from "./apiClient";
import type { RawCartAddOn, RawCartAvailability, RawCartEventDetails, RawCartQuote, RawCartSelectedItem } from "./customerCartApi";
import { clearCheckoutSessionId, getCheckoutSessionId } from "./checkoutSession";

// Raw shapes returned by /api/customer/checkout/session/* — see book-api.pdf
// ("Booking Flow — API Handoff"). session.lockedQuote and the line
// sub-shapes intentionally reuse the cart's own raw types since the backend
// documents them as identical to the cart/cart-quote payloads.

export interface RawCheckoutSessionLine {
  _id: string;
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
  quantity: number;
}

export interface RawCheckoutSession {
  _id: string;
  status: "Active" | "Expired" | "Completed" | "Cancelled";
  expiresAt: string;
  contactDetails: { name?: string; phone?: string; email?: string };
  bookingNote: string;
  lines: RawCheckoutSessionLine[];
  lockedQuote: RawCartQuote | null;
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

export interface PatchCheckoutLineParams {
  specialRequest?: string;
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
