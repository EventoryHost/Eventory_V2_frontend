import type { RawBookingListItem } from "@/lib/customerBookingApi";

/**
 * One "Active Bookings" card in the account dashboard.
 *
 * The backend returns one Booking row per vendor and can't yet group several
 * vendors under a single order (customerBookingController.js flags this as
 * PART 5 #4, still open), while the design shows an order-level card —
 * "Corporate Gala on 8 November · 2 packages". So the grouping happens here,
 * keyed by event type + event date, and collapses back to a single-package
 * card when that's all there is.
 */
export interface BookingOrderGroup {
  /** Stable key: the event type + date the group was built from. */
  id: string;
  /** "Corporate Gala on 8 November" */
  title: string;
  /** Comma-joined package names — "Luxury Lights, Platinum Catering". */
  packagesSummary: string;
  packageCount: number;
  /** Reference shown top-right. The first booking's id when several share an event. */
  reference: string;
  image?: string;
  orderTotal: number;
  tokenPaid: number;
  /** Earliest createdAt across the group. */
  bookedOn: string;
  location: string | null;
  needsResponseCount: number;
  confirmedCount: number;
  /** Customer-cancelled rows — the design's "Cancelled by you". */
  cancelledCount: number;
  /** Vendor-declined rows, which read differently from a self-cancel. */
  declinedCount: number;
  completedCount: number;
  /** True when every package in the group is confirmed — the design collapses
      that to a single "All packages confirmed" row instead of a count. */
  allConfirmed: boolean;
  /** Underlying rows, newest first — "View Booking" links to the first. */
  bookings: RawBookingListItem[];
}

/**
 * Saved payment instruments shown on the Payment Details page.
 *
 * NOTHING POPULATES THESE YET. The backend has no saved-instrument storage:
 * Customer.js has no cards/UPI fields, and customerPaymentRoutes.js only
 * creates and confirms payments (the single "instrument" reference in the
 * codebase is vendor payout beneficiary details in adminVendorController).
 *
 * These shapes describe what the design needs so the page can be wired up
 * in one place once that exists. Note that saving cards is PCI-regulated —
 * the implementation must store the payment provider's instrument token,
 * never a card number, and the frontend must never see a full PAN. Hence
 * `last4` and `network` here rather than anything resembling card data.
 */
export interface SavedUpiId {
  id: string;
  /** e.g. "7664936589@ybl" */
  vpa: string;
  /** Handle provider, used to pick the logo. */
  provider?: "phonepe" | "gpay" | "paytm" | "other";
  isPrimary?: boolean;
}

export interface SavedCard {
  id: string;
  /** e.g. "Axis Bank Credit Card" */
  label: string;
  /** Last four digits only — never the full number. */
  last4: string;
  network?: "visa" | "mastercard" | "rupay" | "other";
  holderName?: string;
}
