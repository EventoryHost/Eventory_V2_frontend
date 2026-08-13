import type { PackageCategoryItem, PackagesPageBlock, PackagesPageData } from "../types";
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

async function fetchRealItemsForCategory(categoryId: string): Promise<PackageCategoryItem[][]> {
  const vendorType = CATEGORY_TO_VENDOR_TYPE[categoryId];
  if (!vendorType) return [];
  try {
    const responses = await Promise.all(
      PRODUCT_BLOCK_SORTS.map((sort) => browsePackages({ vendorType, sort, page: 1, limit: PRODUCT_SECTION_LIMIT }))
    );
    return responses.map((response) => response.packages.map(toPackageCategoryItem));
  } catch {
    return [];
  }
}

/**
 * Data source for the Packages page. Hero banners, festive offers, magical
 * moments, and the budget estimator stay static CMS-style mock content — no
 * backend endpoint covers them. Only the "product" packageCategorySection
 * blocks (real package cards with a price) get their `items` swapped for
 * live data from GET /customer/packages; the "chip" blocks (subcategory nav
 * like "Balloons"/"Table Decoration") have no backend facet to source them
 * from and stay mocked, same reasoning as the dropped vendor "Service" filter.
 */
export async function getPackagesPageData(): Promise<PackagesPageData> {
  const categoryIds = mockPackagesPageData.vendorCategories.map((category) => category.id);
  const realItemsEntries = await Promise.all(
    categoryIds.map(async (categoryId) => [categoryId, await fetchRealItemsForCategory(categoryId)] as const)
  );
  const realItemsByCategory = new Map(realItemsEntries);

  const blocksByCategory = Object.fromEntries(
    Object.entries(mockPackagesPageData.blocksByCategory).map(([categoryId, blocks]) => {
      const realItemLists = realItemsByCategory.get(categoryId) ?? [];
      let productBlockIndex = 0;

      const nextBlocks: PackagesPageBlock[] = blocks.map((block) => {
        if (block.type !== "packageCategorySection" || block.data.variant !== "product") return block;

        const realItems = realItemLists[productBlockIndex];
        productBlockIndex += 1;
        if (!realItems || realItems.length === 0) return block;

        return { ...block, data: { ...block.data, items: realItems } };
      });

      return [categoryId, nextBlocks];
    })
  );

  return { ...mockPackagesPageData, blocksByCategory };
}
