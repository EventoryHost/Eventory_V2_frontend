"use client";

import { useMemo, useState } from "react";
import type { PackageDetail } from "../types";
import HeroGallery from "./HeroGallery";
import PackageHeaderInfo from "./PackageHeaderInfo";
import AnchorNav from "./AnchorNav";
import VariantSelector from "./VariantSelector";
import PackageQuickStats from "./PackageQuickStats";
import PackageSummary from "./PackageSummary";
import AboutPackage from "./AboutPackage";
import IncludedItems from "./IncludedItems";
import NotIncludedSection from "./NotIncludedSection";
import VendorRequirements from "./VendorRequirements";
import AddonsCarousel from "./AddonsCarousel";
import PaymentProtection from "./PaymentProtection";
import EventDaySection from "./EventDaySection";
import PoliciesSection from "./PoliciesSection";
import VendorSection from "./VendorSection";
import ReviewsSection from "./ReviewsSection";
import ShareQuoteCard from "./ShareQuoteCard";
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
      <PackageHeaderInfo data={data} />

      <div className="mt-6">
        <AnchorNav />
      </div>

      <div className="grid grid-cols-1 gap-10 pt-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <VariantSelector
            variants={data.variants}
            selectedId={selectedVariantId}
            onSelect={setSelectedVariantId}
          />

          <PackageQuickStats summary={data.summary} />
          <PackageSummary summary={data.summary} />
          <AboutPackage text={data.aboutText} />
          {data.includedItems.length > 0 && <IncludedItems items={data.includedItems} />}
          {data.notIncluded && data.notIncluded.length > 0 && <NotIncludedSection items={data.notIncluded} />}
          {data.addons.length > 0 && (
            <AddonsCarousel addons={data.addons} selectedIds={selectedAddonIds} onToggle={toggleAddon} />
          )}
          {data.vendorRequirements.length > 0 && <VendorRequirements requirements={data.vendorRequirements} />}
          <PaymentProtection protection={data.paymentProtection} />
          <EventDaySection />
          {data.reviews.total > 0 && <ReviewsSection reviews={data.reviews} />}
          <VendorSection vendor={data.vendor} />
          {data.policies.length > 0 && <PoliciesSection policies={data.policies} />}
          <ShareQuoteCard />
        </div>

        <StickyBookingCard
          packageId={data.id}
          packageTotal={packageTotal}
          gstPercent={data.pricing.gstPercent}
          tokenAmount={data.pricing.tokenAmount}
          selectedAddons={data.addons.filter((addon) => selectedAddonIds.has(addon.id))}
        />
      </div>
    </main>
  );
}
