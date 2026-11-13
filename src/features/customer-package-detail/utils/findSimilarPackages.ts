import { browsePackages, getPackageStartingPrice, type RawPackage } from "@/lib/customerDiscoveryApi";
import { CATEGORY_TO_VENDOR_TYPE } from "@/lib/vendorType";
import { sanitizeCityName } from "@/lib/vendorLocation";
import type { PackageDetail } from "../types";

const CANDIDATE_LIMIT = 48;
// "Similar budget": from half to 1.6x of this package's starting price.
const BUDGET_MIN_FACTOR = 0.5;
const BUDGET_MAX_FACTOR = 1.6;

function startingPrice(detail: PackageDetail): number {
  return detail.variants.find((variant) => variant.id === detail.defaultVariantId)?.price ?? detail.variants[0]?.price ?? 0;
}

/**
 * Picks the packages most like the one being viewed: same category, ranked by
 * how many of its event types they share, how close the price is, and whether
 * the vendor serves the same city. Variants of this same package are skipped
 * (the same product at another tier). Budget filtering is relaxed if too few
 * candidates fall inside it. With `otherVendorsOnly`, the viewed package's own
 * vendor is skipped as well.
 */
export async function findSimilarPackages(
  current: PackageDetail,
  options: { count: number; otherVendorsOnly?: boolean }
): Promise<RawPackage[]> {
  const vendorType = CATEGORY_TO_VENDOR_TYPE[current.categorySlug];
  if (!vendorType) return [];
  const currentPrice = startingPrice(current);

  const inBudget =
    currentPrice > 0
      ? await browsePackages({
          vendorType,
          minPrice: Math.floor(currentPrice * BUDGET_MIN_FACTOR),
          maxPrice: Math.ceil(currentPrice * BUDGET_MAX_FACTOR),
          limit: CANDIDATE_LIMIT,
        }).catch(() => null)
      : null;
  let candidates = inBudget?.packages ?? [];
  if (candidates.length < options.count + 1) {
    const any = await browsePackages({ vendorType, limit: CANDIDATE_LIMIT }).catch(() => null);
    candidates = [...candidates, ...(any?.packages ?? [])];
  }

  const currentEvents = new Set(current.eventCategories.map((event) => event.trim().toLowerCase()));
  const currentCities = new Set(current.locationList.map((place) => place.trim().toLowerCase()));
  const currentVariantIds = new Set(current.variants.map((variant) => variant.id));
  const seen = new Set<string>();

  return candidates
    .filter((pkg) => {
      if (pkg._id === current.id || currentVariantIds.has(pkg._id) || seen.has(pkg._id)) return false;
      if (options.otherVendorsOnly && pkg.vendorId?.id && pkg.vendorId.id === current.vendor.id) return false;
      seen.add(pkg._id);
      return true;
    })
    .map((pkg) => {
      const sharedEvents = (pkg.step1_eventAndCrew?.eventCategories ?? []).filter((event) =>
        currentEvents.has(event.trim().toLowerCase())
      ).length;
      const city = sanitizeCityName(pkg.vendorId?.city)?.toLowerCase();
      const price = getPackageStartingPrice(pkg);
      const priceGap = currentPrice > 0 && price > 0 ? Math.abs(Math.log(price / currentPrice)) : 1;
      return { pkg, score: sharedEvents * 2 + (city && currentCities.has(city) ? 1 : 0) - priceGap };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, options.count)
    .map((entry) => entry.pkg);
}
