// src/app/(customer)/bookings/[bookingId]/page.tsx
import type { Metadata } from "next";
import BookingDetailContent from "@/features/customer-booking-detail/components/BookingDetailContent";

export const metadata: Metadata = {
  title: "Booking Details - Eventory",
};

// Deliberately NOT under /account: that route group's layout adds the account
// sidebar, and this page is full-width in the design (breadcrumb instead).
// The booking sits behind an authenticated, customer-scoped endpoint, so it
// loads client-side.
export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <BookingDetailContent bookingId={bookingId} />;
}
