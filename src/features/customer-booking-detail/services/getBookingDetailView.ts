import {
  getBookingDetail,
  getBookings,
  type RawBooking,
  type RawBookingListItem,
  type RawPolicySlot,
} from "@/lib/customerBookingApi";
import { formatAmount } from "@/features/customer-account/utils/groupBookings";
import type {
  BookingDetailView,
  BookingJourneyStep,
  BookingJourneyVendor,
  BookingPackageRow,
} from "../types";
import { isProposalAwaitingReview, isReopened } from "../utils/proposal";

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
/**
 * True only when the vendor has settled EVERY request on this booking.
 *
 * A booking can sit at status "Confirmed" while the customer's
 * add/remove/customise requests are still undecided — the vendor said yes
 * to the booking but hasn't said yes to the changes. The confirmation step
 * must not read as complete in that case, so both request lists are checked
 * for a Pending entry. No requests (or an older booking that predates the
 * fields) counts as settled.
 */
function vendorAcceptedEverything(row: RawBookingListItem): boolean {
  const confirmed = row.status === "Confirmed" || row.status === "Completed";
  if (!confirmed) return false;

  const pending = [...(row.changeRequests ?? []), ...(row.customizeRequests ?? [])].some(
    (request) => request.status === "Pending"
  );
  // The vendor's decisions are a proposal the customer still has to accept.
  return !pending && !isProposalAwaitingReview(row);
}

/** The per-vendor rows nested under the confirmation step. */
function journeyVendors(group: RawBookingListItem[]): BookingJourneyVendor[] {
  return group.map((row) => {
    const settled = vendorAcceptedEverything(row);
    const awaitingCustomer = isProposalAwaitingReview(row);
    const declined = row.status === "Declined" || row.status === "Cancelled";
    const reopened = isReopened(row);

    return {
      id: row._id,
      vendorName: vendorNameOf(row) ?? "Vendor",
      packageName: row.packageSnapshot?.name ?? "Package",
      variantLabel: row.packageSnapshot?.variantType ?? undefined,
      image: row.packageSnapshot?.image ?? undefined,
      // A vendor who has answered every request gets the call to action
      // rather than a pill — reviewing that proposal is the one thing the
      // customer can act on here.
      badge: settled
        ? { label: "CONFIRMED", tone: "confirmed" as const }
        : declined
          ? { label: row.status.toUpperCase(), tone: "declined" as const }
          : reopened
            ? { label: "CHANGES REQUESTED", tone: "pending" as const }
            : { label: "PENDING", tone: "pending" as const },
      action: awaitingCustomer
        ? { label: "Review Proposal", href: `/bookings/${row.bookingId}?proposal=1`, proposalFor: row.bookingId }
        : undefined,
    };
  });
}

const IST_OFFSET_MS = 330 * 60 * 1000;

const slotMinutes = (time: string | null | undefined) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(time ?? "").trim());
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

/**
 * When the event ends, as the backend reckons it (models/Booking.js
 * eventEndOf): the end of the booked slot on the event's IST calendar day, a
 * slot ending at or before its start running past midnight, or the end of
 * that day when no slot was booked.
 */
function eventEndMs(eventDate: string, slot: { startTime?: string | null; endTime?: string | null }) {
  const ist = new Date(new Date(eventDate).getTime() + IST_OFFSET_MS);
  const [y, m, d] = [ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()];
  const start = slotMinutes(slot.startTime);
  const end = slotMinutes(slot.endTime);
  const overnight = end != null && start != null && end <= start;
  return Date.UTC(y, m, d + (overnight ? 1 : 0), 0, end ?? 23 * 60 + 59) - IST_OFFSET_MS;
}

/** The confirmation step of an event whose every booking was declined or cancelled. */
function endedTitle(ended: RawBookingListItem[]): string {
  if (ended.every((row) => row.status === "Declined")) return "Booking declined";
  return "Booking cancelled";
}

function endedDescription(ended: RawBookingListItem[]): string {
  if (ended.every((row) => row.status === "Declined")) {
    return ended.length === 1 ? "The vendor declined this booking." : "The vendors declined this booking.";
  }
  if (ended.every((row) => row.cancelledBy === "Customer")) return "You cancelled this booking.";
  if (ended.every((row) => row.cancelledBy === "Vendor")) return "The vendor cancelled this booking.";
  return "This booking was cancelled.";
}

/**
 * Builds the journey down the left of the page across the design's four
 * states: booking started, vendor confirmation, event-ready/payments, and
 * completion.
 *
 * The only status timestamps the model keeps are createdAt, confirmedAt and
 * the event date, so a step carries a date only where one really exists.
 */
function buildJourney(
  reference: string,
  group: RawBookingListItem[],
  bookedOn: string,
  eventDate: string,
  confirmedAt: string | null,
  slot: { startTime?: string | null; endTime?: string | null } = {}
): BookingJourneyStep[] {
  const total = group.length;
  const settled = group.filter(vendorAcceptedEverything).length;
  const tokenPaid = group.reduce((sum, row) => sum + (row.totalReceived || 0), 0);
  const amountDue = group.reduce((sum, row) => sum + (row.amountDue || 0), 0);

  // "Accepted everything", not merely "status is Confirmed".
  const allSettled = total > 0 && settled === total;
  // Over once the booked slot has ended, not at the start of the event date —
  // otherwise the whole event day already read "Event completed".
  const eventPassed = eventEndMs(eventDate, slot) < Date.now();
  const allCompleted = total > 0 && group.every((row) => row.status === "Completed");

  // Decisions across every vendor's requests, for the settled step's copy —
  // "all accepted" only when nothing was rejected.
  const decisions = group.flatMap((row) => [...(row.customizeRequests ?? []), ...(row.changeRequests ?? [])]);
  const rejectedCount = decisions.filter((request) => request.status === "Rejected").length;
  const acceptedCount = decisions.length - rejectedCount;
  const awaitingReviewCount = group.filter(isProposalAwaitingReview).length;
  const reopenedCount = group.filter((row) => isReopened(row) && !isProposalAwaitingReview(row)).length;
  const ended = group.filter((row) => row.status === "Declined" || row.status === "Cancelled");

  const settledTitle =
    decisions.length === 0
      ? "Event locked in"
      : rejectedCount === 0
        ? "Event locked in, All requests accepted"
        : "Event locked in, All requests answered";
  const settledDescription =
    decisions.length === 0
      ? "Every vendor has confirmed your booking."
      : rejectedCount === 0
        ? "All the requests made to the vendor were accepted."
        : `${acceptedCount} accepted, ${rejectedCount} rejected.`;

  // Whose turn it is, most urgent first: a proposal waiting on the customer
  // beats anything still with a vendor.
  const inFlightDescription =
    ended.length === total
      ? endedDescription(ended)
      : awaitingReviewCount > 0
        ? `${settled} of ${total} confirmed. Your vendor has responded to your requests — review the proposal and accept it.`
        : reopenedCount > 0
          ? `${settled} of ${total} confirmed. You asked for changes after confirmation, so we're waiting for the vendor's updated proposal. Your date stays held.`
          : `${settled} of ${total} confirmed. Waiting on the rest to accept every request.`;

  const steps: Omit<BookingJourneyStep, "state">[] = [
    {
      id: "started",
      title: "Booking started",
      // Everything received so far — the checkout token plus any milestones.
      description: tokenPaid
        ? `${formatAmount(tokenPaid)} paid. Your event is underway.`
        : "Your event is underway.",
      date: bookedOn,
    },
    {
      id: "confirmed",
      // Titled by progress while in flight, by outcome once every request
      // has been accepted — as the design does.
      title: allSettled
        ? settledTitle
        : ended.length === total
          ? endedTitle(ended)
          : `${settled} of ${total} ${total === 1 ? "Vendor" : "Vendors"} confirmed`,
      date: allSettled && confirmedAt ? confirmedAt : undefined,
      description: allSettled ? settledDescription : inFlightDescription,
      // Expanded per-vendor list, as in the vendor-confirmation state.
      vendors: allSettled ? undefined : journeyVendors(group),
    },
    {
      id: "payments",
      title: "Payments & schedule",
      description: allSettled
        ? "Your payment timeline is live."
        : "Payment timeline will be decided once every request is accepted.",
      action:
        allSettled && amountDue > 0 ? { label: "Pay now", href: "#payment-timeline" } : undefined,
    },
    {
      id: "ready",
      title: "Getting event-ready",
      description: "Each vendor is preparing. Tastings, trials and final coordination.",
    },
    {
      id: "event-day",
      title: "Event day",
      description: "Your celebration.",
      date: eventDate,
    },
  ];

  if (allCompleted || (eventPassed && allSettled)) {
    steps.push({
      id: "completed",
      title: "Event completed",
      description: "Your event completed successfully.",
      action: { label: "Leave a review", href: `/bookings/${reference}/review` },
    });
  }

  // Each stage gates the next: nothing past confirmation can be "done"
  // until every vendor has accepted everything.
  let doneCount = 1;
  if (allSettled) doneCount += 2; // confirmation + payments unlock together
  if (allSettled && eventPassed) doneCount += 2; // event-ready + event day
  if (allCompleted) doneCount = steps.length;

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
    const reopened = isReopened(row);
    const status = reopened ? { label: "CHANGES REQUESTED", tone: "pending" as const } : STATUS_LABEL[row.status];
    return {
      id: row._id,
      reference: row.bookingId,
      name: row.packageSnapshot?.name ?? "Package",
      variantLabel: row.packageSnapshot?.variantType,
      vendorName: vendorNameOf(row),
      image: row.packageSnapshot?.image,
      packageId: row.packageId,
      vendorType: row.packageSnapshot?.vendorType,
      statusLabel: status.label,
      statusTone: status.tone,
      reopened,
    };
  });

  return {
    reference: booking.bookingId,
    bookingObjectId: booking._id,
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
    proposalsAwaitingReview: group.filter(isProposalAwaitingReview).map((row) => row.bookingId),
    reopenedReferences: group.filter(isReopened).map((row) => row.bookingId),
    journey: buildJourney(booking.bookingId, group, bookedOn, booking.eventDate, booking.confirmedAt, {
      startTime: booking.startTime,
      endTime: booking.endTime,
    }),
    paymentTimeline: detail.paymentTimeline,
    cancellationPolicy: {
      ...policyOf(detail.cancellationPolicy?.cancellationPolicy ?? null),
      note: detail.cancellationPolicy?.note ?? "",
    },
  };
}
