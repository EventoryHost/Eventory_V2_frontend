import type { VendorsPageData } from "../types";
import { VENDOR_CATEGORIES, VENDORS_PAGE_SIZE } from "../data/filterConfig";
import { mapPackageToVendor } from "../mappers";
import { browsePackages, getPackagesFilters } from "@/lib/customerDiscoveryApi";

/**
 * Initial data source for the Vendor Listing page (server-fetched once for
 * the "all categories" tab). Category/sort/pagination changes after that are
 * fetched client-side directly via `browsePackages` — see
 * VendorsPageContent.tsx.
 */
export async function getVendorsPageData(): Promise<VendorsPageData> {
  const [packagesResponse, filtersResponse] = await Promise.all([
    browsePackages({ sort: "newest", page: 1, limit: VENDORS_PAGE_SIZE }),
    getPackagesFilters(),
  ]);

  const vendors = packagesResponse.packages.map(mapPackageToVendor);

  return {
    categories: VENDOR_CATEGORIES,
    vendors,
    total: packagesResponse.total,
    totalPages: packagesResponse.totalPages,
    eventCategoryOptions: filtersResponse.filters.eventCategories.map((category) => ({
      id: category,
      label: category,
    })),
  };
}
