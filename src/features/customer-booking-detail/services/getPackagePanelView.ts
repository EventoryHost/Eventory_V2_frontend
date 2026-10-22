import {
  getBookingDetail,
  type RawBooking,
  type RawChangeRequest,
  type RawCustomizeRequest,
  type RawPolicySlot,
  type RawPriceCharge,
  type RawPricingBreakdown,
  type RawProposalResponse,
} from "@/lib/customerBookingApi";
import { getPackageDetail } from "@/features/customer-package-detail/services/getPackageDetail";
import { mockPackageDetail } from "@/features/customer-package-detail/data/mockPackageDetailData";
import type { IncludedItemEntry, PackageDetail } from "@/features/customer-package-detail/types";
import { isProposalAwaitingReview, isReopened, isTerminalStatus } from "../utils/proposal";

/** A workshop request, paired with the item it was made against (when it resolves). */
export interface PanelRequest extends RawCustomizeRequest {
  /** The item's values before the request, for the struck-through "was" text. */
  previous?: { type?: string; colours?: string[]; volume?: string; qty?: number; typeLabel?: string; category?: string };
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
  /** The booking's Mongo _id — what the payment endpoints are keyed on. */
  bookingObjectId: string;
  vendorName?: string;
  packageName: string;
  variantLabel?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  eventType?: string;
  total: number;
  status: RawBooking["status"];
  /** Confirmed earlier, then reopened by new requests — see isReopened. */
  reopened: boolean;
  terminal: boolean;
  /**
   * False when the package itself couldn't be loaded (it's no longer Live,
   * or was deleted). The panel then lists the requests from the booking
   * alone, without the package's setups, item specs or add-on art.
   */
  packageAvailable: boolean;
  /** Every request on the booking (workshop + older change requests), and how many the vendor hasn't decided yet. */
  requestCounts: { total: number; pending: number };
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

  /** The vendor's answer to the workshop requests, and the customer's answer back (Review Proposal). */
  proposal: {
    awaitingReview: boolean;
    response: RawProposalResponse | null;
    /** Every workshop request, unchanged — what "Still Needs Changes" builds its baseline from. */
    requests: RawCustomizeRequest[];
    /** The older add/remove list — shown alongside, never edited from here. */
    changeRequests: RawChangeRequest[];
    /** Sent back with Accept Proposal so a revised proposal can't be accepted unseen. */
    version?: number;
    /** Keyed price rows; absent from a backend older than the Review Proposal endpoints. */
    pricingBreakdown?: RawPricingBreakdown;
  };
}

/**
 * A stand-in setup for requests the package can't place: the package
 * couldn't be loaded, or the vendor has since removed the setup they were
 * made against. Keyed by the requests' own setupId so a follow-up "Add an
 * item" lands on the same setup.
 */
function placeholderSetup(setupId: string, title: string): IncludedItemEntry {
  return { id: setupId, title, details: [], price: 0, items: [] };
}

function vendorNameOf(vendor: unknown) {
  if (!vendor || typeof vendor === "string") return undefined;
  const record = vendor as { businessName?: string; pocName?: string };
  return record.businessName ?? record.pocName;
}

/** No status (a booking made before the field existed) counts as decided, same as vendorAcceptedEverything. */
function countRequests(requests: { status?: string }[]) {
  return {
    total: requests.length,
    pending: requests.filter((request) => request.status === "Pending").length,
  };
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
  // Non-fatal: the package 404s once it's no longer Live, but the booking
  // (and the proposal the customer has to answer) still stands.
  const loaded: PackageDetail | null = await getPackageDetail(booking.packageId).catch(() => null);
  // getPackageDetail answers a network/server failure with the PDP's demo
  // package (same object references) — never show that as the customer's booking.
  const pkg = loaded && loaded.includedItems !== mockPackageDetail.includedItems ? loaded : null;

  const requests = booking.customizeRequests ?? [];
  const includedItems = pkg?.includedItems ?? [];

  const setups: PanelSetup[] = includedItems.map((entry) => {
    const forSetup = requests.filter((request) => request.setupId === entry.id);
    const requestsByItemId: Record<string, PanelRequest[]> = {};

    forSetup.forEach((request) => {
      const item = entry.items.find((line) => line.id === request.itemId);
      const key = item ? item.id : "";
      // Colours resolved to their names — originalColours holds the swatch ids.
      const previous = item
        ? {
            type: item.originalType,
            colours: item.originalColours?.map((id) => item.colourOptions?.find((c) => c.id === id)?.label ?? id),
            volume: item.originalVolume,
            qty: item.originalQty,
            typeLabel: item.typeLabel,
            category: item.category,
          }
        : undefined;
      (requestsByItemId[key] ??= []).push({ ...request, previous });
    });

    return { entry, requestsByItemId };
  });

  // A request whose setup the package doesn't have (the vendor edited it
  // since, or the package couldn't be loaded at all) would otherwise vanish —
  // give each such setupId a stand-in setup so it's still listed.
  const matchedSetupIds = new Set(includedItems.map((entry) => entry.id));
  const orphanSetupIds = [
    ...new Set(requests.filter((request) => !matchedSetupIds.has(request.setupId)).map((r) => r.setupId)),
  ];
  orphanSetupIds.forEach((setupId, index) => {
    const base = pkg ? "Other requested changes" : "Your requested changes";
    const title = orphanSetupIds.length > 1 ? `${base} (${index + 1})` : base;
    setups.push({
      entry: placeholderSetup(setupId, title),
      requestsByItemId: { "": requests.filter((request) => request.setupId === setupId) },
    });
  });

  // The booking says WHICH add-ons were bought and how many; the package
  // carries their image and category. Matched on the add-on id, falling back
  // to the name for packages whose add-ons have no id at all (common — see
  // Booking.js's note on addOnId being a String).
  const addOns: PanelAddOn[] = (booking.selectedAddOns ?? []).map((line, index) => {
    const catalog = pkg?.addons ?? [];
    const catalogEntry =
      catalog.find((addon) => line.addOnId && addon.id === line.addOnId) ??
      catalog.find((addon) => addon.title === line.name);

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
    bookingObjectId: booking._id,
    vendorName: vendorNameOf(booking.vendorId),
    packageName: booking.packageSnapshot?.name ?? pkg?.title ?? "Package",
    variantLabel: booking.packageSnapshot?.variantType,
    eventDate: booking.eventDate,
    startTime: booking.startTime ?? undefined,
    endTime: booking.endTime ?? undefined,
    location: booking.location ?? undefined,
    eventType: booking.eventType ?? undefined,
    total: booking.totalAmount,
    status: booking.status,
    reopened: isReopened(booking),
    terminal: isTerminalStatus(booking.status),
    packageAvailable: Boolean(pkg),
    requestCounts: countRequests([...requests, ...(booking.changeRequests ?? [])]),
    notes: booking.notes ?? undefined,

    setups,
    addOns,
    notIncluded: pkg?.notIncluded ?? [],
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

    proposal: {
      awaitingReview: isProposalAwaitingReview(booking),
      response: booking.proposalResponse ?? null,
      requests,
      changeRequests: booking.changeRequests ?? [],
      version: booking.proposalVersion,
      pricingBreakdown: detail.pricingBreakdown,
    },
  };
}
