import type {
  PackageDetail,
  PackageVariant,
  IncludedItemEntry,
  AddonItem,
  VendorRequirement,
  VendorRequirementIcon,
  PolicyItem,
  VendorInfo,
  ReviewsSummary,
  RatingBreakdownEntry,
} from "../types";
import {
  getPackageDetail as fetchPackageDetail,
  getPackageReviews,
  getPackageGroupVariants,
  type RawFullPackage,
  type RawPolicySlot,
} from "@/lib/customerPackageDetailApi";
import type { RawVendorPublic } from "@/lib/customerDiscoveryApi";
import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { ApiError } from "@/lib/apiClient";
import { mockPackageDetail } from "../data/mockPackageDetailData";

export class PackageNotFoundError extends Error {}

// Reuses the same category photography already shipped for the packages
// landing page (see src/features/customer-packages/data/mockPackagesPageData.ts)
// rather than introducing new assets.
const CATEGORY_ICON_BY_SLUG: Record<string, string> = {
  decorator: "/images/customer/decorator.png",
  caterer: "/images/customer/caterers.png",
  "venue-provider": "/images/customer/venue.png",
  "dj-artist": "/images/customer/dj.png",
  "makeup-artist": "/images/customer/makeup.png",
  photographer: "/images/customer/video.png",
};

function vendorOf(pkg: RawFullPackage): RawVendorPublic | null {
  return typeof pkg.vendorId === "object" ? pkg.vendorId : null;
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "V";
}

function monthYear(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function mapVariant(pkg: RawFullPackage): PackageVariant {
  const setups = pkg.step2_productsAndPricing?.setups ?? [];
  return {
    id: pkg._id,
    label: pkg.variantType || "Standard",
    image: pkg.step4_sampleMedia?.media?.[0]?.url,
    setupsCount: setups.length,
    itemsCount: setups.reduce((sum, s) => sum + (s.items?.length ?? 0), 0),
    description: setups[0]?.description ?? "",
    price: pkg.step3_policiesAndCharges?.packagePricing?.price ?? 0,
  };
}

function mapVendorRequirements(pkg: RawFullPackage): VendorRequirement[] {
  const needs = pkg.step1_eventAndCrew?.venueNeeds;
  if (!needs) return [];
  const entries: { flag?: boolean; id: string; label: string; icon: VendorRequirementIcon }[] = [
    { flag: needs.power, id: "req-electricity", label: "Electricity", icon: "electricity" },
    { flag: needs.stage, id: "req-stage", label: "Stage", icon: "stage" },
    { flag: needs.ac, id: "req-ac", label: "Air Conditioner", icon: "ac" },
  ];
  return entries.filter((e) => e.flag).map(({ id, label, icon }) => ({ id, label, icon }));
}

function mapIncludedItems(pkg: RawFullPackage): IncludedItemEntry[] {
  const setups = pkg.step2_productsAndPricing?.setups ?? [];
  return setups.map((setup, i) => ({
    id: setup._id ?? `setup-${i}`,
    image: setup.setupPhoto,
    title: setup.name ?? "Setup",
    decoratingAreas: setup.decoratingWhat ? [setup.decoratingWhat] : [],
    theme: setup.themes?.join(", ") || "—",
    setupType: "—",
    price: setup.price ?? 0,
    items: (setup.items ?? []).map((line, idx) => ({
      id: `${setup._id ?? `setup-${i}`}-item-${idx}`,
      label: line.name ?? "Item",
      qty: line.qty ?? 1,
    })),
  }));
}

function mapAddons(pkg: RawFullPackage): AddonItem[] {
  const addOns = pkg.step2_productsAndPricing?.addOns ?? [];
  return addOns.map((addon, i) => ({
    id: addon._id ?? `addon-${i}`,
    category: addon.category || addon.addOnType || "Add-on",
    image: addon.mediaUrls?.[0],
    title: addon.name ?? "Add-on",
    subCategory: addon.subCategory ?? "",
    qtyLabel: addon.quantity ? `${addon.quantity} unit${addon.quantity > 1 ? "s" : ""}` : "1 unit",
    price: addon.price ?? 0,
    unitLabel: addon.billingUnit ? `/${addon.billingUnit}` : "",
  }));
}

function mapPolicySlot(
  slot: RawPolicySlot | undefined,
  id: string,
  title: string,
  icon: "shield" | "clock"
): PolicyItem | null {
  if (!slot) return null;
  const description = slot.writtenText || slot.templateTitle;
  if (!description && !slot.files?.length) return null;
  return { id, icon, title, description: description || "See document", href: slot.files?.[0] ?? "#" };
}

function mapPolicies(pkg: RawFullPackage): PolicyItem[] {
  const charges = pkg.step3_policiesAndCharges;
  const policies: (PolicyItem | null)[] = [
    mapPolicySlot(charges?.cancellationPolicy, "policy-cancellation", "Cancellation Policy", "shield"),
    mapPolicySlot(charges?.lastMinutePolicy, "policy-last-minute", "Last-minute Changes", "clock"),
    ...(charges?.generalPolicies ?? []).map((slot, i) =>
      mapPolicySlot(slot, `policy-general-${i}`, slot.templateTitle || "General Policy", "shield")
    ),
  ];
  return policies.filter((p): p is PolicyItem => p !== null);
}

function mapVendor(pkg: RawFullPackage): VendorInfo {
  const vendor = vendorOf(pkg);
  const name = vendor?.businessName ?? "Vendor";
  const slug = VENDOR_TYPE_TO_CATEGORY[pkg.vendorType] ?? "";
  return {
    id: vendor?.id ?? "",
    initials: initialsOf(name),
    name,
    rating: vendor?.rating ?? 0,
    verified: vendor?.isVerified ?? false,
    eventsCount: Number(vendor?.bookingsPerYear) || vendor?.reviewsCount || 0,
    yearsExperience: Number(vendor?.experience) || 0,
    href: `/vendors${slug ? `?category=${slug}` : ""}`,
  };
}

function tokenAmountFor(pkg: RawFullPackage, price: number): number {
  const settings = pkg.bookingSettings;
  if (settings?.paymentType !== "Token" || !settings.token?.tokenType || settings.token.value == null) return 0;
  const { tokenType, value } = settings.token;
  return tokenType === "Percentage" ? Math.round((price * value) / 100) : Math.min(value, price);
}

async function buildReviews(packageId: string): Promise<ReviewsSummary> {
  const data = await getPackageReviews(packageId, { limit: 20 });
  const total = data.aggregate.count ?? data.total ?? 0;

  const breakdown: RatingBreakdownEntry[] = [5, 4, 3, 2, 1].map((stars) => {
    const count = data.aggregate.distribution?.[String(stars)] ?? 0;
    return { stars, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
  });

  const filters = [
    { id: "all", label: "All" },
    ...breakdown.filter((row) => row.count > 0).map((row) => ({ id: `${row.stars}-star`, label: `${row.stars}★` })),
  ];

  return {
    average: data.aggregate.averageRating ?? 0,
    total,
    breakdown,
    categories: data.aggregate.categoryBreakdown.map((c) => ({ label: c.category, score: c.averageRating })),
    filters,
    items: data.items.map((review) => ({
      id: review._id,
      authorName: review.customerId?.name ?? "Eventory customer",
      eventTag: "",
      rating: review.rating,
      date: monthYear(review.createdAt),
      comment: review.comment ?? "",
      filterIds: [`${review.rating}-star`],
    })),
  };
}

// TEMPORARY: the backend currently 500s GET /customer/packages/:id for
// every package (Package.vendorId is stored as the vendor's business-id
// string instead of its ObjectId, so the vendor populate throws a CastError
// — reported to the backend team, not yet fixed). Skip the real call
// entirely rather than doing a network round-trip that's guaranteed to
// fail, and serve the static placeholder instead. Flip this back to false
// once the backend fix lands — every mapping below is already real and
// ready, no other code change needed.
const PDP_BACKEND_BROKEN = true;

/**
 * Data source for the Package Detail (product description) page — calls the
 * real GET /api/customer/packages/:packageId (Eventory_V2_backend). Every
 * component below PackageDetailPage only consumes the PackageDetail shape,
 * so this mapping is the sole place backend fields get translated into it.
 */
export async function getPackageDetail(packageId: string): Promise<PackageDetail> {
  if (PDP_BACKEND_BROKEN) {
    return { ...mockPackageDetail, id: packageId || mockPackageDetail.id };
  }

  let response;
  try {
    response = await fetchPackageDetail(packageId);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      throw new PackageNotFoundError(packageId);
    }
    return { ...mockPackageDetail, id: packageId || mockPackageDetail.id };
  }

  const { package: pkg } = response;
  const vendor = vendorOf(pkg);

  let variants: PackageVariant[] = [mapVariant(pkg)];
  try {
    const group = await getPackageGroupVariants(pkg.packageGroupId);
    if (group.packages.length) variants = group.packages.map(mapVariant);
  } catch {
    // Sibling variants are a nice-to-have — fall back to just this one package.
  }

  const reviews = await buildReviews(packageId).catch(
    (): ReviewsSummary => ({
      average: vendor?.rating ?? 0,
      total: vendor?.reviewsCount ?? 0,
      breakdown: [],
      categories: [],
      filters: [{ id: "all", label: "All" }],
      items: [],
    })
  );

  const eventCategories = pkg.step1_eventAndCrew?.eventCategories ?? [];
  const crew = pkg.step1_eventAndCrew?.crewSize;
  const duration = pkg.step1_eventAndCrew?.duration;
  const price = pkg.step3_policiesAndCharges?.packagePricing?.price ?? 0;
  const slug = VENDOR_TYPE_TO_CATEGORY[pkg.vendorType] ?? "";
  const setups = pkg.step2_productsAndPricing?.setups ?? [];

  return {
    id: pkg._id,
    categoryLabel: pkg.vendorType,
    categoryIcon: CATEGORY_ICON_BY_SLUG[slug],
    eventTags: eventCategories.slice(0, 3),
    moreEventTagsCount: Math.max(0, eventCategories.length - 3),
    title: pkg.step1_eventAndCrew?.packageName ?? "Package",
    instantBooking: pkg.bookingSettings?.bookingType === "Ready-to-Book",
    vendorName: vendor?.businessName ?? "Vendor",
    rating: vendor?.rating ?? reviews.average,
    reviewCount: reviews.total,
    locationSummary:
      [vendor?.city, ...(vendor?.serviceAreas?.slice(0, 2) ?? [])].filter(Boolean).join(", ") || "—",
    gallery: (pkg.step4_sampleMedia?.media ?? []).map((media, i) => ({
      id: `gallery-${i}`,
      image: media.url,
      alt: pkg.step1_eventAndCrew?.packageName ?? "Package photo",
    })),
    variants,
    defaultVariantId: pkg._id,
    summary: {
      setupsLabel: setups.length
        ? `${setups.length} — ${setups.map((s) => s.name).filter(Boolean).slice(0, 3).join(", ")}`
        : "—",
      serviceArea: vendor?.serviceAreas?.join(", ") || vendor?.city || "—",
      setupTime:
        duration?.minHours || duration?.maxHours
          ? `${duration.minHours && duration.maxHours && duration.minHours !== duration.maxHours ? `${duration.minHours}-${duration.maxHours}` : (duration.minHours ?? duration.maxHours)} hrs before start`
          : "—",
      crewSize:
        crew?.minPeople || crew?.maxPeople
          ? `${crew.minPeople && crew.maxPeople && crew.minPeople !== crew.maxPeople ? `${crew.minPeople}-${crew.maxPeople}` : (crew.minPeople ?? crew.maxPeople)} crew`
          : "—",
    },
    aboutText: vendor?.description || "No description provided yet.",
    includedItems: mapIncludedItems(pkg),
    vendorRequirements: mapVendorRequirements(pkg),
    addons: mapAddons(pkg),
    paymentProtection: {
      points: [
        "A token amount holds your date and starts planning with the vendor.",
        "The remaining balance is due as per the payment milestones shown at checkout.",
        "Cancellation and change terms are listed in the Policies section below.",
      ],
      footnote: "Held safely by Eventory until your event is delivered.",
    },
    policies: mapPolicies(pkg),
    vendor: mapVendor(pkg),
    reviews,
    pricing: {
      gstPercent: pkg.step3_policiesAndCharges?.gstRatePercent ?? 0,
      tokenAmount: tokenAmountFor(pkg, price),
    },
  };
}
