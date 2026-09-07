import type {
  PackageDetail,
  PackageVariant,
  GalleryImage,
  IncludedItemEntry,
  IncludedItemDetail,
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
import { CATEGORY_META } from "@/lib/categoryMeta";
import { formatMinutesLabel } from "@/lib/formatMinutes";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";
import { ApiError } from "@/lib/apiClient";
import { mockPackageDetail } from "../data/mockPackageDetailData";
import { formatPrice } from "../utils/formatPrice";

export class PackageNotFoundError extends Error {}

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

// VenueProvider prices via overallPriceOfPackage, not packagePricing (see
// priceOf() above) — a discount for that vendor type could land under
// either field depending on which one the vendor-side pricing form actually
// writes to, so check both rather than assuming.
function originalPriceOf(pkg: RawFullPackage): number | undefined {
  const charges = pkg.step3_policiesAndCharges;
  return charges?.packagePricing?.originalPrice ?? charges?.overallPriceOfPackage?.originalPrice ?? undefined;
}

// TEMPORARY: backend confirmed durationOfSetup is stored in HOURS (both
// vendor forms label it that way), but several real values (e.g. 60) exceed
// even the Decorator form's own 24-hour dropdown max and read as implausible
// setup lead times in hours. Per explicit instruction, treating the raw
// number as MINUTES for display for now — revert to plain hours once
// backend/product clarifies or the underlying data is cleaned up.
function formatSetupTime(durationOfSetupMinutes: number): string {
  return `${formatMinutesLabel(durationOfSetupMinutes)} before start`;
}

function mapVariant(pkg: RawFullPackage, mostBookedVariantId?: string | null): PackageVariant {
  const setups = pkg.step2_productsAndPricing?.setups ?? [];
  return {
    id: pkg._id,
    label: pkg.variantType || "Standard",
    image: pkg.step4_sampleMedia?.media?.[0]?.url,
    setupsCount: setups.length,
    itemsCount: setups.reduce((sum, s) => sum + (s.items?.length ?? 0), 0),
    description: setups[0]?.description ?? "",
    price: priceOf(pkg),
    originalPrice: originalPriceOf(pkg),
    badge: mostBookedVariantId && pkg._id === mostBookedVariantId ? "Most booked" : undefined,
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
    { flag: needs.lighting, id: "req-lighting", label: "Lighting", icon: "lighting" },
    { flag: needs.security, id: "req-security", label: "Security", icon: "security" },
  ];
  const requirements = entries.filter((e) => e.flag).map(({ id, label, icon }) => ({ id, label, icon }));
  if (needs.customText?.trim()) {
    requirements.push({ id: "req-custom", label: needs.customText.trim(), icon: "room" });
  }
  return requirements;
}

function mapIncludedItemsDecorator(pkg: RawFullPackage): IncludedItemEntry[] {
  const setups = pkg.step2_productsAndPricing?.setups ?? [];
  return setups.map((setup, i) => {
    const structures = setup.structuresIncluded ?? [];
    const themes = setup.themes ?? [];
    const items = setup.items ?? [];

    const details: IncludedItemDetail[] = [
      { label: "Decorating", value: setup.decoratingWhat || "—" },
    ];
    // Setup type (Indoor/Outdoor) has no backing field on a setup — dropped
    // rather than shown as a placeholder, same call as PackageSummary.tsx.
    if (structures.length > 0) {
      details.push({
        label: "Structures Included",
        value: structures[0],
        moreCount: structures.length > 1 ? structures.length - 1 : undefined,
      });
    }
    if (themes.length > 0) {
      details.push({
        label: "Theme",
        value: themes[0],
        moreCount: themes.length > 1 ? themes.length - 1 : undefined,
      });
    }

    return {
      id: setup._id ?? `setup-${i}`,
      image: setup.setupPhoto,
      title: setup.name ?? "Setup",
      details,
      themeOptions: themes.length > 0 ? themes : undefined,
      price: setup.price ?? 0,
      items: items.map((line, idx) => ({
        id: `${setup._id ?? `setup-${i}`}-item-${idx}`,
        label: line.name ?? "Item",
        qty: line.qty ?? 1,
        originalQty: line.qty ?? 1,
        volumeOptions: line.volume ? VOLUME_OPTIONS : undefined,
        volume: line.volume || undefined,
        originalVolume: line.volume || undefined,
      })),
      // An item offering color choices counts as customer-facing customisation.
      customisationsCount: items.filter((line) => (line.colors?.length ?? 0) > 0).length,
    };
  });
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

function formatDimensions(dimensions?: { length?: number; breadth?: number; height?: number; unit?: string }): string {
  const { length, breadth, height, unit } = dimensions ?? {};
  const parts = [length, breadth, height].filter((v): v is number => v != null);
  if (parts.length === 0) return "—";
  return `${parts.join("×")}${unit ? ` ${unit}` : ""}`;
}

function mapAddons(pkg: RawFullPackage): AddonItem[] {
  const addOns = pkg.step2_productsAndPricing?.addOns ?? [];
  return addOns.map((addon, i) => {
    // colourOptions deliberately left unset — physicalSpec.color is a
    // free-text string (e.g. "White, Red, Green"), not structured swatches.
    // Parsing that into fake hex colors would be guessing colors that were
    // never actually specified. Shown as a plain "Color" detail row instead
    // until there's a real colourOptions field on the schema (flagged to
    // backend, pending a product decision).
    const details: IncludedItemDetail[] = [
      { label: "Setup type", value: addon.productUsage || "—" },
      { label: "Dimensions", value: formatDimensions(addon.physicalSpec?.dimensions) },
    ];
    if (addon.physicalSpec?.color) {
      details.push({ label: "Color", value: addon.physicalSpec.color });
    }

    return {
      id: addon._id ?? `addon-${i}`,
      category: addon.category || addon.addOnType || "Add-on",
      image: addon.mediaUrls?.[0],
      title: addon.name ?? "Add-on",
      subCategory: addon.subCategory ?? "",
      qtyLabel: addon.quantity ? `${addon.quantity} unit${addon.quantity > 1 ? "s" : ""}` : "1 unit",
      price: addon.price ?? 0,
      unitLabel: addon.billingUnit ? `/${addon.billingUnit}` : "",
      description: addon.description,
      details,
    };
  });
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
    if (group.packages.length) {
      variants = group.packages.map((groupPkg) => mapVariant(groupPkg, group.mostBookedVariantId));
    }
  } catch {
    // Sibling variants are a nice-to-have — fall back to just this one package.
  }

  // total: 0 here (not vendor?.reviewsCount) — that field is the vendor's
  // review count across ALL their packages, not this one, and items is
  // empty either way. Reporting a nonzero total with no items would make
  // PackageDetailPage's `reviews.total > 0` gate show an empty Reviews
  // section instead of hiding it.
  const reviews = await buildReviews(packageId).catch(
    (): ReviewsSummary => ({
      average: 0,
      total: 0,
      breakdown: [],
      categories: [],
      filters: [{ id: "all", label: "All" }],
      items: [],
    })
  );

  const eventCategories = pkg.step1_eventAndCrew?.eventCategories ?? [];
  const crew = pkg.step1_eventAndCrew?.crewSize;
  const durationOfSetup = pkg.step1_eventAndCrew?.durationOfSetup;
  const price = priceOf(pkg);
  const slug = VENDOR_TYPE_TO_CATEGORY[pkg.vendorType] ?? "";
  const categoryMeta = CATEGORY_META[slug];
  const setups = pkg.step2_productsAndPricing?.setups ?? [];

  return {
    id: pkg._id,
    categoryLabel: VENDOR_CATEGORIES.find((c) => c.id === slug)?.label ?? pkg.vendorType,
    categoryIcon: categoryMeta?.icon,
    categoryGradientFrom: categoryMeta?.gradientFrom,
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
      serviceAreaList: vendor?.serviceAreas?.length ? vendor.serviceAreas : vendor?.city ? [vendor.city] : undefined,
      // durationOfSetup is lead time needed before the event starts — a
      // single number, not a range (step1_eventAndCrew.duration is a
      // different field entirely: how long the EVENT itself runs). See
      // formatSetupTime's comment for the current minutes-vs-hours caveat.
      setupTime: durationOfSetup ? formatSetupTime(durationOfSetup) : "—",
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
      teamAndEquipmentCharge: pkg.step3_policiesAndCharges?.teamAndEquipment?.price ?? 0,
      teamAndEquipmentBillingUnit: pkg.step3_policiesAndCharges?.teamAndEquipment?.billingUnit,
      overtimeChargeRate: pkg.step3_policiesAndCharges?.overtimeCharges?.price ?? 0,
      overtimeBillingUnit: pkg.step3_policiesAndCharges?.overtimeCharges?.billingUnit,
    },
  };
}
