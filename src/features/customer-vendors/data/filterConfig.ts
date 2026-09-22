import type { FilterOption, FilterSectionConfig, VendorCategory } from "../types";

export const VENDORS_PAGE_SIZE = 9;

// Same category slugs as src/lib/vendorType.ts / src/features/customer-packages/data/mockPackagesPageData.ts
// so links between Packages <-> Vendors stay interoperable.
export const VENDOR_CATEGORIES: VendorCategory[] = [
  { id: "all", label: "All" },
  { id: "makeup-artist", label: "Makeup Artist" },
  { id: "caterer", label: "Caterer" },
  { id: "venue-provider", label: "Venue Provider" },
  { id: "dj-artist", label: "Dj Artist" },
  { id: "decorator", label: "Decorator" },
  { id: "photographer", label: "Photographer" },
];

export const PRICE_RANGE_OPTIONS: FilterOption[] = [
  { id: "5000-9999", label: "₹5000 - ₹9999" },
  { id: "10000-14999", label: "₹10000 - ₹14999" },
  { id: "15000-19999", label: "₹15000 - ₹19999" },
  { id: "20000-29999", label: "₹20000 - ₹29999" },
  { id: "30000-49999", label: "₹30000 - ₹49999" },
  { id: "50000-plus", label: "₹50000 and above" },
];

/**
 * Guest buckets from the design. The id encodes the bucket's own bounds so
 * filterVendors can compare them against a package's capacity range without
 * a second lookup table; "501-plus" is open-ended.
 */
export const GUEST_RANGE_OPTIONS: FilterOption[] = [
  { id: "0-50", label: "Up to 50 Guests" },
  { id: "51-100", label: "51 - 100 Guests" },
  { id: "101-150", label: "101 - 150 Guests" },
  { id: "151-300", label: "151 - 300 Guests" },
  { id: "301-500", label: "301 - 500 Guests" },
  { id: "501-plus", label: "501+ Guests" },
];

/**
 * DELIBERATE DEVIATION FROM THE FIGMA COPY. The design lists these as
 * "<4.5 star", "<4 star" … "<1 star", alongside an "All Ratings" option.
 * Read literally that is a filter for BADLY-rated vendors, and "<1 star"
 * next to "All Ratings" makes no sense as a set — it reads as a typo for
 * the conventional descending "and above" scale, which is what every other
 * marketplace ships and what the data supports. Implemented as ">= N" and
 * labelled accordingly so the control cannot mislead.
 */
export const RATING_OPTIONS: FilterOption[] = [
  { id: "4.5", label: "4.5 Star & above" },
  { id: "4", label: "4 Star & above" },
  { id: "3", label: "3 Star & above" },
  { id: "2", label: "2 Star & above" },
  { id: "1", label: "1 Star & above" },
  { id: "all", label: "All Ratings" },
];

/**
 * "Special offer" from the design. There is NO backing field for either
 * option — neither the Package model nor the browse response records
 * whether a package is customisable or carries add-ons — so these render
 * and tick but do not narrow the results. See filterVendors.ts.
 */
export const OFFER_OPTIONS: FilterOption[] = [
  { id: "customisable", label: "Customisable Packages" },
  { id: "addons", label: "Packages with Add-ons" },
];

/**
 * Filter sections for the sidebar/drawer, in the Figma's order.
 *
 * Event-type and locality options are REAL facet values from
 * GET /customer/packages/filters rather than the design's hardcoded lists,
 * so the sidebar only ever offers filters that can actually match something
 * in the current inventory. (For event categories id === label, since the
 * backend's values are already human-readable strings.)
 */
export function getFilterSections({
  eventCategoryOptions,
  cityOptions,
}: {
  eventCategoryOptions: FilterOption[];
  cityOptions: FilterOption[];
}): FilterSectionConfig[] {
  return [
    { id: "eventType", title: "Event", options: eventCategoryOptions },
    { id: "offer", title: "Special offer", options: OFFER_OPTIONS },
    { id: "locality", title: "Service Localities", options: cityOptions },
    { id: "pricing", title: "Event Pricing", options: PRICE_RANGE_OPTIONS },
    { id: "guests", title: "Guest", options: GUEST_RANGE_OPTIONS },
    { id: "rating", title: "Rating", options: RATING_OPTIONS },
  ];
}
