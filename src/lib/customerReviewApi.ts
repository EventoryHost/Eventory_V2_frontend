import { apiFetch } from "./apiClient";

// /api/customer/bookings/:bookingId/review (Eventory_V2_backend
// customerReviewController.js). Covers the booking's whole event — every
// package booked for the same event type on the same day — like the Booking
// Details page does.

export interface RawPackageReviewState {
  bookingId: string;
  packageId: string;
  /** Completed, or confirmed with the event date past. */
  reviewable: boolean;
  /** One review per package per customer — may come from an earlier booking of it. */
  review: { rating: number; comment: string; photos: string[]; bookingId: string; createdAt: string } | null;
}

export interface RawBookingReviewState {
  status: "SUCCESS";
  eventKey: string;
  canReviewEvent: boolean;
  eventReview: {
    overallRating: number | null;
    supportRating: number | null;
    /** The "What made it exceptional?" chips picked under each question. */
    overallHighlights: string[];
    supportHighlights: string[];
    createdAt: string;
  } | null;
  packages: RawPackageReviewState[];
}

export interface SubmitBookingReviewBody {
  event?: {
    overallRating?: number;
    supportRating?: number;
    overallHighlights?: string[];
    supportHighlights?: string[];
  };
  packages?: { bookingId: string; rating: number; comment?: string; photos?: string[] }[];
}

export async function getBookingReview(bookingId: string) {
  return apiFetch<RawBookingReviewState>(`/customer/bookings/${encodeURIComponent(bookingId)}/review`, {
    auth: true,
  });
}

/** Create-only; resolves to the updated review state. */
export async function submitBookingReview(bookingId: string, body: SubmitBookingReviewBody) {
  return apiFetch<RawBookingReviewState & { message: string }>(
    `/customer/bookings/${encodeURIComponent(bookingId)}/review`,
    { method: "POST", auth: true, body }
  );
}
