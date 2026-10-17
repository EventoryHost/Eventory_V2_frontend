import type { RawBooking, RawCustomizeRequest } from "@/lib/customerBookingApi";
import type { IncludedItemEntry, IncludedItemLine } from "@/features/customer-package-detail/types";
import { ALL_EXTENDED_COLOURS } from "@/features/customer-package-detail/data/extendedColorPalette";
import { COLOUR_PALETTE, VOLUME_OPTIONS } from "@/features/customer-package-detail/data/workshopCategories";

const TERMINAL: RawBooking["status"][] = ["Declined", "Cancelled", "Completed"];

type ProposalSource = Pick<RawBooking, "status" | "customizeRequests" | "changeRequests" | "proposalResponse">;

/**
 * True when the vendor has answered every request and the customer hasn't
 * answered back — the Review Proposal screen is waiting on them.
 *
 * The backend clears proposalResponse whenever the vendor decides a request,
 * so a second round of decisions asks again. At least one workshop request
 * must carry a real decision: older bookings whose requests predate the
 * status field have nothing to review.
 */
export function isProposalAwaitingReview(booking: ProposalSource): boolean {
  if (TERMINAL.includes(booking.status)) return false;

  const workshop = booking.customizeRequests ?? [];
  const all = [...workshop, ...(booking.changeRequests ?? [])];
  if (all.some((request) => request.status === "Pending")) return false;
  if (!workshop.some((request) => request.status === "Accepted" || request.status === "Rejected")) return false;

  return !booking.proposalResponse?.status;
}

/**
 * The package's setups as they stand once the vendor's ACCEPTED requests are
 * applied — the baseline a follow-up "Customize items" round edits on top of.
 *
 * Accepted values are written onto both the current and original* fields, so
 * the workshop's diff (useCustomizeWorkshop's hasChanged) only reports what
 * the customer changes now, not what was already agreed. Rejected requests
 * leave the item as the package sold it.
 */
export function setupsWithAcceptedRequests(
  entries: IncludedItemEntry[],
  requests: RawCustomizeRequest[]
): IncludedItemEntry[] {
  const accepted = requests.filter((request) => request.status === "Accepted");

  return entries.map((entry) => {
    const forSetup = accepted.filter((request) => request.setupId === entry.id);
    if (forSetup.length === 0) return entry;

    const removed = new Set(forSetup.filter((r) => r.requestType === "remove").map((r) => r.itemId));

    const items: IncludedItemLine[] = entry.items
      .filter((item) => !removed.has(item.id))
      .map((item) => {
        const change = forSetup.find((r) => r.requestType === "change" && r.itemId === item.id);
        if (!change) return item;

        // A change request's colours are extended-palette picks, stored as labels.
        const customColours = change.colours?.length
          ? change.colours.map((label) => ALL_EXTENDED_COLOURS.find((c) => c.label === label)?.id ?? label)
          : item.customColours;
        const qty = change.quantity ?? item.qty;
        const type = change.type ?? item.type;
        const volume = change.volume ?? item.volume;

        return {
          ...item,
          qty,
          originalQty: qty,
          type,
          originalType: type,
          volume,
          originalVolume: volume,
          customColours,
          originalCustomColours: customColours ? [...customColours] : undefined,
        };
      });

    // Accepted additions become ordinary items of the setup.
    for (const add of forSetup.filter((r) => r.requestType === "add")) {
      if (items.some((item) => item.id === add.itemId)) continue;
      const colours = add.colours?.map((label) => COLOUR_PALETTE.find((c) => c.label === label)?.id ?? label) ?? [];
      const isFlowers = add.label === "Flowers";
      items.push({
        id: add.itemId,
        label: add.label,
        qty: add.quantity ?? 1,
        originalQty: add.quantity ?? 1,
        category: add.label,
        type: add.type ?? undefined,
        originalType: add.type ?? undefined,
        colourOptions: COLOUR_PALETTE,
        colours,
        originalColours: [...colours],
        volumeOptions: isFlowers ? VOLUME_OPTIONS : undefined,
        volume: isFlowers ? (add.volume ?? undefined) : undefined,
        originalVolume: isFlowers ? (add.volume ?? undefined) : undefined,
      });
    }

    return { ...entry, items };
  });
}
