import { apiFetch } from "./apiClient";
import type { DiscoverySortOption } from "./vendorType";

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

export function getPackageDurationLabel(pkg: RawPackage): string {
  const { minHours, maxHours } = pkg.step1_eventAndCrew?.duration ?? {};
  if (minHours && maxHours && minHours !== maxHours) return `${minHours}-${maxHours} hrs`;
  if (minHours || maxHours) return `${minHours ?? maxHours} hrs`;
  return "—";
}

export function getPackageCapacityLabel(pkg: RawPackage): string {
  const { minGuests, maxGuests } = pkg.step1_eventAndCrew?.capacity ?? {};
  if (minGuests && maxGuests && minGuests !== maxGuests) return `${minGuests}-${maxGuests} guests`;
  if (minGuests || maxGuests) return `${minGuests ?? maxGuests} guests`;
  return "—";
}
