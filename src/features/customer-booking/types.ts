// Domain types for the checkout flow (Review / Details / Payment), sourced
// from the real checkout-session endpoints (see services/getBookingSummaryData.ts
// and book-api.pdf's "Booking Flow — API Handoff"). All three pages under
// src/app/(checkout)/ share this one shape so the payment summary numbers
// never drift between steps.

export interface BookingLineRow {
  label: string;
  value: string;
}

export interface BookingAddon {
  id: string;
  name: string;
  quantity: number;
  price: string;
  /** Raw per-unit price (pre-formatting) — used to compute the Price breakdown total. */
  amount: number;
}

export interface BookingServiceItem {
  /** The checkout session's line _id (see services/getBookingSummaryData.ts) — the identifier for note edits (PATCH .../lines/:lineId). */
  lineId: string;
  packageId: string;
  vendorId: string;
  image: string;
  categoryLabel: string;
  categoryIcon: string;
  vendorName: string;
  serviceName: string;
  packageTier: string;
  date: string;
  time: string;
  location: string;
  eventType?: string;
  cancellationNote: string;
  price: string;
  packageStillAvailable: boolean;
  /**
   * False when the package is still Live but its live availability check
   * failed for the currently selected date/time/guest count (distinct from
   * packageStillAvailable, which means the package itself no longer
   * exists/is unpublished). This is what actually drives readyForPayment —
   * a line can look totally normal on the card and still be the reason
   * Continue is disabled.
   */
  isBookable: boolean;
  priceChanged: boolean;
  addons: BookingAddon[];
  /** Raw cart item `specialRequest` text — editable via the "Vendor Notes" section. */
  note: string;
}

export interface BookingVendorGroup {
  vendorId: string;
  avatar?: string;
  avatarInitial: string;
  vendorName: string;
  rating: number;
  reviewCount: number;
  eventsOnEventory: number;
  packageCount: number;
  subtotal: string;
  services: BookingServiceItem[];
}

export interface BookingPaymentSummary {
  vendorCount: number;
  packageCount: number;
  rows: BookingLineRow[];
  grandTotal: string;
  tokenAmount: string;
  payInFull: boolean;
  cancellationNote: string;
  /**
   * True only when quote.tokenAmountTotal is exactly 0 (every line resolved
   * to a genuinely free package) — the one condition where Pay Now should
   * call POST /payments/confirm-free instead of /payments/token. Distinct
   * from payInFull, which just means "no token split, charge the full
   * grandTotal" and still requires a real payment.
   */
  isFreeCheckout: boolean;
  /**
   * False when quote.tokenAmountTotal is null — one or more vendors haven't
   * configured an advance/token on their package, so there's nothing a real
   * payment (or confirm-free) can charge. Distinct from both isFreeCheckout
   * (tokenAmountTotal === 0, a real "nothing to pay" case) and payInFull
   * (which only describes the 0-vs-split shape of a *known* amount). Gate
   * the Pay/Continue action on `isFreeCheckout || tokenConfigured` — see
   * pay-integrate.txt Step 2, which is explicit that the real-payment button
   * should never be shown at all when this is false.
   */
  tokenConfigured: boolean;
}

export interface BookingContactDetails {
  /** Pre-filled from the customer's own profile if they have one on file. */
  name: string;
  phone: string;
  email: string;
  /** True only when `phone` exactly matches the customer's own verified number. */
  phoneVerified: boolean;
  /** validation.contact.errors from the session response — why contact.valid is currently false, e.g. "Phone number is not verified". Empty once contact.valid is true. */
  errors: string[];
}

export interface BookingSummaryData {
  /** The checkout session backing this data — "" when there was nothing to check out (no session created). */
  sessionId: string;
  /**
   * validation.canContinue from the session response — gates the final
   * Continue/Pay Now action, once contact details have actually been
   * collected. Requires contact.valid, which can only become true AFTER the
   * Details step — do NOT use this to gate leaving the Review step, or the
   * customer can never reach Details to satisfy it in the first place.
   */
  canContinue: boolean;
  /** readyForPayment from the session response — every line's package is still Live and available. Safe to gate the Review step's own Continue button on, unlike canContinue. */
  readyForPayment: boolean;
  contact: BookingContactDetails;
  vendorGroups: BookingVendorGroup[];
  paymentSummary: BookingPaymentSummary;
  /**
   * validation.lines.perLine from the session response, flattened into one
   * message per invalid line — e.g. missing eventType/date/location, which
   * nothing on Review/Details otherwise surfaces (Edit Package only opens
   * Cart's event-details editor for date/time/guests/location, so this is
   * the only place a customer learns a line is blocking canContinue for a
   * reason unrelated to their contact details).
   */
  lineErrors: string[];
}
