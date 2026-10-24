import type { PackageListItem } from "../types";
import ProductCard from "@/features/customer-landing/components/ProductCard";
import { formatPrice } from "@/features/customer-vendors/utils/currency";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";
const FALLBACK_CATEGORY_ICON = "/images/customer/packages-pics.png";

/**
 * Three-up grid of the shared package card — the same ProductCard the
 * landing carousels and the vendor profile use, so a package looks
 * identical everywhere it appears.
 */
export default function PackageGrid({
  packages,
  bookmarkedIds,
  onToggleBookmark,
  compareMode = false,
  compareIds,
  onToggleCompare,
}: {
  packages: PackageListItem[];
  bookmarkedIds: ReadonlySet<string>;
  onToggleBookmark: (id: string) => void;
  /** "Compare Packages" mode — renders the checkbox on every card below. */
  compareMode?: boolean;
  compareIds?: ReadonlySet<string>;
  onToggleCompare?: (pkg: PackageListItem) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {packages.map((pkg) => {
        const isCompareSelected = compareIds?.has(pkg.id) ?? false;
        // Locked out once 3 are already selected (the backend's own cap) —
        // never locked out by category here, since a different vendor type
        // is still pickable; PackageListingContent's handler rejects it and
        // surfaces the same "one category at a time" message the compare
        // session API itself returns (409), same pattern as the wishlist.
        const compareDisabled = compareMode && (compareIds?.size ?? 0) >= 3 && !isCompareSelected;

        return (
          <ProductCard
            key={pkg.id}
            fullWidth
            href={`/packages/${pkg.id}`}
            image={pkg.image ?? FALLBACK_IMAGE}
            categoryLabel={pkg.categoryLabel}
            categoryIcon={pkg.categoryIcon ?? FALLBACK_CATEGORY_ICON}
            categoryGradientFrom={pkg.categoryGradientFrom}
            tags={pkg.eventTypes}
            title={pkg.name}
            rating={pkg.rating}
            reviewCount={pkg.reviewCount}
            duration={pkg.duration}
            guestCapacity={pkg.guestCapacity}
            price={formatPrice(pkg.startingPrice)}
            locations={pkg.locations}
            isBookmarked={bookmarkedIds.has(pkg.id)}
            onToggleBookmark={() => onToggleBookmark(pkg.id)}
            onToggleCompare={compareMode ? () => onToggleCompare?.(pkg) : undefined}
            isCompareSelected={isCompareSelected}
            compareDisabled={compareDisabled}
          />
        );
      })}
    </div>
  );
}
