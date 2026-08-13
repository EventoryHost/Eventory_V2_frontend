// Domain types for the customer-facing Package Detail (product description) page.
// Shaped to mirror what the backend "package detail" endpoint is expected to
// return, so `services/getPackageDetail.ts` can swap its mock data for a real
// `fetch` without any component needing to change.
//
// `image` fields are optional everywhere on purpose: until real photography
// is wired up, components fall back to a placeholder container rather than
// faking content (see PlaceholderMedia in src/features/customer-packages).

export interface GalleryImage {
  id: string;
  image?: string;
  alt: string;
}

export interface PackageVariant {
  id: string;
  label: string;
  image?: string;
  setupsCount: number;
  itemsCount: number;
  description: string;
  price: number;
  originalPrice?: number;
  badge?: string;
}

export interface IncludedItemLine {
  id: string;
  label: string;
  qty: number;
}

export interface IncludedItemEntry {
  id: string;
  image?: string;
  title: string;
  decoratingAreas: string[];
  theme: string;
  setupType: string;
  price: number;
  items: IncludedItemLine[];
}

export type VendorRequirementIcon = "electricity" | "stage" | "ac" | "room";

export interface VendorRequirement {
  id: string;
  label: string;
  icon: VendorRequirementIcon;
}

export interface AddonItem {
  id: string;
  category: string;
  image?: string;
  title: string;
  subCategory: string;
  qtyLabel: string;
  price: number;
  unitLabel: string;
}

export type PolicyIcon = "shield" | "clock";

export interface PolicyItem {
  id: string;
  icon: PolicyIcon;
  title: string;
  description: string;
  href: string;
}

export interface VendorInfo {
  id: string;
  initials: string;
  name: string;
  rating: number;
  verified: boolean;
  eventsCount: number;
  yearsExperience: number;
  href: string;
}

export interface RatingBreakdownEntry {
  stars: number;
  percent: number;
  count: number;
}

export interface RatingCategoryScore {
  label: string;
  score: number;
}

export interface ReviewFilter {
  id: string;
  label: string;
}

export interface Review {
  id: string;
  authorName: string;
  eventTag: string;
  rating: number;
  date: string;
  comment: string;
  photoNote?: string;
  /** Matches ReviewFilter ids this review should appear under (besides "all"). */
  filterIds: string[];
}

export interface ReviewsSummary {
  average: number;
  total: number;
  breakdown: RatingBreakdownEntry[];
  categories: RatingCategoryScore[];
  filters: ReviewFilter[];
  items: Review[];
}

export interface PackagePricing {
  gstPercent: number;
  tokenAmount: number;
}

export interface PackageDetail {
  id: string;
  categoryLabel: string;
  categoryIcon?: string;
  eventTags: string[];
  moreEventTagsCount: number;
  title: string;
  instantBooking: boolean;
  vendorName: string;
  rating: number;
  reviewCount: number;
  locationSummary: string;
  gallery: GalleryImage[];
  variants: PackageVariant[];
  defaultVariantId: string;
  summary: {
    setupsLabel: string;
    serviceArea: string;
    setupTime: string;
    crewSize: string;
  };
  aboutText: string;
  includedItems: IncludedItemEntry[];
  vendorRequirements: VendorRequirement[];
  addons: AddonItem[];
  paymentProtection: { points: string[]; footnote: string };
  policies: PolicyItem[];
  vendor: VendorInfo;
  reviews: ReviewsSummary;
  pricing: PackagePricing;
}
