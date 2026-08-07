"use client";

import { useState } from "react";
import type { PackagesPageData } from "../types";
import PromoBannerCarousel from "./PromoBannerCarousel";
import VendorCategoryTabs from "./VendorCategoryTabs";
import PackageCategorySection from "./PackageCategorySection";
import FestiveOfferBanner from "./FestiveOfferBanner";
import MagicalMomentsSection from "./MagicalMomentsSection";

export default function PackagesPageContent({ data }: { data: PackagesPageData }) {
  const [activeCategoryId, setActiveCategoryId] = useState(data.defaultVendorCategoryId);
  const blocks = data.blocksByCategory[activeCategoryId] ?? [];

  return (
    <div className="flex w-full flex-col gap-6 pt-4 pb-12 sm:gap-8 sm:pt-6 sm:pb-16">
      <PromoBannerCarousel banners={data.heroBanners} />

      <VendorCategoryTabs
        categories={data.vendorCategories}
        activeId={activeCategoryId}
        onSelect={setActiveCategoryId}
      />

      {blocks.map((block) => {
        switch (block.type) {
          case "packageCategorySection":
            return <PackageCategorySection key={block.data.id} section={block.data} />;
          case "festiveOffer":
            return <FestiveOfferBanner key={block.data.id} offer={block.data} />;
          case "magicalMoments":
            return <MagicalMomentsSection key={block.data.id} data={block.data} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
