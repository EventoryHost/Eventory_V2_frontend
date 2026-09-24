import type { RawBookingMilestone } from "@/lib/customerBookingApi";

/** A vendor row nested under a journey step (the confirmation and event-ready states). */
export interface BookingJourneyVendor {
  id: string;
  vendorName: string;
  packageName: string;
  variantLabel?: string;
  image?: string;
  timeLabel?: string;
  /** Right-hand slot: a status pill, or a call to action. */
  badge?: { label: string; tone: "pending" | "confirmed" | "declined" };
  action?: { label: string; href: string };
}

/** One step of the event journey down the left of the page (node 1629:6665). */
export interface BookingJourneyStep {
  id: string;
  title: string;
  description: string;
  /** Rendered inside the step, as in the vendor-confirmation state. */
  vendors?: BookingJourneyVendor[];
  /** Right-aligned link on the step row ("Leave a review", "Pay advance 1"). */
  action?: { label: string; href: string };
  /**
   * Only set where the API actually has a timestamp for the step — the
   * booking's creation and the event date. The steps in between change
   * status without the backend recording when, so they show no date rather
   * than an invented one.
   */
  date?: string;
  state: "done" | "current" | "upcoming";
}

/** One package in the "Your Packages" tab — one Booking row, in backend terms. */
export interface BookingPackageRow {
  id: string;
  reference: string;
  name: string;
  variantLabel?: string;
  vendorName?: string;
  image?: string;
  statusLabel: string;
  statusTone: "pending" | "confirmed" | "cancelled" | "completed";
}

export interface BookingDetailView {
  /** Human reference of the booking this page was opened with. */
  reference: string;
  eventTitle: string;
  /** ISO date of the event. */
  eventDate: string;
  startTime?: string;
  endTime?: string;
  guestsLabel?: string;
  location?: string;
  /** ISO — earliest booking in the event group. */
  bookedOn: string;

  orderTotal: number;
  tokenPaid: number;
  remaining: number;

  packages: BookingPackageRow[];
  /** Vendors that have accepted or declined, out of the whole group. */
  respondedCount: number;
  journey: BookingJourneyStep[];
  paymentTimeline: RawBookingMilestone[];
  cancellationPolicy: { title?: string; text?: string; fileUrl?: string; note: string };
}
