// src/app/(customer)/bookings/demo/page.tsx
import BookingDetailContent from "@/features/customer-booking-detail/components/BookingDetailContent";
import { buildMockBookingDetail, type MockBookingPhase } from "@/features/customer-booking-detail/data/mockBookingDetail";

// Static preview of Booking Details — no auth, no backend — mainly to show
// the Help & Support entries per phase: /bookings/demo?phase=booked |
// event_day | post_event. Like /packages/demo, this literal route wins over
// the [bookingId] dynamic route next to it.
export const dynamic = "force-dynamic";

const PHASES: MockBookingPhase[] = ["booked", "event_day", "post_event"];

export default async function BookingDetailDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ phase?: string }>;
}) {
  const { phase: raw } = await searchParams;
  const phase = PHASES.includes(raw as MockBookingPhase) ? (raw as MockBookingPhase) : "booked";
  return (
    <BookingDetailContent key={phase} bookingId="demo" demoView={buildMockBookingDetail(phase)} demoPhase={phase} />
  );
}
