import type { RawCustomizeRequest } from "@/lib/customerCartApi";
import type { CustomizeRequest } from "../types";
import { ALL_EXTENDED_COLOURS } from "../data/extendedColorPalette";

/**
 * One workshop request in the shape the backend stores (CartItem.js /
 * Booking.js CustomizeRequestSchema). Shared by the cart payload
 * (StickyBookingCard) and Review Proposal's follow-up requests.
 */
export function toCustomizeRequestPayload(request: CustomizeRequest): RawCustomizeRequest {
  return {
    setupId: request.setupId,
    itemId: request.itemId,
    requestType: request.requestType,
    label: request.item.label,
    quantity: request.item.qty,
    type: request.item.type,
    // Real colour names, not the slugified ids useCustomizeWorkshop uses
    // internally — that's what the backend schema and vendor-facing
    // display expect. A brand-new item's colours come from its own
    // COLOUR_PALETTE picks (colours/colourOptions, unrelated to any
    // vendor default). An existing item's colour(s) are only ever sent
    // here when they're a real request — the extended-palette
    // customColours multi-select (design change 2026-09-30) — never the
    // vendor's own colours, which are a free pick that's never a
    // request in the first place.
    colours: request.item.isNew
      ? request.item.colours?.map((id) => request.item.colourOptions?.find((c) => c.id === id)?.label ?? id)
      : request.item.customColours?.map((id) => ALL_EXTENDED_COLOURS.find((c) => c.id === id)?.label ?? id),
    volume: request.item.volume,
  };
}
