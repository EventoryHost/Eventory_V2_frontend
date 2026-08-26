import { apiFetch } from "./apiClient";

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
  businessName?: string;
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
  priceBreakdown: { totalAmount: number; totalReceived: number; amountDue: number };
  paymentTimeline: RawBookingMilestone[];
}

export async function getBookingDetail(bookingId: string) {
  return apiFetch<RawBookingDetailResponse>(`/customer/bookings/${bookingId}`, { auth: true });
}
