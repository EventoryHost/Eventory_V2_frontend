import { getCart, getCartQuote, type RawCartItem } from "@/lib/customerCartApi";
import { getVendorPublic, type RawVendorPublicMinimal } from "@/lib/vendorPublicApi";
import { formatPrice } from "@/features/customer-cart/utils/currency";
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

function mapService(item: RawCartItem, vendorName: string | undefined): BookingServiceItem {
  const vendorType = item.packageSnapshot.vendorType ?? "";
  return {
    cartItemId: item._id,
    packageId: item.packageId,
    vendorId: item.vendorId,
    image: item.packageSnapshot.image || FALLBACK_IMAGE,
    categoryLabel: CATEGORY_LABEL_BY_TYPE[vendorType] ?? vendorType ?? "Package",
    categoryIcon: CATEGORY_ICON_BY_TYPE[vendorType] ?? FALLBACK_IMAGE,
    vendorName: vendorName ?? vendorType ?? "Vendor",
    serviceName: item.packageSnapshot.name ?? "Package",
    packageTier: item.packageSnapshot.variantType ?? "",
    date: formatEventDate(item.eventDetails.date),
    time: item.eventDetails.timeSlot ?? "Time to be confirmed",
    location: item.eventDetails.location ?? "Location to be confirmed",
    eventType: deriveEventType(item.specialRequest),
    cancellationNote: item.packageStillAvailable
      ? "Cancellation terms apply — see full policy for exact dates."
      : "This package is no longer available — contact support before paying.",
    price: formatPrice(item.currentPrice ?? item.packageSnapshot.price ?? 0),
    packageStillAvailable: item.packageStillAvailable,
    priceChanged: item.priceChanged,
    addons: item.selectedAddOns.map((addon, i) => ({
      id: addon.addOnId ?? `${item._id}-addon-${i}`,
      name: addon.name,
      quantity: addon.quantity,
      price: formatPrice(addon.price),
      amount: addon.price,
    })),
    note: item.specialRequest,
  };
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

/**
 * Data source shared by the Review, Details and Payment steps of checkout —
 * calls the real GET /api/customer/cart and GET /api/customer/cart/quote
 * (Eventory_V2_backend), soft-authed the same way the Cart page is. Only
 * items marked `selectedForCheckout` are included, matching what the
 * customer actually chose to check out on the Cart page. Client-side only:
 * cart identity only exists in the browser.
 */
export async function getBookingSummaryData(): Promise<BookingSummaryData> {
  const [cart, quoteResponse] = await Promise.all([getCart(), getCartQuote()]);
  const quote = quoteResponse.quote;

  const vendorMap = await resolveVendors(cart.vendors.map((group) => group.vendorId));

  const vendorGroups: BookingVendorGroup[] = cart.vendors
    .map((group): BookingVendorGroup | null => {
      const selectedItems = group.items.filter((item) => item.selectedForCheckout);
      if (selectedItems.length === 0) return null;

      const vendorInfo = vendorMap.get(group.vendorId);
      const vendorName = vendorInfo?.businessName ?? selectedItems[0].packageSnapshot.vendorType ?? "Vendor";
      const subtotal = selectedItems.reduce((sum, item) => sum + item.lineTotal, 0);

      return {
        vendorId: group.vendorId,
        avatar: vendorInfo?.profilePicture,
        avatarInitial: vendorName[0]?.toUpperCase() ?? "V",
        vendorName,
        rating: vendorInfo?.rating ?? 0,
        reviewCount: vendorInfo?.reviewsCount ?? 0,
        // bookingsPerYear is a coarse self-reported figure vendors fill in at
        // onboarding — same fallback chain as getPackageDetail.ts's mapVendor.
        eventsOnEventory: Number(vendorInfo?.bookingsPerYear) || vendorInfo?.reviewsCount || 0,
        packageCount: selectedItems.length,
        subtotal: formatPrice(subtotal),
        services: selectedItems.map((item) => mapService(item, vendorInfo?.businessName)),
      };
    })
    .filter((group): group is BookingVendorGroup => group !== null);

  const itemCount = vendorGroups.reduce((sum, group) => sum + group.services.length, 0);
  const payInFull = !quote || !quote.allTokensConfigured || quote.tokenAmountTotal == null;

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
    vendorGroups,
    paymentSummary: {
      vendorCount: vendorGroups.length,
      packageCount: itemCount,
      rows,
      grandTotal: formatPrice(quote?.grandTotal ?? 0),
      tokenAmount: formatPrice(payInFull ? (quote?.grandTotal ?? 0) : (quote?.tokenAmountTotal ?? 0)),
      payInFull,
      // When one or more vendors have no token configured, quote.note is
      // backend-internal explanatory text (why tokenAmountTotal/remainingTotal
      // were withheld) — not customer-facing copy, so it's swapped for the
      // generic trust line instead. Otherwise quote.note (or the generic
      // fallback) is shown as before.
      cancellationNote: payInFull
        ? "Free cancellation until 4 Mar 2026. Held safely by Eventory until your event."
        : quote?.note || "Free cancellation may apply — check each package's policy for exact dates.",
    },
  };
}
