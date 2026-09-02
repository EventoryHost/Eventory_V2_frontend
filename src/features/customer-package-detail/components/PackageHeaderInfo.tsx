"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, Share2, Star, Bookmark, BadgeCheck } from "lucide-react";
import type { PackageDetail } from "../types";
import AuthModal from "@/features/customer-auth/components/AuthModal";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { getWishlist, addWishlistItem, removeWishlistItem } from "@/lib/customerWishlistApi";
import ShareModal from "./ShareModal";

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
    | "title"
    | "instantBooking"
    | "vendorName"
    | "idVerified"
    | "gstinVerified"
    | "rating"
    | "reviewCount"
    | "locationSummary"
    | "vendor"
  >;
  onCreateQuotation: () => void;
}) {
  const { isLoggedIn } = useCustomerSession();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSaved = isLoggedIn && savedItemId !== null;

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    getWishlist()
      .then((res) => {
        if (!cancelled) setSavedItemId(res.items.find((item) => item.packageId === data.id)?._id ?? null);
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
          {data.eventTags.join(" • ")}
          {data.moreEventTagsCount > 0 && (
            <>
              {" "}and{" "}
              <button type="button" className="underline">
                {data.moreEventTagsCount} more events
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

      <div className="flex flex-wrap items-center justify-between gap-3 font-figtree text-[13px]">
        <div className="flex flex-wrap items-center gap-3">
          {data.reviewCount > 0 && (
            <>
              <div className="flex items-center gap-1 font-semibold text-brand-950">
                <Star className="h-4 w-4 fill-brand-primary text-brand-primary" />
                {data.rating}
                <span className="font-normal text-neutral-tertiary underline">
                  &nbsp;(from {data.reviewCount} reviews)
                </span>
              </div>
              <span className="h-1 w-1 rounded-full bg-neutral-tertiary/40" />
            </>
          )}
          <div className="flex items-center gap-1.5 text-neutral-secondary">
            <MapPin className="h-4 w-4" style={{ color: "#EA1D3B" }} />
            {data.locationSummary}... <span className="font-medium text-brand-950 underline">See the location</span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-medium text-neutral-secondary">
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-1.5 hover:text-brand-950"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`flex items-center gap-1.5 hover:text-brand-950 disabled:cursor-not-allowed disabled:opacity-60 ${
              isSaved ? "text-brand-950" : ""
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-brand-950" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <hr className="mt-6 border-black/5" />

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
