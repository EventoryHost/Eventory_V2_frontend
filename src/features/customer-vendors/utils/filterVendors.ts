import type { SelectedFilters, Vendor } from "../types";
import { GUEST_RANGE_OPTIONS, PRICE_RANGE_OPTIONS, RATING_OPTIONS } from "../data/filterConfig";

function ratingMatches(rating: number, optionId: string) {
  if (optionId === "all") return true;
  return rating >= Number(optionId);
}

/**
 * Client-side refinement on top of the page already fetched from
 * GET /customer/vendors.
 *
 * Search, category and sort are NOT handled here any more — the vendors
 * endpoint does all three server-side, so re-applying them client-side
 * would only ever narrow the current page and fight the real result count.
 * What's left are the multi-select sidebar sections, which the endpoint has
 * no equivalent for: they stay an OR-within-section, AND-across-section
 * pass over whatever page is loaded.
 *
 * THREE SECTIONS ARE DELIBERATELY INERT, because a vendor row carries no
 * data to test them against:
 *
 *   offer   — "Customisable Packages" / "Packages with Add-ons" have no
 *             corresponding field anywhere in the backend.
 *   pricing — price is a PACKAGE attribute; a vendor has no price. Filtering
 *             vendors by it needs a join through their packages, which the
 *             vendors endpoint does not do.
 *   guests  — likewise capacity, and no Live package records one anyway.
 *
 * They render (the design calls for all six) and their checkboxes tick, but
 * narrowing on them would mean inventing a signal and dropping every result.
 */
export function filterVendors(vendors: Vendor[], selected: SelectedFilters): Vendor[] {
  const { eventType, locality, rating } = selected;

  return vendors.filter((vendor) => {
    if (eventType.length > 0 && !eventType.some((id) => vendor.eventTypes.includes(id))) {
      return false;
    }

    // Matched against city AND service areas — the same list the card's
    // location strip shows, so a vendor is findable by anywhere they serve,
    // not only where they are registered.
    if (locality.length > 0 && !locality.some((id) => vendor.locations.includes(id))) {
      return false;
    }

    if (rating.length > 0 && !rating.some((id) => ratingMatches(vendor.rating, id))) {
      return false;
    }

    return true;
  });
}

/** Human-readable label for an active filter chip, whichever section it came from. */
export function filterOptionLabel(sectionId: string, optionId: string) {
  const lookup = {
    pricing: PRICE_RANGE_OPTIONS,
    guests: GUEST_RANGE_OPTIONS,
    rating: RATING_OPTIONS,
  }[sectionId];
  return lookup?.find((option) => option.id === optionId)?.label ?? optionId;
}
