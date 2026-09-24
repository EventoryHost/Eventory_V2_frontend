// Domain types for the checkout flow (Review / Details / Payment), sourced
// from the real checkout-session endpoints (see services/getBookingSummaryData.ts
// and book-api.pdf's "Booking Flow — API Handoff"). All three pages under
// src/app/(checkout)/ share this one shape so the payment summary numbers
// never drift between steps.

import type { RawCustomizeRequest } from "@/lib/customerCheckoutApi";

export interface BookingLineRow {
  label: string;
  value: string;
  /** Optional explanatory text shown behind a small "?" next to the label (e.g. how the platform fee is worked out). */
  hint?: string;
}

export interface BookingAddon {
  id: string;
  name: string;
  quantity: number;
  price: string;
  /** Raw per-unit price (pre-formatting) — used to compute the Price breakdown total. */
  amount: number;
  /** Not yet persisted by the cart backend once an add-on is added to cart — see RawCartAddOn's doc comment in lib/customerCartApi.ts. Undefined today; wired ahead of that field landing. */
  category?: string;
  subCategory?: string;
  color?: string;
  image?: string;
}

export interface BookingServiceItem {
  /** The checkout session's line _id (see services/getBookingSummaryData.ts) — the identifier for note edits (PATCH .../lines/:lineId). NOT the same id as the CartItem this line came from — see cartItemId below. */
  lineId: string;
  /** The original CartItem._id this line was created from (RawCheckoutSessionLine.sourceCartItemId) — what "Edit Package" needs to reopen the PDP prefilled, same editItemId cart's own Edit Package link uses. Null if this session wasn't created from the cart. */
  cartItemId: string | null;
  /** Real, persisted PDP customize-item requests for this line — see RawCustomizeRequest's doc comment for why this is always [] today. */
  customizeRequests: RawCustomizeRequest[];
  packageId: string;
  vendorId: string;
  image: string;
  categoryLabel: string;
  categoryIcon: string;
  categoryGradientFrom: string;
  vendorName: string;
  serviceName: string;
  packageTier: string;
  date: string;
  time: string;
  location: string;
  eventType?: string;
  cancellationNote: string;
  /** Which refund tier cancellationNote's text reflects — same three-tier window used in cart's PackageInfo.tsx — or null when the note is actually an availability/bookability warning instead (already its own red text). */
  cancellationTierStatus: "full" | "half" | "none" | null;
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
  /** Image URLs attached to the note (RawCheckoutSessionLine.noteAttachments) — uploaded on the PDP and/or added here. */
  noteAttachments: string[];
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

export interface BookingPaymentMilestone {
  serviceName: string;
  title: string;
  percentage: number | null;
  amount: string | null;
  /** Formatted display date when the backend could compute one (needs the line's event date); otherwise the vendor's free-text "due X days before event" as a fallback. */
  due: string | null;
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
  /** Real per-package payment schedule from the vendor's own paymentMilestones config (see cartPricingService.js's computeLineMilestones) — empty when no line has any milestones configured. */
  milestones: BookingPaymentMilestone[];
  /**
   * The coupon code applied when this checkout session was created (from
   * Cart.coupon, snapshotted — see RawCheckoutSession's own doc comment).
   * Null when none was applied. Render "Coupon {code} applied" from this —
   * don't build anything around discountAmount being nonzero yet, it's a
   * known placeholder until the backend's real Coupon/Offer model exists.
   */
  appliedCouponCode: string | null;
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
  /**
   * When the event itself actually runs, as the customer tells the vendor —
   * not any line's own booked slot (which can genuinely differ, e.g. a
   * decorator's booked slot is when they work, not the event's own hours).
   * "" until the customer sets it on the Contact page.
   */
  eventTiming: { startTime: string; endTime: string };
  /** CheckoutSession.bookingNote — session-scoped, not the cart's own note. "" until set. */
  bookingNote: string;
  /** "" until the customer fills this in on the Contact page — one set for the whole order. */
  alternateCoordinator: { name: string; phone: string };
  /** "" until the customer fills this in on the Contact page — one set for the whole order. */
  gstin: { businessName: string; number: string };
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
