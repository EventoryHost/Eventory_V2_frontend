import { formatAmount } from "@/features/customer-account/utils/groupBookings";
import type { BookingDetailView } from "../types";

export interface BookingBanner {
  variant: "confirming" | "advance-due" | "proposal" | "requests-open" | "complete";
  title: string;
  description: string;
  action: {
    label: string;
    style: "primary" | "secondary";
    /** Set when the CTA has nothing to call yet — rendered inert with this as its tooltip. */
    disabledReason?: string;
    /** The milestone to charge, on the advance-due banner. */
    milestoneId?: string;
    /** Navigates instead of calling onAction — the "Leave a review" CTA. */
    href?: string;
    /** The booking whose Review Proposal panel the "proposal" banner opens. */
    bookingReference?: string;
    /** The booking whose package panel a "View" CTA opens, when it's about one booking. */
    packageReference?: string;
  };
}

/**
 * Picks the banner for a booking, following the component set's five states
 * (node 1644:10229). Only one shows at a time, most urgent first: a finished
 * event, then money due, then vendors still to answer.
 *
 * A reopened booking (changes asked for after confirmation) comes next, then
 * money due.
 *
 * "proposal" shows once a vendor has answered every request and the
 * customer hasn't answered back (Booking.proposalResponse — see
 * isProposalAwaitingReview). It outranks money due: the schedule may still
 * move with the proposal. There's no distinct "additional requests" record —
 * the requests-open copy is driven by packages still awaiting a vendor
 * instead, which is what the booking data actually knows.
 */
export function buildBookingBanner(view: BookingDetailView): BookingBanner | null {
  const total = view.packages.length;
  if (total === 0) return null;

  const awaiting = total - view.respondedCount;
  const confirmed = view.packages.filter((row) => row.statusTone === "confirmed").length;
  const completed = view.packages.filter((row) => row.statusTone === "completed").length;

  if (completed === total) {
    return {
      variant: "complete",
      title: "Your event is complete",
      description: "Tell us how it went. Your review helps your vendors and guides the next host.",
      action: { label: "Leave a review", style: "primary", href: `/bookings/${view.reference}/review` },
    };
  }

  const proposals = view.proposalsAwaitingReview;
  if (proposals.length > 0) {
    return {
      variant: "proposal",
      title:
        proposals.length === 1
          ? "Your vendor has responded to your requests"
          : `${proposals.length} vendors have responded to your requests`,
      description: "See what they accepted and the updated price, then accept the proposal or ask for more changes.",
      action: { label: "Review Proposal", style: "primary", bookingReference: proposals[0] },
    };
  }

  // A confirmed booking the customer reopened with new requests: back with
  // the vendor until their updated proposal comes in. Outranks money due for
  // the same reason a proposal does — the price and schedule may move.
  const reopened = view.reopenedReferences;
  if (reopened.length > 0) {
    return {
      variant: "requests-open",
      title:
        reopened.length === 1
          ? "Changes requested after confirmation"
          : `Changes requested on ${reopened.length} confirmed packages`,
      description:
        "Waiting for the vendor to respond with an updated proposal. Your date stays held, and you'll be asked to accept the new proposal.",
      action: { label: "View", style: "secondary", packageReference: reopened.length === 1 ? reopened[0] : undefined },
    };
  }

  const dueIndex = view.paymentTimeline.findIndex((milestone) => milestone.status === "PaymentDue");
  if (dueIndex >= 0) {
    const milestone = view.paymentTimeline[dueIndex];
    const remainingAfter = Math.max(0, view.remaining - milestone.amount);
    return {
      variant: "advance-due",
      // Named by the vendor's own title: the instalment due may be the final
      // payment (e.g. requested on the event day), not an "advance".
      title: `${milestone.title || `Payment ${dueIndex + 1} of ${view.paymentTimeline.length}`} is due`,
      description: `Pay ${formatAmount(milestone.amount)} to stay on track. ${formatAmount(remainingAfter)} remaining after this.`,
      action: { label: `Pay ${formatAmount(milestone.amount)}`, style: "primary", milestoneId: milestone._id },
    };
  }

  if (awaiting > 0) {
    const responded = `${view.respondedCount} of ${total} ${total === 1 ? "vendor has" : "vendors have"} responded. We'll let you know the moment the rest are in.`;

    // Once something is confirmed the booking is underway, and what's left is
    // the outstanding requests — the design's second "View" banner.
    if (confirmed > 0) {
      return {
        variant: "requests-open",
        title: `Booking confirmed. ${awaiting} additional ${awaiting === 1 ? "request" : "requests"} still open`,
        description: responded,
        action: { label: "View", style: "secondary" },
      };
    }

    return {
      variant: "confirming",
      title: "Your booking is being confirmed",
      description: responded,
      action: { label: "View", style: "secondary" },
    };
  }

  return null;
}
