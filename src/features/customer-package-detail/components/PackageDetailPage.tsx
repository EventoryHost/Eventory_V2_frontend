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
import NotesForVendor from "./NotesForVendor";
import VendorRequirements from "./VendorRequirements";
import AddonsCarousel from "./AddonsCarousel";
import PaymentProtection from "./PaymentProtection";
import PoliciesSection from "./PoliciesSection";
import VendorSection from "./VendorSection";
import ReviewsSection from "./ReviewsSection";
import StickyBookingCard from "./StickyBookingCard";

function scrollToBookingCard() {
  document.getElementById("booking-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => document.getElementById("event-type-select")?.focus(), 300);
}

export default function PackageDetailPage({ data }: { data: PackageDetail }) {
  const [selectedVariantId, setSelectedVariantId] = useState(data.defaultVariantId);
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});
  const [vendorNote, setVendorNote] = useState("");

  const selectedVariant =
    data.variants.find((variant) => variant.id === selectedVariantId) ?? data.variants[0];

  const selectedAddons = useMemo(
    () =>
      data.addons
        .filter((addon) => (addonQuantities[addon.id] ?? 0) > 0)
        .map((addon) => ({ ...addon, quantity: addonQuantities[addon.id] })),
    [data.addons, addonQuantities]
  );

  const addonsTotal = useMemo(
    () => selectedAddons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0),
    [selectedAddons]
  );

  const packageTotal = (selectedVariant?.price ?? 0) + addonsTotal;

  function changeAddonQuantity(addonId: string, delta: number) {
    setAddonQuantities((prev) => {
      const nextQty = Math.max(0, (prev[addonId] ?? 0) + delta);
      return { ...prev, [addonId]: nextQty };
    });
  }

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-6 md:px-6">
      <HeroGallery images={data.gallery} />
      <PackageHeaderInfo data={data} onCreateQuotation={scrollToBookingCard} />

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
          <NotesForVendor value={vendorNote} onChange={setVendorNote} />
          {data.vendorRequirements.length > 0 && <VendorRequirements requirements={data.vendorRequirements} />}
          {data.addons.length > 0 && (
            <AddonsCarousel addons={data.addons} quantities={addonQuantities} onChangeQuantity={changeAddonQuantity} />
          )}
          <PaymentProtection protection={data.paymentProtection} />
          {data.policies.length > 0 && <PoliciesSection policies={data.policies} />}
          <VendorSection vendor={data.vendor} />
          {data.reviews.total > 0 && <ReviewsSection reviews={data.reviews} />}
        </div>

        <StickyBookingCard
          packageId={data.id}
          packageTotal={packageTotal}
          gstPercent={data.pricing.gstPercent}
          tokenAmount={data.pricing.tokenAmount}
          selectedAddons={selectedAddons}
          includedItems={data.includedItems}
          vendorNote={vendorNote}
          onVendorNoteChange={setVendorNote}
          cancellationPolicyText={data.policies.find((policy) => policy.id === "policy-cancellation")?.description}
        />
      </div>
    </main>
  );
}
