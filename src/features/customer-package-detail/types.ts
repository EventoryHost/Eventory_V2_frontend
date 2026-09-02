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
  /** Short bullet list shown on the variant card ("2 setups — stage + entrance arch"). */
  features?: string[];
  price: number;
  originalPrice?: number;
  badge?: string;
  /** "starting tier" for the cheapest variant, "+₹14,000 vs Basic" for the rest. */
  compareNote?: string;
}

export interface ColourOption {
  id: string;
  label: string;
  /** Hex swatch shown as a small dot next to the colour name. */
  swatch: string;
}

// A single line item inside a setup's workshop. Editing one of these *is* a
// live customer request (see CustomizeRequest below) — there's no separate
// "request" record, the request is derived by diffing against the
// `original*` fields. `type`/`colours`/quantity attributes are optional
// because the real backend doesn't send them yet (setups only have
// name + qty) — the workshop just hides whichever section has no data.
export interface IncludedItemLine {
  id: string;
  label: string;
  qty: number;
  originalQty: number;
  /** Free-text display category, e.g. "Flowers", "Furniture". */
  category?: string;
  typeLabel?: string;
  typeOptions?: string[];
  type?: string;
  originalType?: string;
  colourOptions?: ColourOption[];
  /** Selected colour ids. */
  colours?: string[];
  originalColours?: string[];
  /** Decorator-only — how full/dense the item should look (Low/Medium/High). Undefined when the vendor never set one. */
  volumeOptions?: string[];
  volume?: string;
  originalVolume?: string;
  /** Introduced via "Add an item" in the workshop — never shows a strikethrough. */
  isNew?: boolean;
  /** Flagged for removal via the workshop — locks the other attribute controls. */
  removalRequested?: boolean;
}

export type CustomizeRequestType = "change" | "add" | "remove";

// Derived (not stored) view of a pending workshop edit, used to render the
// "Your requests" list on the setup summary.
export interface CustomizeRequest {
  key: string;
  setupId: string;
  setupTitle: string;
  itemId: string;
  item: IncludedItemLine;
  requestType: CustomizeRequestType;
}

export interface WorkshopCategoryDef {
  id: string;
  label: string;
  typeLabel: string;
  typeOptions: string[];
}

export interface IncludedItemDetail {
  label: string;
  value: string;
  /** Count of additional values beyond `value` (e.g. value="Chair Decor", moreCount=2 -> "Chair Decor, +2 more"). Only set when the underlying field is a real array with more than one entry. */
  moreCount?: number;
}

export interface IncludedItemEntry {
  id: string;
  image?: string;
  title: string;
  /** Vendor-type-specific facts (Decorator: Decorating/Structures Included/Theme; PAV: Style/Quantity/Delivery; etc). */
  details: IncludedItemDetail[];
  /** Decorator-only — the setup's applied theme tag(s), shown as a pill picker in the setup detail view. Undefined for vendor types with no theme concept. */
  themeOptions?: string[];
  price: number;
  items: IncludedItemLine[];
  /** Count of items in this setup that offer customer-facing customisation (currently: items with color options). Undefined/0 hides the chip rather than showing a fabricated count. */
  customisationsCount?: number;
}

export type VendorRequirementIcon = "electricity" | "stage" | "ac" | "room" | "vehicle" | "permission" | "storage" | "water" | "parking";

export interface VendorRequirement {
  id: string;
  label: string;
  icon: VendorRequirementIcon;
  description?: string;
  /** "must" = required before the crew can work; "good" = nice to have. Undated requirements default to "must". */
  tier?: "must" | "good";
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
  description?: string;
  warning?: string;
  /** Extra facts shown in the add-on details modal, e.g. Type of Setup, Dimensions. */
  details?: IncludedItemDetail[];
  /** Colour choices shown in the add-on details modal. */
  colourOptions?: ColourOption[];
}

/** An add-on the customer has picked, carrying how many they picked. */
export interface SelectedAddon extends AddonItem {
  quantity: number;
}

export type PolicyIcon = "shield" | "clock";

export interface PolicyItem {
  id: string;
  icon: PolicyIcon;
  title: string;
  description: string;
  href: string;
  /** Small pill next to the title, e.g. "Reviewed by Eventory" or "PDF". */
  tag?: string;
}

export interface VendorInfo {
  id: string;
  initials: string;
  name: string;
  businessName?: string;
  rating: number;
  verified: boolean;
  eventsCount: number;
  yearsExperience: number;
  href: string;
  /** e.g. "~2 hrs" */
  repliesIn?: string;
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
  /** Category badge background gradient start color — same per-category palette as the landing page's ProductCard. */
  categoryGradientFrom?: string;
  /** Second breadcrumb segment after the category, e.g. the vendor's storefront name. */
  vendorUnitName?: string;
  eventTags: string[];
  moreEventTagsCount: number;
  title: string;
  instantBooking: boolean;
  vendorName: string;
  idVerified?: boolean;
  gstinVerified?: boolean;
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
    setupCoverage?: string;
    indoorOutdoor?: string;
    sampleDecoration?: string;
  };
  aboutText: string;
  includedItems: IncludedItemEntry[];
  /** Things the package explicitly does not cover — shown right after What's Included. */
  notIncluded?: string[];
  vendorRequirements: VendorRequirement[];
  addons: AddonItem[];
  paymentProtection: { points: string[]; footnote: string };
  policies: PolicyItem[];
  vendor: VendorInfo;
  reviews: ReviewsSummary;
  pricing: PackagePricing;
}
