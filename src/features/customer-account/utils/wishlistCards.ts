import type { RawWishlistItem } from "@/lib/customerWishlistApi";
import { CATEGORY_META } from "@/lib/categoryMeta";
import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";
import { formatPrice } from "@/features/customer-vendors/utils/currency";

/** How many event tags the card shows before collapsing the rest into "+N more". */
const MAX_EVENT_TAGS = 3;

/**
 * One row of the wishlist drill-down (node 1541:6257). Packages and vendors
 * share the card: a saved vendor has no price and no variant, so those are
 * optional rather than faked.
 */
export interface WishlistCardItem {
  /** WishlistItem._id — what DELETE /customer/wishlist/:itemId takes. */
  itemId: string;
  /** Package._id, for the compare session. Absent on saved vendors. */
  packageId?: string;
  /** Omitted for saved vendors — there is no /vendors/[id] route yet, so those
      cards render inert rather than linking to a 404. */
  href?: string;
  categorySlug: string;
  categoryLabel: string;
  categoryIcon?: string;
  categoryGradientFrom?: string;
  eventTags: string[];
  moreEventTagsCount: number;
  title: string;
  variantLabel?: string;
  image?: string;
  rating: number;
  reviewCount: number;
  /** Formatted ("₹15,999"). Absent when the package is gone or has no price. */
  price?: string;
  /** "Delhi NCR, New Delhi" — city then service areas, empty when unknown. */
  locationSummary: string;
  note: string;
  /** The saved price no longer matches the live one (computed by the backend). */
  priceChanged: boolean;
  /** The package was taken down since it was saved. */
  unavailable: boolean;
}

function categoryLabelFor(slug: string, fallback: string) {
  return VENDOR_CATEGORIES.find((category) => category.id === slug)?.label ?? fallback;
}

function locationOf(city?: string, serviceAreas?: string[]) {
  // Same composition as the PDP header and the vendor cards: city, then
  // service areas.
  return [city, ...(serviceAreas ?? [])].filter(Boolean).join(", ");
}

function splitTags(tags: string[]) {
  return {
    eventTags: tags.slice(0, MAX_EVENT_TAGS),
    moreEventTagsCount: Math.max(0, tags.length - MAX_EVENT_TAGS),
  };
}

/**
 * Maps one wishlist row to its card. Returns null for a row whose package or
 * vendor came back null — the backend leaves those unpopulated when the item
 * has been taken down, and a card with no title/image is worse than no card.
 */
export function mapWishlistCard(item: RawWishlistItem): WishlistCardItem | null {
  const isPackage = item.itemType === "Package";
  const source = isPackage ? item.packageId : item.vendorId;
  if (!source) return null;

  const vendorType = source.vendorType ?? "";
  const categorySlug = VENDOR_TYPE_TO_CATEGORY[vendorType] ?? "";
  const meta = CATEGORY_META[categorySlug];

  const base = {
    itemId: item._id,
    categorySlug,
    categoryLabel: categoryLabelFor(categorySlug, vendorType),
    categoryIcon: meta?.icon,
    categoryGradientFrom: meta?.gradientFrom,
    note: item.note ?? "",
    unavailable: isPackage && item.packageStillAvailable === false,
  };

  if (isPackage && item.packageId) {
    const pkg = item.packageId;
    // currentPrice is recomputed per request; priceSnapshot is what it cost
    // when saved and is the only thing left once the package is gone.
    const amount = item.currentPrice ?? item.priceSnapshot;

    return {
      ...base,
      packageId: pkg._id,
      href: `/packages/${pkg._id}`,
      ...splitTags(pkg.step1_eventAndCrew?.eventCategories ?? []),
      title: pkg.step1_eventAndCrew?.packageName ?? "Package",
      variantLabel: pkg.variantType,
      image: pkg.step4_sampleMedia?.media?.[0]?.url,
      rating: pkg.vendorId?.rating ?? 0,
      reviewCount: pkg.vendorId?.reviewsCount ?? 0,
      price: amount != null ? formatPrice(amount) : undefined,
      locationSummary: locationOf(pkg.vendorId?.city, pkg.vendorId?.serviceAreas),
      priceChanged: Boolean(item.priceChanged),
    };
  }

  const vendor = item.vendorId!;
  return {
    ...base,
    ...splitTags(vendor.eventCategories ?? []),
    title: vendor.businessName ?? "Vendor",
    image: vendor.profilePicture,
    rating: vendor.rating ?? 0,
    reviewCount: vendor.reviewsCount ?? 0,
    locationSummary: locationOf(vendor.city, vendor.serviceAreas),
    priceChanged: false,
  };
}

/** Formats the card's event-tag line — "Wedding • Anniversary • +2 more". */
export function formatEventTags(tags: string[], moreCount: number) {
  const label = tags.join(" • ");
  if (moreCount === 0) return label;
  return label ? `${label} • +${moreCount} more` : `+${moreCount} more`;
}
