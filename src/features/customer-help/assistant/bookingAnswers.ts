import { formatPrice } from "@/features/customer-package-detail/utils/formatPrice";
import type { HelpBookingContext } from "../helpContext";
import type { BookingHelpData } from "../hooks/useBookingHelpData";

// Booking help (v6f9 "Help with your booking"): answers from the event's own
// bookings — what's owed, deadlines, customisation, arrival — and which
// questions go to the Event Manager instead. Nothing here is invented: where
// the data doesn't hold an answer (setup times), the Event Manager confirms.

/** What the assistant does with a booking question. */
export type BookingReply = {
  text: string;
  /** A request card for the Event Manager follows the answer. */
  request?: BookingRequestKind;
  /** Buttons under the answer. */
  actions?: BookingAction[];
  /** Done / Ask the Event Manager underneath. */
  feedback?: boolean;
};

export type BookingAction = "cancel" | "payments" | "pay-taken" | "pay-not";
export type BookingRequestKind =
  | "message"
  | "vendor"
  | "payment-issue"
  | "payment-link"
  | "invoice"
  /** Event day: sent to the vendor's app as a day request and to the Event Manager. */
  | "lmc-addon"
  | "lmc-area";

export const emFirst = (emName: string | null) => (emName ? emName.split(/\s+/)[0] : null);
/** "Priya" or "the Event Manager team". */
export const emLabel = (emName: string | null) => emFirst(emName) ?? "the Event Manager team";
/** "Priya Sharma" or "the Event Manager team", for sentences. */
export const emFull = (emName: string | null) => emName ?? "the Event Manager team";

const joinList = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export const dayText = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";

/** Still owed, and when the next payment is due. */
export function duesText(data: BookingHelpData) {
  if (data.remaining <= 0) return "You’ve paid everything for this event. Nothing more is due.";
  const next = data.packages.find((p) => p.nextDue)?.nextDue;
  return `You still owe ${formatPrice(data.remaining)} across your packages.${
    next ? ` The next payment, ${formatPrice(next.amount)}, is due ${next.dueDate ? `by ${dayText(next.dueDate)}` : "soon"}.` : ""
  } Pay from your booking page; Eventory holds the money until setup is complete.`;
}

/** Event time + who confirms setup (no setup time is stored). */
export function arrivalText(ctx: HelpBookingContext, data: BookingHelpData) {
  const when = [dayText(ctx.eventDate), ctx.startTime && `at ${ctx.startTime}`].filter(Boolean).join(" ");
  return `Your event starts ${when}. Vendors arrive before that to set up, and ${emFull(data.emName)} confirms each vendor’s setup time with you closer to the day. You’ll see them check in here on the day.`;
}

/** Per package: the items booked with it. */
export function includedText(data: BookingHelpData) {
  const lines = data.packages
    .filter((p) => !p.cancelled)
    .map((p) => {
      const items = ((p.booking as unknown as { selectedItems?: { itemName?: string }[] }).selectedItems ?? [])
        .map((i) => i.itemName)
        .filter((n): n is string => Boolean(n));
      return `${p.vendorName ?? p.name}: ${items.length ? joinList(items) : `${p.name}, as listed on the package`}.`;
    });
  return lines.join(" ");
}

/** One line per package: where its customisation stands. */
export function customisationText(ctx: HelpBookingContext, data: BookingHelpData) {
  return data.packages
    .filter((p) => !p.cancelled)
    .map((p) => {
      const waiting = ctx.proposalsAwaitingReview.includes(p.reference);
      const requests = p.booking.customizeRequests ?? [];
      const state = waiting
        ? "a revised proposal is waiting for you to review"
        : !requests.length
          ? "no changes requested"
          : requests.some((r) => r.status === "Pending" || !r.status)
            ? "with the vendor"
            : p.booking.proposalResponse?.status === "Accepted"
              ? "confirmed"
              : "the vendor has answered";
      return `${p.vendorName ?? p.name}: ${state}.`;
    })
    .join(" ");
}

/** The ask box on a booking page. */
export function answerBookingQuestion(text: string, ctx: HelpBookingContext, data: BookingHelpData): BookingReply {
  const s = text.toLowerCase();
  const em = emLabel(data.emName);
  if (/\bcancel/.test(s))
    return {
      text: "You can cancel packages yourself, and nobody else needs to approve it. You’ll see what comes back before anything is cancelled.",
      actions: ["cancel"],
    };
  if (/\b(owe|due|balance|pay|payment|remaining)\b/.test(s)) return { text: duesText(data), actions: ["payments"], feedback: true };
  if (/\b(invoice|gst|receipt|bill)\b/.test(s))
    return {
      text: `Your invoices are under Payments and invoices, one per package once you’ve paid for it. To add a GSTIN or change the billing name, ask ${em}.`,
      request: "invoice",
    };
  if (/\b(arriv|reach|come|setup|set up|timing|what time)\b/.test(s)) return { text: arrivalText(ctx, data), feedback: true };
  if (/\b(includ|items|what do i get)\b/.test(s)) return { text: includedText(data), feedback: true };
  if (/\b(customi|proposal|colour|color|changes?)\b/.test(s)) return { text: customisationText(ctx, data), feedback: true };
  return {
    text: `I can answer from your booking: payments, invoices, deadlines and customisation status. If ${em} or a vendor has to act, I’ll pass it to them.`,
    feedback: true,
  };
}

/** The "A vendor or package question" and payment rows that open a thread. */
export function bookingTopicReply(kind: BookingRequestKind | "arrive" | "included" | "pay-issue", ctx: HelpBookingContext, data: BookingHelpData): BookingReply {
  const em = emLabel(data.emName);
  const vendors = joinList(data.packages.filter((p) => !p.cancelled).map((p) => p.vendorName ?? p.name));
  switch (kind) {
    case "arrive":
      return { text: arrivalText(ctx, data), feedback: true };
    case "included":
      return { text: includedText(data), feedback: true };
    case "vendor":
      return { text: `What would you like to ask ${vendors}? ${em} asks them and replies here.`, request: "vendor" };
    case "message":
      return { text: `Tell ${em} what you need, and they’ll take it from here.`, request: "message" };
    case "pay-issue":
      return { text: "Sorry about that. Was any money taken from your account?", actions: ["pay-taken", "pay-not"] };
    case "payment-issue":
      return {
        text: `It usually shows up within 30 minutes, and if it doesn’t, it’s refunded automatically. I’m passing this to ${em} now so they can check it with our payments team.`,
        request: "payment-issue",
      };
    case "payment-link":
      return {
        text: `${em} can send you a payment link to share with whoever’s paying. Their payment shows on your booking.`,
        request: "payment-link",
      };
    case "invoice":
      return { text: `I’ll pass this to ${em}. They send the updated invoice to your email.`, request: "invoice" };
    case "lmc-addon":
      return {
        text: `Last-minute add-ons depend on the vendor’s crew and stock today. It goes to the vendor straight away, and ${em} confirms the price with you before anything is added.`,
        request: "lmc-addon",
      };
    case "lmc-area":
      return {
        text: `It goes to the vendor straight away, and ${em} checks they can decorate another area today and confirms the price first.`,
        request: "lmc-area",
      };
  }
}

/** Ticket topic per request card. */
export const REQUEST_TOPIC: Record<BookingRequestKind, string> = {
  message: "Message to the Event Manager",
  vendor: "Question for a vendor",
  "payment-issue": "Payment issue · money deducted",
  "payment-link": "Payment link for someone else",
  invoice: "Update invoice details",
  "lmc-addon": "Last-minute add-on",
  "lmc-area": "Decorate another area",
};
