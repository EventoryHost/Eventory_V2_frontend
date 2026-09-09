"use client";

import { useEffect, useMemo, useState } from "react";
import { getCart, type RawCartItem } from "@/lib/customerCartApi";
import type { PackageDetail } from "../types";
import HeroGallery from "./HeroGallery";
import PackageHeaderInfo from "./PackageHeaderInfo";
import VariantSelector from "./VariantSelector";
import PackageSummary from "./PackageSummary";
import AboutPackage from "./AboutPackage";
import IncludedItems from "./IncludedItems";
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

export default function PackageDetailPage({
  data,
  editItemId,
}: {
  data: PackageDetail;
  /** Set when arriving via Cart's "Edit Package Details" — see CartItemRow/VendorActions/PackageInfo's editHref. Fetches that exact cart item so every field (event type, date, time, location, add-ons, vendor note) prefills with what was already selected instead of starting blank, and routes saves back to updateCartItem instead of creating a duplicate line. */
  editItemId?: string;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(data.defaultVariantId);
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});
  const [vendorNote, setVendorNote] = useState("");
  const [editCartItem, setEditCartItem] = useState<RawCartItem | null>(null);

  // One-time prefill fetch — the variant itself doesn't need this (defaultVariantId
  // above already matches the exact package/variant this URL points to, which is
  // the same one that was added to cart), but everything else the user filled in
  // (add-ons, vendor note, and StickyBookingCard's own event type/date/time/location
  // fields) would otherwise reset to blank on every visit, edit or not.
  useEffect(() => {
    if (!editItemId) return;
    let cancelled = false;
    getCart()
      .then((cart) => {
        if (cancelled) return;
        const match = cart.vendors.flatMap((group) => group.items).find((item) => item._id === editItemId);
        if (!match) return;
        setEditCartItem(match);
        setVendorNote(match.specialRequest || "");
        const quantities: Record<string, number> = {};
        match.selectedAddOns.forEach((addon) => {
          if (addon.addOnId) quantities[addon.addOnId] = addon.quantity;
        });
        setAddonQuantities(quantities);
      })
      .catch(() => {
        // Best-effort — worst case the page just behaves like a fresh (non-edit) visit.
      });
    return () => {
      cancelled = true;
    };
  }, [editItemId]);

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

  // Team & equipment is a real, separate flat charge on top of the package's
  // base price (step3_policiesAndCharges.teamAndEquipment) — included in the
  // subtotal. Overtime is a rate disclosure only (only charged if the event
  // actually runs over), so it's surfaced separately, not added here.
  const packageTotal = (selectedVariant?.price ?? 0) + data.pricing.teamAndEquipmentCharge + addonsTotal;

  function changeAddonQuantity(addonId: string, delta: number) {
    setAddonQuantities((prev) => {
      const nextQty = Math.max(0, (prev[addonId] ?? 0) + delta);
      return { ...prev, [addonId]: nextQty };
    });
  }

  return (
    <div className="w-full bg-white">
    <main className="mx-auto max-w-[1280px] px-4 py-6 md:px-6">
      <HeroGallery images={data.gallery} />
      <PackageHeaderInfo data={data} onCreateQuotation={scrollToBookingCard} />

      <div className="grid grid-cols-1 gap-10 pt-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <VariantSelector
            variants={data.variants}
            selectedId={selectedVariantId}
            onSelect={setSelectedVariantId}
          />

          <PackageSummary summary={data.summary} />
          <AboutPackage text={data.aboutText} />
          {data.includedItems.length > 0 && <IncludedItems items={data.includedItems} />}
          <NotesForVendor value={vendorNote} onChange={setVendorNote} />
          <VendorRequirements requirements={data.vendorRequirements} />
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
          teamAndEquipmentCharge={data.pricing.teamAndEquipmentCharge}
          teamAndEquipmentBillingUnit={data.pricing.teamAndEquipmentBillingUnit}
          overtimeChargeRate={data.pricing.overtimeChargeRate}
          overtimeBillingUnit={data.pricing.overtimeBillingUnit}
          gstPercent={data.pricing.gstPercent}
          tokenAmount={data.pricing.tokenAmount}
          selectedAddons={selectedAddons}
          includedItems={data.includedItems}
          vendorNote={vendorNote}
          onVendorNoteChange={setVendorNote}
          editItemId={editCartItem?._id}
          prefillEventDetails={editCartItem?.eventDetails}
          cancellationPolicyText={data.policies.find((policy) => policy.id === "policy-cancellation")?.description}
        />
      </div>
    </main>
    </div>
  );
}
