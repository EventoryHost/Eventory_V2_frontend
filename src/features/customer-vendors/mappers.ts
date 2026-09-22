import type { RawPackage, RawVendorPublic } from "@/lib/customerDiscoveryApi";
import {
  extractHighlightTags,
  getPackageCapacityLabel,
  getPackageDurationLabel,
  getPackageImage,
  getPackageStartingPrice,
} from "@/lib/customerDiscoveryApi";
import { resolveVendorCategory, VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { CATEGORY_META } from "@/lib/categoryMeta";
import { VENDOR_CATEGORIES } from "./data/filterConfig";
import type { Vendor } from "./types";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";

/**
 * One VENDOR row (GET /customer/vendors) -> the card shape.
 *
 * Everything the cards draw lives on the vendor itself, so nothing is
 * derived from a package here. The package-only fields (packageName,
 * startingPrice, guest range) are deliberately left undefined rather than
 * zero-filled — see filterVendors, which skips the filters that would need
 * them instead of quietly matching on a fake 0.
 */
export function mapVendorToCard(raw: RawVendorPublic): Vendor {
  // Defensive: real vendorType values include spaced, comma-joined, empty
  // and missing variants. See resolveVendorCategory.
  const resolved = resolveVendorCategory(raw.vendorType);
  const category = resolved?.category ?? "all";
  const meta = CATEGORY_META[category];

  const locations = [raw.city, ...(raw.serviceAreas ?? [])].filter(
    (location): location is string => Boolean(location)
  );

  return {
    // The vendor's own id IS the row id here, so the card links straight to
    // its profile and the bookmark saves the vendor.
    id: raw.id,
    vendorProfileId: raw.id,
    source: "vendor",
    name: raw.pocName ?? "Vendor",
    category,
    // Empty when the vendor never set a type — the chip hides rather than
    // labelling them "All".
    categoryLabel: resolved?.label ?? "",
    categoryIcon: meta?.icon,
    categoryGradientFrom: meta?.gradientFrom,
    eventTypes: raw.eventCategories ?? [],
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewsCount ?? 0,
    location: raw.city ?? "",
    locations,
    description: raw.description ?? "",
    coverImage: raw.coverImage,
    avatar: raw.profilePicture,
    isVerified: raw.isVerified,
    experience: raw.experience,
    wishlistCount: raw.wishlistCount,
    bookingsPerYear: raw.bookingsPerYear,
  };
}

export function mapPackageToVendor(pkg: RawPackage): Vendor {
  const category = VENDOR_TYPE_TO_CATEGORY[pkg.vendorType] ?? "all";
  const categoryLabel = VENDOR_CATEGORIES.find((item) => item.id === category)?.label ?? pkg.vendorType;
  const meta = CATEGORY_META[category];
  const image = getPackageImage(pkg);

  // Same source composition as the PDP header's locationSummary and the
  // landing page's ProductCard (city, then service areas).
  const locations = [pkg.vendorId?.city, ...(pkg.vendorId?.serviceAreas ?? [])].filter(
    (location): location is string => Boolean(location)
  );

  return {
    id: pkg._id,
    source: "package",
    name: pkg.vendorId?.pocName ?? "Vendor",
    packageName: pkg.step1_eventAndCrew?.packageName ?? "Package",
    category,
    categoryLabel,
    categoryIcon: meta?.icon,
    categoryGradientFrom: meta?.gradientFrom,
    eventTypes: pkg.step1_eventAndCrew?.eventCategories ?? [],
    highlightTags: extractHighlightTags(pkg),
    rating: pkg.vendorId?.rating ?? 0,
    reviewCount: pkg.vendorId?.reviewsCount ?? 0,
    duration: getPackageDurationLabel(pkg),
    guestCapacity: getPackageCapacityLabel(pkg),
    // Raw numbers alongside the display label — the Guest filter compares
    // ranges, which the label ("51-100 guests", "—") can't support.
    guestMin: pkg.step1_eventAndCrew?.capacity?.minGuests,
    guestMax: pkg.step1_eventAndCrew?.capacity?.maxGuests,
    startingPrice: getPackageStartingPrice(pkg),
    location: pkg.vendorId?.city ?? "—",
    locations: locations.length > 0 ? locations : ["—"],
    description: pkg.vendorId?.description ?? "",
    images: image ? [image] : [FALLBACK_IMAGE],

    // Vendor-card fields. coverImage/profilePicture are the VENDOR's own
    // branding — deliberately not the package media used for `images`,
    // since the card shows who the vendor is, not what one package looks
    // like. Both fall back inside the card itself rather than here, so a
    // missing cover can render a gradient instead of a stand-in photo.
    // The vendor's business-facing id. GET /customer/vendors/:vendorId
    // accepts either this or the Mongo _id, and this is the one actually
    // present on the populated vendor.
    vendorProfileId: pkg.vendorId?.id,
    coverImage: pkg.vendorId?.coverImage,
    avatar: pkg.vendorId?.profilePicture,
    isVerified: pkg.vendorId?.isVerified,
    experience: pkg.vendorId?.experience,
    // Left undefined (never defaulted to 0) when the backend omits it — the
    // card hides the stat rather than claiming nobody has saved this vendor.
    wishlistCount: pkg.vendorId?.wishlistCount,
    bookingsPerYear: pkg.vendorId?.bookingsPerYear,
  };
}
