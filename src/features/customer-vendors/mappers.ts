import type { RawPackage } from "@/lib/customerDiscoveryApi";
import {
  getPackageCapacityLabel,
  getPackageDurationLabel,
  getPackageImage,
  getPackageStartingPrice,
} from "@/lib/customerDiscoveryApi";
import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { VENDOR_CATEGORIES } from "./data/filterConfig";
import type { Vendor } from "./types";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";

export function mapPackageToVendor(pkg: RawPackage): Vendor {
  const category = VENDOR_TYPE_TO_CATEGORY[pkg.vendorType] ?? "all";
  const categoryLabel = VENDOR_CATEGORIES.find((item) => item.id === category)?.label ?? pkg.vendorType;
  const image = getPackageImage(pkg);

  return {
    id: pkg._id,
    name: pkg.vendorId?.businessName ?? "Vendor",
    packageName: pkg.step1_eventAndCrew?.packageName ?? "Package",
    category,
    categoryLabel,
    eventTypes: pkg.step1_eventAndCrew?.eventCategories ?? [],
    rating: pkg.vendorId?.rating ?? 0,
    reviewCount: pkg.vendorId?.reviewsCount ?? 0,
    duration: getPackageDurationLabel(pkg),
    guestCapacity: getPackageCapacityLabel(pkg),
    startingPrice: getPackageStartingPrice(pkg),
    location: pkg.vendorId?.city ?? "—",
    description: pkg.vendorId?.description ?? "",
    images: image ? [image] : [FALLBACK_IMAGE],
  };
}

/**
 * Picks one card (the last of a fetched package list) to pin above the real
 * listing, pointed at the static `/packages/demo` PDP instead of its own
 * (possibly incomplete) live detail page — so /vendors always has one card
 * someone can click to see how the PDP looks, alongside the real results.
 */
export function pickDemoVendor(vendors: Vendor[]): Vendor | null {
  const last = vendors[vendors.length - 1];
  return last ? { ...last, id: "demo" } : null;
}
