import {
  browsePackages,
  getPackagesFilters,
  type RawPackage,
} from "@/lib/customerDiscoveryApi";
import { mapPackageToListItem } from "@/features/customer-package-listing/mappers";
import { isValidImageSrc } from "@/lib/isValidImageSrc";
import type { ParsedRequest } from "./parseRequest";

// Packages for the assistant's answer, straight from GET /customer/packages
// (the same live inventory as /packages/browse) — nothing is invented.
// Strict search first; if nothing matches exactly, relax guests, then area,
// and only then budget (the customer's hardest constraint), and say so
// (Figma 4.4 "No exact match").

// Card shape (v6f4 "Help / Package card"): only what differs between
// packages. What they all share (occasion, guests, area) is the
// "understood" line above the cards.
export type HelpPackageResult = {
  id: string;
  name: string;
  vendor: string;
  /** Starting price in rupees; the card formats it and compares it to the budget. */
  price: number;
  /** The vendor's rating and review count (packages have no own rating). */
  rating: number;
  reviewCount: number;
  /** Token to hold the date; 0 = free to book. */
  token: number;
  imageUrl?: string;
};

export type FindPackagesResult = {
  cards: HelpPackageResult[];
  exact: boolean;
  /** How many cards match everything the customer asked for. */
  exactCount: number;
  /** True when budget had to be dropped and a shown package costs more. */
  overBudget: boolean;
  /** False when the occasion has no packages in the catalogue at all. */
  occasionMatched: boolean;
  /** Same-occasion count + listing link for "See all N like this". */
  seeAll?: { count: number; href: string };
};

const LIMIT = 5;

let categoriesPromise: Promise<string[]> | null = null;
function eventCategories() {
  categoriesPromise ??= getPackagesFilters()
    .then((r) => r.filters.eventCategories ?? [])
    .catch(() => {
      categoriesPromise = null;
      return [];
    });
  return categoriesPromise;
}

/** Backend event-category string for an occasion ("birthday" → "Birthday Party"). */
async function resolveCategory(key: string) {
  const all = await eventCategories();
  return (
    all.find((c) => c.toLowerCase() === key) ??
    all.find((c) => c.toLowerCase().includes(key)) ??
    all.find((c) => key.includes(c.toLowerCase()))
  );
}

/** Same rule as the package page (getPackageDetail tokenAmountFor). */
function tokenOf(pkg: RawPackage, price: number) {
  const s = pkg.bookingSettings;
  if (s?.paymentType !== "Token" || !s.token?.tokenType || s.token.value == null) return 0;
  return s.token.tokenType === "Percentage" ? Math.round((price * s.token.value) / 100) : Math.min(s.token.value, price);
}

function toCard(pkg: RawPackage): HelpPackageResult {
  const item = mapPackageToListItem(pkg);
  return {
    id: item.id,
    name: item.name,
    vendor: pkg.vendorId?.pocName ?? item.categoryLabel,
    price: item.startingPrice,
    rating: item.rating,
    reviewCount: item.reviewCount,
    token: tokenOf(pkg, item.startingPrice),
    imageUrl: isValidImageSrc(item.image) ? item.image : undefined,
  };
}

export async function findPackages(
  req: ParsedRequest,
): Promise<FindPackagesResult> {
  const eventCategory = req.occasion && req.occasion.key !== "other"
    ? await resolveCategory(req.occasion.key)
    : undefined;
  const base = {
    eventCategory,
    vendorType: req.service?.vendorType,
    date: req.date,
    limit: LIMIT,
  };
  const strict = {
    ...base,
    city: req.area?.city,
    guests: req.guests?.count,
    maxPrice: req.budget?.max,
  };
  const attempts = [
    { ...strict, sort: "rating" as const },
    { ...strict, guests: undefined, sort: "rating" as const },
    { ...strict, guests: undefined, city: undefined, sort: "rating" as const },
    // Over budget: closest prices first.
    { ...base, sort: "price_asc" as const },
    // Last: the service and date dropped too (the mock relaxes service
    // when nothing of that type fits).
    { eventCategory, limit: LIMIT, sort: "price_asc" as const },
  ];

  // Fill up to LIMIT cards, strictest matches first, topping up from each
  // looser search so a single exact hit doesn't leave a one-card answer.
  const rows: RawPackage[] = [];
  let exactCount = 0;
  for (const [i, params] of attempts.entries()) {
    if (rows.length >= LIMIT) break;
    const res = await browsePackages(params).catch(() => null);
    for (const p of res?.packages ?? []) {
      if (rows.length >= LIMIT || rows.some((r) => r._id === p._id)) continue;
      rows.push(p);
      if (i === 0) exactCount += 1;
    }
  }
  const exact = rows.length > 0 && exactCount === rows.length;
  const budget = req.budget?.max;
  const overBudget =
    budget != null &&
    rows.some((p) => mapPackageToListItem(p).startingPrice > budget);

  let seeAll: FindPackagesResult["seeAll"];
  if (eventCategory && rows.length) {
    const all = await browsePackages({ eventCategory, limit: 1 }).catch(
      () => null,
    );
    if (all && all.total > rows.length) {
      seeAll = {
        count: all.total,
        href: `/packages/browse?eventType=${encodeURIComponent(eventCategory)}`,
      };
    }
  }

  // "I couldn't find haldi packages yet" only when the occasion itself
  // has nothing in the catalogue.
  const occasionMatched = !req.occasion || req.occasion.key === "other" || Boolean(eventCategory);
  return {
    cards: rows.map(toCard),
    exact: exact && occasionMatched,
    exactCount: occasionMatched ? exactCount : 0,
    overBudget,
    occasionMatched,
    seeAll,
  };
}
