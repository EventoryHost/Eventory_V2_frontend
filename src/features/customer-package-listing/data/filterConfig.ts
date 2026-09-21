import type { FilterOption, FilterSectionConfig } from "@/features/customer-vendors/types";
import { GUEST_RANGE_OPTIONS, PRICE_RANGE_OPTIONS } from "@/features/customer-vendors/data/filterConfig";

export const PACKAGES_PAGE_SIZE = 9;
export const RECOMMENDED_LIMIT = 6;

export { PRICE_RANGE_OPTIONS, GUEST_RANGE_OPTIONS };

/**
 * "Special offer" — same two options as the vendor listing, and the same
 * problem: no field on the Package model records whether a package is
 * customisable or carries add-ons.
 */
export const OFFER_OPTIONS: FilterOption[] = [
  { id: "customisable", label: "Customisable Packages" },
  { id: "addons", label: "Packages with Add-ons" },
];

/**
 * CATEGORY-SPECIFIC sections from the design. The Figma shows the Makeup
 * Artist variant of this page, whose sidebar carries "Makeup Service",
 * "Makeup Style" and "Hair and Styling" below the shared sections.
 *
 * NONE OF THESE CAN FILTER. There is no service/style taxonomy anywhere in
 * the backend — the closest field, step2_productsAndPricing.included, is
 * free-text the vendor types themselves (real values include "right",
 * "okj", "sdfsc" alongside "Grand Balloon Gate Decor"), so matching
 * "Bridal Makeup" against it would be guesswork that silently drops real
 * results.
 *
 * They are scoped per category rather than shown globally, so a customer
 * browsing Caterers is never offered "Airbrush Makeup".
 */
export const CATEGORY_FILTER_SECTIONS: Record<string, FilterSectionConfig[]> = {
  "makeup-artist": [
    {
      id: "service",
      title: "Makeup Service",
      options: [
        "Bridal Makeup",
        "Pary Makeup",
        "HD Makeup",
        "Airbrush Makeup",
        "Engagement Makeup",
        "Reception Makeup",
        "Groom Makeup",
        "Celebrity Makeup",
      ].map((label) => ({ id: label, label })),
    },
    {
      id: "style",
      title: "Makeup Style",
      options: ["MAC", "Huda Beauty", "Booby Brown", "Dior", "Lakmé", "L'Oréal Pro"].map((label) => ({
        id: label,
        label,
      })),
    },
    {
      id: "hairAndStyling",
      title: "Hair and Styling",
      options: [
        "Styling",
        "Updo",
        "Curls/Straightening",
        "Hair extension",
        "Colour Application",
        "Head Massage",
        "Wash & Blow-Dry",
        "Keratin",
      ].map((label) => ({ id: label, label })),
    },
  ],
};

/**
 * Sidebar sections in the design's order, with the category-specific ones
 * spliced in after "Makeup Service"'s slot — i.e. Event Type, <category
 * sections>, Special offer, Pricing.
 *
 * Event-type options are the REAL facet from GET /customer/packages/filters
 * rather than the design's hardcoded list, so the sidebar only offers
 * values something can actually match.
 */
export function getPackageFilterSections({
  eventCategoryOptions,
  categoryId,
}: {
  eventCategoryOptions: FilterOption[];
  categoryId: string;
}): FilterSectionConfig[] {
  const categorySections = CATEGORY_FILTER_SECTIONS[categoryId] ?? [];
  const [service, ...restCategorySections] = categorySections;

  return [
    { id: "eventType", title: "Event Type", options: eventCategoryOptions },
    ...(service ? [service] : []),
    { id: "offer", title: "Special offer", options: OFFER_OPTIONS },
    { id: "pricing", title: "Pricing", options: PRICE_RANGE_OPTIONS },
    ...restCategorySections,
  ];
}
