import { apiFetch } from "./apiClient";
import type { RawPackageReviewsResponse } from "./customerPackageDetailApi";

// The real cart payload groups items by a bare vendorId ObjectId — no
// business name, no avatar (Eventory_V2_backend customerCartController.js
// never populates it). This calls the customer-facing GET
// /customer/vendors/:vendorId, a server-enforced PUBLIC_VENDOR_FIELDS
// whitelist — never phone/email/bank/KYC fields. Do NOT call the
// vendor-management router's internal GET /vendors/:id instead: without an
// explicit ?select= it returns the vendor's entire document.

export interface RawVendorPublicMinimal {
  id: string;
  // Customer-facing surfaces never show the vendor's business name — only
  // the vendor's own name (pocName). businessName has been dropped from
  // this response entirely, not just left empty.
  pocName?: string;
  isIndividual?: boolean;
  vendorType?: string;
  eventCategories?: string[];
  city?: string;
  state?: string;
  serviceAreas?: string[];
  // STRINGS, not numbers — the Vendor model declares all three as String and
  // the real values are bucketed ranges picked during onboarding ("5 - 10",
  // "8 - 12 years"). See the same note on RawVendorPublic.
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
  /** Denormalized counter on Vendor — see RawVendorPublic.wishlistCount. */
  wishlistCount?: number;
  createdAt?: string;
}

export async function getVendorPublic(vendorId: string) {
  return apiFetch<{ status: "SUCCESS"; vendor: RawVendorPublicMinimal }>(`/customer/vendors/${vendorId}`, {
    auth: false,
  });
}

export interface VendorReviewsParams {
  minRating?: number;
  sort?: "recent" | "highest" | "lowest";
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

/**
 * Every published review for a vendor, across all of their packages —
 * GET /customer/vendors/:vendorId/reviews. Paginated, filterable by
 * minimum rating and sortable, and it returns the same
 * `aggregate.distribution` the profile page's ratings histogram needs.
 *
 * Deliberately typed as RawPackageReviewsResponse: the backend builds this
 * response and the per-package one from the same code path, so the shapes
 * are identical by construction rather than by coincidence.
 */
export async function getVendorReviews(vendorId: string, params: VendorReviewsParams = {}) {
  return apiFetch<RawPackageReviewsResponse>(
    `/customer/vendors/${vendorId}/reviews${toQueryString(params)}`,
    { auth: false }
  );
}
