import type { VendorsPageData } from "../types";
import { VENDOR_CATEGORIES } from "../data/filterConfig";
import { mockVendors } from "../data/mockVendorsData";

/**
 * Data source for the Vendor Listing page. Swap the body for a real call —
 * e.g. `fetch(apiUrl("/vendors/search"))` (see src/lib/api.ts) — once the
 * backend endpoint exists. Every component below this consumes the
 * `VendorsPageData` shape only, so that swap is the only change needed.
 * Filter-section options are derived client-side from the selected category
 * (see `getFilterSectionsForCategory`) since that selection changes without
 * a refetch.
 */
export async function getVendorsPageData(): Promise<VendorsPageData> {
  return {
    categories: VENDOR_CATEGORIES,
    vendors: mockVendors,
  };
}
