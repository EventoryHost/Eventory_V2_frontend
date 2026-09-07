// Domain types for the customer-facing Packages page.
// Shaped to mirror what the backend "packages landing" endpoint is expected to
// return, so `services/getPackagesPageData.ts` can swap its mock data for a
// real `fetch` without any component needing to change.
//
// `image` fields are optional everywhere on purpose: until real photography
// is wired up (from the backend, or dropped in manually), components fall
// back to a placeholder container rather than faking content.

export interface VendorCategory {
  /** Stable slug — matches the vendor-type id used elsewhere in the app (see src/features/packages/flows). */
  id: string;
  label: string;
  /** Emoji for now; swap for an icon URL once the backend serves one. */
  icon: string;
}

export interface PromoBanner {
  id: string;
  image?: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface PackageCategoryItem {
  id: string;
  image?: string;
  title: string;
  /** Rupees. Omitted for plain subcategory chips that don't show a price. */
  priceFrom?: number;
  href: string;
}

export interface PackageCategorySection {
  id: string;
  heading: string;
  badgeLabel?: string;
  /** "chip" = image + label only. "product" = image + title + starting price. */
  variant: "chip" | "product";
  items: PackageCategoryItem[];
}

export interface FestiveOffer {
  id: string;
  image?: string;
  title: string;
  subtitle: string;
  discountLabel: string;
  discountCaption: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface MagicalMomentsBlock {
  id: string;
  /** Small label above the headline, e.g. "Celebrate Joy". */
  eyebrow: string;
  /** Large highlighted headline, e.g. "Magical Moments". */
  title: string;
  /** Large hero campaign photo shown inside the section. */
  campaignImage?: string;
  /** Package carousel rendered below the campaign image, reusing PackagePromoCard. */
  packages: PackageCategoryItem[];
}

export interface BudgetEstimatorSuggestion {
  id: string;
  vendorLabel: string;
  /** e.g. "Entrance decoration + other variations". */
  description: string;
  priceFrom: number;
  image?: string;
  href: string;
}

export interface BudgetEstimatorVendorGroup {
  /** Matches a VendorCategory id, e.g. "decorator". */
  categoryId: string;
  categoryLabel: string;
  suggestions: BudgetEstimatorSuggestion[];
}

export interface BudgetEstimator {
  id: string;
  heading: string;
  subheading: string;
  eventTypeOptions: string[];
  guestOptions: string[];
  locationOptions: string[];
  vendorOptions: string[];
  estimatedMin: number;
  estimatedMax: number;
  /** Chips shown on the result card, e.g. ["Wedding", "Ghaziabad"]. */
  tags: string[];
  marketInsight: string;
  vendorGroups: BudgetEstimatorVendorGroup[];
}

export type PackagesPageBlock =
  | { type: "packageCategorySection"; data: PackageCategorySection }
  | { type: "festiveOffer"; data: FestiveOffer }
  | { type: "magicalMoments"; data: MagicalMomentsBlock }
  | { type: "budgetEstimator"; data: BudgetEstimator };

export interface PackagesPageData {
  heroBanners: PromoBanner[];
  vendorCategories: VendorCategory[];
  defaultVendorCategoryId: string;
  /** Ordered content sections per vendor-category tab — CMS/API-driven, not hardcoded in JSX. */
  blocksByCategory: Record<string, PackagesPageBlock[]>;
  /**
   * Whether GET /customer/packages actually returned any real packages for
   * this category. `blocksByCategory` always has *something* in it (mock
   * CMS blocks like festive offers stay even with zero real packages), so
   * this is the real signal for the "coming soon" empty state — not an
   * empty `blocksByCategory` entry.
   */
  hasPackagesByCategory: Record<string, boolean>;
}
