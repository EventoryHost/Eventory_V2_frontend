"use client";

import { useMemo, useState } from "react";
import type { PackageDetail } from "../types";
import HeroGallery from "./HeroGallery";
import PackageHeaderInfo from "./PackageHeaderInfo";
import VariantSelector from "./VariantSelector";
import PackageSummary from "./PackageSummary";
import AboutPackage from "./AboutPackage";
import IncludedItems from "./IncludedItems";
import VendorRequirements from "./VendorRequirements";
import AddonsCarousel from "./AddonsCarousel";
import PaymentProtection from "./PaymentProtection";
import PoliciesSection from "./PoliciesSection";
import VendorSection from "./VendorSection";
import ReviewsSection from "./ReviewsSection";
import StickyBookingCard from "./StickyBookingCard";

export default function PackageDetailPage({ data }: { data: PackageDetail }) {
  const [selectedVariantId, setSelectedVariantId] = useState(data.defaultVariantId);
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(new Set());

  const selectedVariant =
    data.variants.find((variant) => variant.id === selectedVariantId) ?? data.variants[0];

  const addonsTotal = useMemo(
    () =>
      data.addons
        .filter((addon) => selectedAddonIds.has(addon.id))
        .reduce((sum, addon) => sum + addon.price, 0),
    [data.addons, selectedAddonIds]
  );

  const packageTotal = (selectedVariant?.price ?? 0) + addonsTotal;

  function toggleAddon(addonId: string) {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(addonId)) {
        next.delete(addonId);
      } else {
        next.add(addonId);
      }
      return next;
    });
  }

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-6 md:px-6">
      <HeroGallery images={data.gallery} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <PackageHeaderInfo data={data} />

          <VariantSelector
            variants={data.variants}
            selectedId={selectedVariantId}
            onSelect={setSelectedVariantId}
          />

          <PackageSummary summary={data.summary} />
          <AboutPackage text={data.aboutText} />
          {data.includedItems.length > 0 && <IncludedItems items={data.includedItems} />}
          {data.vendorRequirements.length > 0 && <VendorRequirements requirements={data.vendorRequirements} />}
          {data.addons.length > 0 && (
            <AddonsCarousel addons={data.addons} selectedIds={selectedAddonIds} onToggle={toggleAddon} />
          )}
          <PaymentProtection protection={data.paymentProtection} />
          {data.policies.length > 0 && <PoliciesSection policies={data.policies} />}
          <VendorSection vendor={data.vendor} />
          {data.reviews.total > 0 && <ReviewsSection reviews={data.reviews} />}
        </div>

        <StickyBookingCard
          packageTotal={packageTotal}
          gstPercent={data.pricing.gstPercent}
          tokenAmount={data.pricing.tokenAmount}
        />
      </div>
    </main>
  );
}
