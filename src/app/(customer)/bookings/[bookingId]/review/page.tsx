// src/app/(customer)/bookings/[bookingId]/review/page.tsx
import type { Metadata } from "next";
import BookingReviewContent from "@/features/customer-booking-review/components/BookingReviewContent";

export const metadata: Metadata = {
  title: "Add a review - Eventory",
};

// Full-width with a breadcrumb, like Booking Details next door — not under
// /account. Review state is customer-scoped, so it loads client-side.
export default async function BookingReviewPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <BookingReviewContent bookingId={bookingId} />;
}
