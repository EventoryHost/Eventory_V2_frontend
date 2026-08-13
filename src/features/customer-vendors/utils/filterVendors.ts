import type { Vendor, VendorFilters } from "../types";
import { PRICE_RANGE_OPTIONS } from "../data/filterConfig";

function priceInRange(price: number, rangeId: string) {
  if (rangeId === "50000-plus") return price >= 50000;
  const [minStr, maxStr] = rangeId.split("-");
  const min = Number(minStr);
  const max = Number(maxStr);
  return price >= min && price <= max;
}

/**
 * Client-side refinement applied on top of the server-filtered/paginated
 * page from GET /customer/packages — the API only takes one `eventCategory`
 * and a continuous `minPrice`/`maxPrice`, so multi-select event-type chips
 * and price buckets stay a client-side pass over whatever page is loaded.
 */
export function filterVendors(vendors: Vendor[], filters: VendorFilters): Vendor[] {
  const query = filters.search.trim().toLowerCase();

  const filtered = vendors.filter((vendor) => {
    if (filters.category !== "all" && vendor.category !== filters.category) return false;

    if (query) {
      const haystack = `${vendor.name} ${vendor.packageName} ${vendor.location} ${vendor.categoryLabel}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (
      filters.eventTypes.length > 0 &&
      !filters.eventTypes.some((id) => vendor.eventTypes.includes(id))
    ) {
      return false;
    }

    if (
      filters.priceRanges.length > 0 &&
      !filters.priceRanges.some((rangeId) => priceInRange(vendor.startingPrice, rangeId))
    ) {
      return false;
    }

    return true;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.startingPrice - b.startingPrice);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.startingPrice - a.startingPrice);
      break;
    case "top-rated":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
    default:
      break;
  }

  return sorted;
}

export function priceRangeLabel(rangeId: string) {
  return PRICE_RANGE_OPTIONS.find((option) => option.id === rangeId)?.label ?? rangeId;
}
