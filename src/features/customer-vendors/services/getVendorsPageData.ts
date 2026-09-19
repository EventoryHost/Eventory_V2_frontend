import type { VendorsPageData } from "../types";
import { VENDOR_CATEGORIES, VENDORS_PAGE_SIZE } from "../data/filterConfig";
import { mapVendorToCard } from "../mappers";
import { browseVendors, getVendorFilters } from "@/lib/customerDiscoveryApi";

/**
 * Initial data for the Vendor Listing page — one row per VENDOR, server
 * fetched once for the "all categories" tab. Category/sort/search/paging
 * after that go straight back to `browseVendors` client-side, see
 * VendorsPageContent.tsx.
 *
 * Both reads are vendor-derived on purpose: the facets come from
 * /customer/vendors/filters rather than the packages equivalent, so the
 * sidebar only ever offers event categories and cities that some VENDOR
 * actually has — matching what the rows can match on.
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
    eventCategoryOptions: filtersResponse.filters.eventCategories.map((category) => ({
      id: category,
      label: category,
    })),
    cityOptions: filtersResponse.filters.cities.map((city) => ({ id: city, label: city })),
  };
}
