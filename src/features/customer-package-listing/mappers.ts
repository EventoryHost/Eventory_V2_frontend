import type { RawPackage } from "@/lib/customerDiscoveryApi";
import {
  getPackageCapacityLabel,
  getPackageDurationLabel,
  getPackageImage,
  getPackageStartingPrice,
} from "@/lib/customerDiscoveryApi";
import { resolveVendorCategory } from "@/lib/vendorType";
import { CATEGORY_META } from "@/lib/categoryMeta";
import type { PackageListItem } from "./types";

export function mapPackageToListItem(pkg: RawPackage): PackageListItem {
  // Package.vendorType is the clean enum, unlike Vendor.vendorType — but
  // resolved through the same helper so one unexpected value can't produce
  // a chip reading "ALL".
  const resolved = resolveVendorCategory(pkg.vendorType);
  const category = resolved?.category ?? "all";
  const meta = CATEGORY_META[category];

  const locations = [pkg.vendorId?.city, ...(pkg.vendorId?.serviceAreas ?? [])].filter(
    (location): location is string => Boolean(location)
  );

  return {
    id: pkg._id,
    name: pkg.step1_eventAndCrew?.packageName ?? "Package",
    category,
    categoryLabel: resolved?.label ?? "",
    categoryIcon: meta?.icon,
    categoryGradientFrom: meta?.gradientFrom,
    eventTypes: pkg.step1_eventAndCrew?.eventCategories ?? [],
    // The package's own rating isn't stored; the owning vendor's stands in,
    // which is what the PDP and every other package card already show.
    rating: pkg.vendorId?.rating ?? 0,
    reviewCount: pkg.vendorId?.reviewsCount ?? 0,
    duration: getPackageDurationLabel(pkg),
    guestCapacity: getPackageCapacityLabel(pkg),
    guestMin: pkg.step1_eventAndCrew?.capacity?.minGuests,
    guestMax: pkg.step1_eventAndCrew?.capacity?.maxGuests,
    startingPrice: getPackageStartingPrice(pkg),
    locations,
    image: getPackageImage(pkg),
  };
}
