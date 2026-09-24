// Domain types for the customer-facing Vendor Listing / search-results page.
//
// A row here is ONE VENDOR (GET /api/customer/vendors). It used to be one
// package, which is why a vendor with six packages appeared six times; the
// cards were always vendor-shaped, so they are now sourced from the vendor
// collection directly and `total`/page counts finally count vendors.
//
// The same shape is reused by the vendor profile's package grid, where rows
// ARE packages — `source` says which, and the package-only fields below
// (packageName, startingPrice, guest range) are set only in that case.

export interface VendorCategory {
  /** Stable slug — matches the vendor-type id used across the app (see src/features/customer-packages/types.ts) and src/lib/vendorType.ts. */
  id: string;
  label: string;
}

export interface Vendor {
  id: string;
  /** Vendor/business name, e.g. "Glamour & Grace". */
  name: string;
  /** Package name — only set when this row came from a package (the vendor profile's packages grid), never on the listing. */
  packageName?: string;
  /** Category slug — matches VendorCategory.id. */
  category: string;
  categoryLabel: string;
  /** Category chip icon/gradient — same per-category look as the landing page's ProductCard (src/lib/categoryMeta.ts). */
  categoryIcon?: string;
  categoryGradientFrom?: string;
  eventTypes: string[];
  /** Whether this row is a vendor (the listing) or one of their packages (the profile grid). */
  source: "vendor" | "package";
  /** Short vendor-authored highlights (e.g. "Bridal Makeup", "Fashion Photography") — cleaned from the real `included` field, which isn't reliably tag-shaped across every vendor type. Can be empty. */
  highlightTags?: string[];
  rating: number;
  reviewCount: number;
  /** Package-only, undefined on a vendor row. */
  duration?: string;
  guestCapacity?: string;
  /**
   * Numeric guest range behind the `guestCapacity` label. The label alone
   * ("51-100 guests", "—") can't be compared against the Guest filter's
   * buckets, so the raw min/max are kept alongside it. Undefined when the
   * vendor never filled capacity in.
   */
  guestMin?: number;
  guestMax?: number;
  /** Package-only, undefined on a vendor row — a vendor has no price. */
  startingPrice?: number;
  /** City only — kept for the existing text-search haystack in filterVendors.ts. */
  location: string;
  /** City + service areas, same source composition as the PDP header / landing-page cards. */
  locations: string[];
  description: string;
  images?: string[];
  isBookmarked?: boolean;

  // ── Vendor-card fields (the Figma "Vendor Listing" card) ──────────────

  /** Banner strip across the top of the card — the vendor's own cover, not the package media. */
  coverImage?: string;
  /** Circular vendor avatar overlapping the cover. */
  avatar?: string;
  /**
   * The OWNING VENDOR's public id ("VEN..."), which is what the cards link
   * to — `id` above is the package's id, not the vendor's. Undefined when
   * the vendor could not be resolved for this package (see
   * resolveVendor.js), in which case the card falls back to the package PDP
   * rather than linking nowhere.
   */
  vendorProfileId?: string;
  /** Drives the blue verified badge beside the vendor name. */
  isVerified?: boolean;
  /**
   * Years in business, as the vendor picked it during onboarding — a
   * bucketed RANGE string like "8 - 12 years", not a number. Formatted for
   * display by formatExperience(). Undefined when unset.
   */
  experience?: string;
  /**
   * The card's wishlist stat ("400+ / Wishlisted"). Undefined (not 0) when
   * the backend predates the counter — the card hides the stat rather than
   * claiming nobody has saved this vendor. See RawVendorPublic.wishlistCount.
   */
  wishlistCount?: number;
  /**
   * Bookings per year, shown on the list row ("100-140 / Bookings/ Year").
   * A bucketed RANGE string like experience, not a number — formatted by
   * formatRangeStat(). Undefined when unset.
   */
  bookingsPerYear?: string;
}

export interface FilterOption {
  id: string;
  label: string;
}

/**
 * The six sidebar sections in the Figma design.
 *
 * `offer` is deliberately inert: "Customisable Packages" / "Packages with
 * Add-ons" have no corresponding field on the Package model or the browse
 * response, so the section renders and its checkboxes tick, but
 * filterVendors.ts intentionally does not narrow on it. See the note there.
 */
export type FilterSectionId = "eventType" | "offer" | "locality" | "pricing" | "guests" | "rating";

/**
 * `id` is a plain string, not the vendor union: the same sidebar chrome
 * (FilterSidebar / FilterPanelContent / FilterSection / MobileFilterDrawer)
 * is reused by the package listing, which has its own section set. Each
 * feature keeps its own stricter union for its own state and narrows at the
 * callback boundary.
 */
export interface FilterSectionConfig {
  id: string;
  title: string;
  options: FilterOption[];
}

export type SelectedFilters = Record<string, string[]>;

export const EMPTY_SELECTED_FILTERS: SelectedFilters = {
  eventType: [],
  offer: [],
  locality: [],
  pricing: [],
  guests: [],
  rating: [],
};

/**
 * Only two sorts: GET /customer/vendors orders by recency or rating. The
 * price sorts this menu used to offer went with the switch to vendor rows —
 * a vendor has no price to order by.
 */
export type SortOption = "newest" | "top-rated";

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "newest", label: "What's New" },
  { id: "top-rated", label: "Top Rated" },
];

export type ViewMode = "grid" | "list";

export interface VendorsPageData {
  categories: VendorCategory[];
  vendors: Vendor[];
  total: number;
  totalPages: number;
  /** Real event-category facet values from GET /customer/packages/filters — id and label are the same raw string. */
  eventCategoryOptions: FilterOption[];
  /** Real city facet values from the same endpoint — backs the "Service Localities" section. */
  cityOptions: FilterOption[];
}
