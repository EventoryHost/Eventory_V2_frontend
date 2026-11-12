"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Share2, BadgeCheck } from "lucide-react";
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
      {/* Desktop/tablet layout — Figma node 3233:25522: category pill + event
          tags, title, "By <vendor>" with verified tick, rating, then the
          "Localities served" label with its chips wrapped below. Share/Wishlist
          are pinned to the top-right of the page's header grid (the grid in
          PackageDetailPage is `relative`), level with the category pill and
          above the booking card. */}
      <div className="hidden flex-col gap-6 md:flex">
        <div className="absolute -top-[5px] right-0 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 font-figtree text-[16px] font-medium text-[#030303] transition hover:bg-black/5"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-figtree text-[16px] font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60 ${
              "text-[#030303]"
            }`}
          >
            <Image
              src={isSaved ? "/images/customer/package-detail/wishlist-bookmark-filled.svg" : "/images/customer/package-detail/wishlist-bookmark.svg"}
              alt=""
              width={16}
              height={16}
            />
            {isSaved ? "Wishlisted" : "Add to Wishlist"}
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 font-figtree">
            <div
              className="flex h-6 shrink-0 items-center gap-2 rounded-[52px] py-1 pr-3 pl-1"
              style={{
                background: `linear-gradient(to left, ${data.categoryGradientFrom ?? "#FFE5E9"}, #ffffff)`,
              }}
            >
              {data.categoryIcon && (
                <Image
                  src={data.categoryIcon}
                  alt={data.categoryLabel}
                  width={16}
                  height={16}
                  className="h-4 w-4 rounded-full object-contain"
                />
              )}
              <span className="text-[12px] leading-[18px] font-bold tracking-[-0.12px] whitespace-nowrap text-[#3C060D] uppercase">
                {data.categoryLabel}
              </span>
            </div>
            <span className="h-3 w-px shrink-0 bg-[#D4D4D8]" />
            <span className="text-[16px] leading-[18px] font-medium tracking-[-0.16px] text-[#3F3F47]">
              {(isEventTagsExpanded ? data.eventCategories : data.eventTags).map(dotSeparated).join(" • ")}
              {data.moreEventTagsCount > 0 && (
                <>
                  {!isEventTagsExpanded && " and "}{" "}
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

          <div className="flex flex-col gap-1">
            <h1 className="flex flex-wrap items-center gap-3 font-figtree text-[32px] leading-[50px] font-semibold tracking-[-0.6px] text-[#030303]">
              {data.title}
              {data.instantBooking && (
                <span className="flex items-center gap-1 rounded-full border border-[#FEE2E2] bg-[#FEF2F2] px-2 py-1 font-figtree text-[11px] leading-normal font-medium tracking-normal text-brand-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                  Instant booking
                </span>
              )}
            </h1>
            <p className="flex items-center gap-1.5 font-figtree text-[16px] leading-6 font-medium text-[#030303]">
              By {data.vendorName}
              {(data.idVerified || data.gstinVerified) && (
                <Image
                  src="/images/customer/package-detail/verified-check.svg"
                  alt="Verified vendor"
                  width={18}
                  height={18}
                />
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          {data.reviewCount > 0 ? (
            <div className="flex items-center gap-1.5 font-figtree text-[16px] leading-6 tracking-[-0.16px]">
              <Image src="/images/customer/package-detail/header-rating-star.svg" alt="" width={22} height={22} />
              <span className="font-semibold text-[#030303]">{data.rating}</span>
              <span className="text-[#71717B]">
                (<span className="underline decoration-dotted">from {data.reviewCount} reviews</span>)
              </span>
            </div>
          ) : (
            <span />
          )}

        </div>

        {data.locationList.length > 0 && (
          <div className="flex flex-col gap-2 font-figtree">
            <span className="text-[16px] leading-6 font-semibold text-[#030303]">Localities served</span>
            {/* "fit as many chips as the row allows, then +N more" — ONLY the
                vendor's serviceAreas field (PM instruction, 2026-10-12). */}
            <LocationChipRow locations={data.locationList} large maxRows={2} />
          </div>
        )}
      </div>

      {/* Mobile layout (Figma node 2565:27868) — same data, different
          arrangement: Share/Save sits next to the "by <vendor>" byline
          instead of next to the rating/chips, the Instant booking pill
          drops onto its own line above the rating instead of sitting next
          to the title, and there's no bottom border. Save uses a heart
          icon here (Figma's actual asset for this button), not the
          bookmark icon the desktop button uses. */}
      <div className="flex flex-col gap-1 font-figtree md:hidden">
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <div
            className="flex h-6 shrink-0 items-center gap-2 rounded-[52px] py-1 pr-3 pl-1"
            style={{
              background: `linear-gradient(to left, ${data.categoryGradientFrom ?? "#FFE5E9"}, #ffffff)`,
            }}
          >
            {data.categoryIcon && (
              <Image
                src={data.categoryIcon}
                alt={data.categoryLabel}
                width={16}
                height={16}
                className="h-4 w-4 rounded-full object-contain"
              />
            )}
            <span className="font-bold whitespace-nowrap text-[#3C060D] text-[11px] tracking-[-0.11px] uppercase">
              {data.categoryLabel}
            </span>
          </div>
          <span className="text-[12px] whitespace-nowrap text-[#71717B]">
            {(isEventTagsExpanded ? data.eventCategories : data.eventTags).map(dotSeparated).join(" • ")}
            {data.moreEventTagsCount > 0 && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => setIsEventTagsExpanded((expanded) => !expanded)}
                  className="ml-1 font-bold underline"
                >
                  {isEventTagsExpanded ? "Show less" : `+${data.moreEventTagsCount}`}
                </button>
              </>
            )}
          </span>
        </div>

        <h1 className="font-semibold text-[#222] text-[24px] leading-[34px]">{data.title}</h1>

        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 px-0.5 text-[14px] text-[#3F3F47]">
            by <span className="font-semibold text-brand-950">{data.vendorName}</span>
            {(data.idVerified || data.gstinVerified) && <span className="text-neutral-tertiary/50">·</span>}
            {data.idVerified && (
              <span className="flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 text-[11px] font-medium text-success-700">
                <BadgeCheck className="h-3.5 w-3.5" /> ID verified
              </span>
            )}
            {data.gstinVerified && (
              <span className="flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 text-[11px] font-medium text-success-700">
                <BadgeCheck className="h-3.5 w-3.5" /> GSTIN verified
              </span>
            )}
          </p>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium text-[#030303] transition hover:bg-black/5"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaving}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60 ${
                "text-[#030303]"
              }`}
            >
              <Image
              src={isSaved ? "/images/customer/package-detail/wishlist-bookmark-filled.svg" : "/images/customer/package-detail/wishlist-bookmark.svg"}
              alt=""
              width={16}
              height={16}
            />
              {isSaved ? "Wishlisted" : "Add to Wishlist"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {data.instantBooking && (
            <span className="w-fit rounded-full bg-[#FDEEF0] px-2.5 py-1 text-[12px] font-medium text-[#F0596F]">
              Instant booking
            </span>
          )}

          {data.reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <Image src="/images/customer/package-detail/rating-star.svg" alt="" width={15} height={15} />
              <span className="text-[14px] font-semibold text-[#222]">{data.rating}</span>
              <span className="text-[14px] text-[#71717B] underline">({data.reviewCount} reviews)</span>
            </div>
          )}

          {/* Figma node 2404:22954: "fit as many chips as the row allows,
              then +N more" — ONLY the vendor's serviceAreas field, nothing
              else composed in alongside it (PM instruction, 2026-10-12). */}
          <LocationChipRow locations={data.locationList} />
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
