// Slug (used in frontend URLs/tabs) <-> backend vendorType enum, and UI sort
// id <-> API sort param. Shared by customer-packages and customer-vendors so
// both features stay in sync with the same category tabs.

export const CATEGORY_TO_VENDOR_TYPE: Record<string, string> = {
  "makeup-artist": "MakeupArtist",
  caterer: "Caterer",
  "venue-provider": "VenueProvider",
  "dj-artist": "DJArtist",
  decorator: "Decorator",
  photographer: "PAV",
};

export const VENDOR_TYPE_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_TO_VENDOR_TYPE).map(([slug, vendorType]) => [vendorType, slug])
);

export type DiscoverySortOption = "newest" | "price_asc" | "price_desc" | "rating";

export const SORT_UI_TO_API: Record<string, DiscoverySortOption> = {
  newest: "newest",
  "price-asc": "price_asc",
  "price-desc": "price_desc",
  "top-rated": "rating",
};
