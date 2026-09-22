import type { Vendor } from "@/features/customer-vendors/types";
import type { RawPdpReviewItem, RawReviewAggregate } from "@/lib/customerPackageDetailApi";

/**
 * Domain types for the customer-facing Vendor Profile page
 * (/vendors/[vendorId]).
 *
 * Unlike the vendor LISTING — where every row is really a package and the
 * vendor is just what's populated onto it — this page is genuinely about
 * one vendor: GET /customer/vendors/:vendorId is the primary read, and the
 * vendor's packages are a section within it.
 */

export interface VendorProfileStats {
  /** Bucketed range strings straight from onboarding — formatted by formatRangeStat(). */
  experience?: string;
  bookingsPerYear?: string;
  teamSize?: string;
  wishlistCount?: number;
}

export interface VendorProfile {
  id: string;
  /** Vendor's own name (pocName) — customer surfaces never show businessName. */
  name: string;
  description: string;
  coverImage?: string;
  avatar?: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  /** Category slug, e.g. "decorator" — matches VENDOR_CATEGORIES / CATEGORY_META. */
  category: string;
  categoryLabel: string;
  categoryIcon?: string;
  categoryGradientFrom?: string;
  /** City + service areas — the "Service Localities" chip row. */
  serviceAreas: string[];
  /** Vendor-authored event types — the "Event Specialisation" chip row. */
  eventCategories: string[];
  stats: VendorProfileStats;
  /** businessPhotos — the Gallery section. */
  gallery: string[];
}

export interface VendorProfileReviews {
  items: RawPdpReviewItem[];
  total: number;
  totalPages: number;
  aggregate: RawReviewAggregate;
}

export interface VendorProfileData {
  vendor: VendorProfile;
  /** The vendor's own Live packages — reuses the listing's Vendor shape so the package cards stay identical across the app. */
  packages: Vendor[];
  packagesTotal: number;
  reviews: VendorProfileReviews;
}

export type ReviewSort = "recent" | "highest" | "lowest";

export const REVIEW_SORTS: { id: ReviewSort; label: string }[] = [
  { id: "recent", label: "Most Recent" },
  { id: "highest", label: "Highest Rated" },
  { id: "lowest", label: "Lowest Rated" },
];
