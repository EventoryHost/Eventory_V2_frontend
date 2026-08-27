import { apiFetch } from "./apiClient";

// Raw shapes returned by /api/customer/payments/* — see book-api.pdf +
// pay-integrate.txt (2026-08-27 Cashfree return_url/bookingIds handoff).

export interface RawTokenPaymentResponse {
  status: "SUCCESS";
  message: string;
  /** Our own reference — not Cashfree's. Not persisted client-side: Cashfree's
   *  return_url already carries it back as ?paymentId=..., so /payment/return
   *  reads it straight from the query string instead. */
  paymentId: string;
  cfOrderId: string;
  /** Hand this straight to the Cashfree JS SDK's checkout() call. */
  paymentSessionId: string;
  amount: number;
  paymentStatus: "PENDING";
}

/**
 * Creates a real Cashfree order for the checkout session's locked token
 * amount. Idempotent — safe to call again on a retry/double-click while the
 * existing intent is still PENDING (200) rather than creating a duplicate.
 *
 * Only call this when session.lockedQuote.tokenAmountTotal is a positive
 * number — 0 means use confirmFreeCheckout instead, null means the session
 * isn't payable yet (see pay-integrate.txt Step 2).
 */
export async function createTokenPayment(checkoutSessionId: string) {
  return apiFetch<RawTokenPaymentResponse>("/customer/payments/token", {
    method: "POST",
    auth: true,
    body: { checkoutSessionId },
  });
}

export interface ConfirmFreeCheckoutResponse {
  status: "SUCCESS";
  message: string;
  paymentId: string;
  bookingIds: string[];
}

/**
 * For a genuinely Free (zero-token) package only — session.lockedQuote.tokenAmountTotal
 * must be exactly 0 (see pay-integrate.txt Step 2). Creates the real
 * Booking(s) with no payment collected, same as confirmOfflineCheckout but
 * reserved for this one specific case rather than any amount.
 */
export async function confirmFreeCheckout(checkoutSessionId: string) {
  return apiFetch<ConfirmFreeCheckoutResponse>("/customer/payments/confirm-free", {
    method: "POST",
    auth: true,
    body: { checkoutSessionId },
  });
}

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";

export interface RawPaymentStatusResponse {
  status: "SUCCESS";
  paymentId: string;
  checkoutSessionId: string;
  /** Only ever set for a milestone payment (paymentType "Milestone") — null for a Token payment. */
  bookingId: string | null;
  /** Populated once paymentStatus is PAID — one Booking per vendor/line in the checkout session. */
  bookingIds: string[];
  paymentType: "Token" | "Milestone";
  amount: number;
  paymentStatus: PaymentStatus;
  failureReason: string | null;
  paidAt: string | null;
}

/**
 * Status-poll endpoint — actively re-checks with Cashfree itself on every
 * call while still PENDING (not just reading a stale DB value), so it's
 * meant to be polled every ~2s from /payment/return rather than waited on
 * once.
 */
export async function getPaymentStatus(paymentId: string) {
  return apiFetch<RawPaymentStatusResponse>(`/customer/payments/${paymentId}`, { auth: true });
}
