import type { RawBooking, RawCustomizeRequest } from "@/lib/customerBookingApi";
import type { IncludedItemEntry, IncludedItemLine } from "@/features/customer-package-detail/types";
import { ALL_EXTENDED_COLOURS } from "@/features/customer-package-detail/data/extendedColorPalette";
import { COLOUR_PALETTE, VOLUME_OPTIONS } from "@/features/customer-package-detail/data/workshopCategories";

const TERMINAL: RawBooking["status"][] = ["Declined", "Cancelled", "Completed"];

type ProposalSource = Pick<RawBooking, "status" | "customizeRequests" | "changeRequests" | "proposalResponse">;

export function isTerminalStatus(status: RawBooking["status"]): boolean {
  return TERMINAL.includes(status);
}

/** Both request lists — workshop (customizeRequests) and the older add/remove changeRequests. */
export function allRequestsOf(booking: Pick<RawBooking, "customizeRequests" | "changeRequests">): { status?: string }[] {
  return [...(booking.customizeRequests ?? []), ...(booking.changeRequests ?? [])];
}

/** How many requests (either list) the vendor hasn't decided yet. */
export function pendingRequestCount(booking: Pick<RawBooking, "customizeRequests" | "changeRequests">): number {
  return allRequestsOf(booking).filter((request) => request.status === "Pending").length;
}

/**
 * True when the vendor has answered every request and the customer hasn't
 * answered back — the Review Proposal screen is waiting on them.
 *
 * The agreed contract, derived identically by the vendor app: a non-terminal
 * booking with at least one request (either list), none of them Pending, and
 * no customer answer (proposalResponse.status null). The backend resets that
 * answer whenever the vendor saves new decisions, so every revised proposal
 * asks again. Requests that predate the status field have no status, so they
 * count as answered — Review Proposal lists them rather than leaving the
 * customer with nothing to act on.
 */
export function isProposalAwaitingReview(booking: ProposalSource): boolean {
  if (isTerminalStatus(booking.status)) return false;

  const all = allRequestsOf(booking);
  if (all.length === 0) return false;
  if (all.some((request) => request.status === "Pending")) return false;

  return !booking.proposalResponse?.status;
}

/**
 * A confirmed booking the customer has asked for more changes on: it goes
 * back to InDiscussion but keeps confirmedAt (and its date) until the
 * customer accepts the vendor's next proposal.
 */
export function isReopened(booking: Pick<RawBooking, "status"> & { confirmedAt?: string | null }): boolean {
  return booking.status === "InDiscussion" && Boolean(booking.confirmedAt);
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
