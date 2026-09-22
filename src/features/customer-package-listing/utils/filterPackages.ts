import type { PackageListItem, PackageSelectedFilters } from "../types";
import { PRICE_RANGE_OPTIONS } from "../data/filterConfig";

function priceInRange(price: number, rangeId: string) {
  if (rangeId === "50000-plus") return price >= 50000;
  const [minStr, maxStr] = rangeId.split("-");
  return price >= Number(minStr) && price <= Number(maxStr);
}

/**
 * Client-side refinement on top of the page already fetched from
 * GET /customer/packages. Search, category and sort are applied by the
 * endpoint, so only the sidebar's multi-selects run here: OR within a
 * section, AND across sections.
 *
 * FOUR SECTIONS ARE DELIBERATELY INERT, because nothing in the data can
 * answer them:
 *
 *   offer          — no field records "customisable" or "has add-ons".
 *   service        — "Bridal Makeup", "HD Makeup", ...
 *   style          — "MAC", "Huda Beauty", ...
 *   hairAndStyling — "Updo", "Keratin", ...
 *
 * The last three would have to match against
 * step2_productsAndPricing.included, which is free text the vendor types
 * themselves (real values include "right", "okj", "sdfsc"), so any match
 * would be guesswork that silently hides real packages. They render per the
 * design and their checkboxes tick; wire them up once a real taxonomy
 * exists.
 */
export function filterPackages(
  packages: PackageListItem[],
  selected: PackageSelectedFilters
): PackageListItem[] {
  const eventType = selected.eventType ?? [];
  const pricing = selected.pricing ?? [];

  return packages.filter((pkg) => {
    if (eventType.length > 0 && !eventType.some((id) => pkg.eventTypes.includes(id))) {
      return false;
    }
    if (pricing.length > 0 && !pricing.some((id) => priceInRange(pkg.startingPrice, id))) {
      return false;
    }
    return true;
  });
}

/** Human-readable label for an active filter chip. */
export function packageFilterLabel(sectionId: string, optionId: string) {
  if (sectionId === "pricing") {
    return PRICE_RANGE_OPTIONS.find((option) => option.id === optionId)?.label ?? optionId;
  }
  return optionId;
}
