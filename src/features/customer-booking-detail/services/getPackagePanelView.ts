import {
  getBookingDetail,
  type RawCustomizeRequest,
  type RawPolicySlot,
  type RawPriceCharge,
} from "@/lib/customerBookingApi";
import { getPackageDetail } from "@/features/customer-package-detail/services/getPackageDetail";
import type { IncludedItemEntry } from "@/features/customer-package-detail/types";

/** A workshop request, paired with the item it was made against (when it resolves). */
export interface PanelRequest extends RawCustomizeRequest {
  /** The item's values before the request, for the struck-through "was" text. */
  previous?: { type?: string; colours?: string[]; volume?: string };
}

export interface PanelSetup {
  entry: IncludedItemEntry;
  /** Requests grouped by the item they target; "" holds ones that match no item. */
  requestsByItemId: Record<string, PanelRequest[]>;
}

/** An add-on row: what the booking bought, dressed with the package's own art. */
export interface PanelAddOn {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  categoryLabel?: string;
  colourLabel?: string;
}

export interface PackagePanelView {
  reference: string;
  vendorName?: string;
  packageName: string;
  variantLabel?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  eventType?: string;
  total: number;
  status: string;
  notes?: string;

  setups: PanelSetup[];
  addOns: PanelAddOn[];
  notIncluded: string[];
  charges: RawPriceCharge[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  policies: { cancellation: RawPolicySlot | null; lastMinute: RawPolicySlot | null; general: RawPolicySlot[]; note: string };
}

function vendorNameOf(vendor: unknown) {
  if (!vendor || typeof vendor === "string") return undefined;
  const record = vendor as { businessName?: string; pocName?: string };
  return record.businessName ?? record.pocName;
}

/**
 * Loads one booked package's full detail panel.
 *
 * The booking carries what the customer asked for (workshop requests, notes,
 * the priced breakdown); the package carries what was sold (setups, their
 * items and specs, exclusions). Both are needed, and the requests are matched
 * back onto the package's items by the setup/item ids the workshop generated
 * and the booking stored unchanged.
 */
export async function getPackagePanelView(bookingReference: string): Promise<PackagePanelView> {
  const detail = await getBookingDetail(bookingReference);
  const booking = detail.booking;
  const pkg = await getPackageDetail(booking.packageId);

  const requests = booking.customizeRequests ?? [];

  const setups: PanelSetup[] = pkg.includedItems.map((entry) => {
    const forSetup = requests.filter((request) => request.setupId === entry.id);
    const requestsByItemId: Record<string, PanelRequest[]> = {};

    forSetup.forEach((request) => {
      const item = entry.items.find((line) => line.id === request.itemId);
      const key = item ? item.id : "";
      const previous = item
        ? { type: item.originalType, colours: item.originalColours, volume: item.originalVolume }
        : undefined;
      (requestsByItemId[key] ??= []).push({ ...request, previous });
    });

    return { entry, requestsByItemId };
  });

  // A request whose setup no longer exists on the package (the vendor edited
  // it since) would otherwise vanish — park those on the first setup so they
  // are still visible rather than silently dropped.
  const matchedSetupIds = new Set(pkg.includedItems.map((entry) => entry.id));
  const orphans = requests.filter((request) => !matchedSetupIds.has(request.setupId));
  if (orphans.length > 0 && setups.length > 0) {
    setups[0].requestsByItemId[""] = [...(setups[0].requestsByItemId[""] ?? []), ...orphans];
  }

  // The booking says WHICH add-ons were bought and how many; the package
  // carries their image and category. Matched on the add-on id, falling back
  // to the name for packages whose add-ons have no id at all (common — see
  // Booking.js's note on addOnId being a String).
  const addOns: PanelAddOn[] = (booking.selectedAddOns ?? []).map((line, index) => {
    const catalogEntry =
      pkg.addons.find((addon) => line.addOnId && addon.id === line.addOnId) ??
      pkg.addons.find((addon) => addon.title === line.name);

    return {
      id: line.addOnId ?? `addon-${index}`,
      name: line.name,
      quantity: line.quantity,
      price: line.price,
      image: catalogEntry?.image,
      categoryLabel: [catalogEntry?.category, catalogEntry?.subCategory].filter(Boolean).join(" · "),
      colourLabel: catalogEntry?.details?.find((detail) => detail.label === "Color")?.value,
    };
  });

  return {
    reference: booking.bookingId,
    vendorName: vendorNameOf(booking.vendorId),
    packageName: booking.packageSnapshot?.name ?? pkg.title,
    variantLabel: booking.packageSnapshot?.variantType,
    eventDate: booking.eventDate,
    startTime: booking.startTime ?? undefined,
    endTime: booking.endTime ?? undefined,
    location: booking.location ?? undefined,
    eventType: booking.eventType ?? undefined,
    total: booking.totalAmount,
    status: booking.status,
    notes: booking.notes ?? undefined,

    setups,
    addOns,
    notIncluded: pkg.notIncluded ?? [],
    charges: detail.priceBreakdown.charges ?? [],
    subtotal: detail.priceBreakdown.subtotal ?? 0,
    taxAmount: detail.priceBreakdown.taxAmount ?? 0,
    discountAmount: detail.priceBreakdown.discountAmount ?? 0,
    grandTotal: detail.priceBreakdown.grandTotal ?? detail.priceBreakdown.totalAmount,
    policies: {
      cancellation: detail.cancellationPolicy?.cancellationPolicy ?? null,
      lastMinute: detail.cancellationPolicy?.lastMinutePolicy ?? null,
      general: detail.cancellationPolicy?.generalPolicies ?? [],
      note: detail.cancellationPolicy?.note ?? "",
    },
  };
}
