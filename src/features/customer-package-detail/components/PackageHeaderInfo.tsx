"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Share2, Star, Bookmark, BadgeCheck } from "lucide-react";
import type { PackageDetail } from "../types";
import AuthModal from "@/features/customer-auth/components/AuthModal";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { getWishlist, addWishlistItem, removeWishlistItem } from "@/lib/customerWishlistApi";
import ShareModal from "./ShareModal";
import LocationChipRow from "./LocationChipRow";

// Vendors sometimes author a single event-category entry as one composite
// string with " / " as their own separator (e.g. "Ganesh Chaturthi / Ganesh
// Sthapana / Home Puja") rather than separate array items — display-only
// swap to match the " • " separator used between genuinely distinct tags,
// without touching the underlying value (still needed as-is for exact-match
// filtering elsewhere, e.g. StickyBookingCard's Event Type dropdown).
function dotSeparated(tag: string): string {
  return tag.replace(/\s*\/\s*/g, " • ");
}

export default function PackageHeaderInfo({
  data,
  onCreateQuotation,
}: {
  data: Pick<
    PackageDetail,
    | "id"
    | "categoryLabel"
    | "categoryIcon"
    | "categoryGradientFrom"
    | "eventTags"
    | "moreEventTagsCount"
    | "eventCategories"
    | "title"
    | "instantBooking"
    | "vendorName"
    | "idVerified"
    | "gstinVerified"
    | "rating"
    | "reviewCount"
    | "locationSummary"
    | "fullLocationSummary"
    | "locationList"
    | "vendor"
  >;
  onCreateQuotation: () => void;
}) {
  const { isLoggedIn } = useCustomerSession();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEventTagsExpanded, setIsEventTagsExpanded] = useState(false);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSaved = isLoggedIn && savedItemId !== null;

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    getWishlist()
      .then((res) => {
        // packageId comes back POPULATED from GET /customer/wishlist, so this
        // has to compare its _id — comparing the object to a string id was
        // always false, leaving the Save button permanently "not saved".
        if (!cancelled)
          setSavedItemId(res.items.find((item) => item.packageId?._id === data.id)?._id ?? null);
      })
      .catch(() => {
        // Best-effort — the Save button just falls back to its "not saved" state.
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, data.id]);

  async function handleSaveClick() {
    if (!isLoggedIn) {
      setIsAuthOpen(true);
      return;
    }
    setIsSaving(true);
    try {
      if (savedItemId) {
        await removeWishlistItem(savedItemId);
        setSavedItemId(null);
      } else {
        const res = await addWishlistItem({ itemType: "Package", packageId: data.id });
        setSavedItemId(res.item._id);
      }
    } catch {
      // Best-effort — leave the saved state unchanged on failure.
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-3 font-figtree text-[13px]">
        <div
          className="flex shrink-0 items-center gap-2 rounded-[52px] py-1 pr-3 pl-1"
          style={{
            background: `linear-gradient(to left, ${data.categoryGradientFrom ?? "#FFE5E9"}, #ffffff)`,
          }}
        >
          {data.categoryIcon && (
            <Image
              src={data.categoryIcon}
              alt={data.categoryLabel}
              width={20}
              height={20}
              className="h-5 w-5 rounded-full object-contain"
            />
          )}
          <span className="font-figtree text-[12px] font-semibold whitespace-nowrap text-brand-950">
            {data.categoryLabel}
          </span>
        </div>
        <span className="h-4 w-px shrink-0 bg-black/10" />
        <span className="font-figtree text-[13px] font-medium text-[#B4112A]">
          {(isEventTagsExpanded ? data.eventCategories : data.eventTags).map(dotSeparated).join(" • ")}
          {data.moreEventTagsCount > 0 && (
            <>
              {!isEventTagsExpanded && (
                <>
                  {" "}and{" "}
                </>
              )}
              {" "}
              <button
                type="button"
                onClick={() => setIsEventTagsExpanded((expanded) => !expanded)}
                className="underline"
              >
                {isEventTagsExpanded ? "Show less" : `${data.moreEventTagsCount} more events`}
              </button>
            </>
          )}
        </span>
      </div>

      <h1 className="mb-2 flex flex-wrap items-center gap-3 font-figtree text-[26px] leading-tight font-bold text-brand-950 sm:text-[28px]">
        {data.title}
        {data.instantBooking && (
          <span className="flex items-center gap-1 rounded-full border border-[#FEE2E2] bg-[#FEF2F2] px-2 py-1 font-figtree text-[11px] font-medium text-brand-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
            Instant booking
          </span>
        )}
      </h1>
      <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-figtree text-[14px] text-neutral-secondary">
        by <span className="font-semibold text-brand-950">{data.vendorName}</span>
        {(data.idVerified || data.gstinVerified) && <span className="text-neutral-tertiary/50">·</span>}
        {data.idVerified && (
          <span className="flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 font-figtree text-[11px] font-medium text-success-700">
            <BadgeCheck className="h-3.5 w-3.5" /> ID verified
          </span>
        )}
        {data.gstinVerified && (
          <span className="flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 font-figtree text-[11px] font-medium text-success-700">
            <BadgeCheck className="h-3.5 w-3.5" /> GSTIN verified
          </span>
        )}
      </p>

      {/* Figma node 2404:22945 — review + service-area chips stacked on the
          left as one column, Share/Save buttons on the right, the whole
          block sitting on its own bottom border (replacing the separate
          <hr> this used to end on). */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E4E4E7] pt-1 pb-3 font-figtree text-[13px]">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {data.reviewCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EA1D3B]">
                <Star className="h-2.5 w-2.5 fill-white text-white" />
              </span>
              <span className="font-figtree text-[16px] font-semibold text-[#030303]">{data.rating}</span>
              <span className="font-figtree text-[16px] text-neutral-secondary underline">
                (from {data.reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Figma node 2404:22954: "fit as many chips as the row allows,
              then +N more" — ONLY the vendor's serviceAreas field, nothing
              else composed in alongside it (PM instruction, 2026-10-12). */}
          <LocationChipRow locations={data.locationList} />
        </div>

        <div className="flex shrink-0 items-start gap-2">
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 font-figtree text-[14px] font-medium text-[#030303] transition hover:bg-black/5"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-figtree text-[14px] font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60 ${
              isSaved ? "text-brand-950" : "text-[#030303]"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-brand-950" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={() => {
          setIsAuthOpen(false);
          void handleSaveClick();
        }}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        target={{
          title: data.title,
          vendorName: data.vendorName,
          rating: data.rating,
          locationSummary: data.locationSummary,
          eventsCount: data.vendor.eventsCount,
        }}
        onCreateQuotation={onCreateQuotation}
      />
    </section>
  );
}
