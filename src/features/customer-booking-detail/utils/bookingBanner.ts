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
  };
}

/**
 * Picks the banner for a booking, following the component set's five states
 * (node 1644:10229). Only one shows at a time, most urgent first: a finished
 * event, then money due, then vendors still to answer.
 *
 * "proposal" is defined in the component but never produced here: a proposal
 * is an Enquiry-side concept in the backend, with nothing on Booking to read
 * it from. Same story for a distinct "additional requests" record — the
 * requests-open copy is driven by packages still awaiting a vendor instead,
 * which is what the booking data actually knows.
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
      action: {
        label: "Leave a review",
        style: "primary",
        // The API only exposes review READS (per package / per vendor) — there
        // is no customer review-writing endpoint to post this to yet.
        disabledReason: "Writing a review isn't available yet",
      },
    };
  }

  const dueIndex = view.paymentTimeline.findIndex((milestone) => milestone.status === "PaymentDue");
  if (dueIndex >= 0) {
    const milestone = view.paymentTimeline[dueIndex];
    const remainingAfter = Math.max(0, view.remaining - milestone.amount);
    return {
      variant: "advance-due",
      title: `Advance ${dueIndex + 1} of ${view.paymentTimeline.length} is due`,
      description: `Pay ${formatAmount(milestone.amount)} to stay on track. ${formatAmount(remainingAfter)} remaining after this.`,
      action: { label: `Pay advance ${dueIndex + 1}`, style: "primary", milestoneId: milestone._id },
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
