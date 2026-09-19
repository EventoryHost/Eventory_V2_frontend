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

/** Letters only, lowercased — "DJ Artist", "DJArtist" and "dj artist" all collapse to the same key. */
function normalizeVendorType(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

const NORMALIZED_VENDOR_TYPE_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_TO_VENDOR_TYPE).map(([slug, vendorType]) => [normalizeVendorType(vendorType), slug])
);

/**
 * Vendor.vendorType -> category slug, defensively.
 *
 * The stored values do NOT all match the enum. Real data contains
 * "DJ Artist" (spaced), comma-joined multi-types like
 * "Caterer, Makeup Artist, Photography and Videography", empty strings and
 * vendors with the field unset entirely. A plain lookup turned every one of
 * those into the "all" bucket, which then rendered as a category chip
 * reading "ALL".
 *
 * Matching is done on a letters-only key, and a multi-type string is
 * resolved by its first entry — the vendor's primary trade.
 *
 * Returns null when there is genuinely nothing to show, so callers can drop
 * the chip rather than label it.
 */
export function resolveVendorCategory(
  vendorType?: string | null
): { category: string; label: string } | null {
  const raw = (vendorType ?? "").trim();
  if (!raw) return null;

  const primary = raw.split(",")[0].trim();
  const category = NORMALIZED_VENDOR_TYPE_TO_CATEGORY[normalizeVendorType(primary)];

  // Unrecognized but non-empty: show what the vendor actually wrote rather
  // than mislabel them.
  if (!category) return { category: "all", label: primary };
  return { category, label: primary };
}

export type DiscoverySortOption = "newest" | "price_asc" | "price_desc" | "rating";

/**
 * GET /customer/vendors sorts. Narrower than the package sorts on purpose:
 * a vendor has no price, so price_asc/price_desc have nothing to order by.
 */
export type VendorSortOption = "newest" | "rating";

export const VENDOR_SORT_UI_TO_API: Record<string, VendorSortOption> = {
  newest: "newest",
  "top-rated": "rating",
};

export const SORT_UI_TO_API: Record<string, DiscoverySortOption> = {
  newest: "newest",
  "price-asc": "price_asc",
  "price-desc": "price_desc",
  "top-rated": "rating",
};
