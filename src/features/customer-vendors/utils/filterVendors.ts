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
 * Search, category, sort, event type AND locality (added 2026-10-14 and
 * 2026-10-29 respectively — see VendorsPageContent.tsx's eventTypeParam/
 * localityParam comments) are all applied by the endpoint itself;
 * re-applying them client-side would only ever narrow the current page and
 * fight the real result count. What's left are the remaining multi-select
 * sidebar sections, which the endpoint has no equivalent for: they stay an
 * OR-within-section, AND-across-section pass over whatever page is loaded.
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
  const { rating } = selected;

  return vendors.filter((vendor) => {
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
