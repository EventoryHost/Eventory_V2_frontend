import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PackageCategorySection as PackageCategorySectionType } from "../types";
import PackageChipCard from "./PackageChipCard";
import PackagePromoCard from "./PackagePromoCard";
import ScrollableRow from "./ScrollableRow";
import SpecialDiscountBadge from "./SpecialDiscountBadge";

export default function PackageCategorySection({
  section,
  categoryId,
}: {
  section: PackageCategorySectionType;
  /** Active vendor category, used to preselect it in the full listing. */
  categoryId?: string;
}) {
  // Only the real package carousels get a "View all" — the "chip" variant is
  // subcategory navigation, and its own tiles already lead to the listing.
  const viewAllHref =
    section.variant === "product"
      ? `/packages/browse${categoryId ? `?category=${categoryId}` : ""}`
      : null;

  return (
    <section className="mx-4 rounded-3xl bg-white px-4 py-6 sm:mx-6 sm:px-6 sm:py-8 lg:mx-8 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5 sm:gap-3">
        <h2 className="font-figtree text-[18px] font-bold text-brand-950 sm:text-[22px]">{section.heading}</h2>
        {section.badgeLabel && <SpecialDiscountBadge label={section.badgeLabel} />}
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="ml-auto flex shrink-0 items-center gap-1 font-figtree text-[13px] font-semibold text-brand-primary hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <ScrollableRow>
        {section.items.map((item, i) =>
          section.variant === "chip" ? (
            <PackageChipCard key={item.id} item={item} seed={i} />
          ) : (
            <PackagePromoCard key={item.id} item={item} seed={i} />
          )
        )}
      </ScrollableRow>
    </section>
  );
}
