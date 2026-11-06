import type { VendorsPageData } from "../types";
import { VENDOR_CATEGORIES, VENDORS_PAGE_SIZE } from "../data/filterConfig";
import { mapVendorToCard } from "../mappers";
import { browseVendors, getVendorFilters } from "@/lib/customerDiscoveryApi";
import { groupEventCategories } from "@/lib/eventCategoryGroups";

/**
 * Initial data for the Vendor Listing page — one row per VENDOR, server
 * fetched once for the "all categories" tab. Category/sort/search/paging
 * after that go straight back to `browseVendors` client-side, see
 * VendorsPageContent.tsx.
 *
 * Both reads are vendor-derived on purpose: the event-category facet comes
 * from /customer/vendors/filters rather than the packages equivalent, so
 * the sidebar only ever offers event categories some VENDOR actually has —
 * matching what the rows can match on. "Service Localities" isn't a facet
 * at all — see filterConfig.ts's SERVICE_LOCALITY_OPTIONS.
 */
export async function getVendorsPageData(): Promise<VendorsPageData> {
  const [vendorsResponse, filtersResponse] = await Promise.all([
    browseVendors({ sort: "newest", page: 1, limit: VENDORS_PAGE_SIZE }),
    getVendorFilters(),
  ]);

  return {
    categories: VENDOR_CATEGORIES,
    vendors: vendorsResponse.vendors.map(mapVendorToCard),
    total: vendorsResponse.total,
    totalPages: vendorsResponse.totalPages,
    // PM reversal (2026-10-14): show every real, unique event category the
    // backend's facet aggregation returns (GET /customer/vendors/filters),
    // including ones previously merged/hidden as duplicates — THEN merge
    // near-duplicate variants into one option by keyword family (see
    // lib/eventCategoryGroups.ts). Selecting the merged option matches
    // every real variant server-side.
    eventCategoryOptions: groupEventCategories(filtersResponse.filters.eventCategories),
  };
}
