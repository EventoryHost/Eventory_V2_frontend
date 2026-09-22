import {
  getBookingDetail,
  getBookings,
  type RawBooking,
  type RawBookingListItem,
  type RawPolicySlot,
} from "@/lib/customerBookingApi";
import { formatAmount } from "@/features/customer-account/utils/groupBookings";
import type { BookingDetailView, BookingJourneyStep, BookingPackageRow } from "../types";

/** Statuses the vendor hasn't acted on yet — the backend's PRE_ACCEPTANCE set. */
const AWAITING_STATUSES: RawBookingListItem["status"][] = ["NewBooking", "Viewed", "InDiscussion"];

const STATUS_LABEL: Record<RawBookingListItem["status"], { label: string; tone: BookingPackageRow["statusTone"] }> = {
  NewBooking: { label: "PENDING", tone: "pending" },
  Viewed: { label: "PENDING", tone: "pending" },
  InDiscussion: { label: "PENDING", tone: "pending" },
  Confirmed: { label: "CONFIRMED", tone: "confirmed" },
  Declined: { label: "DECLINED", tone: "cancelled" },
  Cancelled: { label: "CANCELLED", tone: "cancelled" },
  Completed: { label: "COMPLETED", tone: "completed" },
};

function eventDayKey(iso: string) {
  return iso.slice(0, 10);
}

function vendorNameOf(booking: RawBookingListItem | RawBooking) {
  const vendor = booking.vendorId;
  if (!vendor || typeof vendor === "string") return undefined;
  return vendor.businessName ?? vendor.pocName;
}

function guestsLabelOf(booking: RawBooking) {
  const { min, max } = booking.guestRange ?? {};
  if (min && max && min !== max) return `${min}-${max} guests`;
  const single = max ?? min;
  return single ? `${single} guests` : undefined;
}

function policyOf(slot: RawPolicySlot | null) {
  if (!slot) return {};
  return {
    title: slot.templateTitle ?? undefined,
    text: slot.writtenText ?? undefined,
    fileUrl: slot.files?.[0],
  };
}

/**
 * Builds the journey down the left of the page. The only status timestamp the
 * model keeps is confirmedAt (plus declinedAt/cancelledAt), so a step carries
 * a date only where one really exists: createdAt, confirmedAt, and the event
 * date. The rest show none rather than an invented one.
 */
function buildJourney(
  group: RawBookingListItem[],
  bookedOn: string,
  eventDate: string,
  confirmedAt: string | null
): BookingJourneyStep[] {
  const total = group.length;
  const confirmed = group.filter((row) => row.status === "Confirmed" || row.status === "Completed").length;
  const tokenPaid = group.reduce((sum, row) => sum + (row.totalReceived || 0), 0);
  const allConfirmed = total > 0 && confirmed === total;
  const eventPassed = new Date(eventDate).getTime() < Date.now();

  const steps: Omit<BookingJourneyStep, "state">[] = [
    {
      id: "started",
      title: "Booking started",
      description: tokenPaid
        ? `Token of ${formatAmount(tokenPaid)} paid. Your event is underway.`
        : "Your event is underway.",
      date: bookedOn,
    },
    {
      id: "confirmed",
      title: "All vendors confirmed",
      // Booking.confirmedAt is the one status timestamp the model keeps, and
      // only for the booking this page was opened with — so it dates this
      // step when the whole event is confirmed, and nothing else does.
      date: allConfirmed && confirmedAt ? confirmedAt : undefined,
      description: allConfirmed
        ? `All ${total} ${total === 1 ? "vendor is" : "vendors are"} locked in for your event.`
        : `${confirmed} of ${total} ${total === 1 ? "vendor has" : "vendors have"} confirmed so far.`,
    },
    {
      id: "ready",
      title: "Getting event-ready",
      description: "Tastings, trials and final coordination with each vendor.",
    },
    {
      id: "event-day",
      title: "Event day",
      description: "Your celebration.",
      date: eventDate,
    },
  ];

  const doneCount = 1 + (allConfirmed ? 1 : 0) + (eventPassed ? 2 : 0);

  return steps.map((step, index) => ({
    ...step,
    state: index < doneCount ? "done" : index === doneCount ? "current" : "upcoming",
  }));
}

/**
 * Loads everything the Booking Details page shows.
 *
 * A "booking" is one vendor's package in backend terms, while this page is
 * about the whole EVENT, so the focal booking's siblings are pulled from the
 * list endpoint and grouped the same way My Bookings groups them (event type
 * + calendar day). All three tabs are fetched because one event can easily
 * have, say, two confirmed packages and one cancelled, which live in
 * different tabs.
 */
export async function getBookingDetailView(bookingId: string): Promise<BookingDetailView> {
  const detail = await getBookingDetail(bookingId);
  const booking = detail.booking;

  const lists = await Promise.all(
    (["active", "past", "cancelled"] as const).map((tab) =>
      getBookings({ tab, limit: 50 }).catch(() => null)
    )
  );

  const rows = lists.flatMap((list) => list?.bookings ?? []);
  const group = rows.filter(
    (row) =>
      (row.eventType ?? "Event") === (booking.eventType ?? "Event") &&
      eventDayKey(row.eventDate) === eventDayKey(booking.eventDate)
  );

  // The focal booking is always part of its own group, even if the list
  // request failed or paged past it.
  if (!group.some((row) => row.bookingId === booking.bookingId)) {
    group.unshift({
      ...(booking as unknown as RawBookingListItem),
      amountDue: Math.max(0, (booking.totalAmount || 0) - (booking.totalReceived || 0)),
    });
  }

  const bookedOn = group.reduce(
    (earliest, row) => (new Date(row.createdAt) < new Date(earliest) ? row.createdAt : earliest),
    booking.createdAt
  );

  const packages: BookingPackageRow[] = group.map((row) => {
    const status = STATUS_LABEL[row.status];
    return {
      id: row._id,
      reference: row.bookingId,
      name: row.packageSnapshot?.name ?? "Package",
      variantLabel: row.packageSnapshot?.variantType,
      vendorName: vendorNameOf(row),
      image: row.packageSnapshot?.image,
      statusLabel: status.label,
      statusTone: status.tone,
    };
  });

  return {
    reference: booking.bookingId,
    eventTitle: booking.eventType ?? "Event",
    eventDate: booking.eventDate,
    startTime: booking.startTime ?? undefined,
    endTime: booking.endTime ?? undefined,
    guestsLabel: guestsLabelOf(booking),
    location: booking.location ?? undefined,
    bookedOn,

    // Totals span the event, not just the booking that was opened. The focal
    // booking's own grandTotal (which adds its convenience fee) is only
    // available for that one row, so the group is summed from the list's
    // per-row figures to keep one consistent basis.
    orderTotal: group.reduce((sum, row) => sum + (row.totalAmount || 0), 0),
    tokenPaid: group.reduce((sum, row) => sum + (row.totalReceived || 0), 0),
    remaining: group.reduce((sum, row) => sum + (row.amountDue || 0), 0),

    packages,
    respondedCount: group.filter((row) => !AWAITING_STATUSES.includes(row.status)).length,
    journey: buildJourney(group, bookedOn, booking.eventDate, booking.confirmedAt),
    paymentTimeline: detail.paymentTimeline,
    cancellationPolicy: {
      ...policyOf(detail.cancellationPolicy?.cancellationPolicy ?? null),
      note: detail.cancellationPolicy?.note ?? "",
    },
  };
}
