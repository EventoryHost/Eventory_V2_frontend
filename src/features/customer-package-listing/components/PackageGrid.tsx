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
}: {
  packages: PackageListItem[];
  bookmarkedIds: ReadonlySet<string>;
  onToggleBookmark: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {packages.map((pkg) => (
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
        />
      ))}
    </div>
  );
}
