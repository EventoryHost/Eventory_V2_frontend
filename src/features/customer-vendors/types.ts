// Domain types for the customer-facing Vendor Listing / search-results page.
// Each "vendor" card here is actually one vendor's package (GET
// /api/customer/packages) — the card UI shows packageName/price/duration/
// guestCapacity, fields that only exist on packages, not on vendor profiles.

export interface VendorCategory {
  /** Stable slug — matches the vendor-type id used across the app (see src/features/customer-packages/types.ts) and src/lib/vendorType.ts. */
  id: string;
  label: string;
}

export interface Vendor {
  id: string;
  /** Vendor/business name, e.g. "Glamour & Grace". */
  name: string;
  /** Package name shown as the card title, e.g. "Glamour & Grace - Silver Package". */
  packageName: string;
  /** Category slug — matches VendorCategory.id. */
  category: string;
  categoryLabel: string;
  eventTypes: string[];
  rating: number;
  reviewCount: number;
  duration: string;
  guestCapacity: string;
  startingPrice: number;
  location: string;
  description: string;
  images: string[];
  isBookmarked?: boolean;
}

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterSectionConfig {
  id: "eventType" | "pricing";
  title: string;
  options: FilterOption[];
}

export type SortOption = "newest" | "price-asc" | "price-desc" | "top-rated";

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "newest", label: "What's New" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "top-rated", label: "Top Rated" },
];

export type ViewMode = "grid" | "list";

export interface VendorFilters {
  search: string;
  category: string;
  eventTypes: string[];
  priceRanges: string[];
  sort: SortOption;
}

export interface VendorsPageData {
  categories: VendorCategory[];
  vendors: Vendor[];
  total: number;
  totalPages: number;
  /** Real event-category facet values from GET /customer/packages/filters — id and label are the same raw string. */
  eventCategoryOptions: FilterOption[];
}
