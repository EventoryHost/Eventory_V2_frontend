import type { CartVendor, RecommendedAddon } from "../types";
import { getPackageDetail } from "@/lib/customerPackageDetailApi";

/**
 * "People also buy this" — there is no shared add-on catalog endpoint, so
 * this is built from each in-cart package's own add-on list (Decorator
 * packages only; every other vendorType has none — see
 * DecoratorPackage/decoratorStep2Schema.js), skipping add-ons already added
 * to that specific cart item.
 */
export async function getRecommendedAddons(items: CartVendor[]): Promise<RecommendedAddon[]> {
  const uniquePackageIds = [...new Set(items.map((item) => item.package.id))];

  const byPackageId = new Map<string, RecommendedAddon[]>();
  await Promise.all(
    uniquePackageIds.map(async (packageId) => {
      try {
        const { package: pkg } = await getPackageDetail(packageId);
        const addOns = pkg.step2_productsAndPricing?.addOns ?? [];
        byPackageId.set(
          packageId,
          addOns.map((addon, i) => ({
            id: addon._id ?? `${packageId}-addon-${i}`,
            itemId: "",
            title: addon.name ?? "Add-on",
            category: addon.category || addon.addOnType || "Add-on",
            subCategory: addon.subCategory ?? "",
            qtyLabel: addon.quantity ? `${addon.quantity} unit${addon.quantity > 1 ? "s" : ""}` : "1 unit",
            image: addon.mediaUrls?.[0],
            price: addon.price ?? 0,
            unitLabel: addon.billingUnit ? `/${addon.billingUnit}` : "",
          }))
        );
      } catch {
        byPackageId.set(packageId, []);
      }
    })
  );

  return items.flatMap((item) => {
    const catalog = byPackageId.get(item.package.id) ?? [];
    const alreadyAdded = new Set(item.addons.map((a) => a.id));
    return catalog
      .filter((addon) => !alreadyAdded.has(addon.id))
      .map((addon) => ({ ...addon, itemId: item.id }));
  });
}
