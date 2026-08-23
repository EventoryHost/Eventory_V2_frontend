import type {
  PackageDetail,
  PackageVariant,
  GalleryImage,
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
  type RawDjItem,
  type RawMakeupItem,
} from "@/lib/customerPackageDetailApi";
import { VOLUME_OPTIONS } from "../data/workshopCategories";
import type { RawVendorPublic } from "@/lib/customerDiscoveryApi";
import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { ApiError } from "@/lib/apiClient";
import { mockPackageDetail } from "../data/mockPackageDetailData";
import { formatPrice } from "../utils/formatPrice";

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

// VenueProvider packages price via overallPriceOfPackage instead of
// packagePricing (see step3_policiesAndCharges discriminator override).
function priceOf(pkg: RawFullPackage): number {
  if (pkg.vendorType === "VenueProvider") {
    return pkg.step3_policiesAndCharges?.overallPriceOfPackage?.price ?? 0;
  }
  return pkg.step3_policiesAndCharges?.packagePricing?.price ?? 0;
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
    price: priceOf(pkg),
  };
}

// VenueProvider packages replace the top-level media[] gallery with a
// per-space spaceMedia[] gallery (see step4_sampleMedia discriminator override).
function mapGallery(pkg: RawFullPackage): GalleryImage[] {
  const packageName = pkg.step1_eventAndCrew?.packageName ?? "Package photo";
  const media =
    pkg.vendorType === "VenueProvider"
      ? (pkg.step4_sampleMedia?.spaceMedia ?? []).flatMap((space) => space.media ?? [])
      : (pkg.step4_sampleMedia?.media ?? []);
  return media.map((item, i) => ({ id: `gallery-${i}`, image: item.url, alt: packageName }));
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

function mapIncludedItemsDecorator(pkg: RawFullPackage): IncludedItemEntry[] {
  const setups = pkg.step2_productsAndPricing?.setups ?? [];
  return setups.map((setup, i) => ({
    id: setup._id ?? `setup-${i}`,
    image: setup.setupPhoto,
    title: setup.name ?? "Setup",
    details: [
      { label: "Decorating", value: setup.decoratingWhat || "—" },
      { label: "Setup type", value: "—" },
    ],
    themeOptions: setup.themes && setup.themes.length > 0 ? setup.themes : undefined,
    price: setup.price ?? 0,
    items: (setup.items ?? []).map((line, idx) => ({
      id: `${setup._id ?? `setup-${i}`}-item-${idx}`,
      label: line.name ?? "Item",
      qty: line.qty ?? 1,
      originalQty: line.qty ?? 1,
      volumeOptions: line.volume ? VOLUME_OPTIONS : undefined,
      volume: line.volume || undefined,
      originalVolume: line.volume || undefined,
    })),
  }));
}

// PAV packages have no per-item price or sub-item list (pricing/checklist is
// package-level) — IncludedItemCard skips those rows when price is 0 / items
// is empty rather than showing fake ₹0 / an empty checklist.
function mapIncludedItemsPav(pkg: RawFullPackage): IncludedItemEntry[] {
  const items = pkg.step2_productsAndPricing?.packageItems ?? [];
  return items.map((item, i) => ({
    id: item._id ?? `item-${i}`,
    title: item.itemType || "Item",
    details: [
      { label: "Style", value: item.contentDetails?.style || item.contentDetails?.categories?.join(", ") || "—" },
      { label: "Quantity", value: item.contentDetails?.quantity != null ? String(item.contentDetails.quantity) : "—" },
      { label: "Delivery", value: item.logisticsAndHandover?.deliveryTimeline || "—" },
    ],
    price: 0,
    items: [],
  }));
}

function mapIncludedItemsCaterer(pkg: RawFullPackage): IncludedItemEntry[] {
  const menus = pkg.step2_productsAndPricing?.menus ?? [];
  return menus.map((menu, i) => {
    const id = menu._id ?? `menu-${i}`;
    const foodItems = Object.values(menu.items ?? {})
      .flat()
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    return {
      id,
      title: menu.name || menu.type || "Menu",
      details: [
        { label: "Meal", value: menu.type || "—" },
        { label: "Service style", value: menu.serviceStyle?.join(", ") || "—" },
        { label: "Per plate", value: menu.perPlatePrice ? formatPrice(menu.perPlatePrice) : "—" },
      ],
      price: menu.perPlatePrice ?? 0,
      items: foodItems.map((food, idx) => ({
        id: `${id}-item-${idx}`,
        label: food.name ?? "Item",
        qty: 1,
        originalQty: 1,
      })),
    };
  });
}

// DJ performance items carry no per-item price or checklist of their own —
// the vendor's equipment list is the closest thing to a checklist, so it's
// attached to the first performance card (or its own card if there are no
// performance items to attach it to).
function mapIncludedItemsDj(pkg: RawFullPackage): IncludedItemEntry[] {
  const items = (pkg.step2_productsAndPricing?.items as RawDjItem[] | undefined) ?? [];
  const equipment = pkg.step2_productsAndPricing?.equipments ?? [];
  const equipmentLines = equipment.map((eq, idx) => ({
    id: eq._id ?? `equipment-${idx}`,
    label: eq.name ?? "Equipment",
    qty: eq.quantity ?? 1,
    originalQty: eq.quantity ?? 1,
  }));

  if (items.length === 0) {
    return equipmentLines.length
      ? [{ id: "dj-equipment", title: "Equipment", details: [], price: 0, items: equipmentLines }]
      : [];
  }

  return items.map((item, i) => ({
    id: item._id ?? `dj-item-${i}`,
    title: item.name || item.performanceType || "Performance",
    details: [
      { label: "Type", value: item.performanceType || "—" },
      { label: "Genre", value: item.contentDetails?.genreOfMusic?.join(", ") || "—" },
      { label: "Language", value: item.contentDetails?.language?.join(", ") || "—" },
    ],
    price: 0,
    items: i === 0 ? equipmentLines : [],
  }));
}

function mapIncludedItemsMakeup(pkg: RawFullPackage): IncludedItemEntry[] {
  const items = (pkg.step2_productsAndPricing?.items as RawMakeupItem[] | undefined) ?? [];
  return items.map((item, i) => {
    const id = item._id ?? `makeup-item-${i}`;
    const options = item.options ?? [];
    return {
      id,
      title: item.name || item.itemType || "Service",
      details: [
        { label: "Type", value: item.itemType || "—" },
        { label: "Style", value: item.styles?.join(", ") || item.makeupType || item.hairServiceType || "—" },
        { label: "Longevity", value: item.longevity || "—" },
      ],
      price: options.reduce((sum, opt) => sum + (opt.price ?? 0), 0),
      items: options.map((opt, idx) => ({
        id: `${id}-opt-${idx}`,
        label: opt.name ?? "Option",
        qty: 1,
        originalQty: 1,
      })),
    };
  });
}

function mapIncludedItemsVenue(pkg: RawFullPackage): IncludedItemEntry[] {
  const spaces = pkg.step2_productsAndPricing?.spaces ?? [];
  return spaces.map((space, i) => {
    const capacity = space.capacity;
    const capacityLabel = capacity
      ? [
          capacity.standing ? `${capacity.standing} standing` : null,
          capacity.sitting ? `${capacity.sitting} sitting` : null,
          capacity.dining ? `${capacity.dining} dining` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : "";
    return {
      id: space._id ?? `space-${i}`,
      title: space.name || space.spaceType || "Space",
      details: [
        { label: "Type", value: space.spaceType || "—" },
        { label: "Environment", value: space.environment || "—" },
        { label: "Capacity", value: capacityLabel || "—" },
      ],
      price: space.price ?? 0,
      items: [],
    };
  });
}

function mapIncludedItems(pkg: RawFullPackage): IncludedItemEntry[] {
  switch (pkg.vendorType) {
    case "PAV":
      return mapIncludedItemsPav(pkg);
    case "Caterer":
      return mapIncludedItemsCaterer(pkg);
    case "DJArtist":
      return mapIncludedItemsDj(pkg);
    case "MakeupArtist":
      return mapIncludedItemsMakeup(pkg);
    case "VenueProvider":
      return mapIncludedItemsVenue(pkg);
    default:
      return mapIncludedItemsDecorator(pkg);
  }
}

function mapNotIncluded(pkg: RawFullPackage): string[] {
  return pkg.step2_productsAndPricing?.notIncluded ?? [];
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
    businessName: name,
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

/**
 * Data source for the Package Detail (product description) page — calls the
 * real GET /api/customer/packages/:packageId (Eventory_V2_backend). Every
 * component below PackageDetailPage only consumes the PackageDetail shape,
 * so this mapping is the sole place backend fields get translated into it.
 */
export async function getPackageDetail(packageId: string): Promise<PackageDetail> {
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
  const price = priceOf(pkg);
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
    gallery: mapGallery(pkg),
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
    notIncluded: mapNotIncluded(pkg),
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
