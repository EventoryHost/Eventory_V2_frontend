import { ApiError } from "@/lib/apiClient";
import {
  createCheckoutSession,
  getCheckoutSession,
  type RawCheckoutSessionAvailabilityEntry,
  type RawCheckoutSessionLine,
  type RawCheckoutSessionResponse,
} from "@/lib/customerCheckoutApi";
import { clearCheckoutSessionId, getCheckoutSessionId, setCheckoutSessionId } from "@/lib/checkoutSession";
import { getVendorPublic, type RawVendorPublicMinimal } from "@/lib/vendorPublicApi";
import type { RawCartQuoteLine } from "@/lib/customerCartApi";
import { formatPrice } from "@/features/customer-cart/utils/currency";
import { formatShortDate, getCancellationTiers } from "@/features/customer-package-detail/utils/cancellationPolicy";
import type {
  BookingLineRow,
  BookingServiceItem,
  BookingSummaryData,
  BookingVendorGroup,
} from "../types";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";

// Same slug/icon photography already used for the Package Detail page (see
// customer-package-detail/services/getPackageDetail.ts's CATEGORY_ICON_BY_SLUG)
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

function formatEventDate(value: string | null): string {
  if (!value) return "Date to be confirmed";
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

// The cart's `specialRequest` is free text, but customer-cart's add-to-cart
// flow prefixes it with "Event type: X" when an occasion was picked (see
// CartVendor's doc comment in customer-cart/types.ts) — pull that back out
// for the Tag row rather than dumping the whole note there.
function deriveEventType(specialRequest: string): string | undefined {
  const match = specialRequest.match(/event type:\s*([^.,;\n]+)/i);
  return match?.[1]?.trim() || undefined;
}

function mapLine(
  line: RawCheckoutSessionLine,
  vendorName: string | undefined,
  availabilityEntry: RawCheckoutSessionAvailabilityEntry | undefined,
  quoteLine: RawCartQuoteLine | undefined
): BookingServiceItem {
  const vendorType = line.packageSnapshot.vendorType ?? "";
  const stillAvailable = availabilityEntry?.packageStillAvailable ?? true;
  // availability.overall is the fine-grained date/time/capacity check —
  // distinct from packageStillAvailable (does the package still exist at
  // all). A line can be perfectly "still available" and yet fail this,
  // e.g. no event date was set when the package was added to cart.
  const isBookable = stillAvailable && availabilityEntry?.availability?.overall !== false;
  return {
    lineId: line._id,
    packageId: line.packageId,
    vendorId: line.vendorId,
    image: line.packageSnapshot.image || FALLBACK_IMAGE,
    categoryLabel: CATEGORY_LABEL_BY_TYPE[vendorType] ?? vendorType ?? "Package",
    categoryIcon: CATEGORY_ICON_BY_TYPE[vendorType] ?? FALLBACK_IMAGE,
    vendorName: vendorName ?? vendorType ?? "Vendor",
    serviceName: line.packageSnapshot.name ?? "Package",
    packageTier: line.packageSnapshot.variantType ?? "",
    date: formatEventDate(line.eventDetails.date),
    time: line.eventDetails.timeSlot ?? "Time to be confirmed",
    location: line.eventDetails.location ?? "Location to be confirmed",
    eventType: deriveEventType(line.specialRequest),
    cancellationNote: !stillAvailable
      ? "This package is no longer available — contact support before paying."
      : !isBookable
        ? "This booking can't be confirmed with the current date, time or guest count — edit your event details to continue."
        : "Cancellation terms apply — see full policy for exact dates.",
    price: formatPrice(line.packageSnapshot.price ?? quoteLine?.currentPrice ?? 0),
    packageStillAvailable: stillAvailable,
    isBookable,
    priceChanged: quoteLine?.priceChanged ?? false,
    addons: line.selectedAddOns.map((addon, i) => ({
      id: addon.addOnId ?? `${line._id}-addon-${i}`,
      name: addon.name,
      quantity: addon.quantity,
      price: formatPrice(addon.price),
      amount: addon.price,
    })),
    note: line.specialRequest,
  };
}

// The free-cancellation cutoff shown in the payment summary uses the same
// platform-wide 14-days-before-event window as Package Detail's
// StickyBookingCard (see cancellationPolicy.ts) — picks the earliest event
// date across all lines since that's the one the promise has to hold for.
function earliestFullRefundCutoff(lines: RawCheckoutSessionLine[]): Date | null {
  const eventDateIsos = lines
    .map((line) => line.eventDetails.date)
    .filter((date): date is string => date != null && !isNaN(new Date(date).getTime()));
  if (!eventDateIsos.length) return null;
  const earliestIso = eventDateIsos.reduce((earliest, current) =>
    new Date(current).getTime() < new Date(earliest).getTime() ? current : earliest
  );
  return getCancellationTiers(earliestIso)?.fullRefundCutoff ?? null;
}

async function resolveVendors(vendorIds: string[]): Promise<Map<string, RawVendorPublicMinimal>> {
  const unique = [...new Set(vendorIds)];
  const map = new Map<string, RawVendorPublicMinimal>();
  await Promise.all(
    unique.map(async (id) => {
      try {
        const { vendor } = await getVendorPublic(id);
        map.set(id, vendor);
      } catch {
        // Best-effort — the group falls back to the package's own vendorType label.
      }
    })
  );
  return map;
}

function emptyBookingSummaryData(): BookingSummaryData {
  return {
    sessionId: "",
    canContinue: false,
    readyForPayment: false,
    contact: { name: "", phone: "", email: "", phoneVerified: false, errors: [] },
    vendorGroups: [],
    lineErrors: [],
    paymentSummary: {
      vendorCount: 0,
      packageCount: 0,
      rows: [],
      grandTotal: formatPrice(0),
      tokenAmount: formatPrice(0),
      payInFull: true,
      isFreeCheckout: false,
      cancellationNote: "Free cancellation may apply — check each package's policy for exact dates.",
    },
  };
}

/**
 * Loads the checkout session backing the Review/Details/Payment steps —
 * re-fetches a stored sessionId (see lib/checkoutSession.ts), or creates a
 * fresh price-locked one from the cart's selected items if none is stored,
 * the stored one no longer belongs to this customer, or it's no longer
 * Active (Expired/Cancelled/Completed). Returns null when the cart has
 * nothing selected to check out (matches the empty-state UI).
 */
async function loadSession(): Promise<RawCheckoutSessionResponse | null> {
  const storedId = getCheckoutSessionId();
  if (storedId) {
    try {
      const existing = await getCheckoutSession(storedId);
      if (existing.session.status === "Active") return existing;
    } catch {
      // Stale/invalid/foreign sessionId — fall through and create a new one.
    }
    clearCheckoutSessionId();
  }

  try {
    const created = await createCheckoutSession({ source: "cart" });
    setCheckoutSessionId(created.session._id);
    return created;
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) return null;
    throw err;
  }
}

/**
 * Data source shared by the Review, Details and Payment steps of checkout —
 * calls the real checkout-session endpoints (Eventory_V2_backend, see
 * book-api.pdf). Client-side only: checkout session identity only exists in
 * the browser (see lib/checkoutSession.ts).
 */
export async function getBookingSummaryData(): Promise<BookingSummaryData> {
  const sessionResponse = await loadSession();
  if (!sessionResponse) return emptyBookingSummaryData();

  const { session, availability, validation, readyForPayment } = sessionResponse;
  const quote = session.lockedQuote;

  const vendorIds = [...new Set(session.lines.map((line) => line.vendorId))];
  const vendorMap = await resolveVendors(vendorIds);
  const availabilityByLineId = new Map(availability.map((entry) => [entry.lineId, entry]));
  const quoteLineByLineId = new Map((quote?.lines ?? []).map((line) => [line.cartItemId, line]));

  const linesByVendor = new Map<string, RawCheckoutSessionLine[]>();
  for (const line of session.lines) {
    const list = linesByVendor.get(line.vendorId) ?? [];
    list.push(line);
    linesByVendor.set(line.vendorId, list);
  }

  const lineById = new Map(session.lines.map((line) => [line._id, line]));
  const lineErrors = validation.lines.perLine
    .filter((entry) => !entry.valid)
    .map((entry) => {
      const serviceName = lineById.get(entry.lineId)?.packageSnapshot.name ?? "A package";
      return `${serviceName}: ${entry.errors.join(", ")} — fix it from Cart's "Edit" on that item.`;
    });

  const vendorGroups: BookingVendorGroup[] = vendorIds.map((vendorId) => {
    const lines = linesByVendor.get(vendorId) ?? [];
    const vendorInfo = vendorMap.get(vendorId);
    const vendorName = vendorInfo?.businessName ?? lines[0]?.packageSnapshot.vendorType ?? "Vendor";
    const subtotal = lines.reduce((sum, line) => {
      const quoteLine = quoteLineByLineId.get(line._id);
      return sum + (quoteLine?.lineTotalInclGst ?? quoteLine?.lineSubtotal ?? 0);
    }, 0);

    return {
      vendorId,
      avatar: vendorInfo?.profilePicture,
      avatarInitial: vendorName[0]?.toUpperCase() ?? "V",
      vendorName,
      rating: vendorInfo?.rating ?? 0,
      reviewCount: vendorInfo?.reviewsCount ?? 0,
      // bookingsPerYear is a coarse self-reported figure vendors fill in at
      // onboarding — same fallback chain as getPackageDetail.ts's mapVendor.
      eventsOnEventory: Number(vendorInfo?.bookingsPerYear) || vendorInfo?.reviewsCount || 0,
      packageCount: lines.length,
      subtotal: formatPrice(subtotal),
      services: lines.map((line) =>
        mapLine(line, vendorInfo?.businessName, availabilityByLineId.get(line._id), quoteLineByLineId.get(line._id))
      ),
    };
  });

  const itemCount = session.lines.length;
  const payInFull = !quote || !quote.allTokensConfigured || quote.tokenAmountTotal == null;
  const fullRefundCutoff = earliestFullRefundCutoff(session.lines);

  const rows: BookingLineRow[] = [];
  if (quote) {
    rows.push({ label: "Total booking amount", value: formatPrice(quote.subtotal) });
    if (quote.convenienceFeeConfigured) {
      rows.push({ label: "Service & security fee", value: formatPrice(quote.convenienceFee) });
    }
    if (quote.discount) {
      rows.push({ label: "Discount", value: `-${formatPrice(quote.discount)}` });
    }
    const gstPercent = quote.lines.find((line) => line.gstRatePercent)?.gstRatePercent;
    if (quote.gstTotal) {
      rows.push({ label: `GST${gstPercent ? ` (${gstPercent}%)` : ""}`, value: formatPrice(quote.gstTotal) });
    }
  }

  return {
    sessionId: session._id,
    canContinue: validation.canContinue,
    readyForPayment,
    contact: {
      name: session.contactDetails.name ?? "",
      phone: session.contactDetails.phone ?? "",
      email: session.contactDetails.email ?? "",
      phoneVerified: validation.contact.phoneVerified,
      errors: validation.contact.errors ?? [],
    },
    vendorGroups,
    lineErrors,
    paymentSummary: {
      vendorCount: vendorGroups.length,
      packageCount: itemCount,
      rows,
      grandTotal: formatPrice(quote?.grandTotal ?? 0),
      tokenAmount: formatPrice(payInFull ? (quote?.grandTotal ?? 0) : (quote?.tokenAmountTotal ?? 0)),
      payInFull,
      isFreeCheckout: quote?.tokenAmountTotal === 0,
      // When one or more vendors have no token configured, quote.note is
      // backend-internal explanatory text (why tokenAmountTotal/remainingTotal
      // were withheld) — not customer-facing copy, so it's swapped for the
      // generic trust line instead. Otherwise quote.note (or the generic
      // fallback) is shown as before.
      cancellationNote: payInFull
        ? fullRefundCutoff
          ? `Free cancellation until ${formatShortDate(fullRefundCutoff)}. Held safely by Eventory until your event.`
          : "Free cancellation may apply — check each package's policy for exact dates."
        : quote?.note || "Free cancellation may apply — check each package's policy for exact dates.",
    },
  };
}
