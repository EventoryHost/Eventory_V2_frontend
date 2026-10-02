import type { BookingDetailView } from "../types";

export type MockBookingPhase = "booked" | "event_day" | "post_event";

function isoDaysFromNow(days: number) {
  const date = new Date();
  date.setHours(13, 30, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * Static booking for /bookings/demo — lets the Booking Details page (and its
 * Help & Support entries) render without the authenticated booking API.
 * The event date moves with the phase so the support panel's before / on
 * the day / after behaviour can be previewed.
 */
export function buildMockBookingDetail(phase: MockBookingPhase): BookingDetailView {
  const eventDate = isoDaysFromNow(phase === "booked" ? 21 : phase === "event_day" ? 0 : -2);
  const done = phase === "post_event";
  const tone = done ? "completed" : "confirmed";
  const label = done ? "COMPLETED" : "CONFIRMED";

  return {
    reference: "BK-12347890",
    eventTitle: "Birthday Celebration",
    eventDate,
    startTime: "01:30 PM",
    endTime: "07:30 PM",
    guestsLabel: "200 guests",
    location: "Indiranagar, Bangalore",
    bookedOn: isoDaysFromNow(-30),
    orderTotal: 123000,
    tokenPaid: 12000,
    remaining: 111000,
    packages: [
      {
        id: "pkg-1",
        reference: "BK-12347890",
        name: "Studio Lens & Lighting · Premium",
        vendorName: "Creative Clicks",
        vendorType: "Photographer",
        statusLabel: phase === "booked" ? "PENDING" : label,
        statusTone: phase === "booked" ? "pending" : tone,
      },
      {
        id: "pkg-2",
        reference: "BK-12347891",
        name: "Pastel Balloon Décor · Deluxe",
        vendorName: "Bloom & Co.",
        vendorType: "Decorator",
        statusLabel: label,
        statusTone: tone,
      },
      {
        id: "pkg-3",
        reference: "BK-12347892",
        name: "Party DJ · 4 hrs",
        vendorName: "DJ Arjun",
        vendorType: "DJ",
        statusLabel: label,
        statusTone: tone,
      },
    ],
    respondedCount: phase === "booked" ? 2 : 3,
    journey: [
      { id: "placed", title: "Booking placed", description: "Token paid and your date is held.", date: isoDaysFromNow(-30), state: "done" },
      {
        id: "confirm",
        title: "Vendors confirming",
        description: phase === "booked" ? "2 of 3 vendors have confirmed." : "All vendors confirmed.",
        state: phase === "booked" ? "current" : "done",
      },
      {
        id: "event",
        title: "Event day",
        description: "Your Event Manager coordinates every vendor on the day.",
        date: eventDate,
        state: phase === "event_day" ? "current" : done ? "done" : "upcoming",
      },
      {
        id: "review",
        title: "Rate your experience",
        description: "Tell us how it went.",
        state: done ? "current" : "upcoming",
      },
    ],
    paymentTimeline: [
      { _id: "m1", title: "Token", percentage: null, amount: 12000, dueDate: null, status: "Received", receivedDate: isoDaysFromNow(-30) },
      { _id: "m2", title: "Advance 1", percentage: 50, amount: 55500, dueDate: isoDaysFromNow(-5), status: done || phase === "event_day" ? "Received" : "PaymentDue", receivedDate: null },
      { _id: "m3", title: "Final payment", percentage: 50, amount: 55500, dueDate: eventDate, status: done ? "Received" : "Pending", receivedDate: null },
    ],
    cancellationPolicy: {
      title: "Standard cancellation",
      text: "Free cancellation until 14 days before the event, 50% refund until 7 days before, no refund after that.",
      note: "Policies can differ per vendor — each package shows its exact terms.",
    },
  };
}
