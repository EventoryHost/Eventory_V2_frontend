import type { FilterOption, VendorCategory } from "@/features/customer-vendors/types";

/**
 * Domain types for the customer-facing PACKAGE listing (/packages/browse) —
 * the package twin of the vendor listing at /vendors.
 *
 * A row here is one package (GET /api/customer/packages), which is also
 * what the card shows: package name, price, duration, capacity. The vendor
 * only appears as the category chip and the location strip.
 */

export interface PackageListItem {
  id: string;
  name: string;
  /** Category slug, e.g. "makeup-artist" — matches VENDOR_CATEGORIES / CATEGORY_META. */
  category: string;
  categoryLabel: string;
  categoryIcon?: string;
  categoryGradientFrom?: string;
  eventTypes: string[];
  rating: number;
  reviewCount: number;
  duration: string;
  guestCapacity: string;
  /** Numeric capacity behind the label — the Guest buckets compare ranges. */
  guestMin?: number;
  guestMax?: number;
  startingPrice: number;
  /** City + service areas of the owning vendor. */
  locations: string[];
  image?: string;
}

/**
 * Sidebar sections. `eventType` and `pricing` genuinely filter; the rest are
 * rendered per the design but have nothing to filter on — see
 * filterPackages() and data/filterConfig.ts.
 */
export type PackageFilterSectionId =
  | "eventType"
  | "service"
  | "offer"
  | "pricing"
  | "style"
  | "hairAndStyling";

export type PackageSelectedFilters = Record<string, string[]>;

export const EMPTY_PACKAGE_FILTERS: PackageSelectedFilters = {
  eventType: [],
  service: [],
  offer: [],
  pricing: [],
  style: [],
  hairAndStyling: [],
};

export type PackageSortOption = "newest" | "price-asc" | "price-desc" | "top-rated";

export const PACKAGE_SORT_OPTIONS: { id: PackageSortOption; label: string }[] = [
  { id: "newest", label: "What's New" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "top-rated", label: "Top Rated" },
];

export interface PackageListingData {
  categories: VendorCategory[];
  packages: PackageListItem[];
  total: number;
  totalPages: number;
  eventCategoryOptions: FilterOption[];
  /** Newest packages, shown under "Recommendation" below the results. */
  recommended: PackageListItem[];
}
