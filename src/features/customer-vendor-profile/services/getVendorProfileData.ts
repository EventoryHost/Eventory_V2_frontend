import { notFound } from "next/navigation";
import { getVendorPublic, getVendorReviews } from "@/lib/vendorPublicApi";
import { browsePackages } from "@/lib/customerDiscoveryApi";
import { mapPackageToVendor } from "@/features/customer-vendors/mappers";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";
import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { CATEGORY_META } from "@/lib/categoryMeta";
import type { VendorProfileData } from "../types";

/** How many of the vendor's packages the "Event Packages" grid shows. */
export const VENDOR_PACKAGES_LIMIT = 8;
/** First page of reviews; the section pages through the rest client-side. */
export const VENDOR_REVIEWS_PAGE_SIZE = 5;

/**
 * Everything the vendor profile page renders, in one server-side fetch.
 *
 * The three reads are independent, so they run in parallel. Only the vendor
 * itself is required — a vendor with no packages or no reviews is a
 * perfectly normal new vendor, and those sections handle empty on their
 * own rather than failing the page.
 */
export async function getVendorProfileData(vendorId: string): Promise<VendorProfileData> {
  const [vendorResponse, packagesResponse, reviewsResponse] = await Promise.all([
    getVendorPublic(vendorId).catch(() => null),
    browsePackages({ vendorId, sort: "newest", page: 1, limit: VENDOR_PACKAGES_LIMIT }).catch(() => null),
    getVendorReviews(vendorId, { sort: "recent", page: 1, limit: VENDOR_REVIEWS_PAGE_SIZE }).catch(() => null),
  ]);

  // A missing/deactivated vendor is a 404, not an empty profile — rendering
  // a nameless shell would be worse than the not-found page.
  if (!vendorResponse?.vendor) notFound();

  const raw = vendorResponse.vendor;
  const category = VENDOR_TYPE_TO_CATEGORY[raw.vendorType ?? ""] ?? "all";
  const categoryLabel =
    VENDOR_CATEGORIES.find((item) => item.id === category)?.label ?? raw.vendorType ?? "Vendor";
  const meta = CATEGORY_META[category];

  // City first, then the areas they additionally serve — same composition as
  // the listing card's location strip and the PDP header.
  const serviceAreas = [raw.city, ...(raw.serviceAreas ?? [])].filter(
    (area): area is string => Boolean(area)
  );

  return {
    vendor: {
      id: raw.id,
      name: raw.pocName ?? "Vendor",
      description: raw.description ?? "",
      coverImage: raw.coverImage,
      avatar: raw.profilePicture,
      isVerified: Boolean(raw.isVerified),
      rating: raw.rating ?? 0,
      reviewCount: raw.reviewsCount ?? 0,
      category,
      categoryLabel,
      categoryIcon: meta?.icon,
      categoryGradientFrom: meta?.gradientFrom,
      // Deduped: a vendor whose city is also listed among their service
      // areas would otherwise render the same chip twice.
      serviceAreas: [...new Set(serviceAreas)],
      eventCategories: raw.eventCategories ?? [],
      stats: {
        experience: raw.experience,
        bookingsPerYear: raw.bookingsPerYear,
        teamSize: raw.teamSize,
        wishlistCount: raw.wishlistCount,
      },
      gallery: raw.businessPhotos ?? [],
    },
    packages: (packagesResponse?.packages ?? []).map(mapPackageToVendor),
    packagesTotal: packagesResponse?.total ?? 0,
    reviews: {
      items: reviewsResponse?.items ?? [],
      total: reviewsResponse?.total ?? 0,
      totalPages: reviewsResponse?.totalPages ?? 0,
      aggregate: reviewsResponse?.aggregate ?? {
        averageRating: null,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        categoryBreakdown: [],
      },
    },
  };
}
