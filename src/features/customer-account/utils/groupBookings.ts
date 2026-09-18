import type { RawBookingListItem } from "@/lib/customerBookingApi";
import type { BookingOrderGroup } from "../types";

/** Statuses the vendor hasn't acted on yet — the backend's PRE_ACCEPTANCE set. */
const NEEDS_RESPONSE_STATUSES: RawBookingListItem["status"][] = ["NewBooking", "Viewed", "InDiscussion"];

function eventDateKey(iso: string) {
  // Group by calendar day, not by timestamp — two packages booked for the
  // same event can carry slightly different times.
  return iso.slice(0, 10);
}

export function formatEventDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

export function formatBookedOn(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatAmount(value: number) {
  return `₹ ${value.toLocaleString("en-IN")}`;
}

export function groupBookingsByEvent(bookings: RawBookingListItem[]): BookingOrderGroup[] {
  const groups = new Map<string, RawBookingListItem[]>();

  bookings.forEach((booking) => {
    const key = `${booking.eventType ?? "Event"}__${eventDateKey(booking.eventDate)}`;
    const existing = groups.get(key);
    if (existing) existing.push(booking);
    else groups.set(key, [booking]);
  });

  return Array.from(groups.entries()).map(([id, rows]) => {
    // Newest first so "View Booking" and the displayed reference both point
    // at the most recently created row in the group.
    const sorted = [...rows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const first = sorted[0];
    const eventDay = formatEventDay(first.eventDate);

    return {
      id,
      title: eventDay ? `${first.eventType ?? "Event"} on ${eventDay}` : (first.eventType ?? "Event"),
      packagesSummary: sorted
        .map((row) => row.packageSnapshot?.name)
        .filter((name): name is string => Boolean(name))
        .join(", "),
      packageCount: sorted.length,
      reference: first.bookingId,
      image: sorted.find((row) => row.packageSnapshot?.image)?.packageSnapshot?.image,
      orderTotal: sorted.reduce((sum, row) => sum + (row.totalAmount || 0), 0),
      tokenPaid: sorted.reduce((sum, row) => sum + (row.totalReceived || 0), 0),
      bookedOn: sorted.reduce(
        (earliest, row) => (new Date(row.createdAt) < new Date(earliest) ? row.createdAt : earliest),
        first.createdAt
      ),
      location: sorted.find((row) => row.location)?.location ?? null,
      needsResponseCount: sorted.filter((row) => NEEDS_RESPONSE_STATUSES.includes(row.status)).length,
      confirmedCount: sorted.filter((row) => row.status === "Confirmed").length,
      cancelledCount: sorted.filter((row) => row.status === "Cancelled").length,
      declinedCount: sorted.filter((row) => row.status === "Declined").length,
      completedCount: sorted.filter((row) => row.status === "Completed").length,
      // amountDue is computed per row by the controller (totalAmount -
      // totalReceived); a row that has received nothing yet is the one still
      // waiting on its advance. Cancelled/declined rows are excluded — money
      // isn't pending on a booking that isn't happening.
      advancePendingCount: sorted.filter(
        (row) =>
          row.amountDue > 0 &&
          row.totalReceived === 0 &&
          !["Cancelled", "Declined"].includes(row.status)
      ).length,
      allConfirmed:
        sorted.length > 0 && sorted.every((row) => row.status === "Confirmed"),
      bookings: sorted,
    };
  });
}
