import { apiFetch } from "./apiClient";
import type { DiscoverySortOption } from "./vendorType";
import { formatMinutesLabel } from "./formatMinutes";

// Raw shapes returned by GET /api/customer/packages and /api/customer/packages/filters,
// verified against the backend models directly (Eventory_V2_backend/src/models/Package.js,
// src/controllers/customerDiscoveryController.js) since CUSTOMER_API_DOCS.md doesn't spell
// out every nested field.

export interface RawVendorPublic {
  id: string;
  businessName: string;
  isIndividual?: boolean;
  vendorType: string;
  eventCategories?: string[];
  city?: string;
  state?: string;
  serviceAreas?: string[];
  teamSize?: number;
  bookingsPerYear?: number;
  experience?: number;
  profilePicture?: string;
  description?: string;
  businessPhotos?: string[];
  coverImage?: string;
  isVerified?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
}

export interface RawPackageMedia {
  url: string;
  type?: "image" | "video";
  fileName?: string;
}

export interface RawPackage {
  _id: string;
  vendorId: RawVendorPublic;
  vendorType: string;
  variantType?: string;
  packageGroupId?: string;
  packageStatus?: string;
  step1_eventAndCrew: {
    packageName: string;
    eventCategories?: string[];
    capacity?: { minGuests?: number; maxGuests?: number };
    duration?: { minHours?: number; maxHours?: number };
  };
  step3_policiesAndCharges: {
    packagePricing: { price: number; billingUnit?: string; noOfPeople?: string };
    gstInclusive?: boolean;
    gstRatePercent?: number;
    guestTiers?: { maxGuests: number; price: number }[];
  };
  step4_sampleMedia?: { media?: RawPackageMedia[] };
  createdAt: string;
}

export interface BrowsePackagesResponse {
  status: "SUCCESS";
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  packages: RawPackage[];
}

export interface PackagesFiltersResponse {
  status: "SUCCESS";
  filters: {
    eventCategories: string[];
    vendorTypes: string[];
    cities: string[];
    priceRange: { min: number; max: number };
    guestRange: { minGuests: number; maxGuests: number };
    sortOptions: string[];
  };
}

export interface BrowsePackagesParams {
  q?: string;
  eventCategory?: string;
  vendorType?: string;
  city?: string;
  guests?: number;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: DiscoverySortOption;
  page?: number;
  limit?: number;
}

function toQueryString(params: object) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function browsePackages(params: BrowsePackagesParams = {}) {
  return apiFetch<BrowsePackagesResponse>(`/customer/packages${toQueryString(params)}`, { auth: false });
}

export interface RawFeaturedReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customerName?: string;
  customerAvatar?: string;
  packageName?: string;
}

export interface FeaturedReviewsResponse {
  status: "SUCCESS";
  items: RawFeaturedReview[];
}

/**
 * NOT YET IMPLEMENTED ON THE BACKEND — proposed spec for the landing page's
 * "Loved by X Happy Customers" carousel, which needs a handful of top
 * reviews across the whole platform. The backend currently only has
 * per-package (GET /customer/packages/:packageId/reviews) and per-vendor
 * (GET /customer/vendors/:vendorId/reviews) review listings — there's no
 * site-wide equivalent yet.
 *
 * Requested: GET /customer/reviews/featured?limit=8&minRating=4
 *   - Same Review model/status="Published" filter as the existing review
 *     endpoints, just not scoped to one package/vendor.
 *   - Sort by rating desc, then createdAt desc (highest-rated, most recent).
 *   - Response pre-flattened (no nested populate needed client-side):
 *     { status: "SUCCESS", items: [{ _id, rating, comment, createdAt,
 *       customerName, customerAvatar, packageName }] }
 *
 * Until this exists (or returns nothing — there's no review-submission
 * endpoint yet either, so `customer_reviews` may currently be empty),
 * callers should catch/ignore failures and fall back to static content.
 */
export async function getFeaturedReviews(params: { limit?: number; minRating?: number } = {}) {
  return apiFetch<FeaturedReviewsResponse>(`/customer/reviews/featured${toQueryString(params)}`, { auth: false });
}

export async function getPackagesFilters() {
  return apiFetch<PackagesFiltersResponse>("/customer/packages/filters", { auth: false });
}

export interface PopularPackagesResponse extends BrowsePackagesResponse {
  /** true when fewer than `limit` packages have real bookings yet and the rest were backfilled with newest Live packages. */
  usingFallback?: boolean;
}

/** Ranked by real booking volume (Completed/active bookings only) — same package/vendor shape as browsePackages, so mapPackageToVendor/ProductCard mapping is reused as-is. */
export async function getPopularPackages(params: { limit?: number } = {}) {
  return apiFetch<PopularPackagesResponse>(`/customer/packages/popular${toQueryString(params)}`, { auth: false });
}

/** step3_policiesAndCharges.packagePricing.price is the authoritative "starting price" — the same field the backend itself filters/sorts/facets on. */
export function getPackageStartingPrice(pkg: RawPackage): number {
  return pkg.step3_policiesAndCharges?.packagePricing?.price ?? 0;
}

export function getPackageImage(pkg: RawPackage): string | undefined {
  return pkg.step4_sampleMedia?.media?.[0]?.url;
}

// TEMPORARY: treating minHours/maxHours as MINUTES for display, same as the
// PDP's setup-time formatting — see getPackageDetail.ts's formatSetupTime
// comment for the reasoning/caveat behind that.
export function getPackageDurationLabel(pkg: RawPackage): string {
  const { minHours, maxHours } = pkg.step1_eventAndCrew?.duration ?? {};
  if (minHours && maxHours && minHours !== maxHours) {
    return `${formatMinutesLabel(minHours)} - ${formatMinutesLabel(maxHours)}`;
  }
  if (minHours || maxHours) return formatMinutesLabel(minHours ?? maxHours!);
  return "—";
}

export function getPackageCapacityLabel(pkg: RawPackage): string {
  const { minGuests, maxGuests } = pkg.step1_eventAndCrew?.capacity ?? {};
  if (minGuests && maxGuests && minGuests !== maxGuests) return `${minGuests}-${maxGuests} guests`;
  if (minGuests || maxGuests) return `${minGuests ?? maxGuests} guests`;
  return "—";
}
