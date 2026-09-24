"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { Vendor } from "@/features/customer-vendors/types";
import { formatPrice } from "@/features/customer-vendors/utils/currency";
import ProductCard from "@/features/customer-landing/components/ProductCard";
import SectionHeading from "./SectionHeading";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";
const FALLBACK_CATEGORY_ICON = "/images/customer/packages-pics.png";

/**
 * "Event Packages" — the vendor's own Live packages.
 *
 * Renders the shared package card (ProductCard, the same one the landing
 * page and events carousels use) rather than the vendor card from the
 * listing. An earlier version reused the vendor card here, which put the
 * vendor's own name, experience and wishlist count on all eight tiles of
 * their own profile — the same information eight times, and none of it
 * about the package.
 *
 * The tab row is per vendor TYPE, not per package: a vendor offering both
 * decoration and venues gets a "Decorator" and a "Venue Provider" tab. It
 * is derived from the packages actually returned, so a single-trade vendor
 * shows no tabs at all rather than one tab that filters nothing.
 */
export default function VendorPackagesSection({
  packages,
  total,
  vendorName,
  bookmarkedIds,
  onToggleBookmark,
}: {
  packages: Vendor[];
  total: number;
  vendorName: string;
  bookmarkedIds: ReadonlySet<string>;
  onToggleBookmark: (id: string) => void;
}) {
  // Distinct categories in first-appearance order, so the tabs follow the
  // same ordering as the grid rather than an arbitrary one.
  const categories = useMemo(() => {
    const seen = new Map<string, { id: string; label: string; icon?: string }>();
    packages.forEach((pkg) => {
      if (!seen.has(pkg.category)) {
        seen.set(pkg.category, {
          id: pkg.category,
          label: pkg.categoryLabel,
          icon: pkg.categoryIcon,
        });
      }
    });
    return [...seen.values()];
  }, [packages]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const visiblePackages = useMemo(
    () => (activeCategory ? packages.filter((pkg) => pkg.category === activeCategory) : packages),
    [packages, activeCategory]
  );

  if (packages.length === 0) {
    return (
      <section className="flex flex-col gap-5">
        <SectionHeading>Event Packages</SectionHeading>
        <div className="rounded-[20px] border border-[#e4e4e7] bg-white px-6 py-12 text-center">
          <p className="font-figtree text-[16px] font-semibold text-neutral-primary">
            No packages listed yet
          </p>
          <p className="mt-1 font-figtree text-[14px] text-neutral-tertiary">
            {vendorName} hasn&apos;t published any packages. Send an enquiry to discuss your event
            directly.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading>Event Packages</SectionHeading>

      <div className="rounded-[20px] border border-[#e4e4e7] bg-white p-5">
        {/* Only worth a tab row when this vendor actually works in more
            than one category. */}
        {categories.length > 1 && (
          <div className="mb-6 flex items-center overflow-x-auto border-b border-[#e4e4e7] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(isActive ? null : category.id)}
                  className={`flex shrink-0 items-center gap-2.5 border-b-[3px] px-5 py-2.5 whitespace-nowrap transition-colors ${
                    isActive ? "border-brand-primary" : "border-transparent"
                  }`}
                >
                  {category.icon && (
                    <Image
                      src={category.icon}
                      alt=""
                      width={16}
                      height={16}
                      className="size-4 object-contain"
                    />
                  )}
                  <span
                    className={`font-figtree text-[16px] leading-[24px] ${
                      isActive ? "font-semibold text-[#030303]" : "font-medium text-[#3f3f47]"
                    }`}
                  >
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mb-5 flex flex-col gap-0.5">
          <p className="font-figtree text-[20px] leading-[28px] font-semibold text-[#030303]">
            Customer&rsquo;s Top Picks
          </p>
          {/* The design's subtitle is placeholder copy ("A line for the
              result below"); a real count is more use than lorem. */}
          <p className="font-figtree text-[14px] leading-[20px] font-medium text-[#666666]">
            {visiblePackages.length} {visiblePackages.length === 1 ? "package" : "packages"} from{" "}
            {vendorName}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {visiblePackages.map((pkg) => (
            <ProductCard
              key={pkg.id}
              fullWidth
              href={`/packages/${pkg.id}`}
              image={pkg.images?.[0] ?? FALLBACK_IMAGE}
              categoryLabel={pkg.categoryLabel}
              categoryIcon={pkg.categoryIcon ?? FALLBACK_CATEGORY_ICON}
              categoryGradientFrom={pkg.categoryGradientFrom}
              tags={pkg.eventTypes}
              title={pkg.packageName ?? "Package"}
              rating={pkg.rating}
              reviewCount={pkg.reviewCount}
              duration={pkg.duration ?? "—"}
              guestCapacity={pkg.guestCapacity ?? "—"}
              price={formatPrice(pkg.startingPrice ?? 0)}
              locations={pkg.locations}
              isBookmarked={bookmarkedIds.has(pkg.id)}
              onToggleBookmark={() => onToggleBookmark(pkg.id)}
            />
          ))}
        </div>

        {total > packages.length && (
          <p className="mt-5 text-center font-figtree text-[14px] font-medium text-neutral-tertiary">
            Showing {packages.length} of {total} packages
          </p>
        )}
      </div>
    </section>
  );
}
