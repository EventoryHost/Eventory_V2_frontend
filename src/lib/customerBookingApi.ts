import { apiFetch } from "./apiClient";
import { apiUrl } from "./api";
import { getAccessToken } from "./customerSession";
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
  /** What PUBLIC_VENDOR_FIELDS actually projects — pocName is not in that list. */
  businessName?: string;
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

/** Pending until the vendor decides; the timeline gates on this. */
export type RawRequestStatus = "Pending" | "Accepted" | "Rejected";

export interface RawCustomizeRequest {
  setupId: string;
  itemId: string;
  requestType: "change" | "add" | "remove";
  label: string;
  quantity: number | null;
  type: string | null;
  colours: string[];
  volume: string | null;
  /** The vendor's decision on this one item. Absent on bookings made before the field existed. */
  status?: RawRequestStatus;
}

/**
 * The older "customer asks to add/remove an item, vendor decides" list. A
 * different shape from customizeRequests and kept separate backend-side,
 * but it carries the same Pending/Accepted/Rejected decision, so the
 * timeline has to honour both.
 */
export interface RawChangeRequest {
  _id?: string;
  changeType?: "Add" | "Remove";
  category?: string;
  item?: string;
  status?: RawRequestStatus;
}

/**
 * One add-on the booking was placed with (Booking.selectedAddOns). Carries
 * what was bought and for how much; the add-on's image/category live on the
 * package it came from, not here.
 */
export interface RawSelectedAddOn {
  addOnId: string | null;
  name: string;
  price: number;
  quantity: number;
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
  /** Free-text event window, e.g. "01 : 30 PM" — the model stores strings. */
  startTime: string | null;
  endTime: string | null;
  /** Map deep-link behind "See on map", when the customer supplied one. */
  mapLink: string | null;
  packageSnapshot: RawBookingPackageSnapshot | null;
  paymentType: "FreeBooking" | "AdvancePaid" | "FullPaid";
  status: "NewBooking" | "Viewed" | "InDiscussion" | "Confirmed" | "Declined" | "Cancelled" | "Completed";
  paymentMilestones: RawBookingMilestone[];
  totalAmount: number;
  totalReceived: number;
  notes: string | null;
  /** Status transition trail — the only status timestamps the model keeps. */
  confirmedAt: string | null;
  declinedAt: string | null;
  cancelledAt: string | null;
  /**
   * PDP "Customize items" workshop requests, carried unchanged from cart ->
   * checkout -> booking. setupId/itemId point back into the package's own
   * setups and items (the ids the workshop generated).
   */
  customizeRequests?: RawCustomizeRequest[];
  /** Empty on vendor-created bookings, which never go through a cart. */
  selectedAddOns?: RawSelectedAddOn[];
  createdAt: string;
}

/** One vendor-authored policy slot (models/schemas/policySchema.js). */
export interface RawPolicySlot {
  templateId?: string | null;
  templateTitle?: string | null;
  writtenText?: string | null;
  files?: string[];
}

/**
 * Read LIVE off the package's current policy fields, not frozen onto the
 * booking — the controller flags that caveat itself. There is no structured
 * refund ladder stored anywhere (see cancelBooking's comment), only these
 * template/written/document slots.
 */
export interface RawBookingCancellationPolicy {
  cancellationPolicy: RawPolicySlot | null;
  lastMinutePolicy: RawPolicySlot | null;
  generalPolicies: RawPolicySlot[];
  note: string;
}

/** One row of the price breakdown the detail endpoint synthesizes. */
export interface RawPriceCharge {
  label: string;
  amount: number;
  type: "Base" | "Fee" | "Tax";
}

export interface RawBookingDetailResponse {
  status: "SUCCESS";
  booking: RawBooking;
  priceBreakdown: {
    charges: RawPriceCharge[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
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
  cancellationPolicy: RawBookingCancellationPolicy;
  /** Event-manager contact. `available` is false everywhere today — no EM
      system exists in the backend, which says so in the payload itself. */
  emContact: { available: boolean; note: string };
}

export async function getBookingDetail(bookingId: string) {
  return apiFetch<RawBookingDetailResponse>(`/customer/bookings/${bookingId}`, { auth: true });
}

/**
 * GET /customer/bookings/:bookingId/invoice — a PDF, not JSON, so it can't go
 * through apiFetch (which always parses a JSON body). Per-booking only: the
 * backend notes a consolidated multi-vendor invoice isn't built.
 */
export async function downloadBookingInvoice(bookingId: string): Promise<Blob> {
  const token = getAccessToken();
  const response = await fetch(apiUrl(`/customer/bookings/${bookingId}/invoice`), {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error("Could not download that invoice");
  return response.blob();
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
  /** Only set once the vendor confirms — the one status timestamp the model keeps. */
  confirmedAt?: string | null;
  /** Both request lists, so the timeline can require "vendor accepted everything". */
  changeRequests?: RawChangeRequest[];
  customizeRequests?: RawCustomizeRequest[];
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
