import type { RawPackage } from "@/lib/customerDiscoveryApi";
import {
  extractHighlightTags,
  getPackageCapacityLabel,
  getPackageDurationLabel,
  getPackageImage,
  getPackageStartingPrice,
} from "@/lib/customerDiscoveryApi";
import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { CATEGORY_META } from "@/lib/categoryMeta";
import { VENDOR_CATEGORIES } from "./data/filterConfig";
import type { Vendor } from "./types";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";

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
    name: pkg.vendorId?.businessName ?? "Vendor",
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
    startingPrice: getPackageStartingPrice(pkg),
    location: pkg.vendorId?.city ?? "—",
    locations: locations.length > 0 ? locations : ["—"],
    description: pkg.vendorId?.description ?? "",
    images: image ? [image] : [FALLBACK_IMAGE],
  };
}
