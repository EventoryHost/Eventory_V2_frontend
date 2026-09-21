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
    <div className="flex w-full flex-col gap-6 pt-4 pb-12 sm:gap-8 sm:pt-6 sm:pb-16">
      <PromoBannerCarousel banners={data.heroBanners} />

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
        blocks.map((block) => {
          switch (block.type) {
            case "packageCategorySection":
              return (
                <PackageCategorySection
                  key={block.data.id}
                  section={block.data}
                  categoryId={activeCategoryId}
                />
              );
            case "festiveOffer":
              return <FestiveOfferBanner key={block.data.id} offer={block.data} />;
            case "magicalMoments":
              return <MagicalMomentsSection key={block.data.id} data={block.data} />;
            case "budgetEstimator":
              return <BudgetEstimatorSection key={block.data.id} data={block.data} />;
            default:
              return null;
          }
        })
      )}
    </div>
  );
}
