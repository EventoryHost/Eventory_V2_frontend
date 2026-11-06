"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PackagesPageData } from "../types";
import PromoBannerCarousel from "./PromoBannerCarousel";
import VendorCategoryTabs from "./VendorCategoryTabs";
import PackageCategorySection from "./PackageCategorySection";
import FestiveOfferBanner from "./FestiveOfferBanner";
import MagicalMomentsSection from "./MagicalMomentsSection";
import BudgetEstimatorSection from "./BudgetEstimatorSection";
import NoPackagesFound from "./NoPackagesFound";

export default function PackagesPageContent({ data }: { data: PackagesPageData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Category lives in the URL so the page's own links can target one
  // ("Explore Packages", the subcategory chips) and so a tab is
  // shareable/back-navigable. An unknown or absent ?category= falls back to
  // the default rather than rendering an empty tab.
  const requestedCategory = searchParams.get("category");
  const isKnownCategory = data.vendorCategories.some((category) => category.id === requestedCategory);
  const [activeCategoryId, setActiveCategoryId] = useState(
    isKnownCategory && requestedCategory ? requestedCategory : data.defaultVendorCategoryId
  );

  // Follow the URL when it changes underneath us — clicking a
  // ?category= link while already on this page, or using back/forward.
  useEffect(() => {
    if (isKnownCategory && requestedCategory && requestedCategory !== activeCategoryId) {
      setActiveCategoryId(requestedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedCategory, isKnownCategory]);

  function handleSelectCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === data.defaultVendorCategoryId) params.delete("category");
    else params.set("category", categoryId);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }
  const blocks = data.blocksByCategory[activeCategoryId] ?? [];
  const hasPackages = data.hasPackagesByCategory[activeCategoryId] ?? true;
  const activeCategory = data.vendorCategories.find((category) => category.id === activeCategoryId);

  return (
    <div className="flex w-full flex-col pt-4 pb-12 sm:pt-6 sm:pb-16">
      <div className="mb-6 sm:mb-8">
        <PromoBannerCarousel banners={data.heroBanners} />
      </div>

      {/* No gap below the tabs — the first section band (alternating
          #FFFAF1/white stripe below) sits flush against the tabs card. */}
      <VendorCategoryTabs
        categories={data.vendorCategories}
        activeId={activeCategoryId}
        onSelect={handleSelectCategory}
      />

      {!hasPackages ? (
        <NoPackagesFound
          categoryId={activeCategoryId}
          categoryLabel={activeCategory?.label ?? "These"}
        />
      ) : (
        blocks.map((block, index) => {
          const content = (() => {
            switch (block.type) {
              case "packageCategorySection":
                return (
                  <PackageCategorySection
                    section={block.data}
                    categoryId={activeCategoryId}
                  />
                );
              case "festiveOffer":
                return <FestiveOfferBanner offer={block.data} />;
              case "magicalMoments":
                return <MagicalMomentsSection data={block.data} />;
              case "budgetEstimator":
                return <BudgetEstimatorSection data={block.data} />;
              default:
                return null;
            }
          })();
          if (!content) return null;

          // Alternating #FFFAF1 / white full-bleed stripe behind each
          // section, so the page reads as distinct bands rather than one
          // flat white surface — same full-bleed trick BrandsBar.tsx
          // already uses (negative margin + viewport width) since this
          // page's own container doesn't span the full browser width.
          // Magical Moments already carries its own background + vertical
          // rhythm (py-12/16/20 on bg-campaign-blue), so it gets the
          // alternation with no extra padding rather than doubling up.
          const hasOwnVerticalRhythm = block.type === "magicalMoments";
          return (
            <div
              key={block.data.id}
              className={`relative left-1/2 -mx-[50vw] w-screen ${hasOwnVerticalRhythm ? "" : "py-6 sm:py-8"} ${
                index % 2 === 0 ? "bg-white" : "bg-[#FFFAF1]"
              }`}
            >
              {content}
            </div>
          );
        })
      )}
    </div>
  );
}
