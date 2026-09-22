import { browsePackages, getPackagesFilters } from "@/lib/customerDiscoveryApi";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";
import { mapPackageToListItem } from "../mappers";
import { PACKAGES_PAGE_SIZE, RECOMMENDED_LIMIT } from "../data/filterConfig";
import type { PackageListingData } from "../types";

/**
 * Initial data for the package listing (/packages/browse), server-fetched
 * once for the "all categories" tab. Category/sort/search/paging after that
 * go straight back to browsePackages client-side — see
 * PackageListingContent.tsx.
 *
 * The "Recommendation" strip below the results is a second, rating-sorted
 * read so it isn't just the first page repeated.
 */
export async function getPackageListingData(): Promise<PackageListingData> {
  const [packagesResponse, filtersResponse, recommendedResponse] = await Promise.all([
    browsePackages({ sort: "newest", page: 1, limit: PACKAGES_PAGE_SIZE }),
    getPackagesFilters(),
    browsePackages({ sort: "rating", page: 1, limit: RECOMMENDED_LIMIT }).catch(() => null),
  ]);

  return {
    categories: VENDOR_CATEGORIES,
    packages: packagesResponse.packages.map(mapPackageToListItem),
    total: packagesResponse.total,
    totalPages: packagesResponse.totalPages,
    eventCategoryOptions: filtersResponse.filters.eventCategories.map((category) => ({
      id: category,
      label: category,
    })),
    recommended: (recommendedResponse?.packages ?? []).map(mapPackageToListItem),
  };
}
