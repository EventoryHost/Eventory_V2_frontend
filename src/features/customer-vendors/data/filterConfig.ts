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
 * Filter sections for the sidebar/drawer. Event-type options come from the
 * real GET /customer/packages/filters facet (id === label, since the
 * backend's eventCategories are already human-readable strings) — there is
 * no backend equivalent for a "service" facet, so that section was dropped.
 */
export function getFilterSectionsForCategory(eventCategoryOptions: FilterOption[]): FilterSectionConfig[] {
  return [
    { id: "eventType", title: "Event Type", options: eventCategoryOptions },
    { id: "pricing", title: "Pricing", options: PRICE_RANGE_OPTIONS },
  ];
}
