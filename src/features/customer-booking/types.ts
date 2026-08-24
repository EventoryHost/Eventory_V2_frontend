// Domain types for the checkout flow (Review / Details / Payment), sourced
// from the real cart + cart-quote endpoints (see services/getBookingSummaryData.ts).
// All three pages under src/app/(checkout)/ share this one shape so the
// payment summary numbers never drift between steps.

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
  cartItemId: string;
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
}

export interface BookingSummaryData {
  vendorGroups: BookingVendorGroup[];
  paymentSummary: BookingPaymentSummary;
}
