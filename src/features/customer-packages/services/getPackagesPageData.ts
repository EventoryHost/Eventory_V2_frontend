import type {
  BudgetEstimatorSuggestion,
  PackageCategoryItem,
  PackagesPageBlock,
  PackagesPageData,
} from "../types";
import { mockPackagesPageData } from "../data/mockPackagesPageData";
import { browsePackages, getPackageImage, getPackageStartingPrice, type RawPackage } from "@/lib/customerDiscoveryApi";
import { CATEGORY_TO_VENDOR_TYPE } from "@/lib/vendorType";

const PRODUCT_SECTION_LIMIT = 8;
// Each category has two "product" packageCategorySection blocks in the mock
// data ("Trending Packages", "Handpicked For You") — fetch them with
// different sorts so the two sections show different real packages instead
// of duplicating one list.
const PRODUCT_BLOCK_SORTS = ["newest", "rating"] as const;

function toPackageCategoryItem(pkg: RawPackage): PackageCategoryItem {
  return {
    id: pkg._id,
    title: pkg.step1_eventAndCrew?.packageName ?? "Package",
    priceFrom: getPackageStartingPrice(pkg),
    image: getPackageImage(pkg),
    href: `/packages/${pkg._id}`,
  };
}

/**
 * One budget-estimator row = one real PACKAGE. The description falls back
 * through the fields most likely to be filled in, so the line under the
 * name is never blank: what the package is for, else who runs it.
 */
function toBudgetSuggestion(pkg: RawPackage): BudgetEstimatorSuggestion {
  const eventTypes = pkg.step1_eventAndCrew?.eventCategories ?? [];
  return {
    id: pkg._id,
    title: pkg.step1_eventAndCrew?.packageName ?? "Package",
    description: eventTypes.slice(0, 3).join(" • ") || pkg.vendorId?.pocName || "",
    priceFrom: getPackageStartingPrice(pkg),
    image: getPackageImage(pkg),
    href: `/packages/${pkg._id}`,
  };
}

async function fetchRealPackagesForCategory(categoryId: string): Promise<RawPackage[][]> {
  const vendorType = CATEGORY_TO_VENDOR_TYPE[categoryId];
  if (!vendorType) return [];
  try {
    const responses = await Promise.all(
      PRODUCT_BLOCK_SORTS.map((sort) => browsePackages({ vendorType, sort, page: 1, limit: PRODUCT_SECTION_LIMIT }))
    );
    return responses.map((response) => response.packages);
  } catch {
    return [];
  }
}

/**
 * Data source for the Packages page. Hero banners, festive offers and
 * magical moments stay static CMS-style mock content — no backend endpoint
 * covers them.
 *
 * Everything that represents a PACKAGE is real: the "product"
 * packageCategorySection blocks, and the budget estimator's suggestions.
 * The estimator used to be mock rows titled by vendor type, so each group
 * rendered "Decorator / Decorator / Decorator..." with hrefs
 * (/packages/budget-dec-1) that pointed at package ids which never existed
 * — a vendor-shaped row, and a dead link, where a package belongs.
 *
 * The "chip" blocks (subcategory nav like "Balloons"/"Table Decoration")
 * have no backend facet to source them from and stay mocked, same reasoning
 * as the dropped vendor "Service" filter.
 */
export async function getPackagesPageData(): Promise<PackagesPageData> {
  const categoryIds = mockPackagesPageData.vendorCategories.map((category) => category.id);
  const realPackagesEntries = await Promise.all(
    categoryIds.map(async (categoryId) => [categoryId, await fetchRealPackagesForCategory(categoryId)] as const)
  );
  const realPackagesByCategory = new Map(realPackagesEntries);
  const realItemsByCategory = new Map(
    [...realPackagesByCategory].map(([categoryId, lists]) => [
      categoryId,
      lists.map((packages) => packages.map(toPackageCategoryItem)),
    ])
  );

  const hasPackagesByCategory: Record<string, boolean> = {};

  const blocksByCategory = Object.fromEntries(
    Object.entries(mockPackagesPageData.blocksByCategory).map(([categoryId, blocks]) => {
      const realItemLists = realItemsByCategory.get(categoryId) ?? [];
      hasPackagesByCategory[categoryId] = realItemLists.some((items) => items.length > 0);
      let productBlockIndex = 0;

      const nextBlocks: PackagesPageBlock[] = blocks.map((block) => {
        // The estimator's groups are per vendor category and are NOT
        // necessarily the tab being viewed, so each group is filled from
        // its own category's packages rather than this tab's.
        if (block.type === "budgetEstimator") {
          const vendorGroups = block.data.vendorGroups.map((group) => {
            const groupPackages = realPackagesByCategory.get(group.categoryId)?.[0] ?? [];
            if (groupPackages.length === 0) return group;
            return { ...group, suggestions: groupPackages.map(toBudgetSuggestion) };
          });
          return { ...block, data: { ...block.data, vendorGroups } };
        }

        // Magical Moments is a package carousel too, and its mock tiles
        // linked to ids like /packages/decorator-magical-0 that never
        // existed. Fed from the rating-sorted list — it overlaps
        // "Handpicked For You" on a small catalogue, which is better than
        // six tiles that 404.
        if (block.type === "magicalMoments") {
          const realItems = realItemLists[1] ?? realItemLists[0] ?? [];
          if (realItems.length === 0) return block;
          return { ...block, data: { ...block.data, packages: realItems } };
        }

        if (block.type !== "packageCategorySection" || block.data.variant !== "product") return block;

        const realItems = realItemLists[productBlockIndex];
        productBlockIndex += 1;
        if (!realItems || realItems.length === 0) return block;

        return { ...block, data: { ...block.data, items: realItems } };
      });

      return [categoryId, nextBlocks];
    })
  );

  return { ...mockPackagesPageData, blocksByCategory, hasPackagesByCategory };
}
