import { getBookingDetail, type RawBooking } from "@/lib/customerBookingApi";
import { formatPrice } from "@/features/customer-cart/utils/currency";
import type { BookedServiceItem, BookedServiceStatus } from "../components/BookingSummaryCard";
import type { VendorNextPayment } from "../components/YourPaymentsCard";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";

// Same slug/icon photography already used across the checkout flow (see
// customer-booking/services/getBookingSummaryData.ts's CATEGORY_ICON_BY_TYPE)
// — kept local since it's a small, self-contained lookup, same pattern as
// customer-cart/utils/categoryMeta.ts.
const CATEGORY_ICON_BY_TYPE: Record<string, string> = {
  Decorator: "/images/customer/decorator.png",
  Caterer: "/images/customer/caterers.png",
  VenueProvider: "/images/customer/venue.png",
  DJArtist: "/images/customer/dj.png",
  MakeupArtist: "/images/customer/makeup.png",
  PAV: "/images/customer/video.png",
};

const CATEGORY_LABEL_BY_TYPE: Record<string, string> = {
  Decorator: "Decorator",
  Caterer: "Caterer",
  VenueProvider: "Venue Provider",
  DJArtist: "DJ Artist",
  MakeupArtist: "Makeup Artist",
  PAV: "Photographer",
};

export interface BookingSuccessData {
  customerFirstName: string;
  whatsappNumber: string;
  eventDateLabel: string;
  bookingIdLabel: string;
  services: BookedServiceItem[];
  totalCost: string;
  paidToday: string;
  stillToPay: string;
  nextPayments: VendorNextPayment[];
  changeDeadlineLabel: string;
}

function vendorNameOf(booking: RawBooking): string {
  return typeof booking.vendorId === "object" ? booking.vendorId.businessName || "Vendor" : "Vendor";
}

// Right after confirmCheckoutSessionOffline, every booking is freshly
// created as "NewBooking" — but this also has to render sensibly for
// whatever status a booking is later found in (dashboard deep-links here
// too eventually), so every real Booking.status value maps to one of the
// three badges this page actually has art for.
function statusOf(booking: RawBooking): BookedServiceStatus {
  if (booking.status === "Confirmed" || booking.status === "Completed") return "confirmed";
  if (booking.status === "Declined" || booking.status === "Cancelled") return "declined";
  return "pending";
}

function formatEventDate(iso: string, options: Intl.DateTimeFormatOptions): string {
  const parsed = new Date(iso);
  if (isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-GB", { ...options, timeZone: "UTC" });
}

function mapService(booking: RawBooking): BookedServiceItem {
  const vendorType = booking.packageSnapshot?.vendorType ?? "";
  const guestLabel =
    booking.guestRange?.min || booking.guestRange?.max
      ? `${booking.guestRange.min ?? booking.guestRange.max} guests`
      : "";

  return {
    id: booking._id,
    categoryLabel: CATEGORY_LABEL_BY_TYPE[vendorType] ?? vendorType ?? "Package",
    categoryIcon: CATEGORY_ICON_BY_TYPE[vendorType] ?? FALLBACK_IMAGE,
    image: booking.packageSnapshot?.image || FALLBACK_IMAGE,
    title: booking.packageSnapshot?.name ?? "Package",
    tier: booking.packageSnapshot?.variantType ?? "",
    date: formatEventDate(booking.eventDate, { day: "numeric", month: "long", year: "numeric" }),
    time: "", // Booking.startTime/endTime aren't set by bookingCreationService.js today — nothing real to show.
    location: booking.location ?? "Location to be confirmed",
    eventType: booking.eventType ?? guestLabel ?? "—",
    status: statusOf(booking),
  };
}

function mapNextPayments(bookings: RawBooking[]): VendorNextPayment[] {
  const payments: VendorNextPayment[] = [];
  for (const booking of bookings) {
    const vendorName = vendorNameOf(booking);
    for (const milestone of booking.paymentMilestones) {
      if (milestone.status === "Received") continue;
      payments.push({
        id: `${booking._id}-${milestone._id}`,
        vendorName,
        status: "due",
        dueLabel: milestone.dueDate ? `Due ${formatEventDate(milestone.dueDate, { day: "numeric", month: "short" })}` : "Due date to be confirmed",
        amount: formatPrice(milestone.amount),
      });
    }
  }
  return payments;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

/**
 * Data source for the Booking Success page — fetches the real Booking(s)
 * created by confirmCheckoutSessionOffline (customer-contact/ContactPage.tsx)
 * via GET /customer/bookings/:bookingId. One Booking per checkout line/vendor
 * (see customerBookingController.js's own documented limitation: no
 * order-level id groups them), so bookingIdLabel just names the first plus a
 * count when there's more than one.
 */
export async function getBookingSuccessData(bookingIds: string[]): Promise<BookingSuccessData> {
  const responses = await Promise.all(bookingIds.map((id) => getBookingDetail(id)));
  const bookings = responses.map((r) => r.booking);

  const first = bookings[0];
  const totalCost = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const paidToday = bookings.reduce((sum, b) => sum + (b.totalReceived || 0), 0);

  return {
    customerFirstName: first ? firstName(first.customer.name) : "there",
    whatsappNumber: first?.customer.phone ?? "",
    eventDateLabel: first ? formatEventDate(first.eventDate, { day: "numeric", month: "long" }) : "",
    bookingIdLabel:
      bookings.length > 1 ? `${first?.bookingId ?? ""} (+${bookings.length - 1} more)` : first?.bookingId ?? "",
    services: bookings.map(mapService),
    totalCost: formatPrice(totalCost),
    paidToday: formatPrice(paidToday),
    stillToPay: formatPrice(Math.max(0, totalCost - paidToday)),
    nextPayments: mapNextPayments(bookings),
    changeDeadlineLabel: first
      ? new Date(new Date(first.createdAt).getTime() + 24 * 60 * 60 * 1000).toLocaleString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          day: "numeric",
          month: "short",
        })
      : "",
  };
}
