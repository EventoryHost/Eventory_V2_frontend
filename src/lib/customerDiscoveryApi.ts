import { apiFetch } from "./apiClient";
import type { DiscoverySortOption, VendorSortOption } from "./vendorType";
import { formatHoursRangeLabel, packageDurationsInHours } from "./formatHours";

// Raw shapes returned by GET /api/customer/packages and /api/customer/packages/filters,
// verified against the backend models directly (Eventory_V2_backend/src/models/Package.js,
// src/controllers/customerDiscoveryController.js) since CUSTOMER_API_DOCS.md doesn't spell
// out every nested field.

export interface RawVendorPublic {
  id: string;
  // Customer-facing surfaces never show the vendor's business name — only
  // the vendor's own name. businessName has been dropped from this response
  // entirely, not just left empty.
  pocName: string;
  isIndividual?: boolean;
  vendorType: string;
  eventCategories?: string[];
  city?: string;
  state?: string;
  serviceAreas?: string[];
  // STRINGS, not numbers — the Vendor model declares all three as String
  // and the real values are bucketed ranges the vendor picks during
  // onboarding ("8 - 12 years", "0 - 2 years", "1-5"). Typed as number here
  // originally; nothing read them until the vendor listing card did, at
  // which point `${experience}+` rendered "8 - 12 years+".
  teamSize?: string;
  bookingsPerYear?: string;
  experience?: string;
  profilePicture?: string;
  description?: string;
  businessPhotos?: string[];
  coverImage?: string;
  isVerified?: boolean;
  rating?: number;
  reviewsCount?: number;
  /**
   * How many customers have this vendor wishlisted — the "N+ Wishlisted"
   * stat on the vendor listing card. A denormalized counter on the Vendor
   * document (Eventory_V2_backend/src/models/Vendor.js), maintained by
   * $inc in customerWishlistController.js and projected through
   * PUBLIC_VENDOR_FIELDS, so it arrives on the already-populated vendorId
   * of every browse row at no extra request cost.
   *
   * Optional because a backend older than that change omits it entirely —
   * treat a missing value as "unknown", not as zero.
   */
  wishlistCount?: number;
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
  step2_productsAndPricing?: {
    /**
     * Vendor-authored "what's included" highlights. NOT reliably short/
     * pill-shaped across vendor types — confirmed with backend:
     * MakeupArtist vendors tend to enter short bullets (one per array
     * entry), but Decorator/Caterer/PAV/DJArtist vendors often type one
     * long multi-line paragraph into a single entry instead. See
     * extractHighlightTags() below, which is built defensively around this.
     */
    included?: string[];
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
  /** Every Live package belonging to one vendor — backs the vendor profile page's "Event Packages". Accepts a Mongo _id or the business-facing "VEN..." id. */
  vendorId?: string;
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

/**
 * GET /customer/location/cities — the distinct city/district labels
 * Eventory operates in, sourced from the same serviceablePincodes.json the
 * PDP's location-serviceability check reads. Feeds the navbar location
 * modal's district picker.
 */
export async function getServiceableCities() {
  const response = await apiFetch<{ success: true; data: string[] }>("/customer/location/cities", { auth: false });
  return response.data;
}

export interface BrowseVendorsParams {
  q?: string;
  vendorType?: string;
  eventCategory?: string;
  city?: string;
  sort?: VendorSortOption;
  page?: number;
  limit?: number;
}

export interface BrowseVendorsResponse {
  status: "SUCCESS";
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  vendors: RawVendorPublic[];
}

export interface VendorFiltersResponse {
  status: "SUCCESS";
  filters: {
    vendorTypes: string[];
    eventCategories: string[];
    cities: string[];
    sortOptions: string[];
  };
}

/**
 * One row per VENDOR — the vendor listing page.
 *
 * Deliberately not browsePackages: that returns one row per package, so a
 * vendor with six packages appeared six times. This is the same data the
 * cards already show (they are vendor-shaped), sourced from the vendor
 * collection directly, which also makes `total` and the page count
 * accurate rather than counting packages.
 *
 * Note the narrower sort set: a vendor has no price, so only rating and
 * recency are orderable here.
 */
export async function browseVendors(params: BrowseVendorsParams = {}) {
  return apiFetch<BrowseVendorsResponse>(`/customer/vendors${toQueryString(params)}`, { auth: false });
}

/** Vendor-derived facets (types/event categories/cities) — the listing sidebar. */
export async function getVendorFilters() {
  return apiFetch<VendorFiltersResponse>("/customer/vendors/filters", { auth: false });
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

const MAX_TAG_LENGTH = 40;
const LIST_PREFIX_PATTERN = /^[\s]*(?:[-•*]|\d+[.)])\s*/;

/**
 * Derives short, pill-shaped highlight tags from the vendor-authored
 * `included` field. Confirmed with backend: this data is NOT reliably
 * short/bulleted across vendor types — MakeupArtist vendors tend to enter
 * one short bullet per array entry, but Decorator/Caterer/PAV/DJArtist
 * vendors often type one long multi-line paragraph into a single entry
 * instead. So this splits every entry on its own newlines first (recovering
 * real bullets typed as one block of text), strips common list-numbering
 * prefixes, then drops anything still too long to read as a tag rather than
 * a sentence — it does not reshape/fabricate structure beyond that.
 */
export function extractHighlightTags(pkg: RawPackage): string[] {
  const included = pkg.step2_productsAndPricing?.included ?? [];
  return included
    .flatMap((entry) => entry.split(/\r?\n/))
    .map((line) => line.replace(LIST_PREFIX_PATTERN, "").trim())
    .filter((line) => line.length > 0 && line.length <= MAX_TAG_LENGTH);
}

// minHours/maxHours are raw hours (decimals allowed, e.g. 1.5), except on
// packages older app builds saved in minutes, which packageDurationsInHours
// converts. The listing projection only returns `duration`, so the unit is
// decided on minHours/maxHours alone here.
export function getPackageDurationLabel(pkg: RawPackage): string {
  const { minHours, maxHours } = packageDurationsInHours(pkg.step1_eventAndCrew);
  return formatHoursRangeLabel(minHours, maxHours) || "—";
}

export function getPackageCapacityLabel(pkg: RawPackage): string {
  const { minGuests, maxGuests } = pkg.step1_eventAndCrew?.capacity ?? {};
  if (minGuests && maxGuests && minGuests !== maxGuests) return `${minGuests}-${maxGuests} guests`;
  if (minGuests || maxGuests) return `${minGuests ?? maxGuests} guests`;
  return "—";
}
