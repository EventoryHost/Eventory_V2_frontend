import { apiFetch } from "./apiClient";
import type { RawVendorPublic, RawPackageMedia } from "./customerDiscoveryApi";

// Raw shapes returned by GET /api/customer/packages/:packageId and
// GET /api/customer/packages/:packageId/reviews, verified against
// Eventory_V2_backend/src/controllers/customerDiscoveryController.js and the
// Package/DecoratorPackage models directly.

export interface RawPolicySlot {
  templateId?: string;
  templateTitle?: string;
  files?: string[];
  writtenText?: string;
}

export interface RawDecoratorSetupItem {
  name?: string;
  itemType?: string;
  qty?: number;
  unit?: string;
  price?: number;
  description?: string;
  volume?: string;
  /** Color options offered for this item — an item with any colors listed is treated as customisable. */
  colors?: string[];
  subCategory?: string;
}

export interface RawDecoratorSetup {
  _id?: string;
  name?: string;
  setupPhoto?: string;
  description?: string;
  price?: number;
  decoratingWhat?: string;
  themes?: string[];
  structuresIncluded?: string[];
  items?: RawDecoratorSetupItem[];
}

export interface RawDecoratorAddOn {
  _id?: string;
  addOnType?: "Service" | "Product";
  name?: string;
  category?: string;
  subCategory?: string;
  quantity?: number;
  price?: number;
  billingUnit?: string;
  mediaUrls?: string[];
  description?: string;
  productUsage?: "Indoor" | "Outdoor" | "Both";
  physicalSpec?: {
    /** Free-text color list (e.g. "White, Red, Green") — not structured swatches. */
    color?: string;
    dimensions?: { length?: number; breadth?: number; height?: number; unit?: string };
  };
}

export interface RawPavPackageItem {
  _id?: string;
  itemType?: string;
  contentDetails?: {
    categories?: string[];
    style?: string;
    quantity?: string | number;
    description?: string;
  };
  logisticsAndHandover?: {
    deliveryFormat?: string;
    deliveryMedium?: string;
    deliveryTimeline?: string;
    isVisitingIncluded?: boolean;
  };
}

export interface RawCatererMenuItem {
  name?: string;
  price?: number;
  foodType?: "Veg" | "Non-veg" | "Egg";
}

export interface RawCatererMenu {
  _id?: string;
  name?: string;
  type?: "Breakfast" | "Lunch" | "Dinner" | "Snacks";
  serviceStyle?: string[];
  perPlatePrice?: number;
  items?: Record<string, RawCatererMenuItem[] | undefined>;
}

export interface RawDjItem {
  _id?: string;
  name?: string;
  performanceType?: string;
  contentDetails?: { genreOfMusic?: string[]; language?: string[]; description?: string };
}

export interface RawDjEquipment {
  _id?: string;
  name?: string;
  quantity?: number;
  category?: string;
  subCategory?: string;
}

export interface RawMakeupOption {
  name?: string;
  price?: number;
}

export interface RawMakeupItem {
  _id?: string;
  name?: string;
  itemType?: "Makeup" | "Hair" | "Skin & Spa" | "Mehendi" | "Nail" | "Other";
  makeupType?: string;
  hairServiceType?: string;
  longevity?: string;
  styles?: string[];
  options?: RawMakeupOption[];
}

export interface RawVenueSpace {
  _id?: string;
  name?: string;
  spaceType?: string;
  environment?: "Indoor" | "Outdoor";
  capacity?: { standing?: number; sitting?: number; dining?: number };
  price?: number;
  billingUnit?: string;
}

export interface RawFullPackage {
  _id: string;
  vendorId: RawVendorPublic | string;
  vendorType: string;
  variantType?: string;
  packageGroupId: string;
  packageStatus: string;
  bookingSettings?: {
    bookingType?: "Ready-to-Book" | "Enquiry/Quote";
    paymentType?: "Free" | "Token";
    token?: { tokenType?: "Percentage" | "Fixed"; value?: number };
  };
  step1_eventAndCrew: {
    packageName: string;
    eventCategories?: string[];
    /** How long the EVENT itself runs — not setup lead time (see durationOfSetup below). */
    duration?: { minHours?: number; maxHours?: number };
    /** Hours of setup lead time needed before the event starts — a single number, not a range. */
    durationOfSetup?: number;
    crewSize?: { minPeople?: number; maxPeople?: number; roles?: string[] };
    capacity?: { minGuests?: number; maxGuests?: number };
    venueNeeds?: {
      power?: boolean;
      ac?: boolean;
      stage?: boolean;
      lighting?: boolean;
      security?: boolean;
      customText?: string;
    };
  };
  step2_productsAndPricing?: {
    setups?: RawDecoratorSetup[];
    packageItems?: RawPavPackageItem[];
    menus?: RawCatererMenu[];
    // DJArtist and MakeupArtist packages both name this field "items" with
    // different item shapes — narrow by pkg.vendorType before reading it.
    items?: RawDjItem[] | RawMakeupItem[];
    equipments?: RawDjEquipment[];
    spaces?: RawVenueSpace[];
    addOns?: RawDecoratorAddOn[];
    included?: string[];
    notIncluded?: string[];
  };
  step3_policiesAndCharges: {
    packagePricing: { price: number; billingUnit?: string; noOfPeople?: string; originalPrice?: number | null };
    // VenueProvider replaces packagePricing with this field instead — so its
    // discount, if ever set, could land under either field depending on
    // which one the vendor-side Venue Provider pricing form actually writes
    // to. originalPriceOf() below checks both.
    overallPriceOfPackage?: { price: number; billingUnit?: string; originalPrice?: number | null };
    gstInclusive?: boolean;
    gstRatePercent?: number;
    guestTiers?: { maxGuests: number; price: number }[];
    cancellationPolicy?: RawPolicySlot;
    lastMinutePolicy?: RawPolicySlot;
    generalPolicies?: RawPolicySlot[];
  };
  step4_sampleMedia?: {
    media?: RawPackageMedia[];
    // VenueProvider replaces media[] with per-space galleries instead.
    spaceMedia?: { spaceName?: string; spaceIndex?: number; media?: RawPackageMedia[] }[];
  };
  createdAt: string;
}

export interface RawPdpAvailability {
  guests?: number;
  withinCapacity?: boolean;
  date?: string;
  calendarStatus?: "Available" | "Blocked" | "Booked" | "Unknown";
  overall: boolean | null;
}

export interface RawPdpPricingPreview {
  basePrice: number | null;
  billingUnit: string | null;
  subtotal: number | null;
  gstInclusive: boolean;
  gstRatePercent: number | null;
  gstAmount: number | null;
  total: number | null;
  note: string;
}

export interface RawPdpReviewItem {
  _id: string;
  rating: number;
  comment?: string;
  customerId?: { name?: string; profilePicture?: string };
  createdAt: string;
}

export interface RawPdpReviewsSection {
  items: RawPdpReviewItem[];
  count: number;
  averageRating: number | null;
  usingVendorFallback: boolean;
}

export interface RawPackageDetailResponse {
  status: "SUCCESS";
  package: RawFullPackage;
  availability: RawPdpAvailability;
  pricingPreview: RawPdpPricingPreview;
  reviews: RawPdpReviewsSection;
}

export interface PackageDetailParams {
  date?: string;
  guests?: number;
  time?: string;
}

function toQueryString(params: object) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getPackageDetail(packageId: string, params: PackageDetailParams = {}) {
  return apiFetch<RawPackageDetailResponse>(`/customer/packages/${packageId}${toQueryString(params)}`, {
    auth: false,
  });
}

export interface RawReviewAggregate {
  averageRating: number | null;
  count: number;
  distribution: Record<string, number>;
  categoryBreakdown: { category: string; averageRating: number; count: number }[];
}

export interface RawPackageReviewsResponse {
  status: "SUCCESS";
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: RawPdpReviewItem[];
  aggregate: RawReviewAggregate;
}

export interface PackageReviewsParams {
  minRating?: number;
  sort?: "recent" | "highest" | "lowest";
  page?: number;
  limit?: number;
}

export async function getPackageReviews(packageId: string, params: PackageReviewsParams = {}) {
  return apiFetch<RawPackageReviewsResponse>(`/customer/packages/${packageId}/reviews${toQueryString(params)}`, {
    auth: false,
  });
}

export interface RawPackageGroupResponse {
  status: "SUCCESS";
  count: number;
  packageGroupId: string;
  packages: (RawFullPackage & { bookingsCount?: number })[];
  /** The variant (packageId) with the highest real booking count in this group — null if every variant is still tied at 0. */
  mostBookedVariantId: string | null;
}

/**
 * Live-only, customer-safe sibling-variants lookup (added 2026-08-17) —
 * replaces the vendor-management router's internal, unauthenticated
 * GET /packages/group/:packageGroupId, which had no packageStatus filter
 * (could leak Draft/Under Review/Deleted variants to a customer) and no
 * vendor field whitelist.
 */
export async function getPackageGroupVariants(packageGroupId: string) {
  return apiFetch<RawPackageGroupResponse>(`/customer/packages/group/${packageGroupId}`, { auth: false });
}
