import { getCompare } from "@/lib/customerCompareApi";
import { getWishlist } from "@/lib/customerWishlistApi";
import { getPackageDetail } from "@/features/customer-package-detail/services/getPackageDetail";
import type { ComparisonView } from "../types";
import { buildSections, toColumn, type ComparisonInput } from "../utils/buildComparison";

/**
 * Loads the comparison the customer built on the wishlist.
 *
 * GET /customer/compare owns *which* packages are being compared (and their
 * order), but its payload stops at price/capacity/duration + the raw
 * category-specific blob — not nearly enough for the table's setup, add-on,
 * exclusion and policy rows. Those all exist on the package detail endpoint,
 * already mapped per vendor type by getPackageDetail, so each column is
 * filled from there rather than from a second, parallel mapping here.
 *
 * Notes come from the wishlist, which is where the customer wrote them; a
 * failure there costs the notes column, not the page.
 */
export async function getComparison(): Promise<ComparisonView> {
  const session = await getCompare();
  if (session.items.length === 0) {
    return { vendorType: session.vendorType, columns: [], sections: [] };
  }

  const notesByPackageId = await getWishlist()
    .then((wishlist) => {
      const notes = new Map<string, string>();
      wishlist.items.forEach((item) => {
        if (item.itemType === "Package" && item.packageId && item.note) {
          notes.set(item.packageId._id, item.note);
        }
      });
      return notes;
    })
    .catch(() => new Map<string, string>());

  // One hidden vendor's package (Unlive/deactivated/under the profile-
  // completion floor — see backend's customerVisibility.js) 404s at
  // getPackageDetail. Without a per-item catch, Promise.all rejected the
  // WHOLE comparison the instant any single compared package went hidden —
  // the other, perfectly valid columns disappeared along with it. Dropping
  // just that one column (same "fewer than were saved" resilience the
  // compare SESSION itself already has to tolerate) keeps the rest of the
  // comparison intact instead of failing the whole page.
  const details = await Promise.all(
    session.items.map((item) => getPackageDetail(item.packageId).catch(() => null))
  );
  const validDetails = details.filter((detail): detail is NonNullable<typeof detail> => detail !== null);

  const inputs: ComparisonInput[] = validDetails.map((detail) => ({
    detail,
    note: notesByPackageId.get(detail.id) ?? "",
  }));

  return {
    vendorType: session.vendorType,
    columns: inputs.map((input) => toColumn(input.detail)),
    sections: buildSections(inputs),
  };
}
