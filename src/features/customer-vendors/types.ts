// Domain types for the customer-facing Vendor Listing / search-results page.
// Shaped to mirror what the backend "vendor search" endpoint is expected to
// return, so `services/getVendorsPageData.ts` can swap its mock data for a
// real `fetch` without any component needing to change.

export interface VendorCategory {
  /** Stable slug — matches the vendor-type id used across the app (see src/features/customer-packages/types.ts). */
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
  services: string[];
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
  id: "eventType" | "service" | "pricing";
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
  services: string[];
  priceRanges: string[];
  sort: SortOption;
}

export interface VendorsPageData {
  categories: VendorCategory[];
  vendors: Vendor[];
}
