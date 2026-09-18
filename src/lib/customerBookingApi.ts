import { apiFetch } from "./apiClient";
import type { RawConvenienceFeeBreakdown } from "./customerCartApi";

// Raw shapes returned by /api/customer/bookings/:bookingId (Eventory_V2_backend
// customerBookingController.js's getBookingDetail) — the "My Bookings" /
// booking-detail read model. Populated vendorId uses PUBLIC_VENDOR_FIELDS
// (same whitelist as vendorPublicApi.ts's getVendorPublic), but via a raw
// Mongoose populate().select() rather than that controller's own response
// shaping — id/_id are both optional here since which one actually comes
// through hasn't been confirmed against a live populate.
export interface RawBookingVendor {
  id?: string;
  _id?: string;
  // Customer-facing surfaces never show the vendor's business name — only
  // the vendor's own name. businessName has been dropped from this response
  // entirely, not just left empty.
  pocName?: string;
  profilePicture?: string;
  rating?: number;
  reviewsCount?: number;
  bookingsPerYear?: string;
}

export interface RawBookingMilestone {
  _id: string;
  title: string;
  percentage: number | null;
  amount: number;
  dueDate: string | null;
  status: "Pending" | "PaymentDue" | "Received";
  receivedDate: string | null;
}

export interface RawBookingPackageSnapshot {
  name?: string;
  price?: number;
  image?: string;
  vendorType?: string;
  variantType?: string;
}

export interface RawBooking {
  _id: string;
  bookingId: string;
  vendorId: RawBookingVendor | string;
  packageId: string;
  customer: { name: string; phone: string | null; email: string | null };
  eventType: string | null;
  eventDate: string;
  guestRange: { min: number | null; max: number | null };
  location: string | null;
  packageSnapshot: RawBookingPackageSnapshot | null;
  paymentType: "FreeBooking" | "AdvancePaid" | "FullPaid";
  status: "NewBooking" | "Viewed" | "InDiscussion" | "Confirmed" | "Declined" | "Cancelled" | "Completed";
  paymentMilestones: RawBookingMilestone[];
  totalAmount: number;
  totalReceived: number;
  notes: string | null;
  createdAt: string;
}

export interface RawBookingDetailResponse {
  status: "SUCCESS";
  booking: RawBooking;
  priceBreakdown: {
    totalAmount: number;
    /** 2026-09-10: new — the platform fee for this booking (0 when not applicable). */
    convenienceFee?: number;
    convenienceFeeBreakdown?: RawConvenienceFeeBreakdown | null;
    /** 2026-09-10: new — totalAmount + convenienceFee. amountDue is now measured against this. */
    grandTotal?: number;
    totalReceived: number;
    amountDue: number;
  };
  paymentTimeline: RawBookingMilestone[];
}

export async function getBookingDetail(bookingId: string) {
  return apiFetch<RawBookingDetailResponse>(`/customer/bookings/${bookingId}`, { auth: true });
}

// --- "My Bookings" list (GET /api/customer/bookings) ---------------------
//
// The list endpoint selects a narrower field set than getBookingDetail
// (BOOKING_LIST_FIELDS in customerBookingController.js), so it gets its own
// type rather than reusing RawBooking — no customer/guestRange/notes/
// paymentMilestones come back here. `amountDue` is computed per row by the
// controller, not stored.

export type BookingTab = "active" | "past" | "cancelled";

export interface RawBookingListItem {
  _id: string;
  bookingId: string;
  vendorId: RawBookingVendor | string;
  packageId: string;
  eventType: string | null;
  eventDate: string;
  location: string | null;
  packageSnapshot: RawBookingPackageSnapshot | null;
  paymentType: RawBooking["paymentType"];
  status: RawBooking["status"];
  totalAmount: number;
  totalReceived: number;
  amountDue: number;
  createdAt: string;
}

export interface RawBookingsResponse {
  status: "SUCCESS";
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** Badge counts across the customer's whole booking list — unaffected by `q`. */
  counts: Record<BookingTab, number>;
  bookings: RawBookingListItem[];
}

export interface GetBookingsParams {
  tab?: BookingTab;
  q?: string;
  sort?: "newest" | "eventDate_asc" | "eventDate_desc" | "amount_desc";
  page?: number;
  limit?: number;
}

function toQueryString(params: object) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getBookings(params: GetBookingsParams = {}) {
  return apiFetch<RawBookingsResponse>(`/customer/bookings${toQueryString(params)}`, { auth: true });
}
