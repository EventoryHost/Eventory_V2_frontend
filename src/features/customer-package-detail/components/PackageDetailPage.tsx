"use client";

import { useEffect, useMemo, useState } from "react";
import { getCart, type RawCartItem } from "@/lib/customerCartApi";
import { recordView } from "@/lib/recentlyViewed";
import { useRegisterSupportContext } from "@/features/customer-support/hooks/useSupport";
import type { PackageDetail, SelectedAddon } from "../types";
import { useCustomizeWorkshop } from "../hooks/useCustomizeWorkshop";
import { formatPrice } from "../utils/formatPrice";
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
  // One entry per LINE (addonId + colour combination), not one per addon —
  // real bug fixed 2026-10-01: the old Record<addonId, qty>/Record<addonId,
  // colour> shape could only ever hold ONE colour per addon at a time, so
  // picking the same add-on again in a different colour silently overwrote
  // the first colour's selection instead of adding a second line, and the
  // card's own "+" (AddonCard.tsx) hid itself entirely once any quantity
  // existed, making a second colour unreachable in the first place.
  const [addonLines, setAddonLines] = useState<{ addonId: string; colourLabel?: string; quantity: number }[]>([]);
  const [vendorNote, setVendorNote] = useState("");
  const [vendorNoteAttachments, setVendorNoteAttachments] = useState<string[]>([]);
  const [editCartItem, setEditCartItem] = useState<RawCartItem | null>(null);
  // Lifted up from IncludedItems so buildCartPayload (StickyBookingCard) can
  // also read workshop.requests — this used to live entirely inside
  // IncludedItems, which meant the customize-items requests never reached
  // the add-to-cart call at all.
  const workshop = useCustomizeWorkshop(data.includedItems);

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
        setVendorNoteAttachments(match.noteAttachments || []);
        // One line per real selectedAddOns entry — the backend array already
        // supports several lines sharing the same addOnId in different
        // colours (SelectedAddOnSchema has no uniqueness constraint); the
        // old Record<addonId,...> collapse here silently discarded all but
        // the last colour for a repeated addon on every edit reload.
        setAddonLines(
          match.selectedAddOns
            .filter((addon) => addon.addOnId)
            .map((addon) => ({ addonId: addon.addOnId!, colourLabel: addon.color || undefined, quantity: addon.quantity }))
        );
        workshop.hydrateFromRequests(match.customizeRequests ?? [], match.colourPreferences ?? []);
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

  // Help & Support: this page suggests Package support, and every ticket
  // raised here carries the package (StickyBookingCard adds date/location).
  useRegisterSupportContext({
    pageName: "Package page",
    phase: "browsing",
    suggestedType: "package",
    packageId: data.id,
    packageName: selectedVariant?.label ? `${data.title} · ${selectedVariant.label}` : data.title,
    vendorName: data.vendor.businessName || data.vendor.name,
    categoryLabel: data.categoryLabel,
  });

  // Feeds the account dashboard's "Recently Viewed" list and "Viewed Items"
  // count. There's no backend endpoint for this, so it's stored per-browser
  // (src/lib/recentlyViewed.ts). Re-runs on variant change so the saved card
  // shows the tier the customer actually landed on.
  useEffect(() => {
    recordView({
      packageId: data.id,
      title: data.title,
      variantLabel: selectedVariant?.label,
      image: data.gallery.find((image) => image.image)?.image,
      categoryLabel: data.categoryLabel,
      categorySlug: data.categorySlug,
      categoryIcon: data.categoryIcon,
      categoryGradientFrom: data.categoryGradientFrom,
      eventTags: data.eventTags,
      moreEventTagsCount: data.moreEventTagsCount,
      rating: data.rating,
      reviewCount: data.reviewCount,
      price: formatPrice(selectedVariant?.price ?? 0),
      locationSummary: data.locationSummary,
    });
  }, [data, selectedVariant]);

  const selectedAddons: SelectedAddon[] = useMemo(() => {
    const result: SelectedAddon[] = [];
    for (const line of addonLines) {
      if (line.quantity <= 0) continue;
      const addon = data.addons.find((a) => a.id === line.addonId);
      if (!addon) continue;
      result.push({
        ...addon,
        quantity: line.quantity,
        color: line.colourLabel,
        lineKey: `${line.addonId}::${line.colourLabel ?? ""}`,
      });
    }
    return result;
  }, [data.addons, addonLines]);

  const addonsTotal = useMemo(
    () => selectedAddons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0),
    [selectedAddons]
  );

  // Team & equipment is a real, separate flat charge on top of the package's
  // base price (step3_policiesAndCharges.teamAndEquipment) — included in the
  // subtotal. Overtime is a rate disclosure only (only charged if the event
  // actually runs over), so it's surfaced separately, not added here.
  const packageTotal = (selectedVariant?.price ?? 0) + data.pricing.teamAndEquipmentCharge + addonsTotal;

  // The "+" on an add-on card (AddonCard.tsx) always calls this, whether or
  // not that add-on already has a quantity — real bug fixed 2026-10-01: the
  // card used to hide its own "+" once any quantity existed, which made a
  // second colour of the same add-on unreachable. If a line with the exact
  // same addon+colour already exists, its quantity is incremented instead
  // of creating a duplicate; a genuinely different colour (or no colour
  // options at all, picked twice) becomes its own independent line.
  function addAddon(addonId: string, colourId?: string) {
    const addon = data.addons.find((a) => a.id === addonId);
    const colourLabel = colourId ? addon?.colourOptions?.find((c) => c.id === colourId)?.label : undefined;
    setAddonLines((prev) => {
      const existingIndex = prev.findIndex((line) => line.addonId === addonId && line.colourLabel === colourLabel);
      if (existingIndex === -1) return [...prev, { addonId, colourLabel, quantity: 1 }];
      return prev.map((line, i) => (i === existingIndex ? { ...line, quantity: line.quantity + 1 } : line));
    });
  }

  // lineKey-scoped (not addonId-scoped) — see SelectedAddon.lineKey's own
  // comment for why: an addonId alone can no longer identify a single line.
  function changeAddonLineQuantity(lineKey: string, delta: number) {
    setAddonLines((prev) =>
      prev
        .map((line) =>
          `${line.addonId}::${line.colourLabel ?? ""}` === lineKey
            ? { ...line, quantity: Math.max(0, line.quantity + delta) }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  }

  // Absolute set, for the quantity input field — delta-based changeAddonLineQuantity
  // can't express "type 12 directly". Same 0-floor as the +/- buttons.
  function setAddonLineQuantity(lineKey: string, qty: number) {
    setAddonLines((prev) =>
      prev
        .map((line) => (`${line.addonId}::${line.colourLabel ?? ""}` === lineKey ? { ...line, quantity: Math.max(0, qty) } : line))
        .filter((line) => line.quantity > 0)
    );
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
          {data.includedItems.length > 0 && (
            <IncludedItems items={data.includedItems} notIncluded={data.notIncluded} workshop={workshop} />
          )}
          <NotesForVendor
            value={vendorNote}
            onChange={setVendorNote}
            attachments={vendorNoteAttachments}
            onAttachmentsChange={setVendorNoteAttachments}
          />
          <VendorRequirements requirements={data.vendorRequirements} />
          {data.addons.length > 0 && (
            <AddonsCarousel
              addons={data.addons}
              lines={selectedAddons}
              onAdd={addAddon}
              onChangeLineQuantity={changeAddonLineQuantity}
              onSetLineQuantity={setAddonLineQuantity}
            />
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
          tokenType={data.pricing.tokenType}
          tokenValue={data.pricing.tokenValue}
          requiresGuestCount={data.requiresGuestCount}
          eventCategories={data.eventCategories}
          selectedAddons={selectedAddons}
          includedItems={data.includedItems}
          customizeRequests={workshop.requests}
          colourPreferences={workshop.colourPreferences}
          vendorNote={vendorNote}
          onVendorNoteChange={setVendorNote}
          vendorNoteAttachments={vendorNoteAttachments}
          onVendorNoteAttachmentsChange={setVendorNoteAttachments}
          editItemId={editCartItem?._id}
          prefillEventDetails={editCartItem?.eventDetails}
          cancellationPolicyText={data.policies.find((policy) => policy.id === "policy-cancellation")?.description}
        />
      </div>
    </main>
    </div>
  );
}
