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
  /** Category chip icon/gradient — same per-category look as the landing page's ProductCard (src/lib/categoryMeta.ts). */
  categoryIcon?: string;
  categoryGradientFrom?: string;
  eventTypes: string[];
  /** Short vendor-authored highlights (e.g. "Bridal Makeup", "Fashion Photography") — cleaned from the real `included` field, which isn't reliably tag-shaped across every vendor type. Can be empty. */
  highlightTags: string[];
  rating: number;
  reviewCount: number;
  duration: string;
  guestCapacity: string;
  startingPrice: number;
  /** City only — kept for the existing text-search haystack in filterVendors.ts. */
  location: string;
  /** City + service areas, same source composition as the PDP header / landing-page cards. */
  locations: string[];
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
