import type { PackageDetail } from "@/features/customer-package-detail/types";
import { formatPrice } from "@/features/customer-vendors/utils/currency";
import type {
  CompareCellValue,
  ComparePackageColumn,
  CompareRow,
  CompareSection,
} from "../types";

/** Thumbnails the "Sample decoration" strip shows before collapsing into "+N". */
const MAX_SAMPLE_IMAGES = 3;
/** Add-on cards per column before the "+N More" line, as in the design. */
const MAX_ADDON_CARDS = 4;

/** One compared package: its detail plus the note saved with it on the wishlist. */
export interface ComparisonInput {
  detail: PackageDetail;
  note: string;
}

const EMPTY: CompareCellValue = { kind: "empty" };

function text(value: string | undefined | null, tone?: "success"): CompareCellValue {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "—") return EMPTY;
  return tone ? { kind: "text", text: trimmed, tone } : { kind: "text", text: trimmed };
}

/** The variant actually being compared — the package the customer saved. */
function variantOf(detail: PackageDetail) {
  return detail.variants.find((variant) => variant.id === detail.defaultVariantId) ?? detail.variants[0];
}

export function priceOf(detail: PackageDetail) {
  return variantOf(detail)?.price ?? 0;
}

export function toColumn(detail: PackageDetail): ComparePackageColumn {
  return {
    packageId: detail.id,
    title: detail.title,
    variantLabel: variantOf(detail)?.label,
    categoryLabel: detail.categoryLabel,
    categoryIcon: detail.categoryIcon,
    categoryGradientFrom: detail.categoryGradientFrom,
    image: detail.gallery[0]?.image,
    rating: detail.rating,
    reviewCount: detail.reviewCount,
    price: priceOf(detail),
    href: `/packages/${detail.id}`,
  };
}

/**
 * The booking commitment, from the package's own booking settings: a token
 * amount when one is configured, otherwise whether it can be booked outright
 * or has to go through an enquiry.
 */
function tokenAmountText(detail: PackageDetail) {
  if (detail.pricing.tokenAmount > 0) return `Booking amount ${formatPrice(detail.pricing.tokenAmount)}`;
  return detail.instantBooking ? "No Booking Amount Needed" : "Inquiry Needed";
}

function responseTimeCell(detail: PackageDetail): CompareCellValue {
  if (detail.instantBooking) return { kind: "text", text: "Instant Confirmation", tone: "success" };
  const repliesIn = detail.vendor.repliesIn;
  return repliesIn ? { kind: "text", text: `Usually responds within ${repliesIn}` } : EMPTY;
}

/**
 * Decorator setups carry Indoor/Outdoor/Both on their "Setup type" detail
 * (referenceStyle upstream — see getPackageDetail's comment on that field).
 * Vendor types without the concept simply have no such detail, and the row
 * is dropped rather than answered "No" on missing data.
 */
function setupTypesOf(detail: PackageDetail) {
  return detail.includedItems.flatMap((entry) =>
    entry.details
      .filter((item) => item.label.toLowerCase() === "setup type")
      .flatMap((item) => [item.value, ...(item.allValues ?? [])].map((value) => value.toLowerCase()))
  );
}

function supportCell(detail: PackageDetail, keyword: "indoor" | "outdoor"): CompareCellValue {
  const types = setupTypesOf(detail);
  if (types.length === 0) return EMPTY;
  const supported = types.some((type) => type.includes(keyword) || type.includes("both"));
  return supported ? { kind: "text", text: "Yes", tone: "success" } : { kind: "text", text: "No" };
}

/** Drops a row nothing in the comparison can answer. */
function keep(rows: (CompareRow | null)[]): CompareRow[] {
  return rows.filter(
    (row): row is CompareRow => row !== null && row.cells.some((cell) => cell.kind !== "empty")
  );
}

function row(id: string, label: string, cells: CompareCellValue[]): CompareRow {
  return { id, label, cells };
}

/**
 * Marks the best cell in a numeric row. Only a single, strict winner is
 * badged — a tie means no package actually stands out.
 */
function withWinner(
  target: CompareRow,
  values: (number | null)[],
  pick: "min" | "max",
  badge: string
): CompareRow {
  const scored = values
    .map((value, index) => ({ value, index }))
    .filter((entry): entry is { value: number; index: number } => entry.value != null);
  if (scored.length < 2) return target;

  const best = scored.reduce((a, b) => {
    if (pick === "min") return b.value < a.value ? b : a;
    return b.value > a.value ? b : a;
  });
  const isTie = scored.filter((entry) => entry.value === best.value).length > 1;
  return isTie ? target : { ...target, winner: { index: best.index, badge } };
}

function overviewSection(inputs: ComparisonInput[]): CompareSection {
  const details = inputs.map((input) => input.detail);
  const setupCounts = details.map((detail) => detail.includedItems.length || null);
  const prices = details.map((detail) => priceOf(detail) || null);

  const rows = keep([
    row("token", "Token amount", details.map((detail) => text(tokenAmountText(detail)))),
    row("response", "Response Time", details.map(responseTimeCell)),
    withWinner(
      row(
        "setups",
        "Number of setups",
        details.map((detail) => (detail.includedItems.length ? text(String(detail.includedItems.length)) : EMPTY))
      ),
      setupCounts,
      "max",
      "MOST SETUPS"
    ),
    row(
      "setup-areas",
      "Setup Areas",
      details.map((detail) => text(detail.includedItems.map((entry) => entry.title).join(", ")))
    ),
    row("setup-time", "Setup Time", details.map((detail) => text(detail.summary.setupTime))),
    row("indoor", "Indoor support", details.map((detail) => supportCell(detail, "indoor"))),
    row("outdoor", "Outdoor support", details.map((detail) => supportCell(detail, "outdoor"))),
    row("service-area", "Service Area", details.map((detail) => text(detail.summary.serviceArea))),
    row("crew", "Crew size", details.map((detail) => text(detail.summary.crewSize))),
    row(
      "samples",
      "Sample decoration",
      details.map((detail) => {
        const images = detail.gallery.map((item) => item.image).filter((src): src is string => Boolean(src));
        if (images.length === 0) return EMPTY;
        return {
          kind: "images",
          images: images.slice(0, MAX_SAMPLE_IMAGES),
          extraCount: Math.max(0, images.length - MAX_SAMPLE_IMAGES),
        };
      })
    ),
    withWinner(
      row(
        "price",
        "Package price",
        details.map((detail) => (priceOf(detail) ? text(formatPrice(priceOf(detail))) : EMPTY))
      ),
      prices,
      "min",
      "BEST PRICE"
    ),
  ]);

  return { id: "overview", title: "PACKAGE OVERVIEW", rows };
}

/**
 * One row per policy title, in the order the titles first appear, so the same
 * policy lines up across packages even when a vendor skipped one.
 */
function policiesSection(inputs: ComparisonInput[]): CompareSection {
  const details = inputs.map((input) => input.detail);
  const titles: string[] = [];
  details.forEach((detail) =>
    detail.policies.forEach((policy) => {
      if (!titles.includes(policy.title)) titles.push(policy.title);
    })
  );

  const policyRows = titles.map((title, index) =>
    row(
      `policy-${index}`,
      title,
      details.map((detail) => text(detail.policies.find((policy) => policy.title === title)?.description))
    )
  );

  const overtime: CompareRow = {
    ...row(
      "overtime",
      "Over time charges",
      details.map((detail) =>
        detail.pricing.overtimeChargeRate
          ? text(`${formatPrice(detail.pricing.overtimeChargeRate)}${detail.pricing.overtimeBillingUnit ? `/${detail.pricing.overtimeBillingUnit}` : ""}`)
          : EMPTY
      )
    ),
    labelTone: "danger",
  };

  return { id: "policies", title: "CANCELLATION POLICIES", rows: keep([...policyRows, overtime]) };
}

/** Turns the compared packages into the sections the design lays out, in order. */
export function buildSections(inputs: ComparisonInput[]): CompareSection[] {
  const details = inputs.map((input) => input.detail);

  const sections: CompareSection[] = [
    {
      id: "notes",
      title: "BOOKING NOTES",
      // Always rendered: the design shows the panel on every column, empty
      // ones included, so a package with no note still reads as "no note".
      rows: [row("note", "Notes", inputs.map((input) => ({ kind: "note", text: input.note })))],
    },
    {
      id: "about",
      title: "ABOUT OF PACKAGE",
      // aboutText is the raw step2_productsAndPricing.included array (see
      // getPackageDetail.ts/parseAboutText.ts) — joined here since this
      // compare cell just needs a plain preview string, not the bullet/
      // paragraph structure the PDP's About section renders it as.
      rows: keep([row("about", "Package Description", details.map((detail) => text(detail.aboutText.join(" "))))]),
    },
    overviewSection(inputs),
    {
      id: "included",
      title: "WHAT'S INCLUDED",
      rows: keep([
        {
          id: "included-cards",
          cells: details.map((detail) =>
            detail.includedItems.length ? { kind: "setups", setups: detail.includedItems } : EMPTY
          ),
        },
      ]),
    },
    {
      id: "addons",
      title: "ADDONS",
      rows: keep([
        {
          id: "addon-cards",
          cells: details.map((detail) =>
            detail.addons.length
              ? {
                  kind: "addons",
                  addons: detail.addons.slice(0, MAX_ADDON_CARDS),
                  extraCount: Math.max(0, detail.addons.length - MAX_ADDON_CARDS),
                }
              : EMPTY
          ),
        },
      ]),
    },
    {
      id: "excluded",
      title: "NOT INCLUDED IN PACKAGE",
      rows: keep([
        row(
          "exclusions",
          "Exclusions",
          details.map((detail) =>
            detail.notIncluded?.length ? { kind: "list", items: detail.notIncluded } : EMPTY
          )
        ),
      ]),
    },
    {
      id: "vendor",
      title: "VENDOR'S & REVIEW",
      rows: keep([
        row(
          "events",
          "Events Completed",
          details.map((detail) => (detail.vendor.eventsCount ? text(String(detail.vendor.eventsCount)) : EMPTY))
        ),
        row(
          "experience",
          "Year's Experience",
          details.map((detail) =>
            detail.vendor.yearsExperience
              ? text(`${detail.vendor.yearsExperience} ${detail.vendor.yearsExperience === 1 ? "Year" : "Years"}`)
              : EMPTY
          )
        ),
        row("rating", "Rating", details.map((detail) => (detail.rating ? text(String(detail.rating)) : EMPTY))),
        row(
          "reviews",
          "Reviews",
          details.map((detail) => (detail.reviewCount ? text(String(detail.reviewCount)) : EMPTY))
        ),
      ]),
    },
    policiesSection(inputs),
  ];

  return sections.filter((section) => section.rows.length > 0);
}
